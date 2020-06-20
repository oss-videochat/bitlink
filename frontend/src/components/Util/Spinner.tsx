import React from 'react';
import './Spinner.css'


export class Spinner extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div style={{width: this.props.size || "40px", height: this.props.size || "40px"}}
                 className="sk-fading-circle">
                <div className="sk-circle1 sk-circle"/>
                <div className="sk-circle2 sk-circle"/>
                <div className="sk-circle3 sk-circle"/>
                <div className="sk-circle4 sk-circle"/>
                <div className="sk-circle5 sk-circle"/>
                <div className="sk-circle6 sk-circle"/>
                <div className="sk-circle7 sk-circle"/>
                <div className="sk-circle8 sk-circle"/>
                <div className="sk-circle9 sk-circle"/>
                <div className="sk-circle10 sk-circle"/>
                <div className="sk-circle11 sk-circle"/>
                <div className="sk-circle12 sk-circle"/>
            </div>
        );
    }
}
