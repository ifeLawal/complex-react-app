import React, { useEffect } from "react";
import Page from "./Page";
import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <Page title="Page Does Not Exist">
      <div className="text-center">
        <h2>Ooops, you've entered our deserted zone!</h2>
        <p className="lead text-muted">
          You can stay here or return to our{" "}
          <strong>
            <Link to="/">homepage</Link>
          </strong>
          .
        </p>
      </div>
    </Page>
  );
}

export default NotFoundPage;
