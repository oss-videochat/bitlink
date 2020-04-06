import React from 'react';
import {observer} from "mobx-react"

import {Participant} from "./Participant";

import ParticipantsStore from '../stores/ParticipantsStore'
import './ParticipantList.css';


@observer
export class ParticipantList extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            isOpen: true,
        };
        this._handleToggle = this._handleToggle.bind(this);
    }

    _handleToggle(){
        console.log("click" + this.state.isOpen);
        this.setState((prevState: any) => ({isOpen : !prevState.isOpen}))
    }

    render() {
        return (
            <div className={"participant-list " + (this.state.isOpen ? "open" : "")}>
                <div onClick={this._handleToggle} className={"participant-list--toggler"}>
                    <span className={"participant-list--toggler--line"}/>
                </div>
                <div className={"participant-list--contents"}>
                    {ParticipantsStore.participants.map(participant => <Participant key={participant.id}
                                                                                    participant={participant}/>)}
                </div>
            </div>
        );
    }
}
