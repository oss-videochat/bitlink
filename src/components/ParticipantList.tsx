import React from 'react';
import {observer} from "mobx-react"

import {Participant} from "./Participant";

import ParticipantsStore from '../stores/ParticipantsStore'


@observer
export class ParticipantList extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className={"participant-list"}>
                {ParticipantsStore.participants.map(participant => <Participant key={participant.id} participant={participant}/>)}
            </div>
        );
    }
}
