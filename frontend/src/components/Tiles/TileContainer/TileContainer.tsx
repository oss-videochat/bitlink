import React, {useEffect, useRef, useState} from 'react';
import {useObserver} from "mobx-react"
import {reaction} from "mobx"
import './TileContainer.css';
import ParticipantsStore from "../../../stores/ParticipantsStore";
import VideoTile from "../TileTypes/VideoTile";
import AudioTile from "../TileTypes/AudioTile";
import TilePlaceholder from "../TileTypes/TilePlaceholder";
import MyInfo from "../../../stores/MyInfoStore";
import UIStore from "../../../stores/UIStore";
import {LayoutSizeCalculation} from "../../../util/layout/LayoutSizeCalculation";
import Participant from "../../../models/Participant";
import RoomStore from "../../../stores/RoomStore";
import ScreenTile from "../TileTypes/ScreenTile";
import ParticipantService from "../../../services/ParticipantService";
import {TileWrapper} from "../TileTypes/Util/TileWrapper";
import {TileDisplayMode} from "../../../enum/TileDisplayMode";
import {PreviewBox} from "./PreviewBox";
import {ControlBar} from "./ControlBar/ControlBar";

interface ViewConfiguration {
    mode: TileDisplayMode,
    data: null | { participant: Participant }
}

export interface ITileProps {
    participant: Participant,
}

export const TileContainer: React.FunctionComponent = () => {
    const [windowSize, setWindowSize] = useState({
        height: window.innerHeight,
        width: window.innerWidth
    });

    const [basis, setBasis] = useState("0");
    const [maxWidth, setMaxWidth] = useState("0");
    const containerRef = useRef<HTMLDivElement>(null);
    const [viewConfiguration, setViewConfiguration] = useState<ViewConfiguration>({
        mode: TileDisplayMode.GRID,
        data: null
    });

    useEffect(() => {
        function handleResize() {
            setWindowSize({
                height: window.innerHeight,
                width: window.innerWidth
            });
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        return reaction(() => {
            let numSquares;
            if (viewConfiguration.mode === TileDisplayMode.GRID) {
                const living = ParticipantService.getLiving(true);
                numSquares = living.filter(participant => participant.hasAudio || participant.hasVideo).length + living.filter(participant => participant.hasScreen).length;
            } else {
                numSquares = 1;
            }

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
    }, [windowSize, viewConfiguration]);

    function onPin(participant: Participant) {
        return () => {
            setViewConfiguration(
                isPinned(participant) ? {
                    mode: TileDisplayMode.GRID,
                    data: null
                } : {
                    mode: TileDisplayMode.PINNED_PARTICIPANT,
                    data: {participant: participant}
                }
            );
        }
    }

    function onPinScreen(participant: Participant) {
        return () => {
            setViewConfiguration(
                isPinned(participant) ? {
                    mode: TileDisplayMode.GRID,
                    data: null
                } : {
                    mode: TileDisplayMode.PINNED_SCREEN,
                    data: {participant: participant}
                }
            );
        }
    }

    function isPinned(participant: Participant) {
        return viewConfiguration.data?.participant === participant;
    }


    return useObserver(() => {
        if (viewConfiguration.mode === TileDisplayMode.PINNED_PARTICIPANT && (!viewConfiguration.data!.participant.hasVideo && !viewConfiguration.data!.participant.hasAudio)) {
            setViewConfiguration({mode: TileDisplayMode.GRID, data: null});
            return null;
        }
        if (viewConfiguration.mode === TileDisplayMode.PINNED_SCREEN && !viewConfiguration.data!.participant.hasScreen) {
            setViewConfiguration({mode: TileDisplayMode.GRID, data: null});
            return null;
        }

        const participantsLiving: Participant[] = ParticipantService.getLiving();

        let tiles: React.ReactNode;

        switch (viewConfiguration.mode) {
            case TileDisplayMode.GRID: {
                const participantsMedia = participantsLiving.filter(participant => participant.hasAudio || participant.hasVideo);
                const participantsScreen = participantsLiving.filter(participant => participant.hasScreen);

                tiles = [
                    ...participantsMedia.map((participant, i, arr) => (
                        <TileWrapper pinned={isPinned(participant)} onPinToggle={onPin(participant)}
                                     key={participant.info.id + participant.hasVideo} flexBasis={basis}
                                     maxWidth={maxWidth}>
                            {participant.hasVideo ?
                                <VideoTile participant={participant}/>
                                : <AudioTile participant={participant}/>
                            }
                        </TileWrapper>
                    )),
                    ...participantsScreen.map(participant => (
                        <TileWrapper pinned={isPinned(participant)} onPinToggle={onPinScreen(participant)}
                                     key={participant.info.id + participant.hasVideo} flexBasis={basis}
                                     maxWidth={maxWidth}>
                            <ScreenTile participant={participant}/>
                        </TileWrapper>
                    ))
                ];
                break;
            }
            case TileDisplayMode.PINNED_PARTICIPANT:
                tiles = (
                    <TileWrapper pinned={isPinned(viewConfiguration.data!.participant)}
                                 onPinToggle={onPin(viewConfiguration.data!.participant)} flexBasis={basis}
                                 maxWidth={maxWidth}>
                        {viewConfiguration.data!.participant.hasVideo ?
                            <VideoTile participant={viewConfiguration.data!.participant}/>
                            : <AudioTile participant={viewConfiguration.data!.participant}/>
                        }
                    </TileWrapper>
                );
                break;
            case TileDisplayMode.PINNED_SCREEN: {
                tiles = (
                    <TileWrapper pinned={isPinned(viewConfiguration.data!.participant)}
                                 onPinToggle={onPinScreen(viewConfiguration.data!.participant)} flexBasis={basis}
                                 maxWidth={maxWidth}>
                        <>
                            <ScreenTile participant={viewConfiguration.data!.participant}/>
                            {viewConfiguration.data!.participant.hasVideo && parseInt(basis.replace("px", "")) > 500 &&
                            <div className={"screen-hover-camera"}>
                                <TileWrapper pinned={isPinned(viewConfiguration.data!.participant)}
                                             onPinToggle={onPin(viewConfiguration.data!.participant)} flexBasis={"100%"}
                                             maxWidth={"100%"}>
                                    <VideoTile participant={viewConfiguration.data!.participant}/>
                                </TileWrapper>
                            </div>
                            }
                        </>
                    </TileWrapper>
                );
                break;
            }
        }
        return (
            <div ref={containerRef} className={"video-container"}>
                {
                    MyInfo.participant?.mediaState.screen &&
                    <div className={"screen-sharing-warning"}>
                        <span>You are sharing your screen</span>
                    </div>
                }
                {
                    MyInfo.participant?.mediaState.camera &&
                    <div data-private={""} className={"preview-video"}>
                        <PreviewBox/>
                    </div>
                }
                {
                    RoomStore.info &&
                    <ControlBar/>
                }
                <div data-private={""} className={"videos-list-wrapper"}>
                    {ParticipantsStore.participants.length > 1 ? // if your alone display the placeholder
                        tiles
                        : <TilePlaceholder/>
                    }
                </div>
            </div>
        );
    })
}
