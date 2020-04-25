import React from 'react';
import {observer} from "mobx-react"
import './WaitingRoomList.css'
import ParticipantsStore from "../../../../stores/ParticipantsStore";
import {WaitingRoomListParticipant} from "./WaitingRoomListParticipant";

@observer
export class WaitingRoomList extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className={"waiting-room-list"}>
                <span className={"waiting-room--title"}>Waiting Room</span>
                {
                    ParticipantsStore.waitingRoom.map(patientParticipant =>
                        <WaitingRoomListParticipant key={patientParticipant.id} participant={patientParticipant}/>
                    )
                }
            </div>
        );
    }
}
