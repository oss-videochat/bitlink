import React from 'react';
import {observer} from "mobx-react"
import ChatStore from "../../../stores/ChatStore";
import {Message} from "../../../stores/MessagesStore";
import MyInfo from "../../../stores/MyInfo";
import {MessageComponent} from "./MessageComponent";
import './MessageContainer.css'
import IO from "../../../controllers/IO";
import ParticipantsStore from "../../../stores/ParticipantsStore";
import {SystemMessage} from "./SystemMessage";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faChevronLeft} from '@fortawesome/free-solid-svg-icons'
import UIStore from "../../../stores/UIStore";

@observer
export class MessagesContainer extends React.Component<any, any> {
    private list: any = React.createRef();
    private shouldScroll: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            inputValue: ""
        };
    }

    handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (this.state.inputValue.trim().length > 0) {
                IO.send(this.props.selectedUser, this.state.inputValue);
                this.setState({inputValue: ""});
            }
        }
        if (e.key === "ArrowUp" && this.state.inputValue === "") {
            ChatStore.editNextMessage({selectedUser: this.props.selectedUser});
        }
    }

    componentDidMount() {
        this.scrollToBottom();
        const el: HTMLElement = this.list.current;
        el.addEventListener("scroll", e => {
            this.shouldScroll = el.scrollHeight - (el.scrollTop + el.clientHeight) <= 15;
        });
    }

    componentDidUpdate() {
        this.scrollToBottom()
    }

    scrollToBottom() {
        if (this.shouldScroll) {
            const el: HTMLElement = this.list.current;
            el.scrollTop = el.scrollHeight;
        }
    }

    render() {
        let lastParticipant = "";
        let lastTime = 0;
        return (
            <div className={"message-container"}>
                <div className={"message-container--top-bar"}>
                    <span onClick={() => { UIStore.store.participantPanel = true}} className={"message-container--back-button"}>
                        <FontAwesomeIcon icon={faChevronLeft}/>
                    </span>
                    <span className={"message-container--participant-name"}>{ParticipantsStore.getById(this.props.selectedUser)?.name}</span>
                </div>
                <div ref={this.list} className={"message-list"}>
                    {ChatStore.chatStore[this.props.selectedUser]?.map((message: Message, index) => {
                            let el;
                            if (message.from.id === ParticipantsStore.system.id) {
                                el = <SystemMessage key={index} message={message}/>
                            } else {
                                el = <MessageComponent
                                    startGroup={lastParticipant !== message.from.id || message.created - lastTime > 1000 * 60 * 5}
                                    key={message.id}
                                    messageId={message.id}
                                    fromMe={message.from.id === MyInfo.info!.id}
                                    message={message}
                                />;
                            }
                            lastTime = message.created;
                            lastParticipant = message.from.id;
                            return el;
                        }
                    )}
                </div>
                {ParticipantsStore.getById(this.props.selectedUser)?.isAlive || this.props.selectedUser === "everyone" ?
                    (
                        <div className={"chat--input-container"}>
                            <textarea onKeyDown={e => this.handleKeyDown(e)} placeholder={"Say something..."}
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
