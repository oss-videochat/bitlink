import SocketIO = require("socket.io");
import * as socketio from "socket.io";

class SocketStore {
  sockets: SocketIO.Socket[] = [];
  io?: socketio.Server;
}

export default new SocketStore();
