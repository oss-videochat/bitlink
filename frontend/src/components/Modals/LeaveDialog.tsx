import React, {useState} from 'react';
import './Dialog.css';
import './LeaveDialog.css';
import UIStore from "../../stores/UIStore";
import ParticipantsStore from "../../stores/ParticipantsStore";
import IO from "../../controllers/IO";
import ParticipantList from "../Util/ParticipantList";

const LeaveDialog: React.FunctionComponent = () => {
    const [transferHostOpen, setTransferHostOpen] = useState(false);
    const isThereAnotherHost = ParticipantsStore.getLiving(true).filter(participant => participant.isHost).length > 0;

    return (
        <div className={"dialog-modal"}>
            <h2 className={"modal--title"}>Leave Room</h2>
            {isThereAnotherHost ?
                 (
                    <>
                        <span className={"dialog-centered-text"}>Please choose to leave or end the room for all participants</span>
                        <input onClick={() => IO._leave()} type={"button"} value={"Leave"} className={"modal--button leave-button"}/>
                    </>
                ) : (
                    <>
                        <span className={"dialog-centered-text"}>Please choose to transfer the host to another participant or end the room for all participants</span>
                        <input type={"button"} onClick={() => setTransferHostOpen(true)} value={"Transfer Host"} className={"modal--button leave-button"}/>
                    </>
                )
            }
            {
                transferHostOpen &&
                    <ParticipantList onTransfer={() => IO._leave()}/>
            }
            <input type={"button"} onClick={() => IO.endRoomForAll().catch(console.error)} value={"End Room for All"} className={"modal--button leave-button"}/>
            <input type={"button"} onClick={() => UIStore.store.modalStore.leaveMenu = false} value={"Cancel"} className={"modal--button leave-button-cancel"}/>
        </div>
    );
}
export default LeaveDialog;
