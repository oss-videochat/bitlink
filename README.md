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

Users can share their screen with other users in the room.

## Installation

```shell script
git clone https://github.com/oss-videochat/bitlink.git`
cd bitlink
npm install
lerna bootstrap
lerna link 
lerna run build # may hang, see note below
cd server
MEDIASOUP_LISTEN_IP=<YOUR IP ADDRESS>; npm run start
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
MEDIASOUP_LISTEN_IP=<YOUR IP ADDRESS>; npm run start
```

# Docker

Mediasoup requires some special network configuration that wouldn't be needed for a typical web server.

You can hit the ground running using `docker-compose` for very quick setup:

```
docker-compose up
```

This configures some sensible defaults for running BitLink locally for demo purposes.
Feel free to adjust `docker-compose.yml` to configure default ports, etc.

If you want to run BitLink in production, you should instead run the Docker image directly and configure Mediasoup manually:

```
docker build -t bitlink .
docker run -e "PORT=80" -p 80:80 -e "MEDIASOUP_LISTEN_IP=x.x.x.x" -e "MEDIASOUP_ANNOUNCED_IP=x.x.x.x" \
    -e "MEDIASOUP_MIN_PORT=10000" -e "MEDIASOUP_MAX_PORT=20000" -p "10000-20000:10000-20000/tcp" -p "10000-20000:10000-20000/udp" bitlink
```

Please read the [Mediasoup documentation](https://github.com/versatica/mediasoup-demo/blob/v3/server/DOCKER.md)
for more information about these variables.

# FireFox Development Issues

Firefox and Chrome both don't allow WebRTC connections to `127.0.0.1`/`localhost` via UDP. Chrome, however, does allows connecting to `127.0.0.1`/`localhost` via TCP. As such, Chrome should work without issue in development. Firefox on the other hand will likely error with something to the effect of "`ICE failed, add a STUN server and see about:webrtc for more details`". 

To work around this you must use an IP address not in the range of 127.0.0.1 - 127.255.255.255 and pass it to the `MEDIASOUP_LISTEN_IP` environment variable.

We suggest either using your internal IP address, e.g `MEDIASOUP_LISTEN_IP=192.168.1.197` or aliasing another address to your localhost. On macOS and Linux this can be accomplished by running:

```shell script
sudo ifconfig lo0 alias 172.0.0.1
```
and then passing the chosen IP to Mediasoup, e.g. `MEDIASOUP_LISTEN_IP=172.0.0.1`.

**Note**: To reverse and remove the alias run `sudo ifconfig lo0 -alias 172.0.0.1`.

Regardless of the chosen method, you can still access the site at `localhost`/`127.0.0.1`.

## Contributing

Thank you for helping BitLink grow! Please submit a PR request.
