import React from "react";
import "./MessageContent.css";
import ParticipantService from "../../../services/ParticipantService";

interface IMessageContentProps {
  content: string;
}

type matcherArray = [
  RegExp,
  (
    before: string | undefined,
    match: string[],
    after: string | undefined
  ) => React.ReactElement | React.ReactElement[] | void
][];

const MessageContent: React.FunctionComponent<IMessageContentProps> = ({ content }) => {
  let id = 0;

  const matchers: matcherArray = [
    [
      /https?:\/\/[^\s]+/g,
      (_, match) => {
        return (
          <a key={id++} rel="noopener noreferrer" target={"_blank"} href={match[0]}>
            {match[0]}
          </a>
        );
      },
    ],
    [
      /@[^\s]+/g,
      (_, match) => {
        const participants = ParticipantService.getByMentionString(match[0]);
        if (participants[0]) {
          return (
            <span key={id++} className={"participant-mention"}>
              @{participants[0].mentionString}
            </span>
          );
        }
        return <span key={id++}>{match[0]}</span>;
      },
    ],
  ];

  function parse(text: string, matcherArray: matcherArray) {
    if (text.length === 0) {
      return;
    }
    if (matcherArray.length === 0) {
      return [<span key={id++}>{text}</span>];
    }

    const arr: React.ReactElement[] = [];

    function addValue(val: React.ReactElement | React.ReactElement[] | undefined | void) {
      // this just allows us to return anything from an array of elements to a single element to no elements
      if (val) {
        if (Array.isArray(val)) {
          arr.push(...val);
        } else {
          arr.push(val);
        }
      }
    }

    const [regExp, callback] = matcherArray[0];
    const matches = Array.from(text.matchAll(regExp));
    const splits = text.split(regExp);
    splits.forEach((split: string, index: number) => {
      addValue(parse(split, matcherArray.slice(1))); // this text obv didn't match the first one so check the next one
      if (matches[index]) {
        addValue(callback(split, matches[index], splits[index + 1])); // run the callback passing the before string, match array, and the after string
      }
    });
    return arr;
  }

  return (
    <span data-private={""} className={"message--content"}>
      {parse(content, matchers)!}
    </span>
  );
};
export default MessageContent;
