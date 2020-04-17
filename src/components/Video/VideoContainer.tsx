import React from 'react';
import {observer} from "mobx-react"
import './VideoContainer.css';
import ParticipantsStore from "../../stores/ParticipantsStore";
import {VideoParticipant} from "./VideoParticipant";
import {AudioParticipant} from "./AudioParticipant";
import {VideoPlaceholder} from "./VideoPlaceholder";

@observer
export class VideoContainer extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className={"video-container"}>
                {
                    ParticipantsStore.participants.length > 3 ?
                        ParticipantsStore.participants
                            .filter(participant => participant.mediaState.microphoneEnabled || participant.mediaState.cameraEnabled)
                            .map((participant, index) => {
                                if (participant.mediaState.cameraEnabled) {
                                    return <VideoParticipant key={index} participant={participant}/>
                                } else {
                                    return <AudioParticipant key={index} participant={participant}/>
                                }
                            })
                        : <VideoPlaceholder/>
                }
            </div>
        );
    }
}
