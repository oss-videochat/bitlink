import {handleParticipantEvent} from "../../interfaces/handleEvent";
import RoomService from "../../services/RoomService";
import ParticipantService from "../../services/ParticipantService";
import {ParticipantRole} from "@bitlink/common";
import debug from "../../helpers/debug";

const log = debug("handlers:GetRoomSettings");

export const handleGetRoomSettings: handleParticipantEvent = async ({participant, room}, cb) => {
    log("Participant requesting room settings %s", participant.name);
    if(participant.role !== ParticipantRole.HOST){
       cb({
           success: false,
           status: 403,
           error: "You are not a host"
       });
       return;
   }
   cb({
        success: true,
        status: 200,
        error: null,
        data: {
            settings: room.settings
        }
   });
}

