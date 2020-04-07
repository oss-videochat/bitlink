import React from 'react';
import {observer} from "mobx-react"
import './Header.css';
import RoomStore from "../stores/RoomStore";
import IO from "../controllers/IO";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faUsers, faComments} from '@fortawesome/free-solid-svg-icons'
import UIStore from "../stores/UIStore";

@observer
export class Header extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    handleJoinRoom(){
        const chosenId = prompt("Enter a Room ID") || "";
        const chosenName = prompt("Enter a Name") || undefined;
        IO.joinRoom(chosenId, chosenName)
    }

    render() {
        return (
            <div className={"header"}>
                <div className={"header--room-info"}>
                    { RoomStore.room ?
                        <React.Fragment>
                            <span className={"room-info--name"}>{RoomStore.room.name}</span>
                            <span className={"room-info--id"}>{RoomStore.room.id}</span>
                        </React.Fragment>
                        : null
                    }
                </div>
                <nav className={"header--nav"}>
                    <ul>
                        <li onClick={() => UIStore.toggle('participantPanel')}><FontAwesomeIcon icon={faUsers}/></li>
                        <li onClick={() => UIStore.toggle('chatPanel')}><FontAwesomeIcon icon={faComments}/></li>
                    </ul>
                    <span className={"divider"}/>
                    <ul>
                        <li onClick={() => this.handleJoinRoom()}>Join Room</li>
                        <li onClick={() => IO.createRoom()}>Create Room</li>
                    </ul>
                </nav>
            </div>
        );
    }
}
