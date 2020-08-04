import {Room} from "../interfaces/Room";
import RoomStore from "../stores/RoomStore";
import {
    HostDisconnectAction,
    MediaAction,
    MediaSource,
    MessageType,
    ParticipantRole,
    RoomSettings,
    RoomSummary
} from "@bitlink/common";
import {Participant} from "../interfaces/Participant";
import debug from "../helpers/debug";
import ParticipantService from "./ParticipantService";
import MessageService from "./MessageService";
import * as mediasoup from 'mediasoup';
import * as crypto from "crypto";
import MediasoupPeerService from "./MediasoupPeerService";
import {APIResponseCallback, handleParticipantEvent} from "../interfaces/handleEvent";
import {handleUpdateRoomSettings} from "../validation/handleUpdateRoomSettings";
import {DirectMessage, GroupMessage, Message, SystemMessage} from "../interfaces/Message";
import * as Handlers from "../handlers/participantHandlers";
import * as Validation from "../validation";
import MessageGroupService from "./MessageGroupService";
import cryptoRandomString = require("crypto-random-string");
import * as Ajv from "ajv";

const log = debug("Services:RoomService");

class RoomService {
    static create(router: mediasoup.types.Router, settings: RoomSettings): Room {
        const id = cryptoRandomString({length: 9, type: 'numeric'});
        return {
            created: new Date(),
            id,
            idHash: crypto.createHash('md5').update(id).digest("hex"),
            latestMessage: {},
            messageGroups: [MessageGroupService.create(settings.name)],
            messages: [],
            participants: [],
            router: router,
            settings: settings,
            waitingRoom: []
        }
    }

    static getMessage(room: Room, messageId: string) {
        return room.messages.find(message => message.id === messageId);
    }

    static getGroup(room: Room, groupId: string) {
        return room.messageGroups.find(group => group.id === groupId);
    }

    static getParticipant(room: Room, participantId: string) {
        return room.participants.find(participant => participant.id === participantId);
    }

    static addRoom(room: Room) {
        log("Adding new room with name %s" + room.settings.name);
        RoomStore.rooms[room.id] = room;
    }

    static destroy(room: Room) {
        log("Room destroyed %s" + room.settings.name);
        room.participants.forEach(ParticipantService.leave);
        room.router.close();
        RoomService.broadcast(room, "destroy");
        delete RoomStore.rooms[room.id]
    }

    static getRTPCapabilities(roomId: string) {
        return RoomStore.rooms[roomId]?.router.rtpCapabilities;
    }

    static getHosts(room: Room) {
        return room.participants.filter(participant => participant.role === ParticipantRole.HOST)
    }

    static getConnectedParticipants(room: Room) {
        return room.participants.filter(participant => participant.isConnected)
    }

    static addParticipant(room: Room, participant: Participant) {
        log("Participant adding %s", participant.name);

        if (room.settings.waitingRoom && participant.role !== ParticipantRole.HOST) {
            room.waitingRoom.push(participant);
            RoomService.broadcastHosts(room, "new-waiting-room-participant", {
                participant: ParticipantService.getSummary(participant)
            });
            return {
                success: false,
                error: "In waiting room",
                status: 403,
                data: {
                    name: room.settings.name
                }
            };
        }

        RoomService._addParticipant(room, participant);

        return {
            success: true, error: null, status: 200, data: {
                summary: RoomService.getSummary(room, participant),
                rtcCapabilities: room.router.rtpCapabilities
            }
        };
    }

    static broadcastHosts(room: Room, events: string, ...args: any[]) {
        const nonHosts: Participant[] = RoomService.getConnectedParticipants(room).filter((participant: Participant) => participant.role !== ParticipantRole.HOST);
        RoomService.broadcast(room, events, nonHosts, ...args); // broadcast ignoring non hosts
    }

    static broadcast(room: Room, event: string, ignoreParticipants: Participant[] = [], ...args: any[]) {
        RoomService.getConnectedParticipants(room).forEach(participant => {
            if (ignoreParticipants.includes(participant)) {
                return;
            }
            participant.socket.emit(event, ...args);
        });
    }

    static getSummary(room: Room, currentParticipant: Participant): RoomSummary {
        return {
            id: room.id,
            idHash: room.idHash,
            name: room.settings.name,
            participants: room.participants.map(participantInRoom => ParticipantService.getSummary(participantInRoom)),
            myId: currentParticipant.id,
            messages: room.messages
                .filter(message => MessageService.hasPermissionToView(message, currentParticipant))
                .map(message => MessageService.getSummary(message))
        }
    }

    static closeRoomIfNecessary(room: Room) {
        if (room.participants.filter(participant => participant.isConnected && participant.role === ParticipantRole.HOST).length === 0) {
            if(room.settings.hostDisconnectAction === HostDisconnectAction.TRANSFER_HOST && room.participants.filter(participant => participant.isConnected).length > 0){
                RoomService.changeRole(room, room.participants.filter(participant => participant.isConnected)[0], ParticipantRole.HOST);
                return;
            }
            RoomService.destroy(room);
        }
    }

