import React from 'react';
import {useObserver} from "mobx-react"
import './ChatParticipant.css'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faMicrophoneSlash, faVideoSlash} from '@fortawesome/free-solid-svg-icons'
import ParticipantsStore from "../../../stores/ParticipantsStore";
import Participant from "../../models/Participant";

interface IChatParticipantProps {
    onChosen: (chosen: string) => void,
    selected: boolean,
    participant: Participant,
    name?: string,
    lastMessage: string | undefined
}

const ChatParticipant: React.FunctionComponent<IChatParticipantProps> = ({onChosen, selected,participant, name, lastMessage}) => {
        return useObserver(() => (
            <div onClick={() => onChosen(participant.id)}
                 className={"chat-participant " + (selected ? "selected" : "")}>
                <div className={"chat-participant-name-container"}>
                    <span data-private={""} className={"chat-participant--name"}>{name || participant.name}</span>
                    {participant.id !== ParticipantsStore.everyone.id && participant.isAlive ?
                        <div className={"chat-participant---media-state"}>
                             <span className={"participant--icon"}>
                                 {participant.hasAudio ?
                                     null :
                                     <FontAwesomeIcon icon={faMicrophoneSlash}/>
                                 }
                             </span>
                            <span className={"participant--icon"}>
                                {participant.hasVideo ?
                                    null :
                                    <FontAwesomeIcon icon={faVideoSlash}/>
                                }
                            </span>
                        </div>
                        : null
                    }
                </div>
                {lastMessage ?
                    <span data-private={""} className={"chat-participant--content"}>{lastMessage}</span>
                    : null
                }
            </div>
        ));
}
export default ChatParticipant;
