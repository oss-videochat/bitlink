import React from 'react';
import {observer} from "mobx-react"
import './VideoContainer.css';
import ParticipantsStore from "../../stores/ParticipantsStore";
import {VideoParticipant} from "./VideoParticipant";
import {AudioParticipant} from "./AudioParticipant";
import {VideoPlaceholder} from "./VideoPlaceholder";
import MyInfo from "../../stores/MyInfo";

@observer
export class VideoContainer extends React.Component<any, any> {
    private previewRef: React.RefObject<HTMLVideoElement> = React.createRef();

    constructor(props: any) {
        super(props);
    }

    async updateMedia() {
        if (MyInfo.info?.mediaState.cameraEnabled) {
            this.previewRef!.current!.srcObject = new MediaStream([await MyInfo.getVideoStream()]);
        }
    }

    componentDidMount(): void {
        this.previewRef!.current!.addEventListener("canplay", () => {
            this.previewRef!.current!.play();
        });
        this.updateMedia();
    }

    componentDidUpdate(): void {
        this.updateMedia();
    }

    render() {
        return (
            <div className={"video-container"}>


                <div className={"preview-video"} hidden={!MyInfo.info?.mediaState.cameraEnabled}>
                    <video ref={this.previewRef}/>
                </div>

                <div className={"videos-list-wrapper"}>
                    {
                        ParticipantsStore.participants.length > 3 ?
                            ParticipantsStore.participants
                                .filter(participant => participant.mediaState.microphoneEnabled || participant.mediaState.cameraEnabled)
                                .map((participant, i, arr) => {
                                    if (participant.mediaState.cameraEnabled) {
                                        return <VideoParticipant key={participant.id} participant={participant}/>
                                    } else {
                                        return <AudioParticipant key={participant.id} participant={participant}/>
                                    }
                                })
                            : <VideoPlaceholder/>
                    }
                </div>
            </div>
        );
    }
}
