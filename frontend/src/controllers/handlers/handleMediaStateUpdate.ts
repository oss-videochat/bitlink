import {handleEvent} from "../../interfaces/handleEvent";
import ParticipantsStore from "../../stores/ParticipantsStore";
import {MediaAction, MediaSource} from "@bitlink/common";
import debug from "../../util/debug";

const log = debug("Handlers:MediaStateUpdate");

interface MediaStateUpdate {
    id: string,
    source: MediaSource,
    action: MediaAction;
}

interface handleMediaStateUpdateParam {
    update: MediaStateUpdate
}

export const handleMediaStateUpdate: handleEvent<handleMediaStateUpdateParam> = async ({update}, cb) => {
    const participant = ParticipantsStore.getById(update.id);
    if (!participant) {
        return;
    }
    log("Media state update %s: %s - %s", participant.name, update.source, update.action);
    if(participant.mediasoup.consumer[update.source]){
        participant.mediasoup.consumer[update.source]![update.action]();
        if(update.action === "close"){
            participant.mediasoup.consumer[update.source] = null;
        }
    }
    participant.mediaState[update.source] = update.action === "resume";
};
