import {handleParticipantEvent, handleSocketEvent} from "../../interfaces/handleEvent";
import RoomService from "../../services/RoomService";
import Participant from "../../models/Participant";
import debug from "../../helpers/debug";
import ParticipantService from "../../services/ParticipantService";
import MediasoupPeerService from "../../services/MediasoupPeerService";
import {types} from "mediasoup";
import Room from "../../models/Room";
import RoomStore from "../../stores/RoomStore";
import {ParticipantRole} from "@bitlink/common";
import handleDisconnectParticipant from "../participantHandlers/handleDisconnectParticipant";
const log = debug("handle:JoinRoom");

interface handleJoinRoomParams {
    roomId: string,
    name: string,
    rtpCapabilities: types.RtpCapabilities
}

const handleJoinRoom: handleSocketEvent<handleJoinRoomParams> = ({roomId, name, rtpCapabilities, socket}, cb) => {
    log("New participant joining room %s with name ", roomId, name);
    const room = RoomStore.rooms[roomId];
    if (!room) {
        return  cb({success: false, error: "The room doesn't exist", status: 404});
    }

    const role: ParticipantRole = RoomService.getHosts(room).length > 0 ? ParticipantRole.MEMBER : ParticipantRole.HOST;
    const mediasoupPeer = MediasoupPeerService.create(socket, rtpCapabilities);
    const participant = ParticipantService.create(name, socket,role, mediasoupPeer);

    cb(RoomService.addParticipant(room, participant));

    function pw(func: handleParticipantEvent): handleParticipantEvent{
        return (data: any, cb: any) => func({...data, participant, room}, cb)
    }

    participant.socket.on("disconnect", pw(handleDisconnectParticipant));
    participant.socket.on("update-name", pw(handleDisconnectParticipant));

   /* participant.on("leave", () =>{ // TODO is this necessary? i'm not sure
        log("Participant left %s", participant.name);
        socket.removeAllListeners();
        this.removeSocket(socket);
        this.addSocket(socket);
    });*/
}
export default handleJoinRoom;
