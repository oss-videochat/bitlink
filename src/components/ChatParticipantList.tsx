import React from 'react';
import {observer} from "mobx-react"
import {ChatParticipant} from "./ChatParticipant";
import RoomStore from "../stores/RoomStore";
import ParticipantsStore from "../stores/ParticipantsStore";
import {Participant} from "./Participant";
import MyInfo from "../stores/MyInfo";

@observer
export class ChatParticipantList extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        if (RoomStore.room) {
            return (
                <div className={"chat-participant-list"}>
                    <ChatParticipant name={RoomStore.room.name}/>
                    {ParticipantsStore.participants
                        .filter(participant => participant.id !== MyInfo.info?.id)
                        .map(participant => <ChatParticipant key={"chat-" + participant.id} participant={participant}/>)
                    }
                </div>
            );
        }
        return null;
    }
}
