import * as socketio from "socket.io";
import SocketStore from "../stores/SocketStore";
import handleConnection from "../handlers/ioHandlers/handleConnection";

class SocketService {
    static init(io: socketio.Server){
        io.on("connection", handleConnection);
        SocketStore.io = io;
    }

    static addSocket(socket: socketio.Socket){
        SocketStore.sockets.push(socket);
    }

    static removeSocket(socket: socketio.Socket){
        SocketStore.sockets.splice(SocketStore.sockets.indexOf(socket), 1);
    }
}
export default SocketService;
