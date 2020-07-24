import React, {useState} from 'react';
import {useObserver} from "mobx-react"
import ChatParticipant from "./ChatParticipant";
import RoomStore from "../../../stores/RoomStore";
import ParticipantsStore from "../../../stores/ParticipantsStore";
import MyInfo from "../../../stores/MyInfoStore";
import ChatStore from "../../../stores/ChatStore";
import SearchBar from "./SearchBar";
import './ChatRoomList.css';
import UIStore from "../../../stores/UIStore";
import WaitingRoomList from "./WaitingRoom/WaitingRoomList";
import {SelectedRoom} from "../ChatContainer";
import ChatStoreService from "../../../services/ChatStoreService";
import {MessageType} from "@bitlink/common";

interface IChatParticipantListProps {
    selectedRoom: SelectedRoom,
    onRoomSelect: (info: SelectedRoom) => void
}

const ChatRoomList: React.FunctionComponent<IChatParticipantListProps> = ({selectedRoom, onRoomSelect}) => {
    const [searchText, setSearchText] = useState<string | null>(null);

    function handleSearchChange(newSearchText: string) {
        if (newSearchText.length > 0) {
            setSearchText(newSearchText);
        } else {
            setSearchText(null);
        }
    }

    function onChosen(info: SelectedRoom) {
        onRoomSelect(info);
        if (window.matchMedia('(max-width: 600px)').matches) {
            UIStore.store.participantPanel = false;
        }
    }

    return useObserver(() => (
        <div className={"chat-participant-wrapper " + (UIStore.store.participantPanel ? "open" : "")}>
            <div className={"chat-participant-wrapper--content"}>
                <SearchBar onChange={handleSearchChange}/>
                {RoomStore.info ?
                    <div className={"chat-participant-list"}>
                        {ParticipantsStore.waitingRoom.length > 0 ?
                            <WaitingRoomList/>
                            : null
                        }
                        {
                            RoomStore.groups
                                .map(group => (
                                    <ChatParticipant onChosen={onChosen}
                                                     selected={selectedRoom.type === MessageType.GROUP && selectedRoom.id === group.id}
                                                     key={"chat-" + group.id} lastMessage={ChatStoreService.getLatestMessage(MessageType.GROUP, group.id)}
                                                     type={MessageType.GROUP}
                                                     item={group}/>
                                ))
                        }
                        {ParticipantsStore.participants
                            .filter(participant => {
                                return (
                                    participant.info.id !== MyInfo.participant?.id
                                    && (!searchText || participant.info.name.toLowerCase().includes(searchText.toLowerCase()))
                                )
                            })
                            .map(participant => {
                                const lastMessage = ChatStoreService.getLatestMessage(MessageType.DIRECT, participant.info.id);
                                if (!participant.info.isAlive && !lastMessage) {
                                    return null;
                                }
                                return <ChatParticipant onChosen={onChosen}
                                                        selected={selectedRoom.type === MessageType.DIRECT && selectedRoom.id === participant.info.id}
                                                        key={"chat-" + participant.info.id} lastMessage={lastMessage}
                                                        type={MessageType.DIRECT}
                                                        item={participant}/>
                            })
                        }
                    </div>
                    : null
                }
            </div>
        </div>
    ));
}
export default ChatRoomList;
