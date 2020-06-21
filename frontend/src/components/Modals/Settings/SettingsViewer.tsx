import React from 'react';
import './SettingsViewer.css';
import {SettingsPanels} from "../../../enum/SettingsPanels";
import MySettings from "./SettingsViews/MySettings";
import {RoomSettings} from "./SettingsViews/RoomSettings";
import ParticipantList from "./SettingsViews/ParticipantList";
import Report from "./SettingsViews/Report";
import * as Events from 'events';

interface ISettingsViewerProps {
    selected: SettingsPanels,
    events: Events.EventEmitter,
    cancel: () => void,
    save: () => void,
    changesMade: boolean,
    handleChangesMade: (isChangesMade: boolean) => void
}

export interface ISettingsPanelProps {
    handleChangesMade: (isChangesMade: boolean) => void
    changesMade: boolean
    events: Events.EventEmitter
}

const SettingsViewer: React.FunctionComponent<ISettingsViewerProps> = ({selected, events, cancel, save, changesMade, handleChangesMade}) => {
    function getView(): React.ComponentClass<ISettingsPanelProps> | React.FunctionComponent<ISettingsPanelProps> {
        switch (selected) {
            case SettingsPanels.MySettings:
                return MySettings;
            case SettingsPanels.RoomSettings:
                return RoomSettings;
            case SettingsPanels.Participants:
                return ParticipantList;
            case SettingsPanels.Report:
                return Report;
        }
    }

    const View = getView();

    return (
        <div className={"settings-viewer"}>
            <View handleChangesMade={handleChangesMade} changesMade={changesMade}
                  events={events}/>
            <div className={"settings--button-control"}>
                <input data-private={"lipsum"} onClick={cancel} type={"button"} value={"Cancel"}
                       className={"modal--button cancel"}/>
                <input data-private={"lipsum"} onClick={save} type={"button"} value={"Save"}
                       disabled={!changesMade} className={"modal--button save"}/>
            </div>
        </div>
    )
}
export default SettingsViewer;
