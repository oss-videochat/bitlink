import React, {useState} from 'react';
import {useObserver} from "mobx-react"
import ChatParticipantList from "./ParticipantList/ChatParticipantList";
import MessagesContainer from "./Messages/MessagesContainer";
import './ChatContainer.css';
import UIStore from "../../stores/UIStore";

const ChatContainer: React.FunctionComponent = () => {
    const [selectedUser, setSelectedUser] = useState("everyone");

    return useObserver(() => (
        <div className={"chat-container " + (UIStore.store.chatPanel ? "open" : "")}>
            <div className={"chat-container--content"}>
                <ChatParticipantList selectedUser={selectedUser} onUserSelect={setSelectedUser}/>
                <MessagesContainer selectedUser={selectedUser}/>
            </div>
        </div>
    ));
}

export default ChatContainer;
