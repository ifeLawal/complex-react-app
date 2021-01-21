import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, withRouter } from "react-router-dom";
import Axios from "axios";
import ReactMarkdown from "react-markdown";
import ReactTooltip from "react-tooltip";

import Page from "./Page";
import LoadingDots from "./LoadingDots";
import NotFoundPage from "./NotFoundPage";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

function SinglePost(props) {
  const { id } = useParams();

  const [post, setPost] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  useEffect(() => {
    let ourRequest = Axios.CancelToken.source();
    async function fetchData() {
      try {
        const response = await Axios.get(`/post/${id}`, { cancelToken: ourRequest.token });
        console.log(response.data);
        setPost(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log("Something went wrong\n", e, "\n or we canceled the request");
      }
    }
    fetchData();
    return () => {
      ourRequest.cancel();
    };
  }, [id]);

  async function handleDelete() {
    const areYouSure = window.confirm("Do you really want to delete this post?");
    if (areYouSure) {
      try {
        const response = await Axios.delete(`/post/${id}`, { data: { token: appState.user.token } });
        console.log(response);
        if (response.data == "Success") {
          appDispatch({ type: "flashMessage", value: "Message deleted successfully" });

          props.history.push(`/profile/${appState.user.username}`);
        }
      } catch (e) {
        console.log("Something went wrong\n", e);
      }
    }
  }

  /* author: {username: "ife", avatar: "https://gravatar.com/avatar/58267f0b098b8a6298e267f218ce2496?s=128"}
body: "We are now using useEffect! Can you believe it?"
createdDate: "2021-01-08T02:29:09.359Z"
isVisitorOwner: false
title: "App title with useEffect"*/

  if (!isLoading && !post) {
    return <NotFoundPage />;
  }

  if (isLoading) {
    return (
      <div>
        <LoadingDots />
      </div>
    );
  }

  let createdAt = new Date(post.createdDate);
  let formatedDate = createdAt.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });

  function isOwner() {
    if (appState.loggedIn) {
      return appState.user.username == post.author.username;
    }
    return false;
  }

  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {isOwner() && (
          <span className="pt-2">
            <Link to={`/post/${id}/edit`} data-tip="Edit" data-for="edit" className="text-primary mr-2">
              <i className="fas fa-edit"></i>
            </Link>{" "}
            <ReactTooltip id="edit" className="" />
            <Link onClick={handleDelete} to={`/post/${id}`} className="delete-post-button text-danger" data-tip="Delete" data-for="delete">
              <i className="fas fa-trash"></i>
            </Link>
            <ReactTooltip id="delete" className="" />
          </span>
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {formatedDate}
      </p>

      <div className="body-content">
        <ReactMarkdown children={post.body} allowedTypes={["text", "break", "heading", "paragraph", "strong", "emphasis", "list", "listItem", "blockquote", "link"]} />
      </div>
    </Page>
  );
}

export default withRouter(SinglePost);
