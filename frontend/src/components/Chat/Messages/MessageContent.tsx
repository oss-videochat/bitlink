import React from "react";

interface IMessageContentProps {
    content: string
}

const MessageContent: React.FunctionComponent<IMessageContentProps> = ({content}) => {
    const text: string = content;
    const linkRe: RegExp = /https?:\/\/[^\s]+/g;
    const matches: string[] = Array.from(text.matchAll(linkRe)).map((arr: string[]) => arr[0]);
    const splits = text.split(linkRe);
    const jsx: Array<React.ClassicElement<any>> = [];

    splits.forEach((split: string, index: number) => {
        jsx.push(<span key={split}>{split}</span>);
        if (matches.length - 1 >= index) {
            jsx.push(<a target={"_blank"} key={split} href={matches[index]}>{matches[index]}</a>)
        }
    });

    return (
        <span data-private={""} className={"message--content"}>{jsx}</span>
    )
}
export default MessageContent;
