import {handleSocketEvent} from "../../interfaces/handleEvent";
import RoomService from "../../services/RoomService";

interface handleGetRTPCapabilitiesParams {
    roomId: string
}

const handleGetRTPCapabilities: handleSocketEvent<handleGetRTPCapabilitiesParams> = ({roomId}, cb) => {
    const rtpCapabilities = RoomService.getRTPCapabilities(roomId);
    if (!rtpCapabilities) {
        return cb({success: false, error: "The room doesn't exist", status: 404});
    }
    return cb({success: true, error: null, data: rtpCapabilities, status: 200});
}
export default handleGetRTPCapabilities;
