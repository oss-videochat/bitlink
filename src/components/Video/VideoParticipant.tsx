import React, {RefObject} from 'react';
import './VideoParticipant.css';
import MyInfo from "../../stores/MyInfo";

export class VideoParticipant extends React.Component<any, any> {
    private videoRef: RefObject<HTMLVideoElement> = React.createRef();
    private audioRef: RefObject<HTMLVideoElement> = React.createRef();

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

    updateMedia(){
        this.videoRef.current!.srcObject = new MediaStream([this.props.participant.mediasoup.consumer.video.track]);

        if (this.props.participant.mediaState.microphoneEnabled) {
            this.audioRef.current!.srcObject = new MediaStream([this.props.participant.mediasoup.consumer.audio.track]);
        }
    }

    componentDidUpdate(): void {
        this.updateMedia();
    }


    render() {
        return (
            <div className={"video-participant-wrapper"}>
                <video autoPlay={true} ref={this.videoRef} className={"video-participant--video"}/>
                <audio autoPlay={true} ref={this.audioRef} className={"video-participant--audio"}/>
                <span className={"video-participant--name"}>{this.props.participant.name}</span>
            </div>
        );
    }
}
