import {handleEvent} from "../../interfaces/handleEvent";
import {MessageSummary} from "@bitlink/common";
import ChatStore from "../../stores/ChatStore";
import ChatStoreService from "../../services/ChatStoreService";

interface handleDeleteMessageParam {
    messageSummary: MessageSummary
}

export const handleDeleteMessage: handleEvent<handleDeleteMessageParam> = ({messageSummary}, cb) => {
    ChatStoreService.removeMessage(messageSummary.id);
};
