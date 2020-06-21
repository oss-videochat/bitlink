import React from 'react';
import {observer} from "mobx-react"
import SettingsPanel from "./SettingsPanel";
import './SettingsModal.css';
import SettingsViewer from "./SettingsViewer";
import {SettingsPanels} from "../../../enum/SettingsPanels";
import UIStore from "../../../stores/UIStore";
import * as Events from 'events';
import NotificationStore, {NotificationType, UINotification} from "../../../stores/NotificationStore";
import MyInfo from "../../../stores/MyInfo";

interface SettingsModalState {
    selectedPanel: SettingsPanels,
    saveEnabled: boolean,
    changesMade: boolean,
}

@observer
export class SettingsModal extends React.Component<any, SettingsModalState> {
    private events = new Events.EventEmitter();

    constructor(props: any) {
        super(props);
        this.state = {
            selectedPanel: MyInfo.info?.isHost ? SettingsPanels.RoomSettings : SettingsPanels.Participants,
            saveEnabled: false,
            changesMade: false,
        };
    }

    handleChangesMade(isChangesMade: boolean) {
        this.setState({changesMade: isChangesMade});
    }

    handleSelect(settings: SettingsPanels) {
        this.setState({selectedPanel: settings, saveEnabled: false});
    }

    handleSave() {
        this.setState({saveEnabled: false});
        this.events.emit("save", (err?: string) => {
            if (err) {
                NotificationStore.add(new UINotification(err, NotificationType.Error));
                return;
            }
            NotificationStore.add(new UINotification("Settings Saved!", NotificationType.Success));
            UIStore.store.modalStore.settings = false;
        });
    }

    handleCancel() {
        UIStore.store.modalStore.settings = false;
    }

    render() {
        return (
            <div className={"dialog-modal settings-modal"}>
                <SettingsPanel selected={this.state.selectedPanel}
                               onSelect={this.handleSelect.bind(this)}/>
                <SettingsViewer events={this.events}
                                cancel={this.handleCancel.bind(this)}
                                save={this.handleSave.bind(this)}
                                selected={this.state.selectedPanel}
                                changesMade={this.state.changesMade}
                                handleChangesMade={this.handleChangesMade.bind(this)}
                />
            </div>
        );
    }
}
