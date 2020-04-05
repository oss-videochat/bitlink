import React from 'react';
import {observer} from "mobx-react"
import {observable} from "mobx"

export class VideoContainer extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className={"main-video"}>
            </div>
        );
    }
}
