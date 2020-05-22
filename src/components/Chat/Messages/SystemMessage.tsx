import React from 'react';
import './SystemMessage.css'


export class SystemMessage extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className={"message system"}>
                <div className={"message--content-container"}>
                    <span className={"message--date"}>{(new Date(this.props.message.created)).toLocaleString()}</span>
                    <span data-private={""} className={"message--content"}>{this.props.message.content}</span>
                </div>
            </div>
        );
    }
}