    static participantLeft(room: Room, participant: Participant) {
        ParticipantService.leave(participant);
        MediasoupPeerService.destroy(participant.mediasoupPeer);
        RoomService.broadcast(room, "participant-left", [], {participantId: participant.id});
        RoomService.sendSystemMessage(room, `${participant.name} left the room`);
        RoomService.closeRoomIfNecessary(room);
    }

    static participantDisconnected(room: Room, participant: Participant) {
        ParticipantService.disconnect(participant);
        MediasoupPeerService.destroy(participant.mediasoupPeer);
        RoomService.broadcast(room, "participant-left", [], {participantId: participant.id});
        RoomService.sendSystemMessage(room, `${participant.name} left the room`);
        RoomService.closeRoomIfNecessary(room);
    }

    static participantChangedName(room: Room, participant: Participant, newName: string) {
        const oldName = participant.name;
        log("Participant changing name %s --> %s", participant.name, newName);
        ParticipantService.changeName(participant, newName);
        RoomService.broadcast(room, "participant-changed-name",[], {
            participantId: participant.id,
            newName: participant.name
        });
        RoomService.sendSystemMessage(room, `${oldName} changed their name to ${newName}`);
        return {
            success: true,
            status: 200,
            error: null,
        };
    }

    static mediaStateUpdate(room: Room, participant: Participant, source: MediaSource, action: MediaAction) {
        RoomService.broadcast(room, "participant-updated-media-state", [participant],
            {
                update: {
                    id: participant.id,
                    source,
                    action
                }
            }
        );
    }

    static waitingRoomDecision(room: Room, participant: Participant, id: string, decision: "accept" | "reject") {
        log("Receiving waiting room decision %s", decision);
        if (participant.role !== ParticipantRole.HOST) {
            return {
                success: false,
                error: "You aren't important enough. You aren't a host.",
                status: 403
            };
        }
        const waitingRoomIndex = room.waitingRoom.findIndex(patientParticipant => patientParticipant.id === id);
        if (waitingRoomIndex < 0) {
            return {
                success: false,
                error: "Could not find participant in the waiting room with that id.",
                status: 404
            }
        }
        const patientParticipant = room.waitingRoom[waitingRoomIndex];
        room.waitingRoom.splice(waitingRoomIndex, 1);

        switch (decision) {
            case "accept":
                RoomService._addParticipant(room, patientParticipant);
                patientParticipant.socket.emit("waiting-room-accept", {
                    summary: RoomService.getSummary(room, patientParticipant),
                    rtcCapabilities: room.router.rtpCapabilities
                });
                return {
                    success: true,
                    error: null,
                    status: 200
                };
            case "reject":
                patientParticipant.socket.emit("waiting-room-rejection", {reason: "The host rejected you."});
                RoomService.participantLeft(room, patientParticipant);
                return {
                    success: true,
                    error: null,
                    status: 200
                };
            default:
                return {
                    success: false,
                    error: "Bad decision. Please decide better.",
                    status: 400
                };
        }
    }

    static updateRoomSettings(room: Room, newSettings: RoomSettings) {
        log("Participant changing room settings %O", newSettings);
        const safeVersion = RoomService._getSafeSettings(newSettings);
        if (JSON.stringify(RoomService._getSafeSettings(room.settings)) !== JSON.stringify(safeVersion)) {
            this.broadcast(room, "updated-room-settings", RoomService.getConnectedParticipants(room).filter(participant => participant.role === ParticipantRole.HOST), {newSettings: safeVersion});
        }
        room.settings = newSettings;
        if (room.settings.name !== room.messageGroups[0].name) {
            MessageGroupService.changeName(room.messageGroups[0], room.settings.name);
        }
        RoomService.broadcast(room, "updated-room-settings-host", RoomService.getConnectedParticipants(room).filter(participant => participant.role !== ParticipantRole.HOST), {newSettings});
    }

    static kickParticipant(room: Room, participantToRemove: Participant) {
        log("Participant kicked", participantToRemove.name);
        RoomService.participantLeft(room, participantToRemove);
        participantToRemove.socket.emit("kicked");
        RoomService.sendSystemMessage(room, `${participantToRemove.name} was kicked from the room`);
    }

    static sendSystemMessage(room: Room, content: string, permission: ParticipantRole = ParticipantRole.MEMBER){
        RoomService.sendMessage(room, MessageService.create({
            content: content,
            type: MessageType.SYSTEM
        }, undefined, {permission}));
    }

    static alertRelevantParticipantsAboutMessage(room: Room, message: Message, eventType: "new" | "edit" | "delete") {
        const summary = MessageService.getSummary(message);
        switch (message.type) {
            case MessageType.SYSTEM: {
                RoomService.broadcast(room, `${eventType}-message`, RoomService.getConnectedParticipants(room).filter(participant => participant.role > (message as SystemMessage).permission), {messageSummary: summary})
                break;
            }
            case MessageType.GROUP: {
                (message as GroupMessage).group.members.filter(participant => participant.isConnected).forEach(participant => {
                    participant.socket.emit(`${eventType}-message`, {messageSummary: summary})
                });
                break;
            }
            case MessageType.DIRECT: {
                const directMessage = message as DirectMessage;
                [directMessage.from.socket, directMessage.to.socket].forEach(socket => {
                    socket.emit(`${eventType}-message`, {messageSummary: summary})
                });
                break;
            }
            default: {
                throw "Unknown type"
            }
        }
    }

