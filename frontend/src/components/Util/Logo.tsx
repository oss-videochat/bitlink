import React from 'react';
import './Logo.css';
import logo from "../../assets/logo/logo.svg";

export const Logo: React.FunctionComponent = () => {
    const version = "0.4.0";
    const isBeta = version.startsWith("0");

    return (
        <>
            <img className={"logo"} src={logo}/>
            <span className={"version"}>v{version + (isBeta ? " beta" : "")}</span>
        </>
    );
}
