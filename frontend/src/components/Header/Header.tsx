import React from 'react';
import {useObserver} from "mobx-react"
import './Header.css';
import RoomStore from "../../stores/RoomStore";
import IO from "../../controllers/IO";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCogs, faComments, faExpand, faUsers} from '@fortawesome/free-solid-svg-icons'
import UIStore from "../../stores/UIStore";
import RoomId from "./RoomId";
import MyInfo from "../../stores/MyInfo";

interface IHeaderProps {
    toggleFullscreen: () => void
}

const Header: React.FunctionComponent<IHeaderProps> = ({toggleFullscreen}) => {
    return useObserver(() => {
        return (
            <header className={"header"}>
                <div className={"header--room-info"}>
                    {RoomStore.room ?
                        <React.Fragment>
                            <span data-private={""} className={"room-info--name"}>{RoomStore.room.name}</span>
                            <RoomId/>
                        </React.Fragment>
                        : null
                    }
                </div>
                <nav className={"header--nav"}>
                    <ul>
                        <li onClick={() => {
                            UIStore.toggle('participantPanel');
                            UIStore.store.chatPanel = true;
                        }}><FontAwesomeIcon icon={faUsers}/></li>
                        <li onClick={() => UIStore.toggle('chatPanel')}><FontAwesomeIcon icon={faComments}/></li>
                        {
                            MyInfo.info ?
                                <React.Fragment>
                                    <li onClick={() => UIStore.store.modalStore.settings = true}>
                                        <FontAwesomeIcon icon={faCogs}/>
                                    </li>
                                </React.Fragment>
                                : null
                        }
                    </ul>
                    {RoomStore.room ?
                        <React.Fragment>
                            <span className={"divider"}/>
                            <ul>
                                <li className={"leave-button"} onClick={() => IO.leave()}>Leave Room
                                </li>
                            </ul>
                        </React.Fragment>
                        :
                        null
                    }

                    <span className={"divider"}/>
                    <ul>
                        <li onClick={toggleFullscreen}>
                            <FontAwesomeIcon icon={faExpand}/>
                        </li>
                    </ul>
                </nav>
            </header>
        );
    });
}
export default Header;
