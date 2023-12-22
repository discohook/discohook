import {
  Prose
} from "/build/_shared/chunk-BI26XF4X.js";
import {
  ButtonStyle,
  ComponentType,
  Header,
  MessageComponents,
  require_session
} from "/build/_shared/chunk-CENY6B5C.js";
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
import "/build/_shared/chunk-BOXFZXVX.js";
import {
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// app/routes/legal.tsx
var import_session = __toESM(require_session(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\routes\\\\legal.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\routes\\legal.tsx"
  );
  import.meta.hot.lastModified = "1702946991769.2637";
}
var meta = () => [{
  title: "Privacy & Terms - Boogiehook"
}];
function Legal() {
  _s();
  const user = useLoaderData();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Header, { user }, void 0, false, {
      fileName: "app/routes/legal.tsx",
      lineNumber: 39,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Prose, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", { className: "font-bold text-2xl", id: "terms-of-service", children: "Terms of Service" }, void 0, false, {
        fileName: "app/routes/legal.tsx",
        lineNumber: 41,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: "By using Boogiehook or any of its subsequent services, including but not limited to Boogiehook's Discord application (Discohook Utils#4333), you agree to follow this document." }, void 0, false, {
        fileName: "app/routes/legal.tsx",
        lineNumber: 44,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("ul", { className: "list-disc list-inside my-1 space-y-1", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: [
          "You will not use the service(s) to:",
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("ul", { className: "list-disc list-inside ml-4", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: "break a United States law;" }, void 0, false, {
              fileName: "app/routes/legal.tsx",
              lineNumber: 53,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: "intentionally bring harm, physical or otherwise, to other users;" }, void 0, false, {
              fileName: "app/routes/legal.tsx",
              lineNumber: 54,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: [
              "violate Discord's Terms of Service, available at",
              " ",
              /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("a", { href: "https://discord.com/terms", children: "https://discord.com/terms" }, void 0, false, {
                fileName: "app/routes/legal.tsx",
                lineNumber: 59,
                columnNumber: 17
              }, this),
              "."
            ] }, void 0, true, {
              fileName: "app/routes/legal.tsx",
              lineNumber: 57,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "app/routes/legal.tsx",
            lineNumber: 52,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/legal.tsx",
          lineNumber: 50,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: [
          "You will not attempt to:",
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("ul", { className: "list-disc list-inside ml-4", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: "gain access to features otherwise not available to you;" }, void 0, false, {
              fileName: "app/routes/legal.tsx",
              lineNumber: 69,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: "bring harm or downtime to the service(s);" }, void 0, false, {
              fileName: "app/routes/legal.tsx",
              lineNumber: 70,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: "attack the hosting platforms used by the service(s)." }, void 0, false, {
              fileName: "app/routes/legal.tsx",
              lineNumber: 71,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "app/routes/legal.tsx",
            lineNumber: 68,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/legal.tsx",
          lineNumber: 66,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: "You acknowledge that the developer of the service(s) reserves the right to partially or fully forbid you from accessing or using the service(s), without warning, at their own discretion." }, void 0, false, {
          fileName: "app/routes/legal.tsx",
          lineNumber: 74,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/legal.tsx",
        lineNumber: 49,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", { className: "font-bold text-2xl mt-4", id: "privacy", children: "Privacy" }, void 0, false, {
        fileName: "app/routes/legal.tsx",
        lineNumber: 80,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: "In short: Boogiehook stores user-provided data as necessary for operations performed by the service(s). This data is not sold." }, void 0, false, {
        fileName: "app/routes/legal.tsx",
        lineNumber: 83,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", { className: "font-bold text-lg mt-2", children: "Definitions" }, void 0, false, {
        fileName: "app/routes/legal.tsx",
        lineNumber: 87,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("ul", { className: "list-disc list-inside my-1 space-y-1", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: "Database ID: This is a unique integer that represents a resource in Boogiehook's persistent database. It is not strictly bound to a Discord ID (snowflake), but it could correlate directly to one or multiple, depending on the resource." }, void 0, false, {
          fileName: "app/routes/legal.tsx",
          lineNumber: 89,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: "Moderation: Some actions may be logged by the server and linked to a Discord guild ID. Guild moderators may choose to view logs for their guild in order to uncover suspicious activity." }, void 0, false, {
          fileName: "app/routes/legal.tsx",
          lineNumber: 95,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/legal.tsx",
        lineNumber: 88,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", { className: "font-bold text-lg mt-2", children: "Policy" }, void 0, false, {
        fileName: "app/routes/legal.tsx",
        lineNumber: 101,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("ul", { className: "list-disc list-inside my-1 space-y-1", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: 'Some bot commands, especially those that cause new data to be created--for example "webhook create" and "buttons add"--will store data relevant to the result and the user that caused the execution.' }, void 0, false, {
          fileName: "app/routes/legal.tsx",
          lineNumber: 103,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: [
          "On the dedicated web-based interface:",
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("ul", { className: "list-disc list-inside ml-4", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: [
              "When the user creates a Discord webhook, that webhook's details--especially its ID, name, token, avatar hash, and channel ID--are stored until there is reason to remove it",
              "."
            ] }, void 0, true, {
              fileName: "app/routes/legal.tsx",
              lineNumber: 111,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: "When the user modifies a Discord webhook, a value is attached to the payload that identifies the user who made the change in the Discord guild's audit log page for Moderation." }, void 0, false, {
              fileName: "app/routes/legal.tsx",
              lineNumber: 124,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "app/routes/legal.tsx",
            lineNumber: 110,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/legal.tsx",
          lineNumber: 108,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: "All data is stored either on Cloudflare D1, Cloudflare KV, or Cloudflare R2, depending on the data." }, void 0, false, {
          fileName: "app/routes/legal.tsx",
          lineNumber: 131,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: "Data is not sold to third parties for any reason. Boogiehook is funded entirely through donations and premium subscriptions." }, void 0, false, {
          fileName: "app/routes/legal.tsx",
          lineNumber: 135,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: 'If the user has questions about data management and privacy, they may join the Discord guild linked at the bottom of this document by clicking on the button labeled "Support server" and inquire in the "boogiehook-support" channel.' }, void 0, false, {
          fileName: "app/routes/legal.tsx",
          lineNumber: 139,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/legal.tsx",
        lineNumber: 102,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("hr", { className: "border border-gray-500/20 my-4" }, void 0, false, {
        fileName: "app/routes/legal.tsx",
        lineNumber: 146,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(MessageComponents, { components: [{
        type: ComponentType.ActionRow,
        components: [{
          type: ComponentType.Button,
          style: ButtonStyle.Link,
          url: "https://github.com/shayypy/boogiehook/commits/master/app/routes/legal.tsx",
          label: "Page update history"
        }, {
          type: ComponentType.Button,
          style: ButtonStyle.Link,
          url: "https://discord.com/terms",
          label: "Discord's terms of service"
        }, {
          type: ComponentType.Button,
          style: ButtonStyle.Link,
          url: "/discord",
          label: "Support server"
        }]
      }] }, void 0, false, {
        fileName: "app/routes/legal.tsx",
        lineNumber: 147,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/legal.tsx",
      lineNumber: 40,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/legal.tsx",
    lineNumber: 38,
    columnNumber: 10
  }, this);
}
_s(Legal, "bH1LW0VjtDD5/q6YH82IbqfBSnU=", false, function() {
  return [useLoaderData];
});
_c = Legal;
var _c;
$RefreshReg$(_c, "Legal");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  Legal as default,
  meta
};
//# sourceMappingURL=/build/routes/legal-5RC5V3IM.js.map
