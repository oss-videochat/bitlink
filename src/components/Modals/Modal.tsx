import React, {ReactNode} from 'react';
import {observer} from "mobx-react"
import './Modal.css';
import {CreateDialog} from "./CreateDialog";
import UIStore from "../../stores/UIStore";
import {JoinDialog} from "./JoinDialog";
import {JoinOrCreate} from "./JoinOrCreate";

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
        if (modalStore.create) {
            return <CreateDialog/>
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
