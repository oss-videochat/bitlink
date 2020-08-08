import React from 'react';
import './AudioTile.css';
import {useObserver} from 'mobx-react';
import AutoPlayAudio from "../AutoPlayAudio";
import {ITileProps} from "../TileWrapper";

const AudioTile: React.FunctionComponent<ITileProps> = ({participant}) => useObserver(() => (
        <div className={"audio-wrapper"}>
                <span className={"audio-participant--name"}>{participant.info.name}</span>
            <AutoPlayAudio srcObject={new MediaStream([participant.consumers.microphone!.track])}/>
        </div>
    )
)
export default AudioTile;
