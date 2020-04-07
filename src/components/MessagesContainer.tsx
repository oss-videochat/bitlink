import React from 'react';
import {observer} from "mobx-react"
import ChatStore from "../stores/ChatStore";
import {Message} from "../stores/MessagesStore";
import MyInfo from "../stores/MyInfo";
import {MessageComponent} from "./MessageComponent";


@observer
export class MessagesContainer extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className={"message-container"}>
                {ChatStore.chatStore[this.props.selectedUser.id]?.map((message: Message) =>
                    <MessageComponent key={message.id} fromMe={message.from.id === MyInfo.info!.id} message={message}/>
                )}
            </div>
        );

    }
}
