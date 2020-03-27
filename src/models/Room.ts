import * as Event from 'events'
import Participant from "./Participant";

class Room extends Event.EventEmitter {

    public id;
    private participants = [];
    private configuration;
    public readonly created;

    constructor() {
        super();
        this.created = new Date();
    }

    addParticipant(participant: Participant) {
        participant.on("leave", () => {
            this.leaveParticipant(participant);
            if (this.participants.length === 0 || participant.isHost) {
                this.destroy();
            }
        });
        participant.on("update-settings", () => {
            this.broadcast("participant-updated-settings", [participant],
                {
                    id: participant.id,
                    settings: participant.settings
                }
            );
        });

        if (this.participants.length === 0) {
            this.addHostListeners(participant);
        }

        participant.socket.emit("room-summary", {
            // TODO
        });

        this.participants.push(participant);

        this.emit("new-participant", participant);
        this.broadcast("new-participant", [participant],
            {
                id: participant.id,
                name: participant.name,
                settings: participant.settings
            }
        );
    }

    leaveParticipant(participant: Participant) {
        this.participants.splice(this.participants.indexOf(participant), 1);
        this.broadcast("participant-left", participant.id);
    }

    addHostListeners(participant: Participant) {
        participant.isHost = true;
    }

    broadcast(event: string, ignoreParticipants: Array<Participant> = [], ...args: any[]) {
        this.participants.forEach(participant => {
            if (ignoreParticipants.includes(participant)) {
                return;
            }
            participant.socket.emit(event, ...args);
        });
    }

    destroy() {
        this.emit("destroy");
    }
}

export default Room;
