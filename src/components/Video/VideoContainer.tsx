import React from 'react';
import {observer} from "mobx-react"
import {observable, reaction} from "mobx"
import './VideoContainer.css';
import ParticipantsStore from "../../stores/ParticipantsStore";
import {VideoParticipant} from "./VideoParticipant";
import {AudioParticipant} from "./AudioParticipant";
import {VideoPlaceholder} from "./VideoPlaceholder";
import MyInfo from "../../stores/MyInfo";
import UIStore from "../../stores/UIStore";
import {LayoutSizeCalculation} from "../../util/LayoutSizeCalculation";
import Participant from "../models/Participant";
import IO from "../../controllers/IO";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faMicrophone, faMicrophoneSlash, faPhone, faVideo, faVideoSlash} from '@fortawesome/free-solid-svg-icons'
import RoomStore from "../../stores/RoomStore";

@observer
export class VideoContainer extends React.Component<any, any> {
    @observable
    windowSize = {
        height: window.innerHeight,
        width: window.innerWidth
    };
    updateMediaListener = reaction(() => {
        return MyInfo.preferredInputs.video;
    }, this.updateMedia.bind(this));
    private previewRef: React.RefObject<HTMLVideoElement> = React.createRef();
    private containerRef: React.RefObject<HTMLDivElement> = React.createRef();
    private updateBasis?: any;

    constructor(props: any) {
        super(props);
        this.state = {
            basis: 0,
            maxWidth: 0,
        };
    }

    async updateMedia() {
        if (!MyInfo.info?.mediaState.cameraEnabled) {
            return;
        }
        const stream = await MyInfo.getStream("video");
        const srcObject: MediaStream | undefined = this.previewRef!.current!.srcObject as MediaStream | undefined;
        if (srcObject?.getVideoTracks()[0].id !== stream.getVideoTracks()[0].id) {
            this.previewRef!.current!.srcObject = stream;
        }
    }

    componentWillUnmount(): void {
        this.updateBasis();
        this.updateMediaListener();
    }

    componentDidMount(): void {
        this.previewRef!.current!.addEventListener("canplay", () => {
            this.previewRef!.current!.play();
        });
        this.updateBasis = reaction(() => {
            return {
                height: this.windowSize.height,
                width: this.windowSize.width,
                chatPanel: UIStore.store.chatPanel,
                numParticipants: ParticipantsStore.getLiving()
                    .filter(participant => participant.hasAudio || participant.hasVideo).length
            }

        }, (data) => {
            const div = this.containerRef.current!;
            const divWidth = UIStore.store.chatPanel ? data.width - 450 : data.width; // there's an animation with the chat panel so we need to figure out how large the div will be post animation
            const result = LayoutSizeCalculation(divWidth, div.offsetHeight, data.numParticipants);
            this.setState({basis: result.basis, maxWidth: result.maxWidth});
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
        const participants: Participant[] = ParticipantsStore.getLiving()
            .filter(participant => participant.hasAudio || participant.hasVideo);

        return (
            <div ref={this.containerRef} className={"video-container"}>

                <div className={"preview-video"} hidden={!MyInfo.info?.mediaState.cameraEnabled}>
                    <div className={"preview-video-wrapper"}>
                        <video playsInline={true} muted={true} autoPlay={true} ref={this.previewRef}/>
                    </div>
                </div>

                {
                    RoomStore.room ?
                        <div className={"controls-wrapper"}>
                    <span onClick={() => IO.toggleVideo()}>
                        {MyInfo.info?.mediaState.cameraEnabled ?
                            <FontAwesomeIcon icon={faVideo}/> :
                            <FontAwesomeIcon icon={faVideoSlash}/>
                        }
                    </span>
                            <span className={"controls-wrapper--leave-button"} onClick={() => {
                                // eslint-disable-next-line no-restricted-globals
                                const confirmed: boolean = confirm("Are you sure you would like to leave this room?");
                                if (confirmed) {
                                    IO.leave();
                                }
                            }}>
                       <FontAwesomeIcon icon={faPhone}/>
                    </span>
                            <span onClick={() => IO.toggleAudio()}>
                        {MyInfo.info?.mediaState.microphoneEnabled ?
                            <FontAwesomeIcon icon={faMicrophone}/> :
                            <FontAwesomeIcon icon={faMicrophoneSlash}/>
                        }
                    </span>
                        </div>
                        : null
                }

                <div className={"videos-list-wrapper"}>
                    {ParticipantsStore.participants.length > 3 ?
                        participants
                            .map((participant, i, arr) => {
                                if (participant.hasVideo) {
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
