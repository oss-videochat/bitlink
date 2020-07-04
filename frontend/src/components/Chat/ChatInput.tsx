import React, {useEffect, useRef, useState} from "react";
import IO from "../../controllers/IO";
import ChatStore from "../../stores/ChatStore";
import './ChatInput.css';
import Participant from "../../models/Participant";
import ParticipantsStore from "../../stores/ParticipantsStore";

interface IChatInputProps {
    selectedUser: string
}

const ChatInput: React.FunctionComponent<IChatInputProps> = ({selectedUser}) => {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [inputValue, setInputValue] = useState("");
    const [mentions, setMentions] = useState<Participant[]>([]);
    const [selectionLocation, setSelectionLocation] = useState(0);

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (inputValue.trim().length > 0) {
                IO.send(selectedUser, inputValue);
                setInputValue("");
            }
        }
        if (e.key === "ArrowUp" && inputValue === "") {
            ChatStore.editNextMessage({selectedUser});
        }
    }

    function handleSelectionChange() {
        if(!textAreaRef.current){
            setMentions([]);
            return;
        }
        const textArea = textAreaRef.current;
        if(textArea.selectionStart !== textArea.selectionEnd){ // they are selecting something we don't want to bother them
            setMentions([]);
            return;
        }
        const latestAtIndex = inputValue.lastIndexOf("@", textArea.selectionStart - 1);
        if(latestAtIndex === -1){
            setMentions([]);
            return;
        }
        const indexOfNextSpace = inputValue.indexOf(" ", latestAtIndex);
        if(indexOfNextSpace > 0 && indexOfNextSpace < textArea.selectionStart){
            setMentions([]);
            return;
        }
        const searchString = inputValue.substring(latestAtIndex, indexOfNextSpace > 0 ? indexOfNextSpace : undefined);
        setMentions(ParticipantsStore.filterByMentionString(searchString));
    }

    function handleMentionSelection(participant: Participant){
        if(!textAreaRef.current){
            setMentions([]);
            return;
        }
        const textArea = textAreaRef.current;
        const latestAtIndex = inputValue.lastIndexOf("@", textArea.selectionStart - 1);
        const indexOfNextSpace = inputValue.indexOf(" ", latestAtIndex);
        setInputValue(`${inputValue.substring(0, latestAtIndex + 1)}${participant.mentionString}${inputValue.substring(indexOfNextSpace > 0 ? indexOfNextSpace : latestAtIndex + 1)}`);
        setSelectionLocation(`${inputValue.substring(0, latestAtIndex)}${participant.mentionString}`.length + 2);
        handleSelectionChange();
    }

    useEffect(() => {
        if(!textAreaRef.current){
            return;
        }
        textAreaRef.current.focus();
        textAreaRef.current.setSelectionRange(selectionLocation, selectionLocation);
    }, [selectionLocation])

    return (
        <div className={"chat-input"}>
            {
                mentions.length > 0 &&
                <div className={"mention-container"}>
                    <div className={"mention-wrapper"}>
                    {
                        mentions.map(mention =>
                            <div onClick={() => handleMentionSelection(mention)} key={mention.id} className={"mention-container__mention"}>
                                {mention.name}
                            </div>
                        )
                    }
                    </div>
                </div>
            }
            <textarea ref={textAreaRef} data-private={"lipsum"} onKeyDown={handleKeyDown}
                      onKeyUp={handleSelectionChange}
                      onClick={handleSelectionChange}
                      placeholder={"Say something..."}
                      className={"chat-input__input"} value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}/>
        </div>
    );
};

export default ChatInput;
