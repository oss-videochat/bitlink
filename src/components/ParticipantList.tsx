import React from 'react';
import {observer} from "mobx-react"

import {Participant} from "./Participant";

import ParticipantsStore from '../stores/ParticipantsStore'
import './ParticipantList.css';
import UIStore from "../stores/UIStore";


@observer
export class ParticipantList extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className={"participant-list " + (UIStore.store.participantPanel ? "open" : "")}>
                <div className={"participant-list--contents"}>
                    {ParticipantsStore.participants.map(participant => <Participant key={participant.id}
                                                                                    participant={participant}/>)}
                </div>
            </div>
        );
    }
}
