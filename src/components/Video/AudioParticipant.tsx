import React from 'react';
import './AudioParticipant.css';

import {observer} from 'mobx-react';

@observer
export class AudioParticipant extends React.Component<any, any> {
    private audioRef: any = React.createRef();

    constructor(props: any) {
        super(props);
    }

    componentDidMount(): void {
        this.audioRef.current.addEventListener("canplay", () => {
            this.audioRef.current.play().catch(console.error);
        });
        this.audioRef.current.srcObject = new MediaStream([this.props.participant.mediasoup.consumer.audio.track]);
    }


    render() {
        return (
            <div className={"video-participant-wrapper audio video-pad"} style={{"flexBasis": this.props.flexBasis}}>
                <div className={"audio-participant--spacer"}>
                    <span className={"audio-participant--name"}>{this.props.participant.name}</span>
                </div>
                <audio ref={this.audioRef} autoPlay={true} className={"video-participant--audio"}/>
            </div>
        );
    }
}
