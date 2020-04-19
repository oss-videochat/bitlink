import React from 'react';
import './Dialog.css';
import {Spinner} from "../Util/Spinner";

export class Joining extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className={"dialog-modal"}>
                <h2 className={"modal--title"}>Joining Room</h2>
                <span className={"dialog-centered-text"}>Please wait...</span>
                <div className={"spinner-wrapper"}>
                    <Spinner size={"40px"}/>
                </div>
            </div>
        );
    }
}
