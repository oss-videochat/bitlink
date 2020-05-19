import React from 'react';
import './Dialog.css';
import IO from "../../controllers/IO";
import MyInfo from "../../stores/MyInfo";
import UIStore from "../../stores/UIStore";
import RoomStore from "../../stores/RoomStore";
import NotificationStore from "../../stores/NotificationStore";
import {prepareAudioBank} from "../Video/AutoPlayAudio";
import logo from "../../assets/logo/logo.svg";
import LegalText from "../LegalText";

export class JoinDialog extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            roomId: UIStore.store.preFillJoinValue || "",
            userName: "",
            RoomIdValidationEnabled: false,
            UserNameValidationEnabled: false,
        };


        this.handleJoinRoom = this.handleJoinRoom.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handlePaste = this.handlePaste.bind(this);
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
        prepareAudioBank();
        NotificationStore.requestPermission();
        UIStore.store.modalStore.join = false;
        MyInfo.chosenName = this.state.userName;
        IO.joinRoom(this.state.roomId, this.state.userName);
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

    handlePaste(e: any) {
        const text = e.clipboardData.getData('text');
        const nums = text.match(/\/join\/(.+)$/);
        if (nums && nums[1]) {
            e.preventDefault();
            this.setState({
                roomId: nums[1]
            })
        }

    }

    render() {
        return (
            <div className={"dialog-modal"}>
                <img className={"dialog--logo"} src={logo}/>
                <h2 className={"modal--title"}>Join Room</h2>
                <input onBlur={() => this.setState({RoomIdValidationEnabled: true})}
                       value={this.state.roomId}
                       className={"modal--input " + ((!this.state.RoomIdValidationEnabled || this.roomIdIsValid()) ? "" : "invalid")}
                       onChange={(e) => this.setState({roomId: e.target.value, RoomIdValidationEnabled: true})}
                       onPaste={this.handlePaste}
                       type={"tel"}
                       placeholder={"Room ID or Paste Link"}/>
                <input onBlur={() => this.setState({UserNameValidationEnabled: true})}
                       value={this.state.userName}
                       className={"modal--input " + ((!this.state.UserNameValidationEnabled || this.userNameIsValid()) ? "" : "invalid")}
                       onChange={(e) => this.setState({userName: e.target.value, UserNameValidationEnabled: true})}
                       placeholder={"Your Name"}/>
                <div className={"modal--button-container"}>
                    <input onClick={this.handleCancel} type={"button"} value={"Cancel"}
                           className={"modal--button cancel"}/>
                    <input onClick={this.handleJoinRoom} type={"button"} value={"Join"}
                           disabled={!this.hasValidInput()} className={"modal--button confirm"}/>
                </div>
                <LegalText/>
            </div>
        );
    }
}
