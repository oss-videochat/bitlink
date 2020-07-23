import React, {useState} from 'react';
import {useObserver} from "mobx-react"
import ChatParticipant from "./ChatParticipant";
import RoomStore from "../../../stores/RoomStore";
import ParticipantsStore from "../../../stores/ParticipantsStore";
import MyInfo from "../../../stores/MyInfoStore";
import ChatStore from "../../../stores/ChatStore";
import SearchBar from "./SearchBar";
import './ChatParticipantList.css';
import UIStore from "../../../stores/UIStore";
import WaitingRoomList from "./WaitingRoom/WaitingRoomList";

interface IChatParticipantListProps {
    selectedUser: string,
    onUserSelect: (user: string) => void
}

const ChatParticipantList: React.FunctionComponent<IChatParticipantListProps> = ({selectedUser, onUserSelect}) => {
    const [searchText, setSearchText] = useState<string | null>(null);

    function handleSearchChange(newSearchText: string) {
        if (newSearchText.length > 0) {
            setSearchText(newSearchText);
        } else {
            setSearchText(null);
        }
    }

    function getLastMessage(id: string) {
        const store = ChatStore.chatStore[id];
        let lastMessage = undefined;
        if (store) {
            lastMessage = store[store.length - 1]?.content;
        }
        return lastMessage;
    }

    function onChosen(selected: string) {
        onUserSelect(selected);
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
                            (!searchText || RoomStore.info.name.toLowerCase().includes(searchText.toLowerCase())) ?
                                <ChatParticipant onChosen={onChosen} key={"chat-everyone"}
                                                 selected={selectedUser === "everyone"}
                                                 participant={ParticipantsStore.everyone}
                                                 name={RoomStore.info.name}
                                                 lastMessage={getLastMessage("everyone")}/> :
                                null
                        }
                        {ParticipantsStore.participants
                            .slice(2) // get rid of the system and everyone users
                            .filter(participant => {
                                return participant.id !== MyInfo.info?.id
                            })
                            .filter(participant => {
                                if (searchText) {
                                    return participant.name.toLowerCase().includes(searchText.toLowerCase());
                                }
                                return true;
                            })
                            .map(participant => {
                                const lastMessage = getLastMessage(participant.id);
                                if (!participant.isAlive && !lastMessage) {
                                    return null;
                                }
                                return <ChatParticipant onChosen={onChosen}
                                                        selected={selectedUser === participant.id}
                                                        key={"chat-" + participant.id} lastMessage={lastMessage}
                                                        participant={participant}/>
                            })
                        }
                    </div>
                    : null
                }
            </div>
        </div>
    ));
}
export default ChatParticipantList;
