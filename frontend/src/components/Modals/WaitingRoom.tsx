import React from "react";
import "./Dialog.css";

const WaitingRoom: React.FunctionComponent = () => (
  <div className={"dialog-modal"}>
    <h2 className={"modal--title"}>Waiting Room</h2>
    <span className={"dialog-centered-text"}>
      You are in a waiting room. Please wait for the host to accept you.
    </span>
  </div>
);
export default WaitingRoom;
