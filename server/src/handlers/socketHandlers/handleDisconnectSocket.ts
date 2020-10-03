import { handleSocketEvent } from "../../interfaces/handleEvent";
import SocketService from "../../services/SocketService";

const handleDisconnectSocket: handleSocketEvent = ({ socket }) => {
    SocketService.removeSocket(socket);
};
export default handleDisconnectSocket;
