import React from 'react';
import {useObserver} from "mobx-react"
import './WaitingRoomList.css'
import ParticipantsStore from "../../../../stores/ParticipantsStore";
import WaitingRoomListParticipant from "./WaitingRoomListParticipant";

const WaitingRoomList: React.FunctionComponent = () => useObserver(() => (
        <div className={"waiting-room-list"}>
            <span className={"waiting-room--title"}>Waiting Room</span>
            {
                ParticipantsStore.waitingRoom.map(patientParticipant =>
                    <WaitingRoomListParticipant key={patientParticipant.id} participant={patientParticipant}/>
                )
            }
        </div>
    )
);
export default WaitingRoomList;
