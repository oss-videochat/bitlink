import React from "react";
import "./TilePlaceholder.css";
import RoomId from "../../Header/RoomId";
import RoomStore from "../../../stores/RoomStore";
import { useObserver } from "mobx-react";

const TilePlaceholder: React.FunctionComponent = () =>
  useObserver(() => (
    <div className={"video-placeholder"}>
      <span className={"video-placeholder--message"}>
        Click the button to invite others.
        {RoomStore.info ? <RoomId /> : null}
      </span>
    </div>
  ));
export default TilePlaceholder;
