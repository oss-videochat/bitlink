import React from 'react';
import {observer} from "mobx-react"
import {observable} from "mobx"
import './VideoContainer.css';

export class VideoContainer extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className={"video-container"}>
            </div>
        );
    }
}
