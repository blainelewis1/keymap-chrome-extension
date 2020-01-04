/*global chrome*/

import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { Provider } from "react-redux";
import { createStore } from "redux";
import reducer from "./reducers";
import KeyMap from "./menus/KeyMap/KeyMap";
import {
  CHROME_COMMAND_HIERARCHY,
  mergeCommandHierarchy,
  SLACK_COMMAND_HIERARCHY,
  OVERLEAF_COMMAND_HIERARCHY
} from "./menus/Shortcuts/CommandHierarchies";

const store = createStore(reducer);

const app = document.createElement("div");
app.id = "my-extension-root";
app.style = "bottom: 0; position: sticky; z-index: 9999999;";

document.body.appendChild(app);

// console.log(chrome);

// chrome.storage.sync.set({ hello: "world" }, function() {
//   chrome.storage.sync.get("hello", console.log);
// });
// chrome.storage.sync.get("hello", console.log);

// TODO: detect os??
// TODO: detect website check if it matches app.slack.com, if it does merge it in
let hierarchy = CHROME_COMMAND_HIERARCHY;

if (window.location.href.indexOf("app.slack.com") !== -1) {
  mergeCommandHierarchy(hierarchy, SLACK_COMMAND_HIERARCHY);
}

if (window.location.href.indexOf("overleaf.com") !== -1) {
  mergeCommandHierarchy(hierarchy, OVERLEAF_COMMAND_HIERARCHY);
}

ReactDOM.render(
  <Provider store={store}>
    <KeyMap onCommand={() => {}} commandHierarchy={hierarchy} />
  </Provider>,
  app
);
