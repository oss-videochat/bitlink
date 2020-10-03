import React from "react";
import "./SettingsPanelItem.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SettingsPanels } from "../../../enum/SettingsPanels";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

interface ISettingsPanelItemProps {
    panel: SettingsPanels;
    onSelect: (panel: SettingsPanels) => void;
    selected: SettingsPanels;
    icon: IconProp;
    text: string;
}

const SettingsPanelItem: React.FunctionComponent<ISettingsPanelItemProps> = ({
    panel,
    selected,
    onSelect,
    icon,
    text,
}) => (
    <div
        onClick={() => onSelect(panel)}
        className={"settings--item " + (selected === panel ? "selected" : "")}
    >
        <span className={"settings--item--icon"}>
            <FontAwesomeIcon icon={icon} />
        </span>
        <span className={"settings--item--text"}>{text}</span>
    </div>
);
export default SettingsPanelItem;
