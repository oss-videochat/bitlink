import React from "react";
import "./Logo.css";
import logo from "../../assets/logo/logo.svg";

export const Logo: React.FunctionComponent = () => {
    const version = "1.0.2";

    return (
        <>
            <img className={"logo"} src={logo} />
            <span className={"version"}>v{version}</span>
        </>
    );
};
