import React, {useState} from 'react';
import {useObserver} from "mobx-react"
import ChatRoomList from "./ParticipantList/ChatRoomList";
import MessagesContainer from "./Messages/MessagesContainer";
import './ChatContainer.css';
import UIStore from "../../stores/UIStore";
import {MessageType} from "@bitlink/common";
import RoomStore from "../../stores/RoomStore";

export interface SelectedRoom {
    type: MessageType,
    id: string
}

const ChatContainer: React.FunctionComponent = () => {
    const [selectedRoom, setSelectedRoom] = useState<SelectedRoom>({type: MessageType.GROUP, id: ""});

    return useObserver(() => (
        <div className={"chat-container " + (UIStore.store.chatPanel ? "open" : "")}>
            <div className={"chat-container--content"}>
                <ChatRoomList selectedRoom={selectedRoom} onRoomSelect={setSelectedRoom}/>
                <MessagesContainer selectedRoom={selectedRoom}/>
            </div>
        </div>
    ));
}

export default ChatContainer;
