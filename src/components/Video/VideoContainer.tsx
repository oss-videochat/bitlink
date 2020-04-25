import React from 'react';
import {observer} from "mobx-react"
import {reaction, observable} from "mobx"
import './VideoContainer.css';
import ParticipantsStore, {ParticipantInformation} from "../../stores/ParticipantsStore";
import {VideoParticipant} from "./VideoParticipant";
import {AudioParticipant} from "./AudioParticipant";
import {VideoPlaceholder} from "./VideoPlaceholder";
import MyInfo from "../../stores/MyInfo";
import UIStore from "../../stores/UIStore";
import {LayoutSizeCalculation} from "../../util/LayoutSizeCalculation";

@observer
export class VideoContainer extends React.Component<any, any> {
    private previewRef: React.RefObject<HTMLVideoElement> = React.createRef();
    private containerRef: React.RefObject<HTMLDivElement> = React.createRef();

    @observable
    windowSize = {
        height: window.innerHeight,
        width: window.innerWidth
    };

    constructor(props: any) {
        super(props);
        this.state = {
            basis: 0,
            maxWidth: 0,
        };
    }

    async updateMedia() {
        if(!MyInfo.info?.mediaState.cameraEnabled){
            return;
        }
        const stream  = await MyInfo.getVideoStream();
        const srcObject: MediaStream | undefined =   this.previewRef!.current!.srcObject as MediaStream | undefined;
        if (srcObject?.getVideoTracks()[0].id !== stream.getVideoTracks()[0].id) {
            this.previewRef!.current!.srcObject = stream;
        }
    }

    componentWillUnmount(): void {
        this.updateBasis();
    }


    updateBasis = reaction(() => {
        return {
            height: this.windowSize.height,
            width: this.windowSize.width,
            chatPanel: UIStore.store.chatPanel,
            numParticipants: ParticipantsStore.getLiving()
                .filter(participant => participant.mediaState.microphoneEnabled || participant.mediaState.cameraEnabled).length
        }

    }, (data) => {
        const div = this.containerRef.current!;

        if (!div) {
            return;
        }

        const divWidth = UIStore.store.chatPanel ? div.offsetWidth : data.width; // there's an animation with the chat panel so we need to figure out how large the div will be post animation
        const result = LayoutSizeCalculation(divWidth, div.offsetHeight, data.numParticipants);
        this.setState({basis: result.basis, maxWidth: result.maxWidth});
    });

    componentDidMount(): void {
        this.previewRef!.current!.addEventListener("canplay", () => {
            this.previewRef!.current!.play();
        });
        this.updateMedia();
        window.addEventListener("resize", () => {
            this.windowSize.height = window.innerHeight;
            this.windowSize.width = window.innerWidth;
        });
    }

    componentDidUpdate(): void {
        this.updateMedia();
    }

    render() {
        const participants: ParticipantInformation[] = ParticipantsStore.getLiving()
            .filter(participant => participant.mediaState.microphoneEnabled || participant.mediaState.cameraEnabled);

        return (
            <div ref={this.containerRef} className={"video-container"}>

                <div className={"preview-video"} hidden={!MyInfo.info?.mediaState.cameraEnabled}>
                    <video ref={this.previewRef}/>
                </div>

                <div className={"videos-list-wrapper"}>
                    {ParticipantsStore.participants.length > 3 ?
                        participants
                            .map((participant, i, arr) => {
                                if (participant.mediaState.cameraEnabled) {
                                    return <VideoParticipant flexBasis={this.state.basis} maxWidth={this.state.maxWidth}
                                                             key={participant.id}
                                                             participant={participant}/>
                                } else {
                                    return <AudioParticipant flexBasis={this.state.basis} key={participant.id}
                                                             participant={participant}/>
                                }
                            })
                        : <VideoPlaceholder/>
                    }
                </div>
            </div>
        );
    }
}
