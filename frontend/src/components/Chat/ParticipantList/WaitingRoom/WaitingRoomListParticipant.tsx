import React from 'react';
import './WaitingRoomListParticipant.css';
import IO from "../../../../controllers/IO";
import Participant from "../../../../models/Participant";
import {useObserver} from 'mobx-react';

interface IWaitingRoomListParticipantProps {
    participant: Participant
}

const WaitingRoomListParticipant: React.FunctionComponent<IWaitingRoomListParticipantProps> = ({participant}) => useObserver(() => (
    <div className={"waiting-room-participant"}>
        <span data-private={""} className={"waiting-room-participant--name"}>{participant.info.name}</span>
        <div className={"waiting-room-participant--decision-container"}>
            <input onClick={() => IO.waitingRoomDecision(participant.info.id, true)} type={"button"}
                   className={"waiting-room-participant--decision-button"} value={"Accept"}/>
            <input onClick={() => IO.waitingRoomDecision(participant.info.id, false)} type={"button"}
                   className={"waiting-room-participant--decision-button reject"} value={"Reject"}/>
        </div>
    </div>
));
export default WaitingRoomListParticipant;
