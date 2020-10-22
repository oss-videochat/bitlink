import React from "react";
import UIStore from "../../../../stores/UIStore";
import VideoTile from "../../TileTypes/VideoTile";
import AudioTile from "../../TileTypes/AudioTile";
import { TileWrapper } from "../../TileTypes/Util/TileWrapper";
import { useObserver } from "mobx-react";
import { TileDisplayMode } from "../../../../enum/TileDisplayMode";
import { useLayoutCalculation } from "../../../../hooks/useLayoutCalculation";
import { TileMenuItem } from "../../TileTypes/Util/TileMenuItem";
import { VolumeSlider } from "../VolumeSlider/VolumeSlider";

interface PinnedParticipantProps {
    container: React.RefObject<HTMLDivElement>;
}

export const PinnedParticipant: React.FunctionComponent<PinnedParticipantProps> = ({
    container,
}) => {
    const styles = useLayoutCalculation(1, container);
    return useObserver(() => {
        if (
            !UIStore.store.layout.participant!.hasVideo &&
            !UIStore.store.layout.participant!.hasAudio
        ) {
            return null;
        }
        return (
            <TileWrapper
                menuItems={[
                    <TileMenuItem
                        onClick={() =>
                            (UIStore.store.layout = {
                                mode: TileDisplayMode.GRID,
                                participant: null,
                            })
                        }
                    >
                        Unpin
                    </TileMenuItem>,
                    UIStore.store.layout.participant!.hasAudio && (
                        <VolumeSlider participant={UIStore.store.layout.participant!} />
                    ),
                ]}
                style={styles}
            >
                {UIStore.store.layout.participant!.hasVideo ? (
                    <VideoTile participant={UIStore.store.layout.participant!} />
                ) : (
                    <AudioTile participant={UIStore.store.layout.participant!} />
                )}
            </TileWrapper>
        );
    });
};
