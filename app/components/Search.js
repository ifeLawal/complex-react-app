import React, { useEffect, useContext } from "react";
import DispatchContext from "../DispatchContext";
import { useImmer } from "use-immer";
import Axios from "axios";
import { Link, withRouter } from "react-router-dom";

import Post from "./Post";

function Search(props) {
  const appDispatch = useContext(DispatchContext);

  const [state, setState] = useImmer({
    searchTerm: "",
    results: [],
    show: "neither",
    axiosRequests: 0
  });

  useEffect(() => {
    document.addEventListener("keyup", handleSearchKeyUp);

    return document.removeEventListener("keyup", handleSearchKeyUp);
  }, []);

  useEffect(() => {
    if (state.searchTerm.trim()) {
      setState(draft => {
        draft.show = "loading";
      });
      const delay = setTimeout(() => {
        setState(draft => {
          draft.axiosRequests++;
        });
      }, 1000);

      return () => clearTimeout(delay);
    } else {
      setState(draft => {
        draft.show = "neither";
      });
    }
  }, [state.searchTerm]);

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchResults() {
      try {
        const response = await Axios.post(`/search`, { searchTerm: state.searchTerm }, { cancelToken: ourRequest.token });
        console.log(response.data);
        setState(draft => {
          draft.results = response.data;
          draft.show = "results";
        });
      } catch (e) {
        console.log("We either had an error\n", e, "\nor the request was canceled");
      }
    }
    fetchResults();

    return () => ourRequest.cancel();
  }, [state.axiosRequests]);

  function handleSearchKeyUp(e) {
    if (e.keyCode == 27) {
      appDispatch({ type: "searchClose" });
    }
  }

  function handleSearchTerm(e) {
    setState(draft => {
      draft.searchTerm = e.target.value;
    });
  }

  return (
    <>
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input onChange={handleSearchTerm} autoFocus type="text" autoComplete="off" id="live-search-field" className="live-search-field" placeholder="What are you interested in?" />
          <span onClick={() => appDispatch({ type: "searchClose" })} className="close-live-search">
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div className={"circle-loader " + (state.show == "loading" ? "circle-loader--visible" : "")}></div>
          <div className={"live-search-results " + (state.show == "results" ? "live-search-results--visible" : "")}>
            {Boolean(state.results.length) && (
              <div className="list-group shadow-sm">
                <div className="list-group-item active">
                  <strong>Search Results</strong> ({state.results.length} {state.results.length > 1 ? "items" : "item"} found)
                </div>
                {state.results.map(post => (
                  <Post post={post} key={post._id} noAuthor="false" onClick={() => appDispatch({ type: "searchClose" })} />
                ))}
              </div>
            )}
            {!Boolean(state.results.length) && <p className="alert alert-danger text-muted shadow-sm">Sorry, we could not find any results for that query.</p>}
          </div>
        </div>
      </div>
    </>
  );
}

export default withRouter(Search);
