import { observable } from "mobx";
import { RoomSummary } from "@bitlink/common";
import * as mediasoupclient from "mediasoup-client";
import { MessageGroup } from "../interfaces/MessageGroup";

class RoomStore {
  @observable public info?: RoomSummary;
  @observable public groups: MessageGroup[] = [];

  public device?: mediasoupclient.types.Device;

  public mediasoup = {
    rtcCapabilities: null,
  };
}

export default new RoomStore();
