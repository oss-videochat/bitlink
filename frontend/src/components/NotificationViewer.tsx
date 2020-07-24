import React from 'react';
import {useObserver} from "mobx-react"
import './NotificationViewer.css'
import NotificationStore from "../stores/NotificationStore";
import {UINotification} from "../interfaces/UINotification";

const NotificationViewer: React.FunctionComponent = () => {
    return useObserver(() =>
        <div className={"notification-list"}>
            {NotificationStore.store.map((notification: UINotification, index: number) => {
                return (
                    <div key={index} className={"notification " + notification.type}>
                        <span data-private={""} className={"notification--content"}>{notification.message}</span>
                    </div>
                );
            })}
        </div>
    );
}
export default NotificationViewer;
