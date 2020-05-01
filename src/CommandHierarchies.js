import {
  chordArrayFromString,
  chordArrayToString,
  getLetterFromChord,
  getModifiersFromChord,
} from "./KeyMap/ShortcutUtils";

/**
 * Merges two command hierarchies. The right side is merged into the right in place.
 *
 * @param {Object} h1 This is assumed to be in proper working order with sorted modifiers. This object is modified
 * @param {Object} h2 New hierarchy to merge in.
 * @param {*} level Level to add to all commands.
 *
 * @returns {Object} mergedCommandHierarchy
 */
export function mergeCommandHierarchy(left, right, level = undefined) {
  //TODOLATER: Add level information, it might require breaking out a helper.

  for (const key of Object.keys(right)) {
    let keyFixed = chordArrayToString(chordArrayFromString(key));

    if (keyFixed in left) {
      if (typeof left[keyFixed] === "object") {
        mergeCommandHierarchy(left[keyFixed], right[key], level);
      }
    } else {
      left[keyFixed] = right[key];
    }
  }

  return left;
}

/**
 * Given a list of linear menus it returns a command hierarchy from traversing the shortcuts.
 *
 * @param {Array} menus
 * @returns {Object} commandHierarchy
 */
export function menuToCommandHierarchy(menus) {
  let commandHierarchy = {};

  menus.forEach((menu) => {
    let others = { ...menu };
    delete others["items"];
    menu.items.forEach(({ command, shortcut }) => {
      let currentHierarchy = commandHierarchy;

      shortcut.forEach((chord, index) => {
        let modifiers = chordArrayToString(getModifiersFromChord(chord));
        let letter = getLetterFromChord(chord);

        if (!(modifiers in currentHierarchy)) {
          currentHierarchy[modifiers] = {};
        }

        if (!(letter in currentHierarchy[modifiers])) {
          currentHierarchy[modifiers][letter] = {};
        }

        if (index === shortcut.length - 1) {
          currentHierarchy[modifiers][letter] = { command, ...others };
        }

        currentHierarchy = currentHierarchy[modifiers][letter];
      });
    });
  });

  return commandHierarchy;
}

export function navigateToSubmenu(commandHierarchy, shortcut) {
  let modifiers = getModifiersFromChord(shortcut[0]);
  let letter = getLetterFromChord(shortcut[0]);

  if (shortcut.length === 1) {
    return commandHierarchy[modifiers][letter];
  } else {
    return navigateToSubmenu(commandHierarchy);
  }
}

export const MACOS_COMMAND_HIERARCHY = {
  meta: {
    q: {
      command: "quit application",
    },
    space: {
      command: "spotlight search",
    },
  },
};

export const DYNALIST_COMMAND_HIERARCHY = {
  meta: {
    ".": {
      command: "Expand/collapse",
    },
    "]": {
      command: "Zoom in",
    },
    "[": {
      command: "Zoom out",
    },
    "/": {
      command: "Help",
    },
    s: {
      command: "Save",
    },
    enter: {
      command: "Toggle checked",
    },
    y: {
      command: "Redo",
    },
    z: {
      command: "Undo",
    },
    ArrowUp: {
      command: "Swap with previous",
    },
    ArrowDown: {
      command: "Swap with next",
    },
    f: {
      command: "Search in doc",
    },
    o: {
      command: "File Finder",
    },
    b: {
      command: "Bold",
    },
    i: {
      command: "Italics",
    },
    "`": {
      command: "Code",
    },
    k: {
      command: "Link",
    },
  },
  shift: {
    enter: {
      command: "Notes/item",
    },
    ArrowUp: {
      command: "Select above",
    },
    ArrowDown: {
      command: "Select below",
    },
  },
  "meta+shift": {
    enter: {
      command: "New line",
    },
    h: {
      command: "Toggle heading",
    },
    l: {
      command: "Toggle color",
    },
    p: {
      command: "Item finder",
    },
    "]": {
      command: "Zoom in next item",
    },
    "[": {
      command: "Zoom out previous item",
    },
    delete: {
      command: "Delete",
    },
    f: {
      command: "File pane",
    },
    b: {
      command: "Bookmark pane",
    },
    ".": {
      command: "Expand/collapse all",
    },
    c: {
      command: "Checkboxes",
    },
    x: {
      command: "Numbered list",
    },
    a: {
      command: "Select everything",
    },
    z: {
      command: "redo",
    },
    m: {
      command: "Move item",
    },
  },
};

