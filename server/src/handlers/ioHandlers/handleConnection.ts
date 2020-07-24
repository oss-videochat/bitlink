import * as socketio from "socket.io";
import SocketService from "../../services/SocketService";
import handleGetRTPCapabilities from "../socketHandlers/handleGetRTPCapabilities";
import handleJoinRoom from "../socketHandlers/handleJoinRoom";
import handleCreateRoom from "../socketHandlers/handleCreateRoom";
import handleDisconnectSocket from "../socketHandlers/handleDisconnectSocket";
import {APIResponseCallback, handleSocketEvent} from "../../interfaces/handleEvent";

function handleConnection(socket: socketio.Socket) {
    function sw(func: handleSocketEvent<any>){
        return (data: any, cb: APIResponseCallback) => func({socket, ...data}, cb);
    }

    socket.on("get-rtp-capabilities", sw(handleGetRTPCapabilities));
    socket.on("create-room", sw(handleCreateRoom));
    socket.on("join-room", sw(handleJoinRoom));
    socket.on("disconnect", sw(handleDisconnectSocket));
    SocketService.addSocket(socket);
}

export default handleConnection;
