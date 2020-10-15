import React from "react";
import "./AudioTile.css";
import { useObserver } from "mobx-react";
import { ITileProps } from "../TileContainer/TileContainer";

const AudioTile: React.FunctionComponent<ITileProps> = ({ participant }) =>
    useObserver(() => (
        <div className={"audio-wrapper"}>
            <span className={"audio-participant--name"}>{participant.info.name}</span>
        </div>
    ));
export default AudioTile;
