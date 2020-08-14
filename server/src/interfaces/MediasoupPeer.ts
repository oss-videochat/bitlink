import { types } from "mediasoup";
import { MediaState } from "@bitlink/common";

export interface MediasoupPeer {
  transports: {
    sending?: types.Transport;
    receiving?: types.Transport;
  };
  producers: {
    [key in keyof MediaState]: types.Producer | undefined;
  };
  consumers: types.Consumer[];
  rtcCapabilities: types.RtpCapabilities;
}
