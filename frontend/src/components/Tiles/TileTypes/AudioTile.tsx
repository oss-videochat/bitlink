import React from "react";
import "./AudioTile.css";
import { useObserver } from "mobx-react";
import AutoPlayAudio from "./Util/AutoPlayAudio";
import { ITileProps } from "../TileContainer/TileContainer";

const AudioTile: React.FunctionComponent<ITileProps> = ({ participant }) =>
    useObserver(() => (
        <div className={"audio-wrapper"}>
            <span className={"audio-participant--name"}>{participant.info.name}</span>
            <AutoPlayAudio srcObject={new MediaStream([participant.consumers.microphone!.track])} />
        </div>
    ));
export default AudioTile;
