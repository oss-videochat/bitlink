import React from 'react';
import RoomStore from "../../stores/RoomStore";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExternalLinkSquareAlt} from '@fortawesome/free-solid-svg-icons'
import './RoomId.css';
import NotificationStore from "../../stores/NotificationStore";
import MyInfo from "../../stores/MyInfoStore";
import NotificationService from "../../services/NotificationService";
import {NotificationType} from "../../enum/NotificationType";

const RoomId: React.FunctionComponent = () => {
    function copyLink() {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            NotificationService.add(NotificationService.createUINotification(`Link copied!`, NotificationType.Success));
        } else {
            if (copyFallback(window.location.href)) {
                NotificationService.add(NotificationService.createUINotification(`Link copied!`, NotificationType.Success));
            }
        }
        const navigatior2: any = navigator;
        if (navigatior2.share) {
            navigatior2.share({
                title: `${MyInfo.participant?.name}'s BitLink Room`,
                text: `${MyInfo.participant?.name}'s BitLink Room`,
                url: window.location.href
            })
        }
    }

    return (
        <div onClick={copyLink} className={"room-info--id-wrapper"}>
            <span className={"room-info--id"}>{RoomStore.info!.id}</span>
            <span className={"room-info--share-icon"}><FontAwesomeIcon icon={faExternalLinkSquareAlt}/></span>
        </div>
    );


    function copyFallback(text: string) {
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
            NotificationService.add(NotificationService.createUINotification(`An error occurred copying.`, NotificationType.Error));
            return false;
        }
    }
}
export default RoomId;
