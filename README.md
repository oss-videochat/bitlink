# Video Web App Backend

Contains the code for the backend of the video conference call app.


## Websocket Events

Format


```
event-string(arg1,arg2) - description
```

equals

```
io.emit('event-string', 'arg1', 'arg2')
```

### Sending (Client → Server)

*events the client can emit*


- `create-room()` - Create a room. Client should receive a `join-room` event soon.
- `join-room(idOfRoom [, nameOfParticipant])` - Join a room. Client should receive a `room-summary` event if joining was successful. Otherwise, they will receive an `error` event.
- `update-settings(userSettings)` -  Update user settings.

```typescript
interface UserSettings {
     cameraEnabled?: boolean,
     microphoneEnabled?: boolean,
 }
```

- `update-name(name)` - Update name.

### Receiving (Server → Client)

- `join-room(idOfRoom)` - User should attempt to join the room in the id provided by emitting `join-room`.
- `room-summary(summary)` - [TODO]
- `new-participant(participantInformation)` - A new user has joined. Information about that client in  `participantInformation` arg.
- `destory` - The room has been destroyed (host either closed it or error occurred).

```typescript
interface ParticipantInformation {
    id: string,
    name: string,
    settings: UserSettings
 }
```
