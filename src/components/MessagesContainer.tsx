import React from 'react';
import {observer} from "mobx-react"
import ChatStore from "../stores/ChatStore";
import {Message} from "../stores/MessagesStore";
import MyInfo from "../stores/MyInfo";
import {MessageComponent} from "./MessageComponent";
import './MessageContainer.css'
import IO from "../controllers/IO";

@observer
export class MessagesContainer extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            inputValue: ""
        };
        this.enterHandle.bind(this);
    }

    enterHandle(e: any) {
        if (e.key === "Enter" && !e.shiftKey) {
            IO.sendToRoom(this.state.inputValue);
            e.preventDefault();
            this.setState({inputValue: ""});
        }
    }

    render() {
        return (
            <div className={"message-container"}>
                <div className={"message-list"}>
                    {ChatStore.chatStore[this.props.selectedUser]?.map((message: Message) => {
                            console.log("here");
                            return <MessageComponent key={message.id} fromMe={message.from.id === MyInfo.info!.id}
                                                     message={message}/>
                        }
                    )}
                </div>
                <div className={"chat--input-container"}>
                    <textarea onKeyDown={e => this.enterHandle(e)} placeholder={"Say something..."}
                              className={"chat--input"} value={this.state.inputValue}
                              onChange={(e) => this.setState({inputValue: e.target.value})}/>
                </div>
            </div>
        );

    }
}
