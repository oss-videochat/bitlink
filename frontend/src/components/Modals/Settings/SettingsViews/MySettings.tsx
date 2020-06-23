import React, {ChangeEvent, useEffect, useState} from 'react';
import MyInfo from "../../../../stores/MyInfo";
import IO from "../../../../controllers/IO";
import {ISettingsPanelProps} from '../SettingsViewer';

const MySettings: React.FunctionComponent<ISettingsPanelProps> = ({events, changesMade, handleChangesMade}) => {
    const [nameInput, setNameInput] = useState(MyInfo.info!.name);
    const [preferredAudio, setPreferredAudio] = useState(MyInfo.preferredInputs.audio || null);
    const [preferredVideo, setPreferredVideo] = useState(MyInfo.preferredInputs.video || null);
    const [deviceList, setDeviceList] = useState([]);

    function updateDeviceList() {
        return new Promise(resolve => {
            const enumerate = () => {
                navigator.mediaDevices.enumerateDevices()
                    .then(deviceList => {
                        setDeviceList(deviceList as any)
                    });
            };

            MyInfo.getStream("camera")
                .then((stream) => {
                    enumerate();
                })
                .catch(enumerate);
        });

    }

    function onSave(cb: () => void) {
        IO.changeName(nameInput).then(cb);
        MyInfo.setPreferredInput("video", preferredVideo);
        MyInfo.setPreferredInput("audio", preferredAudio);
    }


    useEffect(() => {
        updateDeviceList();

    }, []);

    useEffect(() => {
        checkChanges();
        events.on("save", onSave);
        return () => {
            events.removeListener("save", onSave)
        };
    });

    function checkChanges() {
        let changes = false;
        if (nameInput !== MyInfo.info?.name) {
            changes = true;
        }
        if (MyInfo.preferredInputs.audio !== preferredAudio) {
            changes = true;
        }
        if (MyInfo.preferredInputs.video !== preferredVideo) {
            changes = true;
        }
        if (nameInput.length === 0) {
            changes = false;
        }
        if (changesMade !== changes) {
            handleChangesMade(changes);
        }
    }

    function handleInputChange(kind: "video" | "audio", e: ChangeEvent<HTMLSelectElement>) {
        if (kind === "video") {
            setPreferredVideo(e.target.value ?? null);
        } else {
            setPreferredAudio(e.target.value ?? null);
        }
    }

    return (
        <div className={"settings-view"}>
            <h2 className={"modal--title"}>My Settings</h2>
            <label>
                Name
                <input data-private={"lipsum"} className={"modal--input"}
                       onChange={e => {
                           setNameInput(e.target.value);
                       }}
                       value={nameInput} placeholder={"Name"}/>
            </label>
            <label>
                Camera Input
                <select onChange={(e) => handleInputChange("video", e)} className={"modal--select"}
                        value={preferredVideo ?? undefined}>
                    {deviceList
                        .filter((devicesInfo: MediaDeviceInfo) => devicesInfo.kind === "videoinput")
                        .map((devicesInfo: MediaDeviceInfo, index: number) =>
                            <option key={devicesInfo.deviceId}
                                    value={devicesInfo.deviceId}>{devicesInfo.label || "camera " + (index + 1)}</option>
                        )
                    }
                </select>
            </label>

            <label>
                Audio Input
                <select onChange={(e) => handleInputChange("audio", e)} className={"modal--select"}
                        value={preferredAudio ?? undefined}>
                    {deviceList
                        .filter((devicesInfo: MediaDeviceInfo) => devicesInfo.kind === "audioinput")
                        .map((devicesInfo: MediaDeviceInfo, index: number) =>
                            <option
                                key={devicesInfo.deviceId}
                                value={devicesInfo.deviceId}>{devicesInfo.label || "microphone " + (index + 1)}
                            </option>
                        )
                    }
                </select>
            </label>
        </div>
    );
}

export default MySettings;
