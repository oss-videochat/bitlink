import React, {useEffect, useRef} from 'react';
import './VideoTile.css';
import './ScreenTile.css';
import {ITileProps} from "./TileContainer";
import {useObserver} from 'mobx-react';

const ScreenTile: React.FunctionComponent<ITileProps> = ({participant, flexBasis, maxWidth}) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        videoRef.current?.addEventListener("canplay", () => {
            videoRef.current!.play().catch(e => console.error(e.toString()));
        });
        updateMedia();
    }, [])


    function updateMedia() {
        videoRef.current!.srcObject = new MediaStream([participant.mediasoup.consumer.screen!.track]);
    }

    return useObserver(() => (
        <div className={"video-pad"} style={{flexBasis: flexBasis, maxWidth: maxWidth}}>
            <div className={"video-participant-wrapper"}>
                <video autoPlay={true} playsInline={true} muted={true} ref={videoRef}
                       className={"screen-participant--video"}/>
                <span className={"video-participant--name"}>{participant.name}'s Screen</span>
            </div>
        </div>
    ));
}
export default ScreenTile;
