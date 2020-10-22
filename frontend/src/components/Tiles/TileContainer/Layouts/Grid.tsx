import React from "react";
import { useObserver } from "mobx-react";
import { TileWrapper } from "../../TileTypes/Util/TileWrapper";
import VideoTile from "../../TileTypes/VideoTile";
import AudioTile from "../../TileTypes/AudioTile";
import ScreenTile from "../../TileTypes/ScreenTile";
import Participant from "../../../../models/Participant";
import ParticipantService from "../../../../services/ParticipantService";
import UIStore from "../../../../stores/UIStore";
import { TileDisplayMode } from "../../../../enum/TileDisplayMode";
import { useLayoutCalculation } from "../../../../hooks/useLayoutCalculation";
import { TileMenuItem } from "../../TileTypes/Util/TileMenuItem";
import { VolumeSlider } from "../VolumeSlider/VolumeSlider";

interface GridProps {
    container: React.RefObject<HTMLDivElement>;
}

export const Grid: React.FunctionComponent<GridProps> = ({ container }) => {
    const styles = useLayoutCalculation(() => {
        const living = ParticipantService.getLiving(true);
        return (
            living.filter((participant) => participant.hasAudio || participant.hasVideo).length +
            living.filter((participant) => participant.hasScreen).length
        );
    }, container);

    return useObserver(() => {
        const participantsLiving: Participant[] = ParticipantService.getLiving();
        const participantsMedia = participantsLiving.filter(
            (participant) => participant.hasAudio || participant.hasVideo
        );
        const participantsScreen = participantsLiving.filter(
            (participant) => participant.hasScreen
        );

        return (
            <>
                {participantsMedia.map((participant, i, arr) => (
                    <TileWrapper
                        menuItems={[
                            <TileMenuItem
                                onClick={() =>
                                    (UIStore.store.layout = {
                                        mode: TileDisplayMode.PINNED_PARTICIPANT,
                                        participant,
                                    })
                                }
                            >
                                Pin
                            </TileMenuItem>,
                            participant.hasAudio && <VolumeSlider participant={participant} />,
                        ]}
                        key={participant.info.id + participant.hasVideo}
                        style={styles}
                    >
                        {participant.hasVideo ? (
                            <VideoTile participant={participant} />
                        ) : (
                            <AudioTile participant={participant} />
                        )}
                    </TileWrapper>
                ))}
                {participantsScreen.map((participant) => (
                    <TileWrapper
                        menuItems={[
                            <TileMenuItem
                                onClick={() =>
                                    (UIStore.store.layout = {
                                        mode: TileDisplayMode.PINNED_SCREEN,
                                        participant,
                                    })
                                }
                            >
                                Pin
                            </TileMenuItem>,
                        ]}
                        key={participant.info.id + participant.hasVideo}
                        style={styles}
                    >
                        <ScreenTile participant={participant} />
                    </TileWrapper>
                ))}
            </>
        );
    });
};
