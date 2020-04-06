import React from 'react';
import {observer} from "mobx-react"
import './Header.css';
import RoomStore from "../stores/RoomStore";
import IO from "../controllers/IO";


@observer
export class Header extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className={"header"}>
                <div className={"header--room-info"}>
                    { RoomStore.room ?
                        (
                            <span className={"room-info--name"}>{RoomStore.room.id}</span>
                        ): null
                    }
                </div>
                <nav className={"header--nav"}>
                    <ul>
                        <li>Join Room</li>
                        <li onClick={() => IO.createRoom()}>Create Room</li>
                    </ul>
                </nav>
            </div>
        );
    }
}
