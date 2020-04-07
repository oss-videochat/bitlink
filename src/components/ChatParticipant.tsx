import React from 'react';
import {observer} from "mobx-react"
import './ChatParticipant.css'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash, faComments} from '@fortawesome/free-solid-svg-icons'


@observer
export class ChatParticipant extends React.Component<any, any> {
    public static previewLength = 50;

    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className={"chat-participant"}>
                <div className={"chat-participant-name-container"}>
                    <span className={"chat-participant--name"}>{this.props.name || this.props.participant.name}</span>
                    {this.props.participant ?
                        <div className={"chat-participant---settings"}>
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
                        : null
                    }
                </div>
                {this.props.lastMessage ?
                    this.props.lastMessage.length > ChatParticipant.previewLength ?
                        <span
                            className={"chat-participant--content"}>{this.props.lastMessage.slice(0, ChatParticipant.previewLength - 3) + "..."}</span>
                        : <span className={"chat-participant--content"}>{this.props.lastMessage}</span>
                    : null
                }
            </div>
        );
    }
}
