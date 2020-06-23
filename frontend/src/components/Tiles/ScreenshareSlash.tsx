import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDesktop, faSlash} from "@fortawesome/free-solid-svg-icons";
import React from "react";

const ScreenShareSlash: React.FunctionComponent = () => (
    <span style={{
        position: "relative"
    }} className={"screenshare-slash"}>
        <span style={{
            position: "absolute",
            background: "transparent"
        }} className={"screenshare-slash__slash"}><FontAwesomeIcon icon={faSlash}/></span>
        <FontAwesomeIcon icon={faDesktop}/>
    </span>
);
export default ScreenShareSlash;
