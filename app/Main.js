import React, { useState, useReducer, useEffect, Suspense } from "react";
import ReactDOM from "react-dom";
import { useImmerReducer } from "use-immer";
import { CSSTransition } from "react-transition-group";
import { Route, BrowserRouter, Switch } from "react-router-dom";
import Axios from "axios";

Axios.defaults.baseURL = process.env.BACKENDURL || "https://backend-for-react-for-us.herokuapp.com";

import DispatchContext from "./DispatchContext";
import StateContext from "./StateContext";

// My Components
import Header from "./components/Header";
import HomeGuest from "./components/HomeGuest";
import Footer from "./components/Footer";
import About from "./components/About";
import Terms from "./components/Terms";
import Home from "./components/Home";
const CreatePost = React.lazy(() => import("./components/CreatePost"));
const SinglePost = React.lazy(() => import("./components/SinglePost"));
import FlashMessage from "./components/FlashMessage";
import Profile from "./components/Profile";
import EditPost from "./components/EditPost";
import NotFoundPage from "./components/NotFoundPage";
const Search = React.lazy(() => import("./components/Search"));
const Chat = React.lazy(() => import("./components/Chat"));
import LoadingDots from "./components/LoadingDots";

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("complexAppToken")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("complexAppToken"),
      avatar: localStorage.getItem("complexAppAvatar"),
      username: localStorage.getItem("complexAppUsername")
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true;
        draft.user = action.data;
        return;
      // return { loggedIn: true, flashMessages: state.flashMessages };
      case "logout":
        draft.loggedIn = false;
        return;
      // return { loggedIn: false, flashMessages: state.flashMessages };
      case "flashMessage":
        draft.flashMessages.push(action.value);
        return;
      case "searchOpen":
        draft.isSearchOpen = true;
        return;
      case "searchClose":
        draft.isSearchOpen = false;
        return;
      case "toggleChat":
        draft.isChatOpen = !draft.isChatOpen;
        return;
      case "closeChat":
        draft.isChatOpen = false;
        return;
      case "incrementChatCount":
        draft.unreadChatCount++;
        return;
      case "clearChatCount":
        draft.unreadChatCount = 0;
        return;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchResults() {
      try {
        const response = await Axios.post(`/checkToken`, { token: state.user.token }, { cancelToken: ourRequest.token });
        if (!response.data) {
          dispatch({ type: "logout" });
          dispatch({ type: "flashMessage", value: "Your session has expired. Please log back in." });
        }
      } catch (e) {
        console.log("We either had an error\n", e, "\nor the request was canceled");
      }
    }
    fetchResults();

    return () => ourRequest.cancel();
  }, []);

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("complexAppToken", state.user.token);
      localStorage.setItem("complexAppAvatar", state.user.avatar);
      localStorage.setItem("complexAppUsername", state.user.username);
    } else {
      localStorage.removeItem("complexAppToken");
      localStorage.removeItem("complexAppAvatar");
      localStorage.removeItem("complexAppUsername");
    }
  }, [state.loggedIn]);
  // const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem("complexAppToken")));
  // const [flashMessage, setFlashMessages] = useState([]);

  // function addFlashMessage(msg) {
  //   setFlashMessages(prev => prev.concat(msg));
  // }

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <Header />
          <FlashMessage flashMessage={state.flashMessages} />
          <Suspense fallback={<LoadingDots />}>
            <Switch>
              <Route path="/" exact>
                {state.loggedIn ? <Home /> : <HomeGuest />}
              </Route>
              <Route path="/profile/:username">
                <Profile />
              </Route>
              <Route path="/create-post">
                <CreatePost />
              </Route>
              <Route path="/post/:id" exact>
                <SinglePost />
              </Route>
              <Route path="/post/:id/edit" exact>
                <EditPost />
              </Route>
              <Route path="/about-us">
                <About />
              </Route>
              <Route path="/terms">
                <Terms />
              </Route>
              <Route>
                <NotFoundPage />
              </Route>
            </Switch>
          </Suspense>
          <CSSTransition timeout={330} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
            <div className="search-overlay">
              <Suspense>
                <Search />
              </Suspense>
            </div>
            {/* {state.isSearchOpen && <Search />} */}
          </CSSTransition>
          {state.loggedIn && (
            <Suspense fallback="">
              <Chat />
            </Suspense>
          )}
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

ReactDOM.render(<Main />, document.querySelector("#app"));

if (module.hot) {
  module.hot.accept();
}
