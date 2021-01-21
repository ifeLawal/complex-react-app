import React, { useEffect, useState, useContext } from "react";
import { Link, useParams, withRouter } from "react-router-dom";
import { useImmerReducer } from "use-immer";
import Axios from "axios";

import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import Page from "./Page";
import LoadingDots from "./LoadingDots";
import NotFoundPage from './NotFoundPage';

function EditPost(props) {
  const initialState = {
    title: {
      value: "",
      hasErrors: "",
      message: ""
    },
    body: {
      value: "",
      hasErrors: "",
      message: ""
    },
    id: useParams().id,
    isFetching: true,
    isSaving: false,
    databaseSendCount: 0,
    notFound: false
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case "fetchData":
        draft.title.value = action.value.title;
        draft.body.value = action.value.body;
        draft.isFetching = false;
        return;
      case "changeTitle":
        draft.title.value = action.value;
        draft.title.hasErrors = false;
        return;
      case "changeBody":
        draft.body.value = action.value;
        draft.body.hasErrors = false;
        return;
      case "updatePost":
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.databaseSendCount++;
        }
        return;
      case "savingRequest":
        draft.isSaving = true;
        return;
      case "finishedRequest":
        draft.isSaving = false;
        return;
      case "titleRules":
        if (!action.value.trim()) {
          draft.title.hasErrors = true;
          draft.title.message = "Title can not be empty";
        }
        return;
      case "bodyRules":
        if (!action.value.trim()) {
          draft.body.hasErrors = true;
          draft.body.message = "Body content can not be empty";
        }
        return;
      case "notFound":
        draft.notFound = true;
        return
    }
  }

  const { username } = useParams();

  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  //   const { id } = useParams();

  //   const [post, setPost] = useState();
  //   const [isLoading, setIsLoading] = useState(true);

  /* author: {username: "ife", avatar: "https://gravatar.com/avatar/58267f0b098b8a6298e267f218ce2496?s=128"}
body: "We are now using useEffect! Can you believe it?"
createdDate: "2021-01-08T02:29:09.359Z"
isVisitorOwner: false
title: "App title with useEffect"*/

  // get post title and body
  useEffect(() => {
    let ourRequest = Axios.CancelToken.source();
    async function fetchData() {
      try {
        const response = await Axios.get(`/post/${state.id}`, { cancelToken: ourRequest.token });
        if(response.data) {
          dispatch({ type: "fetchData", value: response.data });
          if(appState.user.username != response.data.author.username) {
            appDispatch({type:"flashMessage", value:"You do not have permission to edit that post"});
            props.history.push("/");
          }
        } else {
          dispatch({ type: "notFound" });
        }
      } catch (e) {
        console.log("Something went wrong\n", e, "\n or we canceled the request");
      }
    }
    fetchData();
    return () => {
      ourRequest.cancel();
    };
  }, []);

  // Edit post title and body
  useEffect(() => {
    let ourRequest = Axios.CancelToken.source();
    if (state.databaseSendCount > 0) {
      dispatch({ type: "savingRequest" });
      async function fetchData() {
        try {
          const response = await Axios.post(`/post/${state.id}/edit`, { title: state.title.value, body: state.body.value, token: appState.user.token }, { cancelToken: ourRequest.token });
          dispatch({ type: "requestFinished" });
          appDispatch({ type: "flashMessage", value: "You successfully updated the post!" });
          props.history.push(`/post/${state.id}`);
        } catch (e) {
          console.log("Something went wrong\n", e, "\n or we canceled the request");
        }
      }
      fetchData();
    }
    return () => {
      ourRequest.cancel();
    };
  }, [state.databaseSendCount]);

  function handleSubmit(e) {
    e.preventDefault();
    dispatch({ type: "titleRules", value: state.title.value });
    dispatch({ type: "bodyRules", value: state.body.value });
    dispatch({ type: "updatePost" });
  }



  if(state.notFound) {
    return <NotFoundPage />
  }

  if (state.isFetching) {
    return (
      <Page title="...">
        <LoadingDots />
      </Page>
    );
  }

  return (
    <Page title="Edit Post">
      <Link to={`/post/${state.id}`} className="small font-weight-bold mb-3">&laquo; Go back to view the post</Link>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          {state.title.hasErrors && (
            <div className="alert alert-danger small mb-0" role="alert">
              {state.title.message}
            </div>
          )}
          <input onBlur={e => dispatch({ type: "titleRules", value: e.target.value })} onChange={e => dispatch({ type: "changeTitle", value: e.target.value })} value={state.title.value} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          {state.body.hasErrors && (
            <div className="alert alert-danger small mb-0" role="alert">
              {state.body.message}
            </div>
          )}
          <textarea onBlur={e => dispatch({ type: "bodyRules", value: e.target.value })} onChange={e => dispatch({ type: "changeBody", value: e.target.value })} value={state.body.value} name="body" id="post-body" className="body-content tall-textarea form-control" type="text" />
        </div>

        <button className="btn btn-primary" disabled={state.isSaving}>
          {state.isSaving ? "Saving..." : "Update Post"}
        </button>
      </form>
    </Page>
  );
}

export default withRouter(EditPost);
