import * as socketio from "socket.io";
import SocketService from "../../services/SocketService";
import handleGetRTPCapabilities from "../socketHandlers/handleGetRTPCapabilities";
import handleJoinRoom from "../socketHandlers/handleJoinRoom";
import handleCreateRoom from "../socketHandlers/handleCreateRoom";
import handleDisconnectSocket from "../socketHandlers/handleDisconnectSocket";

function handleConnection(socket: socketio.Socket) {
    socket.on("get-rtp-capabilities", handleGetRTPCapabilities);
    socket.on("create-room", handleCreateRoom);
    socket.on("join-room",  handleJoinRoom);
    socket.on("disconnect", handleDisconnectSocket);
    SocketService.addSocket(socket);
}
export default handleConnection;
