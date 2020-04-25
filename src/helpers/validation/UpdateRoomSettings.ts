const Ajv = require('ajv');

const JSON = {
    additionalData: false,
    type: "object",
    properties: {
        name: {type: "string"},
        waitingRoom: {type: "boolean"}
    }
};


export function UpdateRoomSettingsValidation(newSettings) {
    if (!newSettings) {
        return false;
    }
    const ajv = new Ajv();
    const validate = ajv.compile(JSON);
    return validate(newSettings);
}
