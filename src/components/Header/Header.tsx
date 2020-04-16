import React from 'react';
import {observer} from "mobx-react"
import './Header.css';
import RoomStore from "../../stores/RoomStore";
import IO from "../../controllers/IO";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faUsers, faComments, faMicrophone, faVideo} from '@fortawesome/free-solid-svg-icons'
import UIStore from "../../stores/UIStore";
import {RoomId} from "./RoomId";

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
            <header className={"header"}>
                <div className={"header--room-info"}>
                    { RoomStore.room ?
                        <React.Fragment>
                            <span className={"room-info--name"}>{RoomStore.room.name}</span>
                            <RoomId/>
                        </React.Fragment>
                        : null
                    }
                </div>
                <nav className={"header--nav"}>
                    <ul>
                        <li onClick={() => UIStore.toggle('participantPanel')}><FontAwesomeIcon icon={faUsers}/></li>
                        <li onClick={() => UIStore.toggle('chatPanel')}><FontAwesomeIcon icon={faComments}/></li>
                        <li onClick={() => IO.toggleAudio()}><FontAwesomeIcon icon={faMicrophone}/></li>
                        <li onClick={() => IO.toggleVideo()}><FontAwesomeIcon icon={faVideo}/></li>
                    </ul>
                    <span className={"divider"}/>
                    <ul>
                        <li onClick={() => UIStore.store.modalStore.join = true}>Join Room</li>
                        <li onClick={() => UIStore.store.modalStore.create = true}>Create Room</li>
                    </ul>
                </nav>
            </header>
        );
    }
}
