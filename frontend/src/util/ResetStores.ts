import ChatStore from "../stores/ChatStore";
import MyInfo from "../stores/MyInfoStore";
import ParticipantsStore from "../stores/ParticipantsStore";
import RoomStore from "../stores/RoomStore";
import UIStore from "../stores/UIStore";

export function ResetStores() {
    ChatStore.reset();
    ParticipantsStore.reset();
    RoomStore.reset();
    MyInfo.reset();
    UIStore.store.joinedDate = null;
}
