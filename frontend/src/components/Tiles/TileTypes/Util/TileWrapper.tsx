import React, {CSSProperties, useEffect, useState} from 'react';
import './TileWrapper.css';

export interface TileMenuItem {
    title: string,
    toggle: () => void
}

interface TileWrapperProps {
    style?: CSSProperties,
    menuItems?: TileMenuItem[]
}

export const TileWrapper: React.FunctionComponent<TileWrapperProps> = ({style, menuItems, children}) => {
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        setShowMenu(false);
    }, [style]);

    useEffect(() => {
        function click() {
            setShowMenu(false);
        }
        document.addEventListener("click", click);
        return () => document.removeEventListener("click", click);
    }, []);

    return (
        <div className={"tile-wrapper"} style={style}>
            <div className={"tile-aspect-ratio-wrapper"}>
                <div className={"tile-hover-menu-wrapper"}>
                    <div className={"tile-hover-menu"}>
                        <span onClick={(e) => {
                            e.nativeEvent.stopImmediatePropagation();
                            setShowMenu(!showMenu)
                        }} className={"ellipsis_menu_toggle"}>...</span>
                        {
                            menuItems && menuItems.length > 0 && showMenu &&
                            <div className={"ellipsis_menu"}>
                                {
                                    menuItems.map((item, index) => <span key={index} className={"ellipsis_menu_item"} onClick={item.toggle}>{item.title}</span>)
                                }
                            </div>
                        }
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
}
