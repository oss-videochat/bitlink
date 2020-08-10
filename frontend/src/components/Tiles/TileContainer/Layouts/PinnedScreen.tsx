import React from 'react';
import UIStore from "../../../../stores/UIStore";
import VideoTile from "../../TileTypes/VideoTile";
import {TileWrapper} from "../../TileTypes/Util/TileWrapper";
import {useObserver} from 'mobx-react';
import ScreenTile from "../../TileTypes/ScreenTile";
import './PinnedScreen.css';
import {TileDisplayMode} from "../../../../enum/TileDisplayMode";
import {AudioFiller} from "../AudioFiller";

export const PinnedScreen: React.FunctionComponent = () => useObserver(() => {
    if (!UIStore.store.layout.participant!.hasScreen) {
        return null;
    }
    return (
        <TileWrapper menuItems={[{
            title: "Unpin",
            toggle: () => UIStore.store.layout = {mode: TileDisplayMode.GRID, participant: null}
        }]} style={{height: "100%", width: "100%"}}>
            <>
                <ScreenTile participant={UIStore.store.layout.participant!}/>
                {
                    UIStore.store.layout.participant!.hasVideo
                    && (
                        <div className={"screen-hover-camera"}>
                            <TileWrapper style={{height: "100%", width: "100%"}}>
                                <VideoTile participant={UIStore.store.layout.participant!}/>
                            </TileWrapper>
                        </div>
                    )
                }
                <AudioFiller exclusionList={[UIStore.store.layout.participant!]}/>
            </>
        </TileWrapper>
    );
});
