import React from "react";
import ReactDOM from "react-dom";

import KeyMap from "./KeyMap/KeyMap";
import {
  CHROME_COMMAND_HIERARCHY,
  mergeCommandHierarchy,
  SLACK_COMMAND_HIERARCHY,
  OVERLEAF_COMMAND_HIERARCHY,
  DYNALIST_COMMAND_HIERARCHY,
} from "./CommandHierarchies";
import defaultConfig from "./defaultConfig";

const app = document.createElement("div");
app.id = "my-extension-root";
app.style = "bottom: 0; position: sticky; z-index: 9999999;";

document.body.appendChild(app);

// TODO: detect os?
let hierarchy = CHROME_COMMAND_HIERARCHY;

if (window.location.href.indexOf("app.slack.com") !== -1) {
  mergeCommandHierarchy(hierarchy, SLACK_COMMAND_HIERARCHY);
}

if (window.location.href.indexOf("overleaf.com") !== -1) {
  mergeCommandHierarchy(hierarchy, OVERLEAF_COMMAND_HIERARCHY);
}

if (window.location.href.indexOf("dynalist.io") !== -1) {
  mergeCommandHierarchy(hierarchy, DYNALIST_COMMAND_HIERARCHY);
}

if (!chrome.storage) {
  ReactDOM.render(
    <KeyMap
      {...defaultConfig}
      onCommand={() => {}}
      commandHierarchy={hierarchy}
    />,
    app
  );
} else {
  chrome.storage.sync.get("config", ({ config = defaultConfig }) => {
    ReactDOM.render(
      <KeyMap {...config} onCommand={() => {}} commandHierarchy={hierarchy} />,
      app
    );
  });
}
