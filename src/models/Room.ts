import * as Event from 'events'
import Participant from "./Participant";

class Room extends Event.EventEmitter {
    public name;
    private participants = [];
    private configuration;

    constructor() {
        super();
    }

    addParticipant(participant : Participant){
        participant.on("leave", () => {
            this.participants.splice(this.participants.indexOf(participant), 1);
        });
        this.participants.push(participant);
        this.emit("new-participant", participant)
    }
}

export default Room;
