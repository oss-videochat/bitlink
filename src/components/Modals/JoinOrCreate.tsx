import React from 'react';
import './Dialog.css';
import './JoinOrCreate.css'
import UIStore from "../../stores/UIStore";
import logo from '../../assets/logo/logo.svg';

export class JoinOrCreate extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(chosen: string) {
        UIStore.store.modalStore.joinOrCreate = false;
        if (chosen === "join") {
            UIStore.store.modalStore.join = true;
        }
        if (chosen === "create") {
            UIStore.store.modalStore.create = true;
        }
    }

    render() {
        return (
            <div className={"dialog-modal join-or-create"}>
                <img className={"dialog--logo"} src={logo}/>
                <h2 className={"modal--title"}>Join or Create a Room</h2>
                <input onClick={() => this.handleClick("join")} type={"button"} value={"Join Room"}
                       className={"modal--button join-or-create-button"}/>
                <input onClick={() => this.handleClick("create")} type={"button"} value={"Create Room"}
                       className={"modal--button join-or-create-button"}/>
            </div>
        );
    }
}
