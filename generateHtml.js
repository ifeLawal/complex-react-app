import React from "react";
import ReactDOMServer from "react-dom/server";
import fs from "fs";
import Footer from "./app/components/Footer";
import Header from "./app/components/Header";
import LoadingDots from "./app/components/LoadingDots";
import { StaticRouter as Router } from "react-router-dom";
import StateContext from "./app/StateContext";

function Shell() {
  return (
    <StateContext.Provider value={{ loggedIn: false }}>
      <Router>
        <Header staticEmpty={true} />
        <div className="py-5 my-5 text-center">
          <LoadingDots />
        </div>
        <Footer />
      </Router>
    </StateContext.Provider>
  );
}

function html(x) {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png">
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png">
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png">
      <link rel="manifest" href="/favicon/site.webmanifest">
      <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#5bbad5">
      <meta name="msapplication-TileColor" content="#da532c">
      <meta name="theme-color" content="#ffffff">
      <title>OurApp</title>
      <link href="https://fonts.googleapis.com/css?family=Public+Sans:300,400,400i,700,700i&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous" />
      <script defer src="https://use.fontawesome.com/releases/v5.5.0/js/all.js" integrity="sha384-GqVMZRt5Gn7tB9D9q7ONtcp4gtHIUEW/yG7h98J7IpE3kpi+srfFyyB/04OV6pG0" crossorigin="anonymous"></script>
  
      <link rel="stylesheet" href="style/main.css" />
    </head>
    <body>
      <div id="app">
      ${x}
      </div>
    </body>
  </html>
  `;
}

/*
  We can use ReactDomServer (you can see how we imported
  that at the very top of this file) to generate a string
  of HTML text. We simply give it a React component and
  here we are using the JSX syntax.
*/
const reactHtml = ReactDOMServer.renderToString(<Shell />);

/*
  Call our "html" function which has the skeleton or
  boilerplate HTML, and give it the string that React
  generated for us. Our "html" function will insert
  the React string inside the #app div. So now we will
  have a variable in memory with the exact string we
  want, we just need to save it to a file.
*/
const overallHtmlString = html(reactHtml);

/*
  This course is not about Node, but here we are simply
  saving our generated string into a file named
  index-template.html. Please note that this Node task
  will fail if the directory we told it to live within
  ("app" in this case) does not already exist.
*/
const fileName = "./app/index-template.html";
const stream = fs.createWriteStream(fileName);
stream.once("open", () => {
  stream.end(overallHtmlString);
});
