import { basicSetup, EditorView } from "codemirror";
import { Compartment } from "@codemirror/state";
import * as allThemes from "@uiw/codemirror-themes-all";
import { liquidsoap } from "codemirror-lang-liquidsoap";
import * as prettier from "prettier";
import prettierPluginLiquidsoap from "liquidsoap-prettier";

const prettierPlugin = {
  ...prettierPluginLiquidsoap,
  parsers: {
    ...prettierPluginLiquidsoap.parsers,
    liquidsoap: {
      ...prettierPluginLiquidsoap.parsers.liquidsoap,
      parse: (s) => JSON.parse(s),
    },
  },
};

const themes = Object.keys(allThemes).reduce((themes, key) => {
  if (/Init/.test(key) || /Settings/.test(key)) return themes;

  return { ...themes, [key]: allThemes[key] };
}, {});

const defaultTheme = "okaidia";

const themeConfig = new Compartment();

const select = document.getElementById("themes");

Object.keys(themes).forEach((name) => {
  const option = document.createElement("option");
  option.text = name;
  option.value = name;
  select.appendChild(option);
});

select.value = defaultTheme;

select.onchange = () =>
  editor.dispatch({
    effects: themeConfig.reconfigure([liquidsoap(), themes[select.value]]),
  });

window.formatLiqCode = (code, cb) =>
  prettier
    .format(code, {
      parser: "liquidsoap",
      plugins: [prettierPlugin],
    })
    .then(cb);

let editor;

window.getLiqCode = () => {
  if (!editor) return "";
  return editor.state.doc.toString();
};

window.setLiqCode = (code) => {
  if (!editor) return;
  editor.dispatch({
    changes: {
      from: 0,
      to: editor.state.doc.length,
      insert: code,
    },
  });
};

window.onLiqLoaded = (version) => {
  const input = document.getElementById("input");
  const height = input.clientHeight;
  const width = input.clientWidth;
  input.innerHTML = null;
  input.style.minHeight = `${height}px`;
  input.style.maxHeight = `${height}px`;
  input.style.minWidth = `${width}px`;
  input.style.maxWidth = `${width}px`;

  editor = new EditorView({
    doc: `# ✨ Welcome to liquidsoap's online interpreter! ✨
# 🤖 Language version: ${version}
#
# ⚠️  This interpreter only supports a small subset of the language ⚠️
#
# For a most complete exploration of all the operators, we recommend
# using the interactive mode using the liquidsoap CLI.
#
#  Write your code here:

`,
    extensions: [
      basicSetup,
      themeConfig.of([liquidsoap(), themes[defaultTheme]]),
    ],
    parent: input,
  });
};

let showingResults = false;

const switchDisplay = () => {
  const code = document.getElementById("code");
  const results = document.getElementById("results");

  if (showingResults) {
    code.style.display = "grid";
    results.style.display = "none";
  } else {
    code.style.display = "none";
    results.style.display = "grid";
  }

  showingResults = !showingResults;
};

window.addEventListener("load", () => {
  document.getElementById("switch-code").addEventListener("click", () => {
    switchDisplay();
  });

  document.getElementById("switch-results").addEventListener("click", () => {
    switchDisplay();
  });

  document.getElementById("execute").addEventListener("click", () => {
    switchDisplay();
  });
});
