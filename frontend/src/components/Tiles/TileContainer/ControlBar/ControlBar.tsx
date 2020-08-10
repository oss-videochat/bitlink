import React, {useEffect, useState} from 'react';
import './ControlBar.css';
import {when} from "mobx";
import UIStore from "../../../../stores/UIStore";
import IO from "../../../../controllers/IO";
import MyInfo from "../../../../stores/MyInfoStore";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faDesktop,
    faMicrophone,
    faMicrophoneSlash,
    faPhone,
    faVideo,
    faVideoSlash
} from "@fortawesome/free-solid-svg-icons";
import ScreenShareSlash from "./ScreenshareSlash";
import { useObserver } from 'mobx-react';

export const ControlBar: React.FunctionComponent = () => {
    const [forceDisplayControls, setForceDisplayControls] = useState(true);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        const disposer = when(() => !!UIStore.store.joinedDate, () => {
            timeout = setTimeout(() => setForceDisplayControls(false), 5000);
        })
        return () => {
            disposer();
            if (timeout) {
                clearTimeout(timeout)
            }
        }
    }, []);

    return useObserver(() => (
        <div className={"controls-wrapper " + (forceDisplayControls && "force-display")}>
            <span onClick={() => IO.toggleMedia("camera")}>
                {MyInfo.participant?.mediaState.camera ?
                    <FontAwesomeIcon icon={faVideo}/> :
                    <FontAwesomeIcon icon={faVideoSlash}/>
                }
            </span>
            <span onClick={() => IO.toggleMedia("microphone")}>
                {MyInfo.participant?.mediaState.microphone ?
                    <FontAwesomeIcon icon={faMicrophone}/> :
                    <FontAwesomeIcon icon={faMicrophoneSlash}/>
                }
            </span>
            <span className={"controls-wrapper--leave-button"} onClick={() => {
                IO.leave();
            }}>
                <FontAwesomeIcon icon={faPhone}/>
            </span>
            <span onClick={() => IO.toggleMedia("screen")}>
                {MyInfo.participant?.mediaState.screen ?
                    <FontAwesomeIcon icon={faDesktop}/> :
                    <ScreenShareSlash/>
                }
            </span>
        </div>
    ));
}
