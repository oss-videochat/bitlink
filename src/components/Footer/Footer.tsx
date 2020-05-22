import React from 'react';
import './Footer.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCogs, faComments, faVideo} from '@fortawesome/free-solid-svg-icons'
import UIStore from "../../stores/UIStore";
import {observer} from 'mobx-react';

@observer
export class Footer extends React.Component<any, any> {
    render() {
        return (
            <nav className={"footer"}>
                <ul>
                    <li className={UIStore.store.chatPanel ? "selected" : ""}
                        onClick={() => UIStore.store.chatPanel = true}>
                        <span className={"footer--icon"}>
                            <FontAwesomeIcon icon={faComments}/>
                        </span>
                        <span className={"footer--text"}>Messages</span>
                    </li>
                    <li className={!UIStore.store.chatPanel ? "selected" : ""}
                        onClick={() => UIStore.store.chatPanel = false}>
                        <span className={"footer--icon"}>
                            <FontAwesomeIcon icon={faVideo}/>
                        </span>
                        <span className={"footer--text"}>Call</span>
                    </li>
                    <li className={UIStore.store.modalStore.settings ? "selected" : ""}
                        onClick={() => UIStore.store.modalStore.settings = true}>
                        <span className={"footer--icon"}>
                            <FontAwesomeIcon icon={faCogs}/>
                        </span>
                        <span className={"footer--text"}>Settings</span>
                    </li>
                </ul>
            </nav>
        );
    }
}
