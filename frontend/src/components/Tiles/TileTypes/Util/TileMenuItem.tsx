import React, { MouseEventHandler } from "react";
import "./TileMenuItem.css";

interface TileMenuItemProps {
    onClick?: MouseEventHandler<HTMLSpanElement>;
}

export const TileMenuItem: React.FunctionComponent<TileMenuItemProps> = ({ children, onClick }) => {
    return (
        <span className={"tile_menu_item"} onClick={onClick}>
            {children}
        </span>
    );
};
