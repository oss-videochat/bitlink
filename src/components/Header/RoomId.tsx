import React from 'react';
import {observer} from "mobx-react"
import RoomStore from "../../stores/RoomStore";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExternalLinkSquareAlt} from '@fortawesome/free-solid-svg-icons'
import './RoomId.css';
import NotificationStore, {NotificationType, UINotification} from "../../stores/NotificationStore";

@observer
export class RoomId extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.copyLink = this.copyLink.bind(this);
    }

    copyLink() {
        if(navigator.clipboard){
            navigator.clipboard.writeText(window.location.href);
            NotificationStore.add(new UINotification(`Link copied!`, NotificationType.Success));
        } else {
           if(this.copyFallback(window.location.href)){
               NotificationStore.add(new UINotification(`Link copied!`, NotificationType.Success));
           }
        }
    }

    render() {
        return (
            <div onClick={this.copyLink} className={"room-info--id-wrapper"}>
                <span className={"room-info--id"}>{RoomStore.room!.id}</span>
                <span className={"room-info--share-icon"}><FontAwesomeIcon icon={faExternalLinkSquareAlt}/></span>
            </div>
        );
    }


    copyFallback(text: string){
        const textArea: any = document.createElement("textarea");
        textArea.style.position = 'fixed';
        textArea.style.top = 0;
        textArea.style.left = 0;
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = 0;
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            return true;
        } catch (e) {
            NotificationStore.add(new UINotification(`An error occurred copying.`, NotificationType.Error));
            return false;
        }
    }
}
