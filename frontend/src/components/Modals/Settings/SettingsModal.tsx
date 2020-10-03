import React, { useRef, useState } from "react";
import SettingsPanel from "./SettingsPanel";
import "./SettingsModal.css";
import SettingsViewer from "./SettingsViewer";
import { SettingsPanels } from "../../../enum/SettingsPanels";
import UIStore from "../../../stores/UIStore";
import * as Events from "events";
import MyInfo from "../../../stores/MyInfoStore";
import NotificationService from "../../../services/NotificationService";
import { NotificationType } from "../../../enum/NotificationType";

interface SettingsModalState {
    selectedPanel: SettingsPanels;
    saveEnabled: boolean;
    changesMade: boolean;
}

export const SettingsModal: React.FunctionComponent = () => {
    const [selectedPanel, setSelectedPanel] = useState(
        MyInfo.isHost ? SettingsPanels.RoomSettings : SettingsPanels.Participants
    );
    const [saveEnabled, setSaveEnabled] = useState(false);
    const [changesMade, setChangesMade] = useState(false);
    const events = useRef(new Events.EventEmitter());

    function handleChangesMade(isChangesMade: boolean) {
        setChangesMade(isChangesMade);
    }

    function handleSelect(settings: SettingsPanels) {
        setSelectedPanel(settings);
        setSaveEnabled(false);
    }

    function handleSave() {
        setSaveEnabled(false);
        events.current.emit("save", (err?: string) => {
            if (err) {
                NotificationService.add(
                    NotificationService.createUINotification(err, NotificationType.Error)
                );
                return;
            }
            NotificationService.add(
                NotificationService.createUINotification(
                    "Settings Saved!",
                    NotificationType.Success
                )
            );
            UIStore.store.modalStore.settings = false;
        });
    }

    function handleCancel() {
        UIStore.store.modalStore.settings = false;
    }

    return (
        <div className={"dialog-modal settings-modal"}>
            <SettingsPanel selected={selectedPanel} onSelect={handleSelect} />
            <SettingsViewer
                events={events.current}
                cancel={handleCancel}
                save={handleSave}
                selected={selectedPanel}
                changesMade={changesMade}
                handleChangesMade={handleChangesMade}
            />
        </div>
    );
};
