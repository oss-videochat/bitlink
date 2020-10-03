import { handleEvent } from "../../interfaces/handleEvent";
import { MediaAction, MediaSource } from "@bitlink/common";
import debug from "../../util/debug";
import ParticipantService from "../../services/ParticipantService";

const log = debug("Handlers:MediaStateUpdate");

interface MediaStateUpdate {
    id: string;
    source: MediaSource;
    action: MediaAction;
}

interface handleMediaStateUpdateParam {
    update: MediaStateUpdate;
}

export const handleMediaStateUpdate: handleEvent<handleMediaStateUpdateParam> = async (
    { update },
    cb
) => {
    const participant = ParticipantService.getById(update.id);
    if (!participant) {
        return;
    }
    log("Media state update %s: %s - %s", participant.info.name, update.source, update.action);
    if (participant.consumers[update.source]) {
        participant.consumers[update.source]![update.action]();
        if (update.action === "close") {
            participant.consumers[update.source] = null;
        }
    }
    participant.info.mediaState[update.source] = update.action === "resume";
};
