![BitLink Logo](assets/logo.svg)

BitLink is an open source video conference chat program.

[https://bitlink.live](https://bitlink.live)

## Features

### No Download Needed

BitLink can operate completely in the browser on both mobile and desktop devices.

### Robust Chat System

BitLink has a robust integrated chat system. Participants can send messages individually or to the entire room. Participants can edit and delete messages. When a new participant joins, the entire chat history will be synced with their device.

### Background Replacement / Blur

BitLink has built in background replacement (virtual background) support and blur background functionality. Powered by Tensorflow's BodyPix library, we are able to achieve great accuracy while still achieving high performance. Many laptops can apply background replacement without fan spin.

### Waiting Room

BitLink has a waiting room feature. Once the host enables the waiting room, new members will be entered into a waiting room where the host can either accept them into the room or reject them from entering.

### Screen Sharing

User's can share their screen with other users in the room.

## Installation

```shell script
git clone https://github.com/oss-videochat/bitlink.git`
cd bitlink
npm install
lerna bootstrap
lerna link # may hang, see note below
cd server
MEDIASOUP_LISTEN_IP=<YOUR IP ADDRESS>; npm run run
```

`lerna run build` should work, but if it doesn't, manually build with

```shell script
cd common && npm run build
cd ../frontend && npm run build
cd ../server && npm run build
```

# Usage 

```shell script
cd server
MEDIASOUP_LISTEN_IP=<YOUR IP ADDRESS>; npm run run
```

## Contributing

Thank you for helping BitLink grow! Please submit a PR request.
