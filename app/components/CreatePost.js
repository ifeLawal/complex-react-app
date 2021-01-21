import React, { useEffect, useState, useContext } from "react";
import { withRouter } from "react-router-dom";
import { useImmerReducer } from "use-immer";
import Axios from "axios";
import Page from "./Page";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";

function CreatePost(props) {
  const initialState = {
    title: {
      value: "",
      hasErrors: true,
      message: "",
      inputValidation: "",
      textValidation: "",
      hasTyped: false
    },

    body: {
      value: "",
      hasErrors: true,
      message: "",
      classValidation: "",
      hasTyped: false
    }
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case "changeTitle":
        draft.title.hasTyped = true;
        draft.title.value = action.value;
        return;
      case "changeBody":
        draft.body.hasTyped = true;
        draft.body.value = action.value;
        return;
      case "titleRules":
        if (!draft.title.value) {
          draft.title.hasErrors = true;
          draft.title.message = "You can not leave the title blank";
          draft.title.inputValidation = "is-invalid";
          draft.title.textValidation = "text-danger";
        } else {
          draft.title.hasErrors = false;
          draft.title.message = "Looks good";
          draft.title.inputValidation = "is-valid";
          draft.title.textValidation = "text-success";
        }
        return;
      case "bodyRules":
        if (!draft.body.value) {
          draft.body.hasErrors = true;
          draft.body.message = "You can not leave the body blank";
          draft.body.inputValidation = "is-invalid";
          draft.body.textValidation = "text-danger";
        } else {
          draft.body.hasErrors = false;
          draft.body.message = "Looks good";
          draft.body.inputValidation = "is-valid";
          draft.body.textValidation = "text-success";
        }
        return;
      case "holdTitleRules":
        draft.title.hasErrors = false;
        draft.title.message = "";
        draft.title.inputValidation = "";
        draft.title.textValidation = "";
        return;
      case "holdBodyRules":
        draft.body.hasErrors = false;
        draft.body.message = "";
        draft.body.inputValidation = "";
        draft.body.textValidation = "";
        return;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  // const [title, setTitle] = useState();
  // const [bodyContent, setBodyContent] = useState();

  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  async function handleSubmit(e) {
    e.preventDefault();
    dispatch({ type: "bodyRules" });
    dispatch({ type: "titleRules" });
    try {
      const response = await Axios.post("/create-post", {
        title: state.title.value,
        body: state.body.value,
        token: appState.user.token
      });
      console.log(response.data);
      if (!state.title.hasErrors && !state.body.hasErrors) {
        appDispatch({ type: "flashMessage", value: "Congrats, you successfully created a post!" });
        props.history.push(`/post/${response.data}`);
      }
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    dispatch({ type: "holdTitleRules" });

    if (state.title.hasTyped) {
      const timeOut = setTimeout(() => {
        dispatch({ type: "titleRules" });
      }, 500);

      return () => clearTimeout(timeOut);
    }
  }, [state.title.value]);

  useEffect(() => {
    dispatch({ type: "holdBodyRules" });

    if (state.body.hasTyped) {
      const timeOut = setTimeout(() => {
        dispatch({ type: "bodyRules" });
      }, 500);

      return () => clearTimeout(timeOut);
    }
  }, [state.body.value]);

  return (
    <Page title="Create Post">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input onBlur={() => dispatch({ type: "titleRules" })} onChange={e => dispatch({ type: "changeTitle", value: e.target.value })} autoFocus name="title" id="post-title" className={"form-control form-control-lg form-control-title " + state.title.inputValidation} type="text" placeholder="" autoComplete="off" />
          <div className={"pt-2 " + state.title.textValidation}>{state.title.message}</div>
        </div>

        <div className="form-group has-error">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <div className="invalid-feedback">Please enter a message in the textarea.</div>
          <textarea onBlur={() => dispatch({ type: "bodyRules" })} onChange={e => dispatch({ type: "changeBody", value: e.target.value })} name="body" id="post-body" className={"body-content tall-textarea form-control " + state.body.inputValidation} type="text"></textarea>
          <div className={"pt-2 " + state.body.textValidation}>{state.body.message}</div>
        </div>

        <button className="btn btn-primary">Save New Post</button>
      </form>
    </Page>
  );
}

export default withRouter(CreatePost);
