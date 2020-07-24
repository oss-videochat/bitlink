import React from 'react';
import './ParticipantList.css';
import {useObserver} from 'mobx-react';
import ParticipantsStore from "../../stores/ParticipantsStore";
import MyInfo from "../../stores/MyInfoStore";
import IO from "../../controllers/IO";
import ParticipantService from "../../services/ParticipantService";

interface IParticipantListProps {
    onTransfer?: () => void
}

const ParticipantList: React.FunctionComponent<IParticipantListProps> = ({onTransfer}) =>
    useObserver(() => (
        <div className={"participant-list"}>
            {
                ParticipantService
                    .getLiving(true)
                    .slice(2)
                    .map(participant => {
                        return (
                            <div key={participant.info.id} className={"participant"}>
                                        <span data-private={""}
                                              className={"participant--name"}>{participant.info.name}</span>
                                {MyInfo.isHost &&
                                <>
                                    <span onClick={() => IO.kick(participant)}
                                              className={"participant--action-button"}>Kick</span>
                                    <span onClick={() => IO.transferHost(participant).then(onTransfer)}
                                          className={"participant--action-button"}>Transfer Host</span>
                                </>
                                }
                            </div>
                        )
                    })
            }
        </div>
    ));

export default ParticipantList;
