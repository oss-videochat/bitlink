import * as socketio from "socket.io";
import SocketStore from "../stores/SocketStore";
import handleConnection from "../handlers/ioHandlers/handleConnection";
import {APIResponseCallback, handleSocketEvent} from "../interfaces/handleEvent";
import handleGetRTPCapabilities from "../handlers/socketHandlers/handleGetRTPCapabilities";
import handleCreateRoom from "../handlers/socketHandlers/handleCreateRoom";
import handleJoinRoom from "../handlers/socketHandlers/handleJoinRoom";
import handleDisconnectSocket from "../handlers/socketHandlers/handleDisconnectSocket";

class SocketService {
    static init(io: socketio.Server) {
        io.on("connection", handleConnection);
        SocketStore.io = io;
    }

    static addSocket(socket: socketio.Socket) {
        function sw(func: handleSocketEvent<any>) {
            return (data: any, cb: APIResponseCallback) => func({socket, ...data}, cb);
        }

        socket.on("get-rtp-capabilities", sw(handleGetRTPCapabilities));
        socket.on("create-room", sw(handleCreateRoom));
        socket.on("join-room", sw(handleJoinRoom));
        socket.on("disconnect", sw(handleDisconnectSocket));
        SocketStore.sockets.push(socket);
    }

    static removeSocket(socket: socketio.Socket) {
        SocketStore.sockets.splice(SocketStore.sockets.indexOf(socket), 1);
    }
}

export default SocketService;
