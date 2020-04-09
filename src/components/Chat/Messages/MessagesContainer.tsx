import React from 'react';
import {observer} from "mobx-react"
import ChatStore from "../../../stores/ChatStore";
import {Message} from "../../../stores/MessagesStore";
import MyInfo from "../../../stores/MyInfo";
import {MessageComponent} from "./MessageComponent";
import './MessageContainer.css'
import IO from "../../../controllers/IO";
import ParticipantsStore from "../../../stores/ParticipantsStore";

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
            e.preventDefault();
            if (this.state.inputValue.trim().length > 0) {
                if (this.props.selectedUser === "everyone") {
                    IO.sendToRoom(this.state.inputValue);
                } else {
                    IO.sendDirect(this.props.selectedUser, this.state.inputValue);
                }
                this.setState({inputValue: ""});
            }
        }
    }

    render() {
        let lastParticipant = "";
        let lastTime = 0;
        return (
            <div className={"message-container"}>
                <div className={"message-list"}>
                    {ChatStore.chatStore[this.props.selectedUser]?.map((message: Message) => {
                            let el;
                            if (message.from.id === ParticipantsStore.system.id) {
                                el = <MessageComponent isSystemMessage={true} message={message}/>
                            } else {
                                el = <MessageComponent
                                    startGroup={lastParticipant !== message.from.id || message.created - lastTime > 1000 * 60 * 5}
                                    key={message.id}
                                    fromMe={message.from.id === MyInfo.info!.id}
                                    message={message}/>;
                            }
                            return el;
                        }
                    )}
                </div>
                {ParticipantsStore.getById(this.props.selectedUser)?.isAlive || this.props.selectedUser === "everyone" ?
                    (
                        <div className={"chat--input-container"}>
                    <textarea onKeyDown={e => this.enterHandle(e)} placeholder={"Say something..."}
                              className={"chat--input"} value={this.state.inputValue}
                              onChange={(e) => this.setState({inputValue: e.target.value})}/>
                        </div>
                    )
                    : null
                }
            </div>
        );

    }
}
