import React from 'react';
import {observer} from "mobx-react"
import './Header.css';
import RoomStore from "../../stores/RoomStore";
import IO from "../../controllers/IO";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCogs, faComments, faExpand, faUsers} from '@fortawesome/free-solid-svg-icons'
import UIStore from "../../stores/UIStore";
import {RoomId} from "./RoomId";
import MyInfo from "../../stores/MyInfo";

@observer
export class Header extends React.Component<any, any> {
    render() {
        return (
            <header className={"header"}>
                <div className={"header--room-info"}>
                    {RoomStore.room ?
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
                                </React.Fragment>
                                : null
                        }
                    </ul>
                    {RoomStore.room ?
                        <React.Fragment>
                            <span className={"divider"}/>
                            <ul>
                                <li className={"leave-button"} onClick={() => {
                                    // eslint-disable-next-line no-restricted-globals
                                    const confirmed: boolean = confirm("Are you sure you would like to leave this room?");
                                    if (confirmed) {
                                        IO.leave();
                                    }
                                }}>Leave Room
                                </li>
                            </ul>
                        </React.Fragment>
                        :
                        null
                    }

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
