import {HostDisconnectAction, RoomSettings} from "@bitlink/common";

import * as Ajv from 'ajv';

const JSON = {
    additionalProperties: false,
    type: "object",
    properties: {
        newSettings: {
            type: "object",
            additionalProperties: false,
            properties: {
                name: {type: "string"},
                waitingRoom: {type: "boolean"},
                hostDisconnectAction: {type: "number"}
            }
        }
    }
};


export function handleUpdateRoomSettings(newSettings: any) {
    if (!newSettings) {
        return false;
    }
    const ajv = new Ajv();
    const validate = ajv.compile(JSON);
    return validate(newSettings) && Object.values(HostDisconnectAction).includes(newSettings.newSettings.hostDisconnectAction);
}
