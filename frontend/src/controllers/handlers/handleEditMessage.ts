import {handleEvent} from "../../interfaces/handleEvent";
import {MessageSummary} from "@bitlink/common";
import ChatStore from "../../stores/ChatStore";

interface handleEditMessageParam {
    messageSummary: MessageSummary
}

export const handleEditMessage: handleEvent<handleEditMessageParam> = async ({messageSummary}, cb) => {
    ChatStore.editMessage(messageSummary.id, messageSummary.content);
};
