import React from 'react';
import './Dialog.css';
import IO from "../../controllers/IO";
import MyInfo from "../../stores/MyInfo";
import UIStore from "../../stores/UIStore";
import RoomStore from "../../stores/RoomStore";
import NotificationStore from "../../stores/NotificationStore";
import {prepareAudioBank} from "../Video/AutoPlayAudio";

export class CreateDialog extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            roomName: "",
            userName: "",
            RoomNameValidationEnabled: false,
            UserNameValidationEnabled: false,
        };
        this.handleCreateRoom = this.handleCreateRoom.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    hasValidInput(): boolean {
        return this.userNameIsValid() && this.roomNameIsValid();
    }

    userNameIsValid() {
        return this.state.userName.length > 0;
    }

    roomNameIsValid() {
        return this.state.roomName.length > 0;
    }

    handleCreateRoom() {
        prepareAudioBank();
        NotificationStore.requestPermission();
        UIStore.store.modalStore.create = false;
        MyInfo.chosenName = this.state.userName;
        IO.createRoom(this.state.roomName);
        this.setState({
            roomName: "",
            userName: "",
            RoomNameValidationEnabled: false,
            UserNameValidationEnabled: false,
        });
    }

    handleCancel() {
        UIStore.store.modalStore.create = false;
        if (!RoomStore.room) {
            UIStore.store.modalStore.joinOrCreate = true;
        }
    }

    render() {
        return (
            <div className={"dialog-modal"}>
                <h2 className={"modal--title"}>Create Room</h2>
                <input onBlur={() => this.setState({RoomNameValidationEnabled: true})}
                       className={"modal--input " + ((!this.state.RoomNameValidationEnabled || this.roomNameIsValid()) ? "" : "invalid")}
                       onChange={(e) => this.setState({roomName: e.target.value})}
                       placeholder={"Room Name"}/>
                <input onBlur={() => this.setState({UserNameValidationEnabled: true})}
                       className={"modal--input " + ((!this.state.UserNameValidationEnabled || this.userNameIsValid()) ? "" : "invalid")}
                       onChange={(e) => this.setState({userName: e.target.value})}
                       placeholder={"Your Name"}/>
                <div className={"modal--button-container"}>
                    <input onClick={this.handleCancel} type={"button"} value={"Cancel"}
                           className={"modal--button cancel"}/>
                    <input onClick={this.handleCreateRoom} type={"button"} value={"Create"}
                           disabled={!this.hasValidInput()} className={"modal--button confirm"}/>
                </div>
            </div>
        );
    }
}
