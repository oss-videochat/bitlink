import React from 'react';
import {observer} from "mobx-react"
import RoomStore from "../../stores/RoomStore";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExternalLinkSquareAlt} from '@fortawesome/free-solid-svg-icons'
import './RoomId.css';

@observer
export class RoomId extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.copyLink = this.copyLink.bind(this);
    }

    copyLink() {
        navigator.clipboard.writeText(window.location.href);
    }

    render() {
        return (
            <div onClick={this.copyLink} className={"room-info--id-wrapper"}>
                <span className={"room-info--id"}>{RoomStore.room!.id}</span>
                <span className={"room-info--share-icon"}><FontAwesomeIcon icon={faExternalLinkSquareAlt}/></span>
            </div>
        );
    }
}
