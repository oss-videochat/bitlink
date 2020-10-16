import React, { useState } from "react";
import UIStore from "../../../../stores/UIStore";
import VideoTile from "../../TileTypes/VideoTile";
import { TileWrapper } from "../../TileTypes/Util/TileWrapper";
import { useObserver } from "mobx-react";
import ScreenTile from "../../TileTypes/ScreenTile";
import "./PinnedScreen.css";
import { TileDisplayMode } from "../../../../enum/TileDisplayMode";
import { useLayoutCalculation } from "../../../../hooks/useLayoutCalculation";
import { TileMenuItem } from "../../TileTypes/Util/TileMenuItem";

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

        const parentMenuItems = [
            <TileMenuItem
                onClick={() =>
                    (UIStore.store.layout = { mode: TileDisplayMode.GRID, participant: null })
                }
            >
                Unpin
            </TileMenuItem>,
        ];

        const childMenu = [];

        if (forceHideCamera) {
            parentMenuItems.push(
                <TileMenuItem onClick={() => setForceHideCamera(false)}>Show Camera</TileMenuItem>
            );
        } else {
            parentMenuItems.push(
                <TileMenuItem onClick={() => setForceHideCamera(true)}>Hide Camera</TileMenuItem>
            );
            childMenu.push(
                <TileMenuItem onClick={() => setForceHideCamera(true)}>Hide Camera</TileMenuItem>
            );
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
                </>
            </TileWrapper>
        );
    });
};
