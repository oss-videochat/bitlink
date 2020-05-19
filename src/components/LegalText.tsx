import React from "react";

class LegalText extends React.Component<any, any>{
    render() {
        return <span className={"legal-text"}>By using our service you agree to our <a
            href={"https://bitlink.live/privacy"}>Privacy Policy</a></span>;
    }
}

export default LegalText;
