import React, {useEffect, useState} from 'react';
import './TileWrapper.css';
import Participant from "../../models/Participant";

export interface ITileProps {
    participant: Participant,
}

interface TileWrapperProps {
    flexBasis: string,
    maxWidth: string,
    onPinToggle: () => void,
    pinned: boolean
}

export const TileWrapper: React.FunctionComponent<TileWrapperProps> = ({flexBasis, maxWidth, onPinToggle, pinned, children}) => {
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        setShowMenu(false);
    }, [flexBasis, maxWidth]);

    useEffect(() => {
        function click() {
            setShowMenu(false);
        }
        document.addEventListener("click", click);
        return () => document.removeEventListener("click", click);
    }, []);

    return (
        <div className={"tile-wrapper"} style={{flexBasis, maxWidth}}>
            <div className={"tile-aspect-ratio-wrapper"}>
                <div className={"tile-hover-menu-wrapper"}>
                    <div className={"tile-hover-menu"}>
                        <span onClick={(e) => {
                            e.nativeEvent.stopImmediatePropagation();
                            setShowMenu(!showMenu)
                        }} className={"ellipsis_menu_toggle"}>...</span>
                        {
                            showMenu &&
                            <div className={"ellipsis_menu"}>
                                <span onClick={onPinToggle}>{pinned ? "Unpin" : "Pin"}</span>
                            </div>
                        }
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
}
