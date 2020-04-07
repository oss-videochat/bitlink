import React from 'react';
import {observer} from "mobx-react"

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash, faComments} from '@fortawesome/free-solid-svg-icons'

import {ParticipantInformation} from "../stores/ParticipantsStore";
import './Participant.css'

@observer
export class Participant extends React.Component<any, any> {
    constructor(props: ParticipantInformation) {
        super(props);
    }

    render() {
        return (
            <div className={"participant"}>
                <div className={"participant--name-wrapper"}>
                    <span className={"name"}>{this.props.participant.name}</span>
                </div>
                <div className={"participant--user-settings-wrapper"}>
                     <span className={"participant--icon"}>
                         {this.props.participant.settings.microphoneEnabled ?
                             null :
                             <FontAwesomeIcon icon={faMicrophoneSlash}/>
                         }
                     </span>
                    <span className={"participant--icon"}>
                        {this.props.participant.settings.cameraEnabled ?
                            null :
                            <FontAwesomeIcon icon={faVideoSlash}/>
                        }
                    </span>
                </div>
            </div>
        );
    }
}
