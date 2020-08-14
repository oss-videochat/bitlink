import React, { useEffect, useRef } from "react";
import "./VideoTile.css";
import "./ScreenTile.css";
import { ITileProps } from "../TileContainer/TileContainer";
import { useObserver } from "mobx-react";

const ScreenTile: React.FunctionComponent<ITileProps> = ({ participant }) => {
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

    videoRef.current.srcObject = new MediaStream([participant.consumers.screen!.track]);

    return () => element.removeEventListener("canplay", canplay);
  }, [videoRef, participant]);

  return useObserver(() => (
    <>
      <video
        autoPlay={true}
        playsInline={true}
        muted={true}
        ref={videoRef}
        className={"screen-participant--video"}
      />
      <span className={"video-participant--name"}>{participant.info.name}'s Screen</span>
    </>
  ));
};
export default ScreenTile;
