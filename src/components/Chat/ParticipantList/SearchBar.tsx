import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSearch} from '@fortawesome/free-solid-svg-icons'
import './SearchBar.css'

export class SearchBar extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            value: ""
        };
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    handleKeyUp(event: any) {
        this.setState({value: event.target.value});
        this.props.onChange(event.target.value);
    }

    render() {
        return (
            <div className={"search-wrapper"}>
                <div className={"search-container"}>
                    <span className={"search--icon"}><FontAwesomeIcon icon={faSearch}/></span>
                    <input className={"search--input"} placeholder={"Search"} onChange={this.handleKeyUp}
                           value={this.state.value}/>
                </div>
            </div>
        );
    }
}
