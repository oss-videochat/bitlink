import React from "react";
import { ISettingsPanelProps } from "../SettingsViewer";
import ParticipantList from "../../../Util/ParticipantList";

const Participants: React.FunctionComponent<ISettingsPanelProps> = ({ events }) => (
  <div className={"settings-view"}>
    <h2 className={"modal--title"}>Participant List</h2>
    <ParticipantList />
  </div>
);

export default Participants;
