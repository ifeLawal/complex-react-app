import React, { useEffect } from "react";

function FlashMessage(props) {
  return (
    <div className="floating-alerts">
      {props.flashMessage.map((msg, index )=> {
        return <div key={index} className="alert alert-success text-center floating-alert shadow-sm">{msg}</div>;
      })}
    </div>
  );
}

export default FlashMessage;
