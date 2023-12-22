import {
  CoolIcon
} from "/build/_shared/chunk-CENY6B5C.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-XU7DNSPJ.js";
import {
  createHotContext
} from "/build/_shared/chunk-RV54M5LD.js";
import {
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// app/components/InfoBox.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\components\\\\InfoBox.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\components\\InfoBox.tsx"
  );
  import.meta.hot.lastModified = "1702435941521.2427";
}
var InfoBox = ({
  icon,
  children,
  severity,
  collapsible,
  open
}) => {
  const colors = !severity || severity === "blue" ? "bg-blurple-100 border-blurple-200 dark:bg-blurple-300 dark:border-blurple-300 dark:text-black" : severity === "yellow" ? "bg-yellow-100 border-yellow-200 dark:bg-yellow-300 dark:border-yellow-300 dark:text-black" : severity === "red" ? "bg-rose-300 border-rose-400 dark:border-rose-300 dark:text-black" : "";
  const overlayColors = !severity || severity === "blue" ? "from-blurple-100 dark:from-blurple-300" : severity === "yellow" ? "from-yellow-100 dark:from-yellow-300" : severity === "red" ? "from-rose-300" : "";
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: `mb-4 text-sm font-regular p-2 rounded border-2 dark:font-medium select-none ${colors}`, children: collapsible ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("details", { className: "group/info-box relative", open, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("summary", { className: "group-open/info-box:mb-2 group-open/info-box:absolute top-0 left-0 group-open/info-box:h-full h-10 group-open/info-box:opacity-0 overflow-hidden transition-[margin] relative marker:content-none marker-none cursor-pointer select-none", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CoolIcon, { icon: "Chevron_Right", className: "inline group-open/info-box:hidden" }, void 0, false, {
        fileName: "app/components/InfoBox.tsx",
        lineNumber: 34,
        columnNumber: 13
      }, this),
      " ",
      children,
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: `absolute w-full bottom-0 left-0 h-4 bg-gradient-to-t ${overlayColors}` }, void 0, false, {
        fileName: "app/components/InfoBox.tsx",
        lineNumber: 36,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/InfoBox.tsx",
      lineNumber: 33,
      columnNumber: 11
    }, this),
    icon && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CoolIcon, { icon }, void 0, false, {
      fileName: "app/components/InfoBox.tsx",
      lineNumber: 38,
      columnNumber: 20
    }, this),
    " ",
    children
  ] }, void 0, true, {
    fileName: "app/components/InfoBox.tsx",
    lineNumber: 32,
    columnNumber: 22
  }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: [
    icon && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CoolIcon, { icon }, void 0, false, {
      fileName: "app/components/InfoBox.tsx",
      lineNumber: 40,
      columnNumber: 20
    }, this),
    " ",
    children
  ] }, void 0, true, {
    fileName: "app/components/InfoBox.tsx",
    lineNumber: 39,
    columnNumber: 22
  }, this) }, void 0, false, {
    fileName: "app/components/InfoBox.tsx",
    lineNumber: 31,
    columnNumber: 10
  }, this);
};
_c = InfoBox;
var _c;
$RefreshReg$(_c, "InfoBox");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

export {
  InfoBox
};
//# sourceMappingURL=/build/_shared/chunk-44E76CA3.js.map
