import React, {ChangeEvent} from 'react';
import MyInfo from "../../../../stores/MyInfo";
import IO from "../../../../controllers/IO";

export class Report extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className={"settings-view"}>
                <h2 className={"modal--title"}>Report An Issue</h2>
                <span>Please report all issues <a href={"https://github.com/oss-videochat/video-web-app"}>here</a>.</span>
            </div>
        );
    }
}
