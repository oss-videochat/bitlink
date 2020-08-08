import React, {KeyboardEvent, useState} from 'react';
import './Dialog.css';
import IO from "../../controllers/IO";
import MyInfo from "../../stores/MyInfoStore";
import UIStore from "../../stores/UIStore";
import RoomStore from "../../stores/RoomStore";
import {prepareAudioBank} from "../Tiles/AutoPlayAudio";
import LegalText from "../LegalText";
import NotificationService from "../../services/NotificationService";
import {NotificationType} from "../../enum/NotificationType";
import {Logo} from "../Util/Logo";

const CreateDialog: React.FunctionComponent = () => {
    const [roomName, setRoomName] = useState("");
    const [userName, setUserName] = useState("");
    const [roomNameValidationEnabled, setRoomNameValidationEnabled] = useState(false);
    const [userNameValidationEnabled, setUserNameValidationEnabled] = useState(false);


    function userNameIsValid() {
        return userName.length > 0;
    }

    function roomNameIsValid() {
        return roomName.length > 0;
    }

    function hasValidInput(): boolean {
        return userNameIsValid() && roomNameIsValid();
    }


    function handleCreateRoom() {
        prepareAudioBank();
        NotificationService.requestPermission();
        UIStore.store.modalStore.create = false;
        MyInfo.chosenName = userName;
        try {
            IO.createRoom(roomName)
            setRoomName("");
            setUserName("");
            setRoomNameValidationEnabled(false);
            setUserNameValidationEnabled(false)
        } catch (e) {
            UIStore.store.modalStore.create = true;
            NotificationService.add(NotificationService.createUINotification(e, NotificationType.Error))
        }
    }

    function handleCancel() {
        UIStore.store.modalStore.create = false;
        if (!RoomStore.info) {
            UIStore.store.modalStore.joinOrCreate = true;
        }
    }

    function handleKeyDown(e: KeyboardEvent){
        if(e.key !== "Enter"){
            return;
        }
        e.preventDefault();
        if(hasValidInput()){
            handleCreateRoom();
        }
    }

    return (
        <div className={"dialog-modal"}>
            <Logo/>
            <h2 className={"modal--title"}>Create Room</h2>
            <input data-private={"lipsum"} onBlur={() => setRoomNameValidationEnabled(true)}
                   className={"modal--input " + ((!roomNameValidationEnabled || roomNameIsValid()) ? "" : "invalid")}
                   onChange={(e) => {
                       setRoomName(e.target.value)
                   }}
                   placeholder={"Room Name"}
                   onKeyDown={handleKeyDown}/>
            <input data-private={"lipsum"} onBlur={() => setUserNameValidationEnabled(true)}
                   className={"modal--input " + ((!userNameValidationEnabled || userNameIsValid()) ? "" : "invalid")}
                   onChange={(e) => setUserName(e.target.value)}
                   placeholder={"Your Name"}
                   onKeyDown={handleKeyDown}/>
            <div className={"modal--button-container"}>
                <input onClick={handleCancel} type={"button"} value={"Cancel"}
                       className={"modal--button cancel"}/>
                <input onClick={handleCreateRoom} type={"button"} value={"Create"}
                       disabled={!hasValidInput()} className={"modal--button confirm"}/>
            </div>
            <LegalText/>
        </div>
    );
}
export default CreateDialog;
