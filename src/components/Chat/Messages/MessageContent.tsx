import React from "react";

export default class MessageContent extends React.Component<any, any> {
    render() {
        const text: string = this.props.content;
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
}
