import {observable} from "mobx";
import {Message} from "../interfaces/Message";

class ChatStore {
    @observable public messageStore: {[key: string]: Message} = {};
}

export default new ChatStore();
