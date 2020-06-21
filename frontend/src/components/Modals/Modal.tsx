import React, {ReactNode} from 'react';
import {useObserver} from "mobx-react"
import './Modal.css';
import CreateDialog from "./CreateDialog";
import UIStore from "../../stores/UIStore";
import JoinDialog from "./JoinDialog";
import JoinOrCreate from "./JoinOrCreate";
import Joining from "./Joining";
import WaitingRoom from "./WaitingRoom";
import {SettingsModal} from "./Settings/SettingsModal";

const Modal: React.FunctionComponent = () => {
    function getModalElements(): ReactNode | null {
        const modalStore = UIStore.store.modalStore;
        if (modalStore.joinOrCreate) {
            return <JoinOrCreate/>
        }
        if (modalStore.join) {
            return <JoinDialog/>
        }
        if (modalStore.joiningRoom) {
            return <Joining/>
        }
        if (modalStore.waitingRoom) {
            return <WaitingRoom/>
        }
        if (modalStore.create) {
            return <CreateDialog/>
        }
        if (modalStore.settings) {
            return <SettingsModal/>
        }
        return null;
    }


    return useObserver(() => {
        const modal = getModalElements();
        if (modal) {
            return (
                <div className={"modal-wrapper"}>
                    {modal}
                </div>
            )
        }
        return null;
    });
}

export default Modal;
