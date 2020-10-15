import React from "react";
import UIStore from "../../../../stores/UIStore";
import VideoTile from "../../TileTypes/VideoTile";
import AudioTile from "../../TileTypes/AudioTile";
import { TileWrapper } from "../../TileTypes/Util/TileWrapper";
import { useObserver } from "mobx-react";
import { TileDisplayMode } from "../../../../enum/TileDisplayMode";
import { AudioFiller } from "../AudioFiller";
import { useLayoutCalculation } from "../../../../hooks/useLayoutCalculation";

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
                    {
                        title: "Unpin",
                        toggle: () =>
                            (UIStore.store.layout = {
                                mode: TileDisplayMode.GRID,
                                participant: null,
                            }),
                    },
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
