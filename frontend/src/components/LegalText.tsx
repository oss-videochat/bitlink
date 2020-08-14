import React from "react";

const LegalText: React.FunctionComponent = () => {
  return (
    <span className={"legal-text"}>
      By using our service you agree to our{" "}
      <a href={"https://bitlink.live/privacy"}>Privacy Policy</a>
    </span>
  );
};

export default LegalText;
