import {
  InfoBox
} from "/build/_shared/chunk-44E76CA3.js";
import {
  Prose
} from "/build/_shared/chunk-BI26XF4X.js";
import {
  ButtonStyle,
  ComponentType,
  CoolIcon,
  Header,
  MessageComponents,
  Twemoji,
  getUserAvatar,
  require_session
} from "/build/_shared/chunk-CENY6B5C.js";
import {
  Link,
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

// app/routes/discohook.tsx
var import_session = __toESM(require_session(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\routes\\\\discohook.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\routes\\discohook.tsx"
  );
  import.meta.hot.lastModified = "1702946929246.187";
}
var meta = () => [{
  title: "About Discohook & Discohook Utils - Boogiehook"
}];
function Legal() {
  _s();
  const user = useLoaderData();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Header, { user }, void 0, false, {
      fileName: "app/routes/discohook.tsx",
      lineNumber: 43,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Prose, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(InfoBox, { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Twemoji, { emoji: "\u{1F44B}", className: "inline-block align-sub mr-1" }, void 0, false, {
          fileName: "app/routes/discohook.tsx",
          lineNumber: 46,
          columnNumber: 11
        }, this),
        " ",
        "Hello there. If you were redirected from dutils.shay.cat, please read below! In short, Discohook Utils is now Boogiehook, but it's even better. Also, read the",
        " ",
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, { to: "/legal", className: "underline hover:no-underline", children: "updated legal documents" }, void 0, false, {
          fileName: "app/routes/discohook.tsx",
          lineNumber: 50,
          columnNumber: 11
        }, this),
        "."
      ] }, void 0, true, {
        fileName: "app/routes/discohook.tsx",
        lineNumber: 45,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", { className: "font-bold text-3xl", children: "What's the difference between Boogiehook, Discohook, and Discohook Utils?" }, void 0, false, {
        fileName: "app/routes/discohook.tsx",
        lineNumber: 55,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: "Boogiehook refers to this website and its Discord bot. It is a spiritual successor to Discohook (maintained by a different person). It also directly follows Discohook Utils, and uses the same bot account (Discohook Utils#4333)." }, void 0, false, {
        fileName: "app/routes/discohook.tsx",
        lineNumber: 59,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", { className: "font-bold text-3xl mt-4", children: "Do I need to do anything if I already use Discohook Utils?" }, void 0, false, {
        fileName: "app/routes/discohook.tsx",
        lineNumber: 65,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: 'As far as your buttons go, nope! Just bask in the new and improved suite of functionality at your disposal. Although we do recommend you nickname the bot to Boogiehook to avoid confusion. However, seeing as the bot is no longer built around Discohook, you will need to "re-learn" how its commands work now.' }, void 0, false, {
        fileName: "app/routes/discohook.tsx",
        lineNumber: 68,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", { className: "font-bold text-3xl mt-4", children: "Should I still use Discohook?" }, void 0, false, {
        fileName: "app/routes/discohook.tsx",
        lineNumber: 75,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: "You could, but Boogiehook is designed to be entirely independent. For most functions of the Boogiehook bot, you will be directed to Boogiehook at some point instead." }, void 0, false, {
        fileName: "app/routes/discohook.tsx",
        lineNumber: 78,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", { className: "font-bold text-2xl mt-4", children: "But what about my backups?" }, void 0, false, {
        fileName: "app/routes/discohook.tsx",
        lineNumber: 83,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: "It's easy to migrate your backups from Discohook." }, void 0, false, {
        fileName: "app/routes/discohook.tsx",
        lineNumber: 84,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("ol", { className: "list-decimal list-inside my-1.5 space-y-1", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: 'Open Discohook (discohook.org). Click the "Backups" button, then click "Export All". Your browser will download a file called backups.json.' }, void 0, false, {
          fileName: "app/routes/discohook.tsx",
          lineNumber: 86,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: [
          "Now head to your user page on Boogiehook (",
          user ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [
            "click your profile picture",
            " ",
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("img", { src: getUserAvatar(user), className: "rounded-full h-4 inline-block align-sub" }, void 0, false, {
              fileName: "app/routes/discohook.tsx",
              lineNumber: 95,
              columnNumber: 17
            }, this),
            " ",
            "at the top left"
          ] }, void 0, true, {
            fileName: "app/routes/discohook.tsx",
            lineNumber: 93,
            columnNumber: 21
          }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [
            "click the",
            " ",
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CoolIcon, { icon: "Log_Out", className: "rotate-180 text-blurple-400" }, void 0, false, {
              fileName: "app/routes/discohook.tsx",
              lineNumber: 99,
              columnNumber: 17
            }, this),
            " ",
            "icon at the top left to log in"
          ] }, void 0, true, {
            fileName: "app/routes/discohook.tsx",
            lineNumber: 97,
            columnNumber: 21
          }, this),
          ")."
        ] }, void 0, true, {
          fileName: "app/routes/discohook.tsx",
          lineNumber: 91,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: 'Under "Your Backups", click the "Import" button. Select the file that you downloaded from Discohook.' }, void 0, false, {
          fileName: "app/routes/discohook.tsx",
          lineNumber: 104,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/discohook.tsx",
        lineNumber: 85,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: "Note that Boogiehook backups are not stored the same way as Discohook backups! On Boogiehook, your backups are stored in the cloud and are available everywhere you are signed in with your Discord account. Although we do encourage you to keep offline backups of your data somewhere (on your computer) regardless." }, void 0, false, {
        fileName: "app/routes/discohook.tsx",
        lineNumber: 109,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("hr", { className: "border border-gray-500/20 my-4" }, void 0, false, {
        fileName: "app/routes/discohook.tsx",
        lineNumber: 116,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(MessageComponents, { components: [{
        type: ComponentType.ActionRow,
        components: [{
          type: ComponentType.Button,
          style: ButtonStyle.Link,
          url: "/",
          label: "Main editor"
        }, {
          type: ComponentType.Button,
          style: ButtonStyle.Link,
          url: "/discord/bot",
          label: "Invite the Boogiehook bot"
        }]
      }] }, void 0, false, {
        fileName: "app/routes/discohook.tsx",
        lineNumber: 117,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/discohook.tsx",
      lineNumber: 44,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/discohook.tsx",
    lineNumber: 42,
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
//# sourceMappingURL=/build/routes/discohook-CRYYD6AH.js.map
