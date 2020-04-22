import React from "react";
import ReactDOM from "react-dom";

import UserSession from "./UserSession";
import "./styles.css";

function App() {
  return (
    <UserSession>
      <div className="App">
        <h1>Hello CodeSandbox</h1>
        <h2>Start editing to see some magic happen!</h2>
      </div>
    </UserSession>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