    static sendMessage(room: Room, message: Message) {
        room.messages.push(message);
        const summary = MessageService.getSummary(message);
        log("Participant sending message: %s", summary);
        RoomService.alertRelevantParticipantsAboutMessage(room, message, "new")
    }

    static editMessage(room: Room, message: Message, newContent: string) {
        message.content = newContent
        RoomService.alertRelevantParticipantsAboutMessage(room, message, "edit")
    }

    static deleteMessage(room: Room, message: Message) {
        log("Participant deleting message: %s", message.id);
        const index = RoomService._getMessageIndex(room, message.id);
        if (index) {
            room.messages.splice(index, 1);
        }
        RoomService.alertRelevantParticipantsAboutMessage(room, message, "delete")
    }

    static transferHost(room: Room, from: Participant, to: Participant) {
        log("Transfer host: %s --> %s<%s>", from.name, to.name, to.role);
        from.role = ParticipantRole.MEMBER;
        to.role = ParticipantRole.HOST;
        this.broadcast(room, 'participant-update-role', [], {participantId: to.id, newRole: ParticipantRole.HOST});
        this.broadcast(room, 'participant-update-role', [], {participantId: from.id, newRole: ParticipantRole.MEMBER});
        RoomService.sendSystemMessage(room, `Host transferred from ${from.name} to ${to.name}`);
    }

    static changeRole(room: Room, participant: Participant, role: ParticipantRole) {
        participant.role = role;
        this.broadcast(room, 'participant-update-role', [], {participantId: participant.id, newRole: role});
        RoomService.sendSystemMessage(room, `${participant.name}'s role is now ${role === ParticipantRole.HOST ? "host": "member"}`);
    }

    private static _addParticipant(room: Room, participant: Participant) {
        room.participants.push(participant);

        function pw(func: handleParticipantEvent<any>, validation?: ((data: any) => boolean) | object): handleParticipantEvent {
            return (data: any, cb: any) => {
                    if (validation) {
                        if (typeof validation === "object") {
                            const ajv = new Ajv();
                            validation = ajv.compile({
                                additionalProperties: false,
                                type: "object",
                                properties: {
                                    ...validation as object
                                }
                            });
                        }
                        if (!(validation as Function)(data)) {
                            cb({
                                success: false,
                                error: "Bad input",
                                status: 400,
                            })
                            console.log(data);
                            return;
                        }
                    }
                func({...data, participant, room}, cb || (() => log("No CB Passed")))
            }
        }

        participant.socket.on("disconnect", pw(Handlers.handleDisconnectParticipant));
        participant.socket.on("leave", pw(Handlers.handleLeaveParticipant));
        //      participant.socket.on("update-name", pw(Handlers.handleUpdateName));
        participant.socket.on("producer-action", pw(Handlers.handleProducerAction, Validation.handleProducerAction));
        participant.socket.on("get-room-settings", pw(Handlers.handleGetRoomSettings));
        participant.socket.on("update-room-settings", pw(Handlers.handleUpdateRoomSettings, Validation.handleUpdateRoomSettings));
        participant.socket.on("kick-participant", pw(Handlers.handleKickParticipant, {participantId: {type: "string"}}));
        participant.socket.on("send-message", pw(Handlers.handleSendMessage));
        participant.socket.on("edit-message", pw(Handlers.handleEditMessage,  {messageId: {type: "string"}, newContent: {type: "string"}}));
        participant.socket.on("delete-message", pw(Handlers.handleDeleteMessage, {messageId: {type: "string"}}));
        participant.socket.on("transfer-host", pw(Handlers.handleTransferHost, {participantId: {type: "string"}}));
        participant.socket.on("change-name", pw(Handlers.handleUpdateName, {newName: {type: "string"}}));
        participant.socket.on("create-transport", pw(Handlers.handleCreateTransport));
        participant.socket.on("connect-transport", pw(Handlers.handleConnectTransport));
        participant.socket.on("create-producer", pw(Handlers.handleCreateProducer));
        participant.socket.on("waiting-room-decision", pw(Handlers.handleWaitingRoomDecision));
        participant.socket.on("end-room", pw(Handlers.handleEndRoom));
        participant.socket.once("transports-ready", pw(Handlers.handleTransportsReady));

        RoomService.broadcast(room, "new-participant", [participant], {participantSummary: ParticipantService.getSummary(participant)});
        RoomService.sendSystemMessage(room, `${participant.name} joined`);
        MessageGroupService.addParticipant(room.messageGroups[0], participant);
    }

    private static _getSafeSettings(settings: RoomSettings) {
        return {
            name: settings.name
        }
    }

    private static _getMessageIndex(room: Room, messageId: string) {
        return room.messages.findIndex(message => message.id === messageId);
    }
}

export default RoomService;
