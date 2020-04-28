import React from 'react';
import {observer} from "mobx-react"
import './Header.css';
import RoomStore from "../../stores/RoomStore";
import IO from "../../controllers/IO";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faUsers, faComments, faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash, faCogs, faExpand} from '@fortawesome/free-solid-svg-icons'
import UIStore from "../../stores/UIStore";
import {RoomId} from "./RoomId";
import MyInfo from "../../stores/MyInfo";

@observer
export class Header extends React.Component<any, any> {
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
                        {
                            MyInfo.info ?
                                <React.Fragment>
                                    <li onClick={() => UIStore.store.modalStore.settings = true}>
                                            <FontAwesomeIcon icon={faCogs}/>
                                    </li>
                                    <li onClick={() => IO.toggleAudio()}>
                                        {MyInfo.info.mediaState.microphoneEnabled ?
                                            <FontAwesomeIcon icon={faMicrophone}/> :
                                            <FontAwesomeIcon icon={faMicrophoneSlash}/>
                                        }
                                    </li>
                                    <li onClick={() => IO.toggleVideo()}>
                                        {MyInfo.info.mediaState.cameraEnabled ?
                                            <FontAwesomeIcon icon={faVideo}/> :
                                            <FontAwesomeIcon icon={faVideoSlash}/>
                                        }
                                    </li>
                                </React.Fragment>
                                : null
                        }
                    </ul>
                    <span className={"divider"}/>
                    <ul>
                        <li onClick={() => UIStore.store.modalStore.join = true}>Join Room</li>
                        <li onClick={() => UIStore.store.modalStore.create = true}>Create Room</li>
                    </ul>
                    <span className={"divider"}/>
                    <ul>
                        <li onClick={this.props.toggleFullscreen}>
                            <FontAwesomeIcon icon={faExpand}/>
                        </li>
                    </ul>
                </nav>
            </header>
        );
    }
}
