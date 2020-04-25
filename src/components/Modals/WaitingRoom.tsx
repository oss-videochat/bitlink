import React from 'react';
import './Dialog.css';

export class WaitingRoom extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className={"dialog-modal"}>
                <h2 className={"modal--title"}>Waiting Room</h2>
                <span className={"dialog-centered-text"}>You are in a waiting room. Please wait for the host to accept you.</span>
            </div>
        );
    }
}
