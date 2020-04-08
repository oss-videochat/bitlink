import React from 'react';
import {observer} from "mobx-react"
import {Reaction} from "../../../stores/MessagesStore";
import {ReactionsDisplayer} from "./ReactionsDisplayer";
import './MessageComponent.css';


export class MessageComponent extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className={"message " + (this.props.startGroup ? "group-start" : "") + " " + (this.props.fromMe ? "from-me" : "from-them" )}>
                { this.props.startGroup ?
                    <div className={"message--meta"}>
                        <span className={"message--name"}>{this.props.message.from.name}</span>
                        <span className={"message--date"}>{(new Date(this.props.message.created)).toLocaleString()}</span>
                    </div>
                    :
                    null
                }
                <div className={"message--content-container"}>
                    <span className={"message--content"}>{this.props.message.content}</span>
                    <div className={"message--reaction-wrapper"}>
                        <ReactionsDisplayer reactions={this.props.message.reactions}/>
                    </div>
                </div>
            </div>
        );
    }
}
