import {Room, RoomSettings} from "../interfaces/Room";
import RoomStore from "../stores/RoomStore";
import {ParticipantRole, RoomSummary} from "@bitlink/common";
import {Participant} from "../interfaces/Participant";
import debug from "../helpers/debug";
import ParticipantService from "./ParticipantService";
import MessageService from "./MessageService";
import * as mediasoup from 'mediasoup';
import {v4 as uuidv4} from "uuid";
import * as crypto from "crypto";

const log = debug("Services:RoomService");

class RoomService {
    static create(router: mediasoup.types.Router, settings: RoomSettings): Room {
        const id = uuidv4();
        return {
            created: new Date(),
            id,
            idHash: crypto.createHash('md5').update(id).digest("hex"),
            latestMessage: {},
            messageGroups: [],
            messages: [],
            participants: [],
            router: router,
            settings: settings,
            waitingRoom: []
        }
    }

    static addRoom(room: Room){
        log("Adding new room with name %s" + room.settings.name);
        RoomStore.rooms[room.id] = room;
    }

    static destroy(room: Room){
        log("Room destroyed %s" + room.settings.name);
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
            return {
                success: false,
                error: "In waiting room",
                status: 403,
                data: {
                    name: room.settings.name
                }
            };
        }
        RoomService.broadcastHosts(room, "new-waiting-room-participant", {
            participant: ParticipantService.getSummary(participant)
        })

        room.participants.push(participant);

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

    static participantLeft(room: Room, participant: Participant) {
        RoomService.broadcast(room, "participant-left", [], participant.id);
    }

    static participantChangedName(room: Room, participant: Participant, newName: string) {
        log("Participant changing name %s --> %s", participant.name, newName);
        ParticipantService.changeName(participant, name);
        RoomService.broadcast(room,"participant-changed-name", [participant], participant.id, participant.name);
        return {
            success: true,
            status: 200,
            error: null,
        };
    }
}

export default RoomService;
