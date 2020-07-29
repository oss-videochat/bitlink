import React from 'react';
import {observer} from "mobx-react"
import {observable, reaction} from "mobx"
import './TileContainer.css';
import ParticipantsStore from "../../stores/ParticipantsStore";
import VideoTile from "./VideoTile";
import AudioTile from "./AudioTile";
import TilePlaceholder from "./TilePlaceholder";
import MyInfo from "../../stores/MyInfoStore";
import UIStore from "../../stores/UIStore";
import {LayoutSizeCalculation} from "../../util/layout/LayoutSizeCalculation";
import Participant from "../../models/Participant";
import IO from "../../controllers/IO";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    faDesktop,
    faMicrophone,
    faMicrophoneSlash,
    faPhone,
    faVideo,
    faVideoSlash
} from '@fortawesome/free-solid-svg-icons'
import RoomStore from "../../stores/RoomStore";
import ScreenTile from "./ScreenTile";
import ScreenShareSlash from "./ScreenshareSlash";
import HardwareService from "../../services/HardwareService";
import ParticipantService from "../../services/ParticipantService";

export interface ITileProps {
    flexBasis: string,
    participant: Participant,
    maxWidth: string
}

@observer
export class TileContainer extends React.Component<any, any> {
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
        if (!MyInfo.participant?.mediaState.camera) {
            return;
        }
        const stream = await HardwareService.getStream("camera");
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
            const living = ParticipantService.getLiving(true);
            const numSquares = living.filter(participant => participant.hasAudio || participant.hasVideo).length + living.filter(participant => participant.hasScreen).length;

            return {
                height: this.windowSize.height,
                width: this.windowSize.width,
                chatPanel: UIStore.store.chatPanel,
                numSquares
            }

        }, (data) => {
            const div = this.containerRef.current!;
            const divWidth = UIStore.store.chatPanel ? data.width - 450 : data.width; // there's an animation with the chat panel so we need to figure out how large the div will be post animation
            const result = LayoutSizeCalculation(divWidth, div.offsetHeight, data.numSquares);
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
        const participantsLiving: Participant[] = ParticipantService.getLiving();

        const participantsMedia = participantsLiving.filter(participant => participant.hasAudio || participant.hasVideo);
        const participantsScreen = participantsLiving.filter(participant => participant.hasScreen);

        return (
            <div ref={this.containerRef} className={"video-container"}>
                {
                    MyInfo.participant?.mediaState.screen &&
                    <div className={"screen-sharing-warning"}>
                        <span>You are sharing your screen</span>
                    </div>
                }
                <div data-private={""} className={"preview-video"} hidden={!MyInfo.participant?.mediaState.camera}>
                    <div className={"preview-video-wrapper"}>
                        <video playsInline={true} muted={true} autoPlay={true} ref={this.previewRef}/>
                    </div>
                </div>

                {
                    RoomStore.info ?
                        <div className={"controls-wrapper"}>
                            <span onClick={() => IO.toggleMedia("camera")}>
                                {MyInfo.participant?.mediaState.camera ?
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
                            <span onClick={() => IO.toggleMedia("microphone")}>
                                {MyInfo.participant?.mediaState.microphone ?
                                    <FontAwesomeIcon icon={faMicrophone}/> :
                                    <FontAwesomeIcon icon={faMicrophoneSlash}/>
                                }
                            </span>
                            {window.matchMedia('(max-width: 600px)').matches ?
                                null :
                                <span onClick={() => IO.toggleMedia("screen")}>
                                    {MyInfo.participant?.mediaState.screen ?
                                        <FontAwesomeIcon icon={faDesktop}/> :
                                        <ScreenShareSlash/>
                                    }
                                </span>
                            }
                        </div>
                        : null
                }

                <div data-private={""} className={"videos-list-wrapper"}>
                    {ParticipantsStore.participants.length > 1 ? // if your alone display the placeholder
                        [
                            ...participantsMedia.map((participant, i, arr) => {
                                if (participant.hasVideo) {
                                    return <VideoTile flexBasis={this.state.basis} maxWidth={this.state.maxWidth}
                                                      key={participant.info.id + "videop"}
                                                      participant={participant}/>
                                } else {
                                    return <AudioTile flexBasis={this.state.basis} maxWidth={this.state.maxWidth}
                                                      key={participant.info.id + "audiop"}
                                                      participant={participant}/>
                                }
                            }),
                            ...participantsScreen.map(participant => {
                                    return <ScreenTile flexBasis={this.state.basis} maxWidth={this.state.maxWidth}
                                                       key={participant.info.id + "screenp"}
                                                       participant={participant}/>
                                }
                            )
                        ]
                        : <TilePlaceholder/>
                    }
                </div>
            </div>
        );
    }
}
