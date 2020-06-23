import React from 'react';
import './TilePlaceholder.css'
import RoomId from "../Header/RoomId";
import RoomStore from "../../stores/RoomStore";

export class TilePlaceholder extends React.Component<any, any> {
    render() {
        return (
            <div className={"video-placeholder"}>
                <span className={"video-placeholder--message"}>
                      Click the button to invite others.
                    {RoomStore.room ?
                        <RoomId/>
                        : null
                    }
                </span>
            </div>
        );
    }
}
