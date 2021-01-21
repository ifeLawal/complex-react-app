import React, { useEffect } from "react";
import {Link} from 'react-router-dom'

function Post(props) {
  const post = props.post;
  const createdAt = new Date(post.createdDate);
  const formatedDate = createdAt.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });

  return (
    <Link to={`/post/${post._id}`} onClick={props.onClick} key={post._id} className="list-group-item list-group-item-action">
      <img className="avatar-tiny" src={post.author.avatar} /> <strong>{post.title}</strong>
      <span className="text-muted small">
        {" "}
        {!props.noAuthor && `by ${post.author.username}`} on {formatedDate}{" "}
      </span>
    </Link>
  );
}

export default Post;
