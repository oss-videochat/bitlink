import React from 'react';
import {observer} from "mobx-react"
import MessagesStore, {Message} from "../stores/MessagesStore";


@observer
export class MessagesContainer extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return MessagesStore.getRelevantMessages(this.props.selectedUser.id).map((message: Message)  => <Message message={message}/>)
    }
}
