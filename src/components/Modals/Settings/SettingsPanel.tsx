import React from 'react';
import './SettingsPanel.css'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faDoorClosed, faExclamationCircle, faUserCog, faUsers} from '@fortawesome/free-solid-svg-icons'
import MyInfo from "../../../stores/MyInfo";
import {SettingsPanels} from "../../../enum/SettingsPanels";


export class SettingsPanel extends React.Component<any, any> {
    handleOnClick(type: SettingsPanels) {
        this.props.onSelect(type);
    }

    handleOnClickGenerator(type: SettingsPanels) {
        return (function (this: SettingsPanel) {
            this.handleOnClick(type);
        }).bind(this);
    }

    render() {
        return (
            <div className={"settings-panel"}>
                {
                    MyInfo.info?.isHost ?
                        <div onClick={this.handleOnClickGenerator(SettingsPanels.RoomSettings)}
                             className={"settings--item " + (this.props.selected === SettingsPanels.RoomSettings ? "selected" : "")}>
                            <span className={"settings--item--icon"}>
                                <FontAwesomeIcon icon={faDoorClosed}/>
                            </span>
                        </div>
                        : null
                }
                <div onClick={this.handleOnClickGenerator(SettingsPanels.Participants)}
                     className={"settings--item " + (this.props.selected === SettingsPanels.Participants ? "selected" : "")}>
                    <span className={"settings--item--icon"}>
                        <FontAwesomeIcon icon={faUsers}/>
                    </span>
                </div>
                <div onClick={this.handleOnClickGenerator(SettingsPanels.MySettings)}
                     className={"settings--item " + (this.props.selected === SettingsPanels.MySettings ? "selected" : "")}>
                    <span className={"settings--item--icon"}>
                        <FontAwesomeIcon icon={faUserCog}/>
                    </span>
                </div>
                <div onClick={this.handleOnClickGenerator(SettingsPanels.Report)}
                     className={"settings--item " + (this.props.selected === SettingsPanels.Report ? "selected" : "")}>
                    <span className={"settings--item--icon"}>
                        <FontAwesomeIcon icon={faExclamationCircle}/>
                    </span>
                </div>
            </div>
        );
    }
}