export const SLACK_COMMAND_HIERARCHY = {
  meta: {
    k: {
      command: "Quick Switcher",
    },
    "[": {
      command: "Back in History",
    },
    "]": {
      command: "Forward in histort",
    },
    f6: {
      command: "Move focus to the next section",
    },
    "+": {
      command: "Increase text size",
    },
    "-": {
      command: "Decrease text size",
    },
    b: {
      command: "bold",
    },
    i: {
      command: "italics",
    },
    u: {
      command: "upload a file",
    },
  },
  "meta+shift": {
    k: {
      command: "Browse DMs",
    },
    l: {
      command: "Browse channels",
    },
    y: {
      command: "Set a status",
    },
    f6: {
      command: "Move focus to the previous section",
    },
    e: { command: "Directory" },
    s: { command: "Starred items" },
    f: { command: "Full screen" },
    "/": {
      command: "React to last message",
    },
    x: {
      command: "Strikethrough",
    },
    c: {
      command: "Format as code",
    },
    "8": {
      command: "Bullet list",
    },
    "7": {
      command: "Numbered list",
    },
    ">": {
      command: "Quote",
    },
    enter: {
      command: "Create a snippet",
    },
    "[": {
      command: "Next workspace",
    },
    "]": {
      command: "Previous workspace",
    },
  },
  "@": {
    command: "Autocomplete username",
  },
  "#": {
    command: "Autocomplete channel",
  },
  ":": {
    command: "Autocomplete emoji",
  },
  ArrowUp: {
    command: "Edit last message",
  },
  ArrowLeft: {
    command: "Next channel",
  },
  ArrowRight: {
    command: "Previous channel",
  },
  r: {
    command: "Mark channel as read",
  },
  PageUp: {
    command: "Scroll up",
  },
  PageDown: {
    command: "Scroll down",
  },
  escape: {
    command: "dismiss dialogs",
  },
  enter: {
    command: "Take action",
  },
  tab: {
    command: "Move focus to the next element",
  },
  shift: {
    tab: {
      command: "Move focus to the previous element",
    },
    PageUp: {
      command: "Scroll to prev day",
    },
    PageDown: {
      command: "Scroll to next day",
    },
    ".": {
      command: "Open / Close right pane",
    },
    ArrowUp: {
      command: "Select text to beginning of current line",
    },
    ArrowDown: {
      command: "Select text to end of current line",
    },
    enter: {
      command: "Start a new line",
    },
    escape: {
      command: "Mark all as read",
    },
  },
  alt: {
    ArrowUp: {
      command: "Previous channel or DM",
    },
    ArrowDown: {
      command: "Next channel or DM",
    },
  },
  "alt+shift": {
    ArrowUp: {
      command: "Previous unread channel or DM",
    },
    ArrowDown: {
      command: "Next unread channel or DM",
    },
  },
};

export const CHROME_COMMAND_HIERARCHY = {
  meta: {
    ",": {
      command: "Open settings",
    },
    "[": {
      command: "Back",
    },
    "]": {
      command: "forward",
    },
    ArrowLeft: {
      command: "Back",
    },
    ArrowRight: {
      command: "Forward",
    },
    "0": {
      command: "Reset zoom",
    },
    "1": {
      command: "Tab 1",
    },
    "2": {
      command: "Tab 2",
    },
    "3": {
      command: "Tab 3",
    },
    "4": {
      command: "Tab 4",
    },
    "5": {
      command: "Tab 5",
    },
    "6": {
      command: "Tab 6",
    },
    "7": {
      command: "Tab 7",
    },
    "8": {
      command: "Tab 8",
    },
    "9": {
      command: "Last tab",
    },
    x: {
      command: "Cut",
    },
    c: {
      command: "Copy",
    },
    v: {
      command: "Paste",
    },

    d: {
      command: "Bookmark",
    },
    e: {
      command: "Search selected",
    },
    f: {
      command: "Find...",
    },
    g: {
      command: "Next find result",
    },
    h: {
      command: "Hide Chrome",
    },
    m: {
      command: "Minimize",
    },
    w: {
      command: "Close tab",
    },
    t: {
      command: "New tab",
    },
    y: {
      command: "History...",
    },
    "-": {
      command: "Zoom out",
    },
    "+": {
      command: "Zoom in",
    },
    n: {
      command: "New window",
    },
    r: {
      command: "Refresh",
    },
    p: {
      command: "Print",
    },
    s: {
      command: "Save",
    },
  },
  "alt+meta": {
    b: {
      command: "Bookmark Manager",
    },
    f: {
      command: "Search the web",
    },
    i: {
      command: "DevTools",
    },
    j: {
      command: "Javascript Console",
    },
    ArrowLeft: {
      command: "Previous tab",
    },
    p: {
      command: "Page setup",
    },
    ArrowRight: {
      command: "Next tab",
    },
    u: {
      command: "Show source",
    },
  },
  "ctrl+meta": {
    f: {
      command: "Toggle full screen",
    },
  },
  "meta+shift": {
    n: {
      command: "New incognito window",
    },
    b: {
      command: "Toggle bookmarks bar",
    },
    d: {
      command: "Bookmark all tabs",
    },
    delete: {
      command: "Clear browsing data...",
    },
    g: {
      command: "Previous find match",
    },
    h: {
      command: "Home",
    },
    j: {
      command: "Downloads...",
    },
    m: {
      command: "Change user",
    },
    r: {
      command: "Reload without cache",
    },
    t: {
      command: "Reopen closed tab",
    },
    w: {
      command: "Close window",
    },
  },
  alt: {
    delete: {
      command: "Delete previous word",
    },
    ArrowLeft: {
      command: "Previous word",
    },
    ArrowRight: {
      command: "Next word",
    },
    space: {
      command: "Scroll up one screen",
    },
  },
};

