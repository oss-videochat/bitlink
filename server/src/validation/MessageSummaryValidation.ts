import { MessageType } from "@bitlink/common";

const Ajv = require("ajv");

const common = {
  // id: {type: "string"},
  content: { type: "string" },
  // created: {type: "number"},
  type: { type: "number" },
};

const groupMessage = {
  additionalProperties: false,
  type: "object",
  properties: {
    ...common,
    group: { type: "string" },
  },
};

const directMessage = {
  additionalProperties: false,
  type: "object",
  properties: {
    ...common,
    to: { type: "string" },
  },
};

export function MessageSummaryValidation(summary: any, type: MessageType) {
  if (!summary) {
    return false;
  }
  const ajv = new Ajv();
  let json;
  if (type === MessageType.GROUP) {
    json = groupMessage;
  } else if (type === MessageType.DIRECT) {
    json = directMessage;
  } else {
    return false;
  }
  const validate = ajv.compile(json);
  return validate(summary);
}
