import * as socketio from "socket.io";
import SocketService from "../../services/SocketService";

function handleConnection(socket: socketio.Socket) {
  SocketService.addSocket(socket);
}

export default handleConnection;
