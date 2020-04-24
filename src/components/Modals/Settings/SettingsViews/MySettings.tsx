import React, {ChangeEvent} from 'react';
import MyInfo from "../../../../stores/MyInfo";
import IO from "../../../../controllers/IO";

export class MySettings extends React.Component<any, any> {
    constructor(props: any) {
        super(props);

        this.state = {
            nameInput: MyInfo.info!.name,
            preferredAudio: MyInfo.preferredInputs.audio || undefined,
            preferredVideo: MyInfo.preferredInputs.video || undefined,
            deviceList: [],
        };
    }


    updateDeviceList() {
        return new Promise(resolve => {
            const enumerate = () => {
                navigator.mediaDevices.enumerateDevices()
                    .then(deviceList => {
                        this.setState({
                            deviceList
                        });
                    });
            };

            MyInfo.getVideoStream()
                .then((stream) => {
                    enumerate();
                })
                .catch(enumerate);
        });

    }

    componentDidMount(): void {
        this.props.events.on("save", (cb: () => void) => {
            IO.changeName(this.state.inputValue).then(cb);
            MyInfo.setPreferredInput("video", this.state.preferredVideo);
            MyInfo.setPreferredInput("audio", this.state.preferredAudio);
        });
        this.updateDeviceList();
    }

    componentWillUnmount(): void {
        this.props.events.removeAllListeners("save");
    }

    handleNameChange(e: ChangeEvent<HTMLInputElement>) {
        this.setState({nameInput: e.target.value});
    }

    checkChanges() {
        let changes = false;
        if (this.state.nameInput !== MyInfo.info?.name) {
            changes = true;
        }
        if (MyInfo.preferredInputs.audio !== this.state.preferredAudio) {
            changes = true;
        }
        if (MyInfo.preferredInputs.video !== this.state.preferredVideo) {
            changes = true;
        }
        if (this.props.changesMade !== changes) {
            this.props.handleChangesMade(changes);
        }
    }

    handleInputChange(kind: "video" | "audio", e: ChangeEvent<HTMLSelectElement>) {
        if (kind === "video") {
            this.setState({preferredVideo: e.target.value});
        } else {
            this.setState({preferredAudio: e.target.value});
        }
    }

    componentDidUpdate(): void {
        this.checkChanges();
    }


    render() {
        return (
            <div className={"settings-view"}>
                <h2 className={"modal--title"}>My Settings</h2>
                <label>
                    Name
                    <input className={"modal--input"} onChange={this.handleNameChange.bind(this)}
                           value={this.state.inputValue} placeholder={"Name"}/>
                </label>
                <label>
                    Camera Input
                    <select onChange={(e) => this.handleInputChange("video", e)} className={"modal--select"}
                            value={this.state.preferredVideo}>
                        {this.state.deviceList
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
                    <select onChange={(e) => this.handleInputChange("audio", e)} className={"modal--select"}
                            value={this.state.preferredAudio}>
                        {this.state.deviceList
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
}
