import { types } from "mediasoup";
import debug from "../helpers/debug";
import { Room } from "../interfaces/Room";
import { Participant } from "../interfaces/Participant";
import {
  MediaSource,
  MediaSourceToTypeMap,
  MediaType,
  TransportJob,
  TransportType,
} from "@bitlink/common";
import { config } from "../../config";
import { WebRtcTransportOptions } from "mediasoup/lib/WebRtcTransport";
import MediasoupPeerService from "./MediasoupPeerService";
import RoomService from "./RoomService";

const log = debug("Services:WebRTCRoomService");

class WebRTCRoomService {
  static async createTransport(
    room: Room,
    participant: Participant,
    type: TransportType,
    kind: TransportJob
  ): Promise<types.WebRtcTransport> {
    log("Participant creating a transport %s:%s", participant.name, kind);
    let transport;
    switch (type) {
      case "webrtc":
        transport = await room.router.createWebRtcTransport(
          config.mediasoup.webRtcTransportOptions as WebRtcTransportOptions
        );
        break;
      case "plain":
        throw "Unsupported";
      //transport = await room.router.createPlainTransport(config.mediasoup.plainTransportOptions);
      default:
        throw "Unknown type";
    }
    MediasoupPeerService.addTransport(participant.mediasoupPeer, transport, kind);
    return transport;
  }

  static async createProducer(
    room: Room,
    participant: Participant,
    transport: types.Transport,
    kind: MediaType,
    rtpParameters: types.RtpParameters,
    source: MediaSource
  ) {
    log("Participant creating a producer %s:%s", participant.name, source);
    const producer = await transport.produce({
      kind,
      rtpParameters,
    });
    MediasoupPeerService.addProducer(participant.mediasoupPeer, producer, source);
    participant.mediaState[source] = true;
    RoomService.getConnectedParticipants(room).forEach((aParticpant) => {
      if (aParticpant.id === participant.id) {
        return;
      }
      WebRTCRoomService.createConsumerAndNotify(room, participant, aParticpant, source);
    });
    return producer;
  }

  static notifyParticipantOfProducers(room: Room, participant: Participant) {
    log("Participant says their transports are ready %s", participant.name);
    RoomService.getConnectedParticipants(room).forEach((participantJoined) => {
      if (participantJoined.id === participant.id) {
        return;
      }
      Object.keys(participantJoined.mediasoupPeer.producers).forEach((type) => {
        WebRTCRoomService.createConsumerAndNotify(
          room,
          participantJoined,
          participant,
          type as MediaSource
        ).catch(console.error);
      });
    });
  }

  private static async createConsumerAndNotify(
    room: Room,
    producerPeer: Participant,
    consumerPeer: Participant,
    source: MediaSource
  ) {
    log(
      "New consumer creation { Producer: %s | Consumer: %s }",
      producerPeer.name,
      consumerPeer.name
    );
    const producer = producerPeer.mediasoupPeer.producers[source];
    if (
      !producer ||
      !consumerPeer.mediasoupPeer.rtcCapabilities ||
      !room.router.canConsume({
        producerId: producer.id,
        rtpCapabilities: consumerPeer.mediasoupPeer.rtcCapabilities,
      })
    ) {
      return;
    }
    const transport = await consumerPeer.mediasoupPeer.transports.receiving;

    if (!transport) {
      return;
    }

    const consumer = await transport.consume({
      producerId: producer.id,
      rtpCapabilities: consumerPeer.mediasoupPeer.rtcCapabilities,
      paused: true,
    });

    MediasoupPeerService.addConsumer(consumerPeer.mediasoupPeer, consumer);

    consumerPeer.socket.emit(
      "new-consumer",
      {
        source,
        kind: MediaSourceToTypeMap[source],
        participantId: producerPeer.id,
        data: {
          producerId: producer.id,
          consumerId: consumer.id,
          rtpParameters: consumer.rtpParameters,
          producerPaused: consumer.producerPaused,
        },
      },
      (success: boolean) => {
        if (success) {
          consumer.resume();
        }
      }
    );
  }
}

export default WebRTCRoomService;
