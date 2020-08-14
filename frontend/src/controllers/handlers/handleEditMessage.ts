import { handleEvent } from "../../interfaces/handleEvent";
import { MessageSummary } from "@bitlink/common";
import ChatStoreService from "../../services/ChatStoreService";

interface handleEditMessageParam {
  messageSummary: MessageSummary;
}

export const handleEditMessage: handleEvent<handleEditMessageParam> = ({ messageSummary }, cb) => {
  ChatStoreService.editMessage(messageSummary.id, messageSummary.content);
};
