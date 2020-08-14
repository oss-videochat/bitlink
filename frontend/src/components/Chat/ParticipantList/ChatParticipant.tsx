import React from "react";
import { useObserver } from "mobx-react";
import "./ChatParticipant.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophoneSlash, faVideoSlash } from "@fortawesome/free-solid-svg-icons";
import Participant from "../../../models/Participant";
import { MessageType } from "@bitlink/common";
import { SelectedRoom } from "../ChatContainer";
import { MessageGroup } from "../../../interfaces/MessageGroup";
import { Message } from "../../../interfaces/Message";

interface IChatParticipantProps {
  onChosen: (info: SelectedRoom) => void;
  selected: boolean;
  type: MessageType;
  item: Participant | MessageGroup;
  lastMessage?: Message;
}

const ChatParticipant: React.FunctionComponent<IChatParticipantProps> = ({
  onChosen,
  selected,
  type,
  item,
  lastMessage,
}) => {
  return useObserver(() => {
    let name;
    let id: string;
    let displayMediaState;
    let hasAudio;
    let hasVideo;

    if (type === MessageType.DIRECT) {
      const participant = item as Participant;
      name = participant.info.name;
      id = participant.info.id;
      displayMediaState = participant.info.isAlive;
      hasAudio = participant.hasAudio;
      hasVideo = participant.hasVideo;
    } else {
      const group = item as MessageGroup;
      name = group.name;
      id = group.id;
      displayMediaState = false;
      hasAudio = false;
      hasVideo = false;
    }

    return (
      <div
        onClick={() => onChosen({ type, id })}
        className={"chat-participant " + (selected ? "selected" : "")}
      >
        <div className={"chat-participant-name-container"}>
          <span data-private={""} className={"chat-participant--name"}>
            {name}
          </span>
          {displayMediaState ? (
            <div className={"chat-participant---media-state"}>
              <span className={"participant--icon"}>
                {hasAudio ? null : <FontAwesomeIcon icon={faMicrophoneSlash} />}
              </span>
              <span className={"participant--icon"}>
                {hasVideo ? null : <FontAwesomeIcon icon={faVideoSlash} />}
              </span>
            </div>
          ) : null}
        </div>
        {lastMessage && (
          <span data-private={""} className={"chat-participant--content"}>
            {lastMessage.content}
          </span>
        )}
      </div>
    );
  });
};
export default ChatParticipant;
