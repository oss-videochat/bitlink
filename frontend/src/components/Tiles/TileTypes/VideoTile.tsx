import React, { useEffect, useRef } from "react";
import "./VideoTile.css";
import { useObserver } from "mobx-react";
import { autorun } from "mobx";
import { ITileProps } from "../TileContainer/TileContainer";

const VideoTile: React.FunctionComponent<ITileProps> = ({ participant }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!videoRef.current) {
            return;
        }
        const element = videoRef.current;

        function canplay() {
            element.play().catch((e) => console.error(e.toString()));
        }

        element.addEventListener("canplay", canplay);
        return () => element.removeEventListener("canplay", canplay);
    }, [videoRef]);

    useEffect(() => {
        return autorun(() => {
            if (!videoRef.current) {
                return;
            }
            videoRef.current.srcObject = new MediaStream([participant.consumers.camera!.track]);
        });
    }, [participant]);

    return useObserver(() => (
        <>
            <video
                autoPlay={true}
                playsInline={true}
                muted={true}
                ref={videoRef}
                className={"video-participant--video"}
            />
            <span className={"video-participant--name"}>{participant.info.name}</span>
        </>
    ));
};
export default VideoTile;
