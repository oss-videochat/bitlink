import React, {RefObject} from 'react';
import './VideoParticipant.css';
import {observer} from 'mobx-react';
import {reaction} from 'mobx';
import {AutoPlayAudio} from "./AutoPlayAudio";

@observer
export class ScreenParticipant extends React.Component<any, any> {
    private videoRef: RefObject<HTMLVideoElement> = React.createRef();

    componentDidMount() {
        this.videoRef.current!.addEventListener("canplay", () => {
            this.videoRef.current?.play().catch(e => console.error(e.toString()));
        });
        this.updateMedia();
    }


    updateMedia() {
        this.videoRef.current!.srcObject = new MediaStream([this.props.participant.mediasoup.consumer.screen.track]);
    };

    render() {
        return (
            <div className={"video-pad"} style={{flexBasis: this.props.flexBasis, maxWidth: this.props.maxWidth}}>
                <div className={"video-participant-wrapper"}>
                    <video autoPlay={true} playsInline={true} muted={true} ref={this.videoRef}
                           className={"video-participant--video"}/>
                    <span className={"video-participant--name"}>{this.props.participant.name}'s Screen</span>
                </div>
            </div>
        );
    }
}
