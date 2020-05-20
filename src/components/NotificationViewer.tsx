import React from 'react';
import {observer} from "mobx-react"
import './NotificationViewer.css'
import NotificationStore, {UINotification} from "../stores/NotificationStore";

@observer
export class NotificationViewer extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
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
}
