import React, {KeyboardEvent, useState} from 'react';
import {ReactionsDisplayer} from "./ReactionsDisplayer";
import './MessageComponent.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPencilAlt, faTrashAlt} from '@fortawesome/free-solid-svg-icons'
import IO from "../../../controllers/IO";
import {useObserver} from "mobx-react"
import UIStore from "../../../stores/UIStore";
import ChatStore from "../../../stores/ChatStore";
import MessageContent from "./MessageContent";
import {DirectMessage, GroupMessage, Message} from "../../../interfaces/Message";

//  startGroup={lastParticipant !== message.from.id || message.created - lastTime > 1000 * 60 * 5}
//                                         key={message.id}
//                                         messageId={message.id}
//                                         fromMe={message.from.id === MyInfo.info!.id}
//                                         message={message}

interface IMessageComponentProps {
    startGroup: boolean,
    messageId: string,
    fromMe: boolean,
    message: GroupMessage | DirectMessage
}

const MessageComponent: React.FunctionComponent<IMessageComponentProps> = ({startGroup, message, fromMe, messageId}) => {
    const [userIsTyping, setUserIsTyping] = useState(false);
    const [editValue, setEditValue] = useState<null | string>(null);

    function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (editValue!.trim().length > 0) {
                cancelEdit();
                IO.edit(messageId, editValue!);
            }
        }
        if (e.key === "ArrowUp" && !userIsTyping) {
            cancelEdit();
           // ChatStore.editNextMessage({messageId: messageId});
            return;
        }

        if (e.key === "ArrowDown" && !userIsTyping) {
            cancelEdit();
           // ChatStore.editPreviewMessage(messageId);
            return;
        }

        if (e.key === "Escape") {
            cancelEdit();
            return;
        }
        setUserIsTyping(true);
    }


    function cancelEdit() {
        UIStore.store.messageIdEditControl = null;
        setUserIsTyping(false);
        setEditValue(null);
    }

    return useObserver(() => {

        function textareaValue(): string {
            return editValue ?? message.content;
        }

        return (
            <div className={
                "message "
                + (startGroup ? "group-start " : "")
                + (fromMe ? "from-me " : "from-them ")
            }>
                {startGroup ?
                    <div className={"message--meta"}>
                        <span data-private={"lipsum"} className={"message--name"}>{message.from.info.name}</span>
                        <span
                            className={"message--date"}>{(new Date(message.created)).toLocaleString()}</span>
                    </div>
                    :
                    null
                }
                {
                    fromMe && UIStore.store.messageIdEditControl !== messageId ?
                        <div className={"message--options-container"}>
                            <span onClick={() => UIStore.store.messageIdEditControl = messageId}
                                  className={"message--option"}><FontAwesomeIcon
                                icon={faPencilAlt}/></span>
                            <span onClick={() => IO.delete(messageId)}
                                  className={"message--option"}><FontAwesomeIcon
                                icon={faTrashAlt}/></span>
                        </div>
                        : null
                }
                <div className={"message--content-container"}>
                    {
                        UIStore.store.messageIdEditControl !== messageId ?
                            <MessageContent content={message.content}/>
                            :
                            <React.Fragment>
                              <textarea data-private={"lipsum"} autoFocus={true} onKeyDown={handleKeyDown}
                                        placeholder={"Say something..."}
                                        className={"message--content--edit-input"} value={textareaValue()}
                                        onChange={(e) => setEditValue(e.target.value)}/>
                                <span onClick={cancelEdit} className={"message--content-edit-cancel"}>cancel</span>
                            </React.Fragment>

                    }
                </div>
            </div>
        );
    })
}
export default MessageComponent;
