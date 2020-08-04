import * as Ajv from "ajv";
import {MediaState} from "@bitlink/common";

const JSON = {
    additionalProperties: false,
    type: "object",
    properties: {
        source: {type: "string"},
        action: {type: "string"},
    }
};


export function handleProducerAction(data: any) {
    if (!data) {
        return false;
    }
    const ajv = new Ajv();
    const validate = ajv.compile(JSON);
    return validate(data)
        && ["camera", "microphone", "screen"].includes(data.source)
        && ["pause", "resume", "close"].includes(data.action);
}
