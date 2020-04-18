import React from 'react';
import {ReactionsDisplayer} from "./ReactionsDisplayer";
import './MessageComponent.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrashAlt, faPencilAlt} from '@fortawesome/free-solid-svg-icons'
import IO from "../../../controllers/IO";
import {observer} from "mobx-react"

@observer
export class MessageComponent extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            isEditing: false,
            editValue: "",
        };

        this.handleEditButton = this.handleEditButton.bind(this);
        this.handleTrash = this.handleTrash.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);
    }

    handleEditButton() {
        this.setState({isEditing: true, editValue: this.props.message.content});
    }

    enterHandle(e: any) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (this.state.editValue.trim().length > 0) {
                this.setState({isEditing: false, editValue: ""});
                IO.edit(this.props.messageId, this.state.editValue);
            }
        }
    }

    handleTrash() {
        console.log(this.props.messageId);
        IO.delete(this.props.messageId);
    }

    cancelEdit(){
        this.setState({isEditing: false});
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
                    this.props.fromMe && !this.state.isEditing ?
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
                        !this.state.isEditing ?
                            <span className={"message--content"}>{this.props.message.content}</span>
                            :
                            <React.Fragment>
                                  <textarea autoFocus={true} onKeyDown={e => this.enterHandle(e)} placeholder={"Say something..."}
                                            className={"message--content--edit-input"} value={this.state.editValue}
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
