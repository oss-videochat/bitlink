import React, {useState} from 'react';
import './Dialog.css';
import IO from "../../controllers/IO";
import MyInfo from "../../stores/MyInfo";
import UIStore from "../../stores/UIStore";
import RoomStore from "../../stores/RoomStore";
import NotificationStore, {NotificationType, UINotification} from "../../stores/NotificationStore";
import {prepareAudioBank} from "../Tiles/AutoPlayAudio";
import logo from "../../assets/logo/logo.svg";
import LegalText from "../LegalText";

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
        NotificationStore.requestPermission();
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
            NotificationStore.add(new UINotification(e, NotificationType.Error));
        }
    }

    function handleCancel() {
        UIStore.store.modalStore.create = false;
        if (!RoomStore.room) {
            UIStore.store.modalStore.joinOrCreate = true;
        }
    }

    return (
        <div className={"dialog-modal"}>
            <img className={"dialog--logo"} src={logo}/>
            <h2 className={"modal--title"}>Create Room</h2>
            <input data-private={"lipsum"} onBlur={() => setRoomNameValidationEnabled(true)}
                   className={"modal--input " + ((!roomNameValidationEnabled || roomNameIsValid()) ? "" : "invalid")}
                   onChange={(e) => {
                       setRoomName(e.target.value)
                   }}
                   placeholder={"Room Name"}/>
            <input data-private={"lipsum"} onBlur={() => setUserNameValidationEnabled(true)}
                   className={"modal--input " + ((!userNameValidationEnabled || userNameIsValid()) ? "" : "invalid")}
                   onChange={(e) => setUserName(e.target.value)}
                   placeholder={"Your Name"}/>
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
