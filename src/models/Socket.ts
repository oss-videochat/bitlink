import * as Events from 'events';

interface Event {
    event: string,
    listener: (...args: any[]) => void
}

class Socket extends Events.EventEmitter {
    private _socket;
    private sockets: Array<Object> = [];
    private events: Array<Event> = [];
    private allSockets = new Events.EventEmitter();

    get socket() {
        return this._socket;
    }

    set socket(value) {
        this._socket = value;
        this._socket.on("connection", (socket) => this.addSocket(socket));
        this._socket.on("disconnect", (reason) => this.sockets.splice(this.sockets.indexOf(socket)));
    }

    constructor() {
        super();
        this.allSockets.on("newListener", (event, listener) => this.addListenerToSockets(event, listener));
        this.allSockets.on("removeListener", (event) => this.removeListenerFromSockets(event));
    }

    addSocket(socket) {
        this.sockets.push(socket);
        this.events.forEach(event => {
            socket.on(event.event, event.listener);
        });
    }

    addListenerToSockets(event: string, listener: (...args: any[]) => void) {
        this.socket.forEach(socket => {
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

const socket = new Socket();

export default socket;
