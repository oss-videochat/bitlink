# bitlink

## About

@TODO Add purpose, goal, intent, project outline - where are we going and why / community

## Video Web App Frontend

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

In the project directory, you can run:

#### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
(@TODO this does not appear accurate)

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

#### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

#### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

### Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).



## Video Web App Backend

Contains the code for the backend of the video conference call app.


### Websocket Events

Format


```
event-string(arg1,arg2) - description
```

equals

```
io.emit('event-string', 'arg1', 'arg2')
```

#### Sending (Client → Server)

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

#### Receiving (Server → Client)

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

### HTTP API

`:roomIdHash` is a md5 hash of the room id


```typescript
interface ParticipantAuthObj {
    id: string,
    key: string
}
```

#### Sending Messages

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

##### Successful Response

```json
{
 "success": true,
 "error": null,
 "data": MessageJSONSummary
}
```

#### Editing Messages

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

##### Successful Response

```json
{
 "success": true,
 "error": null
}
```

#### Deleting Messages

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

##### Successful Response

```json
{
 "success": true,
 "error": null
}
```
