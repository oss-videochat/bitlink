import React, {RefObject} from 'react';
import './VideoParticipant.css';
import MyInfo from "../../stores/MyInfo";

import {autorun} from 'mobx';

export class VideoParticipant extends React.Component<any, any> {
    private videoRef: RefObject<HTMLVideoElement> = React.createRef();
    private audioRef: RefObject<HTMLVideoElement> = React.createRef();
    private oldTrackId = {
        video: null,
        audio: null
    };

    constructor(props: any) {
        super(props);
    }

    async componentDidMount() {
        this.videoRef.current!.addEventListener("canplay", () => {
            this.videoRef.current!.play();
        });
        this.audioRef.current!.addEventListener("canplay", () => {
            this.audioRef.current!.play();
        });
        this.updateMedia();
    }



    updateMedia () {
        this.videoRef.current!.srcObject = new MediaStream([this.props.participant.mediasoup.consumer.video.track]);

        if (this.props.participant.mediaState.microphoneEnabled) {
            this.audioRef.current!.srcObject = new MediaStream([this.props.participant.mediasoup.consumer.audio.track]);
        }
    };



    componentDidUpdate(): void { // TODO this is horribleish. Probably a better way to do this. Basically reinventing React's componentShouldUpdate but with a custom method and custom state tracking. Pretty crappy if you ask me.
       if(this.oldTrackId.video !== this.props.participant.mediasoup.consumer.video.track.id
           || this.oldTrackId.audio !== this.props.participant.mediasoup.consumer.audio?.track.id
       ) {
           this.oldTrackId.video = this.props.participant.mediasoup.consumer.video.track.id;
           this.oldTrackId.audio = this.props.participant.mediasoup.consumer.audio?.track.id;
           this.updateMedia();
       }
    }


    render() {
        return (
            <div className={"video-pad"} style={{flexBasis: this.props.flexBasis, maxWidth: this.props.maxWidth}}>
                <div className={"video-participant-wrapper"}>
                    <video autoPlay={true} playsInline={true}  muted={true} ref={this.videoRef} className={"video-participant--video"}/>
                    <audio autoPlay={true} ref={this.audioRef} className={"video-participant--audio"}/>
                    <span className={"video-participant--name"}>{this.props.participant.name}</span>
                </div>
            </div>
        );
    }
}
