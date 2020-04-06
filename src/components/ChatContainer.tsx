import React from 'react';
import {observer} from "mobx-react"
import {ChatParticipantList} from "./ChatParticipantList";
import {MessagesContainer} from "./MessagesContainer";

export class ChatContainer extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state =  {
            selectedUser: "everyone",
        };
        this. _handleUserSelect =  this._handleUserSelect.bind(this);
    }

    _handleUserSelect(id: string){
        this.setState({selectedUser: id});
    }

    render() {
        return (
            <div className={"chat-container"}>
                <ChatParticipantList onUserSelect={this._handleUserSelect}/>
                <MessagesContainer selectedUser={this.state.selectedUser}/>
            </div>
        );
    }
}
