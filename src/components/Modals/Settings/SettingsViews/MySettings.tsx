import React, {ChangeEvent} from 'react';
import MyInfo from "../../../../stores/MyInfo";
import IO from "../../../../controllers/IO";

export class MySettings extends React.Component<any, any> {
    constructor(props: any) {
        super(props);

        this.state = {
            inputValue: MyInfo.info!.name
        }
    }
    componentDidMount(): void {
        this.props.events.on("save", (cb: () => void) => {
            IO.changeName(this.state.inputValue).then(cb);
        });
    }

    componentWillUnmount(): void {
        this.props.events.removeAllListeners("save");
    }

    handleChange(e: ChangeEvent<HTMLInputElement>){
        if(e.target.value !== MyInfo.info?.name){
            this.props.handleChangesMade(true);
        } else {
            this.props.handleChangesMade(false);
        }
        this.setState({inputValue: e.target.value});
    }


    render() {
        return (
            <div className={"settings-view"}>
                <h2 className={"modal--title"}>My Settings</h2>
                <label>
                    Name
                    <input className={"modal--input"} onChange={this.handleChange.bind(this)} value={this.state.inputValue} placeholder={"Name"}/>
                </label>
            </div>
        );
    }
}
