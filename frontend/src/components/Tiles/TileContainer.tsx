import React from 'react';
import {observer} from "mobx-react"
import {observable, reaction} from "mobx"
import './TileContainer.css';
import ParticipantsStore from "../../stores/ParticipantsStore";
import {VideoTile} from "./VideoTile";
import {AudioTile} from "./AudioTile";
import {TilePlaceholder} from "./TilePlaceholder";
import MyInfo from "../../stores/MyInfo";
import UIStore from "../../stores/UIStore";
import {LayoutSizeCalculation} from "../../util/LayoutSizeCalculation";
import Participant from "../models/Participant";
import IO from "../../controllers/IO";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faDesktop, faMicrophone, faMicrophoneSlash, faPhone, faVideo, faVideoSlash} from '@fortawesome/free-solid-svg-icons'
import RoomStore from "../../stores/RoomStore";
import {ScreenTile} from "./ScreenTile";

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
        if (!MyInfo.info?.mediaState.camera) {
            return;
        }
        const stream = await MyInfo.getStream("camera");
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
            const living = ParticipantsStore.getLiving();
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
        const participantsLiving: Participant[] = ParticipantsStore.getLiving();

        const participantsMedia = participantsLiving.filter(participant => participant.hasAudio || participant.hasVideo);
        const participantsScreen = participantsLiving.filter(participant => participant.hasScreen);

        return (
            <div ref={this.containerRef} className={"video-container"}>

                <div data-private={""} className={"preview-video"} hidden={!MyInfo.info?.mediaState.camera}>
                    <div className={"preview-video-wrapper"}>
                        <video playsInline={true} muted={true} autoPlay={true} ref={this.previewRef}/>
                    </div>
                </div>

                {
                    RoomStore.room ?
                        <div className={"controls-wrapper"}>
                            <span onClick={() => IO.toggleMedia("camera")}>
                                {MyInfo.info?.mediaState.camera ?
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
                                {MyInfo.info?.mediaState.microphone ?
                                    <FontAwesomeIcon icon={faMicrophone}/> :
                                    <FontAwesomeIcon icon={faMicrophoneSlash}/>
                                }
                            </span>
                            <span onClick={() => IO.toggleMedia("screen")}>
                                 <FontAwesomeIcon icon={faDesktop}/>
                            </span>
                        </div>
                        : null
                }

                <div data-private={""} className={"videos-list-wrapper"}>
                    {ParticipantsStore.participants.length > 3 ?
                        [
                            ...participantsMedia.map((participant, i, arr) => {
                                if (participant.hasVideo) {
                                    return <VideoTile flexBasis={this.state.basis} maxWidth={this.state.maxWidth}
                                                      key={participant.id + "videop"}
                                                      participant={participant}/>
                                } else {
                                    return <AudioTile flexBasis={this.state.basis} key={participant.id + "audiop"}
                                                      participant={participant}/>
                                }
                            }),
                            ...participantsScreen.map(participant => {
                                return <ScreenTile flexBasis={this.state.basis} maxWidth={this.state.maxWidth}
                                                   key={participant.id + "screenp"}
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
