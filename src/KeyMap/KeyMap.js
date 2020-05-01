import React, { useEffect, useState } from "react";

import { chordArrayToString } from "./ShortcutUtils";

import { layouts } from "./KeyMapConstants";
import { throttle, noop } from "lodash-es";
import "./KeyMap.css";
import { useCommandHierarchyWithDelay } from "./shortcutHooks";

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
  color = "initial",
}) => {
  let hasCommandOrSubmenu = command || submenu;
  let faded = hasCommandOrSubmenu || pressed ? "" : "faded--keymap";
  pressed = pressed ? "pressed--keymap" : "";
  type = type + "--keymap" || "";

  return (
    <div
      //TODOLATER: Should we be binding the name here, or a level up?
      onClick={(e) => onClick(keyName || label, e)}
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
  modifiersPressed,
}) => {
  return (
    <div className="row--keymap">
      {row.map((keyConfig) => (
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
  onKeyClick = noop,
  disableAlwaysKeys = false,
}) => {
  let classes = ["container--keymap"];
  if (active) {
    classes.push("active--keymap");
  }

  if (disableAlwaysKeys) {
    classes.push("disable-always--keymap");
  }

  let viewportWidth = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0
  );

  let layout = layouts[layoutName];

  return (
    <div
      style={{ transform: `scale(${viewportWidth / 988})` }}
      className={`keymap--keymap containerscontainer--keymap ${layoutName}`}
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

let useRerenderOnResize = (throttleAmount = 300) => {
  let [renderCount, setRenderCount] = useState(0);
  useEffect(() => {
    const resize = throttle(() => {
      setRenderCount(renderCount++);
    }, throttleAmount);

    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  });
};

const KeyMap = ({
  layoutName = "mac",
  commandHierarchy,
  onCommand,
  ...props
}) => {
  let {
    modifiersPressed,
    keyClicked,
    delayOver,
    path,
    reset,
  } = useCommandHierarchyWithDelay(commandHierarchy, onCommand, props.delay);

  function handleKeyClick(key, e) {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    keyClicked(key);
  }

  useRerenderOnResize();

  useEffect(() => {
    document.addEventListener("click", reset);
    window.addEventListener("blur", reset);

    return () => {
      document.removeEventListener("click", reset);
      window.removeEventListener("blur", reset);
    };
  }, [reset]);

  // TODO:

  let currentModifiers = Object.keys(modifiersPressed).filter(
    (m) => modifiersPressed[m]
  );

  let modifiersPressedString = chordArrayToString(currentModifiers);

  const currentHierarchy = path.reduce(
    (prev, current) => prev[current],
    commandHierarchy
  );

  let commandsAvailable = currentHierarchy[modifiersPressedString] || {};

  let pathInProgressOrModifierPressed =
    modifiersPressedString.length + path.length > 0;

  let active = pathInProgressOrModifierPressed && delayOver;

  return (
    <>
      <KeyMapDisplay
        {...props}
        layoutName={layoutName}
        active={active}
        commandsAvailable={commandsAvailable}
        onKeyClick={handleKeyClick}
        modifiersPressed={modifiersPressed}
      />
    </>
  );
};

export default KeyMap;
