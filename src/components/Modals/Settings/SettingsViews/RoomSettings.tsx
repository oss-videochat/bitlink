import React, {ChangeEvent} from 'react';
import IO, {RoomSettingsObj} from "../../../../controllers/IO";
import {Spinner} from "../../../Util/Spinner";

export class RoomSettings extends React.Component<any, any> {
    constructor(props: any) {
        super(props);

        this.state = {
            isMounted: true,
            currentSettings: null,
            newSettings: null,
        };

        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount(): void {
        IO.getRoomSettings().then((currentSettings: RoomSettingsObj) => {
            if (this.state.isMounted) {
                this.setState({currentSettings, newSettings: {...currentSettings}});
            }
        });
        this.props.events.on("save", (cb: () => void) => {
            IO.changeRoomSettings(this.state.newSettings).then(cb).catch(cb);
        });

        this.handleChange.bind(this)
    }

    componentWillUnmount(): void {
        this.setState({isMounted: false});
        this.props.events.removeAllListeners("save");
    }

    updateChangesMade() {
        if (JSON.stringify(this.state.currentSettings) !== JSON.stringify(this.state.newSettings)) {
            if(!this.props.changesMade){
                this.props.handleChangesMade(true);
            }
        } else {
            if(this.props.changesMade){
                this.props.handleChangesMade(false);
            }
        }
    }

    handleChange(e: ChangeEvent<HTMLInputElement>) {
        const key = e.target.getAttribute("data-settings-key")!;
        let value: any;
        if(e.target.type === "checkbox"){
            value = e.target.checked;
        } else {
            value = e.target.value;
        }

        this.setState((prevState: any) => {
            const newSettings = {
                ...prevState.newSettings,
                [key]: value
            };

            return {
                newSettings
            }
        });
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        this.updateChangesMade();
    }


    render() {

        if(this.state.currentSettings === null){
            return  (
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
                    <input className={"modal--input"} onChange={this.handleChange} data-settings-key={"name"} type={"text"} value={this.state.newSettings.name} placeholder={"Name"}/>
                </label>

                <label>
                    <input className={"modal--input"} onChange={this.handleChange} data-settings-key={"waitingRoom"} checked={this.state.newSettings.waitingRoom} type={"checkbox"} placeholder={"Name"}/>
                    Enable Waiting Room
                </label>
            </div>
        );
    }
}
