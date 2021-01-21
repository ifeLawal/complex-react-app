import React, { useEffect, useContext, useRef } from "react";
import { useImmer } from "use-immer";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";

import { Link } from "react-router-dom";

import io from "socket.io-client";

function Chat() {
  const socket = useRef(null);
  const chatField = useRef(null);
  const chatBox = useRef(null);
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  const [state, setState] = useImmer({
    chatMessages: [],
    fieldValue: ""
  });

  useEffect(() => {
    if (appState.isChatOpen) {
      chatField.current.focus();

      appDispatch({ type: "clearChatCount" });
    }
  }, [appState.isChatOpen]);

  useEffect(() => {
    chatBox.current.scrollTop = chatBox.current.scrollHeight;

    if (!appState.isChatOpen && state.chatMessages.length) {
      appDispatch({ type: "incrementChatCount" });
    }
  }, [state.chatMessages]);

  useEffect(() => {
    socket.current = io(process.env.BACKENDURL || "https://backend-for-react-for-us.herokuapp.com/");

    socket.current.on("chatFromServer", message => {
      setState(draft => {
        draft.chatMessages.push(message);
      });
    });

    return () => socket.current.disconnect();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();

    socket.current.emit("chatFromBrowser", { message: state.fieldValue, token: appState.user.token });

    setState(draft => {
      draft.chatMessages.push({ message: state.fieldValue, username: appState.user.username, avatar: appState.user.avatar });
      draft.fieldValue = "";
    });
  }

  function handleMessage(e) {
    const value = e.target.value;
    setState(draft => {
      draft.fieldValue = value;
    });
  }

  return (
    <div id="chat-wrapper" className={"chat-wrapper shadow border-top border-left border-right " + (appState.isChatOpen ? "chat-wrapper--is-visible" : "")}>
      <div className="chat-title-bar bg-primary">
        Chat
        <span onClick={() => appDispatch({ type: "closeChat" })} className="chat-title-bar-close">
          <i className="fas fa-times-circle"></i>
        </span>
      </div>
      <div ref={chatBox} id="chat" className="chat-log">
        {state.chatMessages.map((message, index) => {
          if (message.username == appState.user.username) {
            return (
              <div key={index} className="chat-self">
                <div className="chat-message">
                  <div className="chat-message-inner">{message.message}</div>
                </div>
                <img className="chat-avatar avatar-tiny" src="https://gravatar.com/avatar/b9408a09298632b5151200f3449434ef?s=128" />
              </div>
            );
          } else {
            return (
              <div key={index} className="chat-other">
                <Link to={`/profile/${message.username}`}>
                  <img className="avatar-tiny" src="https://gravatar.com/avatar/b9216295c1e3931655bae6574ac0e4c2?s=128" />
                </Link>
                <div className="chat-message">
                  <div className="chat-message-inner">
                    <Link to={`/profile/${message.username}`}>
                      <strong>{message.username}: </strong>
                    </Link>
                    {message.message}
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>
      <form onSubmit={handleSubmit} id="chatForm" className="chat-form border-top">
        <input value={state.fieldValue} onChange={handleMessage} ref={chatField} type="text" className="chat-field" id="chatField" placeholder="Type a message…" autoComplete="off" />
      </form>
    </div>
  );
}

export default Chat;
