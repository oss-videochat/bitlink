class Socket {
    private _socket;

    get socket() {
        return this._socket;
    }

    set socket(value) {
        this._socket = value;
    }
}

const socket = new Socket();

export default socket;
