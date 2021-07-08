import * as os from "os";

const listenIp = {
    ip: process.env.MEDIASOUP_LISTEN_IP || "0.0.0.0",
    announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP || "127.0.0.1",
};

export const config = {
    mediasoup: {
        // Number of mediasoup workers to launch.
        numWorkers: Object.keys(os.cpus()).length,
        // mediasoup WorkerSettings.
        // See https://mediasoup.org/documentation/v3/mediasoup/api/#WorkerSettings
        workerSettings: {
            logLevel: "warn",
            logTags: [
                "info",
                "ice",
                "dtls",
                "rtp",
                "srtp",
                "rtcp",
                "rtx",
                "bwe",
                "score",
                "simulcast",
                "svc",
                "sctp",
            ],
            rtcMinPort: process.env.MEDIASOUP_MIN_PORT || 40000,
            rtcMaxPort: process.env.MEDIASOUP_MAX_PORT || 49999,
        },
        // mediasoup Router options.
        // See https://mediasoup.org/documentation/v3/mediasoup/api/#RouterOptions
        routerOptions: {
            mediaCodecs: [
                {
                    kind: "audio",
                    mimeType: "audio/opus",
                    clockRate: 48000,
                    channels: 2,
                },
                {
                    kind: "video",
                    mimeType: "video/VP8",
                    clockRate: 90000,
                    parameters: {
                        "x-google-start-bitrate": 1000,
                    },
                },
                {
                    kind: "video",
                    mimeType: "video/VP9",
                    clockRate: 90000,
                    parameters: {
                        "profile-id": 2,
                        "x-google-start-bitrate": 1000,
                    },
                },
                {
                    kind: "video",
                    mimeType: "video/h264",
                    clockRate: 90000,
                    parameters: {
                        "packetization-mode": 1,
                        "profile-level-id": "4d0032",
                        "level-asymmetry-allowed": 1,
                        "x-google-start-bitrate": 1000,
                    },
                },
                {
                    kind: "video",
                    mimeType: "video/h264",
                    clockRate: 90000,
                    parameters: {
                        "packetization-mode": 1,
                        "profile-level-id": "42e01f",
                        "level-asymmetry-allowed": 1,
                        "x-google-start-bitrate": 1000,
                    },
                },
            ],
        },
        // mediasoup WebRtcTransport options for WebRTC endpoints (mediasoup-client,
        // libmediasoupclient).
        // See https://mediasoup.org/documentation/v3/mediasoup/api/#WebRtcTransportOptions
        webRtcTransportOptions: {
            listenIps: [listenIp],
            initialAvailableOutgoingBitrate: 1000000,
            minimumAvailableOutgoingBitrate: 600000,
            maxSctpMessageSize: 262144,
            enableTcp: true,
            enableUdp: true,
            preferUdp: true,
            // Additional options that are not part of WebRtcTransportOptions.
            maxIncomingBitrate: 1500000,
        },
        // mediasoup PlainTransport options for legacy RTP endpoints (FFmpeg,
        // GStreamer).
        // See https://mediasoup.org/documentation/v3/mediasoup/api/#PlainTransportOptions
        plainTransportOptions: {
            listenIp,
            maxSctpMessageSize: 262144,
        },
    },
};
