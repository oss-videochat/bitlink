import UIStore from "../stores/UIStore";
import ChatStoreService from "../services/ChatStoreService";
import ParticipantService from "../services/ParticipantService";
import RoomService from "../services/RoomService";
import MyInfoService from "../services/MyInfoService";

export function ResetStores() {
  ChatStoreService.reset();
  ParticipantService.reset();
  RoomService.reset();
  MyInfoService.reset();
  UIStore.store.joinedDate = null;
}
