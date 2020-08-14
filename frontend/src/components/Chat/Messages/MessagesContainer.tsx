import React, { useEffect, useState } from "react";
import { useObserver } from "mobx-react";
import MyInfo from "../../../stores/MyInfoStore";
import MessageComponent from "./MessageComponent";
import "./MessagesContainer.css";
import SystemMessage from "./SystemMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import UIStore from "../../../stores/UIStore";
import ChatInput from "../ChatInput";
import { SelectedRoom } from "../ChatContainer";
import ChatStoreService from "../../../services/ChatStoreService";
import { MessageType } from "@bitlink/common";
import { DirectMessage, GroupMessage } from "../../../interfaces/Message";
import ParticipantService from "../../../services/ParticipantService";
import RoomService from "../../../services/RoomService";

interface IMessagesContainerProps {
  selectedRoom: SelectedRoom;
}

const MessagesContainer: React.FunctionComponent<IMessagesContainerProps> = ({ selectedRoom }) => {
  const list = React.createRef<HTMLDivElement>();
  const [shouldScroll, setShouldScroll] = useState(true);

  useEffect(() => {
    if (shouldScroll && list.current) {
      const el = list.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [shouldScroll, list]);

  useEffect(() => {
    if (!list.current) {
      return;
    }
    const el = list.current;

    function scroll() {
      setShouldScroll(el.scrollHeight - (el.scrollTop + el.clientHeight) <= 15);
    }

    el.addEventListener("scroll", scroll);
    return () => el.removeEventListener("scroll", scroll);
  }, [list]);

  return useObserver(() => {
    let lastParticipant = "";
    let lastTime = 0;

    let name;
    if (selectedRoom.type === MessageType.DIRECT) {
      name = ParticipantService.getById(selectedRoom.id)?.info.name;
    } else {
      name = RoomService.getGroup(selectedRoom.id)?.name;
    }

    return (
      <div className={"message-container"}>
        <div className={"message-container--top-bar"}>
          <span
            onClick={() => {
              UIStore.store.participantPanel = true;
            }}
            className={"message-container--back-button"}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </span>
          <span data-private={"lipsum"} className={"message-container--participant-name"}>
            {name}
          </span>
        </div>
        <div className={"message-list-wrapper"}>
          <div ref={list} className={"message-list"}>
            {ChatStoreService.getMessages(selectedRoom.type, selectedRoom.id).map(
              (message, index) => {
                let el;
                switch (message.type) {
                  case MessageType.SYSTEM: {
                    el = <SystemMessage key={index} message={message} />;
                    lastParticipant = "system";
                    break;
                  }
                  case MessageType.GROUP: {
                    const groupMessage = message as GroupMessage;
                    el = (
                      <MessageComponent
                        startGroup={
                          lastParticipant !== groupMessage.from.info.id ||
                          groupMessage.created.getTime() - lastTime > 1000 * 60 * 5
                        }
                        key={groupMessage.id}
                        messageId={groupMessage.id}
                        fromMe={groupMessage.from.info.id === MyInfo.participant!.id}
                        message={groupMessage}
                        nextEdit={() =>
                          ChatStoreService.editNextMessage(
                            selectedRoom.type,
                            selectedRoom.id,
                            message
                          )
                        }
                        previousEdit={() =>
                          ChatStoreService.editPreviousMessage(
                            selectedRoom.type,
                            selectedRoom.id,
                            message
                          )
                        }
                      />
                    );
                    lastParticipant = groupMessage.group.id;
                    break;
                  }
                  case MessageType.DIRECT: {
                    const directMessage = message as DirectMessage;
                    el = (
                      <MessageComponent
                        startGroup={
                          lastParticipant !== directMessage.from.info.id ||
                          directMessage.created.getTime() - lastTime > 1000 * 60 * 5
                        }
                        key={directMessage.id}
                        messageId={directMessage.id}
                        fromMe={directMessage.from.info.id === MyInfo.participant!.id}
                        message={directMessage}
                        nextEdit={() =>
                          ChatStoreService.editNextMessage(
                            selectedRoom.type,
                            selectedRoom.id,
                            message
                          )
                        }
                        previousEdit={() =>
                          ChatStoreService.editPreviousMessage(
                            selectedRoom.type,
                            selectedRoom.id,
                            message
                          )
                        }
                      />
                    );
                    lastParticipant = directMessage.from.info.id;
                  }
                }
                lastTime = message.created.getTime();
                return el;
              }
            )}
          </div>
        </div>
        {selectedRoom.type === MessageType.GROUP ||
        ParticipantService.getById(selectedRoom.id)?.info.isAlive ? (
          <ChatInput selectedRoom={selectedRoom} />
        ) : null}
      </div>
    );
  });
};
export default MessagesContainer;
