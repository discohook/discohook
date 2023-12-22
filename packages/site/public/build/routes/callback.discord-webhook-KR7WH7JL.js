import {
  useLoaderData
} from "/build/_shared/chunk-2EAB6TCV.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-XU7DNSPJ.js";
import {
  createHotContext
} from "/build/_shared/chunk-RV54M5LD.js";
import "/build/_shared/chunk-UWV35TSL.js";
import "/build/_shared/chunk-GIAAE3CH.js";
import {
  require_react
} from "/build/_shared/chunk-BOXFZXVX.js";
import {
  __commonJS,
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// empty-module:~/auth-discord-webhook.server
var require_auth_discord_webhook = __commonJS({
  "empty-module:~/auth-discord-webhook.server"(exports, module) {
    module.exports = {};
  }
});

// app/routes/callback.discord-webhook.tsx
var import_react2 = __toESM(require_react(), 1);
var import_auth_discord_webhook = __toESM(require_auth_discord_webhook(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\routes\\\\callback.discord-webhook.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\routes\\callback.discord-webhook.tsx"
  );
  import.meta.hot.lastModified = "1702866628685.4265";
}
var strings = {
  created: "Webhook Created",
  failed: "Failed to create webhook",
  subtitle: "You should be returned to the editor shortly."
};
function CreateWebhookPopup() {
  _s();
  const {
    error,
    webhook
  } = useLoaderData();
  (0, import_react2.useEffect)(() => {
    if (window.opener) {
      if (webhook) {
        window.opener.handlePopupClose(webhook);
      }
      window.close();
    }
  }, [webhook]);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "h-full flex", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "m-auto p-2 bg-gray-300 max-w-4xl", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "font-medium text-lg", children: error ? strings.failed : strings.created }, void 0, false, {
      fileName: "app/routes/callback.discord-webhook.tsx",
      lineNumber: 63,
      columnNumber: 9
    }, this),
    error && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "italic", children: error }, void 0, false, {
      fileName: "app/routes/callback.discord-webhook.tsx",
      lineNumber: 66,
      columnNumber: 19
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: strings.subtitle }, void 0, false, {
      fileName: "app/routes/callback.discord-webhook.tsx",
      lineNumber: 67,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/callback.discord-webhook.tsx",
    lineNumber: 62,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/routes/callback.discord-webhook.tsx",
    lineNumber: 61,
    columnNumber: 10
  }, this);
}
_s(CreateWebhookPopup, "BKqp9T5MAaxe8afjlhmgVbOOME0=", false, function() {
  return [useLoaderData];
});
_c = CreateWebhookPopup;
var _c;
$RefreshReg$(_c, "CreateWebhookPopup");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  CreateWebhookPopup as default
};
//# sourceMappingURL=/build/routes/callback.discord-webhook-KR7WH7JL.js.map
