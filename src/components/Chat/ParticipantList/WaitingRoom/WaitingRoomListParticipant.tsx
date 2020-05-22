import React from 'react';
import {observer} from "mobx-react"
import './WaitingRoomListParticipant.css';
import IO from "../../../../controllers/IO";


@observer
export class WaitingRoomListParticipant extends React.Component<any, any> {

    handleAccept() {
        IO.waitingRoomDecision(this.props.participant.id, true);
    }

    handleReject() {
        IO.waitingRoomDecision(this.props.participant.id, false);
    }

    render() {
        return (
            <div className={"waiting-room-participant"}>
                <span data-private={""} className={"waiting-room-participant--name"}>{this.props.participant.name}</span>
                <div className={"waiting-room-participant--decision-container"}>
                    <input onClick={this.handleAccept.bind(this)} type={"button"}
                           className={"waiting-room-participant--decision-button"} value={"Accept"}/>
                    <input onClick={this.handleReject.bind(this)} type={"button"}
                           className={"waiting-room-participant--decision-button reject"} value={"Reject"}/>
                </div>
            </div>
        );
    }
}
