import React, {useRef} from 'react';
import {useObserver} from "mobx-react"
import './TileContainer.css';
import ParticipantsStore from "../../../stores/ParticipantsStore";
import TilePlaceholder from "../TileTypes/TilePlaceholder";
import MyInfo from "../../../stores/MyInfoStore";
import UIStore from "../../../stores/UIStore";
import Participant from "../../../models/Participant";
import RoomStore from "../../../stores/RoomStore";
import {TileDisplayMode} from "../../../enum/TileDisplayMode";
import {PreviewBox} from "./PreviewBox";
import {ControlBar} from "./ControlBar/ControlBar";
import {Grid} from "./Layouts/Grid";
import {PinnedParticipant} from "./Layouts/PinnedParticipant";
import {PinnedScreen} from "./Layouts/PinnedScreen";

export interface ITileProps {
    participant: Participant,
}

export const TileContainer: React.FunctionComponent = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    return useObserver(() => {
        let layout: React.ReactNode;

        if (
            (UIStore.store.layout.mode === TileDisplayMode.PINNED_SCREEN && !UIStore.store.layout.participant!.hasScreen)
            || (UIStore.store.layout.mode === TileDisplayMode.PINNED_PARTICIPANT && !UIStore.store.layout.participant!.hasVideo && !UIStore.store.layout.participant!.hasAudio)
            || (UIStore.store.layout.participant && !UIStore.store.layout.participant.info.isAlive)
        ) {
            UIStore.store.layout = {mode: TileDisplayMode.GRID, participant: null};
        }

        switch (UIStore.store.layout.mode) {
            case TileDisplayMode.GRID: {
                layout = <Grid container={containerRef}/>
                break;
            }
            case TileDisplayMode.PINNED_PARTICIPANT:
                layout = <PinnedParticipant container={containerRef}/>
                break;
            case TileDisplayMode.PINNED_SCREEN: {
                layout = <PinnedScreen container={containerRef}/>
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
                        layout
                        : <TilePlaceholder/>
                    }
                </div>
            </div>
        );
    })
}
