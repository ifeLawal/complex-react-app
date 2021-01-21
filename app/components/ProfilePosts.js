import React, { useEffect, useState, useContext } from "react";
import Axios from "axios";
import { useParams, Link } from "react-router-dom";

import LoadingDots from './LoadingDots';
import Post from './Post';

function ProfilePosts() {
  const { username } = useParams();

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ourRequest = Axios.CancelToken.source();
    async function fetchData() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, {cancelToken: ourRequest.token});
        setPosts(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log("Something went wrong\n", e, "\n or we canceled the request.");
      }
    }
    fetchData();

    return () => {
      ourRequest.cancel();
    }
  }, [username]);

  if (isLoading) {
    return (<><LoadingDots /> </>);
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
      {posts.map(post => <Post post={post} key={post._id} noAuthor={true} />)}
    </div>
  );
}

export default ProfilePosts;
