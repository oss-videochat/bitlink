import React from 'react';
import './SystemMessage.css'
import {Message} from "../../../stores/MessagesStore";

interface ISystemMessageProps {
    message: Message,
}

const SystemMessage: React.FunctionComponent<ISystemMessageProps> = ({message}) => (
    <div className={"message system"}>
        <div className={"message--content-container"}>
            <span className={"message--date"}>{(new Date(message.created)).toLocaleString()}</span>
            <span data-private={""} className={"message--content"}>{message.content}</span>
        </div>
    </div>
);
export default SystemMessage;
