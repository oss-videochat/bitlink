import React from 'react';

import {VideoContainer} from "./VideoContainer";
import {Header} from './Header/Header';
import './App.css';
import {ChatContainer} from "./Chat/ChatContainer";
import {Modal} from "./Modals/Modal";
import UIStore from "../stores/UIStore";
import {NotificationViewer} from "./NotificationViewer";

export class App extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        const url = new URL(window.location.href);
        const parts = url.pathname.split("/").slice(1);
        const verb: string = parts[0];
        const data: string = parts[1];

        if (verb === "join") {
            if (data) {
                UIStore.store.preFillJoinValue = data;
            }
            UIStore.store.modalStore.join = true;
        }

        if (verb === "create") {
            UIStore.store.modalStore.create = true;
        }

        if (!verb) {
            UIStore.store.modalStore.joinOrCreate = true;
        }

    }

    render() {
        return (
            <div className={"app"}>
                <NotificationViewer/>
                <Modal/>
                <Header/>
                <div className={"main-container"}>
                    <ChatContainer/>
                    <VideoContainer/>
                </div>
            </div>
        );
    }
}

export default App;
