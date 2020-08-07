import React from 'react';
import {useObserver} from "mobx-react"
import './Header.css';
import RoomStore from "../../stores/RoomStore";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCogs, faComments, faExpand, faUsers} from '@fortawesome/free-solid-svg-icons'
import UIStore from "../../stores/UIStore";
import RoomId from "./RoomId";
import MyInfo from "../../stores/MyInfoStore";
import UIStoreService from "../../services/UIStoreService";

interface IHeaderProps {
    toggleFullscreen: () => void
}

const Header: React.FunctionComponent<IHeaderProps> = ({toggleFullscreen}) => {
    return useObserver(() => {
        return (
            <header className={"header"}>
                <div className={"header--room-info"}>
                    {RoomStore.info ?
                        <React.Fragment>
                            <span data-private={""} className={"room-info--name"}>{RoomStore.info.name}</span>
                            <RoomId/>
                        </React.Fragment>
                        : null
                    }
                </div>
                <nav className={"header--nav"}>
                    <ul>
                        <li onClick={() => {
                            UIStoreService.toggle('participantPanel');
                            UIStore.store.chatPanel = true;
                        }}><FontAwesomeIcon icon={faUsers}/></li>
                        <li onClick={() => UIStoreService.toggle('chatPanel')}><FontAwesomeIcon icon={faComments}/></li>
                        {
                            MyInfo.participant ?
                                <React.Fragment>
                                    <li onClick={() => UIStore.store.modalStore.settings = true}>
                                        <FontAwesomeIcon icon={faCogs}/>
                                    </li>
                                </React.Fragment>
                                : null
                        }
                    </ul>
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
