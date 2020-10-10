import React from "react";
import "./Dialog.css";
import "./Disconnected.css";

const Disconnected: React.FunctionComponent = () => {
    return (
        <div className={"dialog-modal"}>
            <h2 className={"modal--title"}>Uh Oh!</h2>
            <span className={"dialog-centered-text"}>You were disconnected from the server.</span>
            <input
                onClick={() => {
                    window.location.reload();
                }}
                type={"button"}
                value={"Reload"}
                className={"modal--button reload-button"}
            />
        </div>
    );
};
export default Disconnected;
