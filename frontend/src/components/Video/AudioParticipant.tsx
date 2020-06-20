import React from 'react';
import './AudioParticipant.css';

import {observer} from 'mobx-react';
import {AutoPlayAudio} from "./AutoPlayAudio";

@observer
export class AudioParticipant extends React.Component<any, any> {
    private audioRef: any = React.createRef();

    constructor(props: any) {
        super(props);
    }


    render() {
        return (
            <div className={"video-participant-wrapper audio video-pad"} style={{"flexBasis": this.props.flexBasis}}>
                <div className={"audio-participant--spacer"}>
                    <span className={"audio-participant--name"}>{this.props.participant.name}</span>
                </div>
                <AutoPlayAudio srcObject={new MediaStream([this.props.participant.mediasoup.consumer.audio.track])}/>
            </div>
        );
    }
}
