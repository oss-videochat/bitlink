import React from 'react';
import IO from "../../../../controllers/IO";
import ParticipantsStore from "../../../../stores/ParticipantsStore";
import './ParticipantList.css';
import MyInfo from "../../../../stores/MyInfo";
import {ISettingsPanelProps} from '../SettingsViewer';
import {useObserver} from 'mobx-react';

const ParticipantList: React.FunctionComponent<ISettingsPanelProps> = ({events}) =>
    useObserver(() => (
        <div className={"settings-view"}>
            <h2 className={"modal--title"}>Participant List</h2>
            <div className={"participant-list"}>
                {
                    ParticipantsStore
                        .getLiving()
                        .slice(2)
                        .map(participant => {
                            return (
                                <div key={participant.id} className={"participant"}>
                                        <span data-private={""}
                                              className={"participant--name"}>{participant.name}</span>
                                    {MyInfo.info?.isHost
                                    && !participant.isHost ?
                                        <span onClick={() => IO.kick(participant)}
                                              className={"participant--kick-button"}>Kick</span>
                                        : null
                                    }
                                </div>
                            )
                        })
                }
            </div>
        </div>
    ));

export default ParticipantList;
