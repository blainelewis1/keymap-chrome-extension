import React from "react";

import Shortcuts from "../Shortcuts/Shortcuts";
import { chordArrayToString } from "../Shortcuts/ShortcutUtils";

import { connect } from "react-redux";
import { layouts } from "./KeyMapConstants";
import { resetShortcuts } from "../../actions/shortcuts";
import { throttle, noop } from "lodash";
import "./KeyMap.css";

//TODOLATER: Include command icon?
//TODOLATER: translucent blur between keys
//TODOLATER: Should the keys be black and white?

//TODOLATER: Colour similar commands? Maybe based on the linear menu they would appear in.
//TODOLATER: levels of commands (chrome etc.)

//TODOLATER: Feedback
//TODOLATER: add a delay spinner/timer
//TODOLATER: extract a row component.
//TODOLATER: find a way to maybe merge the KEYBOARD_LAYOUT onto the hierarchy or vice versa.

//BUG: I have a sneaking suspicion space doesn't work properly.

//TODOLATER: extract a proper function for mapping keyName||label etc into the proper key including shifted key.

export const Key = ({
  id,
  label,
  keyName,
  command,
  submenu,
  symbol,
  pressed,
  type,
  onClick,
  color = "initial"
}) => {
  let hasCommandOrSubmenu = command || submenu;
  let faded = hasCommandOrSubmenu || pressed ? "" : "faded--keymap";
  pressed = pressed ? "pressed--keymap" : "";
  type = type + "--keymap" || "";

  return (
    <div
      //TODOLATER: Should we be binding the name here, or a level up?
      onClick={e => onClick(keyName || label, e)}
      className={`button--keymap ${faded} ${pressed} ${type}`}
      id={id || label}
      // style={{
      //   backgroundColor: `var(--color-${color})`
      // }}
    >
      {!!label && <div className="label--keymap"> {label} </div>}
      {!!command && <div className="command--keymap"> {command} </div>}
      {!!submenu && <div className="submenu--keymap"> {submenu} </div>}
      {!!symbol && <div className="symbol--keymap"> {symbol} </div>}
    </div>
  );
};

export const Row = ({
  row,
  commandsAvailable,
  onKeyClick,
  modifiersPressed
}) => {
  return (
    <div className="row--keymap">
      {row.map(keyConfig => (
        <Key
          key={keyConfig.id || keyConfig.label}
          onClick={onKeyClick}
          {...keyConfig}
          {...commandsAvailable[keyConfig.id || keyConfig.label]}
          pressed={modifiersPressed[keyConfig.keyName || keyConfig.label]}
        />
      ))}
    </div>
  );
};

export const KeyMapDisplay = ({
  commandsAvailable = {},
  layoutName = "mac",
  active = false,
  modifiersPressed = {},
  onKeyClick = noop
}) => {
  let classes = ["container--keymap"];
  if (active) {
    classes.push("active--keymap");
  }

  let viewportWidth = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0
  );
  let layout = layouts[layoutName];

  return (
    <div
      style={{ transform: `scale(${viewportWidth / 988})` }}
      className={`keymap--keymap containerscontainer--keymap ${layoutName ||
        "mac"}`}
    >
      <div className={classes.join(" ")}>
        {layout.map((row, index) => (
          <Row
            key={index}
            row={row}
            commandsAvailable={commandsAvailable}
            onKeyClick={onKeyClick}
            modifiersPressed={modifiersPressed}
          />
        ))}
      </div>
    </div>
  );
};

export class KeyMap extends React.Component {
  constructor(props) {
    super(props);
    this.shortcuts = React.createRef();
  }

  resize = throttle(() => {
    this.forceUpdate();
  }, 300);

  componentDidMount() {
    window.addEventListener("resize", this.resize);
    document.addEventListener("click", this.props.onClose);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resize);
    document.removeEventListener("click", this.props.onClose);
  }

  render() {
    let currentModifiers = Object.keys(this.props.modifiersPressed).filter(
      m => this.props.modifiersPressed[m]
    );

    let modifiersPressedString = chordArrayToString(currentModifiers);
    const currentHierarchy = this.props.path.reduce(
      (prev, current) => prev[current],
      this.props.commandHierarchy
    );
    let commandsAvailable = currentHierarchy[modifiersPressedString] || {};

    let pathInProgressOrModifierPressed =
      modifiersPressedString.length + this.props.path.length > 0;

    let active =
      (pathInProgressOrModifierPressed && this.props.delayTimeOver) ||
      this.props.demo;

    return (
      <React.Fragment>
        <Shortcuts ref={this.shortcuts} {...this.props} />
        <KeyMapDisplay
          layoutName={this.props.layoutName}
          active={active}
          commandsAvailable={commandsAvailable}
          onKeyClick={this.handleKeyClick.bind(this)}
          modifiersPressed={this.props.modifiersPressed}
        />
      </React.Fragment>
    );
  }

  handleKeyClick(key, e) {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    this.shortcuts.current.wrappedInstance.handleKeyboard({
      type: "click",
      key: key
    });
  }
}

export default connect(
  state => {
    return { ...state.shortcuts };
  },
  {
    onResetShortcuts: resetShortcuts
  }
)(KeyMap);
