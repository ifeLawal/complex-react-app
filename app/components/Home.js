import React, { useEffect, useContext } from "react";
import Axios from "axios";
import { useImmer, useImmerReducer } from "use-immer";
import { Link } from "react-router-dom";

import Page from "./Page";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import LoadingDots from "./LoadingDots";
import Post from "./Post";

function Home() {

  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const [state, setState] = useImmer({
    isLoading: true,
    feed: []
  });

  useEffect(() => {
    let ourRequest = Axios.CancelToken.source();
    async function fetchData() {
      try {
        const response = await Axios.post(`/getHomeFeed`, { token: appState.user.token }, { cancelToken: ourRequest.token });
        console.log(response.data);
        setState(draft => {
          draft.feed = response.data;
          draft.isLoading = false;
        });
      } catch (e) {
        console.log("Something went wrong\n", e, "\n or we canceled the request.");
      }
    }
    fetchData();

    return () => {
      ourRequest.cancel();
    };
  }, []);

  if (state.isLoading) {
    return <LoadingDots />;
  }

  return (
    <Page title="Your Feed">
      {state.feed.length > 0 ? (
        <>
          <div className="container container--narrow py-md-5">
            <h2 className="text-center mb-4">The Latest From Those You Follow</h2>
            <div className="list-group">
              {state.feed.map(post => (
                <Post post={post} key={post._id} noAuthor={true} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-center">
            Hello <strong>{appState.user.username}</strong>, your feed is empty.
          </h2>
          <p className="lead text-muted text-center">Your feed displays the latest posts from the people you follow. If you don&rsquo;t have any friends to follow that&rsquo;s okay; you can use the &ldquo;Search&rdquo; feature in the top menu bar to find content written by people with similar interests and then follow them.</p>
        </>
      )}
    </Page>
  );
}

export default Home;
