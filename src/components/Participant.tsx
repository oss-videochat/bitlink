import React from 'react';
import {observer} from "mobx-react"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash, faComments } from '@fortawesome/free-solid-svg-icons'

import {ParticipantInformation} from "../stores/ParticipantsStore";

@observer
export class Participant extends React.Component<any, any> {
    constructor(props: ParticipantInformation) {
        super(props);
    }

    render() {
        return (
            <div className={"participant"}>
                <div className={"name-wrapper"}>
                    <span className={"name"}>{this.props.participant.id}</span>
                </div>
                <div className={"user-settings-wrapper"}>
                    {this.props.participant.settings.microphoneEnabled ?
                        <FontAwesomeIcon icon={faMicrophone}/> :
                        <FontAwesomeIcon icon={faMicrophoneSlash}/>
                    }
                    {this.props.participant.settings.cameraEnabled ?
                        <FontAwesomeIcon icon={faVideo}/> :
                        <FontAwesomeIcon icon={faVideoSlash}/>
                    }
                    <FontAwesomeIcon icon={faComments}/>
                </div>
            </div>
        );
    }
}
