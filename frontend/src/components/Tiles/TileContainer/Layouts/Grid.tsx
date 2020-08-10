import React, {useEffect, useState} from 'react';
import {useObserver} from 'mobx-react';
import {TileWrapper} from "../../TileTypes/Util/TileWrapper";
import VideoTile from "../../TileTypes/VideoTile";
import AudioTile from "../../TileTypes/AudioTile";
import ScreenTile from "../../TileTypes/ScreenTile";
import Participant from "../../../../models/Participant";
import ParticipantService from "../../../../services/ParticipantService";
import {reaction} from "mobx";
import UIStore from "../../../../stores/UIStore";
import {LayoutSizeCalculation} from "../../../../util/layout/LayoutSizeCalculation";
import {TileDisplayMode} from "../../../../enum/TileDisplayMode";

interface GridProps {
    container: React.RefObject<HTMLDivElement>
}


export const Grid: React.FunctionComponent<GridProps> = ({container}) => {
    const [windowSize, setWindowSize] = useState({
        height: window.innerHeight,
        width: window.innerWidth
    });

    const [flexBasis, setBasis] = useState("0");
    const [maxWidth, setMaxWidth] = useState("0");

    useEffect(() => {
        function handleResize() {
            setWindowSize({
                height: window.innerHeight,
                width: window.innerWidth
            });
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);


    useEffect(() => {
        return reaction(() => {
            let numSquares;
            const living = ParticipantService.getLiving(true);
            numSquares = living.filter(participant => participant.hasAudio || participant.hasVideo).length + living.filter(participant => participant.hasScreen).length;

            return {
                mode: UIStore.store.layout.mode,
                chatPanel: UIStore.store.chatPanel,
                numSquares
            }

        }, (data) => {
            if (!container.current) {
                return;
            }
            const divWidth = UIStore.store.chatPanel ? windowSize.width - 450 : windowSize.width; // there's an animation with the chat panel so we need to figure out how large the div will be post animation
            const result = LayoutSizeCalculation(divWidth, container.current.offsetHeight, data.numSquares);
            setBasis(result.basis);
            setMaxWidth(result.maxWidth);
        }, {fireImmediately: true});
    }, [windowSize, container]);

    return useObserver(() => {
        const participantsLiving: Participant[] = ParticipantService.getLiving();
        const participantsMedia = participantsLiving.filter(participant => participant.hasAudio || participant.hasVideo);
        const participantsScreen = participantsLiving.filter(participant => participant.hasScreen);

        return (
            <>
                {
                    participantsMedia.map((participant, i, arr) => (
                        <TileWrapper menuItems={[{
                            title: "Pin",
                            toggle: () => UIStore.store.layout = {mode: TileDisplayMode.PINNED_PARTICIPANT, participant}
                        }]}
                                     key={participant.info.id + participant.hasVideo} style={{flexBasis, maxWidth}}>
                            {participant.hasVideo ?
                                <VideoTile participant={participant}/>
                                : <AudioTile participant={participant}/>
                            }
                        </TileWrapper>
                    ))
                }
                {
                    participantsScreen.map(participant => (
                        <TileWrapper menuItems={[{
                            title: "Pin",
                            toggle: () => UIStore.store.layout = {mode: TileDisplayMode.PINNED_SCREEN, participant}
                        }]} key={participant.info.id + participant.hasVideo} style={{flexBasis, maxWidth}}>
                            <ScreenTile participant={participant}/>
                        </TileWrapper>
                    ))
                }
            </>
        );
    });
}
