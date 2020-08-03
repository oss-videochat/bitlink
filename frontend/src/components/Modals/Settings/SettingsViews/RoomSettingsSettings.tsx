import React, {useEffect, useState} from 'react';
import IO from "../../../../controllers/IO";
import Spinner from "../../../Util/Spinner";
import {HostDisconnectAction, RoomSettings} from "@bitlink/common";
import {ISettingsPanelProps} from "../SettingsViewer";

export const RoomSettingsSettings: React.FunctionComponent<ISettingsPanelProps> = ({events, handleChangesMade}) => {
    const [currentSettings, setCurrentSettings] = useState<RoomSettings | null>(null);
    const [newSettings, setNewSettings] = useState<RoomSettings | null>(null);

    useEffect(() => {
        IO.getRoomSettings().then((currentSettings: RoomSettings) => {
            setCurrentSettings(currentSettings);
            setNewSettings({...currentSettings});
        });
    }, []);

    useEffect(() =>{
        events.on("save", (cb: () => void) => {
            IO.changeRoomSettings(newSettings!).then(cb).catch(cb);
        });
        return () => {
            events.removeAllListeners("save")
        }
    }, [events, newSettings])

    if (currentSettings === null || newSettings === null) {
        return (
            <div className={"settings-view loading"}>
                <Spinner size={"50px"}/>
            </div>
        )
    }

    return (
        <div className={"settings-view"}>
            <h2 className={"modal--title"}>Room Settings</h2>
            <label>
                Room Name
                <input data-private={"lipsum"} className={"modal--input"} type={"text"} value={newSettings.name}
                       placeholder={"Name"}
                       onChange={(e) => {
                           setNewSettings({
                               ...newSettings,
                               name: e.target.value
                           });
                           handleChangesMade(true)
                       }}/>
            </label>

            <label>
                <input data-private={"lipsum"} className={"modal--input"}
                       checked={newSettings.waitingRoom} type={"checkbox"} placeholder={"Name"}
                       onChange={(e) => {
                           setNewSettings({
                               ...newSettings,
                               waitingRoom: e.target.checked
                           });
                           handleChangesMade(true)
                       }}/>
                Enable Waiting Room
            </label>
            <label>
                On Disconnect
                <select value={newSettings.hostDisconnectAction} onChange={e => {
                    setNewSettings({
                        ...newSettings,
                        hostDisconnectAction: parseInt(e.target.value)
                    });
                    handleChangesMade(true)
                }}>
                    <option value={HostDisconnectAction.TRANSFER_HOST}>Transfer host to random person</option>
                    <option value={HostDisconnectAction.CLOSE_ROOM}>Close the room for all participants</option>
                </select>
            </label>
        </div>
    );

}
