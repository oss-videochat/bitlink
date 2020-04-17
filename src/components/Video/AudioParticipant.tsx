import React from 'react';
import './AudioParticipant.css';

export class AudioParticipant extends React.Component<any, any> {
    private audioRef: any = React.createRef();

    constructor(props: any) {
        super(props);
    }

    componentDidMount(): void {
        this.audioRef.current.addEventListener("canplay", () => {
            this.audioRef.current.play();
        });
        this.audioRef.current.srcObject = new MediaStream([this.props.participant.mediasoup.consumer.audio.track]);
    }


    render() {
        return (
            <div className={"video-participant-wrapper"}>
                <audio ref={this.audioRef} className={"video-participant--audio"}/>
                <span className={"audio-participant--name"}>{this.props.participant.name}</span>
            </div>
        );
    }
}
