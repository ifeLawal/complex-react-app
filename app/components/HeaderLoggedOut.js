import React, { useEffect, useState, useContext } from "react";
import Axios from "axios";
import { useParams, withRouter } from "react-router-dom";
import DispatchContext from "../DispatchContext";

function HeaderLoggedOut(props) {
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();

  const appDispatch = useContext(DispatchContext);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await Axios.post("/login", {
        username,
        password
      });
      if (response.data) {
        console.log("Successfully logged in");
        appDispatch({ type: "login", data: response.data });
        appDispatch({ type: "flashMessage", value: "You have successfully logged in." });
        console.log(response.data);
        console.log(props.location);
        if (/profile/.test(props.location.pathname)) {
          console.log("We made it");
          props.history.push(`/profile/${username}`);
        }
        // localStorage.setItem("complexAppToken", response.data.token);
        // localStorage.setItem("complexAppAvatar", "https://gravatar.com/avatar/b9408a09298632b5151200f3449434ef?s=128" || response.data.avatar);
        // localStorage.setItem("complexAppUsername", response.data.username);
      } else {
        console.log("Incorrect username and password combo");
        appDispatch({ type: "flashMessage", value: "Incorrect username and/or password." });
      }
    } catch (e) {
      console.log("There was an error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-0 pt-2 pt-md-0">
      <div className="row align-items-center">
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input onChange={e => setUsername(e.target.value)} name="username" className="form-control form-control-sm input-dark" type="text" placeholder="Username" autoComplete="off" />
        </div>
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input onChange={e => setPassword(e.target.value)} name="password" className="form-control form-control-sm input-dark" type="password" placeholder="Password" />
        </div>
        <div className="col-md-auto">
          <button className="btn btn-success btn-sm">Sign In</button>
        </div>
      </div>
    </form>
  );
}

export default withRouter(HeaderLoggedOut);
