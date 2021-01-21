import React, { useState, useEffect, useContext } from "react";
import Axios from "axios";
import { useImmerReducer } from "use-immer";
import { CSSTransition } from "react-transition-group";
import DispatchContext from '../DispatchContext'

import Page from "./Page";

function HomeGuest() {

  const appDispatch = useContext(DispatchContext);

  const initialState = {
    username: {
      value: "",
      checkCount: 0,
      hasErrors: false,
      messages: { tooLong: "", tooShort: "", alphaNumeric: "", unique: "" },
      isUnique: true
    },
    email: {
      value: "",
      checkCount: 0,
      hasErrors: false,
      message: "",
      isUnique: true
    },
    password: {
      value: "",
      checkCount: 0,
      hasErrors: false,
      message: ""
    },
    submitCount: 0
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case "usernameImmediately":
        draft.username.hasErrors = false;
        draft.username.value = action.value;
        if(draft.username.value.trim() == "") {
          draft.username.hasErrors = true;
          draft.username.messages.tooLong = "Username cannot be empty";
        }
        if (draft.username.value.length > 30) {
          draft.username.hasErrors = true;
          draft.username.messages.tooLong = "Username cannot exceed 30 characters";
        } else {
          draft.username.messages.tooLong = "";
        }
        if (draft.username.value && !/^([a-zA-Z0-9]+)$/.test(draft.username.value)) {
          draft.username.hasErrors = true;
          draft.username.messages.alphaNumeric = "Username can only be alphanumeric characters";
        } else {
          draft.username.messages.alphaNumeric = "";
        }
        return;
      case "usernameAfterDelay":
        if (draft.username.value.length < 3) {
          draft.username.hasErrors = true;
          draft.username.messages.tooShort = "Username must be longer than 3 characters";
        } else {
          draft.username.messages.tooShort = "";
        }
        if (!draft.username.hasErrors && !action.noRequest) {
          draft.username.checkCount++;
        }
        return;
      case "usernameIsUnique":
        if (action.value) {
          draft.username.hasErrors = true;
          draft.username.messages.unique = "That username is taken";
          draft.username.isUnique = false;
        } else {
          draft.username.messages.unique = "";
          draft.username.isUnique = true;
        }
        return;
      case "emailImmediately":
        draft.email.hasErrors = false;
        draft.email.value = action.value;
        if(draft.email.value.trim() == "") {
          draft.email.hasErrors = true;
          draft.email.message = "Email cannot be empty";
        }
        return;
      case "emailAfterDelay":
        if (draft.email.value && !/^\S+@\S+\.\S+/.test(draft.email.value)) {
          draft.email.hasErrors = true;
          draft.email.message = "Check if you have a valid email address";
        }
        if (!draft.email.hasErrors && !action.noRequest) {
          draft.email.checkCount++;
        }
        return;
      case "emailIsUnique":
        if (action.value) {
          draft.email.hasErrors = true;
          draft.email.message = "That email is taken";
          draft.email.isUnique = false;
        } else {
          draft.email.isUnique = true;
        }
        return;
      case "passwordImmediately":
        draft.password.hasErrors = false;
        draft.password.value = action.value;
        if(draft.password.value.trim() == "") {
          draft.password.hasErrors = true;
          draft.password.message = "Password cannot be empty";
        }
        if (draft.password.value.length > 50) {
          draft.password.hasErrors = true;
          draft.password.message = "Password cannot exceed 50 characters";
        }
        return;
      case "passwordAfterDelay":
        if (draft.password.value && draft.password.value.length < 12) {
          draft.password.hasErrors = true;
          draft.password.message = "Password must at least be 12 characters";
        }
        return;
      case "submitForm":
        if (!draft.username.hasErrors && draft.username.isUnique && !draft.email.hasErrors && draft.email.isUnique && !draft.password.hasErrors) {
          draft.submitCount++;
        }
        return;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  useEffect(() => {
    if (state.username.checkCount) {
      let ourRequest = Axios.CancelToken.source();
      async function fetchData() {
        try {
          const response = await Axios.post(`/doesUsernameExist`, { username: state.username.value }, { cancelToken: ourRequest.token });
          console.log(response.data);
          dispatch({ type: "usernameIsUnique", value: response.data });
        } catch (e) {
          console.log("Something went wrong\n", e, "\n or we canceled the request.");
        }
      }
      fetchData();

      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.username.checkCount]);

  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(() => {
        dispatch({ type: "usernameAfterDelay" });
      }, 800);
      return () => clearTimeout(delay);
    }
  }, [state.username.value]);

  useEffect(() => {
    if (state.email.checkCount) {
      let ourRequest = Axios.CancelToken.source();
      async function fetchData() {
        try {
          const response = await Axios.post(`/doesEmailExist`, { email: state.email.value }, { cancelToken: ourRequest.token });
          console.log(response.data);
          dispatch({ type: "emailIsUnique", value: response.data });
        } catch (e) {
          console.log("Something went wrong\n", e, "\n or we canceled the request.");
        }
      }
      fetchData();

      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.email.checkCount]);

  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(() => {
        dispatch({ type: "emailAfterDelay" });
      }, 800);
      return () => clearTimeout(delay);
    }
  }, [state.email.value]);

  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(() => {
        dispatch({ type: "passwordAfterDelay" });
      }, 800);
      return () => clearTimeout(delay);
    }
  }, [state.password.value]);

  useEffect(() => {
    if (state.submitCount) {
      let ourRequest = Axios.CancelToken.source();
      async function fetchData() {
        try {
          const response = await Axios.post(`/register`, { username: state.username.value, email: state.email.value, password: state.password.value }, { cancelToken: ourRequest.token });
          appDispatch({ type: "login", data: response.data });
          appDispatch({ type: "flashMessage", value: "You have successfully logged in." });
        } catch (e) {
          appDispatch({type: "flashMessage", value: e});
          console.log("Something went wrong\n", e, "\n or we canceled the request.");
        }
      }
      fetchData();

      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.submitCount]);

  async function handleSubmit(e) {
    e.preventDefault();
    dispatch({ type: "usernameImmediately", value: state.username.value });
    dispatch({ type: "usernameAfterDelay", value: state.username.value, noRequest: true });
    dispatch({ type: "emailImmediately", value: state.email.value });
    dispatch({ type: "emailAfterDelay", value: state.email.value, noRequest: true });
    dispatch({ type: "passwordImmediately", value: state.password.value });
    dispatch({ type: "passwordAfterDelay", value: state.password.value });
    dispatch({ type: "submitForm" });
  }

  return (
    <Page title="Welcome!" wide={true}>
      <div className="row align-items-center">
        <div className="col-lg-7 py-3 py-md-5">
          <h1 className="display-3">Remember Writing?</h1>
          <p className="lead text-muted">Are you sick of short tweets and impersonal &ldquo;shared&rdquo; posts that are reminiscent of the late 90&rsquo;s email forwards? We believe getting back to actually writing is the key to enjoying the internet again.</p>
        </div>
        <div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username-register" className="text-muted mb-1">
                <small>Username</small>
              </label>
              {Object.keys(state.username.messages).map((errMessage, index) => {
                // console.log(state.username.messages[errMessage], { errMessage });
                if (state.username.messages[errMessage]) {
                  return (
                    <CSSTransition key={index} in={state.username.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                      <div className="alert alert-danger small liveValidateMessage ">{state.username.messages[errMessage]}</div>
                    </CSSTransition>
                  );
                }
              })}

              <input onChange={e => dispatch({ type: "usernameImmediately", value: e.target.value })} id="username-register" name="username" className="form-control" type="text" placeholder="Pick a username" autoComplete="off" />
            </div>
            <div className="form-group">
              <label htmlFor="email-register" className="text-muted mb-1">
                <small>Email</small>
              </label>
              <input onChange={e => dispatch({ type: "emailImmediately", value: e.target.value })} id="email-register" name="email" className="form-control" type="text" placeholder="you@example.com" autoComplete="off" />
              <CSSTransition in={state.email.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.email.message}</div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="password-register" className="text-muted mb-1">
                <small>Password</small>
              </label>
              <input onChange={e => dispatch({ type: "passwordImmediately", value: e.target.value })} id="password-register" name="password" className="form-control" type="password" placeholder="Create a password" />
              <CSSTransition in={state.password.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.password.message}</div>
              </CSSTransition>
            </div>
            <button type="submit" className="py-3 mt-4 btn btn-lg btn-success btn-block">
              Sign up for ComplexApp
            </button>
          </form>
        </div>
      </div>
    </Page>
  );
}

export default HomeGuest;
