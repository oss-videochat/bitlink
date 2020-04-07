import React from 'react';
import {observer} from "mobx-react"
import {Reaction} from "../stores/MessagesStore";
import {ReactionsDisplayer} from "./ReactionsDisplayer";

@observer
export class MessageComponent extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className={"message"}>
                <span className={"message--name"}>{this.props.message.from.name}</span>
                <span className={"message--content"}>{this.props.message.content}</span>
                <div className={"message--reaction-wrapper"}>
                    <ReactionsDisplayer reactions={this.props.message.reactions}/>
                </div>
            </div>
        );
    }
}
