import React from "react";
import Participant from "../../../models/Participant";
import ParticipantService from "../../../services/ParticipantService";
import { useObserver } from "mobx-react";
import AutoPlayAudio from "../TileTypes/Util/AutoPlayAudio";

/*
For the Grid layout, we embed the audio elements in the individual Tile elements, but for Pinned layouts, those
Tile's aren't displayed (except for the pinned one) so the audio isn't gonna play. Instead of adding yet another audio
bug, we simply include this element that goes through and adds any audio elements that we need to
*/

interface AudioFillerProps {
    exclusionList: Participant[];
}

export const AudioFiller: React.FunctionComponent<AudioFillerProps> = ({ exclusionList }) => {
    if (!exclusionList) {
        exclusionList = [];
    }
    return useObserver(() => {
        const living = ParticipantService.getLiving(true);
        const participants = living.filter(
            (participant) => participant.hasAudio && !exclusionList!.includes(participant)
        );

        return (
            <>
                {participants.map((participant) => (
                    <AutoPlayAudio
                        key={participant.info.id}
                        volume={participant.volume}
                        srcObject={new MediaStream([participant.consumers.microphone!.track])}
                    />
                ))}
            </>
        );
    });
};
