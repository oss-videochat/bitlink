import React from 'react';
import {observer} from "mobx-react"
import {ChatParticipant} from "./ChatParticipant";
import RoomStore from "../stores/RoomStore";
import ParticipantsStore from "../stores/ParticipantsStore";
import MyInfo from "../stores/MyInfo";
import ChatStore from "../stores/ChatStore";
import {SearchBar} from "./SearchBar";
import './ChatParticipantList.css';

@observer
export class ChatParticipantList extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            searchText: null,
        };
        this.handleSearchChange = this.handleSearchChange.bind(this);
    }

    handleSearchChange(searchText: string) {
        if (searchText.length > 0) {
            this.setState({searchText});
        } else {
            this.setState({searchText: null});
        }
    }

    render() {
        return (
            <div className={"chat-participant-wrapper"}>
                <SearchBar onChange={this.handleSearchChange}/>
                {RoomStore.room ?
                    <div className={"chat-participant-list"}>
                        {
                            (!this.state.searchText || RoomStore.room.name.toLowerCase().includes(this.state.searchText.toLowerCase())) ?
                                <ChatParticipant key={"chat-everyone"} name={RoomStore.room.name}/> :
                                null
                        }
                        {ParticipantsStore.participants
                            .filter(participant => participant.id !== MyInfo.info?.id)
                            .filter(participant => {
                                if (this.state.searchText) {
                                    return participant.name.toLowerCase().includes(this.state.searchText.toLowerCase());
                                }
                                return true;
                            })
                            .map(participant => {
                                const store = ChatStore.chatStore[participant.id];
                                const lastMessage = store[store.length - 1];
                                return <ChatParticipant key={"chat-" + participant.id} lastMessage={lastMessage}
                                                        name={participant.name}/>
                            })
                        }
                    </div>
                    : null
                }
            </div>
        );
    }
}
