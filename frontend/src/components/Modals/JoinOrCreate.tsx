import React from "react";
import "./Dialog.css";
import "./JoinOrCreate.css";
import UIStore from "../../stores/UIStore";
import LegalText from "../LegalText";
import { Logo } from "../Util/Logo";

const JoinOrCreate: React.FunctionComponent = () => {
  function handleClick(chosen: string) {
    UIStore.store.modalStore.joinOrCreate = false;
    if (chosen === "join") {
      UIStore.store.modalStore.join = true;
    }
    if (chosen === "create") {
      UIStore.store.modalStore.create = true;
    }
  }

  return (
    <div className={"dialog-modal join-or-create"}>
      <Logo />
      <h2 className={"modal--title"}>Join or Create a Room</h2>
      <input
        onClick={() => handleClick("join")}
        type={"button"}
        value={"Join Room"}
        className={"modal--button join-or-create-button"}
      />
      <input
        onClick={() => handleClick("create")}
        type={"button"}
        value={"Create Room"}
        className={"modal--button join-or-create-button"}
      />
      <LegalText />
    </div>
  );
};

export default JoinOrCreate;
