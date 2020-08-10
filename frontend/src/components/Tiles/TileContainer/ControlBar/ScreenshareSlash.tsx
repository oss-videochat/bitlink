import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDesktop, faSlash} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import './ScreenshareSlash.css'

const ScreenShareSlash: React.FunctionComponent = () => (
    <span className={"screenshare-slash"}>
        <span className={"screenshare-slash__slash"}><FontAwesomeIcon icon={faSlash}/></span>
        <FontAwesomeIcon icon={faDesktop}/>
    </span>
);
export default ScreenShareSlash;
