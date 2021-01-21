import React, { useEffect, useState, useContext } from "react";
import Axios from "axios";
import { useParams, Link } from "react-router-dom";
import {useImmer} from 'use-immer'

import StateContext from "../StateContext";
import LoadingDots from "./LoadingDots";

function ProfileFollow(props) {
  const { username } = useParams();

  const appState = useContext(StateContext);

  const [state, setState] = useImmer({
      followers: [],
      isLoading: true
  });
  const [followers, setFollowers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ourRequest = Axios.CancelToken.source();
    async function fetchData() {
      try {
        const response = await Axios.get(`/profile/${username}/${props.followType}`, { cancelToken: ourRequest.token });
        console.log("follower data structure", response.data);
        setFollowers(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log("Something went wrong\n", e, "\n or we canceled the request.");
      }
    }
    fetchData();

    return () => {
      ourRequest.cancel();
    };
  }, [username, props.followCount]);

  if (isLoading) {
    return (
      <>
        <LoadingDots />{" "}
      </>
    );
  }

  /*
  author: {username: "ife", avatar: "https://gravatar.com/avatar/58267f0b098b8a6298e267f218ce2496?s=128"}
body: "We are now using useEffect! Can you believe it?"
createdDate: "2021-01-08T02:29:09.359Z"
isVisitorOwner: false
title: "App title with useEffect"
_id: "5ff7c3754721fe376107bd04"
   */

  return (
    <div className="list-group">
      {/* checks 
    // 1. if you are following no one 
    // 2. if you are looking at an account and they are not following anyone
    // 3. if 3 is true and you are a guest
    // 4. if 3 is true and you have an account
    */}
      {followers.length > 0 ? (
        followers.map((follower, index) => {
          return (
            <Link key={index} to={`/profile/${follower.username}`} className="list-group-item list-group-item-action">
              {" "}
              <img className="avatar-tiny" src={follower.avatar} /> {follower.username}{" "}
            </Link>
          );
        }) // following empty followers array logic
      ) : props.followType == "following" ? !appState.loggedIn ? (
        <>
          <div className="text-center">
            <h2 className="">{username} isn't following anyone!</h2>
            <p className="lead text-muted ">Consider making an account so you can be the first person they follow.</p>
          </div>
        </>
      ) : appState.user.username == username ? (
        <>
          <div className="text-center">
            <h2 className="">You should follow some people!</h2>
            <p className="lead text-muted ">Go search for posts that might interests you and follow some new people</p>
          </div>
        </>
      ) : (
        <>
          <div className="text-center">
            <h2 className="">Consider sending {username} a message to follow you!</h2>
            <p className="lead text-muted ">If you like their content, that could be a good conversation starter that leads to a follow.</p>
          </div>
        </>
      )// follower page empty followers array logic 
      : !appState.loggedIn ? (
        <>
          <h2 className="">{username} has no followers!</h2>
          <p className="lead text-muted">If you enjoy their content, you should consider creating an account and following them!</p>
        </>
      ) : username == appState.user.username ? (
        <>
          <h2 className="">You have no followers!</h2>
          <p className="lead text-muted">Consider posting more content to get noticed by others.</p>
        </>
      ) : (
        <>
          <div className="text-center">
            <h2 className="">{username} has no followers!</h2>
            <p className="lead text-muted ">If you enjoy their content, you should consider following them to stay up to date on what they're posting!</p>
          </div>
        </>
      )}
    </div>
  );
}

export default ProfileFollow;
