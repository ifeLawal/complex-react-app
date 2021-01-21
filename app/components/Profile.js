import React, { useEffect, useContext, useState } from "react";
import Axios from "axios";
import { useParams, NavLink, Switch, Route } from "react-router-dom";
import { useImmer } from "use-immer";
import Page from "./Page";
import StateContext from "../StateContext";
import ProfilePosts from "./ProfilePosts";
import ProfileFollow from "./ProfileFollow";

function Profile() {
  const { username } = useParams();
  const appState = useContext(StateContext);

  const [state, setState] = useImmer({
    isLoadingRequest: false,
    startFollowRequestCount: 0,
    stopFollowRequestCount: 0,
    profileData: {
      profileAvatar: "https://gravatar.com/avatar/58267f0b098b8a6298e267f218ce2496?s=128",
      profileUsername: "...",
      isFollowing: "",
      counts: {
        followerCount: "",
        followingCount: "",
        postCount: ""
      }
    }
  });

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchData() {
      try {
        const response = await Axios.post(`/profile/${username}`, { token: appState.user.token }, { cancelToken: ourRequest.token });
        console.log(response.data);
        setState(draft => {
          draft.profileData = response.data;
        });
        // setProfileData(response.data);
      } catch (e) {
        console.log("Something went wrong\n", e);
      }
    }
    fetchData();

    return () => {
      ourRequest.cancel();
    };
  }, [username]);

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    if (state.startFollowRequestCount) {
      setState(draft => {
        draft.isLoadingRequest = true;
      });

      async function fetchData() {
        try {
          const response = await Axios.post(`/addFollow/${username}`, { token: appState.user.token }, { cancelToken: ourRequest.token });
          console.log("Add Follow request status", response.data);
          console.log("start follow request count", state.startFollowRequestCount);
          console.log("stop request count", state.startFollowRequestCount);
          if (response.data) {
            setState(draft => {
              draft.profileData.counts.followerCount++;
              draft.profileData.isFollowing = true;
              draft.isLoadingRequest = false;
            });
          }
          // setProfileData(response.data);
        } catch (e) {
          console.log("Something went wrong\n", e);
        }
      }
      fetchData();
    }

    return () => {
      ourRequest.cancel();
    };
  }, [state.startFollowRequestCount]);

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    if (state.stopFollowRequestCount) {
      setState(draft => {
        draft.isLoadingRequest = true;
      });

      async function fetchData() {
        try {
          const response = await Axios.post(`/removeFollow/${username}`, { token: appState.user.token }, { cancelToken: ourRequest.token });
          console.log("Stop request count", response.data);
          console.log("start follow request count", state.startFollowRequestCount);
          console.log("stop request count", state.startFollowRequestCount);
          if (response) {
            setState(draft => {
              draft.profileData.counts.followerCount--;
              draft.profileData.isFollowing = false;
              draft.isLoadingRequest = false;
            });
          }
          // setProfileData(response.data);
        } catch (e) {
          console.log("Something went wrong\n", e);
        }
      }
      fetchData();
    }

    return () => {
      ourRequest.cancel();
    };
  }, [state.stopFollowRequestCount]);

  function startFollowing() {
    setState(draft => {
      draft.startFollowRequestCount++;
    });
  }

  function stopFollowing() {
    setState(draft => {
      draft.stopFollowRequestCount++;
    });
  }

  return (
    <Page title={`${username} Profile`}>
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} /> {state.profileData.profileUsername}
        {appState.loggedIn && !state.profileData.isFollowing && appState.user.username != state.profileData.profileUsername && state.profileData.profileUsername != "..." && (
          <button onClick={startFollowing} disabled={state.isLoadingRequest} className="btn btn-primary btn-sm ml-2">
            Follow <i className="fas fa-user-plus"></i>
          </button>
        )}
        {appState.loggedIn && state.profileData.isFollowing && appState.user.username != state.profileData.profileUsername && (
          <button onClick={stopFollowing} disabled={state.isLoadingRequest} className="btn btn-danger btn-sm ml-2">
            Unfollow <i className="fas fa-user-times"></i>
          </button>
        )}
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink exact to={`/profile/${state.profileData.profileUsername}`} className="nav-item nav-link">
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink to={`/profile/${state.profileData.profileUsername}/followers`} className="nav-item nav-link">
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink to={`/profile/${state.profileData.profileUsername}/following`} className="nav-item nav-link">
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>

      {/* <Posts /> */}
      <Switch>
        <Route exact path={`/profile/:username`}>
          <ProfilePosts />
        </Route>
        <Route path={`/profile/:username/followers`}>
          <ProfileFollow followType="followers" followCount={state.profileData.counts.followerCount} />
        </Route>
        <Route path={`/profile/:username/following`}>
          <ProfileFollow followType="following" followCount={state.profileData.counts.followingCount} />
        </Route>
      </Switch>
    </Page>
  );
}

export default Profile;
