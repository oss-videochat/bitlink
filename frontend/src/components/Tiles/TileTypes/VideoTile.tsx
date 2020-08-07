import React, {useEffect, useRef, useState} from 'react';
import './VideoTile.css';
import {useObserver} from 'mobx-react';
import {autorun} from 'mobx';
import AutoPlayAudio from "../AutoPlayAudio";
import {ITileProps} from "../TileContainer";


const VideoTile: React.FunctionComponent<ITileProps> = ({participant, flexBasis, maxWidth}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [audioSrcObject, setAudioSrcObject] = useState<MediaStream | null>(null);

    useEffect(() => {
        if (!videoRef.current) {
            return;
        }
        const element = videoRef.current;

        function canplay() {
            element.play().catch(e => console.error(e.toString()));
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

            if (participant.hasAudio) {
                setAudioSrcObject(new MediaStream([participant.consumers.microphone!.track]));
            }
        });
    }, [participant])

    return useObserver(() => (
        <div className={"video-pad"} style={{flexBasis, maxWidth}}>
            <div className={"video-participant-wrapper"}>
                <video autoPlay={true} playsInline={true} muted={true} ref={videoRef}
                       className={"video-participant--video"}/>
                {
                    audioSrcObject &&
                    <AutoPlayAudio srcObject={audioSrcObject}/>
                }
                <span className={"video-participant--name"}>{participant.info.name}</span>
            </div>
        </div>
    ));
}
export default VideoTile;
