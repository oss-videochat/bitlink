import React from 'react';
import './Dialog.css';
import IO from "../../controllers/IO";
import MyInfo from "../../stores/MyInfo";
import UIStore from "../../stores/UIStore";
import RoomStore from "../../stores/RoomStore";

export class JoinDialog extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            roomId: "",
            userName: "",
            RoomIdValidationEnabled: false,
            UserNameValidationEnabled: false,
        };
        this.handleJoinRoom = this.handleJoinRoom.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    hasValidInput(): boolean {
        return this.userNameIsValid() && this.roomIdIsValid();
    }

    userNameIsValid() {
        return this.state.userName.length > 0;
    }

    roomIdIsValid() {
        return this.state.roomId.length > 0;
    }

    handleJoinRoom() {
        UIStore.store.modalStore.join = false;
        MyInfo.chosenName = this.state.userName;
        IO.joinRoom(this.state.roomId, this.state.roomName);
        this.setState({
            roomId: "",
            userName: "",
            RoomIdValidationEnabled: false,
            UserNameValidationEnabled: false,
        });
    }

    handleCancel() {
        UIStore.store.modalStore.join = false;
        if (!RoomStore.room) {
            UIStore.store.modalStore.joinOrCreate = true;
        }
    }

    render() {
        return (
            <div className={"dialog-modal"}>
                <h2 className={"modal--title"}>Join Room</h2>
                <input onBlur={() => this.setState({RoomIdValidationEnabled: true})}
                       className={"modal--input " + ((!this.state.RoomNameValidationEnabled || this.roomIdIsValid()) ? "" : "invalid")}
                       onChange={(e) => this.setState({roomName: e.target.value})}
                       placeholder={"Room ID or Link"}/>
                <input onBlur={() => this.setState({UserNameValidationEnabled: true})}
                       className={"modal--input " + ((!this.state.UserNameValidationEnabled || this.userNameIsValid()) ? "" : "invalid")}
                       onChange={(e) => this.setState({userName: e.target.value})}
                       placeholder={"Your Name"}/>
                <div className={"modal--button-container"}>
                    <input onClick={this.handleCancel} type={"button"} value={"Cancel"}
                           className={"modal--button cancel"}/>
                    <input onClick={this.handleJoinRoom} type={"button"} value={"Join"}
                           disabled={!this.hasValidInput()} className={"modal--button confirm"}/>
                </div>
            </div>
        );
    }
}
