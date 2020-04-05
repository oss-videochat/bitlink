import React from 'react';
import {observer} from "mobx-react"
import {observable} from "mobx"

import {VideoContainer} from "./VideoContainer";
import {ParticipantList} from "./ParticipantList";
import IO from "../controllers/IO";
import RoomStore from "../stores/RoomStore";

@observer
export class App extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this._handleJoinButton = this._handleJoinButton.bind(this);
    }

    _handleJoinButton() {
        IO.createRoom();
    }

    render() {
        return (
            <div>
                <header className={"header"}>
                    <span>Current Room id: {RoomStore.room?.id}</span>
                    <button onClick={this._handleJoinButton}>Create</button>
                </header>
                <div className={"main-container"}>
                    <div className={"video-participant-container"}>
                        <VideoContainer/>
                        <ParticipantList/>
                    </div>
                    <div className={"chat-container"}>

                    </div>
                </div>
            </div>
        );
    }
}

export default App;
