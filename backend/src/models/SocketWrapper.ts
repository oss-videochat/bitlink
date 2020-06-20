import * as Events from 'events';
import * as socket from 'socket.io'

interface Event {
    event: string,
    listener: (...args: any[]) => void
}

export class SocketWrapper extends Events.EventEmitter {
    private _socket;
    private sockets: Array<socket> = [];
    private events: Array<Event> = [];
    public allSockets = new Events.EventEmitter();

    get socket() {
        return this._socket;
    }

    set socket(value) {
        this._socket = value;
        this._socket.on("connection", (socket) => this.addSocket(socket));
        this._socket.on("disconnect", (reason) => this.removeSocket(socket));
    }

    constructor() {
        super();
        this.allSockets.on("removeListener", (event) => this.removeListenerFromSockets(event));
        this.allSockets.on("newListener", (event, listener) => this.addListenerToSockets(event, listener));
    }

    addSocket(socket) {
        this.sockets.push(socket);
        this.events.forEach(event => {
            socket.on(event.event, function() {
                event.listener(socket, ...arguments)
            });
        });
    }

    removeSocket(socket){
        this.sockets.splice(this.sockets.indexOf(socket));
    }

    addListenerToSockets(event: string, listener: (...args: any[]) => void) {
        this.sockets.forEach(socket => {
            socket.on(event, function () {
                listener(socket, ...arguments);
            });
        });
        this.events.push({event, listener});
    }

    removeListenerFromSockets(event: string) {
        this.socket.forEach(socket => {
            socket.removeListener(event);
        });
        this.events.splice(this.events.findIndex(event1 => event1.event === event), 1);
    }
}

const socketWrapper = new SocketWrapper();

export default socketWrapper;
