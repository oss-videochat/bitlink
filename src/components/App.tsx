import React from 'react';
import {observer} from "mobx-react"
import {observable} from "mobx"

import {VideoContainer} from "./VideoContainer";
import {ParticipantList} from "./ParticipantList";
import {Header} from './Header';
import './App.css';
import {ChatContainer} from "./ChatContainer";

@observer
export class App extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className={"app"}>
                <header className={"header"}>
                    <Header/>
                </header>
                <div className={"main-container"}>
                    <div className={"video-participant-container"}>
                        <VideoContainer/>
                        <ParticipantList/>
                    </div>
                    <div className={"chat-container"}>
                        <ChatContainer/>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
