import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-XU7DNSPJ.js";
import {
  createHotContext
} from "/build/_shared/chunk-RV54M5LD.js";
import {
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// app/components/Prose.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\components\\\\Prose.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\components\\Prose.tsx"
  );
  import.meta.hot.lastModified = "1695913027540.589";
}
var Prose = ({
  children
}) => {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "mx-auto max-w-5xl p-8", children }, void 0, false, {
    fileName: "app/components/Prose.tsx",
    lineNumber: 24,
    columnNumber: 10
  }, this);
};
_c = Prose;
var _c;
$RefreshReg$(_c, "Prose");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

export {
  Prose
};
//# sourceMappingURL=/build/_shared/chunk-BI26XF4X.js.map
