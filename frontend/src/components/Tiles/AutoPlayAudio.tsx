/*

This bypasses the autoplay block on iOS so we can autoplay audio when someone joins the room. HTML Video elements are
allowed to be autoplayed as long as they are inline and muted. Audio elements can ONLY be played on user interaction or
pragmatically after after user interaction.  What we do here is prepare 100 HTML Audio elements (`prepareAudioBank()`)
by playing and pausing them on a user interaction event, specifically the click event of "Create Room" or "Join Room"
buttons. Once they are prepared we can play them any time we want. The React component removes an audio element from the
`audioBank` and uses it. Once it's done with it, it puts it back in the audioBank to be used again. This means we can
technically only have 100 participant's at once (`Array.from({length: 100})`) but this can easily be increased. Ssshhh
don't tell the nonexistent marketing team.
 */

import React, {useEffect, useRef} from 'react';

const audioBank: HTMLAudioElement[] = Array.from({length: 100}, el => document.createElement('audio') as unknown as HTMLAudioElement);
let prepared = false;

export function prepareAudioBank() {
    if (prepared) {
        return;
    }

    audioBank.forEach((audioElement: HTMLAudioElement) => {
        try {
            audioElement.play().catch(() => {
                // this will defiantly error, but that's ok
            });
            audioElement.pause()
        } catch (e) {
            console.error("uh oh")
        }
    });

    prepared = true;
}

interface IAutoPlayAudioProps {
    srcObject?: MediaStream
}

const AutoPlayAudio: React.FunctionComponent<IAutoPlayAudioProps> = ({srcObject}) => {
    const audioElement = useRef<HTMLAudioElement>(audioBank.pop() || document.createElement("audio")); // if the bank runs out, we just create another audio element. This will work for non-mobile/non-ios devices. But for those devices, we kind of screw them over here.

    useEffect(() => {
        if (!prepared) {
            throw 'Audios are not prepared';
        }
        audioElement.current.addEventListener("canplay", () => {
            return audioElement.current.play();
        });

        if (srcObject) {
            audioElement.current.srcObject = srcObject;
        }
        return () => {
            audioElement.current.pause();
            audioElement.current.srcObject = null;
            audioBank.push(audioElement.current); // recycling is good for the owlrd
        }
    }, [srcObject]);

    return <div ref={(el) => el && el.appendChild(audioElement.current)}/>;
}
export default AutoPlayAudio;
