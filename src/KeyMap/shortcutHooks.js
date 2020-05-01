import { useEffect, useCallback, useState, useRef } from "react";
import { chordArrayToString, eventToKey, isModifier } from "./ShortcutUtils";

import { isEqual } from "lodash-es";
function getCurrentModifiers(modifiersPressed) {
  return Object.keys(modifiersPressed)
    .filter((key) => modifiersPressed[key])
    .sort();
}

export let useModifiers = () => {
  let [modifiersPressed, setModifiersPressed] = useState({});

  useEffect(() => {
    function handleKeyboard(e) {
      let key = eventToKey(e);

      if (isModifier(key)) {
        setModifiersPressed({
          ...modifiersPressed,
          [key]: e.type === "keydown" ? "keydown" : false,
        });
      }
    }

    // TODO: handle changing tabs

    document.addEventListener("keyup", handleKeyboard, false);
    document.addEventListener("keydown", handleKeyboard, false);

    return () => {
      document.removeEventListener("keyup", handleKeyboard, false);
      document.removeEventListener("keydown", handleKeyboard, false);
    };
  }, [modifiersPressed]);

  return { modifiersPressed, setModifiersPressed };
};

function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export let useCommandHierarchy = (commandHierarchy, onCommand) => {
  let { modifiersPressed, setModifiersPressed } = useModifiers();
  let [path, setPath] = useState([]);

  let handleKeyboard = useCallback(
    (e) => {
      let key = eventToKey(e);

      if (isModifier(key)) {
        return;
      }

      let { type } = e;

      if (type === "keyup") {
        return;
      }

      const currentHierarchy = path.reduce(
        (prev, current) => prev[current],
        commandHierarchy
      );

      if (!currentHierarchy) {
        return;
      }

      const submenuOrCommand = (currentHierarchy[
        chordArrayToString(getCurrentModifiers(modifiersPressed))
      ] &&
        currentHierarchy[
          chordArrayToString(getCurrentModifiers(modifiersPressed))
        ][key]) || { command: null };

      if ("command" in submenuOrCommand) {
        onCommand(submenuOrCommand.command);
        setModifiersPressed({});
        setPath([]);
      } else {
        setPath([...path, getCurrentModifiers(modifiersPressed), key]);
      }
    },
    [modifiersPressed, commandHierarchy, setModifiersPressed, onCommand, path]
  );

  useEffect(() => {
    document.addEventListener("keyup", handleKeyboard, false);
    document.addEventListener("keydown", handleKeyboard, false);

    return () => {
      document.removeEventListener("keyup", handleKeyboard, false);
      document.removeEventListener("keydown", handleKeyboard, false);
    };
  }, [handleKeyboard]);

  function keyClicked(key) {
    if (isModifier(key)) {
      setModifiersPressed({
        ...modifiersPressed,
        [key]: modifiersPressed[key] ? false : "click",
      });
    } else {
      handleKeyboard({ key });
    }
  }
  function reset() {
    setModifiersPressed({});
    setPath([]);
  }

  return { modifiersPressed, path, keyClicked, reset };
};

export let useCommandHierarchyWithDelay = (
  commandHierarchy,
  onCommand,
  delay
) => {
  let [timeoutId, setTimeoutId] = useState(null);
  let [delayOver, setDelayOver] = useState(false);

  let { modifiersPressed, path, keyClicked, reset } = useCommandHierarchy(
    commandHierarchy,
    onCommand
  );

  let prevModifiers = usePrevious(modifiersPressed);

  useEffect(() => {
    if (isEqual(prevModifiers, modifiersPressed)) {
      return;
    }

    if (Object.values(modifiersPressed).indexOf("click") !== -1 && !delayOver) {
      setDelayOver(true);
    } else if (getCurrentModifiers(modifiersPressed).length === 0) {
      setDelayOver(false);
      clearTimeout(timeoutId);
      setTimeoutId(null);
    } else {
      setTimeoutId(
        setTimeout(() => {
          setDelayOver(true);
          setTimeoutId(null);
        }, delay)
      );
    }
  }, [prevModifiers, modifiersPressed, delay, delayOver, timeoutId]);

  return { modifiersPressed, path, keyClicked, delayOver, reset };
};
