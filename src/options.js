import React from "react";
import ReactDOM from "react-dom";
import Options from "./options/";

import "./options.css";

if (
  !window.chrome ||
  !window.chrome.storage ||
  !window.chrome.storage.sync ||
  !window.chrome.storage.sync.get ||
  !window.chrome.storage.sync.set
) {
  window.storage = {};
  console.log("monkeypatching");
  window.chrome = {
    storage: {
      sync: {
        set: (obj, callback) => {
          window.storage = { ...window.storage, ...obj };
          if (callback) {
            callback();
          }
        },
        get: (key, callback) => {
          callback({ [key]: window.storage[key] });
        },
      },
    },
  };
}

ReactDOM.render(<Options />, document.getElementById("root"));
