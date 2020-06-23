import React, {useEffect, useState} from 'react';
import {useObserver} from "mobx-react"
import ChatStore from "../../../stores/ChatStore";
import {Message} from "../../../stores/MessagesStore";
import MyInfo from "../../../stores/MyInfo";
import MessageComponent from "./MessageComponent";
import './MessageContainer.css'
import IO from "../../../controllers/IO";
import ParticipantsStore from "../../../stores/ParticipantsStore";
import SystemMessage from "./SystemMessage";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faChevronLeft} from '@fortawesome/free-solid-svg-icons'
import UIStore from "../../../stores/UIStore";

interface IMessagesContainerProps {
    selectedUser: string
}

const MessagesContainer: React.FunctionComponent<IMessagesContainerProps> = ({selectedUser}) => {
    const list = React.createRef<HTMLDivElement>();
    const [shouldScroll, setShouldScroll] = useState(true);
    const [inputValue, setInputValue] = useState("");

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (inputValue.trim().length > 0) {
                IO.send(selectedUser, inputValue);
                setInputValue("");
            }
        }
        if (e.key === "ArrowUp" && inputValue === "") {
            ChatStore.editNextMessage({selectedUser: selectedUser});
        }
    }

    useEffect(() => {
        scrollToBottom()
    });

    useEffect(() => {
        const el: HTMLDivElement = list.current!;
        el.addEventListener("scroll", e => {
            setShouldScroll(el.scrollHeight - (el.scrollTop + el.clientHeight) <= 15);
        });
    }, []);


    function scrollToBottom() {
        if (shouldScroll && list.current) {
            const el: HTMLDivElement = list.current;
            el.scrollTop = el.scrollHeight;
        }
    }


        return useObserver(() => {
            let lastParticipant = "";
            let lastTime = 0;

            return (
                <div className={"message-container"}>
                    <div className={"message-container--top-bar"}>
                    <span onClick={() => {
                        UIStore.store.participantPanel = true
                    }} className={"message-container--back-button"}>
                        <FontAwesomeIcon icon={faChevronLeft}/>
                    </span>
                        <span
                            data-private={"lipsum"}
                            className={"message-container--participant-name"}>{ParticipantsStore.getById(selectedUser)?.name}</span>
                    </div>
                    <div className={"message-list-wrapper"}>
                        <div ref={list} className={"message-list"}>
                            {ChatStore.chatStore[selectedUser]?.map((message: Message, index) => {
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
                    </div>
                    {ParticipantsStore.getById(selectedUser)?.isAlive || selectedUser === "everyone" ?
                        (
                            <div className={"chat--input-container"}>
                            <textarea data-private={"lipsum"} onKeyDown={e => handleKeyDown(e)}
                                      placeholder={"Say something..."}
                                      className={"chat--input"} value={inputValue}
                                      onChange={(e) => setInputValue(e.target.value)}/>
                            </div>
                        )
                        : null
                    }
                </div>
            );
        })
}
export default MessagesContainer;
