import React from 'react';
import {observer} from "mobx-react"
import './ChatParticipant.css'

@observer
export class ChatParticipant extends React.Component<any, any> {
    public static previewLength = 50;

    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className={"chat-participant"}>
                <span className={"chat-participant--name"}>{this.props.name}</span>
                {this.props.lastMessage ?
                    this.props.lastMessage.length > ChatParticipant.previewLength ?
                        <span className={"chat-participant--content"}>{this.props.lastMessage.slice(0, ChatParticipant.previewLength - 3) + "..."}</span>
                        : <span className={"chat-participant--content"}>{this.props.lastMessage}</span>
                    : null
                }
            </div>
        );
    }
}
