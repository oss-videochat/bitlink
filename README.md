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
- `update-mediaState(userSettings)` -  Update user mediaState.

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
    mediaState: UserSettings
 }
```

- `<new|edit|delete>-<room|direct>-message(MessageJSONSummary)` - A message event has occurred. Message event type could been `new`, `edit`, or `delete`. Message type could be `room` or a `direct` message.

```typescript
enum Reactions {
    ThumbsUp,
    ThumbsDown,
    Laugh,
    Confused,
    Celebrate,
    OneHundred,
    QuestionMark,
    Clap,
}

interface ReactionSummary {
    type: Reactions,
    participantId: string, // id of participant to reacted
}

interface MessageJSONSummary {
    from: string // id of participant
    to: string, // id of participant
    message: string, // id of message
    content: string,
    reactions: Array<ReactionSummary>
}
```

## HTTP API

`:roomIdHash` is a md5 hash of the room id


```typescript
interface ParticipantAuthObj {
    id: string,
    key: string
}
```

### Sending Messages

```text
POST /api/:roomIdHash/send
-------------------------------

Content-Type: application/json
```


```text
body: {
    from: ParticipantAuthObj,
    to: string, // id of to participant || "everyone" if its a room message,
    content: "Message content"
}
```

#### Successful Response

```json
{
 "success": true,
 "error": null,
 "data": MessageJSONSummary
}
```

### Editing Messages

```text
POST /api/:roomIdHash/edit
-------------------------------

Content-Type: application/json
```


```text
body: {
    from: ParticipantAuthObj,
    messageId: string, // id of the message the user wishes to edit
    content: "Message content" // new content
}
```

#### Successful Response

```json
{
 "success": true,
 "error": null
}
```

### Deleting Messages

```text
POST /api/:roomIdHash/delete
-------------------------------

Content-Type: application/json
```


```text
body: {
    from: ParticipantAuthObj,
    messageId: string, // id of the message the user wishes to delete
}
```

#### Successful Response

```json
{
 "success": true,
 "error": null
}
```