export const OVERLEAF_COMMAND_HIERARCHY = {
  meta: {
    z: {
      command: "Undo",
    },
    y: {
      command: "redo",
    },
    enter: {
      command: "Compile",
    },
    l: {
      command: "Go to line",
    },
    "/": {
      command: "Toggle comment",
    },
    u: {
      command: "To uppercase",
    },
    b: {
      command: "Bold",
    },
    d: {
      command: "Delete line",
    },
    i: {
      command: "Italics",
    },
    a: {
      command: "Select all",
    },
    j: {
      command: "Toggle review",
    },
  },
  "meta+shift": {
    a: {
      command: "Toggle track changes",
    },
    c: {
      command: "Add comment",
    },
    u: {
      command: "To lowercase",
    },
  },
  ctrl: {
    space: {
      command: "Autocomplete",
    },
  },
};

export const GOOGLE_DOCS_COMMAND_HIERARCHY = {
  meta: {
    b: {
      icon: "bold.png",
      command: "bold",
    },
    i: {
      command: "italics",
    },
    u: {
      command: "underline",
    },
    ".": {
      command: "superscript",
    },
    ",": {
      command: "subscript",
    },
    space: {
      command: "clear formatting",
    },
    backslash: {
      command: "clear formatting",
    },
    c: {
      command: "copy",
    },
    v: {
      command: "paste",
    },
    k: {
      command: "insert link",
    },
    f: {
      command: "find",
    },
    h: {
      command: "find and replace",
    },
    g: {
      submenu: "submenu",
      meta: {
        w: {
          command: "wait",
        },
      },
    },
  },
  alt: {
    f: {
      command: "file menu",
    },
    e: {
      command: "edit menu",
    },
    v: {
      command: "view menu",
    },
    i: {
      command: "insert menu",
    },
    o: {
      command: "format menu",
    },
    t: {
      command: "tools menu",
    },
    n: {
      command: "add-ons menu",
    },
    h: {
      command: "help menu",
    },
  },
  "meta+shift": {
    c: {
      command: "count words",
    },
    l: {
      command: "left align",
    },
    e: {
      command: "center align",
    },
    r: {
      command: "right align",
    },
    j: {
      command: "justify text",
    },
    "7": {
      command: "numbered list",
    },
    "8": {
      command: "bulleted list",
    },
    y: {
      command: "define word",
    },
    backslash: {
      command: "context menu",
    },
    x: {
      command: "context menu",
    },
  },
  "alt+shift": {
    "5": {
      command: "strikethrough",
    },

    f: {
      command: "file menu",
    },
    e: {
      command: "edit menu",
    },
    v: {
      command: "view menu",
    },
    i: {
      command: "insert menu",
    },
    o: {
      command: "format menu",
    },
    t: {
      command: "tools menu",
    },
    n: {
      command: "add-ons menu",
    },
    h: {
      command: "help menu",
    },
  },
  "alt+meta": {
    "0": {
      command: "normal text",
    },
    "1": {
      command: "heading 1",
    },
    "2": {
      command: "heading 2",
    },
    "3": {
      command: "heading 3",
    },
    "4": {
      command: "heading 4",
    },
    "5": {
      command: "heading 5",
    },
    "6": {
      command: "heading 6",
    },
    k: {
      command: "resize larger",
    },
    j: {
      command: "resize smaller",
    },
    c: {
      command: "copy formatting",
    },
    v: {
      command: "paste formatting",
    },
    f: {
      command: "insert footnote",
    },
    m: {
      command: "add comment",
    },
  },
  "alt+meta+shift": {
    z: {
      command: "switch to editing",
    },
    x: {
      command: "switch to suggesting",
    },
    c: {
      command: "switch to viewing",
    },
    a: {
      command: "open comments thread",
    },
  },
};

const hierarchies = {};

mergeCommandHierarchy(hierarchies, GOOGLE_DOCS_COMMAND_HIERARCHY);
mergeCommandHierarchy(hierarchies, MACOS_COMMAND_HIERARCHY);
mergeCommandHierarchy(hierarchies, CHROME_COMMAND_HIERARCHY);

export const all_hierarchies = hierarchies;
