import React from 'react';
import './VideoPlaceholder.css'

export class VideoPlaceholder extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className={"video-placeholder"}>
                <span className={"video-placeholder--message"}></span>
            </div>
        );
    }
}
