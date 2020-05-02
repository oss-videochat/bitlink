import React from 'react';

const audioBank: HTMLAudioElement[] = Array.from({length: 100}, el => document.createElement('audio') as unknown as HTMLAudioElement);
let prepared = false;

export function prepareAudioBank() {
    if (prepared) {
        return;
    }

    audioBank.forEach((audioElement: HTMLAudioElement) => {
        audioElement.play();
        audioElement.pause()
    });

    prepared = true;
}

export class AutoPlayAudio extends React.Component<any, any> {
    private audioElement: HTMLAudioElement = audioBank.pop()!;

    constructor(props: any) {
        super(props);
        if (!prepared) {
            throw 'Audios are not prepared';
        }
        this.audioElement.addEventListener("canplay", () => {
            return this.audioElement.play();
        });
        if (this.props.srcObject) {
            this.audioElement.srcObject = this.props.srcObject;
        }
    }

    componentDidUpdate() {
        this.audioElement.srcObject = this.props.srcObject;
    }

    componentWillUnmount() {
        this.audioElement.pause();
        this.audioElement.srcObject = null;
        audioBank.push(this.audioElement);
    }

    render() {
        return <div ref={(el) => el && el.appendChild(this.audioElement)}/>;
    }
}
