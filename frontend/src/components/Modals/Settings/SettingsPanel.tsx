import React from 'react';
import './SettingsPanel.css'
import MyInfo from "../../../stores/MyInfoStore";
import {SettingsPanels} from "../../../enum/SettingsPanels";
import SettingsPanelItem from "./SettingsPanelItem";
import {faDoorClosed, faExclamationCircle, faUserCog, faUsers, faVideo} from "@fortawesome/free-solid-svg-icons";

interface ISettingsPanelProps {
    selected: SettingsPanels,
    onSelect: (type: SettingsPanels) => void,
}

const SettingsPanel: React.FunctionComponent<ISettingsPanelProps> = ({onSelect, selected}) => (
    <div className={"settings-panel"}>
        {
            MyInfo.isHost &&
                <SettingsPanelItem panel={SettingsPanels.RoomSettings} onSelect={onSelect} selected={selected} icon={faDoorClosed} text={"Room Settings"}/>
        }
        <SettingsPanelItem panel={SettingsPanels.Participants} onSelect={onSelect} selected={selected} icon={faUsers} text={"Participant List"}/>
        <SettingsPanelItem panel={SettingsPanels.MySettings} onSelect={onSelect} selected={selected} icon={faUserCog} text={"My Settings"}/>
        <SettingsPanelItem panel={SettingsPanels.CameraSettings} onSelect={onSelect} selected={selected} icon={faVideo} text={"Camera Settings"}/>
        <SettingsPanelItem panel={SettingsPanels.Report} onSelect={onSelect} selected={selected} icon={faExclamationCircle} text={"Report"}/>
    </div>
);
export default SettingsPanel;

