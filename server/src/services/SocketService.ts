import * as socketio from "socket.io";
import SocketStore from "../stores/SocketStore";
import handleConnection from "../handlers/ioHandlers/handleConnection";
import { APIResponseCallback, handleSocketEvent } from "../interfaces/handleEvent";
import handleGetRTPCapabilities from "../handlers/socketHandlers/handleGetRTPCapabilities";
import handleCreateRoom from "../handlers/socketHandlers/handleCreateRoom";
import handleJoinRoom from "../handlers/socketHandlers/handleJoinRoom";
import handleDisconnectSocket from "../handlers/socketHandlers/handleDisconnectSocket";
import * as Ajv from "ajv";

class SocketService {
    static init(io: socketio.Server) {
        io.on("connection", handleConnection);
        SocketStore.io = io;
    }

    static addSocket(socket: socketio.Socket) {
        function sw(func: handleSocketEvent<any>, validation?: ((data: any) => boolean) | object) {
            return (data: any, cb: APIResponseCallback) => {
                if (validation) {
                    if (typeof validation === "object") {
                        const ajv = new Ajv();
                        validation = ajv.compile({
                            additionalProperties: false,
                            type: "object",
                            properties: {
                                ...(validation as object),
                            },
                        });
                    }
                    if (!(validation as Function)(data)) {
                        cb({
                            success: false,
                            error: "Bad input",
                            status: 400,
                        });
                        return;
                    }
                }
                func({ socket, ...data }, cb);
            };
        }

        socket.on(
            "get-rtp-capabilities",
            sw(handleGetRTPCapabilities, { roomId: { type: "string" } })
        );
        socket.on("create-room", sw(handleCreateRoom, { name: { type: "string" } }));
        socket.on(
            "join-room",
            sw(handleJoinRoom, {
                name: { type: "string" },
                roomId: { type: "string" },
                rtpCapabilities: { type: "object", additionalProperties: true },
            })
        );
        socket.on("disconnect", sw(handleDisconnectSocket));
        SocketStore.sockets.push(socket);
    }

    static removeSocket(socket: socketio.Socket) {
        SocketStore.sockets.splice(SocketStore.sockets.indexOf(socket), 1);
    }
}

export default SocketService;
