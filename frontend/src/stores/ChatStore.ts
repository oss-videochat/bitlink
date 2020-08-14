import { observable } from "mobx";
import { Message } from "../interfaces/Message";

class ChatStore {
  @observable public messageStore: Message[] = [];
}

export default new ChatStore();
