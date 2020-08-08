import React from 'react';
import './TileWrapper.css';
import Participant from "../../models/Participant";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMapPin} from "@fortawesome/free-solid-svg-icons";

export interface ITileProps {
    participant: Participant,
}

interface TileWrapperProps {
    flexBasis: string,
    maxWidth: string
}

export const TileWrapper: React.FunctionComponent<TileWrapperProps> = ({flexBasis, maxWidth, children}) => {
    return (
        <div className={"tile-wrapper"} style={{flexBasis, maxWidth}}>
            <div className={"tile-aspect-ratio-wrapper"}>
                <div className={"tile-hover-menu"}>
                    <FontAwesomeIcon icon={faMapPin}/>
                </div>
                {children}
            </div>
        </div>
    );
}
