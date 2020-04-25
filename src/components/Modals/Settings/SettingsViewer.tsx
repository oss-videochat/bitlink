import React from 'react';
import './SettingsViewer.css';
import {SettingsPanels} from "../../../enum/SettingsPanels";
import {MySettings} from "./SettingsViews/MySettings";
import {RoomSettings} from "./SettingsViews/RoomSettings";
import {ParticipantList} from "./SettingsViews/ParticipantList";
import {Report} from "./SettingsViews/Report";

export class SettingsViewer extends React.Component<any, any> {
    getView(){
        switch (this.props.selected) {
            case SettingsPanels.MySettings:
                return <MySettings handleChangesMade={this.props.handleChangesMade} changesMade={this.props.changesMade} events={this.props.events}/>;
            case SettingsPanels.RoomSettings:
                return <RoomSettings handleChangesMade={this.props.handleChangesMade} changesMade={this.props.changesMade} events={this.props.events}/>;
            case SettingsPanels.Participants:
                return <ParticipantList handleChangesMade={this.props.handleChangesMade} changesMade={this.props.changesMade} events={this.props.events}/>
            case SettingsPanels.Report:
                return <Report handleChangesMade={this.props.handleChangesMade} changesMade={this.props.changesMade} events={this.props.events}/>
        }
    }

    render() {
        return (
            <div className={"settings-viewer"}>
                {this.getView()}
                <div className={"settings--button-control"}>
                    <input onClick={this.props.cancel} type={"button"} value={"Cancel"}
                           className={"modal--button cancel"}/>
                    <input onClick={this.props.save} type={"button"} value={"Save"}
                           disabled={!this.props.changesMade} className={"modal--button save"}/>
                </div>
            </div>
        );
    }
}
