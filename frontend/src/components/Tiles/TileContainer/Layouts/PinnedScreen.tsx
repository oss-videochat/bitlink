import React, { useState } from "react";
import UIStore from "../../../../stores/UIStore";
import VideoTile from "../../TileTypes/VideoTile";
import { TileMenuItem, TileWrapper } from "../../TileTypes/Util/TileWrapper";
import { useObserver } from "mobx-react";
import ScreenTile from "../../TileTypes/ScreenTile";
import "./PinnedScreen.css";
import { TileDisplayMode } from "../../../../enum/TileDisplayMode";
import { AudioFiller } from "../AudioFiller";
import { useLayoutCalculation } from "../../../../hooks/useLayoutCalculation";

interface PinnedScreenProps {
    container: React.RefObject<HTMLDivElement>;
}

export const PinnedScreen: React.FunctionComponent<PinnedScreenProps> = ({ container }) => {
    const [forceHideCamera, setForceHideCamera] = useState(false);
    const styles = useLayoutCalculation(1, container);

    return useObserver(() => {
        if (!UIStore.store.layout.participant!.hasScreen) {
            return null;
        }

        const parentMenuItems: TileMenuItem[] = [
            {
                title: "Unpin",
                toggle: () =>
                    (UIStore.store.layout = { mode: TileDisplayMode.GRID, participant: null }),
            },
        ];

        const childMenu: TileMenuItem[] = [];

        if (forceHideCamera) {
            parentMenuItems.push({
                title: "Show Camera",
                toggle: () => setForceHideCamera(false),
            });
        } else {
            parentMenuItems.push({
                title: "Hide Camera",
                toggle: () => setForceHideCamera(true),
            });
            childMenu.push({
                title: "Hide Camera",
                toggle: () => setForceHideCamera(true),
            });
        }

        return (
            <TileWrapper menuItems={parentMenuItems} style={styles}>
                <>
                    <ScreenTile participant={UIStore.store.layout.participant!} />
                    {UIStore.store.layout.participant!.hasVideo && !forceHideCamera && (
                        <div className={"screen-hover-camera"}>
                            <TileWrapper
                                menuItems={childMenu}
                                style={{ height: "100%", width: "100%" }}
                            >
                                <VideoTile participant={UIStore.store.layout.participant!} />
                            </TileWrapper>
                        </div>
                    )}
                    <AudioFiller
                        exclusionList={
                            forceHideCamera || !UIStore.store.layout.participant!.hasVideo
                                ? []
                                : [UIStore.store.layout.participant!]
                        }
                    />
                </>
            </TileWrapper>
        );
    });
};
