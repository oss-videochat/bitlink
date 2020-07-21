import {handleEvent} from "../../interfaces/handleEvent";
import {MessageSummary} from "@bitlink/common";
import ChatStore from "../../stores/ChatStore";

interface handleDeleteMessageParam {
    messageSummary: MessageSummary
}

export const handleDeleteMessage: handleEvent<handleDeleteMessageParam> = async ({messageSummary}, cb) => {
    ChatStore.removeMessage(messageSummary.id);
};
