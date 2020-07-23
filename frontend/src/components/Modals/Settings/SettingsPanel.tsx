import React from 'react';
import './SettingsPanel.css'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faDoorClosed, faExclamationCircle, faUserCog, faUsers} from '@fortawesome/free-solid-svg-icons'
import MyInfo from "../../../stores/MyInfoStore";
import {SettingsPanels} from "../../../enum/SettingsPanels";

interface ISettingsPanelProps {
    selected: SettingsPanels,
    onSelect: (type: SettingsPanels) => void,
}

const SettingsPanel: React.FunctionComponent<ISettingsPanelProps> = ({onSelect, selected}) => (
    <div className={"settings-panel"}>
        {
            MyInfo.info?.isHost ?
                <div onClick={() => onSelect(SettingsPanels.RoomSettings)}
                     className={"settings--item " + (selected === SettingsPanels.RoomSettings ? "selected" : "")}>
                            <span className={"settings--item--icon"}>
                                <FontAwesomeIcon icon={faDoorClosed}/>
                            </span>
                </div>
                : null
        }
        <div onClick={() => onSelect(SettingsPanels.Participants)}
             className={"settings--item " + (selected === SettingsPanels.Participants ? "selected" : "")}>
                    <span className={"settings--item--icon"}>
                        <FontAwesomeIcon icon={faUsers}/>
                    </span>
        </div>
        <div onClick={() => onSelect(SettingsPanels.MySettings)}
             className={"settings--item " + (selected === SettingsPanels.MySettings ? "selected" : "")}>
                    <span className={"settings--item--icon"}>
                        <FontAwesomeIcon icon={faUserCog}/>
                    </span>
        </div>
        <div onClick={() => onSelect(SettingsPanels.Report)}
             className={"settings--item " + (selected === SettingsPanels.Report ? "selected" : "")}>
                    <span className={"settings--item--icon"}>
                        <FontAwesomeIcon icon={faExclamationCircle}/>
                    </span>
        </div>
    </div>
);
export default SettingsPanel;

