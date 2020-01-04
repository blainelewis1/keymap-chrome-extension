import React from "react";
import "./App.css";
import StimulusResponseTask from "./tasks/StimulusResponseTask";
import MouseCenteringTask from "./tasks/MouseCenteringTask";
import DisplayTextTask from "./tasks/DisplayTextTask";
import UploadToS3 from "./tasks/UploadToS3";

import { advanceWorkflow, log, advanceWorkflowLevelTo } from "./actions";
import { getCurrentProps } from "./Workflow";
import { connect } from "react-redux";
import GoogleFormQuestionnaire from "./tasks/GoogleFormQuestionnaire";
import ConsentForm from "./tasks/ConsentForm";
import InformationScreen from "./tasks/InformationScreen";
import ExperimentProgress from "./ExperimentProgress";
import KeyboardChooser from "./tasks/KeyboardChooser";
import { UploadOnError } from "./UploadOnError";
import {
  KeyMapGuidedTutorial,
  KeyMapPointerTutorial,
  KeyMapShortcutTutorial
} from "./tasks/KeyMapTutorial";
import {
  ExposeHKGuidedTutorial,
  ExposeHKPointerTutorial,
  ExposeHKShortcutTutorial
} from "./tasks/ExposeHKTutorial";
const tasks = {
  StimulusResponseTask,
  MouseCenteringTask,
  DisplayTextTask,
  ConsentForm,
  GoogleFormQuestionnaire,
  UploadToS3,
  InformationScreen,
  KeyboardChooser,
  KeyMapGuidedTutorial,
  KeyMapPointerTutorial,
  KeyMapShortcutTutorial,
  ExposeHKGuidedTutorial,
  ExposeHKPointerTutorial,
  ExposeHKShortcutTutorial
};

const mapStateToProps = state => {
  return {
    ...getCurrentProps(state.configuration),
    log: state.configuration
  };
};

const mapDispatchToProps = {
  onAdvanceWorkflow: advanceWorkflow,
  onLog: log,
  onAdvanceWorkflowLevelTo: advanceWorkflowLevelTo
};

//TODOLATER: background tasks would be nice. Could be like middleware, where you have some function called on the task object whenever we increment and then it gets the chance to increment. Could implement non linear workflows that way. Or filtering ones.
//TODOLATER: when losing focus we should grey out the sdcreen, or wheenver we can't capture keyboard shortcuts. Seems tough to dfo.
export const App = ({ task, log, ...props }) => {
  if (process.env.NODE_ENV === "development") {
    window.onAdvanceWorkflow = props.onAdvanceWorkflow;

    window.nTimes = n => {
      for (var i = 0; i < n; i++) {
        window.onAdvanceWorkflow();
      }
    };

    window.onAdvanceWorkflowLevelTo = props.onAdvanceWorkflowLevelTo;
  }

  if (task) {
    //TODOLATER: there has to be a better way.
    let Task = tasks[task];
    return (
      <UploadOnError
        log={log}
        experimenter={log.experimenter}
        onLog={props.onLog}
        onAdvanceWorkflow={() => {}}
        s3FileName={`${log.participant}-ERROR.json`}
        AWS_REGION={log.AWS_REGION}
        AWS_S3_BUCKET={log.AWS_S3_BUCKET}
        AWS_COGNITO_IDENTITY_POOL_ID={log.AWS_COGNITO_IDENTITY_POOL_ID}
      >
        <ExperimentProgress log={log} {...props} />
        <Task {...props} />
      </UploadOnError>
    );
  } else {
    return (
      <div>
        <h1>You've completed the experiment!</h1>;
        <a
          download={`${log.participant}.json`}
          href={`data:text/json;charset=utf-8,${JSON.stringify(log)}`}
        >
          Download experiment log
        </a>
      </div>
    );
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
