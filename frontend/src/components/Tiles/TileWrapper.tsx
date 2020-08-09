import React from 'react';
import './TileWrapper.css';
import Participant from "../../models/Participant";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faThumbtack} from "@fortawesome/free-solid-svg-icons";

export interface ITileProps {
    participant: Participant,
}

interface TileWrapperProps {
    flexBasis: string,
    maxWidth: string,
    onPin: () => void
}

export const TileWrapper: React.FunctionComponent<TileWrapperProps> = ({flexBasis, maxWidth, onPin,  children}) => {

    return (
        <div className={"tile-wrapper"} style={{flexBasis, maxWidth}}>
            <div className={"tile-aspect-ratio-wrapper"}>
                <div className={"tile-hover-menu-wrapper"}>
                    <div className={"tile-hover-menu"}>
                        <span onClick={onPin}><FontAwesomeIcon icon={faThumbtack}/></span>
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
}
