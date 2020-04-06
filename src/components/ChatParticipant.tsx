import React from 'react';
import {observer} from "mobx-react"

@observer
export class ChatParticipant extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className={"chat-participant"}>
                <span className={"chat-participant--name"}>{this.props.participant.name || this.props.participant.id}</span>
            </div>
        );
    }
}
