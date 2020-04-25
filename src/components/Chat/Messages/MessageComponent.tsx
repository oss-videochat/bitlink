import React from 'react';
import {ReactionsDisplayer} from "./ReactionsDisplayer";
import './MessageComponent.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrashAlt, faPencilAlt} from '@fortawesome/free-solid-svg-icons'
import IO from "../../../controllers/IO";
import {observer} from "mobx-react"
import {computed} from 'mobx';
import UIStore from "../../../stores/UIStore";
import ChatStore from "../../../stores/ChatStore";

@observer
export class MessageComponent extends React.Component<any, any> {
    private userIsTyping = false;

    constructor(props: any) {
        super(props);
        this.state = {
            editValue: "",
        };

        this.handleEditButton = this.handleEditButton.bind(this);
        this.handleTrash = this.handleTrash.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);
    }

    @computed
    get textareaValue(): string {
        return this.state.editValue || this.props.message.content;
    }

    handleEditButton() {
        UIStore.store.messageIdEditControl = this.props.messageId;
    }

    handleKeyDown(e: any) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (this.state.editValue.trim().length > 0) {
                this.setState({editValue: ""});
                this.userIsTyping = false;
                UIStore.store.messageIdEditControl = null;
                IO.edit(this.props.messageId, this.state.editValue);
            }
        }
        if (e.key === "ArrowUp" && !this.userIsTyping) {
            ChatStore.editNextMessage({messageId: this.props.messageId});
            return;
        }

        if (e.key === "ArrowDown" && !this.userIsTyping) {
            ChatStore.editPreviewMessage(this.props.messageId);
            return;
        }

        if (e.key === "Escape") {
            this.cancelEdit();
            return;
        }

        this.userIsTyping = true;
    }

    handleTrash() {
        console.log(this.props.messageId);
        IO.delete(this.props.messageId);
    }

    cancelEdit() {
        UIStore.store.messageIdEditControl = null;
        this.userIsTyping = false;
        this.setState({editValue: ""});
    }

    render() {
        return (
            <div className={
                "message "
                + (this.props.startGroup ? "group-start " : "")
                + (this.props.fromMe ? "from-me " : "from-them ")
            }>
                {this.props.startGroup ?
                    <div className={"message--meta"}>
                        <span className={"message--name"}>{this.props.message.from.name}</span>
                        <span
                            className={"message--date"}>{(new Date(this.props.message.created)).toLocaleString()}</span>
                    </div>
                    :
                    null
                }
                {
                    this.props.fromMe && UIStore.store.messageIdEditControl !== this.props.messageId ?
                        <div className={"message--options-container"}>
                            <span onClick={this.handleEditButton} className={"message--option"}><FontAwesomeIcon
                                icon={faPencilAlt}/></span>
                            <span onClick={this.handleTrash} className={"message--option"}><FontAwesomeIcon
                                icon={faTrashAlt}/></span>
                        </div>
                        : null
                }
                <div className={"message--content-container"}>
                    {
                        UIStore.store.messageIdEditControl !== this.props.messageId ?
                            <span className={"message--content"}>{this.props.message.content}</span>
                            :
                            <React.Fragment>
                              <textarea autoFocus={true} onKeyDown={e => this.handleKeyDown(e)}
                                        placeholder={"Say something..."}
                                        className={"message--content--edit-input"} value={this.textareaValue}
                                        onChange={(e) => this.setState({editValue: e.target.value})}/>
                                <span onClick={this.cancelEdit} className={"message--content-edit-cancel"}>cancel</span>
                            </React.Fragment>

                    }
                </div>

                <div className={"message--reaction-wrapper"}>
                    <ReactionsDisplayer reactions={this.props.message.reactions}/>
                </div>
            </div>
        );
    }
}
