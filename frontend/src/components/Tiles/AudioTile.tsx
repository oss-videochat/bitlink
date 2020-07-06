import React from 'react';
import './AudioTile.css';
import {useObserver} from 'mobx-react';
import AutoPlayAudio from "./AutoPlayAudio";
import {ITileProps} from "./TileContainer";

const AudioTile: React.FunctionComponent<ITileProps> = ({flexBasis, participant, maxWidth}) => useObserver(() => (
        <div className={"video-participant-wrapper audio video-pad"} style={{flexBasis, maxWidth}}>
            <div className={"audio-participant--spacer"}>
                <span className={"audio-participant--name"}>{participant.name}</span>
            </div>
            <AutoPlayAudio srcObject={new MediaStream([participant.mediasoup.consumer.microphone!.track])}/>
        </div>
    )
)
export default AudioTile;
