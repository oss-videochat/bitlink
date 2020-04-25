import ChatStore from "../stores/ChatStore";
import MyInfo from "../stores/MyInfo";
import ParticipantsStore from "../stores/ParticipantsStore";
import RoomStore from "../stores/RoomStore";

export function ResetStores() {
    ChatStore.reset();
    ParticipantsStore.reset();
    RoomStore.reset();
    MyInfo.reset();
}
