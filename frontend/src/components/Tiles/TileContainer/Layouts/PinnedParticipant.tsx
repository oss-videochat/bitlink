import React from 'react';
import UIStore from "../../../../stores/UIStore";
import VideoTile from "../../TileTypes/VideoTile";
import AudioTile from "../../TileTypes/AudioTile";
import {TileWrapper} from "../../TileTypes/Util/TileWrapper";
import { useObserver } from 'mobx-react';
import {TileDisplayMode} from "../../../../enum/TileDisplayMode";
import {AudioFiller} from "../AudioFiller";


export const PinnedParticipant: React.FunctionComponent = () => useObserver(() => {
    if(!UIStore.store.layout.participant!.hasVideo && !UIStore.store.layout.participant!.hasAudio){
        return null;
    }
    return (
        <TileWrapper menuItems={[{
            title: "Unpin",
            toggle: () => UIStore.store.layout = {mode: TileDisplayMode.GRID, participant: null}
        }]}
                     style={{height: "100%", width: "100%"}}>
            {UIStore.store.layout.participant!.hasVideo ?
                <VideoTile participant={UIStore.store.layout.participant!}/>
                : <AudioTile participant={UIStore.store.layout.participant!}/>
            }
            <AudioFiller exclusionList={[UIStore.store.layout.participant!]}/>
        </TileWrapper>
    );
});
