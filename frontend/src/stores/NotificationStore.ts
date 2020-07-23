import {observable} from "mobx";
import {UINotification} from "../interfaces/UINotification";

class NotificationStore {
    @observable public store = observable<UINotification>([]);
}

export default new NotificationStore();
