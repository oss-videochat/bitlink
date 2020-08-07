import React from 'react';
import './HoverMenu.css';

interface HoverMenuProps {
    pinToggle: () => void,
    isPinned: boolean
}

export const HoverMenu: React.FunctionComponent<HoverMenuProps> = ({pinToggle, isPinned}) => {
    return (
        <div className={"hover-menu"}>

        </div>
    );
}
