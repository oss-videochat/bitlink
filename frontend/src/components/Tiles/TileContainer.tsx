import React, {useEffect, useRef, useState} from 'react';
import {useObserver} from "mobx-react"
import {reaction, when} from "mobx"
import './TileContainer.css';
import ParticipantsStore from "../../stores/ParticipantsStore";
import VideoTile from "./TileTypes/VideoTile";
import AudioTile from "./TileTypes/AudioTile";
import TilePlaceholder from "./TileTypes/TilePlaceholder";
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
import ScreenTile from "./TileTypes/ScreenTile";
import ScreenShareSlash from "./ScreenshareSlash";
import HardwareService from "../../services/HardwareService";
import ParticipantService from "../../services/ParticipantService";
import StreamEffectStore from "../../stores/StreamEffectStore";

export interface ITileProps {
    flexBasis: string,
    participant: Participant,
    maxWidth: string
}

export const TileContainer: React.FunctionComponent = () => {
    const [windowSize, setWindowSize] = useState({
        height: window.innerHeight,
        width: window.innerWidth
    });

    const [basis, setBasis] = useState("0");
    const [maxWidth, setMaxWidth] = useState("0");
    const [forceDisplayControls, setForceDisplayControls] = useState(true);
    const previewRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        const disposer = when(() => !!UIStore.store.joinedDate, () => {
            timeout = setTimeout(() => setForceDisplayControls(false), 5000);
        })
        return () => {
            disposer();
            if (timeout) {
                clearTimeout(timeout)
            }
        }
    }, []);

    async function updateMedia() {
        if (!MyInfo.participant?.mediaState.camera || !previewRef.current) {
            return;
        }
        const stream = await HardwareService.getStream("camera");
        const srcObject = previewRef.current.srcObject as MediaStream | undefined;
        if (srcObject?.getVideoTracks()[0].id !== stream.getVideoTracks()[0].id) {
            previewRef.current!.srcObject = stream;
        }
    }

    useEffect(() => {
        if (!previewRef.current) {
            return;
        }

        function play() {
            previewRef.current!.play();
        }

        previewRef.current.addEventListener("canplay", play);
        previewRef.current.removeEventListener("canplay", play);
    }, [previewRef]);

    useEffect(() => {
        updateMedia();
    });


    useEffect(() => {
        function handleResize() {
            setWindowSize({
                height: window.innerHeight,
                width: window.innerWidth
            });
        }

        window.addEventListener("resize", handleResize);

        const runner = reaction(() => ({
            video: MyInfo.preferredInputs.video,
            effectRunner: StreamEffectStore.cameraStreamEffectRunner
        }), updateMedia);

        return () => {
            window.removeEventListener("resize", handleResize);
            runner();
        }
    }, []);

    useEffect(() => {
        return reaction(() => {
            const living = ParticipantService.getLiving(true);
            const numSquares = living.filter(participant => participant.hasAudio || participant.hasVideo).length + living.filter(participant => participant.hasScreen).length;

            return {
                chatPanel: UIStore.store.chatPanel,
                numSquares
            }

        }, (data) => {
            if (!containerRef.current) {
                return;
            }
            const div = containerRef.current!;
            const divWidth = UIStore.store.chatPanel ? windowSize.width - 450 : windowSize.width; // there's an animation with the chat panel so we need to figure out how large the div will be post animation
            const result = LayoutSizeCalculation(divWidth, div.offsetHeight, data.numSquares);
            setBasis(result.basis);
            setMaxWidth(result.maxWidth);
        }, {fireImmediately: true});
    }, [windowSize]);


    return useObserver(() => {
        const participantsLiving: Participant[] = ParticipantService.getLiving();

        const participantsMedia = participantsLiving.filter(participant => participant.hasAudio || participant.hasVideo);
        const participantsScreen = participantsLiving.filter(participant => participant.hasScreen);

        return (
            <div ref={containerRef} className={"video-container"}>
                {
                    MyInfo.participant?.mediaState.screen &&
                    <div className={"screen-sharing-warning"}>
                        <span>You are sharing your screen</span>
                    </div>
                }
                <div data-private={""} className={"preview-video"} hidden={!MyInfo.participant?.mediaState.camera}>
                    <div className={"preview-video-wrapper"}>
                        <video playsInline={true} muted={true} autoPlay={true} ref={previewRef}/>
                    </div>
                </div>

                {
                    RoomStore.info &&
                    <div className={"controls-wrapper " + (forceDisplayControls && "force-display")}>
                        <span onClick={() => IO.toggleMedia("camera")}>
                            {MyInfo.participant?.mediaState.camera ?
                                <FontAwesomeIcon icon={faVideo}/> :
                                <FontAwesomeIcon icon={faVideoSlash}/>
                            }
                        </span>
                        <span onClick={() => IO.toggleMedia("microphone")}>
                            {MyInfo.participant?.mediaState.microphone ?
                                <FontAwesomeIcon icon={faMicrophone}/> :
                                <FontAwesomeIcon icon={faMicrophoneSlash}/>
                            }
                        </span>
                        <span className={"controls-wrapper--leave-button"} onClick={() => {
                            IO.leave();
                        }}>
                            <FontAwesomeIcon icon={faPhone}/>
                        </span>
                        <span onClick={() => IO.toggleMedia("screen")}>
                            {MyInfo.participant?.mediaState.screen ?
                                <FontAwesomeIcon icon={faDesktop}/> :
                                <ScreenShareSlash/>
                            }
                        </span>
                    </div>
                }

                <div data-private={""} className={"videos-list-wrapper"}>
                    {ParticipantsStore.participants.length > 1 ? // if your alone display the placeholder
                        [
                            ...participantsMedia.map((participant, i, arr) => {
                                if (participant.hasVideo) {
                                    return <VideoTile flexBasis={basis} maxWidth={maxWidth}
                                                      key={participant.info.id + "videop"}
                                                      participant={participant}/>
                                } else {
                                    return <AudioTile flexBasis={basis} maxWidth={maxWidth}
                                                      key={participant.info.id + "audiop"}
                                                      participant={participant}/>
                                }
                            }),
                            ...participantsScreen.map(participant => {
                                    return <ScreenTile flexBasis={basis} maxWidth={maxWidth}
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
    })
}
