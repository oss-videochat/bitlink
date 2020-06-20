import React, {ReactNode} from 'react';
import {observer} from "mobx-react"
import './Modal.css';
import {CreateDialog} from "./CreateDialog";
import UIStore from "../../stores/UIStore";
import {JoinDialog} from "./JoinDialog";
import {JoinOrCreate} from "./JoinOrCreate";
import {Joining} from "./Joining";
import {WaitingRoom} from "./WaitingRoom";
import {SettingsModal} from "./Settings/SettingsModal";

@observer
export class Modal extends React.Component<any, any> {
    getModalElements(): ReactNode | null {
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

    render() {
        const modal = this.getModalElements();
        if (modal) {
            return (
                <div className={"modal-wrapper"}>
                    {modal}
                </div>
            )
        }
        return null;

    }
}
