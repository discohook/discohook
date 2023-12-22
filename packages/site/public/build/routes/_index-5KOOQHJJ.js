import {
  TextInput,
  base64Decode,
  base64UrlEncode,
  copyText,
  randomString,
  require_dist,
  z
} from "/build/_shared/chunk-22RUGG5T.js";
import {
  InfoBox
} from "/build/_shared/chunk-44E76CA3.js";
import {
  AuthorType,
  Button,
  ButtonStyle,
  CUSTOM_EMOJI_RE,
  Checkbox,
  ComponentType,
  CoolIcon,
  Header,
  Message,
  Modal,
  StringSelect,
  Twemoji,
  cdn,
  executeWebhook,
  getAuthorType,
  getSnowflakeDate,
  getUserAvatar,
  getUserTag,
  getWebhook,
  getWebhookMessage,
  modifyWebhook,
  require_lib,
  require_session,
  selectClassNames,
  selectStrings,
  updateWebhookMessage,
  useLocalStorage
} from "/build/_shared/chunk-CENY6B5C.js";
import {
  Link,
  useFetcher,
  useLoaderData,
  useSearchParams
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
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// app/routes/_index.tsx
var import_react13 = __toESM(require_react(), 1);
var import_zodix2 = __toESM(require_dist(), 1);

// app/modals/ImageModal.tsx
var import_react = __toESM(require_react(), 1);
var import_react_modal = __toESM(require_lib(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\modals\\\\ImageModal.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\modals\\ImageModal.tsx"
  );
  import.meta.hot.lastModified = "1695913027543.5854";
}
var ImageModal = (props) => {
  _s();
  const {
    images,
    startIndex
  } = props;
  const [index, setIndex] = (0, import_react.useState)(startIndex);
  const image = images && index !== void 0 ? images[index] : void 0;
  (0, import_react.useEffect)(() => {
    if (images && startIndex !== void 0)
      setIndex(startIndex);
  }, [images, startIndex]);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_react_modal.default, { isOpen: !!images && startIndex !== void 0, onRequestClose: props.clear, ariaHideApp: false, closeTimeoutMS: 100, style: {
    overlay: {
      zIndex: 11,
      backgroundColor: "rgb(0 0 0 / 0.5)",
      cursor: "zoom-out"
    },
    content: {
      zIndex: 11,
      padding: "2rem",
      background: "none",
      border: "none",
      maxWidth: "100%",
      height: "fit-content",
      maxHeight: "100%",
      margin: "auto",
      overflow: "visible",
      cursor: "default"
    }
  }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "w-full flex flex-wrap md:flex-nowrap", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "w-6 mx-auto md:my-auto md:ml-0 md:mr-8", children: images && images.length > 1 && index !== void 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { className: "my-auto text-gray-100 text-2xl", onClick: () => {
      let siblingIndex = index - 1;
      if (siblingIndex < 0) {
        siblingIndex = images.length - 1;
      }
      setIndex(siblingIndex);
    }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CoolIcon, { icon: "Arrow_Left_LG" }, void 0, false, {
      fileName: "app/modals/ImageModal.tsx",
      lineNumber: 64,
      columnNumber: 15
    }, this) }, void 0, false, {
      fileName: "app/modals/ImageModal.tsx",
      lineNumber: 57,
      columnNumber: 66
    }, this) }, void 0, false, {
      fileName: "app/modals/ImageModal.tsx",
      lineNumber: 56,
      columnNumber: 9
    }, this),
    image && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "m-auto max-h-[calc(100vh_-_4rem)] overflow-hidden", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("img", { src: image.url, alt: image.alt, className: "rounded" }, void 0, false, {
      fileName: "app/modals/ImageModal.tsx",
      lineNumber: 68,
      columnNumber: 13
    }, this) }, void 0, false, {
      fileName: "app/modals/ImageModal.tsx",
      lineNumber: 67,
      columnNumber: 19
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "w-6 mx-auto md:my-auto md:mr-0 md:ml-8", children: images && images.length > 1 && index !== void 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { className: "my-auto text-gray-100 text-2xl", onClick: () => {
      let siblingIndex = index + 1;
      if (siblingIndex > images.length - 1) {
        siblingIndex = 0;
      }
      setIndex(siblingIndex);
    }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CoolIcon, { icon: "Arrow_Right_LG" }, void 0, false, {
      fileName: "app/modals/ImageModal.tsx",
      lineNumber: 78,
      columnNumber: 15
    }, this) }, void 0, false, {
      fileName: "app/modals/ImageModal.tsx",
      lineNumber: 71,
      columnNumber: 66
    }, this) }, void 0, false, {
      fileName: "app/modals/ImageModal.tsx",
      lineNumber: 70,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "app/modals/ImageModal.tsx",
    lineNumber: 55,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/modals/ImageModal.tsx",
    lineNumber: 36,
    columnNumber: 10
  }, this);
};
_s(ImageModal, "YcRA0mrY7Pu1XTsvtj84tSktHDE=");
_c = ImageModal;
var _c;
$RefreshReg$(_c, "ImageModal");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/routes/_index.tsx
var import_session = __toESM(require_session(), 1);

// app/types/QueryData.ts
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\types\\QueryData.ts"
  );
  import.meta.hot.lastModified = "1702059127041.1472";
}
var ZodQueryData = z.any();

// app/util/constants.ts
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\util\\constants.ts"
  );
  import.meta.hot.lastModified = "1702062916311.422";
}
var WEBHOOK_URL_RE = /^https?:\/\/(?:www\.|ptb\.|canary\.)?discord(?:app)?\.com\/api(?:\/v\d+)?\/webhooks\/(\d+)\/([\w-]+)$/;
var MESSAGE_REF_RE = /^(?:https:\/\/(?:www\.|ptb\.|canary\.)?discord(?:app)?\.com\/channels\/(\d+)\/(\d+)\/)?(\d+)$/;
var INDEX_MESSAGE = {
  data: {
    content: "Hello, welcome to Boogiehook!",
    embeds: [
      {
        title: "Discohook",
        description: `You may be familiar with this interface from [Discohook](https://discohook.app)! This site is not maintained by the original creator of Discohook.`
      }
    ],
    components: [{
      type: ComponentType.ActionRow,
      components: [{
        type: ComponentType.Button,
        style: ButtonStyle.Link,
        label: "Donate to Boogiehook",
        url: "https://ko-fi.com/shayypy"
      }]
    }]
  }
};
var INDEX_FAILURE_MESSAGE = {
  data: {
    content: "The data you loaded this page with was invalid. If you're a developer, [check out the schema](https://github.com/shayypy/boogiehook/blob/master/app/types/QueryData.ts). If you need help, [join the support server](/discord)."
  }
};

// app/modals/PreviewDisclaimerModal.tsx
var import_jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\modals\\\\PreviewDisclaimerModal.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\modals\\PreviewDisclaimerModal.tsx"
  );
  import.meta.hot.lastModified = "1695913027546.0332";
}
var PreviewDisclaimerModal = (props) => {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Modal, { title: "Preview Disclaimer", ...props, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("p", { children: "The Boogiehook preview is only an estimation of what your message will look like when sent to Discord. The only 100% accurate view is when you actually send your message into Discord (and even then there are bunches of inconsistencies)." }, void 0, false, {
      fileName: "app/modals/PreviewDisclaimerModal.tsx",
      lineNumber: 25,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("p", { className: "mt-2", children: "If something doesn't seem right, just send the message in a private channel to make sure everything is working as expected. New Discord style updates will usually be reflected within a few days or weeks." }, void 0, false, {
      fileName: "app/modals/PreviewDisclaimerModal.tsx",
      lineNumber: 31,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "flex w-full mt-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Button, { onClick: () => props.setOpen(false), className: "mx-auto", children: "OK" }, void 0, false, {
      fileName: "app/modals/PreviewDisclaimerModal.tsx",
      lineNumber: 37,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/modals/PreviewDisclaimerModal.tsx",
      lineNumber: 36,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/modals/PreviewDisclaimerModal.tsx",
    lineNumber: 24,
    columnNumber: 10
  }, this);
};
_c2 = PreviewDisclaimerModal;
var _c2;
$RefreshReg$(_c2, "PreviewDisclaimerModal");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/modals/ExampleModal.tsx
var import_jsx_dev_runtime3 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\modals\\\\ExampleModal.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s2 = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\modals\\ExampleModal.tsx"
  );
  import.meta.hot.lastModified = "1703084902182.7695";
}
var ExampleModal = (props) => {
  _s2();
  const [settings] = useLocalStorage();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(Modal, { title: "Embed Example", ...props, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("p", { children: "Discord messages come in all shapes and sizes. Here's an example message that showcases every text field." }, void 0, false, {
      fileName: "app/modals/ExampleModal.tsx",
      lineNumber: 30,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("div", { className: "mt-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(Message, { messageDisplay: settings.messageDisplay, compactAvatars: settings.compactAvatars, message: {
      content: "Content",
      embeds: [{
        author: {
          name: "Author"
        },
        title: "Title",
        description: "Description\n\n<-- Sidebar color",
        color: 15418783,
        fields: [{
          name: "Field 1 (inline)",
          value: "Field 1 value",
          inline: true
        }, {
          name: "Field 2 (inline)",
          value: "Field 2 value",
          inline: true
        }, {
          name: "Field 3 (inline)",
          value: "Field 3 value",
          inline: true
        }, {
          name: "Field 4 (not inline)",
          value: "Field 4 value",
          inline: false
        }, {
          name: "Field 5 (not inline)",
          value: "Field 5 value",
          inline: false
        }],
        footer: {
          text: "Footer"
        }
      }]
    } }, void 0, false, {
      fileName: "app/modals/ExampleModal.tsx",
      lineNumber: 35,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/modals/ExampleModal.tsx",
      lineNumber: 34,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("div", { className: "flex w-full mt-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(Button, { onClick: () => props.setOpen(false), className: "mx-auto", children: "OK" }, void 0, false, {
      fileName: "app/modals/ExampleModal.tsx",
      lineNumber: 72,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/modals/ExampleModal.tsx",
      lineNumber: 71,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/modals/ExampleModal.tsx",
    lineNumber: 29,
    columnNumber: 10
  }, this);
};
_s2(ExampleModal, "Dl2f5k4j3CFPpN2cS2Jksd056AU=", false, function() {
  return [useLocalStorage];
});
_c3 = ExampleModal;
var _c3;
$RefreshReg$(_c3, "ExampleModal");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/modals/MessageSetModal.tsx
var import_react2 = __toESM(require_react(), 1);
var import_jsx_dev_runtime4 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\modals\\\\MessageSetModal.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s3 = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\modals\\MessageSetModal.tsx"
  );
  import.meta.hot.lastModified = "1702846302917.7263";
}
var MessageSetModal = (props) => {
  _s3();
  const {
    targets,
    setAddingTarget,
    data,
    setData,
    messageIndex
  } = props;
  const message = messageIndex !== void 0 ? data.messages[messageIndex] : void 0;
  const [webhook, setWebhook] = (0, import_react2.useState)();
  const [messageLink, setMessageLink] = (0, import_react2.useState)();
  const [error, setError] = (0, import_react2.useState)();
  const setOpen = (s) => {
    props.setOpen(s);
    if (!s) {
      setWebhook(void 0);
      setMessageLink(void 0);
    }
  };
  const possibleWebhooks = Object.values(targets).filter((w) => messageLink && w.guild_id && messageLink[0] ? w.guild_id === messageLink[0] : true);
  if (message?.data?.webhook_id) {
    const extantWebhookMatch = targets[message.data.webhook_id];
    if (extantWebhookMatch && !possibleWebhooks.includes(extantWebhookMatch)) {
      possibleWebhooks.splice(0, 0, extantWebhookMatch);
    }
  }
  (0, import_react2.useEffect)(() => {
    if (message) {
      if (message.data.webhook_id) {
        setWebhook(targets[message.data.webhook_id]);
      }
      if (message.reference) {
        const match = message.reference.match(MESSAGE_REF_RE);
        if (match) {
          setMessageLink([match[1], match[2], match[3]]);
        }
      }
    }
  }, [message]);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(Modal, { title: "Set Message Reference", ...props, setOpen, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(TextInput, { label: "Message Link", className: "w-full", errors: [error], defaultValue: message?.reference, onInput: async (e) => {
      setError(void 0);
      setMessageLink(void 0);
      if (!e.currentTarget.value)
        return;
      const match = e.currentTarget.value.match(MESSAGE_REF_RE);
      if (!match) {
        setError(/* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_jsx_dev_runtime4.Fragment, { children: [
          "Invalid message link. They start with",
          " ",
          "https://discord.com/channels/... and have three sets of numbers."
        ] }, void 0, true, {
          fileName: "app/modals/MessageSetModal.tsx",
          lineNumber: 78,
          columnNumber: 20
        }, this));
        return;
      }
      setMessageLink([match[1], match[2], match[3]]);
    } }, void 0, false, {
      fileName: "app/modals/MessageSetModal.tsx",
      lineNumber: 72,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/modals/MessageSetModal.tsx",
      lineNumber: 71,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("hr", { className: "border border-gray-400 dark:border-gray-600 my-4" }, void 0, false, {
      fileName: "app/modals/MessageSetModal.tsx",
      lineNumber: 88,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("p", { className: "text-sm font-medium", children: "Webhook" }, void 0, false, {
      fileName: "app/modals/MessageSetModal.tsx",
      lineNumber: 89,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { className: "space-y-1", children: Object.keys(possibleWebhooks).length > 0 ? Object.entries(possibleWebhooks).map(([targetId, target]) => {
      return /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("label", { className: "flex rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 hover:dark:bg-gray-600 transition py-2 px-4 w-full cursor-pointer", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("img", { src: target.avatar ? cdn.avatar(target.id, target.avatar, {
          size: 64
        }) : cdn.defaultAvatar(5), alt: target.name ?? "Webhook", className: "rounded-full h-12 w-12 mr-2 my-auto" }, void 0, false, {
          fileName: "app/modals/MessageSetModal.tsx",
          lineNumber: 93,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { className: "my-auto grow text-left", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("p", { className: "font-semibold text-base", children: target.name ?? "Webhook" }, void 0, false, {
            fileName: "app/modals/MessageSetModal.tsx",
            lineNumber: 97,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("p", { className: "text-sm leading-none", children: [
            "Channel ID ",
            target.channel_id
          ] }, void 0, true, {
            fileName: "app/modals/MessageSetModal.tsx",
            lineNumber: 100,
            columnNumber: 19
          }, this)
        ] }, void 0, true, {
          fileName: "app/modals/MessageSetModal.tsx",
          lineNumber: 96,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("input", { type: "radio", name: "webhook", checked: !!webhook && target.id === webhook.id, onChange: (e) => {
          if (e.currentTarget.checked)
            setWebhook(target);
        }, hidden: true }, void 0, false, {
          fileName: "app/modals/MessageSetModal.tsx",
          lineNumber: 104,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(CoolIcon, { icon: !!webhook && webhook.id === target.id ? "Radio_Fill" : "Radio_Unchecked", className: "ml-auto my-auto text-2xl text-blurple dark:text-blurple-400" }, void 0, false, {
          fileName: "app/modals/MessageSetModal.tsx",
          lineNumber: 107,
          columnNumber: 17
        }, this)
      ] }, `target-${targetId}`, true, {
        fileName: "app/modals/MessageSetModal.tsx",
        lineNumber: 92,
        columnNumber: 16
      }, this);
    }) : /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { children: [
      Object.keys(targets).length > 0 && messageLink && messageLink[0] && /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("p", { children: "You haven't added any webhooks that match the message link you provided. To overwrite or edit, you will need to add the correct webhook." }, void 0, false, {
        fileName: "app/modals/MessageSetModal.tsx",
        lineNumber: 110,
        columnNumber: 82
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(Button, { onClick: () => setAddingTarget(true), children: "Add Webhook" }, void 0, false, {
        fileName: "app/modals/MessageSetModal.tsx",
        lineNumber: 115,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "app/modals/MessageSetModal.tsx",
      lineNumber: 109,
      columnNumber: 12
    }, this) }, void 0, false, {
      fileName: "app/modals/MessageSetModal.tsx",
      lineNumber: 90,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { className: "flex mt-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { className: "mx-auto space-x-2", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(Button, { disabled: !messageLink, onClick: () => {
        if (messageLink && messageIndex !== void 0) {
          data.messages.splice(messageIndex, 1, {
            ...data.messages[messageIndex],
            reference: messageLink[0] ? `https://discord.com/channels/${messageLink[0]}/${messageLink[1]}/${messageLink[2]}` : messageLink[2]
          });
          setData({
            ...data
          });
          setOpen(false);
        }
      }, children: "Set Reference" }, void 0, false, {
        fileName: "app/modals/MessageSetModal.tsx",
        lineNumber: 120,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(Button, { disabled: !messageLink || !webhook, discordstyle: ButtonStyle.Secondary, onClick: async () => {
        if (messageLink && webhook) {
          if (messageLink[0] && webhook.guild_id !== messageLink[0]) {
            setError("Webhook server ID does not match message link.");
          }
          let msg = await getWebhookMessage(webhook.id, webhook.token, messageLink[2]);
          if ("code" in msg && msg.code === 10008 && messageLink[1]) {
            console.log(`Message ID ${messageLink[2]} not found in webhook channel, trying again with ${messageLink[1]} as thread ID`);
            msg = await getWebhookMessage(webhook.id, webhook.token, messageLink[2], messageLink[1]);
          }
          if ("message" in msg) {
            setError(msg.message);
            return;
          }
          if (messageIndex !== void 0) {
            data.messages.splice(messageIndex, 1, {
              data: {
                content: msg.content,
                embeds: msg.embeds,
                attachments: msg.attachments,
                webhook_id: msg.webhook_id
              },
              reference: messageLink[0] ? `https://discord.com/channels/${messageLink[0]}/${messageLink[1]}/${messageLink[2]}` : messageLink[2]
            });
            setData({
              ...data
            });
            setOpen(false);
          }
        }
      }, children: "Overwrite Message" }, void 0, false, {
        fileName: "app/modals/MessageSetModal.tsx",
        lineNumber: 134,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(Button, { disabled: !message?.reference, discordstyle: ButtonStyle.Danger, onClick: () => {
        if (message) {
          message.data.webhook_id = void 0;
          message.reference = void 0;
          setData({
            ...data
          });
          setOpen(false);
        }
      }, children: "Remove Reference" }, void 0, false, {
        fileName: "app/modals/MessageSetModal.tsx",
        lineNumber: 167,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "app/modals/MessageSetModal.tsx",
      lineNumber: 119,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/modals/MessageSetModal.tsx",
      lineNumber: 118,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/modals/MessageSetModal.tsx",
    lineNumber: 70,
    columnNumber: 10
  }, this);
};
_s3(MessageSetModal, "dAjJHCshlMubJcE2DSPMete7UxQ=");
_c4 = MessageSetModal;
var _c4;
$RefreshReg$(_c4, "MessageSetModal");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/modals/MessageSendModal.tsx
var import_react7 = __toESM(require_react(), 1);

// app/components/TextArea.tsx
var import_react3 = __toESM(require_react(), 1);
var import_jsx_dev_runtime5 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\components\\\\TextArea.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s4 = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\components\\TextArea.tsx"
  );
  import.meta.hot.lastModified = "1695937715321.03";
}
var TextArea = (props) => {
  _s4();
  const {
    label,
    onInput,
    delayOnInput
  } = props;
  const [timeoutId, setTimeoutId] = (0, import_react3.useState)();
  const newProps = {
    ...props
  };
  delete newProps.delayOnInput;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("label", { className: "block", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("p", { className: "text-sm font-medium flex", children: [
      label,
      props.maxLength && /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("span", { className: "ml-auto", children: [
        "max. ",
        props.maxLength
      ] }, void 0, true, {
        fileName: "app/components/TextArea.tsx",
        lineNumber: 41,
        columnNumber: 29
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/TextArea.tsx",
      lineNumber: 39,
      columnNumber: 7
    }, this),
    props.description && /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("p", { className: "text-sm", children: props.description }, void 0, false, {
      fileName: "app/components/TextArea.tsx",
      lineNumber: 43,
      columnNumber: 29
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("textarea", { ...newProps, onInput: (e) => {
      const event = {
        ...e
      };
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(void 0);
      }
      if (onInput && delayOnInput !== void 0) {
        setTimeoutId(setTimeout(() => {
          onInput(event);
          setTimeoutId(void 0);
        }, delayOnInput));
      } else if (onInput) {
        return onInput(event);
      }
    }, className: `rounded border bg-gray-300 border-gray-200 focus:border-blurple-500 dark:border-transparent dark:bg-[#292b2f] p-2 invalid:border-rose-400 dark:invalid:border-rose-400 transition ${props.className ?? ""}` }, void 0, false, {
      fileName: "app/components/TextArea.tsx",
      lineNumber: 44,
      columnNumber: 7
    }, this),
    props.errors && props.errors.filter((e) => e !== void 0).map((error, i) => /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("p", { className: "text-rose-500 font-medium mt-1 text-sm", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(CoolIcon, { icon: "Circle_Warning", className: "mr-1.5" }, void 0, false, {
        fileName: "app/components/TextArea.tsx",
        lineNumber: 66,
        columnNumber: 13
      }, this),
      error
    ] }, `${props.id ?? label}-error-${i}`, true, {
      fileName: "app/components/TextArea.tsx",
      lineNumber: 65,
      columnNumber: 84
    }, this))
  ] }, void 0, true, {
    fileName: "app/components/TextArea.tsx",
    lineNumber: 38,
    columnNumber: 10
  }, this);
};
_s4(TextArea, "0WwKClxy2nB6olKEZM9FkT6Zw1I=");
_c5 = TextArea;
var _c5;
$RefreshReg$(_c5, "TextArea");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/components/ButtonSelect.tsx
var import_react4 = __toESM(require_react(), 1);
var import_jsx_dev_runtime6 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\components\\\\ButtonSelect.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s5 = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\components\\ButtonSelect.tsx"
  );
  import.meta.hot.lastModified = "1703131784148.8613";
}
var ButtonSelect = (props) => {
  _s5();
  const [isOpen, setIsOpen] = (0, import_react4.useState)(false);
  const [value, setValue] = (0, import_react4.useState)();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(Dropdown, { isOpen, onClose: () => setIsOpen(false), target: /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(Button, { onClick: () => setIsOpen((prev) => !prev), disabled: props.isDisabled, children: [
    props.children,
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(CoolIcon, { icon: "Chevron_Down", className: `my-auto ml-1.5 transition-all ${isOpen ? "rotate-180" : "rotate-0"}` }, void 0, false, {
      fileName: "app/components/ButtonSelect.tsx",
      lineNumber: 34,
      columnNumber: 11
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/ButtonSelect.tsx",
    lineNumber: 32,
    columnNumber: 77
  }, this), children: /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(StringSelect, { ...{
    ...props,
    children: void 0
  }, backspaceRemovesValue: false, controlShouldRenderValue: false, hideSelectedOptions: false, isSearchable: false, isClearable: false, classNames: {
    control: (p) => selectClassNames.control(p) + " !invisible !min-h-0 !max-h-0 !-mt-3"
  }, menuIsOpen: true, onChange: (newValue, a) => {
    setValue(newValue);
    setIsOpen(false);
    if (props.onChange) {
      props.onChange(newValue, a);
    }
  }, tabSelectsValue: false, value }, void 0, false, {
    fileName: "app/components/ButtonSelect.tsx",
    lineNumber: 36,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/components/ButtonSelect.tsx",
    lineNumber: 32,
    columnNumber: 10
  }, this);
};
_s5(ButtonSelect, "kr4Rh90sujkjUonSviWOiQ/GQrM=");
_c6 = ButtonSelect;
var Menu = (props) => /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "absolute mt-1 z-20", ...props }, void 0, false, {
  fileName: "app/components/ButtonSelect.tsx",
  lineNumber: 52,
  columnNumber: 23
}, this);
_c22 = Menu;
var Blanket = (props) => /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "bottom-0 left-0 top-0 right-0 fixed z-10", ...props }, void 0, false, {
  fileName: "app/components/ButtonSelect.tsx",
  lineNumber: 54,
  columnNumber: 26
}, this);
_c32 = Blanket;
var Dropdown = ({
  children,
  isOpen,
  target,
  onClose
}) => /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "relative", children: [
  target,
  isOpen ? /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(Menu, { children }, void 0, false, {
    fileName: "app/components/ButtonSelect.tsx",
    lineNumber: 63,
    columnNumber: 15
  }, this) : null,
  isOpen ? /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(Blanket, { onClick: onClose }, void 0, false, {
    fileName: "app/components/ButtonSelect.tsx",
    lineNumber: 64,
    columnNumber: 15
  }, this) : null
] }, void 0, true, {
  fileName: "app/components/ButtonSelect.tsx",
  lineNumber: 61,
  columnNumber: 7
}, this);
_c42 = Dropdown;
var _c6;
var _c22;
var _c32;
var _c42;
$RefreshReg$(_c6, "ButtonSelect");
$RefreshReg$(_c22, "Menu");
$RefreshReg$(_c32, "Blanket");
$RefreshReg$(_c42, "Dropdown");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// node_modules/@emoji-mart/data/sets/14/native.json
var native_default = { categories: [{ id: "people", emojis: ["grinning", "smiley", "smile", "grin", "laughing", "sweat_smile", "rolling_on_the_floor_laughing", "joy", "slightly_smiling_face", "upside_down_face", "melting_face", "wink", "blush", "innocent", "smiling_face_with_3_hearts", "heart_eyes", "star-struck", "kissing_heart", "kissing", "relaxed", "kissing_closed_eyes", "kissing_smiling_eyes", "smiling_face_with_tear", "yum", "stuck_out_tongue", "stuck_out_tongue_winking_eye", "zany_face", "stuck_out_tongue_closed_eyes", "money_mouth_face", "hugging_face", "face_with_hand_over_mouth", "face_with_open_eyes_and_hand_over_mouth", "face_with_peeking_eye", "shushing_face", "thinking_face", "saluting_face", "zipper_mouth_face", "face_with_raised_eyebrow", "neutral_face", "expressionless", "no_mouth", "dotted_line_face", "face_in_clouds", "smirk", "unamused", "face_with_rolling_eyes", "grimacing", "face_exhaling", "lying_face", "relieved", "pensive", "sleepy", "drooling_face", "sleeping", "mask", "face_with_thermometer", "face_with_head_bandage", "nauseated_face", "face_vomiting", "sneezing_face", "hot_face", "cold_face", "woozy_face", "dizzy_face", "face_with_spiral_eyes", "exploding_head", "face_with_cowboy_hat", "partying_face", "disguised_face", "sunglasses", "nerd_face", "face_with_monocle", "confused", "face_with_diagonal_mouth", "worried", "slightly_frowning_face", "white_frowning_face", "open_mouth", "hushed", "astonished", "flushed", "pleading_face", "face_holding_back_tears", "frowning", "anguished", "fearful", "cold_sweat", "disappointed_relieved", "cry", "sob", "scream", "confounded", "persevere", "disappointed", "sweat", "weary", "tired_face", "yawning_face", "triumph", "rage", "angry", "face_with_symbols_on_mouth", "smiling_imp", "imp", "skull", "skull_and_crossbones", "hankey", "clown_face", "japanese_ogre", "japanese_goblin", "ghost", "alien", "space_invader", "robot_face", "wave", "raised_back_of_hand", "raised_hand_with_fingers_splayed", "hand", "spock-hand", "rightwards_hand", "leftwards_hand", "palm_down_hand", "palm_up_hand", "ok_hand", "pinched_fingers", "pinching_hand", "v", "crossed_fingers", "hand_with_index_finger_and_thumb_crossed", "i_love_you_hand_sign", "the_horns", "call_me_hand", "point_left", "point_right", "point_up_2", "middle_finger", "point_down", "point_up", "index_pointing_at_the_viewer", "+1", "-1", "fist", "facepunch", "left-facing_fist", "right-facing_fist", "clap", "raised_hands", "heart_hands", "open_hands", "palms_up_together", "handshake", "pray", "writing_hand", "nail_care", "selfie", "muscle", "mechanical_arm", "mechanical_leg", "leg", "foot", "ear", "ear_with_hearing_aid", "nose", "brain", "anatomical_heart", "lungs", "tooth", "bone", "eyes", "eye", "tongue", "lips", "biting_lip", "baby", "child", "boy", "girl", "adult", "person_with_blond_hair", "man", "bearded_person", "man_with_beard", "woman_with_beard", "red_haired_man", "curly_haired_man", "white_haired_man", "bald_man", "woman", "red_haired_woman", "red_haired_person", "curly_haired_woman", "curly_haired_person", "white_haired_woman", "white_haired_person", "bald_woman", "bald_person", "blond-haired-woman", "blond-haired-man", "older_adult", "older_man", "older_woman", "person_frowning", "man-frowning", "woman-frowning", "person_with_pouting_face", "man-pouting", "woman-pouting", "no_good", "man-gesturing-no", "woman-gesturing-no", "ok_woman", "man-gesturing-ok", "woman-gesturing-ok", "information_desk_person", "man-tipping-hand", "woman-tipping-hand", "raising_hand", "man-raising-hand", "woman-raising-hand", "deaf_person", "deaf_man", "deaf_woman", "bow", "man-bowing", "woman-bowing", "face_palm", "man-facepalming", "woman-facepalming", "shrug", "man-shrugging", "woman-shrugging", "health_worker", "male-doctor", "female-doctor", "student", "male-student", "female-student", "teacher", "male-teacher", "female-teacher", "judge", "male-judge", "female-judge", "farmer", "male-farmer", "female-farmer", "cook", "male-cook", "female-cook", "mechanic", "male-mechanic", "female-mechanic", "factory_worker", "male-factory-worker", "female-factory-worker", "office_worker", "male-office-worker", "female-office-worker", "scientist", "male-scientist", "female-scientist", "technologist", "male-technologist", "female-technologist", "singer", "male-singer", "female-singer", "artist", "male-artist", "female-artist", "pilot", "male-pilot", "female-pilot", "astronaut", "male-astronaut", "female-astronaut", "firefighter", "male-firefighter", "female-firefighter", "cop", "male-police-officer", "female-police-officer", "sleuth_or_spy", "male-detective", "female-detective", "guardsman", "male-guard", "female-guard", "ninja", "construction_worker", "male-construction-worker", "female-construction-worker", "person_with_crown", "prince", "princess", "man_with_turban", "man-wearing-turban", "woman-wearing-turban", "man_with_gua_pi_mao", "person_with_headscarf", "person_in_tuxedo", "man_in_tuxedo", "woman_in_tuxedo", "bride_with_veil", "man_with_veil", "woman_with_veil", "pregnant_woman", "pregnant_man", "pregnant_person", "breast-feeding", "woman_feeding_baby", "man_feeding_baby", "person_feeding_baby", "angel", "santa", "mrs_claus", "mx_claus", "superhero", "male_superhero", "female_superhero", "supervillain", "male_supervillain", "female_supervillain", "mage", "male_mage", "female_mage", "fairy", "male_fairy", "female_fairy", "vampire", "male_vampire", "female_vampire", "merperson", "merman", "mermaid", "elf", "male_elf", "female_elf", "genie", "male_genie", "female_genie", "zombie", "male_zombie", "female_zombie", "troll", "massage", "man-getting-massage", "woman-getting-massage", "haircut", "man-getting-haircut", "woman-getting-haircut", "walking", "man-walking", "woman-walking", "standing_person", "man_standing", "woman_standing", "kneeling_person", "man_kneeling", "woman_kneeling", "person_with_probing_cane", "man_with_probing_cane", "woman_with_probing_cane", "person_in_motorized_wheelchair", "man_in_motorized_wheelchair", "woman_in_motorized_wheelchair", "person_in_manual_wheelchair", "man_in_manual_wheelchair", "woman_in_manual_wheelchair", "runner", "man-running", "woman-running", "dancer", "man_dancing", "man_in_business_suit_levitating", "dancers", "men-with-bunny-ears-partying", "women-with-bunny-ears-partying", "person_in_steamy_room", "man_in_steamy_room", "woman_in_steamy_room", "person_climbing", "man_climbing", "woman_climbing", "fencer", "horse_racing", "skier", "snowboarder", "golfer", "man-golfing", "woman-golfing", "surfer", "man-surfing", "woman-surfing", "rowboat", "man-rowing-boat", "woman-rowing-boat", "swimmer", "man-swimming", "woman-swimming", "person_with_ball", "man-bouncing-ball", "woman-bouncing-ball", "weight_lifter", "man-lifting-weights", "woman-lifting-weights", "bicyclist", "man-biking", "woman-biking", "mountain_bicyclist", "man-mountain-biking", "woman-mountain-biking", "person_doing_cartwheel", "man-cartwheeling", "woman-cartwheeling", "wrestlers", "man-wrestling", "woman-wrestling", "water_polo", "man-playing-water-polo", "woman-playing-water-polo", "handball", "man-playing-handball", "woman-playing-handball", "juggling", "man-juggling", "woman-juggling", "person_in_lotus_position", "man_in_lotus_position", "woman_in_lotus_position", "bath", "sleeping_accommodation", "people_holding_hands", "two_women_holding_hands", "man_and_woman_holding_hands", "two_men_holding_hands", "couplekiss", "woman-kiss-man", "man-kiss-man", "woman-kiss-woman", "couple_with_heart", "woman-heart-man", "man-heart-man", "woman-heart-woman", "family", "man-woman-boy", "man-woman-girl", "man-woman-girl-boy", "man-woman-boy-boy", "man-woman-girl-girl", "man-man-boy", "man-man-girl", "man-man-girl-boy", "man-man-boy-boy", "man-man-girl-girl", "woman-woman-boy", "woman-woman-girl", "woman-woman-girl-boy", "woman-woman-boy-boy", "woman-woman-girl-girl", "man-boy", "man-boy-boy", "man-girl", "man-girl-boy", "man-girl-girl", "woman-boy", "woman-boy-boy", "woman-girl", "woman-girl-boy", "woman-girl-girl", "speaking_head_in_silhouette", "bust_in_silhouette", "busts_in_silhouette", "people_hugging", "footprints", "smiley_cat", "smile_cat", "joy_cat", "heart_eyes_cat", "smirk_cat", "kissing_cat", "scream_cat", "crying_cat_face", "pouting_cat", "see_no_evil", "hear_no_evil", "speak_no_evil", "kiss", "love_letter", "cupid", "gift_heart", "sparkling_heart", "heartpulse", "heartbeat", "revolving_hearts", "two_hearts", "heart_decoration", "heavy_heart_exclamation_mark_ornament", "broken_heart", "heart_on_fire", "mending_heart", "heart", "orange_heart", "yellow_heart", "green_heart", "blue_heart", "purple_heart", "brown_heart", "black_heart", "white_heart", "100", "anger", "boom", "dizzy", "sweat_drops", "dash", "hole", "bomb", "speech_balloon", "eye-in-speech-bubble", "left_speech_bubble", "right_anger_bubble", "thought_balloon", "zzz"] }, { id: "nature", emojis: ["monkey_face", "monkey", "gorilla", "orangutan", "dog", "dog2", "guide_dog", "service_dog", "poodle", "wolf", "fox_face", "raccoon", "cat", "cat2", "black_cat", "lion_face", "tiger", "tiger2", "leopard", "horse", "racehorse", "unicorn_face", "zebra_face", "deer", "bison", "cow", "ox", "water_buffalo", "cow2", "pig", "pig2", "boar", "pig_nose", "ram", "sheep", "goat", "dromedary_camel", "camel", "llama", "giraffe_face", "elephant", "mammoth", "rhinoceros", "hippopotamus", "mouse", "mouse2", "rat", "hamster", "rabbit", "rabbit2", "chipmunk", "beaver", "hedgehog", "bat", "bear", "polar_bear", "koala", "panda_face", "sloth", "otter", "skunk", "kangaroo", "badger", "feet", "turkey", "chicken", "rooster", "hatching_chick", "baby_chick", "hatched_chick", "bird", "penguin", "dove_of_peace", "eagle", "duck", "swan", "owl", "dodo", "feather", "flamingo", "peacock", "parrot", "frog", "crocodile", "turtle", "lizard", "snake", "dragon_face", "dragon", "sauropod", "t-rex", "whale", "whale2", "dolphin", "seal", "fish", "tropical_fish", "blowfish", "shark", "octopus", "shell", "coral", "snail", "butterfly", "bug", "ant", "bee", "beetle", "ladybug", "cricket", "cockroach", "spider", "spider_web", "scorpion", "mosquito", "fly", "worm", "microbe", "bouquet", "cherry_blossom", "white_flower", "lotus", "rosette", "rose", "wilted_flower", "hibiscus", "sunflower", "blossom", "tulip", "seedling", "potted_plant", "evergreen_tree", "deciduous_tree", "palm_tree", "cactus", "ear_of_rice", "herb", "shamrock", "four_leaf_clover", "maple_leaf", "fallen_leaf", "leaves", "empty_nest", "nest_with_eggs"] }, { id: "foods", emojis: ["grapes", "melon", "watermelon", "tangerine", "lemon", "banana", "pineapple", "mango", "apple", "green_apple", "pear", "peach", "cherries", "strawberry", "blueberries", "kiwifruit", "tomato", "olive", "coconut", "avocado", "eggplant", "potato", "carrot", "corn", "hot_pepper", "bell_pepper", "cucumber", "leafy_green", "broccoli", "garlic", "onion", "mushroom", "peanuts", "beans", "chestnut", "bread", "croissant", "baguette_bread", "flatbread", "pretzel", "bagel", "pancakes", "waffle", "cheese_wedge", "meat_on_bone", "poultry_leg", "cut_of_meat", "bacon", "hamburger", "fries", "pizza", "hotdog", "sandwich", "taco", "burrito", "tamale", "stuffed_flatbread", "falafel", "egg", "fried_egg", "shallow_pan_of_food", "stew", "fondue", "bowl_with_spoon", "green_salad", "popcorn", "butter", "salt", "canned_food", "bento", "rice_cracker", "rice_ball", "rice", "curry", "ramen", "spaghetti", "sweet_potato", "oden", "sushi", "fried_shrimp", "fish_cake", "moon_cake", "dango", "dumpling", "fortune_cookie", "takeout_box", "crab", "lobster", "shrimp", "squid", "oyster", "icecream", "shaved_ice", "ice_cream", "doughnut", "cookie", "birthday", "cake", "cupcake", "pie", "chocolate_bar", "candy", "lollipop", "custard", "honey_pot", "baby_bottle", "glass_of_milk", "coffee", "teapot", "tea", "sake", "champagne", "wine_glass", "cocktail", "tropical_drink", "beer", "beers", "clinking_glasses", "tumbler_glass", "pouring_liquid", "cup_with_straw", "bubble_tea", "beverage_box", "mate_drink", "ice_cube", "chopsticks", "knife_fork_plate", "fork_and_knife", "spoon", "hocho", "jar", "amphora"] }, { id: "activity", emojis: ["jack_o_lantern", "christmas_tree", "fireworks", "sparkler", "firecracker", "sparkles", "balloon", "tada", "confetti_ball", "tanabata_tree", "bamboo", "dolls", "flags", "wind_chime", "rice_scene", "red_envelope", "ribbon", "gift", "reminder_ribbon", "admission_tickets", "ticket", "medal", "trophy", "sports_medal", "first_place_medal", "second_place_medal", "third_place_medal", "soccer", "baseball", "softball", "basketball", "volleyball", "football", "rugby_football", "tennis", "flying_disc", "bowling", "cricket_bat_and_ball", "field_hockey_stick_and_ball", "ice_hockey_stick_and_puck", "lacrosse", "table_tennis_paddle_and_ball", "badminton_racquet_and_shuttlecock", "boxing_glove", "martial_arts_uniform", "goal_net", "golf", "ice_skate", "fishing_pole_and_fish", "diving_mask", "running_shirt_with_sash", "ski", "sled", "curling_stone", "dart", "yo-yo", "kite", "8ball", "crystal_ball", "magic_wand", "nazar_amulet", "hamsa", "video_game", "joystick", "slot_machine", "game_die", "jigsaw", "teddy_bear", "pinata", "mirror_ball", "nesting_dolls", "spades", "hearts", "diamonds", "clubs", "chess_pawn", "black_joker", "mahjong", "flower_playing_cards", "performing_arts", "frame_with_picture", "art", "thread", "sewing_needle", "yarn", "knot"] }, { id: "places", emojis: ["earth_africa", "earth_americas", "earth_asia", "globe_with_meridians", "world_map", "japan", "compass", "snow_capped_mountain", "mountain", "volcano", "mount_fuji", "camping", "beach_with_umbrella", "desert", "desert_island", "national_park", "stadium", "classical_building", "building_construction", "bricks", "rock", "wood", "hut", "house_buildings", "derelict_house_building", "house", "house_with_garden", "office", "post_office", "european_post_office", "hospital", "bank", "hotel", "love_hotel", "convenience_store", "school", "department_store", "factory", "japanese_castle", "european_castle", "wedding", "tokyo_tower", "statue_of_liberty", "church", "mosque", "hindu_temple", "synagogue", "shinto_shrine", "kaaba", "fountain", "tent", "foggy", "night_with_stars", "cityscape", "sunrise_over_mountains", "sunrise", "city_sunset", "city_sunrise", "bridge_at_night", "hotsprings", "carousel_horse", "playground_slide", "ferris_wheel", "roller_coaster", "barber", "circus_tent", "steam_locomotive", "railway_car", "bullettrain_side", "bullettrain_front", "train2", "metro", "light_rail", "station", "tram", "monorail", "mountain_railway", "train", "bus", "oncoming_bus", "trolleybus", "minibus", "ambulance", "fire_engine", "police_car", "oncoming_police_car", "taxi", "oncoming_taxi", "car", "oncoming_automobile", "blue_car", "pickup_truck", "truck", "articulated_lorry", "tractor", "racing_car", "racing_motorcycle", "motor_scooter", "manual_wheelchair", "motorized_wheelchair", "auto_rickshaw", "bike", "scooter", "skateboard", "roller_skate", "busstop", "motorway", "railway_track", "oil_drum", "fuelpump", "wheel", "rotating_light", "traffic_light", "vertical_traffic_light", "octagonal_sign", "construction", "anchor", "ring_buoy", "boat", "canoe", "speedboat", "passenger_ship", "ferry", "motor_boat", "ship", "airplane", "small_airplane", "airplane_departure", "airplane_arriving", "parachute", "seat", "helicopter", "suspension_railway", "mountain_cableway", "aerial_tramway", "satellite", "rocket", "flying_saucer", "bellhop_bell", "luggage", "hourglass", "hourglass_flowing_sand", "watch", "alarm_clock", "stopwatch", "timer_clock", "mantelpiece_clock", "clock12", "clock1230", "clock1", "clock130", "clock2", "clock230", "clock3", "clock330", "clock4", "clock430", "clock5", "clock530", "clock6", "clock630", "clock7", "clock730", "clock8", "clock830", "clock9", "clock930", "clock10", "clock1030", "clock11", "clock1130", "new_moon", "waxing_crescent_moon", "first_quarter_moon", "moon", "full_moon", "waning_gibbous_moon", "last_quarter_moon", "waning_crescent_moon", "crescent_moon", "new_moon_with_face", "first_quarter_moon_with_face", "last_quarter_moon_with_face", "thermometer", "sunny", "full_moon_with_face", "sun_with_face", "ringed_planet", "star", "star2", "stars", "milky_way", "cloud", "partly_sunny", "thunder_cloud_and_rain", "mostly_sunny", "barely_sunny", "partly_sunny_rain", "rain_cloud", "snow_cloud", "lightning", "tornado", "fog", "wind_blowing_face", "cyclone", "rainbow", "closed_umbrella", "umbrella", "umbrella_with_rain_drops", "umbrella_on_ground", "zap", "snowflake", "snowman", "snowman_without_snow", "comet", "fire", "droplet", "ocean"] }, { id: "objects", emojis: ["eyeglasses", "dark_sunglasses", "goggles", "lab_coat", "safety_vest", "necktie", "shirt", "jeans", "scarf", "gloves", "coat", "socks", "dress", "kimono", "sari", "one-piece_swimsuit", "briefs", "shorts", "bikini", "womans_clothes", "purse", "handbag", "pouch", "shopping_bags", "school_satchel", "thong_sandal", "mans_shoe", "athletic_shoe", "hiking_boot", "womans_flat_shoe", "high_heel", "sandal", "ballet_shoes", "boot", "crown", "womans_hat", "tophat", "mortar_board", "billed_cap", "military_helmet", "helmet_with_white_cross", "prayer_beads", "lipstick", "ring", "gem", "mute", "speaker", "sound", "loud_sound", "loudspeaker", "mega", "postal_horn", "bell", "no_bell", "musical_score", "musical_note", "notes", "studio_microphone", "level_slider", "control_knobs", "microphone", "headphones", "radio", "saxophone", "accordion", "guitar", "musical_keyboard", "trumpet", "violin", "banjo", "drum_with_drumsticks", "long_drum", "iphone", "calling", "phone", "telephone_receiver", "pager", "fax", "battery", "low_battery", "electric_plug", "computer", "desktop_computer", "printer", "keyboard", "three_button_mouse", "trackball", "minidisc", "floppy_disk", "cd", "dvd", "abacus", "movie_camera", "film_frames", "film_projector", "clapper", "tv", "camera", "camera_with_flash", "video_camera", "vhs", "mag", "mag_right", "candle", "bulb", "flashlight", "izakaya_lantern", "diya_lamp", "notebook_with_decorative_cover", "closed_book", "book", "green_book", "blue_book", "orange_book", "books", "notebook", "ledger", "page_with_curl", "scroll", "page_facing_up", "newspaper", "rolled_up_newspaper", "bookmark_tabs", "bookmark", "label", "moneybag", "coin", "yen", "dollar", "euro", "pound", "money_with_wings", "credit_card", "receipt", "chart", "email", "e-mail", "incoming_envelope", "envelope_with_arrow", "outbox_tray", "inbox_tray", "package", "mailbox", "mailbox_closed", "mailbox_with_mail", "mailbox_with_no_mail", "postbox", "ballot_box_with_ballot", "pencil2", "black_nib", "lower_left_fountain_pen", "lower_left_ballpoint_pen", "lower_left_paintbrush", "lower_left_crayon", "memo", "briefcase", "file_folder", "open_file_folder", "card_index_dividers", "date", "calendar", "spiral_note_pad", "spiral_calendar_pad", "card_index", "chart_with_upwards_trend", "chart_with_downwards_trend", "bar_chart", "clipboard", "pushpin", "round_pushpin", "paperclip", "linked_paperclips", "straight_ruler", "triangular_ruler", "scissors", "card_file_box", "file_cabinet", "wastebasket", "lock", "unlock", "lock_with_ink_pen", "closed_lock_with_key", "key", "old_key", "hammer", "axe", "pick", "hammer_and_pick", "hammer_and_wrench", "dagger_knife", "crossed_swords", "gun", "boomerang", "bow_and_arrow", "shield", "carpentry_saw", "wrench", "screwdriver", "nut_and_bolt", "gear", "compression", "scales", "probing_cane", "link", "chains", "hook", "toolbox", "magnet", "ladder", "alembic", "test_tube", "petri_dish", "dna", "microscope", "telescope", "satellite_antenna", "syringe", "drop_of_blood", "pill", "adhesive_bandage", "crutch", "stethoscope", "x-ray", "door", "elevator", "mirror", "window", "bed", "couch_and_lamp", "chair", "toilet", "plunger", "shower", "bathtub", "mouse_trap", "razor", "lotion_bottle", "safety_pin", "broom", "basket", "roll_of_paper", "bucket", "soap", "bubbles", "toothbrush", "sponge", "fire_extinguisher", "shopping_trolley", "smoking", "coffin", "headstone", "funeral_urn", "moyai", "placard", "identification_card"] }, { id: "symbols", emojis: ["atm", "put_litter_in_its_place", "potable_water", "wheelchair", "mens", "womens", "restroom", "baby_symbol", "wc", "passport_control", "customs", "baggage_claim", "left_luggage", "warning", "children_crossing", "no_entry", "no_entry_sign", "no_bicycles", "no_smoking", "do_not_litter", "non-potable_water", "no_pedestrians", "no_mobile_phones", "underage", "radioactive_sign", "biohazard_sign", "arrow_up", "arrow_upper_right", "arrow_right", "arrow_lower_right", "arrow_down", "arrow_lower_left", "arrow_left", "arrow_upper_left", "arrow_up_down", "left_right_arrow", "leftwards_arrow_with_hook", "arrow_right_hook", "arrow_heading_up", "arrow_heading_down", "arrows_clockwise", "arrows_counterclockwise", "back", "end", "on", "soon", "top", "place_of_worship", "atom_symbol", "om_symbol", "star_of_david", "wheel_of_dharma", "yin_yang", "latin_cross", "orthodox_cross", "star_and_crescent", "peace_symbol", "menorah_with_nine_branches", "six_pointed_star", "aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpius", "sagittarius", "capricorn", "aquarius", "pisces", "ophiuchus", "twisted_rightwards_arrows", "repeat", "repeat_one", "arrow_forward", "fast_forward", "black_right_pointing_double_triangle_with_vertical_bar", "black_right_pointing_triangle_with_double_vertical_bar", "arrow_backward", "rewind", "black_left_pointing_double_triangle_with_vertical_bar", "arrow_up_small", "arrow_double_up", "arrow_down_small", "arrow_double_down", "double_vertical_bar", "black_square_for_stop", "black_circle_for_record", "eject", "cinema", "low_brightness", "high_brightness", "signal_strength", "vibration_mode", "mobile_phone_off", "female_sign", "male_sign", "transgender_symbol", "heavy_multiplication_x", "heavy_plus_sign", "heavy_minus_sign", "heavy_division_sign", "heavy_equals_sign", "infinity", "bangbang", "interrobang", "question", "grey_question", "grey_exclamation", "exclamation", "wavy_dash", "currency_exchange", "heavy_dollar_sign", "medical_symbol", "recycle", "fleur_de_lis", "trident", "name_badge", "beginner", "o", "white_check_mark", "ballot_box_with_check", "heavy_check_mark", "x", "negative_squared_cross_mark", "curly_loop", "loop", "part_alternation_mark", "eight_spoked_asterisk", "eight_pointed_black_star", "sparkle", "copyright", "registered", "tm", "hash", "keycap_star", "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "keycap_ten", "capital_abcd", "abcd", "1234", "symbols", "abc", "a", "ab", "b", "cl", "cool", "free", "information_source", "id", "m", "new", "ng", "o2", "ok", "parking", "sos", "up", "vs", "koko", "sa", "u6708", "u6709", "u6307", "ideograph_advantage", "u5272", "u7121", "u7981", "accept", "u7533", "u5408", "u7a7a", "congratulations", "secret", "u55b6", "u6e80", "red_circle", "large_orange_circle", "large_yellow_circle", "large_green_circle", "large_blue_circle", "large_purple_circle", "large_brown_circle", "black_circle", "white_circle", "large_red_square", "large_orange_square", "large_yellow_square", "large_green_square", "large_blue_square", "large_purple_square", "large_brown_square", "black_large_square", "white_large_square", "black_medium_square", "white_medium_square", "black_medium_small_square", "white_medium_small_square", "black_small_square", "white_small_square", "large_orange_diamond", "large_blue_diamond", "small_orange_diamond", "small_blue_diamond", "small_red_triangle", "small_red_triangle_down", "diamond_shape_with_a_dot_inside", "radio_button", "white_square_button", "black_square_button"] }, { id: "flags", emojis: ["checkered_flag", "cn", "crossed_flags", "de", "es", "flag-ac", "flag-ad", "flag-ae", "flag-af", "flag-ag", "flag-ai", "flag-al", "flag-am", "flag-ao", "flag-aq", "flag-ar", "flag-as", "flag-at", "flag-au", "flag-aw", "flag-ax", "flag-az", "flag-ba", "flag-bb", "flag-bd", "flag-be", "flag-bf", "flag-bg", "flag-bh", "flag-bi", "flag-bj", "flag-bl", "flag-bm", "flag-bn", "flag-bo", "flag-bq", "flag-br", "flag-bs", "flag-bt", "flag-bv", "flag-bw", "flag-by", "flag-bz", "flag-ca", "flag-cc", "flag-cd", "flag-cf", "flag-cg", "flag-ch", "flag-ci", "flag-ck", "flag-cl", "flag-cm", "flag-co", "flag-cp", "flag-cr", "flag-cu", "flag-cv", "flag-cw", "flag-cx", "flag-cy", "flag-cz", "flag-dg", "flag-dj", "flag-dk", "flag-dm", "flag-do", "flag-dz", "flag-ea", "flag-ec", "flag-ee", "flag-eg", "flag-eh", "flag-england", "flag-er", "flag-et", "flag-eu", "flag-fi", "flag-fj", "flag-fk", "flag-fm", "flag-fo", "flag-ga", "flag-gd", "flag-ge", "flag-gf", "flag-gg", "flag-gh", "flag-gi", "flag-gl", "flag-gm", "flag-gn", "flag-gp", "flag-gq", "flag-gr", "flag-gs", "flag-gt", "flag-gu", "flag-gw", "flag-gy", "flag-hk", "flag-hm", "flag-hn", "flag-hr", "flag-ht", "flag-hu", "flag-ic", "flag-id", "flag-ie", "flag-il", "flag-im", "flag-in", "flag-io", "flag-iq", "flag-ir", "flag-is", "flag-je", "flag-jm", "flag-jo", "flag-ke", "flag-kg", "flag-kh", "flag-ki", "flag-km", "flag-kn", "flag-kp", "flag-kw", "flag-ky", "flag-kz", "flag-la", "flag-lb", "flag-lc", "flag-li", "flag-lk", "flag-lr", "flag-ls", "flag-lt", "flag-lu", "flag-lv", "flag-ly", "flag-ma", "flag-mc", "flag-md", "flag-me", "flag-mf", "flag-mg", "flag-mh", "flag-mk", "flag-ml", "flag-mm", "flag-mn", "flag-mo", "flag-mp", "flag-mq", "flag-mr", "flag-ms", "flag-mt", "flag-mu", "flag-mv", "flag-mw", "flag-mx", "flag-my", "flag-mz", "flag-na", "flag-nc", "flag-ne", "flag-nf", "flag-ng", "flag-ni", "flag-nl", "flag-no", "flag-np", "flag-nr", "flag-nu", "flag-nz", "flag-om", "flag-pa", "flag-pe", "flag-pf", "flag-pg", "flag-ph", "flag-pk", "flag-pl", "flag-pm", "flag-pn", "flag-pr", "flag-ps", "flag-pt", "flag-pw", "flag-py", "flag-qa", "flag-re", "flag-ro", "flag-rs", "flag-rw", "flag-sa", "flag-sb", "flag-sc", "flag-scotland", "flag-sd", "flag-se", "flag-sg", "flag-sh", "flag-si", "flag-sj", "flag-sk", "flag-sl", "flag-sm", "flag-sn", "flag-so", "flag-sr", "flag-ss", "flag-st", "flag-sv", "flag-sx", "flag-sy", "flag-sz", "flag-ta", "flag-tc", "flag-td", "flag-tf", "flag-tg", "flag-th", "flag-tj", "flag-tk", "flag-tl", "flag-tm", "flag-tn", "flag-to", "flag-tr", "flag-tt", "flag-tv", "flag-tw", "flag-tz", "flag-ua", "flag-ug", "flag-um", "flag-un", "flag-uy", "flag-uz", "flag-va", "flag-vc", "flag-ve", "flag-vg", "flag-vi", "flag-vn", "flag-vu", "flag-wales", "flag-wf", "flag-ws", "flag-xk", "flag-ye", "flag-yt", "flag-za", "flag-zm", "flag-zw", "fr", "gb", "it", "jp", "kr", "pirate_flag", "rainbow-flag", "ru", "transgender_flag", "triangular_flag_on_post", "us", "waving_black_flag", "waving_white_flag"] }], emojis: { "100": { id: "100", name: "Hundred Points", keywords: ["100", "score", "perfect", "numbers", "century", "exam", "quiz", "test", "pass"], skins: [{ unified: "1f4af", native: "\u{1F4AF}" }], version: 1 }, "1234": { id: "1234", name: "Input Numbers", keywords: ["1234", "blue", "square"], skins: [{ unified: "1f522", native: "\u{1F522}" }], version: 1 }, grinning: { id: "grinning", name: "Grinning Face", emoticons: [":D"], keywords: ["smile", "happy", "joy", ":D", "grin"], skins: [{ unified: "1f600", native: "\u{1F600}" }], version: 1 }, smiley: { id: "smiley", name: "Grinning Face with Big Eyes", emoticons: [":)", "=)", "=-)"], keywords: ["smiley", "happy", "joy", "haha", ":D", ":)", "smile", "funny"], skins: [{ unified: "1f603", native: "\u{1F603}" }], version: 1 }, smile: { id: "smile", name: "Grinning Face with Smiling Eyes", emoticons: [":)", "C:", "c:", ":D", ":-D"], keywords: ["smile", "happy", "joy", "funny", "haha", "laugh", "like", ":D", ":)"], skins: [{ unified: "1f604", native: "\u{1F604}" }], version: 1 }, grin: { id: "grin", name: "Beaming Face with Smiling Eyes", keywords: ["grin", "happy", "smile", "joy", "kawaii"], skins: [{ unified: "1f601", native: "\u{1F601}" }], version: 1 }, laughing: { id: "laughing", name: "Grinning Squinting Face", emoticons: [":>", ":->"], keywords: ["laughing", "satisfied", "happy", "joy", "lol", "haha", "glad", "XD", "laugh"], skins: [{ unified: "1f606", native: "\u{1F606}" }], version: 1 }, sweat_smile: { id: "sweat_smile", name: "Grinning Face with Sweat", keywords: ["smile", "hot", "happy", "laugh", "relief"], skins: [{ unified: "1f605", native: "\u{1F605}" }], version: 1 }, rolling_on_the_floor_laughing: { id: "rolling_on_the_floor_laughing", name: "Rolling on the Floor Laughing", keywords: ["face", "lol", "haha", "rofl"], skins: [{ unified: "1f923", native: "\u{1F923}" }], version: 3 }, joy: { id: "joy", name: "Face with Tears of Joy", keywords: ["cry", "weep", "happy", "happytears", "haha"], skins: [{ unified: "1f602", native: "\u{1F602}" }], version: 1 }, slightly_smiling_face: { id: "slightly_smiling_face", name: "Slightly Smiling Face", emoticons: [":)", "(:", ":-)"], keywords: ["smile"], skins: [{ unified: "1f642", native: "\u{1F642}" }], version: 1 }, upside_down_face: { id: "upside_down_face", name: "Upside-Down Face", keywords: ["upside", "down", "flipped", "silly", "smile"], skins: [{ unified: "1f643", native: "\u{1F643}" }], version: 1 }, melting_face: { id: "melting_face", name: "Melting Face", keywords: ["hot", "heat"], skins: [{ unified: "1fae0", native: "\u{1FAE0}" }], version: 14 }, wink: { id: "wink", name: "Winking Face", emoticons: [";)", ";-)"], keywords: ["wink", "happy", "mischievous", "secret", ";)", "smile", "eye"], skins: [{ unified: "1f609", native: "\u{1F609}" }], version: 1 }, blush: { id: "blush", name: "Smiling Face with Smiling Eyes", emoticons: [":)"], keywords: ["blush", "smile", "happy", "flushed", "crush", "embarrassed", "shy", "joy"], skins: [{ unified: "1f60a", native: "\u{1F60A}" }], version: 1 }, innocent: { id: "innocent", name: "Smiling Face with Halo", keywords: ["innocent", "angel", "heaven"], skins: [{ unified: "1f607", native: "\u{1F607}" }], version: 1 }, smiling_face_with_3_hearts: { id: "smiling_face_with_3_hearts", name: "Smiling Face with Hearts", keywords: ["3", "love", "like", "affection", "valentines", "infatuation", "crush", "adore"], skins: [{ unified: "1f970", native: "\u{1F970}" }], version: 11 }, heart_eyes: { id: "heart_eyes", name: "Smiling Face with Heart-Eyes", keywords: ["heart", "eyes", "love", "like", "affection", "valentines", "infatuation", "crush"], skins: [{ unified: "1f60d", native: "\u{1F60D}" }], version: 1 }, "star-struck": { id: "star-struck", name: "Star-Struck", keywords: ["star", "struck", "grinning", "face", "with", "eyes", "smile", "starry"], skins: [{ unified: "1f929", native: "\u{1F929}" }], version: 5 }, kissing_heart: { id: "kissing_heart", name: "Face Blowing a Kiss", emoticons: [":*", ":-*"], keywords: ["kissing", "heart", "love", "like", "affection", "valentines", "infatuation"], skins: [{ unified: "1f618", native: "\u{1F618}" }], version: 1 }, kissing: { id: "kissing", name: "Kissing Face", keywords: ["love", "like", "3", "valentines", "infatuation", "kiss"], skins: [{ unified: "1f617", native: "\u{1F617}" }], version: 1 }, relaxed: { id: "relaxed", name: "Smiling Face", keywords: ["relaxed", "blush", "massage", "happiness"], skins: [{ unified: "263a-fe0f", native: "\u263A\uFE0F" }], version: 1 }, kissing_closed_eyes: { id: "kissing_closed_eyes", name: "Kissing Face with Closed Eyes", keywords: ["love", "like", "affection", "valentines", "infatuation", "kiss"], skins: [{ unified: "1f61a", native: "\u{1F61A}" }], version: 1 }, kissing_smiling_eyes: { id: "kissing_smiling_eyes", name: "Kissing Face with Smiling Eyes", keywords: ["affection", "valentines", "infatuation", "kiss"], skins: [{ unified: "1f619", native: "\u{1F619}" }], version: 1 }, smiling_face_with_tear: { id: "smiling_face_with_tear", name: "Smiling Face with Tear", keywords: ["sad", "cry", "pretend"], skins: [{ unified: "1f972", native: "\u{1F972}" }], version: 13 }, yum: { id: "yum", name: "Face Savoring Food", keywords: ["yum", "happy", "joy", "tongue", "smile", "silly", "yummy", "nom", "delicious", "savouring"], skins: [{ unified: "1f60b", native: "\u{1F60B}" }], version: 1 }, stuck_out_tongue: { id: "stuck_out_tongue", name: "Face with Tongue", emoticons: [":p", ":-p", ":P", ":-P", ":b", ":-b"], keywords: ["stuck", "out", "prank", "childish", "playful", "mischievous", "smile"], skins: [{ unified: "1f61b", native: "\u{1F61B}" }], version: 1 }, stuck_out_tongue_winking_eye: { id: "stuck_out_tongue_winking_eye", name: "Winking Face with Tongue", emoticons: [";p", ";-p", ";b", ";-b", ";P", ";-P"], keywords: ["stuck", "out", "eye", "prank", "childish", "playful", "mischievous", "smile", "wink"], skins: [{ unified: "1f61c", native: "\u{1F61C}" }], version: 1 }, zany_face: { id: "zany_face", name: "Zany Face", keywords: ["grinning", "with", "one", "large", "and", "small", "eye", "goofy", "crazy"], skins: [{ unified: "1f92a", native: "\u{1F92A}" }], version: 5 }, stuck_out_tongue_closed_eyes: { id: "stuck_out_tongue_closed_eyes", name: "Squinting Face with Tongue", keywords: ["stuck", "out", "closed", "eyes", "prank", "playful", "mischievous", "smile"], skins: [{ unified: "1f61d", native: "\u{1F61D}" }], version: 1 }, money_mouth_face: { id: "money_mouth_face", name: "Money-Mouth Face", keywords: ["money", "mouth", "rich", "dollar"], skins: [{ unified: "1f911", native: "\u{1F911}" }], version: 1 }, hugging_face: { id: "hugging_face", name: "Hugging Face", keywords: ["smile", "hug"], skins: [{ unified: "1f917", native: "\u{1F917}" }], version: 1 }, face_with_hand_over_mouth: { id: "face_with_hand_over_mouth", name: "Face with Hand over Mouth", keywords: ["smiling", "eyes", "and", "covering", "whoops", "shock", "surprise"], skins: [{ unified: "1f92d", native: "\u{1F92D}" }], version: 5 }, face_with_open_eyes_and_hand_over_mouth: { id: "face_with_open_eyes_and_hand_over_mouth", name: "Face with Open Eyes and Hand over Mouth", keywords: ["silence", "secret", "shock", "surprise"], skins: [{ unified: "1fae2", native: "\u{1FAE2}" }], version: 14 }, face_with_peeking_eye: { id: "face_with_peeking_eye", name: "Face with Peeking Eye", keywords: ["scared", "frightening", "embarrassing"], skins: [{ unified: "1fae3", native: "\u{1FAE3}" }], version: 14 }, shushing_face: { id: "shushing_face", name: "Shushing Face", keywords: ["with", "finger", "covering", "closed", "lips", "quiet", "shhh"], skins: [{ unified: "1f92b", native: "\u{1F92B}" }], version: 5 }, thinking_face: { id: "thinking_face", name: "Thinking Face", keywords: ["hmmm", "think", "consider"], skins: [{ unified: "1f914", native: "\u{1F914}" }], version: 1 }, saluting_face: { id: "saluting_face", name: "Saluting Face", keywords: ["respect", "salute"], skins: [{ unified: "1fae1", native: "\u{1FAE1}" }], version: 14 }, zipper_mouth_face: { id: "zipper_mouth_face", name: "Zipper-Mouth Face", keywords: ["zipper", "mouth", "sealed", "secret"], skins: [{ unified: "1f910", native: "\u{1F910}" }], version: 1 }, face_with_raised_eyebrow: { id: "face_with_raised_eyebrow", name: "Face with Raised Eyebrow", keywords: ["one", "distrust", "scepticism", "disapproval", "disbelief", "surprise"], skins: [{ unified: "1f928", native: "\u{1F928}" }], version: 5 }, neutral_face: { id: "neutral_face", name: "Neutral Face", emoticons: [":|", ":-|"], keywords: ["indifference", "meh", ":", ""], skins: [{ unified: "1f610", native: "\u{1F610}" }], version: 1 }, expressionless: { id: "expressionless", name: "Expressionless Face", emoticons: ["-_-"], keywords: ["indifferent", "-", "", "meh", "deadpan"], skins: [{ unified: "1f611", native: "\u{1F611}" }], version: 1 }, no_mouth: { id: "no_mouth", name: "Face Without Mouth", keywords: ["no", "hellokitty"], skins: [{ unified: "1f636", native: "\u{1F636}" }], version: 1 }, dotted_line_face: { id: "dotted_line_face", name: "Dotted Line Face", keywords: ["invisible", "lonely", "isolation", "depression"], skins: [{ unified: "1fae5", native: "\u{1FAE5}" }], version: 14 }, face_in_clouds: { id: "face_in_clouds", name: "Face in Clouds", keywords: ["shower", "steam", "dream"], skins: [{ unified: "1f636-200d-1f32b-fe0f", native: "\u{1F636}\u200D\u{1F32B}\uFE0F" }], version: 13.1 }, smirk: { id: "smirk", name: "Smirking Face", keywords: ["smirk", "smile", "mean", "prank", "smug", "sarcasm"], skins: [{ unified: "1f60f", native: "\u{1F60F}" }], version: 1 }, unamused: { id: "unamused", name: "Unamused Face", emoticons: [":("], keywords: ["indifference", "bored", "straight", "serious", "sarcasm", "unimpressed", "skeptical", "dubious", "side", "eye"], skins: [{ unified: "1f612", native: "\u{1F612}" }], version: 1 }, face_with_rolling_eyes: { id: "face_with_rolling_eyes", name: "Face with Rolling Eyes", keywords: ["eyeroll", "frustrated"], skins: [{ unified: "1f644", native: "\u{1F644}" }], version: 1 }, grimacing: { id: "grimacing", name: "Grimacing Face", keywords: ["grimace", "teeth"], skins: [{ unified: "1f62c", native: "\u{1F62C}" }], version: 1 }, face_exhaling: { id: "face_exhaling", name: "Face Exhaling", keywords: ["relieve", "relief", "tired", "sigh"], skins: [{ unified: "1f62e-200d-1f4a8", native: "\u{1F62E}\u200D\u{1F4A8}" }], version: 13.1 }, lying_face: { id: "lying_face", name: "Lying Face", keywords: ["lie", "pinocchio"], skins: [{ unified: "1f925", native: "\u{1F925}" }], version: 3 }, relieved: { id: "relieved", name: "Relieved Face", keywords: ["relaxed", "phew", "massage", "happiness"], skins: [{ unified: "1f60c", native: "\u{1F60C}" }], version: 1 }, pensive: { id: "pensive", name: "Pensive Face", keywords: ["sad", "depressed", "upset"], skins: [{ unified: "1f614", native: "\u{1F614}" }], version: 1 }, sleepy: { id: "sleepy", name: "Sleepy Face", keywords: ["tired", "rest", "nap"], skins: [{ unified: "1f62a", native: "\u{1F62A}" }], version: 1 }, drooling_face: { id: "drooling_face", name: "Drooling Face", keywords: [], skins: [{ unified: "1f924", native: "\u{1F924}" }], version: 3 }, sleeping: { id: "sleeping", name: "Sleeping Face", keywords: ["tired", "sleepy", "night", "zzz"], skins: [{ unified: "1f634", native: "\u{1F634}" }], version: 1 }, mask: { id: "mask", name: "Face with Medical Mask", keywords: ["sick", "ill", "disease"], skins: [{ unified: "1f637", native: "\u{1F637}" }], version: 1 }, face_with_thermometer: { id: "face_with_thermometer", name: "Face with Thermometer", keywords: ["sick", "temperature", "cold", "fever"], skins: [{ unified: "1f912", native: "\u{1F912}" }], version: 1 }, face_with_head_bandage: { id: "face_with_head_bandage", name: "Face with Head-Bandage", keywords: ["head", "bandage", "injured", "clumsy", "hurt"], skins: [{ unified: "1f915", native: "\u{1F915}" }], version: 1 }, nauseated_face: { id: "nauseated_face", name: "Nauseated Face", keywords: ["vomit", "gross", "green", "sick", "throw", "up", "ill"], skins: [{ unified: "1f922", native: "\u{1F922}" }], version: 3 }, face_vomiting: { id: "face_vomiting", name: "Face Vomiting", keywords: ["with", "open", "mouth", "sick"], skins: [{ unified: "1f92e", native: "\u{1F92E}" }], version: 5 }, sneezing_face: { id: "sneezing_face", name: "Sneezing Face", keywords: ["gesundheit", "sneeze", "sick", "allergy"], skins: [{ unified: "1f927", native: "\u{1F927}" }], version: 3 }, hot_face: { id: "hot_face", name: "Hot Face", keywords: ["feverish", "heat", "red", "sweating"], skins: [{ unified: "1f975", native: "\u{1F975}" }], version: 11 }, cold_face: { id: "cold_face", name: "Cold Face", keywords: ["blue", "freezing", "frozen", "frostbite", "icicles"], skins: [{ unified: "1f976", native: "\u{1F976}" }], version: 11 }, woozy_face: { id: "woozy_face", name: "Woozy Face", keywords: ["dizzy", "intoxicated", "tipsy", "wavy"], skins: [{ unified: "1f974", native: "\u{1F974}" }], version: 11 }, dizzy_face: { id: "dizzy_face", name: "Dizzy Face", keywords: ["spent", "unconscious", "xox"], skins: [{ unified: "1f635", native: "\u{1F635}" }], version: 1 }, face_with_spiral_eyes: { id: "face_with_spiral_eyes", name: "Face with Spiral Eyes", keywords: ["sick", "ill", "confused", "nauseous", "nausea"], skins: [{ unified: "1f635-200d-1f4ab", native: "\u{1F635}\u200D\u{1F4AB}" }], version: 13.1 }, exploding_head: { id: "exploding_head", name: "Exploding Head", keywords: ["shocked", "face", "with", "mind", "blown"], skins: [{ unified: "1f92f", native: "\u{1F92F}" }], version: 5 }, face_with_cowboy_hat: { id: "face_with_cowboy_hat", name: "Cowboy Hat Face", keywords: ["with", "cowgirl"], skins: [{ unified: "1f920", native: "\u{1F920}" }], version: 3 }, partying_face: { id: "partying_face", name: "Partying Face", keywords: ["celebration", "woohoo"], skins: [{ unified: "1f973", native: "\u{1F973}" }], version: 11 }, disguised_face: { id: "disguised_face", name: "Disguised Face", keywords: ["pretent", "brows", "glasses", "moustache"], skins: [{ unified: "1f978", native: "\u{1F978}" }], version: 13 }, sunglasses: { id: "sunglasses", name: "Smiling Face with Sunglasses", emoticons: ["8)"], keywords: ["cool", "smile", "summer", "beach", "sunglass"], skins: [{ unified: "1f60e", native: "\u{1F60E}" }], version: 1 }, nerd_face: { id: "nerd_face", name: "Nerd Face", keywords: ["nerdy", "geek", "dork"], skins: [{ unified: "1f913", native: "\u{1F913}" }], version: 1 }, face_with_monocle: { id: "face_with_monocle", name: "Face with Monocle", keywords: ["stuffy", "wealthy"], skins: [{ unified: "1f9d0", native: "\u{1F9D0}" }], version: 5 }, confused: { id: "confused", name: "Confused Face", emoticons: [":\\", ":-\\", ":/", ":-/"], keywords: ["indifference", "huh", "weird", "hmmm", ":/"], skins: [{ unified: "1f615", native: "\u{1F615}" }], version: 1 }, face_with_diagonal_mouth: { id: "face_with_diagonal_mouth", name: "Face with Diagonal Mouth", keywords: ["skeptic", "confuse", "frustrated", "indifferent"], skins: [{ unified: "1fae4", native: "\u{1FAE4}" }], version: 14 }, worried: { id: "worried", name: "Worried Face", keywords: ["concern", "nervous", ":("], skins: [{ unified: "1f61f", native: "\u{1F61F}" }], version: 1 }, slightly_frowning_face: { id: "slightly_frowning_face", name: "Slightly Frowning Face", keywords: ["disappointed", "sad", "upset"], skins: [{ unified: "1f641", native: "\u{1F641}" }], version: 1 }, white_frowning_face: { id: "white_frowning_face", name: "Frowning Face", keywords: ["white", "sad", "upset", "frown"], skins: [{ unified: "2639-fe0f", native: "\u2639\uFE0F" }], version: 1 }, open_mouth: { id: "open_mouth", name: "Face with Open Mouth", emoticons: [":o", ":-o", ":O", ":-O"], keywords: ["surprise", "impressed", "wow", "whoa", ":O"], skins: [{ unified: "1f62e", native: "\u{1F62E}" }], version: 1 }, hushed: { id: "hushed", name: "Hushed Face", keywords: ["woo", "shh"], skins: [{ unified: "1f62f", native: "\u{1F62F}" }], version: 1 }, astonished: { id: "astonished", name: "Astonished Face", keywords: ["xox", "surprised", "poisoned"], skins: [{ unified: "1f632", native: "\u{1F632}" }], version: 1 }, flushed: { id: "flushed", name: "Flushed Face", keywords: ["blush", "shy", "flattered"], skins: [{ unified: "1f633", native: "\u{1F633}" }], version: 1 }, pleading_face: { id: "pleading_face", name: "Pleading Face", keywords: ["begging", "mercy"], skins: [{ unified: "1f97a", native: "\u{1F97A}" }], version: 11 }, face_holding_back_tears: { id: "face_holding_back_tears", name: "Face Holding Back Tears", keywords: ["touched", "gratitude"], skins: [{ unified: "1f979", native: "\u{1F979}" }], version: 14 }, frowning: { id: "frowning", name: "Frowning Face with Open Mouth", keywords: ["aw", "what"], skins: [{ unified: "1f626", native: "\u{1F626}" }], version: 1 }, anguished: { id: "anguished", name: "Anguished Face", emoticons: ["D:"], keywords: ["stunned", "nervous"], skins: [{ unified: "1f627", native: "\u{1F627}" }], version: 1 }, fearful: { id: "fearful", name: "Fearful Face", keywords: ["scared", "terrified", "nervous", "oops", "huh"], skins: [{ unified: "1f628", native: "\u{1F628}" }], version: 1 }, cold_sweat: { id: "cold_sweat", name: "Anxious Face with Sweat", keywords: ["cold", "nervous"], skins: [{ unified: "1f630", native: "\u{1F630}" }], version: 1 }, disappointed_relieved: { id: "disappointed_relieved", name: "Sad but Relieved Face", keywords: ["disappointed", "phew", "sweat", "nervous"], skins: [{ unified: "1f625", native: "\u{1F625}" }], version: 1 }, cry: { id: "cry", name: "Crying Face", emoticons: [":'("], keywords: ["cry", "tears", "sad", "depressed", "upset", ":'("], skins: [{ unified: "1f622", native: "\u{1F622}" }], version: 1 }, sob: { id: "sob", name: "Loudly Crying Face", emoticons: [":'("], keywords: ["sob", "cry", "tears", "sad", "upset", "depressed"], skins: [{ unified: "1f62d", native: "\u{1F62D}" }], version: 1 }, scream: { id: "scream", name: "Face Screaming in Fear", keywords: ["scream", "munch", "scared", "omg"], skins: [{ unified: "1f631", native: "\u{1F631}" }], version: 1 }, confounded: { id: "confounded", name: "Confounded Face", keywords: ["confused", "sick", "unwell", "oops", ":S"], skins: [{ unified: "1f616", native: "\u{1F616}" }], version: 1 }, persevere: { id: "persevere", name: "Persevering Face", keywords: ["persevere", "sick", "no", "upset", "oops"], skins: [{ unified: "1f623", native: "\u{1F623}" }], version: 1 }, disappointed: { id: "disappointed", name: "Disappointed Face", emoticons: ["):", ":(", ":-("], keywords: ["sad", "upset", "depressed", ":("], skins: [{ unified: "1f61e", native: "\u{1F61E}" }], version: 1 }, sweat: { id: "sweat", name: "Face with Cold Sweat", keywords: ["downcast", "hot", "sad", "tired", "exercise"], skins: [{ unified: "1f613", native: "\u{1F613}" }], version: 1 }, weary: { id: "weary", name: "Weary Face", keywords: ["tired", "sleepy", "sad", "frustrated", "upset"], skins: [{ unified: "1f629", native: "\u{1F629}" }], version: 1 }, tired_face: { id: "tired_face", name: "Tired Face", keywords: ["sick", "whine", "upset", "frustrated"], skins: [{ unified: "1f62b", native: "\u{1F62B}" }], version: 1 }, yawning_face: { id: "yawning_face", name: "Yawning Face", keywords: ["tired", "sleepy"], skins: [{ unified: "1f971", native: "\u{1F971}" }], version: 12 }, triumph: { id: "triumph", name: "Face with Look of Triumph", keywords: ["steam", "from", "nose", "gas", "phew", "proud", "pride"], skins: [{ unified: "1f624", native: "\u{1F624}" }], version: 1 }, rage: { id: "rage", name: "Pouting Face", keywords: ["rage", "angry", "mad", "hate", "despise"], skins: [{ unified: "1f621", native: "\u{1F621}" }], version: 1 }, angry: { id: "angry", name: "Angry Face", emoticons: [">:(", ">:-("], keywords: ["mad", "annoyed", "frustrated"], skins: [{ unified: "1f620", native: "\u{1F620}" }], version: 1 }, face_with_symbols_on_mouth: { id: "face_with_symbols_on_mouth", name: "Face with Symbols on Mouth", keywords: ["serious", "covering", "swearing", "cursing", "cussing", "profanity", "expletive"], skins: [{ unified: "1f92c", native: "\u{1F92C}" }], version: 5 }, smiling_imp: { id: "smiling_imp", name: "Smiling Face with Horns", keywords: ["imp", "devil"], skins: [{ unified: "1f608", native: "\u{1F608}" }], version: 1 }, imp: { id: "imp", name: "Imp", keywords: ["angry", "face", "with", "horns", "devil"], skins: [{ unified: "1f47f", native: "\u{1F47F}" }], version: 1 }, skull: { id: "skull", name: "Skull", keywords: ["dead", "skeleton", "creepy", "death"], skins: [{ unified: "1f480", native: "\u{1F480}" }], version: 1 }, skull_and_crossbones: { id: "skull_and_crossbones", name: "Skull and Crossbones", keywords: ["poison", "danger", "deadly", "scary", "death", "pirate", "evil"], skins: [{ unified: "2620-fe0f", native: "\u2620\uFE0F" }], version: 1 }, hankey: { id: "hankey", name: "Pile of Poo", keywords: ["hankey", "poop", "shit", "shitface", "fail", "turd"], skins: [{ unified: "1f4a9", native: "\u{1F4A9}" }], version: 1 }, clown_face: { id: "clown_face", name: "Clown Face", keywords: [], skins: [{ unified: "1f921", native: "\u{1F921}" }], version: 3 }, japanese_ogre: { id: "japanese_ogre", name: "Ogre", keywords: ["japanese", "monster", "red", "mask", "halloween", "scary", "creepy", "devil", "demon"], skins: [{ unified: "1f479", native: "\u{1F479}" }], version: 1 }, japanese_goblin: { id: "japanese_goblin", name: "Goblin", keywords: ["japanese", "red", "evil", "mask", "monster", "scary", "creepy"], skins: [{ unified: "1f47a", native: "\u{1F47A}" }], version: 1 }, ghost: { id: "ghost", name: "Ghost", keywords: ["halloween", "spooky", "scary"], skins: [{ unified: "1f47b", native: "\u{1F47B}" }], version: 1 }, alien: { id: "alien", name: "Alien", keywords: ["UFO", "paul", "weird", "outer", "space"], skins: [{ unified: "1f47d", native: "\u{1F47D}" }], version: 1 }, space_invader: { id: "space_invader", name: "Alien Monster", keywords: ["space", "invader", "game", "arcade", "play"], skins: [{ unified: "1f47e", native: "\u{1F47E}" }], version: 1 }, robot_face: { id: "robot_face", name: "Robot", keywords: ["face", "computer", "machine", "bot"], skins: [{ unified: "1f916", native: "\u{1F916}" }], version: 1 }, smiley_cat: { id: "smiley_cat", name: "Grinning Cat", keywords: ["smiley", "animal", "cats", "happy", "smile"], skins: [{ unified: "1f63a", native: "\u{1F63A}" }], version: 1 }, smile_cat: { id: "smile_cat", name: "Grinning Cat with Smiling Eyes", keywords: ["smile", "animal", "cats"], skins: [{ unified: "1f638", native: "\u{1F638}" }], version: 1 }, joy_cat: { id: "joy_cat", name: "Cat with Tears of Joy", keywords: ["animal", "cats", "haha", "happy"], skins: [{ unified: "1f639", native: "\u{1F639}" }], version: 1 }, heart_eyes_cat: { id: "heart_eyes_cat", name: "Smiling Cat with Heart-Eyes", keywords: ["heart", "eyes", "animal", "love", "like", "affection", "cats", "valentines"], skins: [{ unified: "1f63b", native: "\u{1F63B}" }], version: 1 }, smirk_cat: { id: "smirk_cat", name: "Cat with Wry Smile", keywords: ["smirk", "animal", "cats"], skins: [{ unified: "1f63c", native: "\u{1F63C}" }], version: 1 }, kissing_cat: { id: "kissing_cat", name: "Kissing Cat", keywords: ["animal", "cats", "kiss"], skins: [{ unified: "1f63d", native: "\u{1F63D}" }], version: 1 }, scream_cat: { id: "scream_cat", name: "Weary Cat", keywords: ["scream", "animal", "cats", "munch", "scared"], skins: [{ unified: "1f640", native: "\u{1F640}" }], version: 1 }, crying_cat_face: { id: "crying_cat_face", name: "Crying Cat", keywords: ["face", "animal", "tears", "weep", "sad", "cats", "upset", "cry"], skins: [{ unified: "1f63f", native: "\u{1F63F}" }], version: 1 }, pouting_cat: { id: "pouting_cat", name: "Pouting Cat", keywords: ["animal", "cats"], skins: [{ unified: "1f63e", native: "\u{1F63E}" }], version: 1 }, see_no_evil: { id: "see_no_evil", name: "See-No-Evil Monkey", keywords: ["see", "no", "evil", "animal", "nature", "haha"], skins: [{ unified: "1f648", native: "\u{1F648}" }], version: 1 }, hear_no_evil: { id: "hear_no_evil", name: "Hear-No-Evil Monkey", keywords: ["hear", "no", "evil", "animal", "nature"], skins: [{ unified: "1f649", native: "\u{1F649}" }], version: 1 }, speak_no_evil: { id: "speak_no_evil", name: "Speak-No-Evil Monkey", keywords: ["speak", "no", "evil", "animal", "nature", "omg"], skins: [{ unified: "1f64a", native: "\u{1F64A}" }], version: 1 }, kiss: { id: "kiss", name: "Kiss Mark", keywords: ["face", "lips", "love", "like", "affection", "valentines"], skins: [{ unified: "1f48b", native: "\u{1F48B}" }], version: 1 }, love_letter: { id: "love_letter", name: "Love Letter", keywords: ["email", "like", "affection", "envelope", "valentines"], skins: [{ unified: "1f48c", native: "\u{1F48C}" }], version: 1 }, cupid: { id: "cupid", name: "Heart with Arrow", keywords: ["cupid", "love", "like", "affection", "valentines"], skins: [{ unified: "1f498", native: "\u{1F498}" }], version: 1 }, gift_heart: { id: "gift_heart", name: "Heart with Ribbon", keywords: ["gift", "love", "valentines"], skins: [{ unified: "1f49d", native: "\u{1F49D}" }], version: 1 }, sparkling_heart: { id: "sparkling_heart", name: "Sparkling Heart", keywords: ["love", "like", "affection", "valentines"], skins: [{ unified: "1f496", native: "\u{1F496}" }], version: 1 }, heartpulse: { id: "heartpulse", name: "Growing Heart", keywords: ["heartpulse", "like", "love", "affection", "valentines", "pink"], skins: [{ unified: "1f497", native: "\u{1F497}" }], version: 1 }, heartbeat: { id: "heartbeat", name: "Beating Heart", keywords: ["heartbeat", "love", "like", "affection", "valentines", "pink"], skins: [{ unified: "1f493", native: "\u{1F493}" }], version: 1 }, revolving_hearts: { id: "revolving_hearts", name: "Revolving Hearts", keywords: ["love", "like", "affection", "valentines"], skins: [{ unified: "1f49e", native: "\u{1F49E}" }], version: 1 }, two_hearts: { id: "two_hearts", name: "Two Hearts", keywords: ["love", "like", "affection", "valentines", "heart"], skins: [{ unified: "1f495", native: "\u{1F495}" }], version: 1 }, heart_decoration: { id: "heart_decoration", name: "Heart Decoration", keywords: ["purple", "square", "love", "like"], skins: [{ unified: "1f49f", native: "\u{1F49F}" }], version: 1 }, heavy_heart_exclamation_mark_ornament: { id: "heavy_heart_exclamation_mark_ornament", name: "Heart Exclamation", keywords: ["heavy", "mark", "ornament", "decoration", "love"], skins: [{ unified: "2763-fe0f", native: "\u2763\uFE0F" }], version: 1 }, broken_heart: { id: "broken_heart", name: "Broken Heart", emoticons: ["</3"], keywords: ["sad", "sorry", "break", "heartbreak"], skins: [{ unified: "1f494", native: "\u{1F494}" }], version: 1 }, heart_on_fire: { id: "heart_on_fire", name: "Heart on Fire", keywords: ["passionate", "enthusiastic"], skins: [{ unified: "2764-fe0f-200d-1f525", native: "\u2764\uFE0F\u200D\u{1F525}" }], version: 13.1 }, mending_heart: { id: "mending_heart", name: "Mending Heart", keywords: ["broken", "bandage", "wounded"], skins: [{ unified: "2764-fe0f-200d-1fa79", native: "\u2764\uFE0F\u200D\u{1FA79}" }], version: 13.1 }, heart: { id: "heart", name: "Red Heart", emoticons: ["<3"], keywords: ["love", "like", "valentines"], skins: [{ unified: "2764-fe0f", native: "\u2764\uFE0F" }], version: 1 }, orange_heart: { id: "orange_heart", name: "Orange Heart", keywords: ["love", "like", "affection", "valentines"], skins: [{ unified: "1f9e1", native: "\u{1F9E1}" }], version: 5 }, yellow_heart: { id: "yellow_heart", name: "Yellow Heart", emoticons: ["<3"], keywords: ["love", "like", "affection", "valentines"], skins: [{ unified: "1f49b", native: "\u{1F49B}" }], version: 1 }, green_heart: { id: "green_heart", name: "Green Heart", emoticons: ["<3"], keywords: ["love", "like", "affection", "valentines"], skins: [{ unified: "1f49a", native: "\u{1F49A}" }], version: 1 }, blue_heart: { id: "blue_heart", name: "Blue Heart", emoticons: ["<3"], keywords: ["love", "like", "affection", "valentines"], skins: [{ unified: "1f499", native: "\u{1F499}" }], version: 1 }, purple_heart: { id: "purple_heart", name: "Purple Heart", emoticons: ["<3"], keywords: ["love", "like", "affection", "valentines"], skins: [{ unified: "1f49c", native: "\u{1F49C}" }], version: 1 }, brown_heart: { id: "brown_heart", name: "Brown Heart", keywords: ["coffee"], skins: [{ unified: "1f90e", native: "\u{1F90E}" }], version: 12 }, black_heart: { id: "black_heart", name: "Black Heart", keywords: ["evil"], skins: [{ unified: "1f5a4", native: "\u{1F5A4}" }], version: 3 }, white_heart: { id: "white_heart", name: "White Heart", keywords: ["pure"], skins: [{ unified: "1f90d", native: "\u{1F90D}" }], version: 12 }, anger: { id: "anger", name: "Anger Symbol", keywords: ["angry", "mad"], skins: [{ unified: "1f4a2", native: "\u{1F4A2}" }], version: 1 }, boom: { id: "boom", name: "Collision", keywords: ["boom", "bomb", "explode", "explosion", "blown"], skins: [{ unified: "1f4a5", native: "\u{1F4A5}" }], version: 1 }, dizzy: { id: "dizzy", name: "Dizzy", keywords: ["star", "sparkle", "shoot", "magic"], skins: [{ unified: "1f4ab", native: "\u{1F4AB}" }], version: 1 }, sweat_drops: { id: "sweat_drops", name: "Sweat Droplets", keywords: ["drops", "water", "drip", "oops"], skins: [{ unified: "1f4a6", native: "\u{1F4A6}" }], version: 1 }, dash: { id: "dash", name: "Dash Symbol", keywords: ["dashing", "away", "wind", "air", "fast", "shoo", "fart", "smoke", "puff"], skins: [{ unified: "1f4a8", native: "\u{1F4A8}" }], version: 1 }, hole: { id: "hole", name: "Hole", keywords: ["embarrassing"], skins: [{ unified: "1f573-fe0f", native: "\u{1F573}\uFE0F" }], version: 1 }, bomb: { id: "bomb", name: "Bomb", keywords: ["boom", "explode", "explosion", "terrorism"], skins: [{ unified: "1f4a3", native: "\u{1F4A3}" }], version: 1 }, speech_balloon: { id: "speech_balloon", name: "Speech Balloon", keywords: ["bubble", "words", "message", "talk", "chatting"], skins: [{ unified: "1f4ac", native: "\u{1F4AC}" }], version: 1 }, "eye-in-speech-bubble": { id: "eye-in-speech-bubble", name: "Eye in Speech Bubble", keywords: ["in-speech-bubble", "info"], skins: [{ unified: "1f441-fe0f-200d-1f5e8-fe0f", native: "\u{1F441}\uFE0F\u200D\u{1F5E8}\uFE0F" }], version: 2 }, left_speech_bubble: { id: "left_speech_bubble", name: "Left Speech Bubble", keywords: ["words", "message", "talk", "chatting"], skins: [{ unified: "1f5e8-fe0f", native: "\u{1F5E8}\uFE0F" }], version: 2 }, right_anger_bubble: { id: "right_anger_bubble", name: "Right Anger Bubble", keywords: ["caption", "speech", "thinking", "mad"], skins: [{ unified: "1f5ef-fe0f", native: "\u{1F5EF}\uFE0F" }], version: 1 }, thought_balloon: { id: "thought_balloon", name: "Thought Balloon", keywords: ["bubble", "cloud", "speech", "thinking", "dream"], skins: [{ unified: "1f4ad", native: "\u{1F4AD}" }], version: 1 }, zzz: { id: "zzz", name: "Zzz", keywords: ["sleepy", "tired", "dream"], skins: [{ unified: "1f4a4", native: "\u{1F4A4}" }], version: 1 }, wave: { id: "wave", name: "Waving Hand", keywords: ["wave", "hands", "gesture", "goodbye", "solong", "farewell", "hello", "hi", "palm"], skins: [{ unified: "1f44b", native: "\u{1F44B}" }, { unified: "1f44b-1f3fb", native: "\u{1F44B}\u{1F3FB}" }, { unified: "1f44b-1f3fc", native: "\u{1F44B}\u{1F3FC}" }, { unified: "1f44b-1f3fd", native: "\u{1F44B}\u{1F3FD}" }, { unified: "1f44b-1f3fe", native: "\u{1F44B}\u{1F3FE}" }, { unified: "1f44b-1f3ff", native: "\u{1F44B}\u{1F3FF}" }], version: 1 }, raised_back_of_hand: { id: "raised_back_of_hand", name: "Raised Back of Hand", keywords: ["fingers", "backhand"], skins: [{ unified: "1f91a", native: "\u{1F91A}" }, { unified: "1f91a-1f3fb", native: "\u{1F91A}\u{1F3FB}" }, { unified: "1f91a-1f3fc", native: "\u{1F91A}\u{1F3FC}" }, { unified: "1f91a-1f3fd", native: "\u{1F91A}\u{1F3FD}" }, { unified: "1f91a-1f3fe", native: "\u{1F91A}\u{1F3FE}" }, { unified: "1f91a-1f3ff", native: "\u{1F91A}\u{1F3FF}" }], version: 3 }, raised_hand_with_fingers_splayed: { id: "raised_hand_with_fingers_splayed", name: "Hand with Fingers Splayed", keywords: ["raised", "palm"], skins: [{ unified: "1f590-fe0f", native: "\u{1F590}\uFE0F" }, { unified: "1f590-1f3fb", native: "\u{1F590}\u{1F3FB}" }, { unified: "1f590-1f3fc", native: "\u{1F590}\u{1F3FC}" }, { unified: "1f590-1f3fd", native: "\u{1F590}\u{1F3FD}" }, { unified: "1f590-1f3fe", native: "\u{1F590}\u{1F3FE}" }, { unified: "1f590-1f3ff", native: "\u{1F590}\u{1F3FF}" }], version: 1 }, hand: { id: "hand", name: "Raised Hand", keywords: ["fingers", "stop", "highfive", "high", "five", "palm", "ban"], skins: [{ unified: "270b", native: "\u270B" }, { unified: "270b-1f3fb", native: "\u270B\u{1F3FB}" }, { unified: "270b-1f3fc", native: "\u270B\u{1F3FC}" }, { unified: "270b-1f3fd", native: "\u270B\u{1F3FD}" }, { unified: "270b-1f3fe", native: "\u270B\u{1F3FE}" }, { unified: "270b-1f3ff", native: "\u270B\u{1F3FF}" }], version: 1 }, "spock-hand": { id: "spock-hand", name: "Vulcan Salute", keywords: ["spock", "hand", "fingers", "star", "trek"], skins: [{ unified: "1f596", native: "\u{1F596}" }, { unified: "1f596-1f3fb", native: "\u{1F596}\u{1F3FB}" }, { unified: "1f596-1f3fc", native: "\u{1F596}\u{1F3FC}" }, { unified: "1f596-1f3fd", native: "\u{1F596}\u{1F3FD}" }, { unified: "1f596-1f3fe", native: "\u{1F596}\u{1F3FE}" }, { unified: "1f596-1f3ff", native: "\u{1F596}\u{1F3FF}" }], version: 1 }, rightwards_hand: { id: "rightwards_hand", name: "Rightwards Hand", keywords: ["palm", "offer"], skins: [{ unified: "1faf1", native: "\u{1FAF1}" }, { unified: "1faf1-1f3fb", native: "\u{1FAF1}\u{1F3FB}" }, { unified: "1faf1-1f3fc", native: "\u{1FAF1}\u{1F3FC}" }, { unified: "1faf1-1f3fd", native: "\u{1FAF1}\u{1F3FD}" }, { unified: "1faf1-1f3fe", native: "\u{1FAF1}\u{1F3FE}" }, { unified: "1faf1-1f3ff", native: "\u{1FAF1}\u{1F3FF}" }], version: 14 }, leftwards_hand: { id: "leftwards_hand", name: "Leftwards Hand", keywords: ["palm", "offer"], skins: [{ unified: "1faf2", native: "\u{1FAF2}" }, { unified: "1faf2-1f3fb", native: "\u{1FAF2}\u{1F3FB}" }, { unified: "1faf2-1f3fc", native: "\u{1FAF2}\u{1F3FC}" }, { unified: "1faf2-1f3fd", native: "\u{1FAF2}\u{1F3FD}" }, { unified: "1faf2-1f3fe", native: "\u{1FAF2}\u{1F3FE}" }, { unified: "1faf2-1f3ff", native: "\u{1FAF2}\u{1F3FF}" }], version: 14 }, palm_down_hand: { id: "palm_down_hand", name: "Palm Down Hand", keywords: ["drop"], skins: [{ unified: "1faf3", native: "\u{1FAF3}" }, { unified: "1faf3-1f3fb", native: "\u{1FAF3}\u{1F3FB}" }, { unified: "1faf3-1f3fc", native: "\u{1FAF3}\u{1F3FC}" }, { unified: "1faf3-1f3fd", native: "\u{1FAF3}\u{1F3FD}" }, { unified: "1faf3-1f3fe", native: "\u{1FAF3}\u{1F3FE}" }, { unified: "1faf3-1f3ff", native: "\u{1FAF3}\u{1F3FF}" }], version: 14 }, palm_up_hand: { id: "palm_up_hand", name: "Palm Up Hand", keywords: ["lift", "offer", "demand"], skins: [{ unified: "1faf4", native: "\u{1FAF4}" }, { unified: "1faf4-1f3fb", native: "\u{1FAF4}\u{1F3FB}" }, { unified: "1faf4-1f3fc", native: "\u{1FAF4}\u{1F3FC}" }, { unified: "1faf4-1f3fd", native: "\u{1FAF4}\u{1F3FD}" }, { unified: "1faf4-1f3fe", native: "\u{1FAF4}\u{1F3FE}" }, { unified: "1faf4-1f3ff", native: "\u{1FAF4}\u{1F3FF}" }], version: 14 }, ok_hand: { id: "ok_hand", name: "Ok Hand", keywords: ["fingers", "limbs", "perfect", "okay"], skins: [{ unified: "1f44c", native: "\u{1F44C}" }, { unified: "1f44c-1f3fb", native: "\u{1F44C}\u{1F3FB}" }, { unified: "1f44c-1f3fc", native: "\u{1F44C}\u{1F3FC}" }, { unified: "1f44c-1f3fd", native: "\u{1F44C}\u{1F3FD}" }, { unified: "1f44c-1f3fe", native: "\u{1F44C}\u{1F3FE}" }, { unified: "1f44c-1f3ff", native: "\u{1F44C}\u{1F3FF}" }], version: 1 }, pinched_fingers: { id: "pinched_fingers", name: "Pinched Fingers", keywords: ["size", "tiny", "small"], skins: [{ unified: "1f90c", native: "\u{1F90C}" }, { unified: "1f90c-1f3fb", native: "\u{1F90C}\u{1F3FB}" }, { unified: "1f90c-1f3fc", native: "\u{1F90C}\u{1F3FC}" }, { unified: "1f90c-1f3fd", native: "\u{1F90C}\u{1F3FD}" }, { unified: "1f90c-1f3fe", native: "\u{1F90C}\u{1F3FE}" }, { unified: "1f90c-1f3ff", native: "\u{1F90C}\u{1F3FF}" }], version: 13 }, pinching_hand: { id: "pinching_hand", name: "Pinching Hand", keywords: ["tiny", "small", "size"], skins: [{ unified: "1f90f", native: "\u{1F90F}" }, { unified: "1f90f-1f3fb", native: "\u{1F90F}\u{1F3FB}" }, { unified: "1f90f-1f3fc", native: "\u{1F90F}\u{1F3FC}" }, { unified: "1f90f-1f3fd", native: "\u{1F90F}\u{1F3FD}" }, { unified: "1f90f-1f3fe", native: "\u{1F90F}\u{1F3FE}" }, { unified: "1f90f-1f3ff", native: "\u{1F90F}\u{1F3FF}" }], version: 12 }, v: { id: "v", name: "Victory Hand", keywords: ["v", "fingers", "ohyeah", "peace", "two"], skins: [{ unified: "270c-fe0f", native: "\u270C\uFE0F" }, { unified: "270c-1f3fb", native: "\u270C\u{1F3FB}" }, { unified: "270c-1f3fc", native: "\u270C\u{1F3FC}" }, { unified: "270c-1f3fd", native: "\u270C\u{1F3FD}" }, { unified: "270c-1f3fe", native: "\u270C\u{1F3FE}" }, { unified: "270c-1f3ff", native: "\u270C\u{1F3FF}" }], version: 1 }, crossed_fingers: { id: "crossed_fingers", name: "Crossed Fingers", keywords: ["hand", "with", "index", "and", "middle", "good", "lucky"], skins: [{ unified: "1f91e", native: "\u{1F91E}" }, { unified: "1f91e-1f3fb", native: "\u{1F91E}\u{1F3FB}" }, { unified: "1f91e-1f3fc", native: "\u{1F91E}\u{1F3FC}" }, { unified: "1f91e-1f3fd", native: "\u{1F91E}\u{1F3FD}" }, { unified: "1f91e-1f3fe", native: "\u{1F91E}\u{1F3FE}" }, { unified: "1f91e-1f3ff", native: "\u{1F91E}\u{1F3FF}" }], version: 3 }, hand_with_index_finger_and_thumb_crossed: { id: "hand_with_index_finger_and_thumb_crossed", name: "Hand with Index Finger and Thumb Crossed", keywords: ["heart", "love", "money", "expensive"], skins: [{ unified: "1faf0", native: "\u{1FAF0}" }, { unified: "1faf0-1f3fb", native: "\u{1FAF0}\u{1F3FB}" }, { unified: "1faf0-1f3fc", native: "\u{1FAF0}\u{1F3FC}" }, { unified: "1faf0-1f3fd", native: "\u{1FAF0}\u{1F3FD}" }, { unified: "1faf0-1f3fe", native: "\u{1FAF0}\u{1F3FE}" }, { unified: "1faf0-1f3ff", native: "\u{1FAF0}\u{1F3FF}" }], version: 14 }, i_love_you_hand_sign: { id: "i_love_you_hand_sign", name: "Love-You Gesture", keywords: ["i", "love", "you", "hand", "sign", "fingers"], skins: [{ unified: "1f91f", native: "\u{1F91F}" }, { unified: "1f91f-1f3fb", native: "\u{1F91F}\u{1F3FB}" }, { unified: "1f91f-1f3fc", native: "\u{1F91F}\u{1F3FC}" }, { unified: "1f91f-1f3fd", native: "\u{1F91F}\u{1F3FD}" }, { unified: "1f91f-1f3fe", native: "\u{1F91F}\u{1F3FE}" }, { unified: "1f91f-1f3ff", native: "\u{1F91F}\u{1F3FF}" }], version: 5 }, the_horns: { id: "the_horns", name: "Sign of the Horns", keywords: ["hand", "fingers", "evil", "eye", "rock", "on"], skins: [{ unified: "1f918", native: "\u{1F918}" }, { unified: "1f918-1f3fb", native: "\u{1F918}\u{1F3FB}" }, { unified: "1f918-1f3fc", native: "\u{1F918}\u{1F3FC}" }, { unified: "1f918-1f3fd", native: "\u{1F918}\u{1F3FD}" }, { unified: "1f918-1f3fe", native: "\u{1F918}\u{1F3FE}" }, { unified: "1f918-1f3ff", native: "\u{1F918}\u{1F3FF}" }], version: 1 }, call_me_hand: { id: "call_me_hand", name: "Call Me Hand", keywords: ["hands", "gesture", "shaka"], skins: [{ unified: "1f919", native: "\u{1F919}" }, { unified: "1f919-1f3fb", native: "\u{1F919}\u{1F3FB}" }, { unified: "1f919-1f3fc", native: "\u{1F919}\u{1F3FC}" }, { unified: "1f919-1f3fd", native: "\u{1F919}\u{1F3FD}" }, { unified: "1f919-1f3fe", native: "\u{1F919}\u{1F3FE}" }, { unified: "1f919-1f3ff", native: "\u{1F919}\u{1F3FF}" }], version: 3 }, point_left: { id: "point_left", name: "Backhand Index Pointing Left", keywords: ["point", "direction", "fingers", "hand"], skins: [{ unified: "1f448", native: "\u{1F448}" }, { unified: "1f448-1f3fb", native: "\u{1F448}\u{1F3FB}" }, { unified: "1f448-1f3fc", native: "\u{1F448}\u{1F3FC}" }, { unified: "1f448-1f3fd", native: "\u{1F448}\u{1F3FD}" }, { unified: "1f448-1f3fe", native: "\u{1F448}\u{1F3FE}" }, { unified: "1f448-1f3ff", native: "\u{1F448}\u{1F3FF}" }], version: 1 }, point_right: { id: "point_right", name: "Backhand Index Pointing Right", keywords: ["point", "fingers", "hand", "direction"], skins: [{ unified: "1f449", native: "\u{1F449}" }, { unified: "1f449-1f3fb", native: "\u{1F449}\u{1F3FB}" }, { unified: "1f449-1f3fc", native: "\u{1F449}\u{1F3FC}" }, { unified: "1f449-1f3fd", native: "\u{1F449}\u{1F3FD}" }, { unified: "1f449-1f3fe", native: "\u{1F449}\u{1F3FE}" }, { unified: "1f449-1f3ff", native: "\u{1F449}\u{1F3FF}" }], version: 1 }, point_up_2: { id: "point_up_2", name: "Backhand Index Pointing Up", keywords: ["point", "2", "fingers", "hand", "direction"], skins: [{ unified: "1f446", native: "\u{1F446}" }, { unified: "1f446-1f3fb", native: "\u{1F446}\u{1F3FB}" }, { unified: "1f446-1f3fc", native: "\u{1F446}\u{1F3FC}" }, { unified: "1f446-1f3fd", native: "\u{1F446}\u{1F3FD}" }, { unified: "1f446-1f3fe", native: "\u{1F446}\u{1F3FE}" }, { unified: "1f446-1f3ff", native: "\u{1F446}\u{1F3FF}" }], version: 1 }, middle_finger: { id: "middle_finger", name: "Middle Finger", keywords: ["reversed", "hand", "with", "extended", "fingers", "rude", "flipping"], skins: [{ unified: "1f595", native: "\u{1F595}" }, { unified: "1f595-1f3fb", native: "\u{1F595}\u{1F3FB}" }, { unified: "1f595-1f3fc", native: "\u{1F595}\u{1F3FC}" }, { unified: "1f595-1f3fd", native: "\u{1F595}\u{1F3FD}" }, { unified: "1f595-1f3fe", native: "\u{1F595}\u{1F3FE}" }, { unified: "1f595-1f3ff", native: "\u{1F595}\u{1F3FF}" }], version: 1 }, point_down: { id: "point_down", name: "Backhand Index Pointing Down", keywords: ["point", "fingers", "hand", "direction"], skins: [{ unified: "1f447", native: "\u{1F447}" }, { unified: "1f447-1f3fb", native: "\u{1F447}\u{1F3FB}" }, { unified: "1f447-1f3fc", native: "\u{1F447}\u{1F3FC}" }, { unified: "1f447-1f3fd", native: "\u{1F447}\u{1F3FD}" }, { unified: "1f447-1f3fe", native: "\u{1F447}\u{1F3FE}" }, { unified: "1f447-1f3ff", native: "\u{1F447}\u{1F3FF}" }], version: 1 }, point_up: { id: "point_up", name: "Index Pointing Up", keywords: ["point", "hand", "fingers", "direction"], skins: [{ unified: "261d-fe0f", native: "\u261D\uFE0F" }, { unified: "261d-1f3fb", native: "\u261D\u{1F3FB}" }, { unified: "261d-1f3fc", native: "\u261D\u{1F3FC}" }, { unified: "261d-1f3fd", native: "\u261D\u{1F3FD}" }, { unified: "261d-1f3fe", native: "\u261D\u{1F3FE}" }, { unified: "261d-1f3ff", native: "\u261D\u{1F3FF}" }], version: 1 }, index_pointing_at_the_viewer: { id: "index_pointing_at_the_viewer", name: "Index Pointing at the Viewer", keywords: ["you", "recruit"], skins: [{ unified: "1faf5", native: "\u{1FAF5}" }, { unified: "1faf5-1f3fb", native: "\u{1FAF5}\u{1F3FB}" }, { unified: "1faf5-1f3fc", native: "\u{1FAF5}\u{1F3FC}" }, { unified: "1faf5-1f3fd", native: "\u{1FAF5}\u{1F3FD}" }, { unified: "1faf5-1f3fe", native: "\u{1FAF5}\u{1F3FE}" }, { unified: "1faf5-1f3ff", native: "\u{1FAF5}\u{1F3FF}" }], version: 14 }, "+1": { id: "+1", name: "Thumbs Up", keywords: ["+1", "thumbsup", "yes", "awesome", "good", "agree", "accept", "cool", "hand", "like"], skins: [{ unified: "1f44d", native: "\u{1F44D}" }, { unified: "1f44d-1f3fb", native: "\u{1F44D}\u{1F3FB}" }, { unified: "1f44d-1f3fc", native: "\u{1F44D}\u{1F3FC}" }, { unified: "1f44d-1f3fd", native: "\u{1F44D}\u{1F3FD}" }, { unified: "1f44d-1f3fe", native: "\u{1F44D}\u{1F3FE}" }, { unified: "1f44d-1f3ff", native: "\u{1F44D}\u{1F3FF}" }], version: 1 }, "-1": { id: "-1", name: "Thumbs Down", keywords: ["-1", "thumbsdown", "no", "dislike", "hand"], skins: [{ unified: "1f44e", native: "\u{1F44E}" }, { unified: "1f44e-1f3fb", native: "\u{1F44E}\u{1F3FB}" }, { unified: "1f44e-1f3fc", native: "\u{1F44E}\u{1F3FC}" }, { unified: "1f44e-1f3fd", native: "\u{1F44E}\u{1F3FD}" }, { unified: "1f44e-1f3fe", native: "\u{1F44E}\u{1F3FE}" }, { unified: "1f44e-1f3ff", native: "\u{1F44E}\u{1F3FF}" }], version: 1 }, fist: { id: "fist", name: "Raised Fist", keywords: ["fingers", "hand", "grasp"], skins: [{ unified: "270a", native: "\u270A" }, { unified: "270a-1f3fb", native: "\u270A\u{1F3FB}" }, { unified: "270a-1f3fc", native: "\u270A\u{1F3FC}" }, { unified: "270a-1f3fd", native: "\u270A\u{1F3FD}" }, { unified: "270a-1f3fe", native: "\u270A\u{1F3FE}" }, { unified: "270a-1f3ff", native: "\u270A\u{1F3FF}" }], version: 1 }, facepunch: { id: "facepunch", name: "Oncoming Fist", keywords: ["facepunch", "punch", "angry", "violence", "hit", "attack", "hand"], skins: [{ unified: "1f44a", native: "\u{1F44A}" }, { unified: "1f44a-1f3fb", native: "\u{1F44A}\u{1F3FB}" }, { unified: "1f44a-1f3fc", native: "\u{1F44A}\u{1F3FC}" }, { unified: "1f44a-1f3fd", native: "\u{1F44A}\u{1F3FD}" }, { unified: "1f44a-1f3fe", native: "\u{1F44A}\u{1F3FE}" }, { unified: "1f44a-1f3ff", native: "\u{1F44A}\u{1F3FF}" }], version: 1 }, "left-facing_fist": { id: "left-facing_fist", name: "Left-Facing Fist", keywords: ["left", "facing", "hand", "fistbump"], skins: [{ unified: "1f91b", native: "\u{1F91B}" }, { unified: "1f91b-1f3fb", native: "\u{1F91B}\u{1F3FB}" }, { unified: "1f91b-1f3fc", native: "\u{1F91B}\u{1F3FC}" }, { unified: "1f91b-1f3fd", native: "\u{1F91B}\u{1F3FD}" }, { unified: "1f91b-1f3fe", native: "\u{1F91B}\u{1F3FE}" }, { unified: "1f91b-1f3ff", native: "\u{1F91B}\u{1F3FF}" }], version: 3 }, "right-facing_fist": { id: "right-facing_fist", name: "Right-Facing Fist", keywords: ["right", "facing", "hand", "fistbump"], skins: [{ unified: "1f91c", native: "\u{1F91C}" }, { unified: "1f91c-1f3fb", native: "\u{1F91C}\u{1F3FB}" }, { unified: "1f91c-1f3fc", native: "\u{1F91C}\u{1F3FC}" }, { unified: "1f91c-1f3fd", native: "\u{1F91C}\u{1F3FD}" }, { unified: "1f91c-1f3fe", native: "\u{1F91C}\u{1F3FE}" }, { unified: "1f91c-1f3ff", native: "\u{1F91C}\u{1F3FF}" }], version: 3 }, clap: { id: "clap", name: "Clapping Hands", keywords: ["clap", "praise", "applause", "congrats", "yay"], skins: [{ unified: "1f44f", native: "\u{1F44F}" }, { unified: "1f44f-1f3fb", native: "\u{1F44F}\u{1F3FB}" }, { unified: "1f44f-1f3fc", native: "\u{1F44F}\u{1F3FC}" }, { unified: "1f44f-1f3fd", native: "\u{1F44F}\u{1F3FD}" }, { unified: "1f44f-1f3fe", native: "\u{1F44F}\u{1F3FE}" }, { unified: "1f44f-1f3ff", native: "\u{1F44F}\u{1F3FF}" }], version: 1 }, raised_hands: { id: "raised_hands", name: "Raising Hands", keywords: ["raised", "gesture", "hooray", "yea", "celebration"], skins: [{ unified: "1f64c", native: "\u{1F64C}" }, { unified: "1f64c-1f3fb", native: "\u{1F64C}\u{1F3FB}" }, { unified: "1f64c-1f3fc", native: "\u{1F64C}\u{1F3FC}" }, { unified: "1f64c-1f3fd", native: "\u{1F64C}\u{1F3FD}" }, { unified: "1f64c-1f3fe", native: "\u{1F64C}\u{1F3FE}" }, { unified: "1f64c-1f3ff", native: "\u{1F64C}\u{1F3FF}" }], version: 1 }, heart_hands: { id: "heart_hands", name: "Heart Hands", keywords: ["love", "appreciation", "support"], skins: [{ unified: "1faf6", native: "\u{1FAF6}" }, { unified: "1faf6-1f3fb", native: "\u{1FAF6}\u{1F3FB}" }, { unified: "1faf6-1f3fc", native: "\u{1FAF6}\u{1F3FC}" }, { unified: "1faf6-1f3fd", native: "\u{1FAF6}\u{1F3FD}" }, { unified: "1faf6-1f3fe", native: "\u{1FAF6}\u{1F3FE}" }, { unified: "1faf6-1f3ff", native: "\u{1FAF6}\u{1F3FF}" }], version: 14 }, open_hands: { id: "open_hands", name: "Open Hands", keywords: ["fingers", "butterfly"], skins: [{ unified: "1f450", native: "\u{1F450}" }, { unified: "1f450-1f3fb", native: "\u{1F450}\u{1F3FB}" }, { unified: "1f450-1f3fc", native: "\u{1F450}\u{1F3FC}" }, { unified: "1f450-1f3fd", native: "\u{1F450}\u{1F3FD}" }, { unified: "1f450-1f3fe", native: "\u{1F450}\u{1F3FE}" }, { unified: "1f450-1f3ff", native: "\u{1F450}\u{1F3FF}" }], version: 1 }, palms_up_together: { id: "palms_up_together", name: "Palms Up Together", keywords: ["hands", "gesture", "cupped", "prayer"], skins: [{ unified: "1f932", native: "\u{1F932}" }, { unified: "1f932-1f3fb", native: "\u{1F932}\u{1F3FB}" }, { unified: "1f932-1f3fc", native: "\u{1F932}\u{1F3FC}" }, { unified: "1f932-1f3fd", native: "\u{1F932}\u{1F3FD}" }, { unified: "1f932-1f3fe", native: "\u{1F932}\u{1F3FE}" }, { unified: "1f932-1f3ff", native: "\u{1F932}\u{1F3FF}" }], version: 5 }, handshake: { id: "handshake", name: "Handshake", keywords: ["agreement", "shake"], skins: [{ unified: "1f91d", native: "\u{1F91D}" }, { unified: "1f91d-1f3fb", native: "\u{1F91D}\u{1F3FB}" }, { unified: "1f91d-1f3fc", native: "\u{1F91D}\u{1F3FC}" }, { unified: "1f91d-1f3fd", native: "\u{1F91D}\u{1F3FD}" }, { unified: "1f91d-1f3fe", native: "\u{1F91D}\u{1F3FE}" }, { unified: "1f91d-1f3ff", native: "\u{1F91D}\u{1F3FF}" }], version: 3 }, pray: { id: "pray", name: "Folded Hands", keywords: ["pray", "please", "hope", "wish", "namaste", "highfive", "high", "five"], skins: [{ unified: "1f64f", native: "\u{1F64F}" }, { unified: "1f64f-1f3fb", native: "\u{1F64F}\u{1F3FB}" }, { unified: "1f64f-1f3fc", native: "\u{1F64F}\u{1F3FC}" }, { unified: "1f64f-1f3fd", native: "\u{1F64F}\u{1F3FD}" }, { unified: "1f64f-1f3fe", native: "\u{1F64F}\u{1F3FE}" }, { unified: "1f64f-1f3ff", native: "\u{1F64F}\u{1F3FF}" }], version: 1 }, writing_hand: { id: "writing_hand", name: "Writing Hand", keywords: ["lower", "left", "ballpoint", "pen", "stationery", "write", "compose"], skins: [{ unified: "270d-fe0f", native: "\u270D\uFE0F" }, { unified: "270d-1f3fb", native: "\u270D\u{1F3FB}" }, { unified: "270d-1f3fc", native: "\u270D\u{1F3FC}" }, { unified: "270d-1f3fd", native: "\u270D\u{1F3FD}" }, { unified: "270d-1f3fe", native: "\u270D\u{1F3FE}" }, { unified: "270d-1f3ff", native: "\u270D\u{1F3FF}" }], version: 1 }, nail_care: { id: "nail_care", name: "Nail Polish", keywords: ["care", "beauty", "manicure", "finger", "fashion"], skins: [{ unified: "1f485", native: "\u{1F485}" }, { unified: "1f485-1f3fb", native: "\u{1F485}\u{1F3FB}" }, { unified: "1f485-1f3fc", native: "\u{1F485}\u{1F3FC}" }, { unified: "1f485-1f3fd", native: "\u{1F485}\u{1F3FD}" }, { unified: "1f485-1f3fe", native: "\u{1F485}\u{1F3FE}" }, { unified: "1f485-1f3ff", native: "\u{1F485}\u{1F3FF}" }], version: 1 }, selfie: { id: "selfie", name: "Selfie", keywords: ["camera", "phone"], skins: [{ unified: "1f933", native: "\u{1F933}" }, { unified: "1f933-1f3fb", native: "\u{1F933}\u{1F3FB}" }, { unified: "1f933-1f3fc", native: "\u{1F933}\u{1F3FC}" }, { unified: "1f933-1f3fd", native: "\u{1F933}\u{1F3FD}" }, { unified: "1f933-1f3fe", native: "\u{1F933}\u{1F3FE}" }, { unified: "1f933-1f3ff", native: "\u{1F933}\u{1F3FF}" }], version: 3 }, muscle: { id: "muscle", name: "Flexed Biceps", keywords: ["muscle", "arm", "flex", "hand", "summer", "strong"], skins: [{ unified: "1f4aa", native: "\u{1F4AA}" }, { unified: "1f4aa-1f3fb", native: "\u{1F4AA}\u{1F3FB}" }, { unified: "1f4aa-1f3fc", native: "\u{1F4AA}\u{1F3FC}" }, { unified: "1f4aa-1f3fd", native: "\u{1F4AA}\u{1F3FD}" }, { unified: "1f4aa-1f3fe", native: "\u{1F4AA}\u{1F3FE}" }, { unified: "1f4aa-1f3ff", native: "\u{1F4AA}\u{1F3FF}" }], version: 1 }, mechanical_arm: { id: "mechanical_arm", name: "Mechanical Arm", keywords: ["accessibility"], skins: [{ unified: "1f9be", native: "\u{1F9BE}" }], version: 12 }, mechanical_leg: { id: "mechanical_leg", name: "Mechanical Leg", keywords: ["accessibility"], skins: [{ unified: "1f9bf", native: "\u{1F9BF}" }], version: 12 }, leg: { id: "leg", name: "Leg", keywords: ["kick", "limb"], skins: [{ unified: "1f9b5", native: "\u{1F9B5}" }, { unified: "1f9b5-1f3fb", native: "\u{1F9B5}\u{1F3FB}" }, { unified: "1f9b5-1f3fc", native: "\u{1F9B5}\u{1F3FC}" }, { unified: "1f9b5-1f3fd", native: "\u{1F9B5}\u{1F3FD}" }, { unified: "1f9b5-1f3fe", native: "\u{1F9B5}\u{1F3FE}" }, { unified: "1f9b5-1f3ff", native: "\u{1F9B5}\u{1F3FF}" }], version: 11 }, foot: { id: "foot", name: "Foot", keywords: ["kick", "stomp"], skins: [{ unified: "1f9b6", native: "\u{1F9B6}" }, { unified: "1f9b6-1f3fb", native: "\u{1F9B6}\u{1F3FB}" }, { unified: "1f9b6-1f3fc", native: "\u{1F9B6}\u{1F3FC}" }, { unified: "1f9b6-1f3fd", native: "\u{1F9B6}\u{1F3FD}" }, { unified: "1f9b6-1f3fe", native: "\u{1F9B6}\u{1F3FE}" }, { unified: "1f9b6-1f3ff", native: "\u{1F9B6}\u{1F3FF}" }], version: 11 }, ear: { id: "ear", name: "Ear", keywords: ["face", "hear", "sound", "listen"], skins: [{ unified: "1f442", native: "\u{1F442}" }, { unified: "1f442-1f3fb", native: "\u{1F442}\u{1F3FB}" }, { unified: "1f442-1f3fc", native: "\u{1F442}\u{1F3FC}" }, { unified: "1f442-1f3fd", native: "\u{1F442}\u{1F3FD}" }, { unified: "1f442-1f3fe", native: "\u{1F442}\u{1F3FE}" }, { unified: "1f442-1f3ff", native: "\u{1F442}\u{1F3FF}" }], version: 1 }, ear_with_hearing_aid: { id: "ear_with_hearing_aid", name: "Ear with Hearing Aid", keywords: ["accessibility"], skins: [{ unified: "1f9bb", native: "\u{1F9BB}" }, { unified: "1f9bb-1f3fb", native: "\u{1F9BB}\u{1F3FB}" }, { unified: "1f9bb-1f3fc", native: "\u{1F9BB}\u{1F3FC}" }, { unified: "1f9bb-1f3fd", native: "\u{1F9BB}\u{1F3FD}" }, { unified: "1f9bb-1f3fe", native: "\u{1F9BB}\u{1F3FE}" }, { unified: "1f9bb-1f3ff", native: "\u{1F9BB}\u{1F3FF}" }], version: 12 }, nose: { id: "nose", name: "Nose", keywords: ["smell", "sniff"], skins: [{ unified: "1f443", native: "\u{1F443}" }, { unified: "1f443-1f3fb", native: "\u{1F443}\u{1F3FB}" }, { unified: "1f443-1f3fc", native: "\u{1F443}\u{1F3FC}" }, { unified: "1f443-1f3fd", native: "\u{1F443}\u{1F3FD}" }, { unified: "1f443-1f3fe", native: "\u{1F443}\u{1F3FE}" }, { unified: "1f443-1f3ff", native: "\u{1F443}\u{1F3FF}" }], version: 1 }, brain: { id: "brain", name: "Brain", keywords: ["smart", "intelligent"], skins: [{ unified: "1f9e0", native: "\u{1F9E0}" }], version: 5 }, anatomical_heart: { id: "anatomical_heart", name: "Anatomical Heart", keywords: ["health", "heartbeat"], skins: [{ unified: "1fac0", native: "\u{1FAC0}" }], version: 13 }, lungs: { id: "lungs", name: "Lungs", keywords: ["breathe"], skins: [{ unified: "1fac1", native: "\u{1FAC1}" }], version: 13 }, tooth: { id: "tooth", name: "Tooth", keywords: ["teeth", "dentist"], skins: [{ unified: "1f9b7", native: "\u{1F9B7}" }], version: 11 }, bone: { id: "bone", name: "Bone", keywords: ["skeleton"], skins: [{ unified: "1f9b4", native: "\u{1F9B4}" }], version: 11 }, eyes: { id: "eyes", name: "Eyes", keywords: ["look", "watch", "stalk", "peek", "see"], skins: [{ unified: "1f440", native: "\u{1F440}" }], version: 1 }, eye: { id: "eye", name: "Eye", keywords: ["face", "look", "see", "watch", "stare"], skins: [{ unified: "1f441-fe0f", native: "\u{1F441}\uFE0F" }], version: 1 }, tongue: { id: "tongue", name: "Tongue", keywords: ["mouth", "playful"], skins: [{ unified: "1f445", native: "\u{1F445}" }], version: 1 }, lips: { id: "lips", name: "Mouth", keywords: ["lips", "kiss"], skins: [{ unified: "1f444", native: "\u{1F444}" }], version: 1 }, biting_lip: { id: "biting_lip", name: "Biting Lip", keywords: ["flirt", "sexy", "pain", "worry"], skins: [{ unified: "1fae6", native: "\u{1FAE6}" }], version: 14 }, baby: { id: "baby", name: "Baby", keywords: ["child", "boy", "girl", "toddler"], skins: [{ unified: "1f476", native: "\u{1F476}" }, { unified: "1f476-1f3fb", native: "\u{1F476}\u{1F3FB}" }, { unified: "1f476-1f3fc", native: "\u{1F476}\u{1F3FC}" }, { unified: "1f476-1f3fd", native: "\u{1F476}\u{1F3FD}" }, { unified: "1f476-1f3fe", native: "\u{1F476}\u{1F3FE}" }, { unified: "1f476-1f3ff", native: "\u{1F476}\u{1F3FF}" }], version: 1 }, child: { id: "child", name: "Child", keywords: ["gender", "neutral", "young"], skins: [{ unified: "1f9d2", native: "\u{1F9D2}" }, { unified: "1f9d2-1f3fb", native: "\u{1F9D2}\u{1F3FB}" }, { unified: "1f9d2-1f3fc", native: "\u{1F9D2}\u{1F3FC}" }, { unified: "1f9d2-1f3fd", native: "\u{1F9D2}\u{1F3FD}" }, { unified: "1f9d2-1f3fe", native: "\u{1F9D2}\u{1F3FE}" }, { unified: "1f9d2-1f3ff", native: "\u{1F9D2}\u{1F3FF}" }], version: 5 }, boy: { id: "boy", name: "Boy", keywords: ["man", "male", "guy", "teenager"], skins: [{ unified: "1f466", native: "\u{1F466}" }, { unified: "1f466-1f3fb", native: "\u{1F466}\u{1F3FB}" }, { unified: "1f466-1f3fc", native: "\u{1F466}\u{1F3FC}" }, { unified: "1f466-1f3fd", native: "\u{1F466}\u{1F3FD}" }, { unified: "1f466-1f3fe", native: "\u{1F466}\u{1F3FE}" }, { unified: "1f466-1f3ff", native: "\u{1F466}\u{1F3FF}" }], version: 1 }, girl: { id: "girl", name: "Girl", keywords: ["female", "woman", "teenager"], skins: [{ unified: "1f467", native: "\u{1F467}" }, { unified: "1f467-1f3fb", native: "\u{1F467}\u{1F3FB}" }, { unified: "1f467-1f3fc", native: "\u{1F467}\u{1F3FC}" }, { unified: "1f467-1f3fd", native: "\u{1F467}\u{1F3FD}" }, { unified: "1f467-1f3fe", native: "\u{1F467}\u{1F3FE}" }, { unified: "1f467-1f3ff", native: "\u{1F467}\u{1F3FF}" }], version: 1 }, adult: { id: "adult", name: "Adult", keywords: ["person", "gender", "neutral"], skins: [{ unified: "1f9d1", native: "\u{1F9D1}" }, { unified: "1f9d1-1f3fb", native: "\u{1F9D1}\u{1F3FB}" }, { unified: "1f9d1-1f3fc", native: "\u{1F9D1}\u{1F3FC}" }, { unified: "1f9d1-1f3fd", native: "\u{1F9D1}\u{1F3FD}" }, { unified: "1f9d1-1f3fe", native: "\u{1F9D1}\u{1F3FE}" }, { unified: "1f9d1-1f3ff", native: "\u{1F9D1}\u{1F3FF}" }], version: 5 }, person_with_blond_hair: { id: "person_with_blond_hair", name: "Person Blond Hair", keywords: ["with", "hairstyle"], skins: [{ unified: "1f471", native: "\u{1F471}" }, { unified: "1f471-1f3fb", native: "\u{1F471}\u{1F3FB}" }, { unified: "1f471-1f3fc", native: "\u{1F471}\u{1F3FC}" }, { unified: "1f471-1f3fd", native: "\u{1F471}\u{1F3FD}" }, { unified: "1f471-1f3fe", native: "\u{1F471}\u{1F3FE}" }, { unified: "1f471-1f3ff", native: "\u{1F471}\u{1F3FF}" }], version: 1 }, man: { id: "man", name: "Man", keywords: ["mustache", "father", "dad", "guy", "classy", "sir", "moustache"], skins: [{ unified: "1f468", native: "\u{1F468}" }, { unified: "1f468-1f3fb", native: "\u{1F468}\u{1F3FB}" }, { unified: "1f468-1f3fc", native: "\u{1F468}\u{1F3FC}" }, { unified: "1f468-1f3fd", native: "\u{1F468}\u{1F3FD}" }, { unified: "1f468-1f3fe", native: "\u{1F468}\u{1F3FE}" }, { unified: "1f468-1f3ff", native: "\u{1F468}\u{1F3FF}" }], version: 1 }, bearded_person: { id: "bearded_person", name: "Person Beard", keywords: ["bearded", "man", "bewhiskered"], skins: [{ unified: "1f9d4", native: "\u{1F9D4}" }, { unified: "1f9d4-1f3fb", native: "\u{1F9D4}\u{1F3FB}" }, { unified: "1f9d4-1f3fc", native: "\u{1F9D4}\u{1F3FC}" }, { unified: "1f9d4-1f3fd", native: "\u{1F9D4}\u{1F3FD}" }, { unified: "1f9d4-1f3fe", native: "\u{1F9D4}\u{1F3FE}" }, { unified: "1f9d4-1f3ff", native: "\u{1F9D4}\u{1F3FF}" }], version: 5 }, man_with_beard: { id: "man_with_beard", name: "Man: Beard", keywords: ["man", "with", "facial", "hair"], skins: [{ unified: "1f9d4-200d-2642-fe0f", native: "\u{1F9D4}\u200D\u2642\uFE0F" }, { unified: "1f9d4-1f3fb-200d-2642-fe0f", native: "\u{1F9D4}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f9d4-1f3fc-200d-2642-fe0f", native: "\u{1F9D4}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f9d4-1f3fd-200d-2642-fe0f", native: "\u{1F9D4}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f9d4-1f3fe-200d-2642-fe0f", native: "\u{1F9D4}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f9d4-1f3ff-200d-2642-fe0f", native: "\u{1F9D4}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 13.1 }, woman_with_beard: { id: "woman_with_beard", name: "Woman: Beard", keywords: ["woman", "with", "facial", "hair"], skins: [{ unified: "1f9d4-200d-2640-fe0f", native: "\u{1F9D4}\u200D\u2640\uFE0F" }, { unified: "1f9d4-1f3fb-200d-2640-fe0f", native: "\u{1F9D4}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f9d4-1f3fc-200d-2640-fe0f", native: "\u{1F9D4}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f9d4-1f3fd-200d-2640-fe0f", native: "\u{1F9D4}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f9d4-1f3fe-200d-2640-fe0f", native: "\u{1F9D4}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f9d4-1f3ff-200d-2640-fe0f", native: "\u{1F9D4}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 13.1 }, red_haired_man: { id: "red_haired_man", name: "Man: Red Hair", keywords: ["haired", "man", "hairstyle"], skins: [{ unified: "1f468-200d-1f9b0", native: "\u{1F468}\u200D\u{1F9B0}" }, { unified: "1f468-1f3fb-200d-1f9b0", native: "\u{1F468}\u{1F3FB}\u200D\u{1F9B0}" }, { unified: "1f468-1f3fc-200d-1f9b0", native: "\u{1F468}\u{1F3FC}\u200D\u{1F9B0}" }, { unified: "1f468-1f3fd-200d-1f9b0", native: "\u{1F468}\u{1F3FD}\u200D\u{1F9B0}" }, { unified: "1f468-1f3fe-200d-1f9b0", native: "\u{1F468}\u{1F3FE}\u200D\u{1F9B0}" }, { unified: "1f468-1f3ff-200d-1f9b0", native: "\u{1F468}\u{1F3FF}\u200D\u{1F9B0}" }], version: 11 }, curly_haired_man: { id: "curly_haired_man", name: "Man: Curly Hair", keywords: ["haired", "man", "hairstyle"], skins: [{ unified: "1f468-200d-1f9b1", native: "\u{1F468}\u200D\u{1F9B1}" }, { unified: "1f468-1f3fb-200d-1f9b1", native: "\u{1F468}\u{1F3FB}\u200D\u{1F9B1}" }, { unified: "1f468-1f3fc-200d-1f9b1", native: "\u{1F468}\u{1F3FC}\u200D\u{1F9B1}" }, { unified: "1f468-1f3fd-200d-1f9b1", native: "\u{1F468}\u{1F3FD}\u200D\u{1F9B1}" }, { unified: "1f468-1f3fe-200d-1f9b1", native: "\u{1F468}\u{1F3FE}\u200D\u{1F9B1}" }, { unified: "1f468-1f3ff-200d-1f9b1", native: "\u{1F468}\u{1F3FF}\u200D\u{1F9B1}" }], version: 11 }, white_haired_man: { id: "white_haired_man", name: "Man: White Hair", keywords: ["haired", "man", "old", "elder"], skins: [{ unified: "1f468-200d-1f9b3", native: "\u{1F468}\u200D\u{1F9B3}" }, { unified: "1f468-1f3fb-200d-1f9b3", native: "\u{1F468}\u{1F3FB}\u200D\u{1F9B3}" }, { unified: "1f468-1f3fc-200d-1f9b3", native: "\u{1F468}\u{1F3FC}\u200D\u{1F9B3}" }, { unified: "1f468-1f3fd-200d-1f9b3", native: "\u{1F468}\u{1F3FD}\u200D\u{1F9B3}" }, { unified: "1f468-1f3fe-200d-1f9b3", native: "\u{1F468}\u{1F3FE}\u200D\u{1F9B3}" }, { unified: "1f468-1f3ff-200d-1f9b3", native: "\u{1F468}\u{1F3FF}\u200D\u{1F9B3}" }], version: 11 }, bald_man: { id: "bald_man", name: "Man: Bald", keywords: ["man", "hairless"], skins: [{ unified: "1f468-200d-1f9b2", native: "\u{1F468}\u200D\u{1F9B2}" }, { unified: "1f468-1f3fb-200d-1f9b2", native: "\u{1F468}\u{1F3FB}\u200D\u{1F9B2}" }, { unified: "1f468-1f3fc-200d-1f9b2", native: "\u{1F468}\u{1F3FC}\u200D\u{1F9B2}" }, { unified: "1f468-1f3fd-200d-1f9b2", native: "\u{1F468}\u{1F3FD}\u200D\u{1F9B2}" }, { unified: "1f468-1f3fe-200d-1f9b2", native: "\u{1F468}\u{1F3FE}\u200D\u{1F9B2}" }, { unified: "1f468-1f3ff-200d-1f9b2", native: "\u{1F468}\u{1F3FF}\u200D\u{1F9B2}" }], version: 11 }, woman: { id: "woman", name: "Woman", keywords: ["female", "girls", "lady"], skins: [{ unified: "1f469", native: "\u{1F469}" }, { unified: "1f469-1f3fb", native: "\u{1F469}\u{1F3FB}" }, { unified: "1f469-1f3fc", native: "\u{1F469}\u{1F3FC}" }, { unified: "1f469-1f3fd", native: "\u{1F469}\u{1F3FD}" }, { unified: "1f469-1f3fe", native: "\u{1F469}\u{1F3FE}" }, { unified: "1f469-1f3ff", native: "\u{1F469}\u{1F3FF}" }], version: 1 }, red_haired_woman: { id: "red_haired_woman", name: "Woman: Red Hair", keywords: ["haired", "woman", "hairstyle"], skins: [{ unified: "1f469-200d-1f9b0", native: "\u{1F469}\u200D\u{1F9B0}" }, { unified: "1f469-1f3fb-200d-1f9b0", native: "\u{1F469}\u{1F3FB}\u200D\u{1F9B0}" }, { unified: "1f469-1f3fc-200d-1f9b0", native: "\u{1F469}\u{1F3FC}\u200D\u{1F9B0}" }, { unified: "1f469-1f3fd-200d-1f9b0", native: "\u{1F469}\u{1F3FD}\u200D\u{1F9B0}" }, { unified: "1f469-1f3fe-200d-1f9b0", native: "\u{1F469}\u{1F3FE}\u200D\u{1F9B0}" }, { unified: "1f469-1f3ff-200d-1f9b0", native: "\u{1F469}\u{1F3FF}\u200D\u{1F9B0}" }], version: 11 }, red_haired_person: { id: "red_haired_person", name: "Person: Red Hair", keywords: ["haired", "person", "hairstyle"], skins: [{ unified: "1f9d1-200d-1f9b0", native: "\u{1F9D1}\u200D\u{1F9B0}" }, { unified: "1f9d1-1f3fb-200d-1f9b0", native: "\u{1F9D1}\u{1F3FB}\u200D\u{1F9B0}" }, { unified: "1f9d1-1f3fc-200d-1f9b0", native: "\u{1F9D1}\u{1F3FC}\u200D\u{1F9B0}" }, { unified: "1f9d1-1f3fd-200d-1f9b0", native: "\u{1F9D1}\u{1F3FD}\u200D\u{1F9B0}" }, { unified: "1f9d1-1f3fe-200d-1f9b0", native: "\u{1F9D1}\u{1F3FE}\u200D\u{1F9B0}" }, { unified: "1f9d1-1f3ff-200d-1f9b0", native: "\u{1F9D1}\u{1F3FF}\u200D\u{1F9B0}" }], version: 12.1 }, curly_haired_woman: { id: "curly_haired_woman", name: "Woman: Curly Hair", keywords: ["haired", "woman", "hairstyle"], skins: [{ unified: "1f469-200d-1f9b1", native: "\u{1F469}\u200D\u{1F9B1}" }, { unified: "1f469-1f3fb-200d-1f9b1", native: "\u{1F469}\u{1F3FB}\u200D\u{1F9B1}" }, { unified: "1f469-1f3fc-200d-1f9b1", native: "\u{1F469}\u{1F3FC}\u200D\u{1F9B1}" }, { unified: "1f469-1f3fd-200d-1f9b1", native: "\u{1F469}\u{1F3FD}\u200D\u{1F9B1}" }, { unified: "1f469-1f3fe-200d-1f9b1", native: "\u{1F469}\u{1F3FE}\u200D\u{1F9B1}" }, { unified: "1f469-1f3ff-200d-1f9b1", native: "\u{1F469}\u{1F3FF}\u200D\u{1F9B1}" }], version: 11 }, curly_haired_person: { id: "curly_haired_person", name: "Person: Curly Hair", keywords: ["haired", "person", "hairstyle"], skins: [{ unified: "1f9d1-200d-1f9b1", native: "\u{1F9D1}\u200D\u{1F9B1}" }, { unified: "1f9d1-1f3fb-200d-1f9b1", native: "\u{1F9D1}\u{1F3FB}\u200D\u{1F9B1}" }, { unified: "1f9d1-1f3fc-200d-1f9b1", native: "\u{1F9D1}\u{1F3FC}\u200D\u{1F9B1}" }, { unified: "1f9d1-1f3fd-200d-1f9b1", native: "\u{1F9D1}\u{1F3FD}\u200D\u{1F9B1}" }, { unified: "1f9d1-1f3fe-200d-1f9b1", native: "\u{1F9D1}\u{1F3FE}\u200D\u{1F9B1}" }, { unified: "1f9d1-1f3ff-200d-1f9b1", native: "\u{1F9D1}\u{1F3FF}\u200D\u{1F9B1}" }], version: 12.1 }, white_haired_woman: { id: "white_haired_woman", name: "Woman: White Hair", keywords: ["haired", "woman", "old", "elder"], skins: [{ unified: "1f469-200d-1f9b3", native: "\u{1F469}\u200D\u{1F9B3}" }, { unified: "1f469-1f3fb-200d-1f9b3", native: "\u{1F469}\u{1F3FB}\u200D\u{1F9B3}" }, { unified: "1f469-1f3fc-200d-1f9b3", native: "\u{1F469}\u{1F3FC}\u200D\u{1F9B3}" }, { unified: "1f469-1f3fd-200d-1f9b3", native: "\u{1F469}\u{1F3FD}\u200D\u{1F9B3}" }, { unified: "1f469-1f3fe-200d-1f9b3", native: "\u{1F469}\u{1F3FE}\u200D\u{1F9B3}" }, { unified: "1f469-1f3ff-200d-1f9b3", native: "\u{1F469}\u{1F3FF}\u200D\u{1F9B3}" }], version: 11 }, white_haired_person: { id: "white_haired_person", name: "Person: White Hair", keywords: ["haired", "person", "elder", "old"], skins: [{ unified: "1f9d1-200d-1f9b3", native: "\u{1F9D1}\u200D\u{1F9B3}" }, { unified: "1f9d1-1f3fb-200d-1f9b3", native: "\u{1F9D1}\u{1F3FB}\u200D\u{1F9B3}" }, { unified: "1f9d1-1f3fc-200d-1f9b3", native: "\u{1F9D1}\u{1F3FC}\u200D\u{1F9B3}" }, { unified: "1f9d1-1f3fd-200d-1f9b3", native: "\u{1F9D1}\u{1F3FD}\u200D\u{1F9B3}" }, { unified: "1f9d1-1f3fe-200d-1f9b3", native: "\u{1F9D1}\u{1F3FE}\u200D\u{1F9B3}" }, { unified: "1f9d1-1f3ff-200d-1f9b3", native: "\u{1F9D1}\u{1F3FF}\u200D\u{1F9B3}" }], version: 12.1 }, bald_woman: { id: "bald_woman", name: "Woman: Bald", keywords: ["woman", "hairless"], skins: [{ unified: "1f469-200d-1f9b2", native: "\u{1F469}\u200D\u{1F9B2}" }, { unified: "1f469-1f3fb-200d-1f9b2", native: "\u{1F469}\u{1F3FB}\u200D\u{1F9B2}" }, { unified: "1f469-1f3fc-200d-1f9b2", native: "\u{1F469}\u{1F3FC}\u200D\u{1F9B2}" }, { unified: "1f469-1f3fd-200d-1f9b2", native: "\u{1F469}\u{1F3FD}\u200D\u{1F9B2}" }, { unified: "1f469-1f3fe-200d-1f9b2", native: "\u{1F469}\u{1F3FE}\u200D\u{1F9B2}" }, { unified: "1f469-1f3ff-200d-1f9b2", native: "\u{1F469}\u{1F3FF}\u200D\u{1F9B2}" }], version: 11 }, bald_person: { id: "bald_person", name: "Person: Bald", keywords: ["person", "hairless"], skins: [{ unified: "1f9d1-200d-1f9b2", native: "\u{1F9D1}\u200D\u{1F9B2}" }, { unified: "1f9d1-1f3fb-200d-1f9b2", native: "\u{1F9D1}\u{1F3FB}\u200D\u{1F9B2}" }, { unified: "1f9d1-1f3fc-200d-1f9b2", native: "\u{1F9D1}\u{1F3FC}\u200D\u{1F9B2}" }, { unified: "1f9d1-1f3fd-200d-1f9b2", native: "\u{1F9D1}\u{1F3FD}\u200D\u{1F9B2}" }, { unified: "1f9d1-1f3fe-200d-1f9b2", native: "\u{1F9D1}\u{1F3FE}\u200D\u{1F9B2}" }, { unified: "1f9d1-1f3ff-200d-1f9b2", native: "\u{1F9D1}\u{1F3FF}\u200D\u{1F9B2}" }], version: 12.1 }, "blond-haired-woman": { id: "blond-haired-woman", name: "Woman: Blond Hair", keywords: ["haired-woman", "woman", "female", "girl", "blonde", "person"], skins: [{ unified: "1f471-200d-2640-fe0f", native: "\u{1F471}\u200D\u2640\uFE0F" }, { unified: "1f471-1f3fb-200d-2640-fe0f", native: "\u{1F471}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f471-1f3fc-200d-2640-fe0f", native: "\u{1F471}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f471-1f3fd-200d-2640-fe0f", native: "\u{1F471}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f471-1f3fe-200d-2640-fe0f", native: "\u{1F471}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f471-1f3ff-200d-2640-fe0f", native: "\u{1F471}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, "blond-haired-man": { id: "blond-haired-man", name: "Man: Blond Hair", keywords: ["haired-man", "man", "male", "boy", "blonde", "guy", "person"], skins: [{ unified: "1f471-200d-2642-fe0f", native: "\u{1F471}\u200D\u2642\uFE0F" }, { unified: "1f471-1f3fb-200d-2642-fe0f", native: "\u{1F471}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f471-1f3fc-200d-2642-fe0f", native: "\u{1F471}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f471-1f3fd-200d-2642-fe0f", native: "\u{1F471}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f471-1f3fe-200d-2642-fe0f", native: "\u{1F471}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f471-1f3ff-200d-2642-fe0f", native: "\u{1F471}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, older_adult: { id: "older_adult", name: "Older Adult", keywords: ["person", "human", "elder", "senior", "gender", "neutral"], skins: [{ unified: "1f9d3", native: "\u{1F9D3}" }, { unified: "1f9d3-1f3fb", native: "\u{1F9D3}\u{1F3FB}" }, { unified: "1f9d3-1f3fc", native: "\u{1F9D3}\u{1F3FC}" }, { unified: "1f9d3-1f3fd", native: "\u{1F9D3}\u{1F3FD}" }, { unified: "1f9d3-1f3fe", native: "\u{1F9D3}\u{1F3FE}" }, { unified: "1f9d3-1f3ff", native: "\u{1F9D3}\u{1F3FF}" }], version: 5 }, older_man: { id: "older_man", name: "Old Man", keywords: ["older", "human", "male", "men", "elder", "senior"], skins: [{ unified: "1f474", native: "\u{1F474}" }, { unified: "1f474-1f3fb", native: "\u{1F474}\u{1F3FB}" }, { unified: "1f474-1f3fc", native: "\u{1F474}\u{1F3FC}" }, { unified: "1f474-1f3fd", native: "\u{1F474}\u{1F3FD}" }, { unified: "1f474-1f3fe", native: "\u{1F474}\u{1F3FE}" }, { unified: "1f474-1f3ff", native: "\u{1F474}\u{1F3FF}" }], version: 1 }, older_woman: { id: "older_woman", name: "Old Woman", keywords: ["older", "human", "female", "women", "lady", "elder", "senior"], skins: [{ unified: "1f475", native: "\u{1F475}" }, { unified: "1f475-1f3fb", native: "\u{1F475}\u{1F3FB}" }, { unified: "1f475-1f3fc", native: "\u{1F475}\u{1F3FC}" }, { unified: "1f475-1f3fd", native: "\u{1F475}\u{1F3FD}" }, { unified: "1f475-1f3fe", native: "\u{1F475}\u{1F3FE}" }, { unified: "1f475-1f3ff", native: "\u{1F475}\u{1F3FF}" }], version: 1 }, person_frowning: { id: "person_frowning", name: "Person Frowning", keywords: ["worried"], skins: [{ unified: "1f64d", native: "\u{1F64D}" }, { unified: "1f64d-1f3fb", native: "\u{1F64D}\u{1F3FB}" }, { unified: "1f64d-1f3fc", native: "\u{1F64D}\u{1F3FC}" }, { unified: "1f64d-1f3fd", native: "\u{1F64D}\u{1F3FD}" }, { unified: "1f64d-1f3fe", native: "\u{1F64D}\u{1F3FE}" }, { unified: "1f64d-1f3ff", native: "\u{1F64D}\u{1F3FF}" }], version: 1 }, "man-frowning": { id: "man-frowning", name: "Man Frowning", keywords: ["male", "boy", "sad", "depressed", "discouraged", "unhappy"], skins: [{ unified: "1f64d-200d-2642-fe0f", native: "\u{1F64D}\u200D\u2642\uFE0F" }, { unified: "1f64d-1f3fb-200d-2642-fe0f", native: "\u{1F64D}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f64d-1f3fc-200d-2642-fe0f", native: "\u{1F64D}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f64d-1f3fd-200d-2642-fe0f", native: "\u{1F64D}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f64d-1f3fe-200d-2642-fe0f", native: "\u{1F64D}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f64d-1f3ff-200d-2642-fe0f", native: "\u{1F64D}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-frowning": { id: "woman-frowning", name: "Woman Frowning", keywords: ["female", "girl", "sad", "depressed", "discouraged", "unhappy"], skins: [{ unified: "1f64d-200d-2640-fe0f", native: "\u{1F64D}\u200D\u2640\uFE0F" }, { unified: "1f64d-1f3fb-200d-2640-fe0f", native: "\u{1F64D}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f64d-1f3fc-200d-2640-fe0f", native: "\u{1F64D}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f64d-1f3fd-200d-2640-fe0f", native: "\u{1F64D}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f64d-1f3fe-200d-2640-fe0f", native: "\u{1F64D}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f64d-1f3ff-200d-2640-fe0f", native: "\u{1F64D}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, person_with_pouting_face: { id: "person_with_pouting_face", name: "Person Pouting", keywords: ["with", "face", "upset"], skins: [{ unified: "1f64e", native: "\u{1F64E}" }, { unified: "1f64e-1f3fb", native: "\u{1F64E}\u{1F3FB}" }, { unified: "1f64e-1f3fc", native: "\u{1F64E}\u{1F3FC}" }, { unified: "1f64e-1f3fd", native: "\u{1F64E}\u{1F3FD}" }, { unified: "1f64e-1f3fe", native: "\u{1F64E}\u{1F3FE}" }, { unified: "1f64e-1f3ff", native: "\u{1F64E}\u{1F3FF}" }], version: 1 }, "man-pouting": { id: "man-pouting", name: "Man Pouting", keywords: ["male", "boy"], skins: [{ unified: "1f64e-200d-2642-fe0f", native: "\u{1F64E}\u200D\u2642\uFE0F" }, { unified: "1f64e-1f3fb-200d-2642-fe0f", native: "\u{1F64E}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f64e-1f3fc-200d-2642-fe0f", native: "\u{1F64E}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f64e-1f3fd-200d-2642-fe0f", native: "\u{1F64E}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f64e-1f3fe-200d-2642-fe0f", native: "\u{1F64E}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f64e-1f3ff-200d-2642-fe0f", native: "\u{1F64E}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-pouting": { id: "woman-pouting", name: "Woman Pouting", keywords: ["female", "girl"], skins: [{ unified: "1f64e-200d-2640-fe0f", native: "\u{1F64E}\u200D\u2640\uFE0F" }, { unified: "1f64e-1f3fb-200d-2640-fe0f", native: "\u{1F64E}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f64e-1f3fc-200d-2640-fe0f", native: "\u{1F64E}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f64e-1f3fd-200d-2640-fe0f", native: "\u{1F64E}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f64e-1f3fe-200d-2640-fe0f", native: "\u{1F64E}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f64e-1f3ff-200d-2640-fe0f", native: "\u{1F64E}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, no_good: { id: "no_good", name: "Person Gesturing No", keywords: ["good", "decline"], skins: [{ unified: "1f645", native: "\u{1F645}" }, { unified: "1f645-1f3fb", native: "\u{1F645}\u{1F3FB}" }, { unified: "1f645-1f3fc", native: "\u{1F645}\u{1F3FC}" }, { unified: "1f645-1f3fd", native: "\u{1F645}\u{1F3FD}" }, { unified: "1f645-1f3fe", native: "\u{1F645}\u{1F3FE}" }, { unified: "1f645-1f3ff", native: "\u{1F645}\u{1F3FF}" }], version: 1 }, "man-gesturing-no": { id: "man-gesturing-no", name: "Man Gesturing No", keywords: ["gesturing-no", "male", "boy", "nope"], skins: [{ unified: "1f645-200d-2642-fe0f", native: "\u{1F645}\u200D\u2642\uFE0F" }, { unified: "1f645-1f3fb-200d-2642-fe0f", native: "\u{1F645}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f645-1f3fc-200d-2642-fe0f", native: "\u{1F645}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f645-1f3fd-200d-2642-fe0f", native: "\u{1F645}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f645-1f3fe-200d-2642-fe0f", native: "\u{1F645}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f645-1f3ff-200d-2642-fe0f", native: "\u{1F645}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-gesturing-no": { id: "woman-gesturing-no", name: "Woman Gesturing No", keywords: ["gesturing-no", "female", "girl", "nope"], skins: [{ unified: "1f645-200d-2640-fe0f", native: "\u{1F645}\u200D\u2640\uFE0F" }, { unified: "1f645-1f3fb-200d-2640-fe0f", native: "\u{1F645}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f645-1f3fc-200d-2640-fe0f", native: "\u{1F645}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f645-1f3fd-200d-2640-fe0f", native: "\u{1F645}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f645-1f3fe-200d-2640-fe0f", native: "\u{1F645}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f645-1f3ff-200d-2640-fe0f", native: "\u{1F645}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, ok_woman: { id: "ok_woman", name: "Person Gesturing Ok", keywords: ["woman", "agree"], skins: [{ unified: "1f646", native: "\u{1F646}" }, { unified: "1f646-1f3fb", native: "\u{1F646}\u{1F3FB}" }, { unified: "1f646-1f3fc", native: "\u{1F646}\u{1F3FC}" }, { unified: "1f646-1f3fd", native: "\u{1F646}\u{1F3FD}" }, { unified: "1f646-1f3fe", native: "\u{1F646}\u{1F3FE}" }, { unified: "1f646-1f3ff", native: "\u{1F646}\u{1F3FF}" }], version: 1 }, "man-gesturing-ok": { id: "man-gesturing-ok", name: "Man Gesturing Ok", keywords: ["gesturing-ok", "men", "boy", "male", "blue", "human"], skins: [{ unified: "1f646-200d-2642-fe0f", native: "\u{1F646}\u200D\u2642\uFE0F" }, { unified: "1f646-1f3fb-200d-2642-fe0f", native: "\u{1F646}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f646-1f3fc-200d-2642-fe0f", native: "\u{1F646}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f646-1f3fd-200d-2642-fe0f", native: "\u{1F646}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f646-1f3fe-200d-2642-fe0f", native: "\u{1F646}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f646-1f3ff-200d-2642-fe0f", native: "\u{1F646}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-gesturing-ok": { id: "woman-gesturing-ok", name: "Woman Gesturing Ok", keywords: ["gesturing-ok", "women", "girl", "female", "pink", "human"], skins: [{ unified: "1f646-200d-2640-fe0f", native: "\u{1F646}\u200D\u2640\uFE0F" }, { unified: "1f646-1f3fb-200d-2640-fe0f", native: "\u{1F646}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f646-1f3fc-200d-2640-fe0f", native: "\u{1F646}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f646-1f3fd-200d-2640-fe0f", native: "\u{1F646}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f646-1f3fe-200d-2640-fe0f", native: "\u{1F646}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f646-1f3ff-200d-2640-fe0f", native: "\u{1F646}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, information_desk_person: { id: "information_desk_person", name: "Person Tipping Hand", keywords: ["information", "desk"], skins: [{ unified: "1f481", native: "\u{1F481}" }, { unified: "1f481-1f3fb", native: "\u{1F481}\u{1F3FB}" }, { unified: "1f481-1f3fc", native: "\u{1F481}\u{1F3FC}" }, { unified: "1f481-1f3fd", native: "\u{1F481}\u{1F3FD}" }, { unified: "1f481-1f3fe", native: "\u{1F481}\u{1F3FE}" }, { unified: "1f481-1f3ff", native: "\u{1F481}\u{1F3FF}" }], version: 1 }, "man-tipping-hand": { id: "man-tipping-hand", name: "Man Tipping Hand", keywords: ["tipping-hand", "male", "boy", "human", "information"], skins: [{ unified: "1f481-200d-2642-fe0f", native: "\u{1F481}\u200D\u2642\uFE0F" }, { unified: "1f481-1f3fb-200d-2642-fe0f", native: "\u{1F481}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f481-1f3fc-200d-2642-fe0f", native: "\u{1F481}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f481-1f3fd-200d-2642-fe0f", native: "\u{1F481}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f481-1f3fe-200d-2642-fe0f", native: "\u{1F481}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f481-1f3ff-200d-2642-fe0f", native: "\u{1F481}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-tipping-hand": { id: "woman-tipping-hand", name: "Woman Tipping Hand", keywords: ["tipping-hand", "female", "girl", "human", "information"], skins: [{ unified: "1f481-200d-2640-fe0f", native: "\u{1F481}\u200D\u2640\uFE0F" }, { unified: "1f481-1f3fb-200d-2640-fe0f", native: "\u{1F481}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f481-1f3fc-200d-2640-fe0f", native: "\u{1F481}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f481-1f3fd-200d-2640-fe0f", native: "\u{1F481}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f481-1f3fe-200d-2640-fe0f", native: "\u{1F481}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f481-1f3ff-200d-2640-fe0f", native: "\u{1F481}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, raising_hand: { id: "raising_hand", name: "Person Raising Hand", keywords: ["question"], skins: [{ unified: "1f64b", native: "\u{1F64B}" }, { unified: "1f64b-1f3fb", native: "\u{1F64B}\u{1F3FB}" }, { unified: "1f64b-1f3fc", native: "\u{1F64B}\u{1F3FC}" }, { unified: "1f64b-1f3fd", native: "\u{1F64B}\u{1F3FD}" }, { unified: "1f64b-1f3fe", native: "\u{1F64B}\u{1F3FE}" }, { unified: "1f64b-1f3ff", native: "\u{1F64B}\u{1F3FF}" }], version: 1 }, "man-raising-hand": { id: "man-raising-hand", name: "Man Raising Hand", keywords: ["raising-hand", "male", "boy"], skins: [{ unified: "1f64b-200d-2642-fe0f", native: "\u{1F64B}\u200D\u2642\uFE0F" }, { unified: "1f64b-1f3fb-200d-2642-fe0f", native: "\u{1F64B}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f64b-1f3fc-200d-2642-fe0f", native: "\u{1F64B}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f64b-1f3fd-200d-2642-fe0f", native: "\u{1F64B}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f64b-1f3fe-200d-2642-fe0f", native: "\u{1F64B}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f64b-1f3ff-200d-2642-fe0f", native: "\u{1F64B}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-raising-hand": { id: "woman-raising-hand", name: "Woman Raising Hand", keywords: ["raising-hand", "female", "girl"], skins: [{ unified: "1f64b-200d-2640-fe0f", native: "\u{1F64B}\u200D\u2640\uFE0F" }, { unified: "1f64b-1f3fb-200d-2640-fe0f", native: "\u{1F64B}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f64b-1f3fc-200d-2640-fe0f", native: "\u{1F64B}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f64b-1f3fd-200d-2640-fe0f", native: "\u{1F64B}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f64b-1f3fe-200d-2640-fe0f", native: "\u{1F64B}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f64b-1f3ff-200d-2640-fe0f", native: "\u{1F64B}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, deaf_person: { id: "deaf_person", name: "Deaf Person", keywords: ["accessibility"], skins: [{ unified: "1f9cf", native: "\u{1F9CF}" }, { unified: "1f9cf-1f3fb", native: "\u{1F9CF}\u{1F3FB}" }, { unified: "1f9cf-1f3fc", native: "\u{1F9CF}\u{1F3FC}" }, { unified: "1f9cf-1f3fd", native: "\u{1F9CF}\u{1F3FD}" }, { unified: "1f9cf-1f3fe", native: "\u{1F9CF}\u{1F3FE}" }, { unified: "1f9cf-1f3ff", native: "\u{1F9CF}\u{1F3FF}" }], version: 12 }, deaf_man: { id: "deaf_man", name: "Deaf Man", keywords: ["accessibility"], skins: [{ unified: "1f9cf-200d-2642-fe0f", native: "\u{1F9CF}\u200D\u2642\uFE0F" }, { unified: "1f9cf-1f3fb-200d-2642-fe0f", native: "\u{1F9CF}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f9cf-1f3fc-200d-2642-fe0f", native: "\u{1F9CF}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f9cf-1f3fd-200d-2642-fe0f", native: "\u{1F9CF}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f9cf-1f3fe-200d-2642-fe0f", native: "\u{1F9CF}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f9cf-1f3ff-200d-2642-fe0f", native: "\u{1F9CF}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 12 }, deaf_woman: { id: "deaf_woman", name: "Deaf Woman", keywords: ["accessibility"], skins: [{ unified: "1f9cf-200d-2640-fe0f", native: "\u{1F9CF}\u200D\u2640\uFE0F" }, { unified: "1f9cf-1f3fb-200d-2640-fe0f", native: "\u{1F9CF}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f9cf-1f3fc-200d-2640-fe0f", native: "\u{1F9CF}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f9cf-1f3fd-200d-2640-fe0f", native: "\u{1F9CF}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f9cf-1f3fe-200d-2640-fe0f", native: "\u{1F9CF}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f9cf-1f3ff-200d-2640-fe0f", native: "\u{1F9CF}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 12 }, bow: { id: "bow", name: "Person Bowing", keywords: ["bow", "respectiful"], skins: [{ unified: "1f647", native: "\u{1F647}" }, { unified: "1f647-1f3fb", native: "\u{1F647}\u{1F3FB}" }, { unified: "1f647-1f3fc", native: "\u{1F647}\u{1F3FC}" }, { unified: "1f647-1f3fd", native: "\u{1F647}\u{1F3FD}" }, { unified: "1f647-1f3fe", native: "\u{1F647}\u{1F3FE}" }, { unified: "1f647-1f3ff", native: "\u{1F647}\u{1F3FF}" }], version: 1 }, "man-bowing": { id: "man-bowing", name: "Man Bowing", keywords: ["male", "boy"], skins: [{ unified: "1f647-200d-2642-fe0f", native: "\u{1F647}\u200D\u2642\uFE0F" }, { unified: "1f647-1f3fb-200d-2642-fe0f", native: "\u{1F647}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f647-1f3fc-200d-2642-fe0f", native: "\u{1F647}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f647-1f3fd-200d-2642-fe0f", native: "\u{1F647}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f647-1f3fe-200d-2642-fe0f", native: "\u{1F647}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f647-1f3ff-200d-2642-fe0f", native: "\u{1F647}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-bowing": { id: "woman-bowing", name: "Woman Bowing", keywords: ["female", "girl"], skins: [{ unified: "1f647-200d-2640-fe0f", native: "\u{1F647}\u200D\u2640\uFE0F" }, { unified: "1f647-1f3fb-200d-2640-fe0f", native: "\u{1F647}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f647-1f3fc-200d-2640-fe0f", native: "\u{1F647}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f647-1f3fd-200d-2640-fe0f", native: "\u{1F647}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f647-1f3fe-200d-2640-fe0f", native: "\u{1F647}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f647-1f3ff-200d-2640-fe0f", native: "\u{1F647}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, face_palm: { id: "face_palm", name: "Face Palm", keywords: ["person", "facepalming", "disappointed"], skins: [{ unified: "1f926", native: "\u{1F926}" }, { unified: "1f926-1f3fb", native: "\u{1F926}\u{1F3FB}" }, { unified: "1f926-1f3fc", native: "\u{1F926}\u{1F3FC}" }, { unified: "1f926-1f3fd", native: "\u{1F926}\u{1F3FD}" }, { unified: "1f926-1f3fe", native: "\u{1F926}\u{1F3FE}" }, { unified: "1f926-1f3ff", native: "\u{1F926}\u{1F3FF}" }], version: 3 }, "man-facepalming": { id: "man-facepalming", name: "Man Facepalming", keywords: ["male", "boy", "disbelief"], skins: [{ unified: "1f926-200d-2642-fe0f", native: "\u{1F926}\u200D\u2642\uFE0F" }, { unified: "1f926-1f3fb-200d-2642-fe0f", native: "\u{1F926}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f926-1f3fc-200d-2642-fe0f", native: "\u{1F926}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f926-1f3fd-200d-2642-fe0f", native: "\u{1F926}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f926-1f3fe-200d-2642-fe0f", native: "\u{1F926}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f926-1f3ff-200d-2642-fe0f", native: "\u{1F926}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-facepalming": { id: "woman-facepalming", name: "Woman Facepalming", keywords: ["female", "girl", "disbelief"], skins: [{ unified: "1f926-200d-2640-fe0f", native: "\u{1F926}\u200D\u2640\uFE0F" }, { unified: "1f926-1f3fb-200d-2640-fe0f", native: "\u{1F926}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f926-1f3fc-200d-2640-fe0f", native: "\u{1F926}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f926-1f3fd-200d-2640-fe0f", native: "\u{1F926}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f926-1f3fe-200d-2640-fe0f", native: "\u{1F926}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f926-1f3ff-200d-2640-fe0f", native: "\u{1F926}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, shrug: { id: "shrug", name: "Shrug", keywords: ["person", "shrugging", "regardless"], skins: [{ unified: "1f937", native: "\u{1F937}" }, { unified: "1f937-1f3fb", native: "\u{1F937}\u{1F3FB}" }, { unified: "1f937-1f3fc", native: "\u{1F937}\u{1F3FC}" }, { unified: "1f937-1f3fd", native: "\u{1F937}\u{1F3FD}" }, { unified: "1f937-1f3fe", native: "\u{1F937}\u{1F3FE}" }, { unified: "1f937-1f3ff", native: "\u{1F937}\u{1F3FF}" }], version: 3 }, "man-shrugging": { id: "man-shrugging", name: "Man Shrugging", keywords: ["male", "boy", "confused", "indifferent", "doubt"], skins: [{ unified: "1f937-200d-2642-fe0f", native: "\u{1F937}\u200D\u2642\uFE0F" }, { unified: "1f937-1f3fb-200d-2642-fe0f", native: "\u{1F937}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f937-1f3fc-200d-2642-fe0f", native: "\u{1F937}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f937-1f3fd-200d-2642-fe0f", native: "\u{1F937}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f937-1f3fe-200d-2642-fe0f", native: "\u{1F937}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f937-1f3ff-200d-2642-fe0f", native: "\u{1F937}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-shrugging": { id: "woman-shrugging", name: "Woman Shrugging", keywords: ["female", "girl", "confused", "indifferent", "doubt"], skins: [{ unified: "1f937-200d-2640-fe0f", native: "\u{1F937}\u200D\u2640\uFE0F" }, { unified: "1f937-1f3fb-200d-2640-fe0f", native: "\u{1F937}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f937-1f3fc-200d-2640-fe0f", native: "\u{1F937}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f937-1f3fd-200d-2640-fe0f", native: "\u{1F937}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f937-1f3fe-200d-2640-fe0f", native: "\u{1F937}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f937-1f3ff-200d-2640-fe0f", native: "\u{1F937}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, health_worker: { id: "health_worker", name: "Health Worker", keywords: ["hospital"], skins: [{ unified: "1f9d1-200d-2695-fe0f", native: "\u{1F9D1}\u200D\u2695\uFE0F" }, { unified: "1f9d1-1f3fb-200d-2695-fe0f", native: "\u{1F9D1}\u{1F3FB}\u200D\u2695\uFE0F" }, { unified: "1f9d1-1f3fc-200d-2695-fe0f", native: "\u{1F9D1}\u{1F3FC}\u200D\u2695\uFE0F" }, { unified: "1f9d1-1f3fd-200d-2695-fe0f", native: "\u{1F9D1}\u{1F3FD}\u200D\u2695\uFE0F" }, { unified: "1f9d1-1f3fe-200d-2695-fe0f", native: "\u{1F9D1}\u{1F3FE}\u200D\u2695\uFE0F" }, { unified: "1f9d1-1f3ff-200d-2695-fe0f", native: "\u{1F9D1}\u{1F3FF}\u200D\u2695\uFE0F" }], version: 12.1 }, "male-doctor": { id: "male-doctor", name: "Man Health Worker", keywords: ["male", "doctor", "nurse", "therapist", "healthcare", "human"], skins: [{ unified: "1f468-200d-2695-fe0f", native: "\u{1F468}\u200D\u2695\uFE0F" }, { unified: "1f468-1f3fb-200d-2695-fe0f", native: "\u{1F468}\u{1F3FB}\u200D\u2695\uFE0F" }, { unified: "1f468-1f3fc-200d-2695-fe0f", native: "\u{1F468}\u{1F3FC}\u200D\u2695\uFE0F" }, { unified: "1f468-1f3fd-200d-2695-fe0f", native: "\u{1F468}\u{1F3FD}\u200D\u2695\uFE0F" }, { unified: "1f468-1f3fe-200d-2695-fe0f", native: "\u{1F468}\u{1F3FE}\u200D\u2695\uFE0F" }, { unified: "1f468-1f3ff-200d-2695-fe0f", native: "\u{1F468}\u{1F3FF}\u200D\u2695\uFE0F" }], version: 4 }, "female-doctor": { id: "female-doctor", name: "Woman Health Worker", keywords: ["female", "doctor", "nurse", "therapist", "healthcare", "human"], skins: [{ unified: "1f469-200d-2695-fe0f", native: "\u{1F469}\u200D\u2695\uFE0F" }, { unified: "1f469-1f3fb-200d-2695-fe0f", native: "\u{1F469}\u{1F3FB}\u200D\u2695\uFE0F" }, { unified: "1f469-1f3fc-200d-2695-fe0f", native: "\u{1F469}\u{1F3FC}\u200D\u2695\uFE0F" }, { unified: "1f469-1f3fd-200d-2695-fe0f", native: "\u{1F469}\u{1F3FD}\u200D\u2695\uFE0F" }, { unified: "1f469-1f3fe-200d-2695-fe0f", native: "\u{1F469}\u{1F3FE}\u200D\u2695\uFE0F" }, { unified: "1f469-1f3ff-200d-2695-fe0f", native: "\u{1F469}\u{1F3FF}\u200D\u2695\uFE0F" }], version: 4 }, student: { id: "student", name: "Student", keywords: ["learn"], skins: [{ unified: "1f9d1-200d-1f393", native: "\u{1F9D1}\u200D\u{1F393}" }, { unified: "1f9d1-1f3fb-200d-1f393", native: "\u{1F9D1}\u{1F3FB}\u200D\u{1F393}" }, { unified: "1f9d1-1f3fc-200d-1f393", native: "\u{1F9D1}\u{1F3FC}\u200D\u{1F393}" }, { unified: "1f9d1-1f3fd-200d-1f393", native: "\u{1F9D1}\u{1F3FD}\u200D\u{1F393}" }, { unified: "1f9d1-1f3fe-200d-1f393", native: "\u{1F9D1}\u{1F3FE}\u200D\u{1F393}" }, { unified: "1f9d1-1f3ff-200d-1f393", native: "\u{1F9D1}\u{1F3FF}\u200D\u{1F393}" }], version: 12.1 }, "male-student": { id: "male-student", name: "Man Student", keywords: ["male", "graduate", "human"], skins: [{ unified: "1f468-200d-1f393", native: "\u{1F468}\u200D\u{1F393}" }, { unified: "1f468-1f3fb-200d-1f393", native: "\u{1F468}\u{1F3FB}\u200D\u{1F393}" }, { unified: "1f468-1f3fc-200d-1f393", native: "\u{1F468}\u{1F3FC}\u200D\u{1F393}" }, { unified: "1f468-1f3fd-200d-1f393", native: "\u{1F468}\u{1F3FD}\u200D\u{1F393}" }, { unified: "1f468-1f3fe-200d-1f393", native: "\u{1F468}\u{1F3FE}\u200D\u{1F393}" }, { unified: "1f468-1f3ff-200d-1f393", native: "\u{1F468}\u{1F3FF}\u200D\u{1F393}" }], version: 4 }, "female-student": { id: "female-student", name: "Woman Student", keywords: ["female", "graduate", "human"], skins: [{ unified: "1f469-200d-1f393", native: "\u{1F469}\u200D\u{1F393}" }, { unified: "1f469-1f3fb-200d-1f393", native: "\u{1F469}\u{1F3FB}\u200D\u{1F393}" }, { unified: "1f469-1f3fc-200d-1f393", native: "\u{1F469}\u{1F3FC}\u200D\u{1F393}" }, { unified: "1f469-1f3fd-200d-1f393", native: "\u{1F469}\u{1F3FD}\u200D\u{1F393}" }, { unified: "1f469-1f3fe-200d-1f393", native: "\u{1F469}\u{1F3FE}\u200D\u{1F393}" }, { unified: "1f469-1f3ff-200d-1f393", native: "\u{1F469}\u{1F3FF}\u200D\u{1F393}" }], version: 4 }, teacher: { id: "teacher", name: "Teacher", keywords: ["professor"], skins: [{ unified: "1f9d1-200d-1f3eb", native: "\u{1F9D1}\u200D\u{1F3EB}" }, { unified: "1f9d1-1f3fb-200d-1f3eb", native: "\u{1F9D1}\u{1F3FB}\u200D\u{1F3EB}" }, { unified: "1f9d1-1f3fc-200d-1f3eb", native: "\u{1F9D1}\u{1F3FC}\u200D\u{1F3EB}" }, { unified: "1f9d1-1f3fd-200d-1f3eb", native: "\u{1F9D1}\u{1F3FD}\u200D\u{1F3EB}" }, { unified: "1f9d1-1f3fe-200d-1f3eb", native: "\u{1F9D1}\u{1F3FE}\u200D\u{1F3EB}" }, { unified: "1f9d1-1f3ff-200d-1f3eb", native: "\u{1F9D1}\u{1F3FF}\u200D\u{1F3EB}" }], version: 12.1 }, "male-teacher": { id: "male-teacher", name: "Man Teacher", keywords: ["male", "instructor", "professor", "human"], skins: [{ unified: "1f468-200d-1f3eb", native: "\u{1F468}\u200D\u{1F3EB}" }, { unified: "1f468-1f3fb-200d-1f3eb", native: "\u{1F468}\u{1F3FB}\u200D\u{1F3EB}" }, { unified: "1f468-1f3fc-200d-1f3eb", native: "\u{1F468}\u{1F3FC}\u200D\u{1F3EB}" }, { unified: "1f468-1f3fd-200d-1f3eb", native: "\u{1F468}\u{1F3FD}\u200D\u{1F3EB}" }, { unified: "1f468-1f3fe-200d-1f3eb", native: "\u{1F468}\u{1F3FE}\u200D\u{1F3EB}" }, { unified: "1f468-1f3ff-200d-1f3eb", native: "\u{1F468}\u{1F3FF}\u200D\u{1F3EB}" }], version: 4 }, "female-teacher": { id: "female-teacher", name: "Woman Teacher", keywords: ["female", "instructor", "professor", "human"], skins: [{ unified: "1f469-200d-1f3eb", native: "\u{1F469}\u200D\u{1F3EB}" }, { unified: "1f469-1f3fb-200d-1f3eb", native: "\u{1F469}\u{1F3FB}\u200D\u{1F3EB}" }, { unified: "1f469-1f3fc-200d-1f3eb", native: "\u{1F469}\u{1F3FC}\u200D\u{1F3EB}" }, { unified: "1f469-1f3fd-200d-1f3eb", native: "\u{1F469}\u{1F3FD}\u200D\u{1F3EB}" }, { unified: "1f469-1f3fe-200d-1f3eb", native: "\u{1F469}\u{1F3FE}\u200D\u{1F3EB}" }, { unified: "1f469-1f3ff-200d-1f3eb", native: "\u{1F469}\u{1F3FF}\u200D\u{1F3EB}" }], version: 4 }, judge: { id: "judge", name: "Judge", keywords: ["law"], skins: [{ unified: "1f9d1-200d-2696-fe0f", native: "\u{1F9D1}\u200D\u2696\uFE0F" }, { unified: "1f9d1-1f3fb-200d-2696-fe0f", native: "\u{1F9D1}\u{1F3FB}\u200D\u2696\uFE0F" }, { unified: "1f9d1-1f3fc-200d-2696-fe0f", native: "\u{1F9D1}\u{1F3FC}\u200D\u2696\uFE0F" }, { unified: "1f9d1-1f3fd-200d-2696-fe0f", native: "\u{1F9D1}\u{1F3FD}\u200D\u2696\uFE0F" }, { unified: "1f9d1-1f3fe-200d-2696-fe0f", native: "\u{1F9D1}\u{1F3FE}\u200D\u2696\uFE0F" }, { unified: "1f9d1-1f3ff-200d-2696-fe0f", native: "\u{1F9D1}\u{1F3FF}\u200D\u2696\uFE0F" }], version: 12.1 }, "male-judge": { id: "male-judge", name: "Man Judge", keywords: ["male", "justice", "court", "human"], skins: [{ unified: "1f468-200d-2696-fe0f", native: "\u{1F468}\u200D\u2696\uFE0F" }, { unified: "1f468-1f3fb-200d-2696-fe0f", native: "\u{1F468}\u{1F3FB}\u200D\u2696\uFE0F" }, { unified: "1f468-1f3fc-200d-2696-fe0f", native: "\u{1F468}\u{1F3FC}\u200D\u2696\uFE0F" }, { unified: "1f468-1f3fd-200d-2696-fe0f", native: "\u{1F468}\u{1F3FD}\u200D\u2696\uFE0F" }, { unified: "1f468-1f3fe-200d-2696-fe0f", native: "\u{1F468}\u{1F3FE}\u200D\u2696\uFE0F" }, { unified: "1f468-1f3ff-200d-2696-fe0f", native: "\u{1F468}\u{1F3FF}\u200D\u2696\uFE0F" }], version: 4 }, "female-judge": { id: "female-judge", name: "Woman Judge", keywords: ["female", "justice", "court", "human"], skins: [{ unified: "1f469-200d-2696-fe0f", native: "\u{1F469}\u200D\u2696\uFE0F" }, { unified: "1f469-1f3fb-200d-2696-fe0f", native: "\u{1F469}\u{1F3FB}\u200D\u2696\uFE0F" }, { unified: "1f469-1f3fc-200d-2696-fe0f", native: "\u{1F469}\u{1F3FC}\u200D\u2696\uFE0F" }, { unified: "1f469-1f3fd-200d-2696-fe0f", native: "\u{1F469}\u{1F3FD}\u200D\u2696\uFE0F" }, { unified: "1f469-1f3fe-200d-2696-fe0f", native: "\u{1F469}\u{1F3FE}\u200D\u2696\uFE0F" }, { unified: "1f469-1f3ff-200d-2696-fe0f", native: "\u{1F469}\u{1F3FF}\u200D\u2696\uFE0F" }], version: 4 }, farmer: { id: "farmer", name: "Farmer", keywords: ["crops"], skins: [{ unified: "1f9d1-200d-1f33e", native: "\u{1F9D1}\u200D\u{1F33E}" }, { unified: "1f9d1-1f3fb-200d-1f33e", native: "\u{1F9D1}\u{1F3FB}\u200D\u{1F33E}" }, { unified: "1f9d1-1f3fc-200d-1f33e", native: "\u{1F9D1}\u{1F3FC}\u200D\u{1F33E}" }, { unified: "1f9d1-1f3fd-200d-1f33e", native: "\u{1F9D1}\u{1F3FD}\u200D\u{1F33E}" }, { unified: "1f9d1-1f3fe-200d-1f33e", native: "\u{1F9D1}\u{1F3FE}\u200D\u{1F33E}" }, { unified: "1f9d1-1f3ff-200d-1f33e", native: "\u{1F9D1}\u{1F3FF}\u200D\u{1F33E}" }], version: 12.1 }, "male-farmer": { id: "male-farmer", name: "Man Farmer", keywords: ["male", "rancher", "gardener", "human"], skins: [{ unified: "1f468-200d-1f33e", native: "\u{1F468}\u200D\u{1F33E}" }, { unified: "1f468-1f3fb-200d-1f33e", native: "\u{1F468}\u{1F3FB}\u200D\u{1F33E}" }, { unified: "1f468-1f3fc-200d-1f33e", native: "\u{1F468}\u{1F3FC}\u200D\u{1F33E}" }, { unified: "1f468-1f3fd-200d-1f33e", native: "\u{1F468}\u{1F3FD}\u200D\u{1F33E}" }, { unified: "1f468-1f3fe-200d-1f33e", native: "\u{1F468}\u{1F3FE}\u200D\u{1F33E}" }, { unified: "1f468-1f3ff-200d-1f33e", native: "\u{1F468}\u{1F3FF}\u200D\u{1F33E}" }], version: 4 }, "female-farmer": { id: "female-farmer", name: "Woman Farmer", keywords: ["female", "rancher", "gardener", "human"], skins: [{ unified: "1f469-200d-1f33e", native: "\u{1F469}\u200D\u{1F33E}" }, { unified: "1f469-1f3fb-200d-1f33e", native: "\u{1F469}\u{1F3FB}\u200D\u{1F33E}" }, { unified: "1f469-1f3fc-200d-1f33e", native: "\u{1F469}\u{1F3FC}\u200D\u{1F33E}" }, { unified: "1f469-1f3fd-200d-1f33e", native: "\u{1F469}\u{1F3FD}\u200D\u{1F33E}" }, { unified: "1f469-1f3fe-200d-1f33e", native: "\u{1F469}\u{1F3FE}\u200D\u{1F33E}" }, { unified: "1f469-1f3ff-200d-1f33e", native: "\u{1F469}\u{1F3FF}\u200D\u{1F33E}" }], version: 4 }, cook: { id: "cook", name: "Cook", keywords: ["food", "kitchen", "culinary"], skins: [{ unified: "1f9d1-200d-1f373", native: "\u{1F9D1}\u200D\u{1F373}" }, { unified: "1f9d1-1f3fb-200d-1f373", native: "\u{1F9D1}\u{1F3FB}\u200D\u{1F373}" }, { unified: "1f9d1-1f3fc-200d-1f373", native: "\u{1F9D1}\u{1F3FC}\u200D\u{1F373}" }, { unified: "1f9d1-1f3fd-200d-1f373", native: "\u{1F9D1}\u{1F3FD}\u200D\u{1F373}" }, { unified: "1f9d1-1f3fe-200d-1f373", native: "\u{1F9D1}\u{1F3FE}\u200D\u{1F373}" }, { unified: "1f9d1-1f3ff-200d-1f373", native: "\u{1F9D1}\u{1F3FF}\u200D\u{1F373}" }], version: 12.1 }, "male-cook": { id: "male-cook", name: "Man Cook", keywords: ["male", "chef", "human"], skins: [{ unified: "1f468-200d-1f373", native: "\u{1F468}\u200D\u{1F373}" }, { unified: "1f468-1f3fb-200d-1f373", native: "\u{1F468}\u{1F3FB}\u200D\u{1F373}" }, { unified: "1f468-1f3fc-200d-1f373", native: "\u{1F468}\u{1F3FC}\u200D\u{1F373}" }, { unified: "1f468-1f3fd-200d-1f373", native: "\u{1F468}\u{1F3FD}\u200D\u{1F373}" }, { unified: "1f468-1f3fe-200d-1f373", native: "\u{1F468}\u{1F3FE}\u200D\u{1F373}" }, { unified: "1f468-1f3ff-200d-1f373", native: "\u{1F468}\u{1F3FF}\u200D\u{1F373}" }], version: 4 }, "female-cook": { id: "female-cook", name: "Woman Cook", keywords: ["female", "chef", "human"], skins: [{ unified: "1f469-200d-1f373", native: "\u{1F469}\u200D\u{1F373}" }, { unified: "1f469-1f3fb-200d-1f373", native: "\u{1F469}\u{1F3FB}\u200D\u{1F373}" }, { unified: "1f469-1f3fc-200d-1f373", native: "\u{1F469}\u{1F3FC}\u200D\u{1F373}" }, { unified: "1f469-1f3fd-200d-1f373", native: "\u{1F469}\u{1F3FD}\u200D\u{1F373}" }, { unified: "1f469-1f3fe-200d-1f373", native: "\u{1F469}\u{1F3FE}\u200D\u{1F373}" }, { unified: "1f469-1f3ff-200d-1f373", native: "\u{1F469}\u{1F3FF}\u200D\u{1F373}" }], version: 4 }, mechanic: { id: "mechanic", name: "Mechanic", keywords: ["worker", "technician"], skins: [{ unified: "1f9d1-200d-1f527", native: "\u{1F9D1}\u200D\u{1F527}" }, { unified: "1f9d1-1f3fb-200d-1f527", native: "\u{1F9D1}\u{1F3FB}\u200D\u{1F527}" }, { unified: "1f9d1-1f3fc-200d-1f527", native: "\u{1F9D1}\u{1F3FC}\u200D\u{1F527}" }, { unified: "1f9d1-1f3fd-200d-1f527", native: "\u{1F9D1}\u{1F3FD}\u200D\u{1F527}" }, { unified: "1f9d1-1f3fe-200d-1f527", native: "\u{1F9D1}\u{1F3FE}\u200D\u{1F527}" }, { unified: "1f9d1-1f3ff-200d-1f527", native: "\u{1F9D1}\u{1F3FF}\u200D\u{1F527}" }], version: 12.1 }, "male-mechanic": { id: "male-mechanic", name: "Man Mechanic", keywords: ["male", "plumber", "human", "wrench"], skins: [{ unified: "1f468-200d-1f527", native: "\u{1F468}\u200D\u{1F527}" }, { unified: "1f468-1f3fb-200d-1f527", native: "\u{1F468}\u{1F3FB}\u200D\u{1F527}" }, { unified: "1f468-1f3fc-200d-1f527", native: "\u{1F468}\u{1F3FC}\u200D\u{1F527}" }, { unified: "1f468-1f3fd-200d-1f527", native: "\u{1F468}\u{1F3FD}\u200D\u{1F527}" }, { unified: "1f468-1f3fe-200d-1f527", native: "\u{1F468}\u{1F3FE}\u200D\u{1F527}" }, { unified: "1f468-1f3ff-200d-1f527", native: "\u{1F468}\u{1F3FF}\u200D\u{1F527}" }], version: 4 }, "female-mechanic": { id: "female-mechanic", name: "Woman Mechanic", keywords: ["female", "plumber", "human", "wrench"], skins: [{ unified: "1f469-200d-1f527", native: "\u{1F469}\u200D\u{1F527}" }, { unified: "1f469-1f3fb-200d-1f527", native: "\u{1F469}\u{1F3FB}\u200D\u{1F527}" }, { unified: "1f469-1f3fc-200d-1f527", native: "\u{1F469}\u{1F3FC}\u200D\u{1F527}" }, { unified: "1f469-1f3fd-200d-1f527", native: "\u{1F469}\u{1F3FD}\u200D\u{1F527}" }, { unified: "1f469-1f3fe-200d-1f527", native: "\u{1F469}\u{1F3FE}\u200D\u{1F527}" }, { unified: "1f469-1f3ff-200d-1f527", native: "\u{1F469}\u{1F3FF}\u200D\u{1F527}" }], version: 4 }, factory_worker: { id: "factory_worker", name: "Factory Worker", keywords: ["labor"], skins: [{ unified: "1f9d1-200d-1f3ed", native: "\u{1F9D1}\u200D\u{1F3ED}" }, { unified: "1f9d1-1f3fb-200d-1f3ed", native: "\u{1F9D1}\u{1F3FB}\u200D\u{1F3ED}" }, { unified: "1f9d1-1f3fc-200d-1f3ed", native: "\u{1F9D1}\u{1F3FC}\u200D\u{1F3ED}" }, { unified: "1f9d1-1f3fd-200d-1f3ed", native: "\u{1F9D1}\u{1F3FD}\u200D\u{1F3ED}" }, { unified: "1f9d1-1f3fe-200d-1f3ed", native: "\u{1F9D1}\u{1F3FE}\u200D\u{1F3ED}" }, { unified: "1f9d1-1f3ff-200d-1f3ed", native: "\u{1F9D1}\u{1F3FF}\u200D\u{1F3ED}" }], version: 12.1 }, "male-factory-worker": { id: "male-factory-worker", name: "Man Factory Worker", keywords: ["male", "factory-worker", "assembly", "industrial", "human"], skins: [{ unified: "1f468-200d-1f3ed", native: "\u{1F468}\u200D\u{1F3ED}" }, { unified: "1f468-1f3fb-200d-1f3ed", native: "\u{1F468}\u{1F3FB}\u200D\u{1F3ED}" }, { unified: "1f468-1f3fc-200d-1f3ed", native: "\u{1F468}\u{1F3FC}\u200D\u{1F3ED}" }, { unified: "1f468-1f3fd-200d-1f3ed", native: "\u{1F468}\u{1F3FD}\u200D\u{1F3ED}" }, { unified: "1f468-1f3fe-200d-1f3ed", native: "\u{1F468}\u{1F3FE}\u200D\u{1F3ED}" }, { unified: "1f468-1f3ff-200d-1f3ed", native: "\u{1F468}\u{1F3FF}\u200D\u{1F3ED}" }], version: 4 }, "female-factory-worker": { id: "female-factory-worker", name: "Woman Factory Worker", keywords: ["female", "factory-worker", "assembly", "industrial", "human"], skins: [{ unified: "1f469-200d-1f3ed", native: "\u{1F469}\u200D\u{1F3ED}" }, { unified: "1f469-1f3fb-200d-1f3ed", native: "\u{1F469}\u{1F3FB}\u200D\u{1F3ED}" }, { unified: "1f469-1f3fc-200d-1f3ed", native: "\u{1F469}\u{1F3FC}\u200D\u{1F3ED}" }, { unified: "1f469-1f3fd-200d-1f3ed", native: "\u{1F469}\u{1F3FD}\u200D\u{1F3ED}" }, { unified: "1f469-1f3fe-200d-1f3ed", native: "\u{1F469}\u{1F3FE}\u200D\u{1F3ED}" }, { unified: "1f469-1f3ff-200d-1f3ed", native: "\u{1F469}\u{1F3FF}\u200D\u{1F3ED}" }], version: 4 }, office_worker: { id: "office_worker", name: "Office Worker", keywords: ["business"], skins: [{ unified: "1f9d1-200d-1f4bc", native: "\u{1F9D1}\u200D\u{1F4BC}" }, { unified: "1f9d1-1f3fb-200d-1f4bc", native: "\u{1F9D1}\u{1F3FB}\u200D\u{1F4BC}" }, { unified: "1f9d1-1f3fc-200d-1f4bc", native: "\u{1F9D1}\u{1F3FC}\u200D\u{1F4BC}" }, { unified: "1f9d1-1f3fd-200d-1f4bc", native: "\u{1F9D1}\u{1F3FD}\u200D\u{1F4BC}" }, { unified: "1f9d1-1f3fe-200d-1f4bc", native: "\u{1F9D1}\u{1F3FE}\u200D\u{1F4BC}" }, { unified: "1f9d1-1f3ff-200d-1f4bc", native: "\u{1F9D1}\u{1F3FF}\u200D\u{1F4BC}" }], version: 12.1 }, "male-office-worker": { id: "male-office-worker", name: "Man Office Worker", keywords: ["male", "office-worker", "business", "manager", "human"], skins: [{ unified: "1f468-200d-1f4bc", native: "\u{1F468}\u200D\u{1F4BC}" }, { unified: "1f468-1f3fb-200d-1f4bc", native: "\u{1F468}\u{1F3FB}\u200D\u{1F4BC}" }, { unified: "1f468-1f3fc-200d-1f4bc", native: "\u{1F468}\u{1F3FC}\u200D\u{1F4BC}" }, { unified: "1f468-1f3fd-200d-1f4bc", native: "\u{1F468}\u{1F3FD}\u200D\u{1F4BC}" }, { unified: "1f468-1f3fe-200d-1f4bc", native: "\u{1F468}\u{1F3FE}\u200D\u{1F4BC}" }, { unified: "1f468-1f3ff-200d-1f4bc", native: "\u{1F468}\u{1F3FF}\u200D\u{1F4BC}" }], version: 4 }, "female-office-worker": { id: "female-office-worker", name: "Woman Office Worker", keywords: ["female", "office-worker", "business", "manager", "human"], skins: [{ unified: "1f469-200d-1f4bc", native: "\u{1F469}\u200D\u{1F4BC}" }, { unified: "1f469-1f3fb-200d-1f4bc", native: "\u{1F469}\u{1F3FB}\u200D\u{1F4BC}" }, { unified: "1f469-1f3fc-200d-1f4bc", native: "\u{1F469}\u{1F3FC}\u200D\u{1F4BC}" }, { unified: "1f469-1f3fd-200d-1f4bc", native: "\u{1F469}\u{1F3FD}\u200D\u{1F4BC}" }, { unified: "1f469-1f3fe-200d-1f4bc", native: "\u{1F469}\u{1F3FE}\u200D\u{1F4BC}" }, { unified: "1f469-1f3ff-200d-1f4bc", native: "\u{1F469}\u{1F3FF}\u200D\u{1F4BC}" }], version: 4 }, scientist: { id: "scientist", name: "Scientist", keywords: ["chemistry"], skins: [{ unified: "1f9d1-200d-1f52c", native: "\u{1F9D1}\u200D\u{1F52C}" }, { unified: "1f9d1-1f3fb-200d-1f52c", native: "\u{1F9D1}\u{1F3FB}\u200D\u{1F52C}" }, { unified: "1f9d1-1f3fc-200d-1f52c", native: "\u{1F9D1}\u{1F3FC}\u200D\u{1F52C}" }, { unified: "1f9d1-1f3fd-200d-1f52c", native: "\u{1F9D1}\u{1F3FD}\u200D\u{1F52C}" }, { unified: "1f9d1-1f3fe-200d-1f52c", native: "\u{1F9D1}\u{1F3FE}\u200D\u{1F52C}" }, { unified: "1f9d1-1f3ff-200d-1f52c", native: "\u{1F9D1}\u{1F3FF}\u200D\u{1F52C}" }], version: 12.1 }, "male-scientist": { id: "male-scientist", name: "Man Scientist", keywords: ["male", "biologist", "chemist", "engineer", "physicist", "human"], skins: [{ unified: "1f468-200d-1f52c", native: "\u{1F468}\u200D\u{1F52C}" }, { unified: "1f468-1f3fb-200d-1f52c", native: "\u{1F468}\u{1F3FB}\u200D\u{1F52C}" }, { unified: "1f468-1f3fc-200d-1f52c", native: "\u{1F468}\u{1F3FC}\u200D\u{1F52C}" }, { unified: "1f468-1f3fd-200d-1f52c", native: "\u{1F468}\u{1F3FD}\u200D\u{1F52C}" }, { unified: "1f468-1f3fe-200d-1f52c", native: "\u{1F468}\u{1F3FE}\u200D\u{1F52C}" }, { unified: "1f468-1f3ff-200d-1f52c", native: "\u{1F468}\u{1F3FF}\u200D\u{1F52C}" }], version: 4 }, "female-scientist": { id: "female-scientist", name: "Woman Scientist", keywords: ["female", "biologist", "chemist", "engineer", "physicist", "human"], skins: [{ unified: "1f469-200d-1f52c", native: "\u{1F469}\u200D\u{1F52C}" }, { unified: "1f469-1f3fb-200d-1f52c", native: "\u{1F469}\u{1F3FB}\u200D\u{1F52C}" }, { unified: "1f469-1f3fc-200d-1f52c", native: "\u{1F469}\u{1F3FC}\u200D\u{1F52C}" }, { unified: "1f469-1f3fd-200d-1f52c", native: "\u{1F469}\u{1F3FD}\u200D\u{1F52C}" }, { unified: "1f469-1f3fe-200d-1f52c", native: "\u{1F469}\u{1F3FE}\u200D\u{1F52C}" }, { unified: "1f469-1f3ff-200d-1f52c", native: "\u{1F469}\u{1F3FF}\u200D\u{1F52C}" }], version: 4 }, technologist: { id: "technologist", name: "Technologist", keywords: ["computer"], skins: [{ unified: "1f9d1-200d-1f4bb", native: "\u{1F9D1}\u200D\u{1F4BB}" }, { unified: "1f9d1-1f3fb-200d-1f4bb", native: "\u{1F9D1}\u{1F3FB}\u200D\u{1F4BB}" }, { unified: "1f9d1-1f3fc-200d-1f4bb", native: "\u{1F9D1}\u{1F3FC}\u200D\u{1F4BB}" }, { unified: "1f9d1-1f3fd-200d-1f4bb", native: "\u{1F9D1}\u{1F3FD}\u200D\u{1F4BB}" }, { unified: "1f9d1-1f3fe-200d-1f4bb", native: "\u{1F9D1}\u{1F3FE}\u200D\u{1F4BB}" }, { unified: "1f9d1-1f3ff-200d-1f4bb", native: "\u{1F9D1}\u{1F3FF}\u200D\u{1F4BB}" }], version: 12.1 }, "male-technologist": { id: "male-technologist", name: "Man Technologist", keywords: ["male", "coder", "developer", "engineer", "programmer", "software", "human", "laptop", "computer"], skins: [{ unified: "1f468-200d-1f4bb", native: "\u{1F468}\u200D\u{1F4BB}" }, { unified: "1f468-1f3fb-200d-1f4bb", native: "\u{1F468}\u{1F3FB}\u200D\u{1F4BB}" }, { unified: "1f468-1f3fc-200d-1f4bb", native: "\u{1F468}\u{1F3FC}\u200D\u{1F4BB}" }, { unified: "1f468-1f3fd-200d-1f4bb", native: "\u{1F468}\u{1F3FD}\u200D\u{1F4BB}" }, { unified: "1f468-1f3fe-200d-1f4bb", native: "\u{1F468}\u{1F3FE}\u200D\u{1F4BB}" }, { unified: "1f468-1f3ff-200d-1f4bb", native: "\u{1F468}\u{1F3FF}\u200D\u{1F4BB}" }], version: 4 }, "female-technologist": { id: "female-technologist", name: "Woman Technologist", keywords: ["female", "coder", "developer", "engineer", "programmer", "software", "human", "laptop", "computer"], skins: [{ unified: "1f469-200d-1f4bb", native: "\u{1F469}\u200D\u{1F4BB}" }, { unified: "1f469-1f3fb-200d-1f4bb", native: "\u{1F469}\u{1F3FB}\u200D\u{1F4BB}" }, { unified: "1f469-1f3fc-200d-1f4bb", native: "\u{1F469}\u{1F3FC}\u200D\u{1F4BB}" }, { unified: "1f469-1f3fd-200d-1f4bb", native: "\u{1F469}\u{1F3FD}\u200D\u{1F4BB}" }, { unified: "1f469-1f3fe-200d-1f4bb", native: "\u{1F469}\u{1F3FE}\u200D\u{1F4BB}" }, { unified: "1f469-1f3ff-200d-1f4bb", native: "\u{1F469}\u{1F3FF}\u200D\u{1F4BB}" }], version: 4 }, singer: { id: "singer", name: "Singer", keywords: ["song", "artist", "performer"], skins: [{ unified: "1f9d1-200d-1f3a4", native: "\u{1F9D1}\u200D\u{1F3A4}" }, { unified: "1f9d1-1f3fb-200d-1f3a4", native: "\u{1F9D1}\u{1F3FB}\u200D\u{1F3A4}" }, { unified: "1f9d1-1f3fc-200d-1f3a4", native: "\u{1F9D1}\u{1F3FC}\u200D\u{1F3A4}" }, { unified: "1f9d1-1f3fd-200d-1f3a4", native: "\u{1F9D1}\u{1F3FD}\u200D\u{1F3A4}" }, { unified: "1f9d1-1f3fe-200d-1f3a4", native: "\u{1F9D1}\u{1F3FE}\u200D\u{1F3A4}" }, { unified: "1f9d1-1f3ff-200d-1f3a4", native: "\u{1F9D1}\u{1F3FF}\u200D\u{1F3A4}" }], version: 12.1 }, "male-singer": { id: "male-singer", name: "Man Singer", keywords: ["male", "rockstar", "entertainer", "human"], skins: [{ unified: "1f468-200d-1f3a4", native: "\u{1F468}\u200D\u{1F3A4}" }, { unified: "1f468-1f3fb-200d-1f3a4", native: "\u{1F468}\u{1F3FB}\u200D\u{1F3A4}" }, { unified: "1f468-1f3fc-200d-1f3a4", native: "\u{1F468}\u{1F3FC}\u200D\u{1F3A4}" }, { unified: "1f468-1f3fd-200d-1f3a4", native: "\u{1F468}\u{1F3FD}\u200D\u{1F3A4}" }, { unified: "1f468-1f3fe-200d-1f3a4", native: "\u{1F468}\u{1F3FE}\u200D\u{1F3A4}" }, { unified: "1f468-1f3ff-200d-1f3a4", native: "\u{1F468}\u{1F3FF}\u200D\u{1F3A4}" }], version: 4 }, "female-singer": { id: "female-singer", name: "Woman Singer", keywords: ["female", "rockstar", "entertainer", "human"], skins: [{ unified: "1f469-200d-1f3a4", native: "\u{1F469}\u200D\u{1F3A4}" }, { unified: "1f469-1f3fb-200d-1f3a4", native: "\u{1F469}\u{1F3FB}\u200D\u{1F3A4}" }, { unified: "1f469-1f3fc-200d-1f3a4", native: "\u{1F469}\u{1F3FC}\u200D\u{1F3A4}" }, { unified: "1f469-1f3fd-200d-1f3a4", native: "\u{1F469}\u{1F3FD}\u200D\u{1F3A4}" }, { unified: "1f469-1f3fe-200d-1f3a4", native: "\u{1F469}\u{1F3FE}\u200D\u{1F3A4}" }, { unified: "1f469-1f3ff-200d-1f3a4", native: "\u{1F469}\u{1F3FF}\u200D\u{1F3A4}" }], version: 4 }, artist: { id: "artist", name: "Artist", keywords: ["painting", "draw", "creativity"], skins: [{ unified: "1f9d1-200d-1f3a8", native: "\u{1F9D1}\u200D\u{1F3A8}" }, { unified: "1f9d1-1f3fb-200d-1f3a8", native: "\u{1F9D1}\u{1F3FB}\u200D\u{1F3A8}" }, { unified: "1f9d1-1f3fc-200d-1f3a8", native: "\u{1F9D1}\u{1F3FC}\u200D\u{1F3A8}" }, { unified: "1f9d1-1f3fd-200d-1f3a8", native: "\u{1F9D1}\u{1F3FD}\u200D\u{1F3A8}" }, { unified: "1f9d1-1f3fe-200d-1f3a8", native: "\u{1F9D1}\u{1F3FE}\u200D\u{1F3A8}" }, { unified: "1f9d1-1f3ff-200d-1f3a8", native: "\u{1F9D1}\u{1F3FF}\u200D\u{1F3A8}" }], version: 12.1 }, "male-artist": { id: "male-artist", name: "Man Artist", keywords: ["male", "painter", "human"], skins: [{ unified: "1f468-200d-1f3a8", native: "\u{1F468}\u200D\u{1F3A8}" }, { unified: "1f468-1f3fb-200d-1f3a8", native: "\u{1F468}\u{1F3FB}\u200D\u{1F3A8}" }, { unified: "1f468-1f3fc-200d-1f3a8", native: "\u{1F468}\u{1F3FC}\u200D\u{1F3A8}" }, { unified: "1f468-1f3fd-200d-1f3a8", native: "\u{1F468}\u{1F3FD}\u200D\u{1F3A8}" }, { unified: "1f468-1f3fe-200d-1f3a8", native: "\u{1F468}\u{1F3FE}\u200D\u{1F3A8}" }, { unified: "1f468-1f3ff-200d-1f3a8", native: "\u{1F468}\u{1F3FF}\u200D\u{1F3A8}" }], version: 4 }, "female-artist": { id: "female-artist", name: "Woman Artist", keywords: ["female", "painter", "human"], skins: [{ unified: "1f469-200d-1f3a8", native: "\u{1F469}\u200D\u{1F3A8}" }, { unified: "1f469-1f3fb-200d-1f3a8", native: "\u{1F469}\u{1F3FB}\u200D\u{1F3A8}" }, { unified: "1f469-1f3fc-200d-1f3a8", native: "\u{1F469}\u{1F3FC}\u200D\u{1F3A8}" }, { unified: "1f469-1f3fd-200d-1f3a8", native: "\u{1F469}\u{1F3FD}\u200D\u{1F3A8}" }, { unified: "1f469-1f3fe-200d-1f3a8", native: "\u{1F469}\u{1F3FE}\u200D\u{1F3A8}" }, { unified: "1f469-1f3ff-200d-1f3a8", native: "\u{1F469}\u{1F3FF}\u200D\u{1F3A8}" }], version: 4 }, pilot: { id: "pilot", name: "Pilot", keywords: ["fly", "plane", "airplane"], skins: [{ unified: "1f9d1-200d-2708-fe0f", native: "\u{1F9D1}\u200D\u2708\uFE0F" }, { unified: "1f9d1-1f3fb-200d-2708-fe0f", native: "\u{1F9D1}\u{1F3FB}\u200D\u2708\uFE0F" }, { unified: "1f9d1-1f3fc-200d-2708-fe0f", native: "\u{1F9D1}\u{1F3FC}\u200D\u2708\uFE0F" }, { unified: "1f9d1-1f3fd-200d-2708-fe0f", native: "\u{1F9D1}\u{1F3FD}\u200D\u2708\uFE0F" }, { unified: "1f9d1-1f3fe-200d-2708-fe0f", native: "\u{1F9D1}\u{1F3FE}\u200D\u2708\uFE0F" }, { unified: "1f9d1-1f3ff-200d-2708-fe0f", native: "\u{1F9D1}\u{1F3FF}\u200D\u2708\uFE0F" }], version: 12.1 }, "male-pilot": { id: "male-pilot", name: "Man Pilot", keywords: ["male", "aviator", "plane", "human"], skins: [{ unified: "1f468-200d-2708-fe0f", native: "\u{1F468}\u200D\u2708\uFE0F" }, { unified: "1f468-1f3fb-200d-2708-fe0f", native: "\u{1F468}\u{1F3FB}\u200D\u2708\uFE0F" }, { unified: "1f468-1f3fc-200d-2708-fe0f", native: "\u{1F468}\u{1F3FC}\u200D\u2708\uFE0F" }, { unified: "1f468-1f3fd-200d-2708-fe0f", native: "\u{1F468}\u{1F3FD}\u200D\u2708\uFE0F" }, { unified: "1f468-1f3fe-200d-2708-fe0f", native: "\u{1F468}\u{1F3FE}\u200D\u2708\uFE0F" }, { unified: "1f468-1f3ff-200d-2708-fe0f", native: "\u{1F468}\u{1F3FF}\u200D\u2708\uFE0F" }], version: 4 }, "female-pilot": { id: "female-pilot", name: "Woman Pilot", keywords: ["female", "aviator", "plane", "human"], skins: [{ unified: "1f469-200d-2708-fe0f", native: "\u{1F469}\u200D\u2708\uFE0F" }, { unified: "1f469-1f3fb-200d-2708-fe0f", native: "\u{1F469}\u{1F3FB}\u200D\u2708\uFE0F" }, { unified: "1f469-1f3fc-200d-2708-fe0f", native: "\u{1F469}\u{1F3FC}\u200D\u2708\uFE0F" }, { unified: "1f469-1f3fd-200d-2708-fe0f", native: "\u{1F469}\u{1F3FD}\u200D\u2708\uFE0F" }, { unified: "1f469-1f3fe-200d-2708-fe0f", native: "\u{1F469}\u{1F3FE}\u200D\u2708\uFE0F" }, { unified: "1f469-1f3ff-200d-2708-fe0f", native: "\u{1F469}\u{1F3FF}\u200D\u2708\uFE0F" }], version: 4 }, astronaut: { id: "astronaut", name: "Astronaut", keywords: ["outerspace"], skins: [{ unified: "1f9d1-200d-1f680", native: "\u{1F9D1}\u200D\u{1F680}" }, { unified: "1f9d1-1f3fb-200d-1f680", native: "\u{1F9D1}\u{1F3FB}\u200D\u{1F680}" }, { unified: "1f9d1-1f3fc-200d-1f680", native: "\u{1F9D1}\u{1F3FC}\u200D\u{1F680}" }, { unified: "1f9d1-1f3fd-200d-1f680", native: "\u{1F9D1}\u{1F3FD}\u200D\u{1F680}" }, { unified: "1f9d1-1f3fe-200d-1f680", native: "\u{1F9D1}\u{1F3FE}\u200D\u{1F680}" }, { unified: "1f9d1-1f3ff-200d-1f680", native: "\u{1F9D1}\u{1F3FF}\u200D\u{1F680}" }], version: 12.1 }, "male-astronaut": { id: "male-astronaut", name: "Man Astronaut", keywords: ["male", "space", "rocket", "human"], skins: [{ unified: "1f468-200d-1f680", native: "\u{1F468}\u200D\u{1F680}" }, { unified: "1f468-1f3fb-200d-1f680", native: "\u{1F468}\u{1F3FB}\u200D\u{1F680}" }, { unified: "1f468-1f3fc-200d-1f680", native: "\u{1F468}\u{1F3FC}\u200D\u{1F680}" }, { unified: "1f468-1f3fd-200d-1f680", native: "\u{1F468}\u{1F3FD}\u200D\u{1F680}" }, { unified: "1f468-1f3fe-200d-1f680", native: "\u{1F468}\u{1F3FE}\u200D\u{1F680}" }, { unified: "1f468-1f3ff-200d-1f680", native: "\u{1F468}\u{1F3FF}\u200D\u{1F680}" }], version: 4 }, "female-astronaut": { id: "female-astronaut", name: "Woman Astronaut", keywords: ["female", "space", "rocket", "human"], skins: [{ unified: "1f469-200d-1f680", native: "\u{1F469}\u200D\u{1F680}" }, { unified: "1f469-1f3fb-200d-1f680", native: "\u{1F469}\u{1F3FB}\u200D\u{1F680}" }, { unified: "1f469-1f3fc-200d-1f680", native: "\u{1F469}\u{1F3FC}\u200D\u{1F680}" }, { unified: "1f469-1f3fd-200d-1f680", native: "\u{1F469}\u{1F3FD}\u200D\u{1F680}" }, { unified: "1f469-1f3fe-200d-1f680", native: "\u{1F469}\u{1F3FE}\u200D\u{1F680}" }, { unified: "1f469-1f3ff-200d-1f680", native: "\u{1F469}\u{1F3FF}\u200D\u{1F680}" }], version: 4 }, firefighter: { id: "firefighter", name: "Firefighter", keywords: ["fire"], skins: [{ unified: "1f9d1-200d-1f692", native: "\u{1F9D1}\u200D\u{1F692}" }, { unified: "1f9d1-1f3fb-200d-1f692", native: "\u{1F9D1}\u{1F3FB}\u200D\u{1F692}" }, { unified: "1f9d1-1f3fc-200d-1f692", native: "\u{1F9D1}\u{1F3FC}\u200D\u{1F692}" }, { unified: "1f9d1-1f3fd-200d-1f692", native: "\u{1F9D1}\u{1F3FD}\u200D\u{1F692}" }, { unified: "1f9d1-1f3fe-200d-1f692", native: "\u{1F9D1}\u{1F3FE}\u200D\u{1F692}" }, { unified: "1f9d1-1f3ff-200d-1f692", native: "\u{1F9D1}\u{1F3FF}\u200D\u{1F692}" }], version: 12.1 }, "male-firefighter": { id: "male-firefighter", name: "Man Firefighter", keywords: ["male", "fireman", "human"], skins: [{ unified: "1f468-200d-1f692", native: "\u{1F468}\u200D\u{1F692}" }, { unified: "1f468-1f3fb-200d-1f692", native: "\u{1F468}\u{1F3FB}\u200D\u{1F692}" }, { unified: "1f468-1f3fc-200d-1f692", native: "\u{1F468}\u{1F3FC}\u200D\u{1F692}" }, { unified: "1f468-1f3fd-200d-1f692", native: "\u{1F468}\u{1F3FD}\u200D\u{1F692}" }, { unified: "1f468-1f3fe-200d-1f692", native: "\u{1F468}\u{1F3FE}\u200D\u{1F692}" }, { unified: "1f468-1f3ff-200d-1f692", native: "\u{1F468}\u{1F3FF}\u200D\u{1F692}" }], version: 4 }, "female-firefighter": { id: "female-firefighter", name: "Woman Firefighter", keywords: ["female", "fireman", "human"], skins: [{ unified: "1f469-200d-1f692", native: "\u{1F469}\u200D\u{1F692}" }, { unified: "1f469-1f3fb-200d-1f692", native: "\u{1F469}\u{1F3FB}\u200D\u{1F692}" }, { unified: "1f469-1f3fc-200d-1f692", native: "\u{1F469}\u{1F3FC}\u200D\u{1F692}" }, { unified: "1f469-1f3fd-200d-1f692", native: "\u{1F469}\u{1F3FD}\u200D\u{1F692}" }, { unified: "1f469-1f3fe-200d-1f692", native: "\u{1F469}\u{1F3FE}\u200D\u{1F692}" }, { unified: "1f469-1f3ff-200d-1f692", native: "\u{1F469}\u{1F3FF}\u200D\u{1F692}" }], version: 4 }, cop: { id: "cop", name: "Police Officer", keywords: ["cop"], skins: [{ unified: "1f46e", native: "\u{1F46E}" }, { unified: "1f46e-1f3fb", native: "\u{1F46E}\u{1F3FB}" }, { unified: "1f46e-1f3fc", native: "\u{1F46E}\u{1F3FC}" }, { unified: "1f46e-1f3fd", native: "\u{1F46E}\u{1F3FD}" }, { unified: "1f46e-1f3fe", native: "\u{1F46E}\u{1F3FE}" }, { unified: "1f46e-1f3ff", native: "\u{1F46E}\u{1F3FF}" }], version: 1 }, "male-police-officer": { id: "male-police-officer", name: "Man Police Officer", keywords: ["male", "police-officer", "law", "legal", "enforcement", "arrest", "911"], skins: [{ unified: "1f46e-200d-2642-fe0f", native: "\u{1F46E}\u200D\u2642\uFE0F" }, { unified: "1f46e-1f3fb-200d-2642-fe0f", native: "\u{1F46E}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f46e-1f3fc-200d-2642-fe0f", native: "\u{1F46E}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f46e-1f3fd-200d-2642-fe0f", native: "\u{1F46E}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f46e-1f3fe-200d-2642-fe0f", native: "\u{1F46E}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f46e-1f3ff-200d-2642-fe0f", native: "\u{1F46E}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "female-police-officer": { id: "female-police-officer", name: "Woman Police Officer", keywords: ["female", "police-officer", "law", "legal", "enforcement", "arrest", "911"], skins: [{ unified: "1f46e-200d-2640-fe0f", native: "\u{1F46E}\u200D\u2640\uFE0F" }, { unified: "1f46e-1f3fb-200d-2640-fe0f", native: "\u{1F46E}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f46e-1f3fc-200d-2640-fe0f", native: "\u{1F46E}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f46e-1f3fd-200d-2640-fe0f", native: "\u{1F46E}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f46e-1f3fe-200d-2640-fe0f", native: "\u{1F46E}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f46e-1f3ff-200d-2640-fe0f", native: "\u{1F46E}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, sleuth_or_spy: { id: "sleuth_or_spy", name: "Detective", keywords: ["sleuth", "or", "spy", "human"], skins: [{ unified: "1f575-fe0f", native: "\u{1F575}\uFE0F" }, { unified: "1f575-1f3fb", native: "\u{1F575}\u{1F3FB}" }, { unified: "1f575-1f3fc", native: "\u{1F575}\u{1F3FC}" }, { unified: "1f575-1f3fd", native: "\u{1F575}\u{1F3FD}" }, { unified: "1f575-1f3fe", native: "\u{1F575}\u{1F3FE}" }, { unified: "1f575-1f3ff", native: "\u{1F575}\u{1F3FF}" }], version: 1 }, "male-detective": { id: "male-detective", name: "Man Detective", keywords: ["male", "crime"], skins: [{ unified: "1f575-fe0f-200d-2642-fe0f", native: "\u{1F575}\uFE0F\u200D\u2642\uFE0F" }, { unified: "1f575-1f3fb-200d-2642-fe0f", native: "\u{1F575}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f575-1f3fc-200d-2642-fe0f", native: "\u{1F575}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f575-1f3fd-200d-2642-fe0f", native: "\u{1F575}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f575-1f3fe-200d-2642-fe0f", native: "\u{1F575}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f575-1f3ff-200d-2642-fe0f", native: "\u{1F575}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "female-detective": { id: "female-detective", name: "Woman Detective", keywords: ["female", "human", "spy"], skins: [{ unified: "1f575-fe0f-200d-2640-fe0f", native: "\u{1F575}\uFE0F\u200D\u2640\uFE0F" }, { unified: "1f575-1f3fb-200d-2640-fe0f", native: "\u{1F575}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f575-1f3fc-200d-2640-fe0f", native: "\u{1F575}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f575-1f3fd-200d-2640-fe0f", native: "\u{1F575}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f575-1f3fe-200d-2640-fe0f", native: "\u{1F575}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f575-1f3ff-200d-2640-fe0f", native: "\u{1F575}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, guardsman: { id: "guardsman", name: "Guard", keywords: ["guardsman", "protect"], skins: [{ unified: "1f482", native: "\u{1F482}" }, { unified: "1f482-1f3fb", native: "\u{1F482}\u{1F3FB}" }, { unified: "1f482-1f3fc", native: "\u{1F482}\u{1F3FC}" }, { unified: "1f482-1f3fd", native: "\u{1F482}\u{1F3FD}" }, { unified: "1f482-1f3fe", native: "\u{1F482}\u{1F3FE}" }, { unified: "1f482-1f3ff", native: "\u{1F482}\u{1F3FF}" }], version: 1 }, "male-guard": { id: "male-guard", name: "Man Guard", keywords: ["male", "uk", "gb", "british", "guy", "royal"], skins: [{ unified: "1f482-200d-2642-fe0f", native: "\u{1F482}\u200D\u2642\uFE0F" }, { unified: "1f482-1f3fb-200d-2642-fe0f", native: "\u{1F482}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f482-1f3fc-200d-2642-fe0f", native: "\u{1F482}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f482-1f3fd-200d-2642-fe0f", native: "\u{1F482}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f482-1f3fe-200d-2642-fe0f", native: "\u{1F482}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f482-1f3ff-200d-2642-fe0f", native: "\u{1F482}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "female-guard": { id: "female-guard", name: "Woman Guard", keywords: ["female", "uk", "gb", "british", "royal"], skins: [{ unified: "1f482-200d-2640-fe0f", native: "\u{1F482}\u200D\u2640\uFE0F" }, { unified: "1f482-1f3fb-200d-2640-fe0f", native: "\u{1F482}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f482-1f3fc-200d-2640-fe0f", native: "\u{1F482}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f482-1f3fd-200d-2640-fe0f", native: "\u{1F482}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f482-1f3fe-200d-2640-fe0f", native: "\u{1F482}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f482-1f3ff-200d-2640-fe0f", native: "\u{1F482}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, ninja: { id: "ninja", name: "Ninja", keywords: ["ninjutsu", "skills", "japanese"], skins: [{ unified: "1f977", native: "\u{1F977}" }, { unified: "1f977-1f3fb", native: "\u{1F977}\u{1F3FB}" }, { unified: "1f977-1f3fc", native: "\u{1F977}\u{1F3FC}" }, { unified: "1f977-1f3fd", native: "\u{1F977}\u{1F3FD}" }, { unified: "1f977-1f3fe", native: "\u{1F977}\u{1F3FE}" }, { unified: "1f977-1f3ff", native: "\u{1F977}\u{1F3FF}" }], version: 13 }, construction_worker: { id: "construction_worker", name: "Construction Worker", keywords: ["labor", "build"], skins: [{ unified: "1f477", native: "\u{1F477}" }, { unified: "1f477-1f3fb", native: "\u{1F477}\u{1F3FB}" }, { unified: "1f477-1f3fc", native: "\u{1F477}\u{1F3FC}" }, { unified: "1f477-1f3fd", native: "\u{1F477}\u{1F3FD}" }, { unified: "1f477-1f3fe", native: "\u{1F477}\u{1F3FE}" }, { unified: "1f477-1f3ff", native: "\u{1F477}\u{1F3FF}" }], version: 1 }, "male-construction-worker": { id: "male-construction-worker", name: "Man Construction Worker", keywords: ["male", "construction-worker", "human", "wip", "guy", "build", "labor"], skins: [{ unified: "1f477-200d-2642-fe0f", native: "\u{1F477}\u200D\u2642\uFE0F" }, { unified: "1f477-1f3fb-200d-2642-fe0f", native: "\u{1F477}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f477-1f3fc-200d-2642-fe0f", native: "\u{1F477}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f477-1f3fd-200d-2642-fe0f", native: "\u{1F477}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f477-1f3fe-200d-2642-fe0f", native: "\u{1F477}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f477-1f3ff-200d-2642-fe0f", native: "\u{1F477}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "female-construction-worker": { id: "female-construction-worker", name: "Woman Construction Worker", keywords: ["female", "construction-worker", "human", "wip", "build", "labor"], skins: [{ unified: "1f477-200d-2640-fe0f", native: "\u{1F477}\u200D\u2640\uFE0F" }, { unified: "1f477-1f3fb-200d-2640-fe0f", native: "\u{1F477}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f477-1f3fc-200d-2640-fe0f", native: "\u{1F477}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f477-1f3fd-200d-2640-fe0f", native: "\u{1F477}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f477-1f3fe-200d-2640-fe0f", native: "\u{1F477}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f477-1f3ff-200d-2640-fe0f", native: "\u{1F477}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, person_with_crown: { id: "person_with_crown", name: "Person with Crown", keywords: ["royalty", "power"], skins: [{ unified: "1fac5", native: "\u{1FAC5}" }, { unified: "1fac5-1f3fb", native: "\u{1FAC5}\u{1F3FB}" }, { unified: "1fac5-1f3fc", native: "\u{1FAC5}\u{1F3FC}" }, { unified: "1fac5-1f3fd", native: "\u{1FAC5}\u{1F3FD}" }, { unified: "1fac5-1f3fe", native: "\u{1FAC5}\u{1F3FE}" }, { unified: "1fac5-1f3ff", native: "\u{1FAC5}\u{1F3FF}" }], version: 14 }, prince: { id: "prince", name: "Prince", keywords: ["boy", "man", "male", "crown", "royal", "king"], skins: [{ unified: "1f934", native: "\u{1F934}" }, { unified: "1f934-1f3fb", native: "\u{1F934}\u{1F3FB}" }, { unified: "1f934-1f3fc", native: "\u{1F934}\u{1F3FC}" }, { unified: "1f934-1f3fd", native: "\u{1F934}\u{1F3FD}" }, { unified: "1f934-1f3fe", native: "\u{1F934}\u{1F3FE}" }, { unified: "1f934-1f3ff", native: "\u{1F934}\u{1F3FF}" }], version: 3 }, princess: { id: "princess", name: "Princess", keywords: ["girl", "woman", "female", "blond", "crown", "royal", "queen"], skins: [{ unified: "1f478", native: "\u{1F478}" }, { unified: "1f478-1f3fb", native: "\u{1F478}\u{1F3FB}" }, { unified: "1f478-1f3fc", native: "\u{1F478}\u{1F3FC}" }, { unified: "1f478-1f3fd", native: "\u{1F478}\u{1F3FD}" }, { unified: "1f478-1f3fe", native: "\u{1F478}\u{1F3FE}" }, { unified: "1f478-1f3ff", native: "\u{1F478}\u{1F3FF}" }], version: 1 }, man_with_turban: { id: "man_with_turban", name: "Man with Turban", keywords: ["person", "wearing", "headdress"], skins: [{ unified: "1f473", native: "\u{1F473}" }, { unified: "1f473-1f3fb", native: "\u{1F473}\u{1F3FB}" }, { unified: "1f473-1f3fc", native: "\u{1F473}\u{1F3FC}" }, { unified: "1f473-1f3fd", native: "\u{1F473}\u{1F3FD}" }, { unified: "1f473-1f3fe", native: "\u{1F473}\u{1F3FE}" }, { unified: "1f473-1f3ff", native: "\u{1F473}\u{1F3FF}" }], version: 1 }, "man-wearing-turban": { id: "man-wearing-turban", name: "Man Wearing Turban", keywords: ["wearing-turban", "male", "indian", "hinduism", "arabs"], skins: [{ unified: "1f473-200d-2642-fe0f", native: "\u{1F473}\u200D\u2642\uFE0F" }, { unified: "1f473-1f3fb-200d-2642-fe0f", native: "\u{1F473}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f473-1f3fc-200d-2642-fe0f", native: "\u{1F473}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f473-1f3fd-200d-2642-fe0f", native: "\u{1F473}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f473-1f3fe-200d-2642-fe0f", native: "\u{1F473}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f473-1f3ff-200d-2642-fe0f", native: "\u{1F473}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-wearing-turban": { id: "woman-wearing-turban", name: "Woman Wearing Turban", keywords: ["wearing-turban", "female", "indian", "hinduism", "arabs"], skins: [{ unified: "1f473-200d-2640-fe0f", native: "\u{1F473}\u200D\u2640\uFE0F" }, { unified: "1f473-1f3fb-200d-2640-fe0f", native: "\u{1F473}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f473-1f3fc-200d-2640-fe0f", native: "\u{1F473}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f473-1f3fd-200d-2640-fe0f", native: "\u{1F473}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f473-1f3fe-200d-2640-fe0f", native: "\u{1F473}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f473-1f3ff-200d-2640-fe0f", native: "\u{1F473}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, man_with_gua_pi_mao: { id: "man_with_gua_pi_mao", name: "Man with Gua Pi Mao", keywords: ["skullcap", "male", "boy", "chinese"], skins: [{ unified: "1f472", native: "\u{1F472}" }, { unified: "1f472-1f3fb", native: "\u{1F472}\u{1F3FB}" }, { unified: "1f472-1f3fc", native: "\u{1F472}\u{1F3FC}" }, { unified: "1f472-1f3fd", native: "\u{1F472}\u{1F3FD}" }, { unified: "1f472-1f3fe", native: "\u{1F472}\u{1F3FE}" }, { unified: "1f472-1f3ff", native: "\u{1F472}\u{1F3FF}" }], version: 1 }, person_with_headscarf: { id: "person_with_headscarf", name: "Woman with Headscarf", keywords: ["person", "female", "hijab", "mantilla", "tichel"], skins: [{ unified: "1f9d5", native: "\u{1F9D5}" }, { unified: "1f9d5-1f3fb", native: "\u{1F9D5}\u{1F3FB}" }, { unified: "1f9d5-1f3fc", native: "\u{1F9D5}\u{1F3FC}" }, { unified: "1f9d5-1f3fd", native: "\u{1F9D5}\u{1F3FD}" }, { unified: "1f9d5-1f3fe", native: "\u{1F9D5}\u{1F3FE}" }, { unified: "1f9d5-1f3ff", native: "\u{1F9D5}\u{1F3FF}" }], version: 5 }, person_in_tuxedo: { id: "person_in_tuxedo", name: "Man in Tuxedo", keywords: ["person", "couple", "marriage", "wedding", "groom"], skins: [{ unified: "1f935", native: "\u{1F935}" }, { unified: "1f935-1f3fb", native: "\u{1F935}\u{1F3FB}" }, { unified: "1f935-1f3fc", native: "\u{1F935}\u{1F3FC}" }, { unified: "1f935-1f3fd", native: "\u{1F935}\u{1F3FD}" }, { unified: "1f935-1f3fe", native: "\u{1F935}\u{1F3FE}" }, { unified: "1f935-1f3ff", native: "\u{1F935}\u{1F3FF}" }], version: 3 }, man_in_tuxedo: { id: "man_in_tuxedo", name: "Man in Tuxedo", keywords: ["formal", "fashion"], skins: [{ unified: "1f935-200d-2642-fe0f", native: "\u{1F935}\u200D\u2642\uFE0F" }, { unified: "1f935-1f3fb-200d-2642-fe0f", native: "\u{1F935}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f935-1f3fc-200d-2642-fe0f", native: "\u{1F935}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f935-1f3fd-200d-2642-fe0f", native: "\u{1F935}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f935-1f3fe-200d-2642-fe0f", native: "\u{1F935}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f935-1f3ff-200d-2642-fe0f", native: "\u{1F935}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 13 }, woman_in_tuxedo: { id: "woman_in_tuxedo", name: "Woman in Tuxedo", keywords: ["formal", "fashion"], skins: [{ unified: "1f935-200d-2640-fe0f", native: "\u{1F935}\u200D\u2640\uFE0F" }, { unified: "1f935-1f3fb-200d-2640-fe0f", native: "\u{1F935}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f935-1f3fc-200d-2640-fe0f", native: "\u{1F935}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f935-1f3fd-200d-2640-fe0f", native: "\u{1F935}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f935-1f3fe-200d-2640-fe0f", native: "\u{1F935}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f935-1f3ff-200d-2640-fe0f", native: "\u{1F935}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 13 }, bride_with_veil: { id: "bride_with_veil", name: "Bride with Veil", keywords: ["couple", "marriage", "wedding", "woman"], skins: [{ unified: "1f470", native: "\u{1F470}" }, { unified: "1f470-1f3fb", native: "\u{1F470}\u{1F3FB}" }, { unified: "1f470-1f3fc", native: "\u{1F470}\u{1F3FC}" }, { unified: "1f470-1f3fd", native: "\u{1F470}\u{1F3FD}" }, { unified: "1f470-1f3fe", native: "\u{1F470}\u{1F3FE}" }, { unified: "1f470-1f3ff", native: "\u{1F470}\u{1F3FF}" }], version: 1 }, man_with_veil: { id: "man_with_veil", name: "Man with Veil", keywords: ["wedding", "marriage"], skins: [{ unified: "1f470-200d-2642-fe0f", native: "\u{1F470}\u200D\u2642\uFE0F" }, { unified: "1f470-1f3fb-200d-2642-fe0f", native: "\u{1F470}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f470-1f3fc-200d-2642-fe0f", native: "\u{1F470}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f470-1f3fd-200d-2642-fe0f", native: "\u{1F470}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f470-1f3fe-200d-2642-fe0f", native: "\u{1F470}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f470-1f3ff-200d-2642-fe0f", native: "\u{1F470}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 13 }, woman_with_veil: { id: "woman_with_veil", name: "Woman with Veil", keywords: ["wedding", "marriage"], skins: [{ unified: "1f470-200d-2640-fe0f", native: "\u{1F470}\u200D\u2640\uFE0F" }, { unified: "1f470-1f3fb-200d-2640-fe0f", native: "\u{1F470}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f470-1f3fc-200d-2640-fe0f", native: "\u{1F470}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f470-1f3fd-200d-2640-fe0f", native: "\u{1F470}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f470-1f3fe-200d-2640-fe0f", native: "\u{1F470}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f470-1f3ff-200d-2640-fe0f", native: "\u{1F470}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 13 }, pregnant_woman: { id: "pregnant_woman", name: "Pregnant Woman", keywords: ["baby"], skins: [{ unified: "1f930", native: "\u{1F930}" }, { unified: "1f930-1f3fb", native: "\u{1F930}\u{1F3FB}" }, { unified: "1f930-1f3fc", native: "\u{1F930}\u{1F3FC}" }, { unified: "1f930-1f3fd", native: "\u{1F930}\u{1F3FD}" }, { unified: "1f930-1f3fe", native: "\u{1F930}\u{1F3FE}" }, { unified: "1f930-1f3ff", native: "\u{1F930}\u{1F3FF}" }], version: 3 }, pregnant_man: { id: "pregnant_man", name: "Pregnant Man", keywords: ["baby", "belly"], skins: [{ unified: "1fac3", native: "\u{1FAC3}" }, { unified: "1fac3-1f3fb", native: "\u{1FAC3}\u{1F3FB}" }, { unified: "1fac3-1f3fc", native: "\u{1FAC3}\u{1F3FC}" }, { unified: "1fac3-1f3fd", native: "\u{1FAC3}\u{1F3FD}" }, { unified: "1fac3-1f3fe", native: "\u{1FAC3}\u{1F3FE}" }, { unified: "1fac3-1f3ff", native: "\u{1FAC3}\u{1F3FF}" }], version: 14 }, pregnant_person: { id: "pregnant_person", name: "Pregnant Person", keywords: ["baby", "belly"], skins: [{ unified: "1fac4", native: "\u{1FAC4}" }, { unified: "1fac4-1f3fb", native: "\u{1FAC4}\u{1F3FB}" }, { unified: "1fac4-1f3fc", native: "\u{1FAC4}\u{1F3FC}" }, { unified: "1fac4-1f3fd", native: "\u{1FAC4}\u{1F3FD}" }, { unified: "1fac4-1f3fe", native: "\u{1FAC4}\u{1F3FE}" }, { unified: "1fac4-1f3ff", native: "\u{1FAC4}\u{1F3FF}" }], version: 14 }, "breast-feeding": { id: "breast-feeding", name: "Breast-Feeding", keywords: ["breast", "feeding", "nursing", "baby"], skins: [{ unified: "1f931", native: "\u{1F931}" }, { unified: "1f931-1f3fb", native: "\u{1F931}\u{1F3FB}" }, { unified: "1f931-1f3fc", native: "\u{1F931}\u{1F3FC}" }, { unified: "1f931-1f3fd", native: "\u{1F931}\u{1F3FD}" }, { unified: "1f931-1f3fe", native: "\u{1F931}\u{1F3FE}" }, { unified: "1f931-1f3ff", native: "\u{1F931}\u{1F3FF}" }], version: 5 }, woman_feeding_baby: { id: "woman_feeding_baby", name: "Woman Feeding Baby", keywords: ["birth", "food"], skins: [{ unified: "1f469-200d-1f37c", native: "\u{1F469}\u200D\u{1F37C}" }, { unified: "1f469-1f3fb-200d-1f37c", native: "\u{1F469}\u{1F3FB}\u200D\u{1F37C}" }, { unified: "1f469-1f3fc-200d-1f37c", native: "\u{1F469}\u{1F3FC}\u200D\u{1F37C}" }, { unified: "1f469-1f3fd-200d-1f37c", native: "\u{1F469}\u{1F3FD}\u200D\u{1F37C}" }, { unified: "1f469-1f3fe-200d-1f37c", native: "\u{1F469}\u{1F3FE}\u200D\u{1F37C}" }, { unified: "1f469-1f3ff-200d-1f37c", native: "\u{1F469}\u{1F3FF}\u200D\u{1F37C}" }], version: 13 }, man_feeding_baby: { id: "man_feeding_baby", name: "Man Feeding Baby", keywords: ["birth", "food"], skins: [{ unified: "1f468-200d-1f37c", native: "\u{1F468}\u200D\u{1F37C}" }, { unified: "1f468-1f3fb-200d-1f37c", native: "\u{1F468}\u{1F3FB}\u200D\u{1F37C}" }, { unified: "1f468-1f3fc-200d-1f37c", native: "\u{1F468}\u{1F3FC}\u200D\u{1F37C}" }, { unified: "1f468-1f3fd-200d-1f37c", native: "\u{1F468}\u{1F3FD}\u200D\u{1F37C}" }, { unified: "1f468-1f3fe-200d-1f37c", native: "\u{1F468}\u{1F3FE}\u200D\u{1F37C}" }, { unified: "1f468-1f3ff-200d-1f37c", native: "\u{1F468}\u{1F3FF}\u200D\u{1F37C}" }], version: 13 }, person_feeding_baby: { id: "person_feeding_baby", name: "Person Feeding Baby", keywords: ["birth", "food"], skins: [{ unified: "1f9d1-200d-1f37c", native: "\u{1F9D1}\u200D\u{1F37C}" }, { unified: "1f9d1-1f3fb-200d-1f37c", native: "\u{1F9D1}\u{1F3FB}\u200D\u{1F37C}" }, { unified: "1f9d1-1f3fc-200d-1f37c", native: "\u{1F9D1}\u{1F3FC}\u200D\u{1F37C}" }, { unified: "1f9d1-1f3fd-200d-1f37c", native: "\u{1F9D1}\u{1F3FD}\u200D\u{1F37C}" }, { unified: "1f9d1-1f3fe-200d-1f37c", native: "\u{1F9D1}\u{1F3FE}\u200D\u{1F37C}" }, { unified: "1f9d1-1f3ff-200d-1f37c", native: "\u{1F9D1}\u{1F3FF}\u200D\u{1F37C}" }], version: 13 }, angel: { id: "angel", name: "Baby Angel", keywords: ["heaven", "wings", "halo"], skins: [{ unified: "1f47c", native: "\u{1F47C}" }, { unified: "1f47c-1f3fb", native: "\u{1F47C}\u{1F3FB}" }, { unified: "1f47c-1f3fc", native: "\u{1F47C}\u{1F3FC}" }, { unified: "1f47c-1f3fd", native: "\u{1F47C}\u{1F3FD}" }, { unified: "1f47c-1f3fe", native: "\u{1F47C}\u{1F3FE}" }, { unified: "1f47c-1f3ff", native: "\u{1F47C}\u{1F3FF}" }], version: 1 }, santa: { id: "santa", name: "Santa Claus", keywords: ["festival", "man", "male", "xmas", "father", "christmas"], skins: [{ unified: "1f385", native: "\u{1F385}" }, { unified: "1f385-1f3fb", native: "\u{1F385}\u{1F3FB}" }, { unified: "1f385-1f3fc", native: "\u{1F385}\u{1F3FC}" }, { unified: "1f385-1f3fd", native: "\u{1F385}\u{1F3FD}" }, { unified: "1f385-1f3fe", native: "\u{1F385}\u{1F3FE}" }, { unified: "1f385-1f3ff", native: "\u{1F385}\u{1F3FF}" }], version: 1 }, mrs_claus: { id: "mrs_claus", name: "Mrs. Claus", keywords: ["mrs", "mother", "christmas", "woman", "female", "xmas"], skins: [{ unified: "1f936", native: "\u{1F936}" }, { unified: "1f936-1f3fb", native: "\u{1F936}\u{1F3FB}" }, { unified: "1f936-1f3fc", native: "\u{1F936}\u{1F3FC}" }, { unified: "1f936-1f3fd", native: "\u{1F936}\u{1F3FD}" }, { unified: "1f936-1f3fe", native: "\u{1F936}\u{1F3FE}" }, { unified: "1f936-1f3ff", native: "\u{1F936}\u{1F3FF}" }], version: 3 }, mx_claus: { id: "mx_claus", name: "Mx Claus", keywords: ["christmas"], skins: [{ unified: "1f9d1-200d-1f384", native: "\u{1F9D1}\u200D\u{1F384}" }, { unified: "1f9d1-1f3fb-200d-1f384", native: "\u{1F9D1}\u{1F3FB}\u200D\u{1F384}" }, { unified: "1f9d1-1f3fc-200d-1f384", native: "\u{1F9D1}\u{1F3FC}\u200D\u{1F384}" }, { unified: "1f9d1-1f3fd-200d-1f384", native: "\u{1F9D1}\u{1F3FD}\u200D\u{1F384}" }, { unified: "1f9d1-1f3fe-200d-1f384", native: "\u{1F9D1}\u{1F3FE}\u200D\u{1F384}" }, { unified: "1f9d1-1f3ff-200d-1f384", native: "\u{1F9D1}\u{1F3FF}\u200D\u{1F384}" }], version: 13 }, superhero: { id: "superhero", name: "Superhero", keywords: ["marvel"], skins: [{ unified: "1f9b8", native: "\u{1F9B8}" }, { unified: "1f9b8-1f3fb", native: "\u{1F9B8}\u{1F3FB}" }, { unified: "1f9b8-1f3fc", native: "\u{1F9B8}\u{1F3FC}" }, { unified: "1f9b8-1f3fd", native: "\u{1F9B8}\u{1F3FD}" }, { unified: "1f9b8-1f3fe", native: "\u{1F9B8}\u{1F3FE}" }, { unified: "1f9b8-1f3ff", native: "\u{1F9B8}\u{1F3FF}" }], version: 11 }, male_superhero: { id: "male_superhero", name: "Man Superhero", keywords: ["male", "good", "hero", "superpowers"], skins: [{ unified: "1f9b8-200d-2642-fe0f", native: "\u{1F9B8}\u200D\u2642\uFE0F" }, { unified: "1f9b8-1f3fb-200d-2642-fe0f", native: "\u{1F9B8}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f9b8-1f3fc-200d-2642-fe0f", native: "\u{1F9B8}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f9b8-1f3fd-200d-2642-fe0f", native: "\u{1F9B8}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f9b8-1f3fe-200d-2642-fe0f", native: "\u{1F9B8}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f9b8-1f3ff-200d-2642-fe0f", native: "\u{1F9B8}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 11 }, female_superhero: { id: "female_superhero", name: "Woman Superhero", keywords: ["female", "good", "heroine", "superpowers"], skins: [{ unified: "1f9b8-200d-2640-fe0f", native: "\u{1F9B8}\u200D\u2640\uFE0F" }, { unified: "1f9b8-1f3fb-200d-2640-fe0f", native: "\u{1F9B8}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f9b8-1f3fc-200d-2640-fe0f", native: "\u{1F9B8}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f9b8-1f3fd-200d-2640-fe0f", native: "\u{1F9B8}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f9b8-1f3fe-200d-2640-fe0f", native: "\u{1F9B8}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f9b8-1f3ff-200d-2640-fe0f", native: "\u{1F9B8}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 11 }, supervillain: { id: "supervillain", name: "Supervillain", keywords: ["marvel"], skins: [{ unified: "1f9b9", native: "\u{1F9B9}" }, { unified: "1f9b9-1f3fb", native: "\u{1F9B9}\u{1F3FB}" }, { unified: "1f9b9-1f3fc", native: "\u{1F9B9}\u{1F3FC}" }, { unified: "1f9b9-1f3fd", native: "\u{1F9B9}\u{1F3FD}" }, { unified: "1f9b9-1f3fe", native: "\u{1F9B9}\u{1F3FE}" }, { unified: "1f9b9-1f3ff", native: "\u{1F9B9}\u{1F3FF}" }], version: 11 }, male_supervillain: { id: "male_supervillain", name: "Man Supervillain", keywords: ["male", "evil", "bad", "criminal", "hero", "superpowers"], skins: [{ unified: "1f9b9-200d-2642-fe0f", native: "\u{1F9B9}\u200D\u2642\uFE0F" }, { unified: "1f9b9-1f3fb-200d-2642-fe0f", native: "\u{1F9B9}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f9b9-1f3fc-200d-2642-fe0f", native: "\u{1F9B9}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f9b9-1f3fd-200d-2642-fe0f", native: "\u{1F9B9}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f9b9-1f3fe-200d-2642-fe0f", native: "\u{1F9B9}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f9b9-1f3ff-200d-2642-fe0f", native: "\u{1F9B9}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 11 }, female_supervillain: { id: "female_supervillain", name: "Woman Supervillain", keywords: ["female", "evil", "bad", "criminal", "heroine", "superpowers"], skins: [{ unified: "1f9b9-200d-2640-fe0f", native: "\u{1F9B9}\u200D\u2640\uFE0F" }, { unified: "1f9b9-1f3fb-200d-2640-fe0f", native: "\u{1F9B9}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f9b9-1f3fc-200d-2640-fe0f", native: "\u{1F9B9}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f9b9-1f3fd-200d-2640-fe0f", native: "\u{1F9B9}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f9b9-1f3fe-200d-2640-fe0f", native: "\u{1F9B9}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f9b9-1f3ff-200d-2640-fe0f", native: "\u{1F9B9}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 11 }, mage: { id: "mage", name: "Mage", keywords: ["magic"], skins: [{ unified: "1f9d9", native: "\u{1F9D9}" }, { unified: "1f9d9-1f3fb", native: "\u{1F9D9}\u{1F3FB}" }, { unified: "1f9d9-1f3fc", native: "\u{1F9D9}\u{1F3FC}" }, { unified: "1f9d9-1f3fd", native: "\u{1F9D9}\u{1F3FD}" }, { unified: "1f9d9-1f3fe", native: "\u{1F9D9}\u{1F3FE}" }, { unified: "1f9d9-1f3ff", native: "\u{1F9D9}\u{1F3FF}" }], version: 5 }, male_mage: { id: "male_mage", name: "Man Mage", keywords: ["male", "sorcerer"], skins: [{ unified: "1f9d9-200d-2642-fe0f", native: "\u{1F9D9}\u200D\u2642\uFE0F" }, { unified: "1f9d9-1f3fb-200d-2642-fe0f", native: "\u{1F9D9}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f9d9-1f3fc-200d-2642-fe0f", native: "\u{1F9D9}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f9d9-1f3fd-200d-2642-fe0f", native: "\u{1F9D9}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f9d9-1f3fe-200d-2642-fe0f", native: "\u{1F9D9}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f9d9-1f3ff-200d-2642-fe0f", native: "\u{1F9D9}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 5 }, female_mage: { id: "female_mage", name: "Woman Mage", keywords: ["female", "witch"], skins: [{ unified: "1f9d9-200d-2640-fe0f", native: "\u{1F9D9}\u200D\u2640\uFE0F" }, { unified: "1f9d9-1f3fb-200d-2640-fe0f", native: "\u{1F9D9}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f9d9-1f3fc-200d-2640-fe0f", native: "\u{1F9D9}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f9d9-1f3fd-200d-2640-fe0f", native: "\u{1F9D9}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f9d9-1f3fe-200d-2640-fe0f", native: "\u{1F9D9}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f9d9-1f3ff-200d-2640-fe0f", native: "\u{1F9D9}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 5 }, fairy: { id: "fairy", name: "Fairy", keywords: ["wings", "magical"], skins: [{ unified: "1f9da", native: "\u{1F9DA}" }, { unified: "1f9da-1f3fb", native: "\u{1F9DA}\u{1F3FB}" }, { unified: "1f9da-1f3fc", native: "\u{1F9DA}\u{1F3FC}" }, { unified: "1f9da-1f3fd", native: "\u{1F9DA}\u{1F3FD}" }, { unified: "1f9da-1f3fe", native: "\u{1F9DA}\u{1F3FE}" }, { unified: "1f9da-1f3ff", native: "\u{1F9DA}\u{1F3FF}" }], version: 5 }, male_fairy: { id: "male_fairy", name: "Man Fairy", keywords: ["male"], skins: [{ unified: "1f9da-200d-2642-fe0f", native: "\u{1F9DA}\u200D\u2642\uFE0F" }, { unified: "1f9da-1f3fb-200d-2642-fe0f", native: "\u{1F9DA}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f9da-1f3fc-200d-2642-fe0f", native: "\u{1F9DA}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f9da-1f3fd-200d-2642-fe0f", native: "\u{1F9DA}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f9da-1f3fe-200d-2642-fe0f", native: "\u{1F9DA}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f9da-1f3ff-200d-2642-fe0f", native: "\u{1F9DA}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 5 }, female_fairy: { id: "female_fairy", name: "Woman Fairy", keywords: ["female"], skins: [{ unified: "1f9da-200d-2640-fe0f", native: "\u{1F9DA}\u200D\u2640\uFE0F" }, { unified: "1f9da-1f3fb-200d-2640-fe0f", native: "\u{1F9DA}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f9da-1f3fc-200d-2640-fe0f", native: "\u{1F9DA}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f9da-1f3fd-200d-2640-fe0f", native: "\u{1F9DA}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f9da-1f3fe-200d-2640-fe0f", native: "\u{1F9DA}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f9da-1f3ff-200d-2640-fe0f", native: "\u{1F9DA}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 5 }, vampire: { id: "vampire", name: "Vampire", keywords: ["blood", "twilight"], skins: [{ unified: "1f9db", native: "\u{1F9DB}" }, { unified: "1f9db-1f3fb", native: "\u{1F9DB}\u{1F3FB}" }, { unified: "1f9db-1f3fc", native: "\u{1F9DB}\u{1F3FC}" }, { unified: "1f9db-1f3fd", native: "\u{1F9DB}\u{1F3FD}" }, { unified: "1f9db-1f3fe", native: "\u{1F9DB}\u{1F3FE}" }, { unified: "1f9db-1f3ff", native: "\u{1F9DB}\u{1F3FF}" }], version: 5 }, male_vampire: { id: "male_vampire", name: "Man Vampire", keywords: ["male", "dracula"], skins: [{ unified: "1f9db-200d-2642-fe0f", native: "\u{1F9DB}\u200D\u2642\uFE0F" }, { unified: "1f9db-1f3fb-200d-2642-fe0f", native: "\u{1F9DB}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f9db-1f3fc-200d-2642-fe0f", native: "\u{1F9DB}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f9db-1f3fd-200d-2642-fe0f", native: "\u{1F9DB}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f9db-1f3fe-200d-2642-fe0f", native: "\u{1F9DB}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f9db-1f3ff-200d-2642-fe0f", native: "\u{1F9DB}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 5 }, female_vampire: { id: "female_vampire", name: "Woman Vampire", keywords: ["female"], skins: [{ unified: "1f9db-200d-2640-fe0f", native: "\u{1F9DB}\u200D\u2640\uFE0F" }, { unified: "1f9db-1f3fb-200d-2640-fe0f", native: "\u{1F9DB}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f9db-1f3fc-200d-2640-fe0f", native: "\u{1F9DB}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f9db-1f3fd-200d-2640-fe0f", native: "\u{1F9DB}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f9db-1f3fe-200d-2640-fe0f", native: "\u{1F9DB}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f9db-1f3ff-200d-2640-fe0f", native: "\u{1F9DB}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 5 }, merperson: { id: "merperson", name: "Merperson", keywords: ["sea"], skins: [{ unified: "1f9dc", native: "\u{1F9DC}" }, { unified: "1f9dc-1f3fb", native: "\u{1F9DC}\u{1F3FB}" }, { unified: "1f9dc-1f3fc", native: "\u{1F9DC}\u{1F3FC}" }, { unified: "1f9dc-1f3fd", native: "\u{1F9DC}\u{1F3FD}" }, { unified: "1f9dc-1f3fe", native: "\u{1F9DC}\u{1F3FE}" }, { unified: "1f9dc-1f3ff", native: "\u{1F9DC}\u{1F3FF}" }], version: 5 }, merman: { id: "merman", name: "Merman", keywords: ["man", "male", "triton"], skins: [{ unified: "1f9dc-200d-2642-fe0f", native: "\u{1F9DC}\u200D\u2642\uFE0F" }, { unified: "1f9dc-1f3fb-200d-2642-fe0f", native: "\u{1F9DC}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f9dc-1f3fc-200d-2642-fe0f", native: "\u{1F9DC}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f9dc-1f3fd-200d-2642-fe0f", native: "\u{1F9DC}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f9dc-1f3fe-200d-2642-fe0f", native: "\u{1F9DC}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f9dc-1f3ff-200d-2642-fe0f", native: "\u{1F9DC}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 5 }, mermaid: { id: "mermaid", name: "Mermaid", keywords: ["woman", "female", "merwoman", "ariel"], skins: [{ unified: "1f9dc-200d-2640-fe0f", native: "\u{1F9DC}\u200D\u2640\uFE0F" }, { unified: "1f9dc-1f3fb-200d-2640-fe0f", native: "\u{1F9DC}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f9dc-1f3fc-200d-2640-fe0f", native: "\u{1F9DC}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f9dc-1f3fd-200d-2640-fe0f", native: "\u{1F9DC}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f9dc-1f3fe-200d-2640-fe0f", native: "\u{1F9DC}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f9dc-1f3ff-200d-2640-fe0f", native: "\u{1F9DC}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 5 }, elf: { id: "elf", name: "Elf", keywords: ["magical"], skins: [{ unified: "1f9dd", native: "\u{1F9DD}" }, { unified: "1f9dd-1f3fb", native: "\u{1F9DD}\u{1F3FB}" }, { unified: "1f9dd-1f3fc", native: "\u{1F9DD}\u{1F3FC}" }, { unified: "1f9dd-1f3fd", native: "\u{1F9DD}\u{1F3FD}" }, { unified: "1f9dd-1f3fe", native: "\u{1F9DD}\u{1F3FE}" }, { unified: "1f9dd-1f3ff", native: "\u{1F9DD}\u{1F3FF}" }], version: 5 }, male_elf: { id: "male_elf", name: "Man Elf", keywords: ["male"], skins: [{ unified: "1f9dd-200d-2642-fe0f", native: "\u{1F9DD}\u200D\u2642\uFE0F" }, { unified: "1f9dd-1f3fb-200d-2642-fe0f", native: "\u{1F9DD}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f9dd-1f3fc-200d-2642-fe0f", native: "\u{1F9DD}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f9dd-1f3fd-200d-2642-fe0f", native: "\u{1F9DD}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f9dd-1f3fe-200d-2642-fe0f", native: "\u{1F9DD}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f9dd-1f3ff-200d-2642-fe0f", native: "\u{1F9DD}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 5 }, female_elf: { id: "female_elf", name: "Woman Elf", keywords: ["female"], skins: [{ unified: "1f9dd-200d-2640-fe0f", native: "\u{1F9DD}\u200D\u2640\uFE0F" }, { unified: "1f9dd-1f3fb-200d-2640-fe0f", native: "\u{1F9DD}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f9dd-1f3fc-200d-2640-fe0f", native: "\u{1F9DD}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f9dd-1f3fd-200d-2640-fe0f", native: "\u{1F9DD}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f9dd-1f3fe-200d-2640-fe0f", native: "\u{1F9DD}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f9dd-1f3ff-200d-2640-fe0f", native: "\u{1F9DD}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 5 }, genie: { id: "genie", name: "Genie", keywords: ["magical", "wishes"], skins: [{ unified: "1f9de", native: "\u{1F9DE}" }], version: 5 }, male_genie: { id: "male_genie", name: "Man Genie", keywords: ["male"], skins: [{ unified: "1f9de-200d-2642-fe0f", native: "\u{1F9DE}\u200D\u2642\uFE0F" }], version: 5 }, female_genie: { id: "female_genie", name: "Woman Genie", keywords: ["female"], skins: [{ unified: "1f9de-200d-2640-fe0f", native: "\u{1F9DE}\u200D\u2640\uFE0F" }], version: 5 }, zombie: { id: "zombie", name: "Zombie", keywords: ["dead"], skins: [{ unified: "1f9df", native: "\u{1F9DF}" }], version: 5 }, male_zombie: { id: "male_zombie", name: "Man Zombie", keywords: ["male", "dracula", "undead", "walking", "dead"], skins: [{ unified: "1f9df-200d-2642-fe0f", native: "\u{1F9DF}\u200D\u2642\uFE0F" }], version: 5 }, female_zombie: { id: "female_zombie", name: "Woman Zombie", keywords: ["female", "undead", "walking", "dead"], skins: [{ unified: "1f9df-200d-2640-fe0f", native: "\u{1F9DF}\u200D\u2640\uFE0F" }], version: 5 }, troll: { id: "troll", name: "Troll", keywords: ["mystical", "monster"], skins: [{ unified: "1f9cc", native: "\u{1F9CC}" }], version: 14 }, massage: { id: "massage", name: "Face Massage", keywords: ["person", "getting", "relax"], skins: [{ unified: "1f486", native: "\u{1F486}" }, { unified: "1f486-1f3fb", native: "\u{1F486}\u{1F3FB}" }, { unified: "1f486-1f3fc", native: "\u{1F486}\u{1F3FC}" }, { unified: "1f486-1f3fd", native: "\u{1F486}\u{1F3FD}" }, { unified: "1f486-1f3fe", native: "\u{1F486}\u{1F3FE}" }, { unified: "1f486-1f3ff", native: "\u{1F486}\u{1F3FF}" }], version: 1 }, "man-getting-massage": { id: "man-getting-massage", name: "Man Getting Massage", keywords: ["getting-massage", "male", "boy", "head"], skins: [{ unified: "1f486-200d-2642-fe0f", native: "\u{1F486}\u200D\u2642\uFE0F" }, { unified: "1f486-1f3fb-200d-2642-fe0f", native: "\u{1F486}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f486-1f3fc-200d-2642-fe0f", native: "\u{1F486}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f486-1f3fd-200d-2642-fe0f", native: "\u{1F486}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f486-1f3fe-200d-2642-fe0f", native: "\u{1F486}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f486-1f3ff-200d-2642-fe0f", native: "\u{1F486}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-getting-massage": { id: "woman-getting-massage", name: "Woman Getting Massage", keywords: ["getting-massage", "female", "girl", "head"], skins: [{ unified: "1f486-200d-2640-fe0f", native: "\u{1F486}\u200D\u2640\uFE0F" }, { unified: "1f486-1f3fb-200d-2640-fe0f", native: "\u{1F486}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f486-1f3fc-200d-2640-fe0f", native: "\u{1F486}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f486-1f3fd-200d-2640-fe0f", native: "\u{1F486}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f486-1f3fe-200d-2640-fe0f", native: "\u{1F486}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f486-1f3ff-200d-2640-fe0f", native: "\u{1F486}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, haircut: { id: "haircut", name: "Haircut", keywords: ["person", "getting", "hairstyle"], skins: [{ unified: "1f487", native: "\u{1F487}" }, { unified: "1f487-1f3fb", native: "\u{1F487}\u{1F3FB}" }, { unified: "1f487-1f3fc", native: "\u{1F487}\u{1F3FC}" }, { unified: "1f487-1f3fd", native: "\u{1F487}\u{1F3FD}" }, { unified: "1f487-1f3fe", native: "\u{1F487}\u{1F3FE}" }, { unified: "1f487-1f3ff", native: "\u{1F487}\u{1F3FF}" }], version: 1 }, "man-getting-haircut": { id: "man-getting-haircut", name: "Man Getting Haircut", keywords: ["getting-haircut", "male", "boy"], skins: [{ unified: "1f487-200d-2642-fe0f", native: "\u{1F487}\u200D\u2642\uFE0F" }, { unified: "1f487-1f3fb-200d-2642-fe0f", native: "\u{1F487}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f487-1f3fc-200d-2642-fe0f", native: "\u{1F487}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f487-1f3fd-200d-2642-fe0f", native: "\u{1F487}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f487-1f3fe-200d-2642-fe0f", native: "\u{1F487}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f487-1f3ff-200d-2642-fe0f", native: "\u{1F487}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-getting-haircut": { id: "woman-getting-haircut", name: "Woman Getting Haircut", keywords: ["getting-haircut", "female", "girl"], skins: [{ unified: "1f487-200d-2640-fe0f", native: "\u{1F487}\u200D\u2640\uFE0F" }, { unified: "1f487-1f3fb-200d-2640-fe0f", native: "\u{1F487}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f487-1f3fc-200d-2640-fe0f", native: "\u{1F487}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f487-1f3fd-200d-2640-fe0f", native: "\u{1F487}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f487-1f3fe-200d-2640-fe0f", native: "\u{1F487}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f487-1f3ff-200d-2640-fe0f", native: "\u{1F487}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, walking: { id: "walking", name: "Pedestrian", keywords: ["walking", "person", "move"], skins: [{ unified: "1f6b6", native: "\u{1F6B6}" }, { unified: "1f6b6-1f3fb", native: "\u{1F6B6}\u{1F3FB}" }, { unified: "1f6b6-1f3fc", native: "\u{1F6B6}\u{1F3FC}" }, { unified: "1f6b6-1f3fd", native: "\u{1F6B6}\u{1F3FD}" }, { unified: "1f6b6-1f3fe", native: "\u{1F6B6}\u{1F3FE}" }, { unified: "1f6b6-1f3ff", native: "\u{1F6B6}\u{1F3FF}" }], version: 1 }, "man-walking": { id: "man-walking", name: "Man Walking", keywords: ["human", "feet", "steps"], skins: [{ unified: "1f6b6-200d-2642-fe0f", native: "\u{1F6B6}\u200D\u2642\uFE0F" }, { unified: "1f6b6-1f3fb-200d-2642-fe0f", native: "\u{1F6B6}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f6b6-1f3fc-200d-2642-fe0f", native: "\u{1F6B6}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f6b6-1f3fd-200d-2642-fe0f", native: "\u{1F6B6}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f6b6-1f3fe-200d-2642-fe0f", native: "\u{1F6B6}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f6b6-1f3ff-200d-2642-fe0f", native: "\u{1F6B6}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-walking": { id: "woman-walking", name: "Woman Walking", keywords: ["human", "feet", "steps", "female"], skins: [{ unified: "1f6b6-200d-2640-fe0f", native: "\u{1F6B6}\u200D\u2640\uFE0F" }, { unified: "1f6b6-1f3fb-200d-2640-fe0f", native: "\u{1F6B6}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f6b6-1f3fc-200d-2640-fe0f", native: "\u{1F6B6}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f6b6-1f3fd-200d-2640-fe0f", native: "\u{1F6B6}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f6b6-1f3fe-200d-2640-fe0f", native: "\u{1F6B6}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f6b6-1f3ff-200d-2640-fe0f", native: "\u{1F6B6}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, standing_person: { id: "standing_person", name: "Standing Person", keywords: ["still"], skins: [{ unified: "1f9cd", native: "\u{1F9CD}" }, { unified: "1f9cd-1f3fb", native: "\u{1F9CD}\u{1F3FB}" }, { unified: "1f9cd-1f3fc", native: "\u{1F9CD}\u{1F3FC}" }, { unified: "1f9cd-1f3fd", native: "\u{1F9CD}\u{1F3FD}" }, { unified: "1f9cd-1f3fe", native: "\u{1F9CD}\u{1F3FE}" }, { unified: "1f9cd-1f3ff", native: "\u{1F9CD}\u{1F3FF}" }], version: 12 }, man_standing: { id: "man_standing", name: "Man Standing", keywords: ["still"], skins: [{ unified: "1f9cd-200d-2642-fe0f", native: "\u{1F9CD}\u200D\u2642\uFE0F" }, { unified: "1f9cd-1f3fb-200d-2642-fe0f", native: "\u{1F9CD}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f9cd-1f3fc-200d-2642-fe0f", native: "\u{1F9CD}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f9cd-1f3fd-200d-2642-fe0f", native: "\u{1F9CD}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f9cd-1f3fe-200d-2642-fe0f", native: "\u{1F9CD}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f9cd-1f3ff-200d-2642-fe0f", native: "\u{1F9CD}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 12 }, woman_standing: { id: "woman_standing", name: "Woman Standing", keywords: ["still"], skins: [{ unified: "1f9cd-200d-2640-fe0f", native: "\u{1F9CD}\u200D\u2640\uFE0F" }, { unified: "1f9cd-1f3fb-200d-2640-fe0f", native: "\u{1F9CD}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f9cd-1f3fc-200d-2640-fe0f", native: "\u{1F9CD}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f9cd-1f3fd-200d-2640-fe0f", native: "\u{1F9CD}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f9cd-1f3fe-200d-2640-fe0f", native: "\u{1F9CD}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f9cd-1f3ff-200d-2640-fe0f", native: "\u{1F9CD}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 12 }, kneeling_person: { id: "kneeling_person", name: "Kneeling Person", keywords: ["pray", "respectful"], skins: [{ unified: "1f9ce", native: "\u{1F9CE}" }, { unified: "1f9ce-1f3fb", native: "\u{1F9CE}\u{1F3FB}" }, { unified: "1f9ce-1f3fc", native: "\u{1F9CE}\u{1F3FC}" }, { unified: "1f9ce-1f3fd", native: "\u{1F9CE}\u{1F3FD}" }, { unified: "1f9ce-1f3fe", native: "\u{1F9CE}\u{1F3FE}" }, { unified: "1f9ce-1f3ff", native: "\u{1F9CE}\u{1F3FF}" }], version: 12 }, man_kneeling: { id: "man_kneeling", name: "Man Kneeling", keywords: ["pray", "respectful"], skins: [{ unified: "1f9ce-200d-2642-fe0f", native: "\u{1F9CE}\u200D\u2642\uFE0F" }, { unified: "1f9ce-1f3fb-200d-2642-fe0f", native: "\u{1F9CE}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f9ce-1f3fc-200d-2642-fe0f", native: "\u{1F9CE}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f9ce-1f3fd-200d-2642-fe0f", native: "\u{1F9CE}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f9ce-1f3fe-200d-2642-fe0f", native: "\u{1F9CE}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f9ce-1f3ff-200d-2642-fe0f", native: "\u{1F9CE}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 12 }, woman_kneeling: { id: "woman_kneeling", name: "Woman Kneeling", keywords: ["respectful", "pray"], skins: [{ unified: "1f9ce-200d-2640-fe0f", native: "\u{1F9CE}\u200D\u2640\uFE0F" }, { unified: "1f9ce-1f3fb-200d-2640-fe0f", native: "\u{1F9CE}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f9ce-1f3fc-200d-2640-fe0f", native: "\u{1F9CE}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f9ce-1f3fd-200d-2640-fe0f", native: "\u{1F9CE}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f9ce-1f3fe-200d-2640-fe0f", native: "\u{1F9CE}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f9ce-1f3ff-200d-2640-fe0f", native: "\u{1F9CE}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 12 }, person_with_probing_cane: { id: "person_with_probing_cane", name: "Person with White Cane", keywords: ["probing", "blind"], skins: [{ unified: "1f9d1-200d-1f9af", native: "\u{1F9D1}\u200D\u{1F9AF}" }, { unified: "1f9d1-1f3fb-200d-1f9af", native: "\u{1F9D1}\u{1F3FB}\u200D\u{1F9AF}" }, { unified: "1f9d1-1f3fc-200d-1f9af", native: "\u{1F9D1}\u{1F3FC}\u200D\u{1F9AF}" }, { unified: "1f9d1-1f3fd-200d-1f9af", native: "\u{1F9D1}\u{1F3FD}\u200D\u{1F9AF}" }, { unified: "1f9d1-1f3fe-200d-1f9af", native: "\u{1F9D1}\u{1F3FE}\u200D\u{1F9AF}" }, { unified: "1f9d1-1f3ff-200d-1f9af", native: "\u{1F9D1}\u{1F3FF}\u200D\u{1F9AF}" }], version: 12.1 }, man_with_probing_cane: { id: "man_with_probing_cane", name: "Man with White Cane", keywords: ["probing", "blind"], skins: [{ unified: "1f468-200d-1f9af", native: "\u{1F468}\u200D\u{1F9AF}" }, { unified: "1f468-1f3fb-200d-1f9af", native: "\u{1F468}\u{1F3FB}\u200D\u{1F9AF}" }, { unified: "1f468-1f3fc-200d-1f9af", native: "\u{1F468}\u{1F3FC}\u200D\u{1F9AF}" }, { unified: "1f468-1f3fd-200d-1f9af", native: "\u{1F468}\u{1F3FD}\u200D\u{1F9AF}" }, { unified: "1f468-1f3fe-200d-1f9af", native: "\u{1F468}\u{1F3FE}\u200D\u{1F9AF}" }, { unified: "1f468-1f3ff-200d-1f9af", native: "\u{1F468}\u{1F3FF}\u200D\u{1F9AF}" }], version: 12 }, woman_with_probing_cane: { id: "woman_with_probing_cane", name: "Woman with White Cane", keywords: ["probing", "blind"], skins: [{ unified: "1f469-200d-1f9af", native: "\u{1F469}\u200D\u{1F9AF}" }, { unified: "1f469-1f3fb-200d-1f9af", native: "\u{1F469}\u{1F3FB}\u200D\u{1F9AF}" }, { unified: "1f469-1f3fc-200d-1f9af", native: "\u{1F469}\u{1F3FC}\u200D\u{1F9AF}" }, { unified: "1f469-1f3fd-200d-1f9af", native: "\u{1F469}\u{1F3FD}\u200D\u{1F9AF}" }, { unified: "1f469-1f3fe-200d-1f9af", native: "\u{1F469}\u{1F3FE}\u200D\u{1F9AF}" }, { unified: "1f469-1f3ff-200d-1f9af", native: "\u{1F469}\u{1F3FF}\u200D\u{1F9AF}" }], version: 12 }, person_in_motorized_wheelchair: { id: "person_in_motorized_wheelchair", name: "Person in Motorized Wheelchair", keywords: ["disability", "accessibility"], skins: [{ unified: "1f9d1-200d-1f9bc", native: "\u{1F9D1}\u200D\u{1F9BC}" }, { unified: "1f9d1-1f3fb-200d-1f9bc", native: "\u{1F9D1}\u{1F3FB}\u200D\u{1F9BC}" }, { unified: "1f9d1-1f3fc-200d-1f9bc", native: "\u{1F9D1}\u{1F3FC}\u200D\u{1F9BC}" }, { unified: "1f9d1-1f3fd-200d-1f9bc", native: "\u{1F9D1}\u{1F3FD}\u200D\u{1F9BC}" }, { unified: "1f9d1-1f3fe-200d-1f9bc", native: "\u{1F9D1}\u{1F3FE}\u200D\u{1F9BC}" }, { unified: "1f9d1-1f3ff-200d-1f9bc", native: "\u{1F9D1}\u{1F3FF}\u200D\u{1F9BC}" }], version: 12.1 }, man_in_motorized_wheelchair: { id: "man_in_motorized_wheelchair", name: "Man in Motorized Wheelchair", keywords: ["disability", "accessibility"], skins: [{ unified: "1f468-200d-1f9bc", native: "\u{1F468}\u200D\u{1F9BC}" }, { unified: "1f468-1f3fb-200d-1f9bc", native: "\u{1F468}\u{1F3FB}\u200D\u{1F9BC}" }, { unified: "1f468-1f3fc-200d-1f9bc", native: "\u{1F468}\u{1F3FC}\u200D\u{1F9BC}" }, { unified: "1f468-1f3fd-200d-1f9bc", native: "\u{1F468}\u{1F3FD}\u200D\u{1F9BC}" }, { unified: "1f468-1f3fe-200d-1f9bc", native: "\u{1F468}\u{1F3FE}\u200D\u{1F9BC}" }, { unified: "1f468-1f3ff-200d-1f9bc", native: "\u{1F468}\u{1F3FF}\u200D\u{1F9BC}" }], version: 12 }, woman_in_motorized_wheelchair: { id: "woman_in_motorized_wheelchair", name: "Woman in Motorized Wheelchair", keywords: ["disability", "accessibility"], skins: [{ unified: "1f469-200d-1f9bc", native: "\u{1F469}\u200D\u{1F9BC}" }, { unified: "1f469-1f3fb-200d-1f9bc", native: "\u{1F469}\u{1F3FB}\u200D\u{1F9BC}" }, { unified: "1f469-1f3fc-200d-1f9bc", native: "\u{1F469}\u{1F3FC}\u200D\u{1F9BC}" }, { unified: "1f469-1f3fd-200d-1f9bc", native: "\u{1F469}\u{1F3FD}\u200D\u{1F9BC}" }, { unified: "1f469-1f3fe-200d-1f9bc", native: "\u{1F469}\u{1F3FE}\u200D\u{1F9BC}" }, { unified: "1f469-1f3ff-200d-1f9bc", native: "\u{1F469}\u{1F3FF}\u200D\u{1F9BC}" }], version: 12 }, person_in_manual_wheelchair: { id: "person_in_manual_wheelchair", name: "Person in Manual Wheelchair", keywords: ["disability", "accessibility"], skins: [{ unified: "1f9d1-200d-1f9bd", native: "\u{1F9D1}\u200D\u{1F9BD}" }, { unified: "1f9d1-1f3fb-200d-1f9bd", native: "\u{1F9D1}\u{1F3FB}\u200D\u{1F9BD}" }, { unified: "1f9d1-1f3fc-200d-1f9bd", native: "\u{1F9D1}\u{1F3FC}\u200D\u{1F9BD}" }, { unified: "1f9d1-1f3fd-200d-1f9bd", native: "\u{1F9D1}\u{1F3FD}\u200D\u{1F9BD}" }, { unified: "1f9d1-1f3fe-200d-1f9bd", native: "\u{1F9D1}\u{1F3FE}\u200D\u{1F9BD}" }, { unified: "1f9d1-1f3ff-200d-1f9bd", native: "\u{1F9D1}\u{1F3FF}\u200D\u{1F9BD}" }], version: 12.1 }, man_in_manual_wheelchair: { id: "man_in_manual_wheelchair", name: "Man in Manual Wheelchair", keywords: ["disability", "accessibility"], skins: [{ unified: "1f468-200d-1f9bd", native: "\u{1F468}\u200D\u{1F9BD}" }, { unified: "1f468-1f3fb-200d-1f9bd", native: "\u{1F468}\u{1F3FB}\u200D\u{1F9BD}" }, { unified: "1f468-1f3fc-200d-1f9bd", native: "\u{1F468}\u{1F3FC}\u200D\u{1F9BD}" }, { unified: "1f468-1f3fd-200d-1f9bd", native: "\u{1F468}\u{1F3FD}\u200D\u{1F9BD}" }, { unified: "1f468-1f3fe-200d-1f9bd", native: "\u{1F468}\u{1F3FE}\u200D\u{1F9BD}" }, { unified: "1f468-1f3ff-200d-1f9bd", native: "\u{1F468}\u{1F3FF}\u200D\u{1F9BD}" }], version: 12 }, woman_in_manual_wheelchair: { id: "woman_in_manual_wheelchair", name: "Woman in Manual Wheelchair", keywords: ["disability", "accessibility"], skins: [{ unified: "1f469-200d-1f9bd", native: "\u{1F469}\u200D\u{1F9BD}" }, { unified: "1f469-1f3fb-200d-1f9bd", native: "\u{1F469}\u{1F3FB}\u200D\u{1F9BD}" }, { unified: "1f469-1f3fc-200d-1f9bd", native: "\u{1F469}\u{1F3FC}\u200D\u{1F9BD}" }, { unified: "1f469-1f3fd-200d-1f9bd", native: "\u{1F469}\u{1F3FD}\u200D\u{1F9BD}" }, { unified: "1f469-1f3fe-200d-1f9bd", native: "\u{1F469}\u{1F3FE}\u200D\u{1F9BD}" }, { unified: "1f469-1f3ff-200d-1f9bd", native: "\u{1F469}\u{1F3FF}\u200D\u{1F9BD}" }], version: 12 }, runner: { id: "runner", name: "Runner", keywords: ["running", "person", "move"], skins: [{ unified: "1f3c3", native: "\u{1F3C3}" }, { unified: "1f3c3-1f3fb", native: "\u{1F3C3}\u{1F3FB}" }, { unified: "1f3c3-1f3fc", native: "\u{1F3C3}\u{1F3FC}" }, { unified: "1f3c3-1f3fd", native: "\u{1F3C3}\u{1F3FD}" }, { unified: "1f3c3-1f3fe", native: "\u{1F3C3}\u{1F3FE}" }, { unified: "1f3c3-1f3ff", native: "\u{1F3C3}\u{1F3FF}" }], version: 1 }, "man-running": { id: "man-running", name: "Man Running", keywords: ["walking", "exercise", "race"], skins: [{ unified: "1f3c3-200d-2642-fe0f", native: "\u{1F3C3}\u200D\u2642\uFE0F" }, { unified: "1f3c3-1f3fb-200d-2642-fe0f", native: "\u{1F3C3}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f3c3-1f3fc-200d-2642-fe0f", native: "\u{1F3C3}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f3c3-1f3fd-200d-2642-fe0f", native: "\u{1F3C3}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f3c3-1f3fe-200d-2642-fe0f", native: "\u{1F3C3}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f3c3-1f3ff-200d-2642-fe0f", native: "\u{1F3C3}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-running": { id: "woman-running", name: "Woman Running", keywords: ["walking", "exercise", "race", "female"], skins: [{ unified: "1f3c3-200d-2640-fe0f", native: "\u{1F3C3}\u200D\u2640\uFE0F" }, { unified: "1f3c3-1f3fb-200d-2640-fe0f", native: "\u{1F3C3}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f3c3-1f3fc-200d-2640-fe0f", native: "\u{1F3C3}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f3c3-1f3fd-200d-2640-fe0f", native: "\u{1F3C3}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f3c3-1f3fe-200d-2640-fe0f", native: "\u{1F3C3}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f3c3-1f3ff-200d-2640-fe0f", native: "\u{1F3C3}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, dancer: { id: "dancer", name: "Dancer", keywords: ["woman", "dancing", "female", "girl", "fun"], skins: [{ unified: "1f483", native: "\u{1F483}" }, { unified: "1f483-1f3fb", native: "\u{1F483}\u{1F3FB}" }, { unified: "1f483-1f3fc", native: "\u{1F483}\u{1F3FC}" }, { unified: "1f483-1f3fd", native: "\u{1F483}\u{1F3FD}" }, { unified: "1f483-1f3fe", native: "\u{1F483}\u{1F3FE}" }, { unified: "1f483-1f3ff", native: "\u{1F483}\u{1F3FF}" }], version: 1 }, man_dancing: { id: "man_dancing", name: "Man Dancing", keywords: ["male", "boy", "fun", "dancer"], skins: [{ unified: "1f57a", native: "\u{1F57A}" }, { unified: "1f57a-1f3fb", native: "\u{1F57A}\u{1F3FB}" }, { unified: "1f57a-1f3fc", native: "\u{1F57A}\u{1F3FC}" }, { unified: "1f57a-1f3fd", native: "\u{1F57A}\u{1F3FD}" }, { unified: "1f57a-1f3fe", native: "\u{1F57A}\u{1F3FE}" }, { unified: "1f57a-1f3ff", native: "\u{1F57A}\u{1F3FF}" }], version: 3 }, man_in_business_suit_levitating: { id: "man_in_business_suit_levitating", name: "Person in Suit Levitating", keywords: ["man", "business", "levitate", "hover", "jump"], skins: [{ unified: "1f574-fe0f", native: "\u{1F574}\uFE0F" }, { unified: "1f574-1f3fb", native: "\u{1F574}\u{1F3FB}" }, { unified: "1f574-1f3fc", native: "\u{1F574}\u{1F3FC}" }, { unified: "1f574-1f3fd", native: "\u{1F574}\u{1F3FD}" }, { unified: "1f574-1f3fe", native: "\u{1F574}\u{1F3FE}" }, { unified: "1f574-1f3ff", native: "\u{1F574}\u{1F3FF}" }], version: 1 }, dancers: { id: "dancers", name: "Woman with Bunny Ears", keywords: ["dancers", "people", "perform", "costume"], skins: [{ unified: "1f46f", native: "\u{1F46F}" }], version: 1 }, "men-with-bunny-ears-partying": { id: "men-with-bunny-ears-partying", name: "Men with Bunny Ears", keywords: ["with-bunny-ears-partying", "man", "male", "boys"], skins: [{ unified: "1f46f-200d-2642-fe0f", native: "\u{1F46F}\u200D\u2642\uFE0F" }], version: 4 }, "women-with-bunny-ears-partying": { id: "women-with-bunny-ears-partying", name: "Women with Bunny Ears", keywords: ["with-bunny-ears-partying", "woman", "female", "girls"], skins: [{ unified: "1f46f-200d-2640-fe0f", native: "\u{1F46F}\u200D\u2640\uFE0F" }], version: 4 }, person_in_steamy_room: { id: "person_in_steamy_room", name: "Person in Steamy Room", keywords: ["relax", "spa"], skins: [{ unified: "1f9d6", native: "\u{1F9D6}" }, { unified: "1f9d6-1f3fb", native: "\u{1F9D6}\u{1F3FB}" }, { unified: "1f9d6-1f3fc", native: "\u{1F9D6}\u{1F3FC}" }, { unified: "1f9d6-1f3fd", native: "\u{1F9D6}\u{1F3FD}" }, { unified: "1f9d6-1f3fe", native: "\u{1F9D6}\u{1F3FE}" }, { unified: "1f9d6-1f3ff", native: "\u{1F9D6}\u{1F3FF}" }], version: 5 }, man_in_steamy_room: { id: "man_in_steamy_room", name: "Man in Steamy Room", keywords: ["male", "spa", "steamroom", "sauna"], skins: [{ unified: "1f9d6-200d-2642-fe0f", native: "\u{1F9D6}\u200D\u2642\uFE0F" }, { unified: "1f9d6-1f3fb-200d-2642-fe0f", native: "\u{1F9D6}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f9d6-1f3fc-200d-2642-fe0f", native: "\u{1F9D6}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f9d6-1f3fd-200d-2642-fe0f", native: "\u{1F9D6}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f9d6-1f3fe-200d-2642-fe0f", native: "\u{1F9D6}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f9d6-1f3ff-200d-2642-fe0f", native: "\u{1F9D6}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 5 }, woman_in_steamy_room: { id: "woman_in_steamy_room", name: "Woman in Steamy Room", keywords: ["female", "spa", "steamroom", "sauna"], skins: [{ unified: "1f9d6-200d-2640-fe0f", native: "\u{1F9D6}\u200D\u2640\uFE0F" }, { unified: "1f9d6-1f3fb-200d-2640-fe0f", native: "\u{1F9D6}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f9d6-1f3fc-200d-2640-fe0f", native: "\u{1F9D6}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f9d6-1f3fd-200d-2640-fe0f", native: "\u{1F9D6}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f9d6-1f3fe-200d-2640-fe0f", native: "\u{1F9D6}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f9d6-1f3ff-200d-2640-fe0f", native: "\u{1F9D6}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 5 }, person_climbing: { id: "person_climbing", name: "Person Climbing", keywords: ["sport"], skins: [{ unified: "1f9d7", native: "\u{1F9D7}" }, { unified: "1f9d7-1f3fb", native: "\u{1F9D7}\u{1F3FB}" }, { unified: "1f9d7-1f3fc", native: "\u{1F9D7}\u{1F3FC}" }, { unified: "1f9d7-1f3fd", native: "\u{1F9D7}\u{1F3FD}" }, { unified: "1f9d7-1f3fe", native: "\u{1F9D7}\u{1F3FE}" }, { unified: "1f9d7-1f3ff", native: "\u{1F9D7}\u{1F3FF}" }], version: 5 }, man_climbing: { id: "man_climbing", name: "Man Climbing", keywords: ["sports", "hobby", "male", "rock"], skins: [{ unified: "1f9d7-200d-2642-fe0f", native: "\u{1F9D7}\u200D\u2642\uFE0F" }, { unified: "1f9d7-1f3fb-200d-2642-fe0f", native: "\u{1F9D7}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f9d7-1f3fc-200d-2642-fe0f", native: "\u{1F9D7}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f9d7-1f3fd-200d-2642-fe0f", native: "\u{1F9D7}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f9d7-1f3fe-200d-2642-fe0f", native: "\u{1F9D7}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f9d7-1f3ff-200d-2642-fe0f", native: "\u{1F9D7}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 5 }, woman_climbing: { id: "woman_climbing", name: "Woman Climbing", keywords: ["sports", "hobby", "female", "rock"], skins: [{ unified: "1f9d7-200d-2640-fe0f", native: "\u{1F9D7}\u200D\u2640\uFE0F" }, { unified: "1f9d7-1f3fb-200d-2640-fe0f", native: "\u{1F9D7}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f9d7-1f3fc-200d-2640-fe0f", native: "\u{1F9D7}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f9d7-1f3fd-200d-2640-fe0f", native: "\u{1F9D7}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f9d7-1f3fe-200d-2640-fe0f", native: "\u{1F9D7}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f9d7-1f3ff-200d-2640-fe0f", native: "\u{1F9D7}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 5 }, fencer: { id: "fencer", name: "Fencer", keywords: ["person", "fencing", "sports", "sword"], skins: [{ unified: "1f93a", native: "\u{1F93A}" }], version: 3 }, horse_racing: { id: "horse_racing", name: "Horse Racing", keywords: ["animal", "betting", "competition", "gambling", "luck"], skins: [{ unified: "1f3c7", native: "\u{1F3C7}" }, { unified: "1f3c7-1f3fb", native: "\u{1F3C7}\u{1F3FB}" }, { unified: "1f3c7-1f3fc", native: "\u{1F3C7}\u{1F3FC}" }, { unified: "1f3c7-1f3fd", native: "\u{1F3C7}\u{1F3FD}" }, { unified: "1f3c7-1f3fe", native: "\u{1F3C7}\u{1F3FE}" }, { unified: "1f3c7-1f3ff", native: "\u{1F3C7}\u{1F3FF}" }], version: 1 }, skier: { id: "skier", name: "Skier", keywords: ["sports", "winter", "snow"], skins: [{ unified: "26f7-fe0f", native: "\u26F7\uFE0F" }], version: 1 }, snowboarder: { id: "snowboarder", name: "Snowboarder", keywords: ["sports", "winter"], skins: [{ unified: "1f3c2", native: "\u{1F3C2}" }, { unified: "1f3c2-1f3fb", native: "\u{1F3C2}\u{1F3FB}" }, { unified: "1f3c2-1f3fc", native: "\u{1F3C2}\u{1F3FC}" }, { unified: "1f3c2-1f3fd", native: "\u{1F3C2}\u{1F3FD}" }, { unified: "1f3c2-1f3fe", native: "\u{1F3C2}\u{1F3FE}" }, { unified: "1f3c2-1f3ff", native: "\u{1F3C2}\u{1F3FF}" }], version: 1 }, golfer: { id: "golfer", name: "Person Golfing", keywords: ["golfer", "sports", "business"], skins: [{ unified: "1f3cc-fe0f", native: "\u{1F3CC}\uFE0F" }, { unified: "1f3cc-1f3fb", native: "\u{1F3CC}\u{1F3FB}" }, { unified: "1f3cc-1f3fc", native: "\u{1F3CC}\u{1F3FC}" }, { unified: "1f3cc-1f3fd", native: "\u{1F3CC}\u{1F3FD}" }, { unified: "1f3cc-1f3fe", native: "\u{1F3CC}\u{1F3FE}" }, { unified: "1f3cc-1f3ff", native: "\u{1F3CC}\u{1F3FF}" }], version: 1 }, "man-golfing": { id: "man-golfing", name: "Man Golfing", keywords: ["sport"], skins: [{ unified: "1f3cc-fe0f-200d-2642-fe0f", native: "\u{1F3CC}\uFE0F\u200D\u2642\uFE0F" }, { unified: "1f3cc-1f3fb-200d-2642-fe0f", native: "\u{1F3CC}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f3cc-1f3fc-200d-2642-fe0f", native: "\u{1F3CC}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f3cc-1f3fd-200d-2642-fe0f", native: "\u{1F3CC}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f3cc-1f3fe-200d-2642-fe0f", native: "\u{1F3CC}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f3cc-1f3ff-200d-2642-fe0f", native: "\u{1F3CC}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-golfing": { id: "woman-golfing", name: "Woman Golfing", keywords: ["sports", "business", "female"], skins: [{ unified: "1f3cc-fe0f-200d-2640-fe0f", native: "\u{1F3CC}\uFE0F\u200D\u2640\uFE0F" }, { unified: "1f3cc-1f3fb-200d-2640-fe0f", native: "\u{1F3CC}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f3cc-1f3fc-200d-2640-fe0f", native: "\u{1F3CC}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f3cc-1f3fd-200d-2640-fe0f", native: "\u{1F3CC}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f3cc-1f3fe-200d-2640-fe0f", native: "\u{1F3CC}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f3cc-1f3ff-200d-2640-fe0f", native: "\u{1F3CC}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, surfer: { id: "surfer", name: "Surfer", keywords: ["person", "surfing", "sport", "sea"], skins: [{ unified: "1f3c4", native: "\u{1F3C4}" }, { unified: "1f3c4-1f3fb", native: "\u{1F3C4}\u{1F3FB}" }, { unified: "1f3c4-1f3fc", native: "\u{1F3C4}\u{1F3FC}" }, { unified: "1f3c4-1f3fd", native: "\u{1F3C4}\u{1F3FD}" }, { unified: "1f3c4-1f3fe", native: "\u{1F3C4}\u{1F3FE}" }, { unified: "1f3c4-1f3ff", native: "\u{1F3C4}\u{1F3FF}" }], version: 1 }, "man-surfing": { id: "man-surfing", name: "Man Surfing", keywords: ["sports", "ocean", "sea", "summer", "beach"], skins: [{ unified: "1f3c4-200d-2642-fe0f", native: "\u{1F3C4}\u200D\u2642\uFE0F" }, { unified: "1f3c4-1f3fb-200d-2642-fe0f", native: "\u{1F3C4}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f3c4-1f3fc-200d-2642-fe0f", native: "\u{1F3C4}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f3c4-1f3fd-200d-2642-fe0f", native: "\u{1F3C4}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f3c4-1f3fe-200d-2642-fe0f", native: "\u{1F3C4}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f3c4-1f3ff-200d-2642-fe0f", native: "\u{1F3C4}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-surfing": { id: "woman-surfing", name: "Woman Surfing", keywords: ["sports", "ocean", "sea", "summer", "beach", "female"], skins: [{ unified: "1f3c4-200d-2640-fe0f", native: "\u{1F3C4}\u200D\u2640\uFE0F" }, { unified: "1f3c4-1f3fb-200d-2640-fe0f", native: "\u{1F3C4}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f3c4-1f3fc-200d-2640-fe0f", native: "\u{1F3C4}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f3c4-1f3fd-200d-2640-fe0f", native: "\u{1F3C4}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f3c4-1f3fe-200d-2640-fe0f", native: "\u{1F3C4}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f3c4-1f3ff-200d-2640-fe0f", native: "\u{1F3C4}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, rowboat: { id: "rowboat", name: "Rowboat", keywords: ["person", "rowing", "boat", "sport", "move"], skins: [{ unified: "1f6a3", native: "\u{1F6A3}" }, { unified: "1f6a3-1f3fb", native: "\u{1F6A3}\u{1F3FB}" }, { unified: "1f6a3-1f3fc", native: "\u{1F6A3}\u{1F3FC}" }, { unified: "1f6a3-1f3fd", native: "\u{1F6A3}\u{1F3FD}" }, { unified: "1f6a3-1f3fe", native: "\u{1F6A3}\u{1F3FE}" }, { unified: "1f6a3-1f3ff", native: "\u{1F6A3}\u{1F3FF}" }], version: 1 }, "man-rowing-boat": { id: "man-rowing-boat", name: "Man Rowing Boat", keywords: ["rowing-boat", "sports", "hobby", "water", "ship"], skins: [{ unified: "1f6a3-200d-2642-fe0f", native: "\u{1F6A3}\u200D\u2642\uFE0F" }, { unified: "1f6a3-1f3fb-200d-2642-fe0f", native: "\u{1F6A3}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f6a3-1f3fc-200d-2642-fe0f", native: "\u{1F6A3}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f6a3-1f3fd-200d-2642-fe0f", native: "\u{1F6A3}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f6a3-1f3fe-200d-2642-fe0f", native: "\u{1F6A3}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f6a3-1f3ff-200d-2642-fe0f", native: "\u{1F6A3}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-rowing-boat": { id: "woman-rowing-boat", name: "Woman Rowing Boat", keywords: ["rowing-boat", "sports", "hobby", "water", "ship", "female"], skins: [{ unified: "1f6a3-200d-2640-fe0f", native: "\u{1F6A3}\u200D\u2640\uFE0F" }, { unified: "1f6a3-1f3fb-200d-2640-fe0f", native: "\u{1F6A3}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f6a3-1f3fc-200d-2640-fe0f", native: "\u{1F6A3}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f6a3-1f3fd-200d-2640-fe0f", native: "\u{1F6A3}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f6a3-1f3fe-200d-2640-fe0f", native: "\u{1F6A3}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f6a3-1f3ff-200d-2640-fe0f", native: "\u{1F6A3}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, swimmer: { id: "swimmer", name: "Swimmer", keywords: ["person", "swimming", "sport", "pool"], skins: [{ unified: "1f3ca", native: "\u{1F3CA}" }, { unified: "1f3ca-1f3fb", native: "\u{1F3CA}\u{1F3FB}" }, { unified: "1f3ca-1f3fc", native: "\u{1F3CA}\u{1F3FC}" }, { unified: "1f3ca-1f3fd", native: "\u{1F3CA}\u{1F3FD}" }, { unified: "1f3ca-1f3fe", native: "\u{1F3CA}\u{1F3FE}" }, { unified: "1f3ca-1f3ff", native: "\u{1F3CA}\u{1F3FF}" }], version: 1 }, "man-swimming": { id: "man-swimming", name: "Man Swimming", keywords: ["sports", "exercise", "human", "athlete", "water", "summer"], skins: [{ unified: "1f3ca-200d-2642-fe0f", native: "\u{1F3CA}\u200D\u2642\uFE0F" }, { unified: "1f3ca-1f3fb-200d-2642-fe0f", native: "\u{1F3CA}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f3ca-1f3fc-200d-2642-fe0f", native: "\u{1F3CA}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f3ca-1f3fd-200d-2642-fe0f", native: "\u{1F3CA}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f3ca-1f3fe-200d-2642-fe0f", native: "\u{1F3CA}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f3ca-1f3ff-200d-2642-fe0f", native: "\u{1F3CA}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-swimming": { id: "woman-swimming", name: "Woman Swimming", keywords: ["sports", "exercise", "human", "athlete", "water", "summer", "female"], skins: [{ unified: "1f3ca-200d-2640-fe0f", native: "\u{1F3CA}\u200D\u2640\uFE0F" }, { unified: "1f3ca-1f3fb-200d-2640-fe0f", native: "\u{1F3CA}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f3ca-1f3fc-200d-2640-fe0f", native: "\u{1F3CA}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f3ca-1f3fd-200d-2640-fe0f", native: "\u{1F3CA}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f3ca-1f3fe-200d-2640-fe0f", native: "\u{1F3CA}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f3ca-1f3ff-200d-2640-fe0f", native: "\u{1F3CA}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, person_with_ball: { id: "person_with_ball", name: "Person Bouncing Ball", keywords: ["with", "sports", "human"], skins: [{ unified: "26f9-fe0f", native: "\u26F9\uFE0F" }, { unified: "26f9-1f3fb", native: "\u26F9\u{1F3FB}" }, { unified: "26f9-1f3fc", native: "\u26F9\u{1F3FC}" }, { unified: "26f9-1f3fd", native: "\u26F9\u{1F3FD}" }, { unified: "26f9-1f3fe", native: "\u26F9\u{1F3FE}" }, { unified: "26f9-1f3ff", native: "\u26F9\u{1F3FF}" }], version: 1 }, "man-bouncing-ball": { id: "man-bouncing-ball", name: "Man Bouncing Ball", keywords: ["bouncing-ball", "sport"], skins: [{ unified: "26f9-fe0f-200d-2642-fe0f", native: "\u26F9\uFE0F\u200D\u2642\uFE0F" }, { unified: "26f9-1f3fb-200d-2642-fe0f", native: "\u26F9\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "26f9-1f3fc-200d-2642-fe0f", native: "\u26F9\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "26f9-1f3fd-200d-2642-fe0f", native: "\u26F9\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "26f9-1f3fe-200d-2642-fe0f", native: "\u26F9\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "26f9-1f3ff-200d-2642-fe0f", native: "\u26F9\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-bouncing-ball": { id: "woman-bouncing-ball", name: "Woman Bouncing Ball", keywords: ["bouncing-ball", "sports", "human", "female"], skins: [{ unified: "26f9-fe0f-200d-2640-fe0f", native: "\u26F9\uFE0F\u200D\u2640\uFE0F" }, { unified: "26f9-1f3fb-200d-2640-fe0f", native: "\u26F9\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "26f9-1f3fc-200d-2640-fe0f", native: "\u26F9\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "26f9-1f3fd-200d-2640-fe0f", native: "\u26F9\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "26f9-1f3fe-200d-2640-fe0f", native: "\u26F9\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "26f9-1f3ff-200d-2640-fe0f", native: "\u26F9\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, weight_lifter: { id: "weight_lifter", name: "Person Lifting Weights", keywords: ["weight", "lifter", "sports", "training", "exercise"], skins: [{ unified: "1f3cb-fe0f", native: "\u{1F3CB}\uFE0F" }, { unified: "1f3cb-1f3fb", native: "\u{1F3CB}\u{1F3FB}" }, { unified: "1f3cb-1f3fc", native: "\u{1F3CB}\u{1F3FC}" }, { unified: "1f3cb-1f3fd", native: "\u{1F3CB}\u{1F3FD}" }, { unified: "1f3cb-1f3fe", native: "\u{1F3CB}\u{1F3FE}" }, { unified: "1f3cb-1f3ff", native: "\u{1F3CB}\u{1F3FF}" }], version: 1 }, "man-lifting-weights": { id: "man-lifting-weights", name: "Man Lifting Weights", keywords: ["lifting-weights", "sport"], skins: [{ unified: "1f3cb-fe0f-200d-2642-fe0f", native: "\u{1F3CB}\uFE0F\u200D\u2642\uFE0F" }, { unified: "1f3cb-1f3fb-200d-2642-fe0f", native: "\u{1F3CB}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f3cb-1f3fc-200d-2642-fe0f", native: "\u{1F3CB}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f3cb-1f3fd-200d-2642-fe0f", native: "\u{1F3CB}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f3cb-1f3fe-200d-2642-fe0f", native: "\u{1F3CB}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f3cb-1f3ff-200d-2642-fe0f", native: "\u{1F3CB}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-lifting-weights": { id: "woman-lifting-weights", name: "Woman Lifting Weights", keywords: ["lifting-weights", "sports", "training", "exercise", "female"], skins: [{ unified: "1f3cb-fe0f-200d-2640-fe0f", native: "\u{1F3CB}\uFE0F\u200D\u2640\uFE0F" }, { unified: "1f3cb-1f3fb-200d-2640-fe0f", native: "\u{1F3CB}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f3cb-1f3fc-200d-2640-fe0f", native: "\u{1F3CB}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f3cb-1f3fd-200d-2640-fe0f", native: "\u{1F3CB}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f3cb-1f3fe-200d-2640-fe0f", native: "\u{1F3CB}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f3cb-1f3ff-200d-2640-fe0f", native: "\u{1F3CB}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, bicyclist: { id: "bicyclist", name: "Bicyclist", keywords: ["person", "biking", "sport", "move"], skins: [{ unified: "1f6b4", native: "\u{1F6B4}" }, { unified: "1f6b4-1f3fb", native: "\u{1F6B4}\u{1F3FB}" }, { unified: "1f6b4-1f3fc", native: "\u{1F6B4}\u{1F3FC}" }, { unified: "1f6b4-1f3fd", native: "\u{1F6B4}\u{1F3FD}" }, { unified: "1f6b4-1f3fe", native: "\u{1F6B4}\u{1F3FE}" }, { unified: "1f6b4-1f3ff", native: "\u{1F6B4}\u{1F3FF}" }], version: 1 }, "man-biking": { id: "man-biking", name: "Man Biking", keywords: ["sports", "bike", "exercise", "hipster"], skins: [{ unified: "1f6b4-200d-2642-fe0f", native: "\u{1F6B4}\u200D\u2642\uFE0F" }, { unified: "1f6b4-1f3fb-200d-2642-fe0f", native: "\u{1F6B4}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f6b4-1f3fc-200d-2642-fe0f", native: "\u{1F6B4}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f6b4-1f3fd-200d-2642-fe0f", native: "\u{1F6B4}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f6b4-1f3fe-200d-2642-fe0f", native: "\u{1F6B4}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f6b4-1f3ff-200d-2642-fe0f", native: "\u{1F6B4}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-biking": { id: "woman-biking", name: "Woman Biking", keywords: ["sports", "bike", "exercise", "hipster", "female"], skins: [{ unified: "1f6b4-200d-2640-fe0f", native: "\u{1F6B4}\u200D\u2640\uFE0F" }, { unified: "1f6b4-1f3fb-200d-2640-fe0f", native: "\u{1F6B4}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f6b4-1f3fc-200d-2640-fe0f", native: "\u{1F6B4}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f6b4-1f3fd-200d-2640-fe0f", native: "\u{1F6B4}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f6b4-1f3fe-200d-2640-fe0f", native: "\u{1F6B4}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f6b4-1f3ff-200d-2640-fe0f", native: "\u{1F6B4}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, mountain_bicyclist: { id: "mountain_bicyclist", name: "Mountain Bicyclist", keywords: ["person", "biking", "sport", "move"], skins: [{ unified: "1f6b5", native: "\u{1F6B5}" }, { unified: "1f6b5-1f3fb", native: "\u{1F6B5}\u{1F3FB}" }, { unified: "1f6b5-1f3fc", native: "\u{1F6B5}\u{1F3FC}" }, { unified: "1f6b5-1f3fd", native: "\u{1F6B5}\u{1F3FD}" }, { unified: "1f6b5-1f3fe", native: "\u{1F6B5}\u{1F3FE}" }, { unified: "1f6b5-1f3ff", native: "\u{1F6B5}\u{1F3FF}" }], version: 1 }, "man-mountain-biking": { id: "man-mountain-biking", name: "Man Mountain Biking", keywords: ["mountain-biking", "transportation", "sports", "human", "race", "bike"], skins: [{ unified: "1f6b5-200d-2642-fe0f", native: "\u{1F6B5}\u200D\u2642\uFE0F" }, { unified: "1f6b5-1f3fb-200d-2642-fe0f", native: "\u{1F6B5}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f6b5-1f3fc-200d-2642-fe0f", native: "\u{1F6B5}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f6b5-1f3fd-200d-2642-fe0f", native: "\u{1F6B5}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f6b5-1f3fe-200d-2642-fe0f", native: "\u{1F6B5}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f6b5-1f3ff-200d-2642-fe0f", native: "\u{1F6B5}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-mountain-biking": { id: "woman-mountain-biking", name: "Woman Mountain Biking", keywords: ["mountain-biking", "transportation", "sports", "human", "race", "bike", "female"], skins: [{ unified: "1f6b5-200d-2640-fe0f", native: "\u{1F6B5}\u200D\u2640\uFE0F" }, { unified: "1f6b5-1f3fb-200d-2640-fe0f", native: "\u{1F6B5}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f6b5-1f3fc-200d-2640-fe0f", native: "\u{1F6B5}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f6b5-1f3fd-200d-2640-fe0f", native: "\u{1F6B5}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f6b5-1f3fe-200d-2640-fe0f", native: "\u{1F6B5}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f6b5-1f3ff-200d-2640-fe0f", native: "\u{1F6B5}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, person_doing_cartwheel: { id: "person_doing_cartwheel", name: "Person Cartwheeling", keywords: ["doing", "cartwheel", "sport", "gymnastic"], skins: [{ unified: "1f938", native: "\u{1F938}" }, { unified: "1f938-1f3fb", native: "\u{1F938}\u{1F3FB}" }, { unified: "1f938-1f3fc", native: "\u{1F938}\u{1F3FC}" }, { unified: "1f938-1f3fd", native: "\u{1F938}\u{1F3FD}" }, { unified: "1f938-1f3fe", native: "\u{1F938}\u{1F3FE}" }, { unified: "1f938-1f3ff", native: "\u{1F938}\u{1F3FF}" }], version: 3 }, "man-cartwheeling": { id: "man-cartwheeling", name: "Man Cartwheeling", keywords: ["gymnastics"], skins: [{ unified: "1f938-200d-2642-fe0f", native: "\u{1F938}\u200D\u2642\uFE0F" }, { unified: "1f938-1f3fb-200d-2642-fe0f", native: "\u{1F938}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f938-1f3fc-200d-2642-fe0f", native: "\u{1F938}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f938-1f3fd-200d-2642-fe0f", native: "\u{1F938}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f938-1f3fe-200d-2642-fe0f", native: "\u{1F938}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f938-1f3ff-200d-2642-fe0f", native: "\u{1F938}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-cartwheeling": { id: "woman-cartwheeling", name: "Woman Cartwheeling", keywords: ["gymnastics"], skins: [{ unified: "1f938-200d-2640-fe0f", native: "\u{1F938}\u200D\u2640\uFE0F" }, { unified: "1f938-1f3fb-200d-2640-fe0f", native: "\u{1F938}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f938-1f3fc-200d-2640-fe0f", native: "\u{1F938}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f938-1f3fd-200d-2640-fe0f", native: "\u{1F938}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f938-1f3fe-200d-2640-fe0f", native: "\u{1F938}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f938-1f3ff-200d-2640-fe0f", native: "\u{1F938}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, wrestlers: { id: "wrestlers", name: "Wrestlers", keywords: ["people", "wrestling", "sport"], skins: [{ unified: "1f93c", native: "\u{1F93C}" }], version: 3 }, "man-wrestling": { id: "man-wrestling", name: "Men Wrestling", keywords: ["man", "sports", "wrestlers"], skins: [{ unified: "1f93c-200d-2642-fe0f", native: "\u{1F93C}\u200D\u2642\uFE0F" }], version: 4 }, "woman-wrestling": { id: "woman-wrestling", name: "Women Wrestling", keywords: ["woman", "sports", "wrestlers"], skins: [{ unified: "1f93c-200d-2640-fe0f", native: "\u{1F93C}\u200D\u2640\uFE0F" }], version: 4 }, water_polo: { id: "water_polo", name: "Water Polo", keywords: ["person", "playing", "sport"], skins: [{ unified: "1f93d", native: "\u{1F93D}" }, { unified: "1f93d-1f3fb", native: "\u{1F93D}\u{1F3FB}" }, { unified: "1f93d-1f3fc", native: "\u{1F93D}\u{1F3FC}" }, { unified: "1f93d-1f3fd", native: "\u{1F93D}\u{1F3FD}" }, { unified: "1f93d-1f3fe", native: "\u{1F93D}\u{1F3FE}" }, { unified: "1f93d-1f3ff", native: "\u{1F93D}\u{1F3FF}" }], version: 3 }, "man-playing-water-polo": { id: "man-playing-water-polo", name: "Man Playing Water Polo", keywords: ["playing-water-polo", "sports", "pool"], skins: [{ unified: "1f93d-200d-2642-fe0f", native: "\u{1F93D}\u200D\u2642\uFE0F" }, { unified: "1f93d-1f3fb-200d-2642-fe0f", native: "\u{1F93D}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f93d-1f3fc-200d-2642-fe0f", native: "\u{1F93D}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f93d-1f3fd-200d-2642-fe0f", native: "\u{1F93D}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f93d-1f3fe-200d-2642-fe0f", native: "\u{1F93D}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f93d-1f3ff-200d-2642-fe0f", native: "\u{1F93D}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-playing-water-polo": { id: "woman-playing-water-polo", name: "Woman Playing Water Polo", keywords: ["playing-water-polo", "sports", "pool"], skins: [{ unified: "1f93d-200d-2640-fe0f", native: "\u{1F93D}\u200D\u2640\uFE0F" }, { unified: "1f93d-1f3fb-200d-2640-fe0f", native: "\u{1F93D}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f93d-1f3fc-200d-2640-fe0f", native: "\u{1F93D}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f93d-1f3fd-200d-2640-fe0f", native: "\u{1F93D}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f93d-1f3fe-200d-2640-fe0f", native: "\u{1F93D}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f93d-1f3ff-200d-2640-fe0f", native: "\u{1F93D}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, handball: { id: "handball", name: "Handball", keywords: ["person", "playing", "sport"], skins: [{ unified: "1f93e", native: "\u{1F93E}" }, { unified: "1f93e-1f3fb", native: "\u{1F93E}\u{1F3FB}" }, { unified: "1f93e-1f3fc", native: "\u{1F93E}\u{1F3FC}" }, { unified: "1f93e-1f3fd", native: "\u{1F93E}\u{1F3FD}" }, { unified: "1f93e-1f3fe", native: "\u{1F93E}\u{1F3FE}" }, { unified: "1f93e-1f3ff", native: "\u{1F93E}\u{1F3FF}" }], version: 3 }, "man-playing-handball": { id: "man-playing-handball", name: "Man Playing Handball", keywords: ["playing-handball", "sports"], skins: [{ unified: "1f93e-200d-2642-fe0f", native: "\u{1F93E}\u200D\u2642\uFE0F" }, { unified: "1f93e-1f3fb-200d-2642-fe0f", native: "\u{1F93E}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f93e-1f3fc-200d-2642-fe0f", native: "\u{1F93E}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f93e-1f3fd-200d-2642-fe0f", native: "\u{1F93E}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f93e-1f3fe-200d-2642-fe0f", native: "\u{1F93E}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f93e-1f3ff-200d-2642-fe0f", native: "\u{1F93E}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-playing-handball": { id: "woman-playing-handball", name: "Woman Playing Handball", keywords: ["playing-handball", "sports"], skins: [{ unified: "1f93e-200d-2640-fe0f", native: "\u{1F93E}\u200D\u2640\uFE0F" }, { unified: "1f93e-1f3fb-200d-2640-fe0f", native: "\u{1F93E}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f93e-1f3fc-200d-2640-fe0f", native: "\u{1F93E}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f93e-1f3fd-200d-2640-fe0f", native: "\u{1F93E}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f93e-1f3fe-200d-2640-fe0f", native: "\u{1F93E}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f93e-1f3ff-200d-2640-fe0f", native: "\u{1F93E}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, juggling: { id: "juggling", name: "Juggling", keywords: ["person", "performance", "balance"], skins: [{ unified: "1f939", native: "\u{1F939}" }, { unified: "1f939-1f3fb", native: "\u{1F939}\u{1F3FB}" }, { unified: "1f939-1f3fc", native: "\u{1F939}\u{1F3FC}" }, { unified: "1f939-1f3fd", native: "\u{1F939}\u{1F3FD}" }, { unified: "1f939-1f3fe", native: "\u{1F939}\u{1F3FE}" }, { unified: "1f939-1f3ff", native: "\u{1F939}\u{1F3FF}" }], version: 3 }, "man-juggling": { id: "man-juggling", name: "Man Juggling", keywords: ["juggle", "balance", "skill", "multitask"], skins: [{ unified: "1f939-200d-2642-fe0f", native: "\u{1F939}\u200D\u2642\uFE0F" }, { unified: "1f939-1f3fb-200d-2642-fe0f", native: "\u{1F939}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f939-1f3fc-200d-2642-fe0f", native: "\u{1F939}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f939-1f3fd-200d-2642-fe0f", native: "\u{1F939}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f939-1f3fe-200d-2642-fe0f", native: "\u{1F939}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f939-1f3ff-200d-2642-fe0f", native: "\u{1F939}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 4 }, "woman-juggling": { id: "woman-juggling", name: "Woman Juggling", keywords: ["juggle", "balance", "skill", "multitask"], skins: [{ unified: "1f939-200d-2640-fe0f", native: "\u{1F939}\u200D\u2640\uFE0F" }, { unified: "1f939-1f3fb-200d-2640-fe0f", native: "\u{1F939}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f939-1f3fc-200d-2640-fe0f", native: "\u{1F939}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f939-1f3fd-200d-2640-fe0f", native: "\u{1F939}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f939-1f3fe-200d-2640-fe0f", native: "\u{1F939}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f939-1f3ff-200d-2640-fe0f", native: "\u{1F939}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 4 }, person_in_lotus_position: { id: "person_in_lotus_position", name: "Person in Lotus Position", keywords: ["meditate"], skins: [{ unified: "1f9d8", native: "\u{1F9D8}" }, { unified: "1f9d8-1f3fb", native: "\u{1F9D8}\u{1F3FB}" }, { unified: "1f9d8-1f3fc", native: "\u{1F9D8}\u{1F3FC}" }, { unified: "1f9d8-1f3fd", native: "\u{1F9D8}\u{1F3FD}" }, { unified: "1f9d8-1f3fe", native: "\u{1F9D8}\u{1F3FE}" }, { unified: "1f9d8-1f3ff", native: "\u{1F9D8}\u{1F3FF}" }], version: 5 }, man_in_lotus_position: { id: "man_in_lotus_position", name: "Man in Lotus Position", keywords: ["male", "meditation", "yoga", "serenity", "zen", "mindfulness"], skins: [{ unified: "1f9d8-200d-2642-fe0f", native: "\u{1F9D8}\u200D\u2642\uFE0F" }, { unified: "1f9d8-1f3fb-200d-2642-fe0f", native: "\u{1F9D8}\u{1F3FB}\u200D\u2642\uFE0F" }, { unified: "1f9d8-1f3fc-200d-2642-fe0f", native: "\u{1F9D8}\u{1F3FC}\u200D\u2642\uFE0F" }, { unified: "1f9d8-1f3fd-200d-2642-fe0f", native: "\u{1F9D8}\u{1F3FD}\u200D\u2642\uFE0F" }, { unified: "1f9d8-1f3fe-200d-2642-fe0f", native: "\u{1F9D8}\u{1F3FE}\u200D\u2642\uFE0F" }, { unified: "1f9d8-1f3ff-200d-2642-fe0f", native: "\u{1F9D8}\u{1F3FF}\u200D\u2642\uFE0F" }], version: 5 }, woman_in_lotus_position: { id: "woman_in_lotus_position", name: "Woman in Lotus Position", keywords: ["female", "meditation", "yoga", "serenity", "zen", "mindfulness"], skins: [{ unified: "1f9d8-200d-2640-fe0f", native: "\u{1F9D8}\u200D\u2640\uFE0F" }, { unified: "1f9d8-1f3fb-200d-2640-fe0f", native: "\u{1F9D8}\u{1F3FB}\u200D\u2640\uFE0F" }, { unified: "1f9d8-1f3fc-200d-2640-fe0f", native: "\u{1F9D8}\u{1F3FC}\u200D\u2640\uFE0F" }, { unified: "1f9d8-1f3fd-200d-2640-fe0f", native: "\u{1F9D8}\u{1F3FD}\u200D\u2640\uFE0F" }, { unified: "1f9d8-1f3fe-200d-2640-fe0f", native: "\u{1F9D8}\u{1F3FE}\u200D\u2640\uFE0F" }, { unified: "1f9d8-1f3ff-200d-2640-fe0f", native: "\u{1F9D8}\u{1F3FF}\u200D\u2640\uFE0F" }], version: 5 }, bath: { id: "bath", name: "Bath", keywords: ["person", "taking", "clean", "shower", "bathroom"], skins: [{ unified: "1f6c0", native: "\u{1F6C0}" }, { unified: "1f6c0-1f3fb", native: "\u{1F6C0}\u{1F3FB}" }, { unified: "1f6c0-1f3fc", native: "\u{1F6C0}\u{1F3FC}" }, { unified: "1f6c0-1f3fd", native: "\u{1F6C0}\u{1F3FD}" }, { unified: "1f6c0-1f3fe", native: "\u{1F6C0}\u{1F3FE}" }, { unified: "1f6c0-1f3ff", native: "\u{1F6C0}\u{1F3FF}" }], version: 1 }, sleeping_accommodation: { id: "sleeping_accommodation", name: "Person in Bed", keywords: ["sleeping", "accommodation", "rest"], skins: [{ unified: "1f6cc", native: "\u{1F6CC}" }, { unified: "1f6cc-1f3fb", native: "\u{1F6CC}\u{1F3FB}" }, { unified: "1f6cc-1f3fc", native: "\u{1F6CC}\u{1F3FC}" }, { unified: "1f6cc-1f3fd", native: "\u{1F6CC}\u{1F3FD}" }, { unified: "1f6cc-1f3fe", native: "\u{1F6CC}\u{1F3FE}" }, { unified: "1f6cc-1f3ff", native: "\u{1F6CC}\u{1F3FF}" }], version: 1 }, people_holding_hands: { id: "people_holding_hands", name: "People Holding Hands", keywords: ["friendship"], skins: [{ unified: "1f9d1-200d-1f91d-200d-1f9d1", native: "\u{1F9D1}\u200D\u{1F91D}\u200D\u{1F9D1}" }, { unified: "1f9d1-1f3fb-200d-1f91d-200d-1f9d1-1f3fb", native: "\u{1F9D1}\u{1F3FB}\u200D\u{1F91D}\u200D\u{1F9D1}\u{1F3FB}" }, { unified: "1f9d1-1f3fc-200d-1f91d-200d-1f9d1-1f3fc", native: "\u{1F9D1}\u{1F3FC}\u200D\u{1F91D}\u200D\u{1F9D1}\u{1F3FC}" }, { unified: "1f9d1-1f3fd-200d-1f91d-200d-1f9d1-1f3fd", native: "\u{1F9D1}\u{1F3FD}\u200D\u{1F91D}\u200D\u{1F9D1}\u{1F3FD}" }, { unified: "1f9d1-1f3fe-200d-1f91d-200d-1f9d1-1f3fe", native: "\u{1F9D1}\u{1F3FE}\u200D\u{1F91D}\u200D\u{1F9D1}\u{1F3FE}" }, { unified: "1f9d1-1f3ff-200d-1f91d-200d-1f9d1-1f3ff", native: "\u{1F9D1}\u{1F3FF}\u200D\u{1F91D}\u200D\u{1F9D1}\u{1F3FF}" }], version: 12 }, two_women_holding_hands: { id: "two_women_holding_hands", name: "Women Holding Hands", keywords: ["two", "pair", "friendship", "couple", "love", "like", "female", "people", "human"], skins: [{ unified: "1f46d", native: "\u{1F46D}" }, { unified: "1f46d-1f3fb", native: "\u{1F46D}\u{1F3FB}" }, { unified: "1f46d-1f3fc", native: "\u{1F46D}\u{1F3FC}" }, { unified: "1f46d-1f3fd", native: "\u{1F46D}\u{1F3FD}" }, { unified: "1f46d-1f3fe", native: "\u{1F46D}\u{1F3FE}" }, { unified: "1f46d-1f3ff", native: "\u{1F46D}\u{1F3FF}" }], version: 1 }, man_and_woman_holding_hands: { id: "man_and_woman_holding_hands", name: "Man and Woman Holding Hands", keywords: ["couple", "pair", "people", "human", "love", "date", "dating", "like", "affection", "valentines", "marriage"], skins: [{ unified: "1f46b", native: "\u{1F46B}" }, { unified: "1f46b-1f3fb", native: "\u{1F46B}\u{1F3FB}" }, { unified: "1f46b-1f3fc", native: "\u{1F46B}\u{1F3FC}" }, { unified: "1f46b-1f3fd", native: "\u{1F46B}\u{1F3FD}" }, { unified: "1f46b-1f3fe", native: "\u{1F46B}\u{1F3FE}" }, { unified: "1f46b-1f3ff", native: "\u{1F46B}\u{1F3FF}" }], version: 1 }, two_men_holding_hands: { id: "two_men_holding_hands", name: "Men Holding Hands", keywords: ["two", "pair", "couple", "love", "like", "bromance", "friendship", "people", "human"], skins: [{ unified: "1f46c", native: "\u{1F46C}" }, { unified: "1f46c-1f3fb", native: "\u{1F46C}\u{1F3FB}" }, { unified: "1f46c-1f3fc", native: "\u{1F46C}\u{1F3FC}" }, { unified: "1f46c-1f3fd", native: "\u{1F46C}\u{1F3FD}" }, { unified: "1f46c-1f3fe", native: "\u{1F46C}\u{1F3FE}" }, { unified: "1f46c-1f3ff", native: "\u{1F46C}\u{1F3FF}" }], version: 1 }, couplekiss: { id: "couplekiss", name: "Kiss", keywords: ["couplekiss", "pair", "valentines", "love", "like", "dating", "marriage"], skins: [{ unified: "1f48f", native: "\u{1F48F}" }, { unified: "1f48f-1f3fb", native: "\u{1F48F}\u{1F3FB}" }, { unified: "1f48f-1f3fc", native: "\u{1F48F}\u{1F3FC}" }, { unified: "1f48f-1f3fd", native: "\u{1F48F}\u{1F3FD}" }, { unified: "1f48f-1f3fe", native: "\u{1F48F}\u{1F3FE}" }, { unified: "1f48f-1f3ff", native: "\u{1F48F}\u{1F3FF}" }], version: 1 }, "woman-kiss-man": { id: "woman-kiss-man", name: "Kiss: Woman, Man", keywords: ["woman", "kiss-man", "kiss", "love"], skins: [{ unified: "1f469-200d-2764-fe0f-200d-1f48b-200d-1f468", native: "\u{1F469}\u200D\u2764\uFE0F\u200D\u{1F48B}\u200D\u{1F468}" }, { unified: "1f469-1f3fb-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fb", native: "\u{1F469}\u{1F3FB}\u200D\u2764\uFE0F\u200D\u{1F48B}\u200D\u{1F468}\u{1F3FB}" }, { unified: "1f469-1f3fc-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fc", native: "\u{1F469}\u{1F3FC}\u200D\u2764\uFE0F\u200D\u{1F48B}\u200D\u{1F468}\u{1F3FC}" }, { unified: "1f469-1f3fd-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fd", native: "\u{1F469}\u{1F3FD}\u200D\u2764\uFE0F\u200D\u{1F48B}\u200D\u{1F468}\u{1F3FD}" }, { unified: "1f469-1f3fe-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fe", native: "\u{1F469}\u{1F3FE}\u200D\u2764\uFE0F\u200D\u{1F48B}\u200D\u{1F468}\u{1F3FE}" }, { unified: "1f469-1f3ff-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3ff", native: "\u{1F469}\u{1F3FF}\u200D\u2764\uFE0F\u200D\u{1F48B}\u200D\u{1F468}\u{1F3FF}" }], version: 2 }, "man-kiss-man": { id: "man-kiss-man", name: "Kiss: Man, Man", keywords: ["kiss-man", "kiss", "pair", "valentines", "love", "like", "dating", "marriage"], skins: [{ unified: "1f468-200d-2764-fe0f-200d-1f48b-200d-1f468", native: "\u{1F468}\u200D\u2764\uFE0F\u200D\u{1F48B}\u200D\u{1F468}" }, { unified: "1f468-1f3fb-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fb", native: "\u{1F468}\u{1F3FB}\u200D\u2764\uFE0F\u200D\u{1F48B}\u200D\u{1F468}\u{1F3FB}" }, { unified: "1f468-1f3fc-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fc", native: "\u{1F468}\u{1F3FC}\u200D\u2764\uFE0F\u200D\u{1F48B}\u200D\u{1F468}\u{1F3FC}" }, { unified: "1f468-1f3fd-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fd", native: "\u{1F468}\u{1F3FD}\u200D\u2764\uFE0F\u200D\u{1F48B}\u200D\u{1F468}\u{1F3FD}" }, { unified: "1f468-1f3fe-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fe", native: "\u{1F468}\u{1F3FE}\u200D\u2764\uFE0F\u200D\u{1F48B}\u200D\u{1F468}\u{1F3FE}" }, { unified: "1f468-1f3ff-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3ff", native: "\u{1F468}\u{1F3FF}\u200D\u2764\uFE0F\u200D\u{1F48B}\u200D\u{1F468}\u{1F3FF}" }], version: 2 }, "woman-kiss-woman": { id: "woman-kiss-woman", name: "Kiss: Woman, Woman", keywords: ["kiss-woman", "kiss", "pair", "valentines", "love", "like", "dating", "marriage"], skins: [{ unified: "1f469-200d-2764-fe0f-200d-1f48b-200d-1f469", native: "\u{1F469}\u200D\u2764\uFE0F\u200D\u{1F48B}\u200D\u{1F469}" }, { unified: "1f469-1f3fb-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3fb", native: "\u{1F469}\u{1F3FB}\u200D\u2764\uFE0F\u200D\u{1F48B}\u200D\u{1F469}\u{1F3FB}" }, { unified: "1f469-1f3fc-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3fc", native: "\u{1F469}\u{1F3FC}\u200D\u2764\uFE0F\u200D\u{1F48B}\u200D\u{1F469}\u{1F3FC}" }, { unified: "1f469-1f3fd-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3fd", native: "\u{1F469}\u{1F3FD}\u200D\u2764\uFE0F\u200D\u{1F48B}\u200D\u{1F469}\u{1F3FD}" }, { unified: "1f469-1f3fe-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3fe", native: "\u{1F469}\u{1F3FE}\u200D\u2764\uFE0F\u200D\u{1F48B}\u200D\u{1F469}\u{1F3FE}" }, { unified: "1f469-1f3ff-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3ff", native: "\u{1F469}\u{1F3FF}\u200D\u2764\uFE0F\u200D\u{1F48B}\u200D\u{1F469}\u{1F3FF}" }], version: 2 }, couple_with_heart: { id: "couple_with_heart", name: "Couple with Heart", keywords: ["pair", "love", "like", "affection", "human", "dating", "valentines", "marriage"], skins: [{ unified: "1f491", native: "\u{1F491}" }, { unified: "1f491-1f3fb", native: "\u{1F491}\u{1F3FB}" }, { unified: "1f491-1f3fc", native: "\u{1F491}\u{1F3FC}" }, { unified: "1f491-1f3fd", native: "\u{1F491}\u{1F3FD}" }, { unified: "1f491-1f3fe", native: "\u{1F491}\u{1F3FE}" }, { unified: "1f491-1f3ff", native: "\u{1F491}\u{1F3FF}" }], version: 1 }, "woman-heart-man": { id: "woman-heart-man", name: "Couple with Heart: Woman, Man", keywords: ["woman", "heart-man", "heart", "love"], skins: [{ unified: "1f469-200d-2764-fe0f-200d-1f468", native: "\u{1F469}\u200D\u2764\uFE0F\u200D\u{1F468}" }, { unified: "1f469-1f3fb-200d-2764-fe0f-200d-1f468-1f3fb", native: "\u{1F469}\u{1F3FB}\u200D\u2764\uFE0F\u200D\u{1F468}\u{1F3FB}" }, { unified: "1f469-1f3fc-200d-2764-fe0f-200d-1f468-1f3fc", native: "\u{1F469}\u{1F3FC}\u200D\u2764\uFE0F\u200D\u{1F468}\u{1F3FC}" }, { unified: "1f469-1f3fd-200d-2764-fe0f-200d-1f468-1f3fd", native: "\u{1F469}\u{1F3FD}\u200D\u2764\uFE0F\u200D\u{1F468}\u{1F3FD}" }, { unified: "1f469-1f3fe-200d-2764-fe0f-200d-1f468-1f3fe", native: "\u{1F469}\u{1F3FE}\u200D\u2764\uFE0F\u200D\u{1F468}\u{1F3FE}" }, { unified: "1f469-1f3ff-200d-2764-fe0f-200d-1f468-1f3ff", native: "\u{1F469}\u{1F3FF}\u200D\u2764\uFE0F\u200D\u{1F468}\u{1F3FF}" }], version: 2 }, "man-heart-man": { id: "man-heart-man", name: "Couple with Heart: Man, Man", keywords: ["heart-man", "heart", "pair", "love", "like", "affection", "human", "dating", "valentines", "marriage"], skins: [{ unified: "1f468-200d-2764-fe0f-200d-1f468", native: "\u{1F468}\u200D\u2764\uFE0F\u200D\u{1F468}" }, { unified: "1f468-1f3fb-200d-2764-fe0f-200d-1f468-1f3fb", native: "\u{1F468}\u{1F3FB}\u200D\u2764\uFE0F\u200D\u{1F468}\u{1F3FB}" }, { unified: "1f468-1f3fc-200d-2764-fe0f-200d-1f468-1f3fc", native: "\u{1F468}\u{1F3FC}\u200D\u2764\uFE0F\u200D\u{1F468}\u{1F3FC}" }, { unified: "1f468-1f3fd-200d-2764-fe0f-200d-1f468-1f3fd", native: "\u{1F468}\u{1F3FD}\u200D\u2764\uFE0F\u200D\u{1F468}\u{1F3FD}" }, { unified: "1f468-1f3fe-200d-2764-fe0f-200d-1f468-1f3fe", native: "\u{1F468}\u{1F3FE}\u200D\u2764\uFE0F\u200D\u{1F468}\u{1F3FE}" }, { unified: "1f468-1f3ff-200d-2764-fe0f-200d-1f468-1f3ff", native: "\u{1F468}\u{1F3FF}\u200D\u2764\uFE0F\u200D\u{1F468}\u{1F3FF}" }], version: 2 }, "woman-heart-woman": { id: "woman-heart-woman", name: "Couple with Heart: Woman, Woman", keywords: ["heart-woman", "heart", "pair", "love", "like", "affection", "human", "dating", "valentines", "marriage"], skins: [{ unified: "1f469-200d-2764-fe0f-200d-1f469", native: "\u{1F469}\u200D\u2764\uFE0F\u200D\u{1F469}" }, { unified: "1f469-1f3fb-200d-2764-fe0f-200d-1f469-1f3fb", native: "\u{1F469}\u{1F3FB}\u200D\u2764\uFE0F\u200D\u{1F469}\u{1F3FB}" }, { unified: "1f469-1f3fc-200d-2764-fe0f-200d-1f469-1f3fc", native: "\u{1F469}\u{1F3FC}\u200D\u2764\uFE0F\u200D\u{1F469}\u{1F3FC}" }, { unified: "1f469-1f3fd-200d-2764-fe0f-200d-1f469-1f3fd", native: "\u{1F469}\u{1F3FD}\u200D\u2764\uFE0F\u200D\u{1F469}\u{1F3FD}" }, { unified: "1f469-1f3fe-200d-2764-fe0f-200d-1f469-1f3fe", native: "\u{1F469}\u{1F3FE}\u200D\u2764\uFE0F\u200D\u{1F469}\u{1F3FE}" }, { unified: "1f469-1f3ff-200d-2764-fe0f-200d-1f469-1f3ff", native: "\u{1F469}\u{1F3FF}\u200D\u2764\uFE0F\u200D\u{1F469}\u{1F3FF}" }], version: 2 }, family: { id: "family", name: "Family", keywords: ["home", "parents", "child", "mom", "dad", "father", "mother", "people", "human"], skins: [{ unified: "1f46a", native: "\u{1F46A}" }], version: 1 }, "man-woman-boy": { id: "man-woman-boy", name: "Family: Man, Woman, Boy", keywords: ["man", "woman-boy", "family", "woman", "love"], skins: [{ unified: "1f468-200d-1f469-200d-1f466", native: "\u{1F468}\u200D\u{1F469}\u200D\u{1F466}" }], version: 2 }, "man-woman-girl": { id: "man-woman-girl", name: "Family: Man, Woman, Girl", keywords: ["man", "woman-girl", "family", "woman", "home", "parents", "people", "human", "child"], skins: [{ unified: "1f468-200d-1f469-200d-1f467", native: "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}" }], version: 2 }, "man-woman-girl-boy": { id: "man-woman-girl-boy", name: "Family: Man, Woman, Girl, Boy", keywords: ["man", "woman-girl-boy", "family", "woman", "girl", "home", "parents", "people", "human", "children"], skins: [{ unified: "1f468-200d-1f469-200d-1f467-200d-1f466", native: "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}" }], version: 2 }, "man-woman-boy-boy": { id: "man-woman-boy-boy", name: "Family: Man, Woman, Boy, Boy", keywords: ["man", "woman-boy-boy", "family", "woman", "home", "parents", "people", "human", "children"], skins: [{ unified: "1f468-200d-1f469-200d-1f466-200d-1f466", native: "\u{1F468}\u200D\u{1F469}\u200D\u{1F466}\u200D\u{1F466}" }], version: 2 }, "man-woman-girl-girl": { id: "man-woman-girl-girl", name: "Family: Man, Woman, Girl, Girl", keywords: ["man", "woman-girl-girl", "family", "woman", "home", "parents", "people", "human", "children"], skins: [{ unified: "1f468-200d-1f469-200d-1f467-200d-1f467", native: "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F467}" }], version: 2 }, "man-man-boy": { id: "man-man-boy", name: "Family: Man, Man, Boy", keywords: ["man", "man-boy", "family", "home", "parents", "people", "human", "children"], skins: [{ unified: "1f468-200d-1f468-200d-1f466", native: "\u{1F468}\u200D\u{1F468}\u200D\u{1F466}" }], version: 2 }, "man-man-girl": { id: "man-man-girl", name: "Family: Man, Man, Girl", keywords: ["man", "man-girl", "family", "home", "parents", "people", "human", "children"], skins: [{ unified: "1f468-200d-1f468-200d-1f467", native: "\u{1F468}\u200D\u{1F468}\u200D\u{1F467}" }], version: 2 }, "man-man-girl-boy": { id: "man-man-girl-boy", name: "Family: Man, Man, Girl, Boy", keywords: ["man", "man-girl-boy", "family", "girl", "home", "parents", "people", "human", "children"], skins: [{ unified: "1f468-200d-1f468-200d-1f467-200d-1f466", native: "\u{1F468}\u200D\u{1F468}\u200D\u{1F467}\u200D\u{1F466}" }], version: 2 }, "man-man-boy-boy": { id: "man-man-boy-boy", name: "Family: Man, Man, Boy, Boy", keywords: ["man", "man-boy-boy", "family", "home", "parents", "people", "human", "children"], skins: [{ unified: "1f468-200d-1f468-200d-1f466-200d-1f466", native: "\u{1F468}\u200D\u{1F468}\u200D\u{1F466}\u200D\u{1F466}" }], version: 2 }, "man-man-girl-girl": { id: "man-man-girl-girl", name: "Family: Man, Man, Girl, Girl", keywords: ["man", "man-girl-girl", "family", "home", "parents", "people", "human", "children"], skins: [{ unified: "1f468-200d-1f468-200d-1f467-200d-1f467", native: "\u{1F468}\u200D\u{1F468}\u200D\u{1F467}\u200D\u{1F467}" }], version: 2 }, "woman-woman-boy": { id: "woman-woman-boy", name: "Family: Woman, Woman, Boy", keywords: ["woman", "woman-boy", "family", "home", "parents", "people", "human", "children"], skins: [{ unified: "1f469-200d-1f469-200d-1f466", native: "\u{1F469}\u200D\u{1F469}\u200D\u{1F466}" }], version: 2 }, "woman-woman-girl": { id: "woman-woman-girl", name: "Family: Woman, Woman, Girl", keywords: ["woman", "woman-girl", "family", "home", "parents", "people", "human", "children"], skins: [{ unified: "1f469-200d-1f469-200d-1f467", native: "\u{1F469}\u200D\u{1F469}\u200D\u{1F467}" }], version: 2 }, "woman-woman-girl-boy": { id: "woman-woman-girl-boy", name: "Family: Woman, Woman, Girl, Boy", keywords: ["woman", "woman-girl-boy", "family", "girl", "home", "parents", "people", "human", "children"], skins: [{ unified: "1f469-200d-1f469-200d-1f467-200d-1f466", native: "\u{1F469}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}" }], version: 2 }, "woman-woman-boy-boy": { id: "woman-woman-boy-boy", name: "Family: Woman, Woman, Boy, Boy", keywords: ["woman", "woman-boy-boy", "family", "home", "parents", "people", "human", "children"], skins: [{ unified: "1f469-200d-1f469-200d-1f466-200d-1f466", native: "\u{1F469}\u200D\u{1F469}\u200D\u{1F466}\u200D\u{1F466}" }], version: 2 }, "woman-woman-girl-girl": { id: "woman-woman-girl-girl", name: "Family: Woman, Woman, Girl, Girl", keywords: ["woman", "woman-girl-girl", "family", "home", "parents", "people", "human", "children"], skins: [{ unified: "1f469-200d-1f469-200d-1f467-200d-1f467", native: "\u{1F469}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F467}" }], version: 2 }, "man-boy": { id: "man-boy", name: "Family: Man, Boy", keywords: ["man", "family", "home", "parent", "people", "human", "child"], skins: [{ unified: "1f468-200d-1f466", native: "\u{1F468}\u200D\u{1F466}" }], version: 4 }, "man-boy-boy": { id: "man-boy-boy", name: "Family: Man, Boy, Boy", keywords: ["man", "boy-boy", "family", "home", "parent", "people", "human", "children"], skins: [{ unified: "1f468-200d-1f466-200d-1f466", native: "\u{1F468}\u200D\u{1F466}\u200D\u{1F466}" }], version: 4 }, "man-girl": { id: "man-girl", name: "Family: Man, Girl", keywords: ["man", "family", "home", "parent", "people", "human", "child"], skins: [{ unified: "1f468-200d-1f467", native: "\u{1F468}\u200D\u{1F467}" }], version: 4 }, "man-girl-boy": { id: "man-girl-boy", name: "Family: Man, Girl, Boy", keywords: ["man", "girl-boy", "family", "girl", "home", "parent", "people", "human", "children"], skins: [{ unified: "1f468-200d-1f467-200d-1f466", native: "\u{1F468}\u200D\u{1F467}\u200D\u{1F466}" }], version: 4 }, "man-girl-girl": { id: "man-girl-girl", name: "Family: Man, Girl, Girl", keywords: ["man", "girl-girl", "family", "home", "parent", "people", "human", "children"], skins: [{ unified: "1f468-200d-1f467-200d-1f467", native: "\u{1F468}\u200D\u{1F467}\u200D\u{1F467}" }], version: 4 }, "woman-boy": { id: "woman-boy", name: "Family: Woman, Boy", keywords: ["woman", "family", "home", "parent", "people", "human", "child"], skins: [{ unified: "1f469-200d-1f466", native: "\u{1F469}\u200D\u{1F466}" }], version: 4 }, "woman-boy-boy": { id: "woman-boy-boy", name: "Family: Woman, Boy, Boy", keywords: ["woman", "boy-boy", "family", "home", "parent", "people", "human", "children"], skins: [{ unified: "1f469-200d-1f466-200d-1f466", native: "\u{1F469}\u200D\u{1F466}\u200D\u{1F466}" }], version: 4 }, "woman-girl": { id: "woman-girl", name: "Family: Woman, Girl", keywords: ["woman", "family", "home", "parent", "people", "human", "child"], skins: [{ unified: "1f469-200d-1f467", native: "\u{1F469}\u200D\u{1F467}" }], version: 4 }, "woman-girl-boy": { id: "woman-girl-boy", name: "Family: Woman, Girl, Boy", keywords: ["woman", "girl-boy", "family", "girl", "home", "parent", "people", "human", "children"], skins: [{ unified: "1f469-200d-1f467-200d-1f466", native: "\u{1F469}\u200D\u{1F467}\u200D\u{1F466}" }], version: 4 }, "woman-girl-girl": { id: "woman-girl-girl", name: "Family: Woman, Girl, Girl", keywords: ["woman", "girl-girl", "family", "home", "parent", "people", "human", "children"], skins: [{ unified: "1f469-200d-1f467-200d-1f467", native: "\u{1F469}\u200D\u{1F467}\u200D\u{1F467}" }], version: 4 }, speaking_head_in_silhouette: { id: "speaking_head_in_silhouette", name: "Speaking Head", keywords: ["in", "silhouette", "user", "person", "human", "sing", "say", "talk"], skins: [{ unified: "1f5e3-fe0f", native: "\u{1F5E3}\uFE0F" }], version: 1 }, bust_in_silhouette: { id: "bust_in_silhouette", name: "Bust in Silhouette", keywords: ["user", "person", "human"], skins: [{ unified: "1f464", native: "\u{1F464}" }], version: 1 }, busts_in_silhouette: { id: "busts_in_silhouette", name: "Busts in Silhouette", keywords: ["user", "person", "human", "group", "team"], skins: [{ unified: "1f465", native: "\u{1F465}" }], version: 1 }, people_hugging: { id: "people_hugging", name: "People Hugging", keywords: ["care"], skins: [{ unified: "1fac2", native: "\u{1FAC2}" }], version: 13 }, footprints: { id: "footprints", name: "Footprints", keywords: ["feet", "tracking", "walking", "beach"], skins: [{ unified: "1f463", native: "\u{1F463}" }], version: 1 }, monkey_face: { id: "monkey_face", name: "Monkey Face", emoticons: [":o)"], keywords: ["animal", "nature", "circus"], skins: [{ unified: "1f435", native: "\u{1F435}" }], version: 1 }, monkey: { id: "monkey", name: "Monkey", keywords: ["animal", "nature", "banana", "circus"], skins: [{ unified: "1f412", native: "\u{1F412}" }], version: 1 }, gorilla: { id: "gorilla", name: "Gorilla", keywords: ["animal", "nature", "circus"], skins: [{ unified: "1f98d", native: "\u{1F98D}" }], version: 3 }, orangutan: { id: "orangutan", name: "Orangutan", keywords: ["animal"], skins: [{ unified: "1f9a7", native: "\u{1F9A7}" }], version: 12 }, dog: { id: "dog", name: "Dog Face", keywords: ["animal", "friend", "nature", "woof", "puppy", "pet", "faithful"], skins: [{ unified: "1f436", native: "\u{1F436}" }], version: 1 }, dog2: { id: "dog2", name: "Dog", keywords: ["dog2", "animal", "nature", "friend", "doge", "pet", "faithful"], skins: [{ unified: "1f415", native: "\u{1F415}" }], version: 1 }, guide_dog: { id: "guide_dog", name: "Guide Dog", keywords: ["animal", "blind"], skins: [{ unified: "1f9ae", native: "\u{1F9AE}" }], version: 12 }, service_dog: { id: "service_dog", name: "Service Dog", keywords: ["blind", "animal"], skins: [{ unified: "1f415-200d-1f9ba", native: "\u{1F415}\u200D\u{1F9BA}" }], version: 12 }, poodle: { id: "poodle", name: "Poodle", keywords: ["dog", "animal", "101", "nature", "pet"], skins: [{ unified: "1f429", native: "\u{1F429}" }], version: 1 }, wolf: { id: "wolf", name: "Wolf", keywords: ["animal", "nature", "wild"], skins: [{ unified: "1f43a", native: "\u{1F43A}" }], version: 1 }, fox_face: { id: "fox_face", name: "Fox", keywords: ["face", "animal", "nature"], skins: [{ unified: "1f98a", native: "\u{1F98A}" }], version: 3 }, raccoon: { id: "raccoon", name: "Raccoon", keywords: ["animal", "nature"], skins: [{ unified: "1f99d", native: "\u{1F99D}" }], version: 11 }, cat: { id: "cat", name: "Cat Face", keywords: ["animal", "meow", "nature", "pet", "kitten"], skins: [{ unified: "1f431", native: "\u{1F431}" }], version: 1 }, cat2: { id: "cat2", name: "Cat", keywords: ["cat2", "animal", "meow", "pet", "cats"], skins: [{ unified: "1f408", native: "\u{1F408}" }], version: 1 }, black_cat: { id: "black_cat", name: "Black Cat", keywords: ["superstition", "luck"], skins: [{ unified: "1f408-200d-2b1b", native: "\u{1F408}\u200D\u2B1B" }], version: 13 }, lion_face: { id: "lion_face", name: "Lion", keywords: ["face", "animal", "nature"], skins: [{ unified: "1f981", native: "\u{1F981}" }], version: 1 }, tiger: { id: "tiger", name: "Tiger Face", keywords: ["animal", "cat", "danger", "wild", "nature", "roar"], skins: [{ unified: "1f42f", native: "\u{1F42F}" }], version: 1 }, tiger2: { id: "tiger2", name: "Tiger", keywords: ["tiger2", "animal", "nature", "roar"], skins: [{ unified: "1f405", native: "\u{1F405}" }], version: 1 }, leopard: { id: "leopard", name: "Leopard", keywords: ["animal", "nature"], skins: [{ unified: "1f406", native: "\u{1F406}" }], version: 1 }, horse: { id: "horse", name: "Horse Face", keywords: ["animal", "brown", "nature"], skins: [{ unified: "1f434", native: "\u{1F434}" }], version: 1 }, racehorse: { id: "racehorse", name: "Horse", keywords: ["racehorse", "animal", "gamble", "luck"], skins: [{ unified: "1f40e", native: "\u{1F40E}" }], version: 1 }, unicorn_face: { id: "unicorn_face", name: "Unicorn", keywords: ["face", "animal", "nature", "mystical"], skins: [{ unified: "1f984", native: "\u{1F984}" }], version: 1 }, zebra_face: { id: "zebra_face", name: "Zebra", keywords: ["face", "animal", "nature", "stripes", "safari"], skins: [{ unified: "1f993", native: "\u{1F993}" }], version: 5 }, deer: { id: "deer", name: "Deer", keywords: ["animal", "nature", "horns", "venison"], skins: [{ unified: "1f98c", native: "\u{1F98C}" }], version: 3 }, bison: { id: "bison", name: "Bison", keywords: ["ox"], skins: [{ unified: "1f9ac", native: "\u{1F9AC}" }], version: 13 }, cow: { id: "cow", name: "Cow Face", keywords: ["beef", "ox", "animal", "nature", "moo", "milk"], skins: [{ unified: "1f42e", native: "\u{1F42E}" }], version: 1 }, ox: { id: "ox", name: "Ox", keywords: ["animal", "cow", "beef"], skins: [{ unified: "1f402", native: "\u{1F402}" }], version: 1 }, water_buffalo: { id: "water_buffalo", name: "Water Buffalo", keywords: ["animal", "nature", "ox", "cow"], skins: [{ unified: "1f403", native: "\u{1F403}" }], version: 1 }, cow2: { id: "cow2", name: "Cow", keywords: ["cow2", "beef", "ox", "animal", "nature", "moo", "milk"], skins: [{ unified: "1f404", native: "\u{1F404}" }], version: 1 }, pig: { id: "pig", name: "Pig Face", keywords: ["animal", "oink", "nature"], skins: [{ unified: "1f437", native: "\u{1F437}" }], version: 1 }, pig2: { id: "pig2", name: "Pig", keywords: ["pig2", "animal", "nature"], skins: [{ unified: "1f416", native: "\u{1F416}" }], version: 1 }, boar: { id: "boar", name: "Boar", keywords: ["animal", "nature"], skins: [{ unified: "1f417", native: "\u{1F417}" }], version: 1 }, pig_nose: { id: "pig_nose", name: "Pig Nose", keywords: ["animal", "oink"], skins: [{ unified: "1f43d", native: "\u{1F43D}" }], version: 1 }, ram: { id: "ram", name: "Ram", keywords: ["animal", "sheep", "nature"], skins: [{ unified: "1f40f", native: "\u{1F40F}" }], version: 1 }, sheep: { id: "sheep", name: "Ewe", keywords: ["sheep", "animal", "nature", "wool", "shipit"], skins: [{ unified: "1f411", native: "\u{1F411}" }], version: 1 }, goat: { id: "goat", name: "Goat", keywords: ["animal", "nature"], skins: [{ unified: "1f410", native: "\u{1F410}" }], version: 1 }, dromedary_camel: { id: "dromedary_camel", name: "Camel", keywords: ["dromedary", "animal", "hot", "desert", "hump"], skins: [{ unified: "1f42a", native: "\u{1F42A}" }], version: 1 }, camel: { id: "camel", name: "Bactrian Camel", keywords: ["two", "hump", "animal", "nature", "hot", "desert"], skins: [{ unified: "1f42b", native: "\u{1F42B}" }], version: 1 }, llama: { id: "llama", name: "Llama", keywords: ["animal", "nature", "alpaca"], skins: [{ unified: "1f999", native: "\u{1F999}" }], version: 11 }, giraffe_face: { id: "giraffe_face", name: "Giraffe", keywords: ["face", "animal", "nature", "spots", "safari"], skins: [{ unified: "1f992", native: "\u{1F992}" }], version: 5 }, elephant: { id: "elephant", name: "Elephant", keywords: ["animal", "nature", "nose", "th", "circus"], skins: [{ unified: "1f418", native: "\u{1F418}" }], version: 1 }, mammoth: { id: "mammoth", name: "Mammoth", keywords: ["elephant", "tusks"], skins: [{ unified: "1f9a3", native: "\u{1F9A3}" }], version: 13 }, rhinoceros: { id: "rhinoceros", name: "Rhinoceros", keywords: ["animal", "nature", "horn"], skins: [{ unified: "1f98f", native: "\u{1F98F}" }], version: 3 }, hippopotamus: { id: "hippopotamus", name: "Hippopotamus", keywords: ["animal", "nature"], skins: [{ unified: "1f99b", native: "\u{1F99B}" }], version: 11 }, mouse: { id: "mouse", name: "Mouse Face", keywords: ["animal", "nature", "cheese", "wedge", "rodent"], skins: [{ unified: "1f42d", native: "\u{1F42D}" }], version: 1 }, mouse2: { id: "mouse2", name: "Mouse", keywords: ["mouse2", "animal", "nature", "rodent"], skins: [{ unified: "1f401", native: "\u{1F401}" }], version: 1 }, rat: { id: "rat", name: "Rat", keywords: ["animal", "mouse", "rodent"], skins: [{ unified: "1f400", native: "\u{1F400}" }], version: 1 }, hamster: { id: "hamster", name: "Hamster", keywords: ["animal", "nature"], skins: [{ unified: "1f439", native: "\u{1F439}" }], version: 1 }, rabbit: { id: "rabbit", name: "Rabbit Face", keywords: ["animal", "nature", "pet", "spring", "magic", "bunny"], skins: [{ unified: "1f430", native: "\u{1F430}" }], version: 1 }, rabbit2: { id: "rabbit2", name: "Rabbit", keywords: ["rabbit2", "animal", "nature", "pet", "magic", "spring"], skins: [{ unified: "1f407", native: "\u{1F407}" }], version: 1 }, chipmunk: { id: "chipmunk", name: "Chipmunk", keywords: ["animal", "nature", "rodent", "squirrel"], skins: [{ unified: "1f43f-fe0f", native: "\u{1F43F}\uFE0F" }], version: 1 }, beaver: { id: "beaver", name: "Beaver", keywords: ["animal", "rodent"], skins: [{ unified: "1f9ab", native: "\u{1F9AB}" }], version: 13 }, hedgehog: { id: "hedgehog", name: "Hedgehog", keywords: ["animal", "nature", "spiny"], skins: [{ unified: "1f994", native: "\u{1F994}" }], version: 5 }, bat: { id: "bat", name: "Bat", keywords: ["animal", "nature", "blind", "vampire"], skins: [{ unified: "1f987", native: "\u{1F987}" }], version: 3 }, bear: { id: "bear", name: "Bear", keywords: ["animal", "nature", "wild"], skins: [{ unified: "1f43b", native: "\u{1F43B}" }], version: 1 }, polar_bear: { id: "polar_bear", name: "Polar Bear", keywords: ["animal", "arctic"], skins: [{ unified: "1f43b-200d-2744-fe0f", native: "\u{1F43B}\u200D\u2744\uFE0F" }], version: 13 }, koala: { id: "koala", name: "Koala", keywords: ["animal", "nature"], skins: [{ unified: "1f428", native: "\u{1F428}" }], version: 1 }, panda_face: { id: "panda_face", name: "Panda", keywords: ["face", "animal", "nature"], skins: [{ unified: "1f43c", native: "\u{1F43C}" }], version: 1 }, sloth: { id: "sloth", name: "Sloth", keywords: ["animal"], skins: [{ unified: "1f9a5", native: "\u{1F9A5}" }], version: 12 }, otter: { id: "otter", name: "Otter", keywords: ["animal"], skins: [{ unified: "1f9a6", native: "\u{1F9A6}" }], version: 12 }, skunk: { id: "skunk", name: "Skunk", keywords: ["animal"], skins: [{ unified: "1f9a8", native: "\u{1F9A8}" }], version: 12 }, kangaroo: { id: "kangaroo", name: "Kangaroo", keywords: ["animal", "nature", "australia", "joey", "hop", "marsupial"], skins: [{ unified: "1f998", native: "\u{1F998}" }], version: 11 }, badger: { id: "badger", name: "Badger", keywords: ["animal", "nature", "honey"], skins: [{ unified: "1f9a1", native: "\u{1F9A1}" }], version: 11 }, feet: { id: "feet", name: "Paw Prints", keywords: ["feet", "animal", "tracking", "footprints", "dog", "cat", "pet"], skins: [{ unified: "1f43e", native: "\u{1F43E}" }], version: 1 }, turkey: { id: "turkey", name: "Turkey", keywords: ["animal", "bird"], skins: [{ unified: "1f983", native: "\u{1F983}" }], version: 1 }, chicken: { id: "chicken", name: "Chicken", keywords: ["animal", "cluck", "nature", "bird"], skins: [{ unified: "1f414", native: "\u{1F414}" }], version: 1 }, rooster: { id: "rooster", name: "Rooster", keywords: ["animal", "nature", "chicken"], skins: [{ unified: "1f413", native: "\u{1F413}" }], version: 1 }, hatching_chick: { id: "hatching_chick", name: "Hatching Chick", keywords: ["animal", "chicken", "egg", "born", "baby", "bird"], skins: [{ unified: "1f423", native: "\u{1F423}" }], version: 1 }, baby_chick: { id: "baby_chick", name: "Baby Chick", keywords: ["animal", "chicken", "bird"], skins: [{ unified: "1f424", native: "\u{1F424}" }], version: 1 }, hatched_chick: { id: "hatched_chick", name: "Front-Facing Baby Chick", keywords: ["hatched", "front", "facing", "animal", "chicken", "bird"], skins: [{ unified: "1f425", native: "\u{1F425}" }], version: 1 }, bird: { id: "bird", name: "Bird", keywords: ["animal", "nature", "fly", "tweet", "spring"], skins: [{ unified: "1f426", native: "\u{1F426}" }], version: 1 }, penguin: { id: "penguin", name: "Penguin", keywords: ["animal", "nature"], skins: [{ unified: "1f427", native: "\u{1F427}" }], version: 1 }, dove_of_peace: { id: "dove_of_peace", name: "Dove", keywords: ["of", "peace", "animal", "bird"], skins: [{ unified: "1f54a-fe0f", native: "\u{1F54A}\uFE0F" }], version: 1 }, eagle: { id: "eagle", name: "Eagle", keywords: ["animal", "nature", "bird"], skins: [{ unified: "1f985", native: "\u{1F985}" }], version: 3 }, duck: { id: "duck", name: "Duck", keywords: ["animal", "nature", "bird", "mallard"], skins: [{ unified: "1f986", native: "\u{1F986}" }], version: 3 }, swan: { id: "swan", name: "Swan", keywords: ["animal", "nature", "bird"], skins: [{ unified: "1f9a2", native: "\u{1F9A2}" }], version: 11 }, owl: { id: "owl", name: "Owl", keywords: ["animal", "nature", "bird", "hoot"], skins: [{ unified: "1f989", native: "\u{1F989}" }], version: 3 }, dodo: { id: "dodo", name: "Dodo", keywords: ["animal", "bird"], skins: [{ unified: "1f9a4", native: "\u{1F9A4}" }], version: 13 }, feather: { id: "feather", name: "Feather", keywords: ["bird", "fly"], skins: [{ unified: "1fab6", native: "\u{1FAB6}" }], version: 13 }, flamingo: { id: "flamingo", name: "Flamingo", keywords: ["animal"], skins: [{ unified: "1f9a9", native: "\u{1F9A9}" }], version: 12 }, peacock: { id: "peacock", name: "Peacock", keywords: ["animal", "nature", "peahen", "bird"], skins: [{ unified: "1f99a", native: "\u{1F99A}" }], version: 11 }, parrot: { id: "parrot", name: "Parrot", keywords: ["animal", "nature", "bird", "pirate", "talk"], skins: [{ unified: "1f99c", native: "\u{1F99C}" }], version: 11 }, frog: { id: "frog", name: "Frog", keywords: ["animal", "nature", "croak", "toad"], skins: [{ unified: "1f438", native: "\u{1F438}" }], version: 1 }, crocodile: { id: "crocodile", name: "Crocodile", keywords: ["animal", "nature", "reptile", "lizard", "alligator"], skins: [{ unified: "1f40a", native: "\u{1F40A}" }], version: 1 }, turtle: { id: "turtle", name: "Turtle", keywords: ["animal", "slow", "nature", "tortoise"], skins: [{ unified: "1f422", native: "\u{1F422}" }], version: 1 }, lizard: { id: "lizard", name: "Lizard", keywords: ["animal", "nature", "reptile"], skins: [{ unified: "1f98e", native: "\u{1F98E}" }], version: 3 }, snake: { id: "snake", name: "Snake", keywords: ["animal", "evil", "nature", "hiss", "python"], skins: [{ unified: "1f40d", native: "\u{1F40D}" }], version: 1 }, dragon_face: { id: "dragon_face", name: "Dragon Face", keywords: ["animal", "myth", "nature", "chinese", "green"], skins: [{ unified: "1f432", native: "\u{1F432}" }], version: 1 }, dragon: { id: "dragon", name: "Dragon", keywords: ["animal", "myth", "nature", "chinese", "green"], skins: [{ unified: "1f409", native: "\u{1F409}" }], version: 1 }, sauropod: { id: "sauropod", name: "Sauropod", keywords: ["animal", "nature", "dinosaur", "brachiosaurus", "brontosaurus", "diplodocus", "extinct"], skins: [{ unified: "1f995", native: "\u{1F995}" }], version: 5 }, "t-rex": { id: "t-rex", name: "T-Rex", keywords: ["t", "rex", "animal", "nature", "dinosaur", "tyrannosaurus", "extinct"], skins: [{ unified: "1f996", native: "\u{1F996}" }], version: 5 }, whale: { id: "whale", name: "Spouting Whale", keywords: ["animal", "nature", "sea", "ocean"], skins: [{ unified: "1f433", native: "\u{1F433}" }], version: 1 }, whale2: { id: "whale2", name: "Whale", keywords: ["whale2", "animal", "nature", "sea", "ocean"], skins: [{ unified: "1f40b", native: "\u{1F40B}" }], version: 1 }, dolphin: { id: "dolphin", name: "Dolphin", keywords: ["flipper", "animal", "nature", "fish", "sea", "ocean", "fins", "beach"], skins: [{ unified: "1f42c", native: "\u{1F42C}" }], version: 1 }, seal: { id: "seal", name: "Seal", keywords: ["animal", "creature", "sea"], skins: [{ unified: "1f9ad", native: "\u{1F9AD}" }], version: 13 }, fish: { id: "fish", name: "Fish", keywords: ["animal", "food", "nature"], skins: [{ unified: "1f41f", native: "\u{1F41F}" }], version: 1 }, tropical_fish: { id: "tropical_fish", name: "Tropical Fish", keywords: ["animal", "swim", "ocean", "beach", "nemo"], skins: [{ unified: "1f420", native: "\u{1F420}" }], version: 1 }, blowfish: { id: "blowfish", name: "Blowfish", keywords: ["animal", "nature", "food", "sea", "ocean"], skins: [{ unified: "1f421", native: "\u{1F421}" }], version: 1 }, shark: { id: "shark", name: "Shark", keywords: ["animal", "nature", "fish", "sea", "ocean", "jaws", "fins", "beach"], skins: [{ unified: "1f988", native: "\u{1F988}" }], version: 3 }, octopus: { id: "octopus", name: "Octopus", keywords: ["animal", "creature", "ocean", "sea", "nature", "beach"], skins: [{ unified: "1f419", native: "\u{1F419}" }], version: 1 }, shell: { id: "shell", name: "Spiral Shell", keywords: ["nature", "sea", "beach"], skins: [{ unified: "1f41a", native: "\u{1F41A}" }], version: 1 }, coral: { id: "coral", name: "Coral", keywords: ["ocean", "sea", "reef"], skins: [{ unified: "1fab8", native: "\u{1FAB8}" }], version: 14 }, snail: { id: "snail", name: "Snail", keywords: ["slow", "animal", "shell"], skins: [{ unified: "1f40c", native: "\u{1F40C}" }], version: 1 }, butterfly: { id: "butterfly", name: "Butterfly", keywords: ["animal", "insect", "nature", "caterpillar"], skins: [{ unified: "1f98b", native: "\u{1F98B}" }], version: 3 }, bug: { id: "bug", name: "Bug", keywords: ["animal", "insect", "nature", "worm"], skins: [{ unified: "1f41b", native: "\u{1F41B}" }], version: 1 }, ant: { id: "ant", name: "Ant", keywords: ["animal", "insect", "nature", "bug"], skins: [{ unified: "1f41c", native: "\u{1F41C}" }], version: 1 }, bee: { id: "bee", name: "Honeybee", keywords: ["bee", "animal", "insect", "nature", "bug", "spring", "honey"], skins: [{ unified: "1f41d", native: "\u{1F41D}" }], version: 1 }, beetle: { id: "beetle", name: "Beetle", keywords: ["insect"], skins: [{ unified: "1fab2", native: "\u{1FAB2}" }], version: 13 }, ladybug: { id: "ladybug", name: "Lady Beetle", keywords: ["ladybug", "animal", "insect", "nature"], skins: [{ unified: "1f41e", native: "\u{1F41E}" }], version: 1 }, cricket: { id: "cricket", name: "Cricket", keywords: ["animal", "chirp"], skins: [{ unified: "1f997", native: "\u{1F997}" }], version: 5 }, cockroach: { id: "cockroach", name: "Cockroach", keywords: ["insect", "pests"], skins: [{ unified: "1fab3", native: "\u{1FAB3}" }], version: 13 }, spider: { id: "spider", name: "Spider", keywords: ["animal", "arachnid"], skins: [{ unified: "1f577-fe0f", native: "\u{1F577}\uFE0F" }], version: 1 }, spider_web: { id: "spider_web", name: "Spider Web", keywords: ["animal", "insect", "arachnid", "silk"], skins: [{ unified: "1f578-fe0f", native: "\u{1F578}\uFE0F" }], version: 1 }, scorpion: { id: "scorpion", name: "Scorpion", keywords: ["animal", "arachnid"], skins: [{ unified: "1f982", native: "\u{1F982}" }], version: 1 }, mosquito: { id: "mosquito", name: "Mosquito", keywords: ["animal", "nature", "insect", "malaria"], skins: [{ unified: "1f99f", native: "\u{1F99F}" }], version: 11 }, fly: { id: "fly", name: "Fly", keywords: ["insect"], skins: [{ unified: "1fab0", native: "\u{1FAB0}" }], version: 13 }, worm: { id: "worm", name: "Worm", keywords: ["animal"], skins: [{ unified: "1fab1", native: "\u{1FAB1}" }], version: 13 }, microbe: { id: "microbe", name: "Microbe", keywords: ["amoeba", "bacteria", "germs", "virus"], skins: [{ unified: "1f9a0", native: "\u{1F9A0}" }], version: 11 }, bouquet: { id: "bouquet", name: "Bouquet", keywords: ["flowers", "nature", "spring"], skins: [{ unified: "1f490", native: "\u{1F490}" }], version: 1 }, cherry_blossom: { id: "cherry_blossom", name: "Cherry Blossom", keywords: ["nature", "plant", "spring", "flower"], skins: [{ unified: "1f338", native: "\u{1F338}" }], version: 1 }, white_flower: { id: "white_flower", name: "White Flower", keywords: ["japanese", "spring"], skins: [{ unified: "1f4ae", native: "\u{1F4AE}" }], version: 1 }, lotus: { id: "lotus", name: "Lotus", keywords: ["flower", "calm", "meditation"], skins: [{ unified: "1fab7", native: "\u{1FAB7}" }], version: 14 }, rosette: { id: "rosette", name: "Rosette", keywords: ["flower", "decoration", "military"], skins: [{ unified: "1f3f5-fe0f", native: "\u{1F3F5}\uFE0F" }], version: 1 }, rose: { id: "rose", name: "Rose", keywords: ["flowers", "valentines", "love", "spring"], skins: [{ unified: "1f339", native: "\u{1F339}" }], version: 1 }, wilted_flower: { id: "wilted_flower", name: "Wilted Flower", keywords: ["plant", "nature"], skins: [{ unified: "1f940", native: "\u{1F940}" }], version: 3 }, hibiscus: { id: "hibiscus", name: "Hibiscus", keywords: ["plant", "vegetable", "flowers", "beach"], skins: [{ unified: "1f33a", native: "\u{1F33A}" }], version: 1 }, sunflower: { id: "sunflower", name: "Sunflower", keywords: ["nature", "plant", "fall"], skins: [{ unified: "1f33b", native: "\u{1F33B}" }], version: 1 }, blossom: { id: "blossom", name: "Blossom", keywords: ["nature", "flowers", "yellow"], skins: [{ unified: "1f33c", native: "\u{1F33C}" }], version: 1 }, tulip: { id: "tulip", name: "Tulip", keywords: ["flowers", "plant", "nature", "summer", "spring"], skins: [{ unified: "1f337", native: "\u{1F337}" }], version: 1 }, seedling: { id: "seedling", name: "Seedling", keywords: ["plant", "nature", "grass", "lawn", "spring"], skins: [{ unified: "1f331", native: "\u{1F331}" }], version: 1 }, potted_plant: { id: "potted_plant", name: "Potted Plant", keywords: ["greenery", "house"], skins: [{ unified: "1fab4", native: "\u{1FAB4}" }], version: 13 }, evergreen_tree: { id: "evergreen_tree", name: "Evergreen Tree", keywords: ["plant", "nature"], skins: [{ unified: "1f332", native: "\u{1F332}" }], version: 1 }, deciduous_tree: { id: "deciduous_tree", name: "Deciduous Tree", keywords: ["plant", "nature"], skins: [{ unified: "1f333", native: "\u{1F333}" }], version: 1 }, palm_tree: { id: "palm_tree", name: "Palm Tree", keywords: ["plant", "vegetable", "nature", "summer", "beach", "mojito", "tropical"], skins: [{ unified: "1f334", native: "\u{1F334}" }], version: 1 }, cactus: { id: "cactus", name: "Cactus", keywords: ["vegetable", "plant", "nature"], skins: [{ unified: "1f335", native: "\u{1F335}" }], version: 1 }, ear_of_rice: { id: "ear_of_rice", name: "Ear of Rice", keywords: ["sheaf", "nature", "plant"], skins: [{ unified: "1f33e", native: "\u{1F33E}" }], version: 1 }, herb: { id: "herb", name: "Herb", keywords: ["vegetable", "plant", "medicine", "weed", "grass", "lawn"], skins: [{ unified: "1f33f", native: "\u{1F33F}" }], version: 1 }, shamrock: { id: "shamrock", name: "Shamrock", keywords: ["vegetable", "plant", "nature", "irish", "clover"], skins: [{ unified: "2618-fe0f", native: "\u2618\uFE0F" }], version: 1 }, four_leaf_clover: { id: "four_leaf_clover", name: "Four Leaf Clover", keywords: ["vegetable", "plant", "nature", "lucky", "irish"], skins: [{ unified: "1f340", native: "\u{1F340}" }], version: 1 }, maple_leaf: { id: "maple_leaf", name: "Maple Leaf", keywords: ["nature", "plant", "vegetable", "ca", "fall"], skins: [{ unified: "1f341", native: "\u{1F341}" }], version: 1 }, fallen_leaf: { id: "fallen_leaf", name: "Fallen Leaf", keywords: ["nature", "plant", "vegetable", "leaves"], skins: [{ unified: "1f342", native: "\u{1F342}" }], version: 1 }, leaves: { id: "leaves", name: "Leaf Fluttering in Wind", keywords: ["leaves", "nature", "plant", "tree", "vegetable", "grass", "lawn", "spring"], skins: [{ unified: "1f343", native: "\u{1F343}" }], version: 1 }, empty_nest: { id: "empty_nest", name: "Empty Nest", keywords: ["bird"], skins: [{ unified: "1fab9", native: "\u{1FAB9}" }], version: 14 }, nest_with_eggs: { id: "nest_with_eggs", name: "Nest with Eggs", keywords: ["bird"], skins: [{ unified: "1faba", native: "\u{1FABA}" }], version: 14 }, grapes: { id: "grapes", name: "Grapes", keywords: ["fruit", "food", "wine"], skins: [{ unified: "1f347", native: "\u{1F347}" }], version: 1 }, melon: { id: "melon", name: "Melon", keywords: ["fruit", "nature", "food"], skins: [{ unified: "1f348", native: "\u{1F348}" }], version: 1 }, watermelon: { id: "watermelon", name: "Watermelon", keywords: ["fruit", "food", "picnic", "summer"], skins: [{ unified: "1f349", native: "\u{1F349}" }], version: 1 }, tangerine: { id: "tangerine", name: "Tangerine", keywords: ["food", "fruit", "nature", "orange"], skins: [{ unified: "1f34a", native: "\u{1F34A}" }], version: 1 }, lemon: { id: "lemon", name: "Lemon", keywords: ["fruit", "nature"], skins: [{ unified: "1f34b", native: "\u{1F34B}" }], version: 1 }, banana: { id: "banana", name: "Banana", keywords: ["fruit", "food", "monkey"], skins: [{ unified: "1f34c", native: "\u{1F34C}" }], version: 1 }, pineapple: { id: "pineapple", name: "Pineapple", keywords: ["fruit", "nature", "food"], skins: [{ unified: "1f34d", native: "\u{1F34D}" }], version: 1 }, mango: { id: "mango", name: "Mango", keywords: ["fruit", "food", "tropical"], skins: [{ unified: "1f96d", native: "\u{1F96D}" }], version: 11 }, apple: { id: "apple", name: "Red Apple", keywords: ["fruit", "mac", "school"], skins: [{ unified: "1f34e", native: "\u{1F34E}" }], version: 1 }, green_apple: { id: "green_apple", name: "Green Apple", keywords: ["fruit", "nature"], skins: [{ unified: "1f34f", native: "\u{1F34F}" }], version: 1 }, pear: { id: "pear", name: "Pear", keywords: ["fruit", "nature", "food"], skins: [{ unified: "1f350", native: "\u{1F350}" }], version: 1 }, peach: { id: "peach", name: "Peach", keywords: ["fruit", "nature", "food"], skins: [{ unified: "1f351", native: "\u{1F351}" }], version: 1 }, cherries: { id: "cherries", name: "Cherries", keywords: ["food", "fruit"], skins: [{ unified: "1f352", native: "\u{1F352}" }], version: 1 }, strawberry: { id: "strawberry", name: "Strawberry", keywords: ["fruit", "food", "nature"], skins: [{ unified: "1f353", native: "\u{1F353}" }], version: 1 }, blueberries: { id: "blueberries", name: "Blueberries", keywords: ["fruit"], skins: [{ unified: "1fad0", native: "\u{1FAD0}" }], version: 13 }, kiwifruit: { id: "kiwifruit", name: "Kiwifruit", keywords: ["kiwi", "fruit", "food"], skins: [{ unified: "1f95d", native: "\u{1F95D}" }], version: 3 }, tomato: { id: "tomato", name: "Tomato", keywords: ["fruit", "vegetable", "nature", "food"], skins: [{ unified: "1f345", native: "\u{1F345}" }], version: 1 }, olive: { id: "olive", name: "Olive", keywords: ["fruit"], skins: [{ unified: "1fad2", native: "\u{1FAD2}" }], version: 13 }, coconut: { id: "coconut", name: "Coconut", keywords: ["fruit", "nature", "food", "palm"], skins: [{ unified: "1f965", native: "\u{1F965}" }], version: 5 }, avocado: { id: "avocado", name: "Avocado", keywords: ["fruit", "food"], skins: [{ unified: "1f951", native: "\u{1F951}" }], version: 3 }, eggplant: { id: "eggplant", name: "Eggplant", keywords: ["vegetable", "nature", "food", "aubergine"], skins: [{ unified: "1f346", native: "\u{1F346}" }], version: 1 }, potato: { id: "potato", name: "Potato", keywords: ["food", "tuber", "vegatable", "starch"], skins: [{ unified: "1f954", native: "\u{1F954}" }], version: 3 }, carrot: { id: "carrot", name: "Carrot", keywords: ["vegetable", "food", "orange"], skins: [{ unified: "1f955", native: "\u{1F955}" }], version: 3 }, corn: { id: "corn", name: "Ear of Corn", keywords: ["food", "vegetable", "plant"], skins: [{ unified: "1f33d", native: "\u{1F33D}" }], version: 1 }, hot_pepper: { id: "hot_pepper", name: "Hot Pepper", keywords: ["food", "spicy", "chilli", "chili"], skins: [{ unified: "1f336-fe0f", native: "\u{1F336}\uFE0F" }], version: 1 }, bell_pepper: { id: "bell_pepper", name: "Bell Pepper", keywords: ["fruit", "plant"], skins: [{ unified: "1fad1", native: "\u{1FAD1}" }], version: 13 }, cucumber: { id: "cucumber", name: "Cucumber", keywords: ["fruit", "food", "pickle"], skins: [{ unified: "1f952", native: "\u{1F952}" }], version: 3 }, leafy_green: { id: "leafy_green", name: "Leafy Green", keywords: ["food", "vegetable", "plant", "bok", "choy", "cabbage", "kale", "lettuce"], skins: [{ unified: "1f96c", native: "\u{1F96C}" }], version: 11 }, broccoli: { id: "broccoli", name: "Broccoli", keywords: ["fruit", "food", "vegetable"], skins: [{ unified: "1f966", native: "\u{1F966}" }], version: 5 }, garlic: { id: "garlic", name: "Garlic", keywords: ["food", "spice", "cook"], skins: [{ unified: "1f9c4", native: "\u{1F9C4}" }], version: 12 }, onion: { id: "onion", name: "Onion", keywords: ["cook", "food", "spice"], skins: [{ unified: "1f9c5", native: "\u{1F9C5}" }], version: 12 }, mushroom: { id: "mushroom", name: "Mushroom", keywords: ["plant", "vegetable"], skins: [{ unified: "1f344", native: "\u{1F344}" }], version: 1 }, peanuts: { id: "peanuts", name: "Peanuts", keywords: ["food", "nut"], skins: [{ unified: "1f95c", native: "\u{1F95C}" }], version: 3 }, beans: { id: "beans", name: "Beans", keywords: ["food"], skins: [{ unified: "1fad8", native: "\u{1FAD8}" }], version: 14 }, chestnut: { id: "chestnut", name: "Chestnut", keywords: ["food", "squirrel"], skins: [{ unified: "1f330", native: "\u{1F330}" }], version: 1 }, bread: { id: "bread", name: "Bread", keywords: ["food", "wheat", "breakfast", "toast"], skins: [{ unified: "1f35e", native: "\u{1F35E}" }], version: 1 }, croissant: { id: "croissant", name: "Croissant", keywords: ["food", "bread", "french"], skins: [{ unified: "1f950", native: "\u{1F950}" }], version: 3 }, baguette_bread: { id: "baguette_bread", name: "Baguette Bread", keywords: ["food", "french"], skins: [{ unified: "1f956", native: "\u{1F956}" }], version: 3 }, flatbread: { id: "flatbread", name: "Flatbread", keywords: ["flour", "food"], skins: [{ unified: "1fad3", native: "\u{1FAD3}" }], version: 13 }, pretzel: { id: "pretzel", name: "Pretzel", keywords: ["food", "bread", "twisted"], skins: [{ unified: "1f968", native: "\u{1F968}" }], version: 5 }, bagel: { id: "bagel", name: "Bagel", keywords: ["food", "bread", "bakery", "schmear"], skins: [{ unified: "1f96f", native: "\u{1F96F}" }], version: 11 }, pancakes: { id: "pancakes", name: "Pancakes", keywords: ["food", "breakfast", "flapjacks", "hotcakes"], skins: [{ unified: "1f95e", native: "\u{1F95E}" }], version: 3 }, waffle: { id: "waffle", name: "Waffle", keywords: ["food", "breakfast"], skins: [{ unified: "1f9c7", native: "\u{1F9C7}" }], version: 12 }, cheese_wedge: { id: "cheese_wedge", name: "Cheese Wedge", keywords: ["food", "chadder"], skins: [{ unified: "1f9c0", native: "\u{1F9C0}" }], version: 1 }, meat_on_bone: { id: "meat_on_bone", name: "Meat on Bone", keywords: ["good", "food", "drumstick"], skins: [{ unified: "1f356", native: "\u{1F356}" }], version: 1 }, poultry_leg: { id: "poultry_leg", name: "Poultry Leg", keywords: ["food", "meat", "drumstick", "bird", "chicken", "turkey"], skins: [{ unified: "1f357", native: "\u{1F357}" }], version: 1 }, cut_of_meat: { id: "cut_of_meat", name: "Cut of Meat", keywords: ["food", "cow", "chop", "lambchop", "porkchop"], skins: [{ unified: "1f969", native: "\u{1F969}" }], version: 5 }, bacon: { id: "bacon", name: "Bacon", keywords: ["food", "breakfast", "pork", "pig", "meat"], skins: [{ unified: "1f953", native: "\u{1F953}" }], version: 3 }, hamburger: { id: "hamburger", name: "Hamburger", keywords: ["meat", "fast", "food", "beef", "cheeseburger", "mcdonalds", "burger", "king"], skins: [{ unified: "1f354", native: "\u{1F354}" }], version: 1 }, fries: { id: "fries", name: "French Fries", keywords: ["chips", "snack", "fast", "food"], skins: [{ unified: "1f35f", native: "\u{1F35F}" }], version: 1 }, pizza: { id: "pizza", name: "Pizza", keywords: ["food", "party"], skins: [{ unified: "1f355", native: "\u{1F355}" }], version: 1 }, hotdog: { id: "hotdog", name: "Hot Dog", keywords: ["hotdog", "food", "frankfurter"], skins: [{ unified: "1f32d", native: "\u{1F32D}" }], version: 1 }, sandwich: { id: "sandwich", name: "Sandwich", keywords: ["food", "lunch", "bread"], skins: [{ unified: "1f96a", native: "\u{1F96A}" }], version: 5 }, taco: { id: "taco", name: "Taco", keywords: ["food", "mexican"], skins: [{ unified: "1f32e", native: "\u{1F32E}" }], version: 1 }, burrito: { id: "burrito", name: "Burrito", keywords: ["food", "mexican"], skins: [{ unified: "1f32f", native: "\u{1F32F}" }], version: 1 }, tamale: { id: "tamale", name: "Tamale", keywords: ["food", "masa"], skins: [{ unified: "1fad4", native: "\u{1FAD4}" }], version: 13 }, stuffed_flatbread: { id: "stuffed_flatbread", name: "Stuffed Flatbread", keywords: ["food", "gyro"], skins: [{ unified: "1f959", native: "\u{1F959}" }], version: 3 }, falafel: { id: "falafel", name: "Falafel", keywords: ["food"], skins: [{ unified: "1f9c6", native: "\u{1F9C6}" }], version: 12 }, egg: { id: "egg", name: "Egg", keywords: ["food", "chicken", "breakfast"], skins: [{ unified: "1f95a", native: "\u{1F95A}" }], version: 3 }, fried_egg: { id: "fried_egg", name: "Cooking", keywords: ["fried", "egg", "food", "breakfast", "kitchen"], skins: [{ unified: "1f373", native: "\u{1F373}" }], version: 1 }, shallow_pan_of_food: { id: "shallow_pan_of_food", name: "Shallow Pan of Food", keywords: ["cooking", "casserole", "paella"], skins: [{ unified: "1f958", native: "\u{1F958}" }], version: 3 }, stew: { id: "stew", name: "Pot of Food", keywords: ["stew", "meat", "soup"], skins: [{ unified: "1f372", native: "\u{1F372}" }], version: 1 }, fondue: { id: "fondue", name: "Fondue", keywords: ["cheese", "pot", "food"], skins: [{ unified: "1fad5", native: "\u{1FAD5}" }], version: 13 }, bowl_with_spoon: { id: "bowl_with_spoon", name: "Bowl with Spoon", keywords: ["food", "breakfast", "cereal", "oatmeal", "porridge"], skins: [{ unified: "1f963", native: "\u{1F963}" }], version: 5 }, green_salad: { id: "green_salad", name: "Green Salad", keywords: ["food", "healthy", "lettuce"], skins: [{ unified: "1f957", native: "\u{1F957}" }], version: 3 }, popcorn: { id: "popcorn", name: "Popcorn", keywords: ["food", "movie", "theater", "films", "snack"], skins: [{ unified: "1f37f", native: "\u{1F37F}" }], version: 1 }, butter: { id: "butter", name: "Butter", keywords: ["food", "cook"], skins: [{ unified: "1f9c8", native: "\u{1F9C8}" }], version: 12 }, salt: { id: "salt", name: "Salt", keywords: ["condiment", "shaker"], skins: [{ unified: "1f9c2", native: "\u{1F9C2}" }], version: 11 }, canned_food: { id: "canned_food", name: "Canned Food", keywords: ["soup"], skins: [{ unified: "1f96b", native: "\u{1F96B}" }], version: 5 }, bento: { id: "bento", name: "Bento Box", keywords: ["food", "japanese"], skins: [{ unified: "1f371", native: "\u{1F371}" }], version: 1 }, rice_cracker: { id: "rice_cracker", name: "Rice Cracker", keywords: ["food", "japanese"], skins: [{ unified: "1f358", native: "\u{1F358}" }], version: 1 }, rice_ball: { id: "rice_ball", name: "Rice Ball", keywords: ["food", "japanese"], skins: [{ unified: "1f359", native: "\u{1F359}" }], version: 1 }, rice: { id: "rice", name: "Cooked Rice", keywords: ["food", "china", "asian"], skins: [{ unified: "1f35a", native: "\u{1F35A}" }], version: 1 }, curry: { id: "curry", name: "Curry Rice", keywords: ["food", "spicy", "hot", "indian"], skins: [{ unified: "1f35b", native: "\u{1F35B}" }], version: 1 }, ramen: { id: "ramen", name: "Steaming Bowl", keywords: ["ramen", "food", "japanese", "noodle", "chopsticks"], skins: [{ unified: "1f35c", native: "\u{1F35C}" }], version: 1 }, spaghetti: { id: "spaghetti", name: "Spaghetti", keywords: ["food", "italian", "noodle"], skins: [{ unified: "1f35d", native: "\u{1F35D}" }], version: 1 }, sweet_potato: { id: "sweet_potato", name: "Roasted Sweet Potato", keywords: ["food", "nature"], skins: [{ unified: "1f360", native: "\u{1F360}" }], version: 1 }, oden: { id: "oden", name: "Oden", keywords: ["food", "japanese"], skins: [{ unified: "1f362", native: "\u{1F362}" }], version: 1 }, sushi: { id: "sushi", name: "Sushi", keywords: ["food", "fish", "japanese", "rice"], skins: [{ unified: "1f363", native: "\u{1F363}" }], version: 1 }, fried_shrimp: { id: "fried_shrimp", name: "Fried Shrimp", keywords: ["food", "animal", "appetizer", "summer"], skins: [{ unified: "1f364", native: "\u{1F364}" }], version: 1 }, fish_cake: { id: "fish_cake", name: "Fish Cake with Swirl", keywords: ["food", "japan", "sea", "beach", "narutomaki", "pink", "kamaboko", "surimi", "ramen"], skins: [{ unified: "1f365", native: "\u{1F365}" }], version: 1 }, moon_cake: { id: "moon_cake", name: "Moon Cake", keywords: ["food", "autumn"], skins: [{ unified: "1f96e", native: "\u{1F96E}" }], version: 11 }, dango: { id: "dango", name: "Dango", keywords: ["food", "dessert", "sweet", "japanese", "barbecue", "meat"], skins: [{ unified: "1f361", native: "\u{1F361}" }], version: 1 }, dumpling: { id: "dumpling", name: "Dumpling", keywords: ["food", "empanada", "pierogi", "potsticker"], skins: [{ unified: "1f95f", native: "\u{1F95F}" }], version: 5 }, fortune_cookie: { id: "fortune_cookie", name: "Fortune Cookie", keywords: ["food", "prophecy"], skins: [{ unified: "1f960", native: "\u{1F960}" }], version: 5 }, takeout_box: { id: "takeout_box", name: "Takeout Box", keywords: ["food", "leftovers"], skins: [{ unified: "1f961", native: "\u{1F961}" }], version: 5 }, crab: { id: "crab", name: "Crab", keywords: ["animal", "crustacean"], skins: [{ unified: "1f980", native: "\u{1F980}" }], version: 1 }, lobster: { id: "lobster", name: "Lobster", keywords: ["animal", "nature", "bisque", "claws", "seafood"], skins: [{ unified: "1f99e", native: "\u{1F99E}" }], version: 11 }, shrimp: { id: "shrimp", name: "Shrimp", keywords: ["animal", "ocean", "nature", "seafood"], skins: [{ unified: "1f990", native: "\u{1F990}" }], version: 3 }, squid: { id: "squid", name: "Squid", keywords: ["animal", "nature", "ocean", "sea"], skins: [{ unified: "1f991", native: "\u{1F991}" }], version: 3 }, oyster: { id: "oyster", name: "Oyster", keywords: ["food"], skins: [{ unified: "1f9aa", native: "\u{1F9AA}" }], version: 12 }, icecream: { id: "icecream", name: "Soft Ice Cream", keywords: ["icecream", "food", "hot", "dessert", "summer"], skins: [{ unified: "1f366", native: "\u{1F366}" }], version: 1 }, shaved_ice: { id: "shaved_ice", name: "Shaved Ice", keywords: ["hot", "dessert", "summer"], skins: [{ unified: "1f367", native: "\u{1F367}" }], version: 1 }, ice_cream: { id: "ice_cream", name: "Ice Cream", keywords: ["food", "hot", "dessert"], skins: [{ unified: "1f368", native: "\u{1F368}" }], version: 1 }, doughnut: { id: "doughnut", name: "Doughnut", keywords: ["food", "dessert", "snack", "sweet", "donut"], skins: [{ unified: "1f369", native: "\u{1F369}" }], version: 1 }, cookie: { id: "cookie", name: "Cookie", keywords: ["food", "snack", "oreo", "chocolate", "sweet", "dessert"], skins: [{ unified: "1f36a", native: "\u{1F36A}" }], version: 1 }, birthday: { id: "birthday", name: "Birthday Cake", keywords: ["food", "dessert"], skins: [{ unified: "1f382", native: "\u{1F382}" }], version: 1 }, cake: { id: "cake", name: "Shortcake", keywords: ["cake", "food", "dessert"], skins: [{ unified: "1f370", native: "\u{1F370}" }], version: 1 }, cupcake: { id: "cupcake", name: "Cupcake", keywords: ["food", "dessert", "bakery", "sweet"], skins: [{ unified: "1f9c1", native: "\u{1F9C1}" }], version: 11 }, pie: { id: "pie", name: "Pie", keywords: ["food", "dessert", "pastry"], skins: [{ unified: "1f967", native: "\u{1F967}" }], version: 5 }, chocolate_bar: { id: "chocolate_bar", name: "Chocolate Bar", keywords: ["food", "snack", "dessert", "sweet"], skins: [{ unified: "1f36b", native: "\u{1F36B}" }], version: 1 }, candy: { id: "candy", name: "Candy", keywords: ["snack", "dessert", "sweet", "lolly"], skins: [{ unified: "1f36c", native: "\u{1F36C}" }], version: 1 }, lollipop: { id: "lollipop", name: "Lollipop", keywords: ["food", "snack", "candy", "sweet"], skins: [{ unified: "1f36d", native: "\u{1F36D}" }], version: 1 }, custard: { id: "custard", name: "Custard", keywords: ["dessert", "food"], skins: [{ unified: "1f36e", native: "\u{1F36E}" }], version: 1 }, honey_pot: { id: "honey_pot", name: "Honey Pot", keywords: ["bees", "sweet", "kitchen"], skins: [{ unified: "1f36f", native: "\u{1F36F}" }], version: 1 }, baby_bottle: { id: "baby_bottle", name: "Baby Bottle", keywords: ["food", "container", "milk"], skins: [{ unified: "1f37c", native: "\u{1F37C}" }], version: 1 }, glass_of_milk: { id: "glass_of_milk", name: "Glass of Milk", keywords: ["beverage", "drink", "cow"], skins: [{ unified: "1f95b", native: "\u{1F95B}" }], version: 3 }, coffee: { id: "coffee", name: "Hot Beverage", keywords: ["coffee", "caffeine", "latte", "espresso"], skins: [{ unified: "2615", native: "\u2615" }], version: 1 }, teapot: { id: "teapot", name: "Teapot", keywords: ["drink", "hot"], skins: [{ unified: "1fad6", native: "\u{1FAD6}" }], version: 13 }, tea: { id: "tea", name: "Teacup Without Handle", keywords: ["tea", "drink", "bowl", "breakfast", "green", "british"], skins: [{ unified: "1f375", native: "\u{1F375}" }], version: 1 }, sake: { id: "sake", name: "Sake", keywords: ["wine", "drink", "drunk", "beverage", "japanese", "alcohol", "booze"], skins: [{ unified: "1f376", native: "\u{1F376}" }], version: 1 }, champagne: { id: "champagne", name: "Bottle with Popping Cork", keywords: ["champagne", "drink", "wine", "celebration"], skins: [{ unified: "1f37e", native: "\u{1F37E}" }], version: 1 }, wine_glass: { id: "wine_glass", name: "Wine Glass", keywords: ["drink", "beverage", "drunk", "alcohol", "booze"], skins: [{ unified: "1f377", native: "\u{1F377}" }], version: 1 }, cocktail: { id: "cocktail", name: "Cocktail Glass", keywords: ["drink", "drunk", "alcohol", "beverage", "booze", "mojito"], skins: [{ unified: "1f378", native: "\u{1F378}" }], version: 1 }, tropical_drink: { id: "tropical_drink", name: "Tropical Drink", keywords: ["beverage", "cocktail", "summer", "beach", "alcohol", "booze", "mojito"], skins: [{ unified: "1f379", native: "\u{1F379}" }], version: 1 }, beer: { id: "beer", name: "Beer Mug", keywords: ["relax", "beverage", "drink", "drunk", "party", "pub", "summer", "alcohol", "booze"], skins: [{ unified: "1f37a", native: "\u{1F37A}" }], version: 1 }, beers: { id: "beers", name: "Clinking Beer Mugs", keywords: ["beers", "relax", "beverage", "drink", "drunk", "party", "pub", "summer", "alcohol", "booze"], skins: [{ unified: "1f37b", native: "\u{1F37B}" }], version: 1 }, clinking_glasses: { id: "clinking_glasses", name: "Clinking Glasses", keywords: ["beverage", "drink", "party", "alcohol", "celebrate", "cheers", "wine", "champagne", "toast"], skins: [{ unified: "1f942", native: "\u{1F942}" }], version: 3 }, tumbler_glass: { id: "tumbler_glass", name: "Tumbler Glass", keywords: ["drink", "beverage", "drunk", "alcohol", "liquor", "booze", "bourbon", "scotch", "whisky", "shot"], skins: [{ unified: "1f943", native: "\u{1F943}" }], version: 3 }, pouring_liquid: { id: "pouring_liquid", name: "Pouring Liquid", keywords: ["cup", "water"], skins: [{ unified: "1fad7", native: "\u{1FAD7}" }], version: 14 }, cup_with_straw: { id: "cup_with_straw", name: "Cup with Straw", keywords: ["drink", "soda"], skins: [{ unified: "1f964", native: "\u{1F964}" }], version: 5 }, bubble_tea: { id: "bubble_tea", name: "Bubble Tea", keywords: ["taiwan", "boba", "milk", "straw"], skins: [{ unified: "1f9cb", native: "\u{1F9CB}" }], version: 13 }, beverage_box: { id: "beverage_box", name: "Beverage Box", keywords: ["drink"], skins: [{ unified: "1f9c3", native: "\u{1F9C3}" }], version: 12 }, mate_drink: { id: "mate_drink", name: "Mate", keywords: ["drink", "tea", "beverage"], skins: [{ unified: "1f9c9", native: "\u{1F9C9}" }], version: 12 }, ice_cube: { id: "ice_cube", name: "Ice", keywords: ["cube", "water", "cold"], skins: [{ unified: "1f9ca", native: "\u{1F9CA}" }], version: 12 }, chopsticks: { id: "chopsticks", name: "Chopsticks", keywords: ["food"], skins: [{ unified: "1f962", native: "\u{1F962}" }], version: 5 }, knife_fork_plate: { id: "knife_fork_plate", name: "Fork and Knife with Plate", keywords: ["food", "eat", "meal", "lunch", "dinner", "restaurant"], skins: [{ unified: "1f37d-fe0f", native: "\u{1F37D}\uFE0F" }], version: 1 }, fork_and_knife: { id: "fork_and_knife", name: "Fork and Knife", keywords: ["cutlery", "kitchen"], skins: [{ unified: "1f374", native: "\u{1F374}" }], version: 1 }, spoon: { id: "spoon", name: "Spoon", keywords: ["cutlery", "kitchen", "tableware"], skins: [{ unified: "1f944", native: "\u{1F944}" }], version: 3 }, hocho: { id: "hocho", name: "Hocho", keywords: ["knife", "kitchen", "blade", "cutlery", "weapon"], skins: [{ unified: "1f52a", native: "\u{1F52A}" }], version: 1 }, jar: { id: "jar", name: "Jar", keywords: ["container", "sauce"], skins: [{ unified: "1fad9", native: "\u{1FAD9}" }], version: 14 }, amphora: { id: "amphora", name: "Amphora", keywords: ["vase", "jar"], skins: [{ unified: "1f3fa", native: "\u{1F3FA}" }], version: 1 }, earth_africa: { id: "earth_africa", name: "Earth Globe Europe-Africa", keywords: ["africa", "showing", "europe", "world", "international"], skins: [{ unified: "1f30d", native: "\u{1F30D}" }], version: 1 }, earth_americas: { id: "earth_americas", name: "Earth Globe Americas", keywords: ["showing", "world", "USA", "international"], skins: [{ unified: "1f30e", native: "\u{1F30E}" }], version: 1 }, earth_asia: { id: "earth_asia", name: "Earth Globe Asia-Australia", keywords: ["asia", "showing", "australia", "world", "east", "international"], skins: [{ unified: "1f30f", native: "\u{1F30F}" }], version: 1 }, globe_with_meridians: { id: "globe_with_meridians", name: "Globe with Meridians", keywords: ["earth", "international", "world", "internet", "interweb", "i18n"], skins: [{ unified: "1f310", native: "\u{1F310}" }], version: 1 }, world_map: { id: "world_map", name: "World Map", keywords: ["location", "direction"], skins: [{ unified: "1f5fa-fe0f", native: "\u{1F5FA}\uFE0F" }], version: 1 }, japan: { id: "japan", name: "Map of Japan", keywords: ["nation", "country", "japanese", "asia"], skins: [{ unified: "1f5fe", native: "\u{1F5FE}" }], version: 1 }, compass: { id: "compass", name: "Compass", keywords: ["magnetic", "navigation", "orienteering"], skins: [{ unified: "1f9ed", native: "\u{1F9ED}" }], version: 11 }, snow_capped_mountain: { id: "snow_capped_mountain", name: "Snow-Capped Mountain", keywords: ["snow", "capped", "photo", "nature", "environment", "winter", "cold"], skins: [{ unified: "1f3d4-fe0f", native: "\u{1F3D4}\uFE0F" }], version: 1 }, mountain: { id: "mountain", name: "Mountain", keywords: ["photo", "nature", "environment"], skins: [{ unified: "26f0-fe0f", native: "\u26F0\uFE0F" }], version: 1 }, volcano: { id: "volcano", name: "Volcano", keywords: ["photo", "nature", "disaster"], skins: [{ unified: "1f30b", native: "\u{1F30B}" }], version: 1 }, mount_fuji: { id: "mount_fuji", name: "Mount Fuji", keywords: ["photo", "mountain", "nature", "japanese"], skins: [{ unified: "1f5fb", native: "\u{1F5FB}" }], version: 1 }, camping: { id: "camping", name: "Camping", keywords: ["photo", "outdoors", "tent"], skins: [{ unified: "1f3d5-fe0f", native: "\u{1F3D5}\uFE0F" }], version: 1 }, beach_with_umbrella: { id: "beach_with_umbrella", name: "Beach with Umbrella", keywords: ["weather", "summer", "sunny", "sand", "mojito"], skins: [{ unified: "1f3d6-fe0f", native: "\u{1F3D6}\uFE0F" }], version: 1 }, desert: { id: "desert", name: "Desert", keywords: ["photo", "warm", "saharah"], skins: [{ unified: "1f3dc-fe0f", native: "\u{1F3DC}\uFE0F" }], version: 1 }, desert_island: { id: "desert_island", name: "Desert Island", keywords: ["photo", "tropical", "mojito"], skins: [{ unified: "1f3dd-fe0f", native: "\u{1F3DD}\uFE0F" }], version: 1 }, national_park: { id: "national_park", name: "National Park", keywords: ["photo", "environment", "nature"], skins: [{ unified: "1f3de-fe0f", native: "\u{1F3DE}\uFE0F" }], version: 1 }, stadium: { id: "stadium", name: "Stadium", keywords: ["photo", "place", "sports", "concert", "venue"], skins: [{ unified: "1f3df-fe0f", native: "\u{1F3DF}\uFE0F" }], version: 1 }, classical_building: { id: "classical_building", name: "Classical Building", keywords: ["art", "culture", "history"], skins: [{ unified: "1f3db-fe0f", native: "\u{1F3DB}\uFE0F" }], version: 1 }, building_construction: { id: "building_construction", name: "Building Construction", keywords: ["wip", "working", "progress"], skins: [{ unified: "1f3d7-fe0f", native: "\u{1F3D7}\uFE0F" }], version: 1 }, bricks: { id: "bricks", name: "Brick", keywords: ["bricks"], skins: [{ unified: "1f9f1", native: "\u{1F9F1}" }], version: 11 }, rock: { id: "rock", name: "Rock", keywords: ["stone"], skins: [{ unified: "1faa8", native: "\u{1FAA8}" }], version: 13 }, wood: { id: "wood", name: "Wood", keywords: ["nature", "timber", "trunk"], skins: [{ unified: "1fab5", native: "\u{1FAB5}" }], version: 13 }, hut: { id: "hut", name: "Hut", keywords: ["house", "structure"], skins: [{ unified: "1f6d6", native: "\u{1F6D6}" }], version: 13 }, house_buildings: { id: "house_buildings", name: "Houses", keywords: ["house", "buildings", "photo"], skins: [{ unified: "1f3d8-fe0f", native: "\u{1F3D8}\uFE0F" }], version: 1 }, derelict_house_building: { id: "derelict_house_building", name: "Derelict House", keywords: ["building", "abandon", "evict", "broken"], skins: [{ unified: "1f3da-fe0f", native: "\u{1F3DA}\uFE0F" }], version: 1 }, house: { id: "house", name: "House", keywords: ["building", "home"], skins: [{ unified: "1f3e0", native: "\u{1F3E0}" }], version: 1 }, house_with_garden: { id: "house_with_garden", name: "House with Garden", keywords: ["home", "plant", "nature"], skins: [{ unified: "1f3e1", native: "\u{1F3E1}" }], version: 1 }, office: { id: "office", name: "Office Building", keywords: ["bureau", "work"], skins: [{ unified: "1f3e2", native: "\u{1F3E2}" }], version: 1 }, post_office: { id: "post_office", name: "Japanese Post Office", keywords: ["building", "envelope", "communication"], skins: [{ unified: "1f3e3", native: "\u{1F3E3}" }], version: 1 }, european_post_office: { id: "european_post_office", name: "Post Office", keywords: ["european", "building", "email"], skins: [{ unified: "1f3e4", native: "\u{1F3E4}" }], version: 1 }, hospital: { id: "hospital", name: "Hospital", keywords: ["building", "health", "surgery", "doctor"], skins: [{ unified: "1f3e5", native: "\u{1F3E5}" }], version: 1 }, bank: { id: "bank", name: "Bank", keywords: ["building", "money", "sales", "cash", "business", "enterprise"], skins: [{ unified: "1f3e6", native: "\u{1F3E6}" }], version: 1 }, hotel: { id: "hotel", name: "Hotel", keywords: ["building", "accomodation", "checkin"], skins: [{ unified: "1f3e8", native: "\u{1F3E8}" }], version: 1 }, love_hotel: { id: "love_hotel", name: "Love Hotel", keywords: ["like", "affection", "dating"], skins: [{ unified: "1f3e9", native: "\u{1F3E9}" }], version: 1 }, convenience_store: { id: "convenience_store", name: "Convenience Store", keywords: ["building", "shopping", "groceries"], skins: [{ unified: "1f3ea", native: "\u{1F3EA}" }], version: 1 }, school: { id: "school", name: "School", keywords: ["building", "student", "education", "learn", "teach"], skins: [{ unified: "1f3eb", native: "\u{1F3EB}" }], version: 1 }, department_store: { id: "department_store", name: "Department Store", keywords: ["building", "shopping", "mall"], skins: [{ unified: "1f3ec", native: "\u{1F3EC}" }], version: 1 }, factory: { id: "factory", name: "Factory", keywords: ["building", "industry", "pollution", "smoke"], skins: [{ unified: "1f3ed", native: "\u{1F3ED}" }], version: 1 }, japanese_castle: { id: "japanese_castle", name: "Japanese Castle", keywords: ["photo", "building"], skins: [{ unified: "1f3ef", native: "\u{1F3EF}" }], version: 1 }, european_castle: { id: "european_castle", name: "Castle", keywords: ["european", "building", "royalty", "history"], skins: [{ unified: "1f3f0", native: "\u{1F3F0}" }], version: 1 }, wedding: { id: "wedding", name: "Wedding", keywords: ["love", "like", "affection", "couple", "marriage", "bride", "groom"], skins: [{ unified: "1f492", native: "\u{1F492}" }], version: 1 }, tokyo_tower: { id: "tokyo_tower", name: "Tokyo Tower", keywords: ["photo", "japanese"], skins: [{ unified: "1f5fc", native: "\u{1F5FC}" }], version: 1 }, statue_of_liberty: { id: "statue_of_liberty", name: "Statue of Liberty", keywords: ["american", "newyork"], skins: [{ unified: "1f5fd", native: "\u{1F5FD}" }], version: 1 }, church: { id: "church", name: "Church", keywords: ["building", "religion", "christ"], skins: [{ unified: "26ea", native: "\u26EA" }], version: 1 }, mosque: { id: "mosque", name: "Mosque", keywords: ["islam", "worship", "minaret"], skins: [{ unified: "1f54c", native: "\u{1F54C}" }], version: 1 }, hindu_temple: { id: "hindu_temple", name: "Hindu Temple", keywords: ["religion"], skins: [{ unified: "1f6d5", native: "\u{1F6D5}" }], version: 12 }, synagogue: { id: "synagogue", name: "Synagogue", keywords: ["judaism", "worship", "temple", "jewish"], skins: [{ unified: "1f54d", native: "\u{1F54D}" }], version: 1 }, shinto_shrine: { id: "shinto_shrine", name: "Shinto Shrine", keywords: ["temple", "japan", "kyoto"], skins: [{ unified: "26e9-fe0f", native: "\u26E9\uFE0F" }], version: 1 }, kaaba: { id: "kaaba", name: "Kaaba", keywords: ["mecca", "mosque", "islam"], skins: [{ unified: "1f54b", native: "\u{1F54B}" }], version: 1 }, fountain: { id: "fountain", name: "Fountain", keywords: ["photo", "summer", "water", "fresh"], skins: [{ unified: "26f2", native: "\u26F2" }], version: 1 }, tent: { id: "tent", name: "Tent", keywords: ["photo", "camping", "outdoors"], skins: [{ unified: "26fa", native: "\u26FA" }], version: 1 }, foggy: { id: "foggy", name: "Foggy", keywords: ["photo", "mountain"], skins: [{ unified: "1f301", native: "\u{1F301}" }], version: 1 }, night_with_stars: { id: "night_with_stars", name: "Night with Stars", keywords: ["evening", "city", "downtown"], skins: [{ unified: "1f303", native: "\u{1F303}" }], version: 1 }, cityscape: { id: "cityscape", name: "Cityscape", keywords: ["photo", "night", "life", "urban"], skins: [{ unified: "1f3d9-fe0f", native: "\u{1F3D9}\uFE0F" }], version: 1 }, sunrise_over_mountains: { id: "sunrise_over_mountains", name: "Sunrise over Mountains", keywords: ["view", "vacation", "photo"], skins: [{ unified: "1f304", native: "\u{1F304}" }], version: 1 }, sunrise: { id: "sunrise", name: "Sunrise", keywords: ["morning", "view", "vacation", "photo"], skins: [{ unified: "1f305", native: "\u{1F305}" }], version: 1 }, city_sunset: { id: "city_sunset", name: "Cityscape at Dusk", keywords: ["city", "sunset", "photo", "evening", "sky", "buildings"], skins: [{ unified: "1f306", native: "\u{1F306}" }], version: 1 }, city_sunrise: { id: "city_sunrise", name: "Sunset", keywords: ["city", "sunrise", "photo", "good", "morning", "dawn"], skins: [{ unified: "1f307", native: "\u{1F307}" }], version: 1 }, bridge_at_night: { id: "bridge_at_night", name: "Bridge at Night", keywords: ["photo", "sanfrancisco"], skins: [{ unified: "1f309", native: "\u{1F309}" }], version: 1 }, hotsprings: { id: "hotsprings", name: "Hot Springs", keywords: ["hotsprings", "bath", "warm", "relax"], skins: [{ unified: "2668-fe0f", native: "\u2668\uFE0F" }], version: 1 }, carousel_horse: { id: "carousel_horse", name: "Carousel Horse", keywords: ["photo", "carnival"], skins: [{ unified: "1f3a0", native: "\u{1F3A0}" }], version: 1 }, playground_slide: { id: "playground_slide", name: "Playground Slide", keywords: ["fun", "park"], skins: [{ unified: "1f6dd", native: "\u{1F6DD}" }], version: 14 }, ferris_wheel: { id: "ferris_wheel", name: "Ferris Wheel", keywords: ["photo", "carnival", "londoneye"], skins: [{ unified: "1f3a1", native: "\u{1F3A1}" }], version: 1 }, roller_coaster: { id: "roller_coaster", name: "Roller Coaster", keywords: ["carnival", "playground", "photo", "fun"], skins: [{ unified: "1f3a2", native: "\u{1F3A2}" }], version: 1 }, barber: { id: "barber", name: "Barber Pole", keywords: ["hair", "salon", "style"], skins: [{ unified: "1f488", native: "\u{1F488}" }], version: 1 }, circus_tent: { id: "circus_tent", name: "Circus Tent", keywords: ["festival", "carnival", "party"], skins: [{ unified: "1f3aa", native: "\u{1F3AA}" }], version: 1 }, steam_locomotive: { id: "steam_locomotive", name: "Locomotive", keywords: ["steam", "transportation", "vehicle", "train"], skins: [{ unified: "1f682", native: "\u{1F682}" }], version: 1 }, railway_car: { id: "railway_car", name: "Railway Car", keywords: ["transportation", "vehicle"], skins: [{ unified: "1f683", native: "\u{1F683}" }], version: 1 }, bullettrain_side: { id: "bullettrain_side", name: "High-Speed Train", keywords: ["bullettrain", "side", "high", "speed", "transportation", "vehicle"], skins: [{ unified: "1f684", native: "\u{1F684}" }], version: 1 }, bullettrain_front: { id: "bullettrain_front", name: "Bullet Train", keywords: ["bullettrain", "front", "transportation", "vehicle", "speed", "fast", "public", "travel"], skins: [{ unified: "1f685", native: "\u{1F685}" }], version: 1 }, train2: { id: "train2", name: "Train", keywords: ["train2", "transportation", "vehicle"], skins: [{ unified: "1f686", native: "\u{1F686}" }], version: 1 }, metro: { id: "metro", name: "Metro", keywords: ["transportation", "blue", "square", "mrt", "underground", "tube"], skins: [{ unified: "1f687", native: "\u{1F687}" }], version: 1 }, light_rail: { id: "light_rail", name: "Light Rail", keywords: ["transportation", "vehicle"], skins: [{ unified: "1f688", native: "\u{1F688}" }], version: 1 }, station: { id: "station", name: "Station", keywords: ["transportation", "vehicle", "public"], skins: [{ unified: "1f689", native: "\u{1F689}" }], version: 1 }, tram: { id: "tram", name: "Tram", keywords: ["transportation", "vehicle"], skins: [{ unified: "1f68a", native: "\u{1F68A}" }], version: 1 }, monorail: { id: "monorail", name: "Monorail", keywords: ["transportation", "vehicle"], skins: [{ unified: "1f69d", native: "\u{1F69D}" }], version: 1 }, mountain_railway: { id: "mountain_railway", name: "Mountain Railway", keywords: ["transportation", "vehicle"], skins: [{ unified: "1f69e", native: "\u{1F69E}" }], version: 1 }, train: { id: "train", name: "Tram Car", keywords: ["train", "transportation", "vehicle", "carriage", "public", "travel"], skins: [{ unified: "1f68b", native: "\u{1F68B}" }], version: 1 }, bus: { id: "bus", name: "Bus", keywords: ["car", "vehicle", "transportation"], skins: [{ unified: "1f68c", native: "\u{1F68C}" }], version: 1 }, oncoming_bus: { id: "oncoming_bus", name: "Oncoming Bus", keywords: ["vehicle", "transportation"], skins: [{ unified: "1f68d", native: "\u{1F68D}" }], version: 1 }, trolleybus: { id: "trolleybus", name: "Trolleybus", keywords: ["bart", "transportation", "vehicle"], skins: [{ unified: "1f68e", native: "\u{1F68E}" }], version: 1 }, minibus: { id: "minibus", name: "Minibus", keywords: ["vehicle", "car", "transportation"], skins: [{ unified: "1f690", native: "\u{1F690}" }], version: 1 }, ambulance: { id: "ambulance", name: "Ambulance", keywords: ["health", "911", "hospital"], skins: [{ unified: "1f691", native: "\u{1F691}" }], version: 1 }, fire_engine: { id: "fire_engine", name: "Fire Engine", keywords: ["transportation", "cars", "vehicle"], skins: [{ unified: "1f692", native: "\u{1F692}" }], version: 1 }, police_car: { id: "police_car", name: "Police Car", keywords: ["vehicle", "cars", "transportation", "law", "legal", "enforcement"], skins: [{ unified: "1f693", native: "\u{1F693}" }], version: 1 }, oncoming_police_car: { id: "oncoming_police_car", name: "Oncoming Police Car", keywords: ["vehicle", "law", "legal", "enforcement", "911"], skins: [{ unified: "1f694", native: "\u{1F694}" }], version: 1 }, taxi: { id: "taxi", name: "Taxi", keywords: ["uber", "vehicle", "cars", "transportation"], skins: [{ unified: "1f695", native: "\u{1F695}" }], version: 1 }, oncoming_taxi: { id: "oncoming_taxi", name: "Oncoming Taxi", keywords: ["vehicle", "cars", "uber"], skins: [{ unified: "1f696", native: "\u{1F696}" }], version: 1 }, car: { id: "car", name: "Automobile", keywords: ["car", "red", "transportation", "vehicle"], skins: [{ unified: "1f697", native: "\u{1F697}" }], version: 1 }, oncoming_automobile: { id: "oncoming_automobile", name: "Oncoming Automobile", keywords: ["car", "vehicle", "transportation"], skins: [{ unified: "1f698", native: "\u{1F698}" }], version: 1 }, blue_car: { id: "blue_car", name: "Recreational Vehicle", keywords: ["blue", "car", "sport", "utility", "transportation"], skins: [{ unified: "1f699", native: "\u{1F699}" }], version: 1 }, pickup_truck: { id: "pickup_truck", name: "Pickup Truck", keywords: ["car", "transportation"], skins: [{ unified: "1f6fb", native: "\u{1F6FB}" }], version: 13 }, truck: { id: "truck", name: "Delivery Truck", keywords: ["cars", "transportation"], skins: [{ unified: "1f69a", native: "\u{1F69A}" }], version: 1 }, articulated_lorry: { id: "articulated_lorry", name: "Articulated Lorry", keywords: ["vehicle", "cars", "transportation", "express"], skins: [{ unified: "1f69b", native: "\u{1F69B}" }], version: 1 }, tractor: { id: "tractor", name: "Tractor", keywords: ["vehicle", "car", "farming", "agriculture"], skins: [{ unified: "1f69c", native: "\u{1F69C}" }], version: 1 }, racing_car: { id: "racing_car", name: "Racing Car", keywords: ["sports", "race", "fast", "formula", "f1"], skins: [{ unified: "1f3ce-fe0f", native: "\u{1F3CE}\uFE0F" }], version: 1 }, racing_motorcycle: { id: "racing_motorcycle", name: "Motorcycle", keywords: ["racing", "race", "sports", "fast"], skins: [{ unified: "1f3cd-fe0f", native: "\u{1F3CD}\uFE0F" }], version: 1 }, motor_scooter: { id: "motor_scooter", name: "Motor Scooter", keywords: ["vehicle", "vespa", "sasha"], skins: [{ unified: "1f6f5", native: "\u{1F6F5}" }], version: 3 }, manual_wheelchair: { id: "manual_wheelchair", name: "Manual Wheelchair", keywords: ["accessibility"], skins: [{ unified: "1f9bd", native: "\u{1F9BD}" }], version: 12 }, motorized_wheelchair: { id: "motorized_wheelchair", name: "Motorized Wheelchair", keywords: ["accessibility"], skins: [{ unified: "1f9bc", native: "\u{1F9BC}" }], version: 12 }, auto_rickshaw: { id: "auto_rickshaw", name: "Auto Rickshaw", keywords: ["move", "transportation"], skins: [{ unified: "1f6fa", native: "\u{1F6FA}" }], version: 12 }, bike: { id: "bike", name: "Bicycle", keywords: ["bike", "sports", "exercise", "hipster"], skins: [{ unified: "1f6b2", native: "\u{1F6B2}" }], version: 1 }, scooter: { id: "scooter", name: "Scooter", keywords: ["kick", "vehicle", "razor"], skins: [{ unified: "1f6f4", native: "\u{1F6F4}" }], version: 3 }, skateboard: { id: "skateboard", name: "Skateboard", keywords: ["board"], skins: [{ unified: "1f6f9", native: "\u{1F6F9}" }], version: 11 }, roller_skate: { id: "roller_skate", name: "Roller Skate", keywords: ["footwear", "sports"], skins: [{ unified: "1f6fc", native: "\u{1F6FC}" }], version: 13 }, busstop: { id: "busstop", name: "Bus Stop", keywords: ["busstop", "transportation", "wait"], skins: [{ unified: "1f68f", native: "\u{1F68F}" }], version: 1 }, motorway: { id: "motorway", name: "Motorway", keywords: ["road", "cupertino", "interstate", "highway"], skins: [{ unified: "1f6e3-fe0f", native: "\u{1F6E3}\uFE0F" }], version: 1 }, railway_track: { id: "railway_track", name: "Railway Track", keywords: ["train", "transportation"], skins: [{ unified: "1f6e4-fe0f", native: "\u{1F6E4}\uFE0F" }], version: 1 }, oil_drum: { id: "oil_drum", name: "Oil Drum", keywords: ["barrell"], skins: [{ unified: "1f6e2-fe0f", native: "\u{1F6E2}\uFE0F" }], version: 1 }, fuelpump: { id: "fuelpump", name: "Fuel Pump", keywords: ["fuelpump", "gas", "station", "petroleum"], skins: [{ unified: "26fd", native: "\u26FD" }], version: 1 }, wheel: { id: "wheel", name: "Wheel", keywords: ["car", "transport"], skins: [{ unified: "1f6de", native: "\u{1F6DE}" }], version: 14 }, rotating_light: { id: "rotating_light", name: "Police Car Light", keywords: ["rotating", "ambulance", "911", "emergency", "alert", "error", "pinged", "law", "legal"], skins: [{ unified: "1f6a8", native: "\u{1F6A8}" }], version: 1 }, traffic_light: { id: "traffic_light", name: "Horizontal Traffic Light", keywords: ["transportation", "signal"], skins: [{ unified: "1f6a5", native: "\u{1F6A5}" }], version: 1 }, vertical_traffic_light: { id: "vertical_traffic_light", name: "Vertical Traffic Light", keywords: ["transportation", "driving"], skins: [{ unified: "1f6a6", native: "\u{1F6A6}" }], version: 1 }, octagonal_sign: { id: "octagonal_sign", name: "Stop Sign", keywords: ["octagonal"], skins: [{ unified: "1f6d1", native: "\u{1F6D1}" }], version: 3 }, construction: { id: "construction", name: "Construction", keywords: ["wip", "progress", "caution", "warning"], skins: [{ unified: "1f6a7", native: "\u{1F6A7}" }], version: 1 }, anchor: { id: "anchor", name: "Anchor", keywords: ["ship", "ferry", "sea", "boat"], skins: [{ unified: "2693", native: "\u2693" }], version: 1 }, ring_buoy: { id: "ring_buoy", name: "Ring Buoy", keywords: ["life", "saver", "preserver"], skins: [{ unified: "1f6df", native: "\u{1F6DF}" }], version: 14 }, boat: { id: "boat", name: "Sailboat", keywords: ["boat", "ship", "summer", "transportation", "water", "sailing"], skins: [{ unified: "26f5", native: "\u26F5" }], version: 1 }, canoe: { id: "canoe", name: "Canoe", keywords: ["boat", "paddle", "water", "ship"], skins: [{ unified: "1f6f6", native: "\u{1F6F6}" }], version: 3 }, speedboat: { id: "speedboat", name: "Speedboat", keywords: ["ship", "transportation", "vehicle", "summer"], skins: [{ unified: "1f6a4", native: "\u{1F6A4}" }], version: 1 }, passenger_ship: { id: "passenger_ship", name: "Passenger Ship", keywords: ["yacht", "cruise", "ferry"], skins: [{ unified: "1f6f3-fe0f", native: "\u{1F6F3}\uFE0F" }], version: 1 }, ferry: { id: "ferry", name: "Ferry", keywords: ["boat", "ship", "yacht"], skins: [{ unified: "26f4-fe0f", native: "\u26F4\uFE0F" }], version: 1 }, motor_boat: { id: "motor_boat", name: "Motor Boat", keywords: ["ship"], skins: [{ unified: "1f6e5-fe0f", native: "\u{1F6E5}\uFE0F" }], version: 1 }, ship: { id: "ship", name: "Ship", keywords: ["transportation", "titanic", "deploy"], skins: [{ unified: "1f6a2", native: "\u{1F6A2}" }], version: 1 }, airplane: { id: "airplane", name: "Airplane", keywords: ["vehicle", "transportation", "flight", "fly"], skins: [{ unified: "2708-fe0f", native: "\u2708\uFE0F" }], version: 1 }, small_airplane: { id: "small_airplane", name: "Small Airplane", keywords: ["flight", "transportation", "fly", "vehicle"], skins: [{ unified: "1f6e9-fe0f", native: "\u{1F6E9}\uFE0F" }], version: 1 }, airplane_departure: { id: "airplane_departure", name: "Airplane Departure", keywords: ["airport", "flight", "landing"], skins: [{ unified: "1f6eb", native: "\u{1F6EB}" }], version: 1 }, airplane_arriving: { id: "airplane_arriving", name: "Airplane Arrival", keywords: ["arriving", "airport", "flight", "boarding"], skins: [{ unified: "1f6ec", native: "\u{1F6EC}" }], version: 1 }, parachute: { id: "parachute", name: "Parachute", keywords: ["fly", "glide"], skins: [{ unified: "1fa82", native: "\u{1FA82}" }], version: 12 }, seat: { id: "seat", name: "Seat", keywords: ["sit", "airplane", "transport", "bus", "flight", "fly"], skins: [{ unified: "1f4ba", native: "\u{1F4BA}" }], version: 1 }, helicopter: { id: "helicopter", name: "Helicopter", keywords: ["transportation", "vehicle", "fly"], skins: [{ unified: "1f681", native: "\u{1F681}" }], version: 1 }, suspension_railway: { id: "suspension_railway", name: "Suspension Railway", keywords: ["vehicle", "transportation"], skins: [{ unified: "1f69f", native: "\u{1F69F}" }], version: 1 }, mountain_cableway: { id: "mountain_cableway", name: "Mountain Cableway", keywords: ["transportation", "vehicle", "ski"], skins: [{ unified: "1f6a0", native: "\u{1F6A0}" }], version: 1 }, aerial_tramway: { id: "aerial_tramway", name: "Aerial Tramway", keywords: ["transportation", "vehicle", "ski"], skins: [{ unified: "1f6a1", native: "\u{1F6A1}" }], version: 1 }, satellite: { id: "satellite", name: "Satellite", keywords: ["communication", "gps", "orbit", "spaceflight", "NASA", "ISS"], skins: [{ unified: "1f6f0-fe0f", native: "\u{1F6F0}\uFE0F" }], version: 1 }, rocket: { id: "rocket", name: "Rocket", keywords: ["launch", "ship", "staffmode", "NASA", "outer", "space", "fly"], skins: [{ unified: "1f680", native: "\u{1F680}" }], version: 1 }, flying_saucer: { id: "flying_saucer", name: "Flying Saucer", keywords: ["transportation", "vehicle", "ufo"], skins: [{ unified: "1f6f8", native: "\u{1F6F8}" }], version: 5 }, bellhop_bell: { id: "bellhop_bell", name: "Bellhop Bell", keywords: ["service"], skins: [{ unified: "1f6ce-fe0f", native: "\u{1F6CE}\uFE0F" }], version: 1 }, luggage: { id: "luggage", name: "Luggage", keywords: ["packing", "travel"], skins: [{ unified: "1f9f3", native: "\u{1F9F3}" }], version: 11 }, hourglass: { id: "hourglass", name: "Hourglass", keywords: ["done", "time", "clock", "oldschool", "limit", "exam", "quiz", "test"], skins: [{ unified: "231b", native: "\u231B" }], version: 1 }, hourglass_flowing_sand: { id: "hourglass_flowing_sand", name: "Hourglass Not Done", keywords: ["flowing", "sand", "oldschool", "time", "countdown"], skins: [{ unified: "23f3", native: "\u23F3" }], version: 1 }, watch: { id: "watch", name: "Watch", keywords: ["time", "accessories"], skins: [{ unified: "231a", native: "\u231A" }], version: 1 }, alarm_clock: { id: "alarm_clock", name: "Alarm Clock", keywords: ["time", "wake"], skins: [{ unified: "23f0", native: "\u23F0" }], version: 1 }, stopwatch: { id: "stopwatch", name: "Stopwatch", keywords: ["time", "deadline"], skins: [{ unified: "23f1-fe0f", native: "\u23F1\uFE0F" }], version: 1 }, timer_clock: { id: "timer_clock", name: "Timer Clock", keywords: ["alarm"], skins: [{ unified: "23f2-fe0f", native: "\u23F2\uFE0F" }], version: 1 }, mantelpiece_clock: { id: "mantelpiece_clock", name: "Mantelpiece Clock", keywords: ["time"], skins: [{ unified: "1f570-fe0f", native: "\u{1F570}\uFE0F" }], version: 1 }, clock12: { id: "clock12", name: "Twelve O\u2019clock", keywords: ["clock12", "o", "clock", "time", "noon", "midnight", "midday", "late", "early", "schedule"], skins: [{ unified: "1f55b", native: "\u{1F55B}" }], version: 1 }, clock1230: { id: "clock1230", name: "Twelve-Thirty", keywords: ["clock1230", "twelve", "thirty", "time", "late", "early", "schedule"], skins: [{ unified: "1f567", native: "\u{1F567}" }], version: 1 }, clock1: { id: "clock1", name: "One O\u2019clock", keywords: ["clock1", "o", "clock", "time", "late", "early", "schedule"], skins: [{ unified: "1f550", native: "\u{1F550}" }], version: 1 }, clock130: { id: "clock130", name: "One-Thirty", keywords: ["clock130", "one", "thirty", "time", "late", "early", "schedule"], skins: [{ unified: "1f55c", native: "\u{1F55C}" }], version: 1 }, clock2: { id: "clock2", name: "Two O\u2019clock", keywords: ["clock2", "o", "clock", "time", "late", "early", "schedule"], skins: [{ unified: "1f551", native: "\u{1F551}" }], version: 1 }, clock230: { id: "clock230", name: "Two-Thirty", keywords: ["clock230", "two", "thirty", "time", "late", "early", "schedule"], skins: [{ unified: "1f55d", native: "\u{1F55D}" }], version: 1 }, clock3: { id: "clock3", name: "Three O\u2019clock", keywords: ["clock3", "o", "clock", "time", "late", "early", "schedule"], skins: [{ unified: "1f552", native: "\u{1F552}" }], version: 1 }, clock330: { id: "clock330", name: "Three-Thirty", keywords: ["clock330", "three", "thirty", "time", "late", "early", "schedule"], skins: [{ unified: "1f55e", native: "\u{1F55E}" }], version: 1 }, clock4: { id: "clock4", name: "Four O\u2019clock", keywords: ["clock4", "o", "clock", "time", "late", "early", "schedule"], skins: [{ unified: "1f553", native: "\u{1F553}" }], version: 1 }, clock430: { id: "clock430", name: "Four-Thirty", keywords: ["clock430", "four", "thirty", "time", "late", "early", "schedule"], skins: [{ unified: "1f55f", native: "\u{1F55F}" }], version: 1 }, clock5: { id: "clock5", name: "Five O\u2019clock", keywords: ["clock5", "o", "clock", "time", "late", "early", "schedule"], skins: [{ unified: "1f554", native: "\u{1F554}" }], version: 1 }, clock530: { id: "clock530", name: "Five-Thirty", keywords: ["clock530", "five", "thirty", "time", "late", "early", "schedule"], skins: [{ unified: "1f560", native: "\u{1F560}" }], version: 1 }, clock6: { id: "clock6", name: "Six O\u2019clock", keywords: ["clock6", "o", "clock", "time", "late", "early", "schedule", "dawn", "dusk"], skins: [{ unified: "1f555", native: "\u{1F555}" }], version: 1 }, clock630: { id: "clock630", name: "Six-Thirty", keywords: ["clock630", "six", "thirty", "time", "late", "early", "schedule"], skins: [{ unified: "1f561", native: "\u{1F561}" }], version: 1 }, clock7: { id: "clock7", name: "Seven O\u2019clock", keywords: ["clock7", "o", "clock", "time", "late", "early", "schedule"], skins: [{ unified: "1f556", native: "\u{1F556}" }], version: 1 }, clock730: { id: "clock730", name: "Seven-Thirty", keywords: ["clock730", "seven", "thirty", "time", "late", "early", "schedule"], skins: [{ unified: "1f562", native: "\u{1F562}" }], version: 1 }, clock8: { id: "clock8", name: "Eight O\u2019clock", keywords: ["clock8", "o", "clock", "time", "late", "early", "schedule"], skins: [{ unified: "1f557", native: "\u{1F557}" }], version: 1 }, clock830: { id: "clock830", name: "Eight-Thirty", keywords: ["clock830", "eight", "thirty", "time", "late", "early", "schedule"], skins: [{ unified: "1f563", native: "\u{1F563}" }], version: 1 }, clock9: { id: "clock9", name: "Nine O\u2019clock", keywords: ["clock9", "o", "clock", "time", "late", "early", "schedule"], skins: [{ unified: "1f558", native: "\u{1F558}" }], version: 1 }, clock930: { id: "clock930", name: "Nine-Thirty", keywords: ["clock930", "nine", "thirty", "time", "late", "early", "schedule"], skins: [{ unified: "1f564", native: "\u{1F564}" }], version: 1 }, clock10: { id: "clock10", name: "Ten O\u2019clock", keywords: ["clock10", "o", "clock", "time", "late", "early", "schedule"], skins: [{ unified: "1f559", native: "\u{1F559}" }], version: 1 }, clock1030: { id: "clock1030", name: "Ten-Thirty", keywords: ["clock1030", "ten", "thirty", "time", "late", "early", "schedule"], skins: [{ unified: "1f565", native: "\u{1F565}" }], version: 1 }, clock11: { id: "clock11", name: "Eleven O\u2019clock", keywords: ["clock11", "o", "clock", "time", "late", "early", "schedule"], skins: [{ unified: "1f55a", native: "\u{1F55A}" }], version: 1 }, clock1130: { id: "clock1130", name: "Eleven-Thirty", keywords: ["clock1130", "eleven", "thirty", "time", "late", "early", "schedule"], skins: [{ unified: "1f566", native: "\u{1F566}" }], version: 1 }, new_moon: { id: "new_moon", name: "New Moon", keywords: ["nature", "twilight", "planet", "space", "night", "evening", "sleep"], skins: [{ unified: "1f311", native: "\u{1F311}" }], version: 1 }, waxing_crescent_moon: { id: "waxing_crescent_moon", name: "Waxing Crescent Moon", keywords: ["nature", "twilight", "planet", "space", "night", "evening", "sleep"], skins: [{ unified: "1f312", native: "\u{1F312}" }], version: 1 }, first_quarter_moon: { id: "first_quarter_moon", name: "First Quarter Moon", keywords: ["nature", "twilight", "planet", "space", "night", "evening", "sleep"], skins: [{ unified: "1f313", native: "\u{1F313}" }], version: 1 }, moon: { id: "moon", name: "Waxing Gibbous Moon", keywords: ["nature", "night", "sky", "gray", "twilight", "planet", "space", "evening", "sleep"], skins: [{ unified: "1f314", native: "\u{1F314}" }], version: 1 }, full_moon: { id: "full_moon", name: "Full Moon", keywords: ["nature", "yellow", "twilight", "planet", "space", "night", "evening", "sleep"], skins: [{ unified: "1f315", native: "\u{1F315}" }], version: 1 }, waning_gibbous_moon: { id: "waning_gibbous_moon", name: "Waning Gibbous Moon", keywords: ["nature", "twilight", "planet", "space", "night", "evening", "sleep", "waxing"], skins: [{ unified: "1f316", native: "\u{1F316}" }], version: 1 }, last_quarter_moon: { id: "last_quarter_moon", name: "Last Quarter Moon", keywords: ["nature", "twilight", "planet", "space", "night", "evening", "sleep"], skins: [{ unified: "1f317", native: "\u{1F317}" }], version: 1 }, waning_crescent_moon: { id: "waning_crescent_moon", name: "Waning Crescent Moon", keywords: ["nature", "twilight", "planet", "space", "night", "evening", "sleep"], skins: [{ unified: "1f318", native: "\u{1F318}" }], version: 1 }, crescent_moon: { id: "crescent_moon", name: "Crescent Moon", keywords: ["night", "sleep", "sky", "evening", "magic"], skins: [{ unified: "1f319", native: "\u{1F319}" }], version: 1 }, new_moon_with_face: { id: "new_moon_with_face", name: "New Moon Face", keywords: ["with", "nature", "twilight", "planet", "space", "night", "evening", "sleep"], skins: [{ unified: "1f31a", native: "\u{1F31A}" }], version: 1 }, first_quarter_moon_with_face: { id: "first_quarter_moon_with_face", name: "First Quarter Moon Face", keywords: ["with", "nature", "twilight", "planet", "space", "night", "evening", "sleep"], skins: [{ unified: "1f31b", native: "\u{1F31B}" }], version: 1 }, last_quarter_moon_with_face: { id: "last_quarter_moon_with_face", name: "Last Quarter Moon Face", keywords: ["with", "nature", "twilight", "planet", "space", "night", "evening", "sleep"], skins: [{ unified: "1f31c", native: "\u{1F31C}" }], version: 1 }, thermometer: { id: "thermometer", name: "Thermometer", keywords: ["weather", "temperature", "hot", "cold"], skins: [{ unified: "1f321-fe0f", native: "\u{1F321}\uFE0F" }], version: 1 }, sunny: { id: "sunny", name: "Sun", keywords: ["sunny", "weather", "nature", "brightness", "summer", "beach", "spring"], skins: [{ unified: "2600-fe0f", native: "\u2600\uFE0F" }], version: 1 }, full_moon_with_face: { id: "full_moon_with_face", name: "Full Moon Face", keywords: ["with", "nature", "twilight", "planet", "space", "night", "evening", "sleep"], skins: [{ unified: "1f31d", native: "\u{1F31D}" }], version: 1 }, sun_with_face: { id: "sun_with_face", name: "Sun with Face", keywords: ["nature", "morning", "sky"], skins: [{ unified: "1f31e", native: "\u{1F31E}" }], version: 1 }, ringed_planet: { id: "ringed_planet", name: "Ringed Planet", keywords: ["outerspace"], skins: [{ unified: "1fa90", native: "\u{1FA90}" }], version: 12 }, star: { id: "star", name: "Star", keywords: ["night", "yellow"], skins: [{ unified: "2b50", native: "\u2B50" }], version: 1 }, star2: { id: "star2", name: "Glowing Star", keywords: ["star2", "night", "sparkle", "awesome", "good", "magic"], skins: [{ unified: "1f31f", native: "\u{1F31F}" }], version: 1 }, stars: { id: "stars", name: "Shooting Star", keywords: ["stars", "night", "photo"], skins: [{ unified: "1f320", native: "\u{1F320}" }], version: 1 }, milky_way: { id: "milky_way", name: "Milky Way", keywords: ["photo", "space", "stars"], skins: [{ unified: "1f30c", native: "\u{1F30C}" }], version: 1 }, cloud: { id: "cloud", name: "Cloud", keywords: ["weather", "sky"], skins: [{ unified: "2601-fe0f", native: "\u2601\uFE0F" }], version: 1 }, partly_sunny: { id: "partly_sunny", name: "Sun Behind Cloud", keywords: ["partly", "sunny", "weather", "nature", "cloudy", "morning", "fall", "spring"], skins: [{ unified: "26c5", native: "\u26C5" }], version: 1 }, thunder_cloud_and_rain: { id: "thunder_cloud_and_rain", name: "Cloud with Lightning and Rain", keywords: ["thunder", "weather"], skins: [{ unified: "26c8-fe0f", native: "\u26C8\uFE0F" }], version: 1 }, mostly_sunny: { id: "mostly_sunny", name: "Sun Behind Small Cloud", keywords: ["mostly", "sunny", "weather"], skins: [{ unified: "1f324-fe0f", native: "\u{1F324}\uFE0F" }], version: 1 }, barely_sunny: { id: "barely_sunny", name: "Sun Behind Large Cloud", keywords: ["barely", "sunny", "weather"], skins: [{ unified: "1f325-fe0f", native: "\u{1F325}\uFE0F" }], version: 1 }, partly_sunny_rain: { id: "partly_sunny_rain", name: "Sun Behind Rain Cloud", keywords: ["partly", "sunny", "weather"], skins: [{ unified: "1f326-fe0f", native: "\u{1F326}\uFE0F" }], version: 1 }, rain_cloud: { id: "rain_cloud", name: "Cloud with Rain", keywords: ["weather"], skins: [{ unified: "1f327-fe0f", native: "\u{1F327}\uFE0F" }], version: 1 }, snow_cloud: { id: "snow_cloud", name: "Cloud with Snow", keywords: ["weather"], skins: [{ unified: "1f328-fe0f", native: "\u{1F328}\uFE0F" }], version: 1 }, lightning: { id: "lightning", name: "Cloud with Lightning", keywords: ["weather", "thunder"], skins: [{ unified: "1f329-fe0f", native: "\u{1F329}\uFE0F" }], version: 1 }, tornado: { id: "tornado", name: "Tornado", keywords: ["cloud", "weather", "cyclone", "twister"], skins: [{ unified: "1f32a-fe0f", native: "\u{1F32A}\uFE0F" }], version: 1 }, fog: { id: "fog", name: "Fog", keywords: ["weather"], skins: [{ unified: "1f32b-fe0f", native: "\u{1F32B}\uFE0F" }], version: 1 }, wind_blowing_face: { id: "wind_blowing_face", name: "Wind Face", keywords: ["blowing", "gust", "air"], skins: [{ unified: "1f32c-fe0f", native: "\u{1F32C}\uFE0F" }], version: 1 }, cyclone: { id: "cyclone", name: "Cyclone", keywords: ["weather", "swirl", "blue", "cloud", "vortex", "spiral", "whirlpool", "spin", "tornado", "hurricane", "typhoon"], skins: [{ unified: "1f300", native: "\u{1F300}" }], version: 1 }, rainbow: { id: "rainbow", name: "Rainbow", keywords: ["nature", "happy", "unicorn", "face", "photo", "sky", "spring"], skins: [{ unified: "1f308", native: "\u{1F308}" }], version: 1 }, closed_umbrella: { id: "closed_umbrella", name: "Closed Umbrella", keywords: ["weather", "rain", "drizzle"], skins: [{ unified: "1f302", native: "\u{1F302}" }], version: 1 }, umbrella: { id: "umbrella", name: "Umbrella", keywords: ["weather", "spring"], skins: [{ unified: "2602-fe0f", native: "\u2602\uFE0F" }], version: 1 }, umbrella_with_rain_drops: { id: "umbrella_with_rain_drops", name: "Umbrella with Rain Drops", keywords: ["rainy", "weather", "spring"], skins: [{ unified: "2614", native: "\u2614" }], version: 1 }, umbrella_on_ground: { id: "umbrella_on_ground", name: "Umbrella on Ground", keywords: ["weather", "summer"], skins: [{ unified: "26f1-fe0f", native: "\u26F1\uFE0F" }], version: 1 }, zap: { id: "zap", name: "High Voltage", keywords: ["zap", "thunder", "weather", "lightning", "bolt", "fast"], skins: [{ unified: "26a1", native: "\u26A1" }], version: 1 }, snowflake: { id: "snowflake", name: "Snowflake", keywords: ["winter", "season", "cold", "weather", "christmas", "xmas"], skins: [{ unified: "2744-fe0f", native: "\u2744\uFE0F" }], version: 1 }, snowman: { id: "snowman", name: "Snowman", keywords: ["winter", "season", "cold", "weather", "christmas", "xmas", "frozen"], skins: [{ unified: "2603-fe0f", native: "\u2603\uFE0F" }], version: 1 }, snowman_without_snow: { id: "snowman_without_snow", name: "Snowman Without Snow", keywords: ["winter", "season", "cold", "weather", "christmas", "xmas", "frozen"], skins: [{ unified: "26c4", native: "\u26C4" }], version: 1 }, comet: { id: "comet", name: "Comet", keywords: ["space"], skins: [{ unified: "2604-fe0f", native: "\u2604\uFE0F" }], version: 1 }, fire: { id: "fire", name: "Fire", keywords: ["hot", "cook", "flame"], skins: [{ unified: "1f525", native: "\u{1F525}" }], version: 1 }, droplet: { id: "droplet", name: "Droplet", keywords: ["water", "drip", "faucet", "spring"], skins: [{ unified: "1f4a7", native: "\u{1F4A7}" }], version: 1 }, ocean: { id: "ocean", name: "Water Wave", keywords: ["ocean", "sea", "nature", "tsunami", "disaster"], skins: [{ unified: "1f30a", native: "\u{1F30A}" }], version: 1 }, jack_o_lantern: { id: "jack_o_lantern", name: "Jack-O-Lantern", keywords: ["jack", "o", "lantern", "halloween", "light", "pumpkin", "creepy", "fall"], skins: [{ unified: "1f383", native: "\u{1F383}" }], version: 1 }, christmas_tree: { id: "christmas_tree", name: "Christmas Tree", keywords: ["festival", "vacation", "december", "xmas", "celebration"], skins: [{ unified: "1f384", native: "\u{1F384}" }], version: 1 }, fireworks: { id: "fireworks", name: "Fireworks", keywords: ["photo", "festival", "carnival", "congratulations"], skins: [{ unified: "1f386", native: "\u{1F386}" }], version: 1 }, sparkler: { id: "sparkler", name: "Sparkler", keywords: ["stars", "night", "shine"], skins: [{ unified: "1f387", native: "\u{1F387}" }], version: 1 }, firecracker: { id: "firecracker", name: "Firecracker", keywords: ["dynamite", "boom", "explode", "explosion", "explosive"], skins: [{ unified: "1f9e8", native: "\u{1F9E8}" }], version: 11 }, sparkles: { id: "sparkles", name: "Sparkles", keywords: ["stars", "shine", "shiny", "cool", "awesome", "good", "magic"], skins: [{ unified: "2728", native: "\u2728" }], version: 1 }, balloon: { id: "balloon", name: "Balloon", keywords: ["party", "celebration", "birthday", "circus"], skins: [{ unified: "1f388", native: "\u{1F388}" }], version: 1 }, tada: { id: "tada", name: "Party Popper", keywords: ["tada", "congratulations", "birthday", "magic", "circus", "celebration"], skins: [{ unified: "1f389", native: "\u{1F389}" }], version: 1 }, confetti_ball: { id: "confetti_ball", name: "Confetti Ball", keywords: ["festival", "party", "birthday", "circus"], skins: [{ unified: "1f38a", native: "\u{1F38A}" }], version: 1 }, tanabata_tree: { id: "tanabata_tree", name: "Tanabata Tree", keywords: ["plant", "nature", "branch", "summer"], skins: [{ unified: "1f38b", native: "\u{1F38B}" }], version: 1 }, bamboo: { id: "bamboo", name: "Pine Decoration", keywords: ["bamboo", "plant", "nature", "vegetable", "panda"], skins: [{ unified: "1f38d", native: "\u{1F38D}" }], version: 1 }, dolls: { id: "dolls", name: "Japanese Dolls", keywords: ["toy", "kimono"], skins: [{ unified: "1f38e", native: "\u{1F38E}" }], version: 1 }, flags: { id: "flags", name: "Carp Streamer", keywords: ["flags", "fish", "japanese", "koinobori", "banner"], skins: [{ unified: "1f38f", native: "\u{1F38F}" }], version: 1 }, wind_chime: { id: "wind_chime", name: "Wind Chime", keywords: ["nature", "ding", "spring", "bell"], skins: [{ unified: "1f390", native: "\u{1F390}" }], version: 1 }, rice_scene: { id: "rice_scene", name: "Moon Viewing Ceremony", keywords: ["rice", "scene", "photo", "japan", "asia", "tsukimi"], skins: [{ unified: "1f391", native: "\u{1F391}" }], version: 1 }, red_envelope: { id: "red_envelope", name: "Red Envelope", keywords: ["gift"], skins: [{ unified: "1f9e7", native: "\u{1F9E7}" }], version: 11 }, ribbon: { id: "ribbon", name: "Ribbon", keywords: ["decoration", "pink", "girl", "bowtie"], skins: [{ unified: "1f380", native: "\u{1F380}" }], version: 1 }, gift: { id: "gift", name: "Wrapped Gift", keywords: ["present", "birthday", "christmas", "xmas"], skins: [{ unified: "1f381", native: "\u{1F381}" }], version: 1 }, reminder_ribbon: { id: "reminder_ribbon", name: "Reminder Ribbon", keywords: ["sports", "cause", "support", "awareness"], skins: [{ unified: "1f397-fe0f", native: "\u{1F397}\uFE0F" }], version: 1 }, admission_tickets: { id: "admission_tickets", name: "Admission Tickets", keywords: ["sports", "concert", "entrance"], skins: [{ unified: "1f39f-fe0f", native: "\u{1F39F}\uFE0F" }], version: 1 }, ticket: { id: "ticket", name: "Ticket", keywords: ["event", "concert", "pass"], skins: [{ unified: "1f3ab", native: "\u{1F3AB}" }], version: 1 }, medal: { id: "medal", name: "Military Medal", keywords: ["award", "winning", "army"], skins: [{ unified: "1f396-fe0f", native: "\u{1F396}\uFE0F" }], version: 1 }, trophy: { id: "trophy", name: "Trophy", keywords: ["win", "award", "contest", "place", "ftw", "ceremony"], skins: [{ unified: "1f3c6", native: "\u{1F3C6}" }], version: 1 }, sports_medal: { id: "sports_medal", name: "Sports Medal", keywords: ["award", "winning"], skins: [{ unified: "1f3c5", native: "\u{1F3C5}" }], version: 1 }, first_place_medal: { id: "first_place_medal", name: "1st Place Medal", keywords: ["first", "award", "winning"], skins: [{ unified: "1f947", native: "\u{1F947}" }], version: 3 }, second_place_medal: { id: "second_place_medal", name: "2nd Place Medal", keywords: ["second", "award"], skins: [{ unified: "1f948", native: "\u{1F948}" }], version: 3 }, third_place_medal: { id: "third_place_medal", name: "3rd Place Medal", keywords: ["third", "award"], skins: [{ unified: "1f949", native: "\u{1F949}" }], version: 3 }, soccer: { id: "soccer", name: "Soccer Ball", keywords: ["sports", "football"], skins: [{ unified: "26bd", native: "\u26BD" }], version: 1 }, baseball: { id: "baseball", name: "Baseball", keywords: ["sports", "balls"], skins: [{ unified: "26be", native: "\u26BE" }], version: 1 }, softball: { id: "softball", name: "Softball", keywords: ["sports", "balls"], skins: [{ unified: "1f94e", native: "\u{1F94E}" }], version: 11 }, basketball: { id: "basketball", name: "Basketball", keywords: ["sports", "balls", "NBA"], skins: [{ unified: "1f3c0", native: "\u{1F3C0}" }], version: 1 }, volleyball: { id: "volleyball", name: "Volleyball", keywords: ["sports", "balls"], skins: [{ unified: "1f3d0", native: "\u{1F3D0}" }], version: 1 }, football: { id: "football", name: "American Football", keywords: ["sports", "balls", "NFL"], skins: [{ unified: "1f3c8", native: "\u{1F3C8}" }], version: 1 }, rugby_football: { id: "rugby_football", name: "Rugby Football", keywords: ["sports", "team"], skins: [{ unified: "1f3c9", native: "\u{1F3C9}" }], version: 1 }, tennis: { id: "tennis", name: "Tennis", keywords: ["sports", "balls", "green"], skins: [{ unified: "1f3be", native: "\u{1F3BE}" }], version: 1 }, flying_disc: { id: "flying_disc", name: "Flying Disc", keywords: ["sports", "frisbee", "ultimate"], skins: [{ unified: "1f94f", native: "\u{1F94F}" }], version: 11 }, bowling: { id: "bowling", name: "Bowling", keywords: ["sports", "fun", "play"], skins: [{ unified: "1f3b3", native: "\u{1F3B3}" }], version: 1 }, cricket_bat_and_ball: { id: "cricket_bat_and_ball", name: "Cricket Game", keywords: ["bat", "and", "ball", "sports"], skins: [{ unified: "1f3cf", native: "\u{1F3CF}" }], version: 1 }, field_hockey_stick_and_ball: { id: "field_hockey_stick_and_ball", name: "Field Hockey", keywords: ["stick", "and", "ball", "sports"], skins: [{ unified: "1f3d1", native: "\u{1F3D1}" }], version: 1 }, ice_hockey_stick_and_puck: { id: "ice_hockey_stick_and_puck", name: "Ice Hockey", keywords: ["stick", "and", "puck", "sports"], skins: [{ unified: "1f3d2", native: "\u{1F3D2}" }], version: 1 }, lacrosse: { id: "lacrosse", name: "Lacrosse", keywords: ["sports", "ball", "stick"], skins: [{ unified: "1f94d", native: "\u{1F94D}" }], version: 11 }, table_tennis_paddle_and_ball: { id: "table_tennis_paddle_and_ball", name: "Ping Pong", keywords: ["table", "tennis", "paddle", "and", "ball", "sports", "pingpong"], skins: [{ unified: "1f3d3", native: "\u{1F3D3}" }], version: 1 }, badminton_racquet_and_shuttlecock: { id: "badminton_racquet_and_shuttlecock", name: "Badminton", keywords: ["racquet", "and", "shuttlecock", "sports"], skins: [{ unified: "1f3f8", native: "\u{1F3F8}" }], version: 1 }, boxing_glove: { id: "boxing_glove", name: "Boxing Glove", keywords: ["sports", "fighting"], skins: [{ unified: "1f94a", native: "\u{1F94A}" }], version: 3 }, martial_arts_uniform: { id: "martial_arts_uniform", name: "Martial Arts Uniform", keywords: ["judo", "karate", "taekwondo"], skins: [{ unified: "1f94b", native: "\u{1F94B}" }], version: 3 }, goal_net: { id: "goal_net", name: "Goal Net", keywords: ["sports"], skins: [{ unified: "1f945", native: "\u{1F945}" }], version: 3 }, golf: { id: "golf", name: "Flag in Hole", keywords: ["golf", "sports", "business", "summer"], skins: [{ unified: "26f3", native: "\u26F3" }], version: 1 }, ice_skate: { id: "ice_skate", name: "Ice Skate", keywords: ["sports"], skins: [{ unified: "26f8-fe0f", native: "\u26F8\uFE0F" }], version: 1 }, fishing_pole_and_fish: { id: "fishing_pole_and_fish", name: "Fishing Pole", keywords: ["and", "fish", "food", "hobby", "summer"], skins: [{ unified: "1f3a3", native: "\u{1F3A3}" }], version: 1 }, diving_mask: { id: "diving_mask", name: "Diving Mask", keywords: ["sport", "ocean"], skins: [{ unified: "1f93f", native: "\u{1F93F}" }], version: 12 }, running_shirt_with_sash: { id: "running_shirt_with_sash", name: "Running Shirt", keywords: ["with", "sash", "play", "pageant"], skins: [{ unified: "1f3bd", native: "\u{1F3BD}" }], version: 1 }, ski: { id: "ski", name: "Skis", keywords: ["ski", "sports", "winter", "cold", "snow"], skins: [{ unified: "1f3bf", native: "\u{1F3BF}" }], version: 1 }, sled: { id: "sled", name: "Sled", keywords: ["sleigh", "luge", "toboggan"], skins: [{ unified: "1f6f7", native: "\u{1F6F7}" }], version: 5 }, curling_stone: { id: "curling_stone", name: "Curling Stone", keywords: ["sports"], skins: [{ unified: "1f94c", native: "\u{1F94C}" }], version: 5 }, dart: { id: "dart", name: "Bullseye", keywords: ["dart", "direct", "hit", "game", "play", "bar", "target"], skins: [{ unified: "1f3af", native: "\u{1F3AF}" }], version: 1 }, "yo-yo": { id: "yo-yo", name: "Yo-Yo", keywords: ["yo", "toy"], skins: [{ unified: "1fa80", native: "\u{1FA80}" }], version: 12 }, kite: { id: "kite", name: "Kite", keywords: ["wind", "fly"], skins: [{ unified: "1fa81", native: "\u{1FA81}" }], version: 12 }, "8ball": { id: "8ball", name: "Billiards", keywords: ["8ball", "pool", "8", "ball", "hobby", "game", "luck", "magic"], skins: [{ unified: "1f3b1", native: "\u{1F3B1}" }], version: 1 }, crystal_ball: { id: "crystal_ball", name: "Crystal Ball", keywords: ["disco", "party", "magic", "circus", "fortune", "teller"], skins: [{ unified: "1f52e", native: "\u{1F52E}" }], version: 1 }, magic_wand: { id: "magic_wand", name: "Magic Wand", keywords: ["supernature", "power"], skins: [{ unified: "1fa84", native: "\u{1FA84}" }], version: 13 }, nazar_amulet: { id: "nazar_amulet", name: "Nazar Amulet", keywords: ["bead", "charm"], skins: [{ unified: "1f9ff", native: "\u{1F9FF}" }], version: 11 }, hamsa: { id: "hamsa", name: "Hamsa", keywords: ["religion", "protection"], skins: [{ unified: "1faac", native: "\u{1FAAC}" }], version: 14 }, video_game: { id: "video_game", name: "Video Game", keywords: ["play", "console", "PS4", "controller"], skins: [{ unified: "1f3ae", native: "\u{1F3AE}" }], version: 1 }, joystick: { id: "joystick", name: "Joystick", keywords: ["game", "play"], skins: [{ unified: "1f579-fe0f", native: "\u{1F579}\uFE0F" }], version: 1 }, slot_machine: { id: "slot_machine", name: "Slot Machine", keywords: ["bet", "gamble", "vegas", "fruit", "luck", "casino"], skins: [{ unified: "1f3b0", native: "\u{1F3B0}" }], version: 1 }, game_die: { id: "game_die", name: "Game Die", keywords: ["dice", "random", "tabletop", "play", "luck"], skins: [{ unified: "1f3b2", native: "\u{1F3B2}" }], version: 1 }, jigsaw: { id: "jigsaw", name: "Puzzle Piece", keywords: ["jigsaw", "interlocking"], skins: [{ unified: "1f9e9", native: "\u{1F9E9}" }], version: 11 }, teddy_bear: { id: "teddy_bear", name: "Teddy Bear", keywords: ["plush", "stuffed"], skins: [{ unified: "1f9f8", native: "\u{1F9F8}" }], version: 11 }, pinata: { id: "pinata", name: "Pinata", keywords: ["mexico", "candy", "celebration"], skins: [{ unified: "1fa85", native: "\u{1FA85}" }], version: 13 }, mirror_ball: { id: "mirror_ball", name: "Mirror Ball", keywords: ["disco", "dance", "party"], skins: [{ unified: "1faa9", native: "\u{1FAA9}" }], version: 14 }, nesting_dolls: { id: "nesting_dolls", name: "Nesting Dolls", keywords: ["matryoshka", "toy"], skins: [{ unified: "1fa86", native: "\u{1FA86}" }], version: 13 }, spades: { id: "spades", name: "Spade Suit", keywords: ["spades", "poker", "cards", "suits", "magic"], skins: [{ unified: "2660-fe0f", native: "\u2660\uFE0F" }], version: 1 }, hearts: { id: "hearts", name: "Heart Suit", keywords: ["hearts", "poker", "cards", "magic", "suits"], skins: [{ unified: "2665-fe0f", native: "\u2665\uFE0F" }], version: 1 }, diamonds: { id: "diamonds", name: "Diamond Suit", keywords: ["diamonds", "poker", "cards", "magic", "suits"], skins: [{ unified: "2666-fe0f", native: "\u2666\uFE0F" }], version: 1 }, clubs: { id: "clubs", name: "Club Suit", keywords: ["clubs", "poker", "cards", "magic", "suits"], skins: [{ unified: "2663-fe0f", native: "\u2663\uFE0F" }], version: 1 }, chess_pawn: { id: "chess_pawn", name: "Chess Pawn", keywords: ["expendable"], skins: [{ unified: "265f-fe0f", native: "\u265F\uFE0F" }], version: 11 }, black_joker: { id: "black_joker", name: "Joker", keywords: ["black", "poker", "cards", "game", "play", "magic"], skins: [{ unified: "1f0cf", native: "\u{1F0CF}" }], version: 1 }, mahjong: { id: "mahjong", name: "Mahjong Red Dragon", keywords: ["game", "play", "chinese", "kanji"], skins: [{ unified: "1f004", native: "\u{1F004}" }], version: 1 }, flower_playing_cards: { id: "flower_playing_cards", name: "Flower Playing Cards", keywords: ["game", "sunset", "red"], skins: [{ unified: "1f3b4", native: "\u{1F3B4}" }], version: 1 }, performing_arts: { id: "performing_arts", name: "Performing Arts", keywords: ["acting", "theater", "drama"], skins: [{ unified: "1f3ad", native: "\u{1F3AD}" }], version: 1 }, frame_with_picture: { id: "frame_with_picture", name: "Framed Picture", keywords: ["frame", "with", "photography"], skins: [{ unified: "1f5bc-fe0f", native: "\u{1F5BC}\uFE0F" }], version: 1 }, art: { id: "art", name: "Artist Palette", keywords: ["art", "design", "paint", "draw", "colors"], skins: [{ unified: "1f3a8", native: "\u{1F3A8}" }], version: 1 }, thread: { id: "thread", name: "Thread", keywords: ["needle", "sewing", "spool", "string"], skins: [{ unified: "1f9f5", native: "\u{1F9F5}" }], version: 11 }, sewing_needle: { id: "sewing_needle", name: "Sewing Needle", keywords: ["stitches"], skins: [{ unified: "1faa1", native: "\u{1FAA1}" }], version: 13 }, yarn: { id: "yarn", name: "Yarn", keywords: ["ball", "crochet", "knit"], skins: [{ unified: "1f9f6", native: "\u{1F9F6}" }], version: 11 }, knot: { id: "knot", name: "Knot", keywords: ["rope", "scout"], skins: [{ unified: "1faa2", native: "\u{1FAA2}" }], version: 13 }, eyeglasses: { id: "eyeglasses", name: "Glasses", keywords: ["eyeglasses", "fashion", "accessories", "eyesight", "nerdy", "dork", "geek"], skins: [{ unified: "1f453", native: "\u{1F453}" }], version: 1 }, dark_sunglasses: { id: "dark_sunglasses", name: "Sunglasses", keywords: ["dark", "face", "cool", "accessories"], skins: [{ unified: "1f576-fe0f", native: "\u{1F576}\uFE0F" }], version: 1 }, goggles: { id: "goggles", name: "Goggles", keywords: ["eyes", "protection", "safety"], skins: [{ unified: "1f97d", native: "\u{1F97D}" }], version: 11 }, lab_coat: { id: "lab_coat", name: "Lab Coat", keywords: ["doctor", "experiment", "scientist", "chemist"], skins: [{ unified: "1f97c", native: "\u{1F97C}" }], version: 11 }, safety_vest: { id: "safety_vest", name: "Safety Vest", keywords: ["protection"], skins: [{ unified: "1f9ba", native: "\u{1F9BA}" }], version: 12 }, necktie: { id: "necktie", name: "Necktie", keywords: ["shirt", "suitup", "formal", "fashion", "cloth", "business"], skins: [{ unified: "1f454", native: "\u{1F454}" }], version: 1 }, shirt: { id: "shirt", name: "T-Shirt", keywords: ["shirt", "tshirt", "t", "fashion", "cloth", "casual", "tee"], skins: [{ unified: "1f455", native: "\u{1F455}" }], version: 1 }, jeans: { id: "jeans", name: "Jeans", keywords: ["fashion", "shopping"], skins: [{ unified: "1f456", native: "\u{1F456}" }], version: 1 }, scarf: { id: "scarf", name: "Scarf", keywords: ["neck", "winter", "clothes"], skins: [{ unified: "1f9e3", native: "\u{1F9E3}" }], version: 5 }, gloves: { id: "gloves", name: "Gloves", keywords: ["hands", "winter", "clothes"], skins: [{ unified: "1f9e4", native: "\u{1F9E4}" }], version: 5 }, coat: { id: "coat", name: "Coat", keywords: ["jacket"], skins: [{ unified: "1f9e5", native: "\u{1F9E5}" }], version: 5 }, socks: { id: "socks", name: "Socks", keywords: ["stockings", "clothes"], skins: [{ unified: "1f9e6", native: "\u{1F9E6}" }], version: 5 }, dress: { id: "dress", name: "Dress", keywords: ["clothes", "fashion", "shopping"], skins: [{ unified: "1f457", native: "\u{1F457}" }], version: 1 }, kimono: { id: "kimono", name: "Kimono", keywords: ["dress", "fashion", "women", "female", "japanese"], skins: [{ unified: "1f458", native: "\u{1F458}" }], version: 1 }, sari: { id: "sari", name: "Sari", keywords: ["dress"], skins: [{ unified: "1f97b", native: "\u{1F97B}" }], version: 12 }, "one-piece_swimsuit": { id: "one-piece_swimsuit", name: "One-Piece Swimsuit", keywords: ["one", "piece", "fashion"], skins: [{ unified: "1fa71", native: "\u{1FA71}" }], version: 12 }, briefs: { id: "briefs", name: "Briefs", keywords: ["clothing"], skins: [{ unified: "1fa72", native: "\u{1FA72}" }], version: 12 }, shorts: { id: "shorts", name: "Shorts", keywords: ["clothing"], skins: [{ unified: "1fa73", native: "\u{1FA73}" }], version: 12 }, bikini: { id: "bikini", name: "Bikini", keywords: ["swimming", "female", "woman", "girl", "fashion", "beach", "summer"], skins: [{ unified: "1f459", native: "\u{1F459}" }], version: 1 }, womans_clothes: { id: "womans_clothes", name: "Womans Clothes", keywords: ["woman", "s", "fashion", "shopping", "bags", "female"], skins: [{ unified: "1f45a", native: "\u{1F45A}" }], version: 1 }, purse: { id: "purse", name: "Purse", keywords: ["fashion", "accessories", "money", "sales", "shopping"], skins: [{ unified: "1f45b", native: "\u{1F45B}" }], version: 1 }, handbag: { id: "handbag", name: "Handbag", keywords: ["fashion", "accessory", "accessories", "shopping"], skins: [{ unified: "1f45c", native: "\u{1F45C}" }], version: 1 }, pouch: { id: "pouch", name: "Pouch", keywords: ["clutch", "bag", "accessories", "shopping"], skins: [{ unified: "1f45d", native: "\u{1F45D}" }], version: 1 }, shopping_bags: { id: "shopping_bags", name: "Shopping Bags", keywords: ["mall", "buy", "purchase"], skins: [{ unified: "1f6cd-fe0f", native: "\u{1F6CD}\uFE0F" }], version: 1 }, school_satchel: { id: "school_satchel", name: "Backpack", keywords: ["school", "satchel", "student", "education", "bag"], skins: [{ unified: "1f392", native: "\u{1F392}" }], version: 1 }, thong_sandal: { id: "thong_sandal", name: "Thong Sandal", keywords: ["footwear", "summer"], skins: [{ unified: "1fa74", native: "\u{1FA74}" }], version: 13 }, mans_shoe: { id: "mans_shoe", name: "Mans Shoe", keywords: ["man", "s", "fashion", "male"], skins: [{ unified: "1f45e", native: "\u{1F45E}" }], version: 1 }, athletic_shoe: { id: "athletic_shoe", name: "Running Shoe", keywords: ["athletic", "shoes", "sports", "sneakers"], skins: [{ unified: "1f45f", native: "\u{1F45F}" }], version: 1 }, hiking_boot: { id: "hiking_boot", name: "Hiking Boot", keywords: ["backpacking", "camping"], skins: [{ unified: "1f97e", native: "\u{1F97E}" }], version: 11 }, womans_flat_shoe: { id: "womans_flat_shoe", name: "Flat Shoe", keywords: ["womans", "ballet", "slip", "on", "slipper"], skins: [{ unified: "1f97f", native: "\u{1F97F}" }], version: 11 }, high_heel: { id: "high_heel", name: "High-Heeled Shoe", keywords: ["high", "heel", "heeled", "fashion", "shoes", "female", "pumps", "stiletto"], skins: [{ unified: "1f460", native: "\u{1F460}" }], version: 1 }, sandal: { id: "sandal", name: "Womans Sandal", keywords: ["woman", "s", "shoes", "fashion", "flip", "flops"], skins: [{ unified: "1f461", native: "\u{1F461}" }], version: 1 }, ballet_shoes: { id: "ballet_shoes", name: "Ballet Shoes", keywords: ["dance"], skins: [{ unified: "1fa70", native: "\u{1FA70}" }], version: 12 }, boot: { id: "boot", name: "Womans Boots", keywords: ["boot", "woman", "s", "shoes", "fashion"], skins: [{ unified: "1f462", native: "\u{1F462}" }], version: 1 }, crown: { id: "crown", name: "Crown", keywords: ["king", "kod", "leader", "royalty", "lord"], skins: [{ unified: "1f451", native: "\u{1F451}" }], version: 1 }, womans_hat: { id: "womans_hat", name: "Womans Hat", keywords: ["woman", "s", "fashion", "accessories", "female", "lady", "spring"], skins: [{ unified: "1f452", native: "\u{1F452}" }], version: 1 }, tophat: { id: "tophat", name: "Top Hat", keywords: ["tophat", "magic", "gentleman", "classy", "circus"], skins: [{ unified: "1f3a9", native: "\u{1F3A9}" }], version: 1 }, mortar_board: { id: "mortar_board", name: "Graduation Cap", keywords: ["mortar", "board", "school", "college", "degree", "university", "hat", "legal", "learn", "education"], skins: [{ unified: "1f393", native: "\u{1F393}" }], version: 1 }, billed_cap: { id: "billed_cap", name: "Billed Cap", keywords: ["baseball"], skins: [{ unified: "1f9e2", native: "\u{1F9E2}" }], version: 5 }, military_helmet: { id: "military_helmet", name: "Military Helmet", keywords: ["army", "protection"], skins: [{ unified: "1fa96", native: "\u{1FA96}" }], version: 13 }, helmet_with_white_cross: { id: "helmet_with_white_cross", name: "Rescue Worker\u2019s Helmet", keywords: ["with", "white", "cross", "worker", "s", "construction", "build"], skins: [{ unified: "26d1-fe0f", native: "\u26D1\uFE0F" }], version: 1 }, prayer_beads: { id: "prayer_beads", name: "Prayer Beads", keywords: ["dhikr", "religious"], skins: [{ unified: "1f4ff", native: "\u{1F4FF}" }], version: 1 }, lipstick: { id: "lipstick", name: "Lipstick", keywords: ["female", "girl", "fashion", "woman"], skins: [{ unified: "1f484", native: "\u{1F484}" }], version: 1 }, ring: { id: "ring", name: "Ring", keywords: ["wedding", "propose", "marriage", "valentines", "diamond", "fashion", "jewelry", "gem", "engagement"], skins: [{ unified: "1f48d", native: "\u{1F48D}" }], version: 1 }, gem: { id: "gem", name: "Gem Stone", keywords: ["blue", "ruby", "diamond", "jewelry"], skins: [{ unified: "1f48e", native: "\u{1F48E}" }], version: 1 }, mute: { id: "mute", name: "Muted Speaker", keywords: ["mute", "sound", "volume", "silence", "quiet"], skins: [{ unified: "1f507", native: "\u{1F507}" }], version: 1 }, speaker: { id: "speaker", name: "Speaker", keywords: ["low", "volume", "sound", "silence", "broadcast"], skins: [{ unified: "1f508", native: "\u{1F508}" }], version: 1 }, sound: { id: "sound", name: "Speaker Medium Volume", keywords: ["sound", "broadcast"], skins: [{ unified: "1f509", native: "\u{1F509}" }], version: 1 }, loud_sound: { id: "loud_sound", name: "Speaker High Volume", keywords: ["loud", "sound", "noise", "noisy", "broadcast"], skins: [{ unified: "1f50a", native: "\u{1F50A}" }], version: 1 }, loudspeaker: { id: "loudspeaker", name: "Loudspeaker", keywords: ["volume", "sound"], skins: [{ unified: "1f4e2", native: "\u{1F4E2}" }], version: 1 }, mega: { id: "mega", name: "Megaphone", keywords: ["mega", "sound", "speaker", "volume"], skins: [{ unified: "1f4e3", native: "\u{1F4E3}" }], version: 1 }, postal_horn: { id: "postal_horn", name: "Postal Horn", keywords: ["instrument", "music"], skins: [{ unified: "1f4ef", native: "\u{1F4EF}" }], version: 1 }, bell: { id: "bell", name: "Bell", keywords: ["sound", "notification", "christmas", "xmas", "chime"], skins: [{ unified: "1f514", native: "\u{1F514}" }], version: 1 }, no_bell: { id: "no_bell", name: "Bell with Slash", keywords: ["no", "sound", "volume", "mute", "quiet", "silent"], skins: [{ unified: "1f515", native: "\u{1F515}" }], version: 1 }, musical_score: { id: "musical_score", name: "Musical Score", keywords: ["treble", "clef", "compose"], skins: [{ unified: "1f3bc", native: "\u{1F3BC}" }], version: 1 }, musical_note: { id: "musical_note", name: "Musical Note", keywords: ["score", "tone", "sound"], skins: [{ unified: "1f3b5", native: "\u{1F3B5}" }], version: 1 }, notes: { id: "notes", name: "Musical Notes", keywords: ["music", "score"], skins: [{ unified: "1f3b6", native: "\u{1F3B6}" }], version: 1 }, studio_microphone: { id: "studio_microphone", name: "Studio Microphone", keywords: ["sing", "recording", "artist", "talkshow"], skins: [{ unified: "1f399-fe0f", native: "\u{1F399}\uFE0F" }], version: 1 }, level_slider: { id: "level_slider", name: "Level Slider", keywords: ["scale"], skins: [{ unified: "1f39a-fe0f", native: "\u{1F39A}\uFE0F" }], version: 1 }, control_knobs: { id: "control_knobs", name: "Control Knobs", keywords: ["dial"], skins: [{ unified: "1f39b-fe0f", native: "\u{1F39B}\uFE0F" }], version: 1 }, microphone: { id: "microphone", name: "Microphone", keywords: ["sound", "music", "PA", "sing", "talkshow"], skins: [{ unified: "1f3a4", native: "\u{1F3A4}" }], version: 1 }, headphones: { id: "headphones", name: "Headphone", keywords: ["headphones", "music", "score", "gadgets"], skins: [{ unified: "1f3a7", native: "\u{1F3A7}" }], version: 1 }, radio: { id: "radio", name: "Radio", keywords: ["communication", "music", "podcast", "program"], skins: [{ unified: "1f4fb", native: "\u{1F4FB}" }], version: 1 }, saxophone: { id: "saxophone", name: "Saxophone", keywords: ["music", "instrument", "jazz", "blues"], skins: [{ unified: "1f3b7", native: "\u{1F3B7}" }], version: 1 }, accordion: { id: "accordion", name: "Accordion", keywords: ["music"], skins: [{ unified: "1fa97", native: "\u{1FA97}" }], version: 13 }, guitar: { id: "guitar", name: "Guitar", keywords: ["music", "instrument"], skins: [{ unified: "1f3b8", native: "\u{1F3B8}" }], version: 1 }, musical_keyboard: { id: "musical_keyboard", name: "Musical Keyboard", keywords: ["piano", "instrument", "compose"], skins: [{ unified: "1f3b9", native: "\u{1F3B9}" }], version: 1 }, trumpet: { id: "trumpet", name: "Trumpet", keywords: ["music", "brass"], skins: [{ unified: "1f3ba", native: "\u{1F3BA}" }], version: 1 }, violin: { id: "violin", name: "Violin", keywords: ["music", "instrument", "orchestra", "symphony"], skins: [{ unified: "1f3bb", native: "\u{1F3BB}" }], version: 1 }, banjo: { id: "banjo", name: "Banjo", keywords: ["music", "instructment"], skins: [{ unified: "1fa95", native: "\u{1FA95}" }], version: 12 }, drum_with_drumsticks: { id: "drum_with_drumsticks", name: "Drum", keywords: ["with", "drumsticks", "music", "instrument", "snare"], skins: [{ unified: "1f941", native: "\u{1F941}" }], version: 3 }, long_drum: { id: "long_drum", name: "Long Drum", keywords: ["music"], skins: [{ unified: "1fa98", native: "\u{1FA98}" }], version: 13 }, iphone: { id: "iphone", name: "Mobile Phone", keywords: ["iphone", "technology", "apple", "gadgets", "dial"], skins: [{ unified: "1f4f1", native: "\u{1F4F1}" }], version: 1 }, calling: { id: "calling", name: "Mobile Phone with Arrow", keywords: ["calling", "iphone", "incoming"], skins: [{ unified: "1f4f2", native: "\u{1F4F2}" }], version: 1 }, phone: { id: "phone", name: "Telephone", keywords: ["phone", "technology", "communication", "dial"], skins: [{ unified: "260e-fe0f", native: "\u260E\uFE0F" }], version: 1 }, telephone_receiver: { id: "telephone_receiver", name: "Telephone Receiver", keywords: ["technology", "communication", "dial"], skins: [{ unified: "1f4de", native: "\u{1F4DE}" }], version: 1 }, pager: { id: "pager", name: "Pager", keywords: ["bbcall", "oldschool", "90s"], skins: [{ unified: "1f4df", native: "\u{1F4DF}" }], version: 1 }, fax: { id: "fax", name: "Fax Machine", keywords: ["communication", "technology"], skins: [{ unified: "1f4e0", native: "\u{1F4E0}" }], version: 1 }, battery: { id: "battery", name: "Battery", keywords: ["power", "energy", "sustain"], skins: [{ unified: "1f50b", native: "\u{1F50B}" }], version: 1 }, low_battery: { id: "low_battery", name: "Low Battery", keywords: ["drained", "dead"], skins: [{ unified: "1faab", native: "\u{1FAAB}" }], version: 14 }, electric_plug: { id: "electric_plug", name: "Electric Plug", keywords: ["charger", "power"], skins: [{ unified: "1f50c", native: "\u{1F50C}" }], version: 1 }, computer: { id: "computer", name: "Laptop", keywords: ["computer", "technology", "screen", "display", "monitor"], skins: [{ unified: "1f4bb", native: "\u{1F4BB}" }], version: 1 }, desktop_computer: { id: "desktop_computer", name: "Desktop Computer", keywords: ["technology", "computing", "screen"], skins: [{ unified: "1f5a5-fe0f", native: "\u{1F5A5}\uFE0F" }], version: 1 }, printer: { id: "printer", name: "Printer", keywords: ["paper", "ink"], skins: [{ unified: "1f5a8-fe0f", native: "\u{1F5A8}\uFE0F" }], version: 1 }, keyboard: { id: "keyboard", name: "Keyboard", keywords: ["technology", "computer", "type", "input", "text"], skins: [{ unified: "2328-fe0f", native: "\u2328\uFE0F" }], version: 1 }, three_button_mouse: { id: "three_button_mouse", name: "Computer Mouse", keywords: ["three", "button", "click"], skins: [{ unified: "1f5b1-fe0f", native: "\u{1F5B1}\uFE0F" }], version: 1 }, trackball: { id: "trackball", name: "Trackball", keywords: ["technology", "trackpad"], skins: [{ unified: "1f5b2-fe0f", native: "\u{1F5B2}\uFE0F" }], version: 1 }, minidisc: { id: "minidisc", name: "Minidisc", keywords: ["computer", "disk", "technology", "record", "data", "90s"], skins: [{ unified: "1f4bd", native: "\u{1F4BD}" }], version: 1 }, floppy_disk: { id: "floppy_disk", name: "Floppy Disk", keywords: ["oldschool", "technology", "save", "90s", "80s"], skins: [{ unified: "1f4be", native: "\u{1F4BE}" }], version: 1 }, cd: { id: "cd", name: "Optical Disc", keywords: ["cd", "disk", "technology", "dvd", "90s"], skins: [{ unified: "1f4bf", native: "\u{1F4BF}" }], version: 1 }, dvd: { id: "dvd", name: "Dvd", keywords: ["cd", "disk", "disc"], skins: [{ unified: "1f4c0", native: "\u{1F4C0}" }], version: 1 }, abacus: { id: "abacus", name: "Abacus", keywords: ["calculation"], skins: [{ unified: "1f9ee", native: "\u{1F9EE}" }], version: 11 }, movie_camera: { id: "movie_camera", name: "Movie Camera", keywords: ["film", "record"], skins: [{ unified: "1f3a5", native: "\u{1F3A5}" }], version: 1 }, film_frames: { id: "film_frames", name: "Film Frames", keywords: ["movie"], skins: [{ unified: "1f39e-fe0f", native: "\u{1F39E}\uFE0F" }], version: 1 }, film_projector: { id: "film_projector", name: "Film Projector", keywords: ["video", "tape", "record", "movie"], skins: [{ unified: "1f4fd-fe0f", native: "\u{1F4FD}\uFE0F" }], version: 1 }, clapper: { id: "clapper", name: "Clapper Board", keywords: ["movie", "film", "record"], skins: [{ unified: "1f3ac", native: "\u{1F3AC}" }], version: 1 }, tv: { id: "tv", name: "Television", keywords: ["tv", "technology", "program", "oldschool", "show"], skins: [{ unified: "1f4fa", native: "\u{1F4FA}" }], version: 1 }, camera: { id: "camera", name: "Camera", keywords: ["gadgets", "photography"], skins: [{ unified: "1f4f7", native: "\u{1F4F7}" }], version: 1 }, camera_with_flash: { id: "camera_with_flash", name: "Camera with Flash", keywords: ["photography", "gadgets"], skins: [{ unified: "1f4f8", native: "\u{1F4F8}" }], version: 1 }, video_camera: { id: "video_camera", name: "Video Camera", keywords: ["film", "record"], skins: [{ unified: "1f4f9", native: "\u{1F4F9}" }], version: 1 }, vhs: { id: "vhs", name: "Videocassette", keywords: ["vhs", "record", "video", "oldschool", "90s", "80s"], skins: [{ unified: "1f4fc", native: "\u{1F4FC}" }], version: 1 }, mag: { id: "mag", name: "Magnifying Glass Tilted Left", keywords: ["mag", "search", "zoom", "find", "detective"], skins: [{ unified: "1f50d", native: "\u{1F50D}" }], version: 1 }, mag_right: { id: "mag_right", name: "Magnifying Glass Tilted Right", keywords: ["mag", "search", "zoom", "find", "detective"], skins: [{ unified: "1f50e", native: "\u{1F50E}" }], version: 1 }, candle: { id: "candle", name: "Candle", keywords: ["fire", "wax"], skins: [{ unified: "1f56f-fe0f", native: "\u{1F56F}\uFE0F" }], version: 1 }, bulb: { id: "bulb", name: "Light Bulb", keywords: ["electricity", "idea"], skins: [{ unified: "1f4a1", native: "\u{1F4A1}" }], version: 1 }, flashlight: { id: "flashlight", name: "Flashlight", keywords: ["dark", "camping", "sight", "night"], skins: [{ unified: "1f526", native: "\u{1F526}" }], version: 1 }, izakaya_lantern: { id: "izakaya_lantern", name: "Izakaya Lantern", keywords: ["red", "paper", "light", "halloween", "spooky"], skins: [{ unified: "1f3ee", native: "\u{1F3EE}" }], version: 1 }, diya_lamp: { id: "diya_lamp", name: "Diya Lamp", keywords: ["lighting"], skins: [{ unified: "1fa94", native: "\u{1FA94}" }], version: 12 }, notebook_with_decorative_cover: { id: "notebook_with_decorative_cover", name: "Notebook with Decorative Cover", keywords: ["classroom", "notes", "record", "paper", "study"], skins: [{ unified: "1f4d4", native: "\u{1F4D4}" }], version: 1 }, closed_book: { id: "closed_book", name: "Closed Book", keywords: ["read", "library", "knowledge", "textbook", "learn"], skins: [{ unified: "1f4d5", native: "\u{1F4D5}" }], version: 1 }, book: { id: "book", name: "Open Book", keywords: ["read", "library", "knowledge", "literature", "learn", "study"], skins: [{ unified: "1f4d6", native: "\u{1F4D6}" }], version: 1 }, green_book: { id: "green_book", name: "Green Book", keywords: ["read", "library", "knowledge", "study"], skins: [{ unified: "1f4d7", native: "\u{1F4D7}" }], version: 1 }, blue_book: { id: "blue_book", name: "Blue Book", keywords: ["read", "library", "knowledge", "learn", "study"], skins: [{ unified: "1f4d8", native: "\u{1F4D8}" }], version: 1 }, orange_book: { id: "orange_book", name: "Orange Book", keywords: ["read", "library", "knowledge", "textbook", "study"], skins: [{ unified: "1f4d9", native: "\u{1F4D9}" }], version: 1 }, books: { id: "books", name: "Books", keywords: ["literature", "library", "study"], skins: [{ unified: "1f4da", native: "\u{1F4DA}" }], version: 1 }, notebook: { id: "notebook", name: "Notebook", keywords: ["stationery", "record", "notes", "paper", "study"], skins: [{ unified: "1f4d3", native: "\u{1F4D3}" }], version: 1 }, ledger: { id: "ledger", name: "Ledger", keywords: ["notes", "paper"], skins: [{ unified: "1f4d2", native: "\u{1F4D2}" }], version: 1 }, page_with_curl: { id: "page_with_curl", name: "Page with Curl", keywords: ["documents", "office", "paper"], skins: [{ unified: "1f4c3", native: "\u{1F4C3}" }], version: 1 }, scroll: { id: "scroll", name: "Scroll", keywords: ["documents", "ancient", "history", "paper"], skins: [{ unified: "1f4dc", native: "\u{1F4DC}" }], version: 1 }, page_facing_up: { id: "page_facing_up", name: "Page Facing Up", keywords: ["documents", "office", "paper", "information"], skins: [{ unified: "1f4c4", native: "\u{1F4C4}" }], version: 1 }, newspaper: { id: "newspaper", name: "Newspaper", keywords: ["press", "headline"], skins: [{ unified: "1f4f0", native: "\u{1F4F0}" }], version: 1 }, rolled_up_newspaper: { id: "rolled_up_newspaper", name: "Rolled-Up Newspaper", keywords: ["rolled", "up", "press", "headline"], skins: [{ unified: "1f5de-fe0f", native: "\u{1F5DE}\uFE0F" }], version: 1 }, bookmark_tabs: { id: "bookmark_tabs", name: "Bookmark Tabs", keywords: ["favorite", "save", "order", "tidy"], skins: [{ unified: "1f4d1", native: "\u{1F4D1}" }], version: 1 }, bookmark: { id: "bookmark", name: "Bookmark", keywords: ["favorite", "label", "save"], skins: [{ unified: "1f516", native: "\u{1F516}" }], version: 1 }, label: { id: "label", name: "Label", keywords: ["sale", "tag"], skins: [{ unified: "1f3f7-fe0f", native: "\u{1F3F7}\uFE0F" }], version: 1 }, moneybag: { id: "moneybag", name: "Money Bag", keywords: ["moneybag", "dollar", "payment", "coins", "sale"], skins: [{ unified: "1f4b0", native: "\u{1F4B0}" }], version: 1 }, coin: { id: "coin", name: "Coin", keywords: ["money", "currency"], skins: [{ unified: "1fa99", native: "\u{1FA99}" }], version: 13 }, yen: { id: "yen", name: "Yen Banknote", keywords: ["money", "sales", "japanese", "dollar", "currency"], skins: [{ unified: "1f4b4", native: "\u{1F4B4}" }], version: 1 }, dollar: { id: "dollar", name: "Dollar Banknote", keywords: ["money", "sales", "bill", "currency"], skins: [{ unified: "1f4b5", native: "\u{1F4B5}" }], version: 1 }, euro: { id: "euro", name: "Euro Banknote", keywords: ["money", "sales", "dollar", "currency"], skins: [{ unified: "1f4b6", native: "\u{1F4B6}" }], version: 1 }, pound: { id: "pound", name: "Pound Banknote", keywords: ["british", "sterling", "money", "sales", "bills", "uk", "england", "currency"], skins: [{ unified: "1f4b7", native: "\u{1F4B7}" }], version: 1 }, money_with_wings: { id: "money_with_wings", name: "Money with Wings", keywords: ["dollar", "bills", "payment", "sale"], skins: [{ unified: "1f4b8", native: "\u{1F4B8}" }], version: 1 }, credit_card: { id: "credit_card", name: "Credit Card", keywords: ["money", "sales", "dollar", "bill", "payment", "shopping"], skins: [{ unified: "1f4b3", native: "\u{1F4B3}" }], version: 1 }, receipt: { id: "receipt", name: "Receipt", keywords: ["accounting", "expenses"], skins: [{ unified: "1f9fe", native: "\u{1F9FE}" }], version: 11 }, chart: { id: "chart", name: "Chart Increasing with Yen", keywords: ["green", "square", "graph", "presentation", "stats"], skins: [{ unified: "1f4b9", native: "\u{1F4B9}" }], version: 1 }, email: { id: "email", name: "Envelope", keywords: ["email", "letter", "postal", "inbox", "communication"], skins: [{ unified: "2709-fe0f", native: "\u2709\uFE0F" }], version: 1 }, "e-mail": { id: "e-mail", name: "E-Mail", keywords: ["e", "mail", "communication", "inbox"], skins: [{ unified: "1f4e7", native: "\u{1F4E7}" }], version: 1 }, incoming_envelope: { id: "incoming_envelope", name: "Incoming Envelope", keywords: ["email", "inbox"], skins: [{ unified: "1f4e8", native: "\u{1F4E8}" }], version: 1 }, envelope_with_arrow: { id: "envelope_with_arrow", name: "Envelope with Arrow", keywords: ["email", "communication"], skins: [{ unified: "1f4e9", native: "\u{1F4E9}" }], version: 1 }, outbox_tray: { id: "outbox_tray", name: "Outbox Tray", keywords: ["inbox", "email"], skins: [{ unified: "1f4e4", native: "\u{1F4E4}" }], version: 1 }, inbox_tray: { id: "inbox_tray", name: "Inbox Tray", keywords: ["email", "documents"], skins: [{ unified: "1f4e5", native: "\u{1F4E5}" }], version: 1 }, package: { id: "package", name: "Package", keywords: ["mail", "gift", "cardboard", "box", "moving"], skins: [{ unified: "1f4e6", native: "\u{1F4E6}" }], version: 1 }, mailbox: { id: "mailbox", name: "Closed Mailbox with Raised Flag", keywords: ["email", "inbox", "communication"], skins: [{ unified: "1f4eb", native: "\u{1F4EB}" }], version: 1 }, mailbox_closed: { id: "mailbox_closed", name: "Closed Mailbox with Lowered Flag", keywords: ["email", "communication", "inbox"], skins: [{ unified: "1f4ea", native: "\u{1F4EA}" }], version: 1 }, mailbox_with_mail: { id: "mailbox_with_mail", name: "Open Mailbox with Raised Flag", keywords: ["mail", "email", "inbox", "communication"], skins: [{ unified: "1f4ec", native: "\u{1F4EC}" }], version: 1 }, mailbox_with_no_mail: { id: "mailbox_with_no_mail", name: "Open Mailbox with Lowered Flag", keywords: ["no", "mail", "email", "inbox"], skins: [{ unified: "1f4ed", native: "\u{1F4ED}" }], version: 1 }, postbox: { id: "postbox", name: "Postbox", keywords: ["email", "letter", "envelope"], skins: [{ unified: "1f4ee", native: "\u{1F4EE}" }], version: 1 }, ballot_box_with_ballot: { id: "ballot_box_with_ballot", name: "Ballot Box with Ballot", keywords: ["election", "vote"], skins: [{ unified: "1f5f3-fe0f", native: "\u{1F5F3}\uFE0F" }], version: 1 }, pencil2: { id: "pencil2", name: "Pencil", keywords: ["pencil2", "stationery", "write", "paper", "writing", "school", "study"], skins: [{ unified: "270f-fe0f", native: "\u270F\uFE0F" }], version: 1 }, black_nib: { id: "black_nib", name: "Black Nib", keywords: ["pen", "stationery", "writing", "write"], skins: [{ unified: "2712-fe0f", native: "\u2712\uFE0F" }], version: 1 }, lower_left_fountain_pen: { id: "lower_left_fountain_pen", name: "Fountain Pen", keywords: ["lower", "left", "stationery", "writing", "write"], skins: [{ unified: "1f58b-fe0f", native: "\u{1F58B}\uFE0F" }], version: 1 }, lower_left_ballpoint_pen: { id: "lower_left_ballpoint_pen", name: "Pen", keywords: ["lower", "left", "ballpoint", "stationery", "writing", "write"], skins: [{ unified: "1f58a-fe0f", native: "\u{1F58A}\uFE0F" }], version: 1 }, lower_left_paintbrush: { id: "lower_left_paintbrush", name: "Paintbrush", keywords: ["lower", "left", "drawing", "creativity", "art"], skins: [{ unified: "1f58c-fe0f", native: "\u{1F58C}\uFE0F" }], version: 1 }, lower_left_crayon: { id: "lower_left_crayon", name: "Crayon", keywords: ["lower", "left", "drawing", "creativity"], skins: [{ unified: "1f58d-fe0f", native: "\u{1F58D}\uFE0F" }], version: 1 }, memo: { id: "memo", name: "Memo", keywords: ["pencil", "write", "documents", "stationery", "paper", "writing", "legal", "exam", "quiz", "test", "study", "compose"], skins: [{ unified: "1f4dd", native: "\u{1F4DD}" }], version: 1 }, briefcase: { id: "briefcase", name: "Briefcase", keywords: ["business", "documents", "work", "law", "legal", "job", "career"], skins: [{ unified: "1f4bc", native: "\u{1F4BC}" }], version: 1 }, file_folder: { id: "file_folder", name: "File Folder", keywords: ["documents", "business", "office"], skins: [{ unified: "1f4c1", native: "\u{1F4C1}" }], version: 1 }, open_file_folder: { id: "open_file_folder", name: "Open File Folder", keywords: ["documents", "load"], skins: [{ unified: "1f4c2", native: "\u{1F4C2}" }], version: 1 }, card_index_dividers: { id: "card_index_dividers", name: "Card Index Dividers", keywords: ["organizing", "business", "stationery"], skins: [{ unified: "1f5c2-fe0f", native: "\u{1F5C2}\uFE0F" }], version: 1 }, date: { id: "date", name: "Calendar", keywords: ["date", "schedule"], skins: [{ unified: "1f4c5", native: "\u{1F4C5}" }], version: 1 }, calendar: { id: "calendar", name: "Tear-off Calendar", keywords: ["tear", "off", "schedule", "date", "planning"], skins: [{ unified: "1f4c6", native: "\u{1F4C6}" }], version: 1 }, spiral_note_pad: { id: "spiral_note_pad", name: "Spiral Notepad", keywords: ["note", "pad", "memo", "stationery"], skins: [{ unified: "1f5d2-fe0f", native: "\u{1F5D2}\uFE0F" }], version: 1 }, spiral_calendar_pad: { id: "spiral_calendar_pad", name: "Spiral Calendar", keywords: ["pad", "date", "schedule", "planning"], skins: [{ unified: "1f5d3-fe0f", native: "\u{1F5D3}\uFE0F" }], version: 1 }, card_index: { id: "card_index", name: "Card Index", keywords: ["business", "stationery"], skins: [{ unified: "1f4c7", native: "\u{1F4C7}" }], version: 1 }, chart_with_upwards_trend: { id: "chart_with_upwards_trend", name: "Chart Increasing", keywords: ["with", "upwards", "trend", "graph", "presentation", "stats", "recovery", "business", "economics", "money", "sales", "good", "success"], skins: [{ unified: "1f4c8", native: "\u{1F4C8}" }], version: 1 }, chart_with_downwards_trend: { id: "chart_with_downwards_trend", name: "Chart Decreasing", keywords: ["with", "downwards", "trend", "graph", "presentation", "stats", "recession", "business", "economics", "money", "sales", "bad", "failure"], skins: [{ unified: "1f4c9", native: "\u{1F4C9}" }], version: 1 }, bar_chart: { id: "bar_chart", name: "Bar Chart", keywords: ["graph", "presentation", "stats"], skins: [{ unified: "1f4ca", native: "\u{1F4CA}" }], version: 1 }, clipboard: { id: "clipboard", name: "Clipboard", keywords: ["stationery", "documents"], skins: [{ unified: "1f4cb", native: "\u{1F4CB}" }], version: 1 }, pushpin: { id: "pushpin", name: "Pushpin", keywords: ["stationery", "mark", "here"], skins: [{ unified: "1f4cc", native: "\u{1F4CC}" }], version: 1 }, round_pushpin: { id: "round_pushpin", name: "Round Pushpin", keywords: ["stationery", "location", "map", "here"], skins: [{ unified: "1f4cd", native: "\u{1F4CD}" }], version: 1 }, paperclip: { id: "paperclip", name: "Paperclip", keywords: ["documents", "stationery"], skins: [{ unified: "1f4ce", native: "\u{1F4CE}" }], version: 1 }, linked_paperclips: { id: "linked_paperclips", name: "Linked Paperclips", keywords: ["documents", "stationery"], skins: [{ unified: "1f587-fe0f", native: "\u{1F587}\uFE0F" }], version: 1 }, straight_ruler: { id: "straight_ruler", name: "Straight Ruler", keywords: ["stationery", "calculate", "length", "math", "school", "drawing", "architect", "sketch"], skins: [{ unified: "1f4cf", native: "\u{1F4CF}" }], version: 1 }, triangular_ruler: { id: "triangular_ruler", name: "Triangular Ruler", keywords: ["stationery", "math", "architect", "sketch"], skins: [{ unified: "1f4d0", native: "\u{1F4D0}" }], version: 1 }, scissors: { id: "scissors", name: "Scissors", keywords: ["stationery", "cut"], skins: [{ unified: "2702-fe0f", native: "\u2702\uFE0F" }], version: 1 }, card_file_box: { id: "card_file_box", name: "Card File Box", keywords: ["business", "stationery"], skins: [{ unified: "1f5c3-fe0f", native: "\u{1F5C3}\uFE0F" }], version: 1 }, file_cabinet: { id: "file_cabinet", name: "File Cabinet", keywords: ["filing", "organizing"], skins: [{ unified: "1f5c4-fe0f", native: "\u{1F5C4}\uFE0F" }], version: 1 }, wastebasket: { id: "wastebasket", name: "Wastebasket", keywords: ["bin", "trash", "rubbish", "garbage", "toss"], skins: [{ unified: "1f5d1-fe0f", native: "\u{1F5D1}\uFE0F" }], version: 1 }, lock: { id: "lock", name: "Lock", keywords: ["locked", "security", "password", "padlock"], skins: [{ unified: "1f512", native: "\u{1F512}" }], version: 1 }, unlock: { id: "unlock", name: "Unlocked", keywords: ["unlock", "privacy", "security"], skins: [{ unified: "1f513", native: "\u{1F513}" }], version: 1 }, lock_with_ink_pen: { id: "lock_with_ink_pen", name: "Locked with Pen", keywords: ["lock", "ink", "security", "secret"], skins: [{ unified: "1f50f", native: "\u{1F50F}" }], version: 1 }, closed_lock_with_key: { id: "closed_lock_with_key", name: "Locked with Key", keywords: ["closed", "lock", "security", "privacy"], skins: [{ unified: "1f510", native: "\u{1F510}" }], version: 1 }, key: { id: "key", name: "Key", keywords: ["lock", "door", "password"], skins: [{ unified: "1f511", native: "\u{1F511}" }], version: 1 }, old_key: { id: "old_key", name: "Old Key", keywords: ["lock", "door", "password"], skins: [{ unified: "1f5dd-fe0f", native: "\u{1F5DD}\uFE0F" }], version: 1 }, hammer: { id: "hammer", name: "Hammer", keywords: ["tools", "build", "create"], skins: [{ unified: "1f528", native: "\u{1F528}" }], version: 1 }, axe: { id: "axe", name: "Axe", keywords: ["tool", "chop", "cut"], skins: [{ unified: "1fa93", native: "\u{1FA93}" }], version: 12 }, pick: { id: "pick", name: "Pick", keywords: ["tools", "dig"], skins: [{ unified: "26cf-fe0f", native: "\u26CF\uFE0F" }], version: 1 }, hammer_and_pick: { id: "hammer_and_pick", name: "Hammer and Pick", keywords: ["tools", "build", "create"], skins: [{ unified: "2692-fe0f", native: "\u2692\uFE0F" }], version: 1 }, hammer_and_wrench: { id: "hammer_and_wrench", name: "Hammer and Wrench", keywords: ["tools", "build", "create"], skins: [{ unified: "1f6e0-fe0f", native: "\u{1F6E0}\uFE0F" }], version: 1 }, dagger_knife: { id: "dagger_knife", name: "Dagger", keywords: ["knife", "weapon"], skins: [{ unified: "1f5e1-fe0f", native: "\u{1F5E1}\uFE0F" }], version: 1 }, crossed_swords: { id: "crossed_swords", name: "Crossed Swords", keywords: ["weapon"], skins: [{ unified: "2694-fe0f", native: "\u2694\uFE0F" }], version: 1 }, gun: { id: "gun", name: "Pistol", keywords: ["gun", "violence", "weapon", "revolver"], skins: [{ unified: "1f52b", native: "\u{1F52B}" }], version: 1 }, boomerang: { id: "boomerang", name: "Boomerang", keywords: ["weapon"], skins: [{ unified: "1fa83", native: "\u{1FA83}" }], version: 13 }, bow_and_arrow: { id: "bow_and_arrow", name: "Bow and Arrow", keywords: ["sports"], skins: [{ unified: "1f3f9", native: "\u{1F3F9}" }], version: 1 }, shield: { id: "shield", name: "Shield", keywords: ["protection", "security"], skins: [{ unified: "1f6e1-fe0f", native: "\u{1F6E1}\uFE0F" }], version: 1 }, carpentry_saw: { id: "carpentry_saw", name: "Carpentry Saw", keywords: ["cut", "chop"], skins: [{ unified: "1fa9a", native: "\u{1FA9A}" }], version: 13 }, wrench: { id: "wrench", name: "Wrench", keywords: ["tools", "diy", "ikea", "fix", "maintainer"], skins: [{ unified: "1f527", native: "\u{1F527}" }], version: 1 }, screwdriver: { id: "screwdriver", name: "Screwdriver", keywords: ["tools"], skins: [{ unified: "1fa9b", native: "\u{1FA9B}" }], version: 13 }, nut_and_bolt: { id: "nut_and_bolt", name: "Nut and Bolt", keywords: ["handy", "tools", "fix"], skins: [{ unified: "1f529", native: "\u{1F529}" }], version: 1 }, gear: { id: "gear", name: "Gear", keywords: ["cog"], skins: [{ unified: "2699-fe0f", native: "\u2699\uFE0F" }], version: 1 }, compression: { id: "compression", name: "Clamp", keywords: ["compression", "tool"], skins: [{ unified: "1f5dc-fe0f", native: "\u{1F5DC}\uFE0F" }], version: 1 }, scales: { id: "scales", name: "Balance Scale", keywords: ["scales", "law", "fairness", "weight"], skins: [{ unified: "2696-fe0f", native: "\u2696\uFE0F" }], version: 1 }, probing_cane: { id: "probing_cane", name: "White Cane", keywords: ["probing", "accessibility"], skins: [{ unified: "1f9af", native: "\u{1F9AF}" }], version: 12 }, link: { id: "link", name: "Link", keywords: ["rings", "url"], skins: [{ unified: "1f517", native: "\u{1F517}" }], version: 1 }, chains: { id: "chains", name: "Chains", keywords: ["lock", "arrest"], skins: [{ unified: "26d3-fe0f", native: "\u26D3\uFE0F" }], version: 1 }, hook: { id: "hook", name: "Hook", keywords: ["tools"], skins: [{ unified: "1fa9d", native: "\u{1FA9D}" }], version: 13 }, toolbox: { id: "toolbox", name: "Toolbox", keywords: ["tools", "diy", "fix", "maintainer", "mechanic"], skins: [{ unified: "1f9f0", native: "\u{1F9F0}" }], version: 11 }, magnet: { id: "magnet", name: "Magnet", keywords: ["attraction", "magnetic"], skins: [{ unified: "1f9f2", native: "\u{1F9F2}" }], version: 11 }, ladder: { id: "ladder", name: "Ladder", keywords: ["tools"], skins: [{ unified: "1fa9c", native: "\u{1FA9C}" }], version: 13 }, alembic: { id: "alembic", name: "Alembic", keywords: ["distilling", "science", "experiment", "chemistry"], skins: [{ unified: "2697-fe0f", native: "\u2697\uFE0F" }], version: 1 }, test_tube: { id: "test_tube", name: "Test Tube", keywords: ["chemistry", "experiment", "lab", "science"], skins: [{ unified: "1f9ea", native: "\u{1F9EA}" }], version: 11 }, petri_dish: { id: "petri_dish", name: "Petri Dish", keywords: ["bacteria", "biology", "culture", "lab"], skins: [{ unified: "1f9eb", native: "\u{1F9EB}" }], version: 11 }, dna: { id: "dna", name: "Dna", keywords: ["biologist", "genetics", "life"], skins: [{ unified: "1f9ec", native: "\u{1F9EC}" }], version: 11 }, microscope: { id: "microscope", name: "Microscope", keywords: ["laboratory", "experiment", "zoomin", "science", "study"], skins: [{ unified: "1f52c", native: "\u{1F52C}" }], version: 1 }, telescope: { id: "telescope", name: "Telescope", keywords: ["stars", "space", "zoom", "science", "astronomy"], skins: [{ unified: "1f52d", native: "\u{1F52D}" }], version: 1 }, satellite_antenna: { id: "satellite_antenna", name: "Satellite Antenna", keywords: ["communication", "future", "radio", "space"], skins: [{ unified: "1f4e1", native: "\u{1F4E1}" }], version: 1 }, syringe: { id: "syringe", name: "Syringe", keywords: ["health", "hospital", "drugs", "blood", "medicine", "needle", "doctor", "nurse"], skins: [{ unified: "1f489", native: "\u{1F489}" }], version: 1 }, drop_of_blood: { id: "drop_of_blood", name: "Drop of Blood", keywords: ["period", "hurt", "harm", "wound"], skins: [{ unified: "1fa78", native: "\u{1FA78}" }], version: 12 }, pill: { id: "pill", name: "Pill", keywords: ["health", "medicine", "doctor", "pharmacy", "drug"], skins: [{ unified: "1f48a", native: "\u{1F48A}" }], version: 1 }, adhesive_bandage: { id: "adhesive_bandage", name: "Adhesive Bandage", keywords: ["heal"], skins: [{ unified: "1fa79", native: "\u{1FA79}" }], version: 12 }, crutch: { id: "crutch", name: "Crutch", keywords: ["accessibility", "assist"], skins: [{ unified: "1fa7c", native: "\u{1FA7C}" }], version: 14 }, stethoscope: { id: "stethoscope", name: "Stethoscope", keywords: ["health"], skins: [{ unified: "1fa7a", native: "\u{1FA7A}" }], version: 12 }, "x-ray": { id: "x-ray", name: "X-Ray", keywords: ["x", "ray", "skeleton", "medicine"], skins: [{ unified: "1fa7b", native: "\u{1FA7B}" }], version: 14 }, door: { id: "door", name: "Door", keywords: ["house", "entry", "exit"], skins: [{ unified: "1f6aa", native: "\u{1F6AA}" }], version: 1 }, elevator: { id: "elevator", name: "Elevator", keywords: ["lift"], skins: [{ unified: "1f6d7", native: "\u{1F6D7}" }], version: 13 }, mirror: { id: "mirror", name: "Mirror", keywords: ["reflection"], skins: [{ unified: "1fa9e", native: "\u{1FA9E}" }], version: 13 }, window: { id: "window", name: "Window", keywords: ["scenery"], skins: [{ unified: "1fa9f", native: "\u{1FA9F}" }], version: 13 }, bed: { id: "bed", name: "Bed", keywords: ["sleep", "rest"], skins: [{ unified: "1f6cf-fe0f", native: "\u{1F6CF}\uFE0F" }], version: 1 }, couch_and_lamp: { id: "couch_and_lamp", name: "Couch and Lamp", keywords: ["read", "chill"], skins: [{ unified: "1f6cb-fe0f", native: "\u{1F6CB}\uFE0F" }], version: 1 }, chair: { id: "chair", name: "Chair", keywords: ["sit", "furniture"], skins: [{ unified: "1fa91", native: "\u{1FA91}" }], version: 12 }, toilet: { id: "toilet", name: "Toilet", keywords: ["restroom", "wc", "washroom", "bathroom", "potty"], skins: [{ unified: "1f6bd", native: "\u{1F6BD}" }], version: 1 }, plunger: { id: "plunger", name: "Plunger", keywords: ["toilet"], skins: [{ unified: "1faa0", native: "\u{1FAA0}" }], version: 13 }, shower: { id: "shower", name: "Shower", keywords: ["clean", "water", "bathroom"], skins: [{ unified: "1f6bf", native: "\u{1F6BF}" }], version: 1 }, bathtub: { id: "bathtub", name: "Bathtub", keywords: ["clean", "shower", "bathroom"], skins: [{ unified: "1f6c1", native: "\u{1F6C1}" }], version: 1 }, mouse_trap: { id: "mouse_trap", name: "Mouse Trap", keywords: ["cheese"], skins: [{ unified: "1faa4", native: "\u{1FAA4}" }], version: 13 }, razor: { id: "razor", name: "Razor", keywords: ["cut"], skins: [{ unified: "1fa92", native: "\u{1FA92}" }], version: 12 }, lotion_bottle: { id: "lotion_bottle", name: "Lotion Bottle", keywords: ["moisturizer", "sunscreen"], skins: [{ unified: "1f9f4", native: "\u{1F9F4}" }], version: 11 }, safety_pin: { id: "safety_pin", name: "Safety Pin", keywords: ["diaper"], skins: [{ unified: "1f9f7", native: "\u{1F9F7}" }], version: 11 }, broom: { id: "broom", name: "Broom", keywords: ["cleaning", "sweeping", "witch"], skins: [{ unified: "1f9f9", native: "\u{1F9F9}" }], version: 11 }, basket: { id: "basket", name: "Basket", keywords: ["laundry"], skins: [{ unified: "1f9fa", native: "\u{1F9FA}" }], version: 11 }, roll_of_paper: { id: "roll_of_paper", name: "Roll of Paper", keywords: [], skins: [{ unified: "1f9fb", native: "\u{1F9FB}" }], version: 11 }, bucket: { id: "bucket", name: "Bucket", keywords: ["water", "container"], skins: [{ unified: "1faa3", native: "\u{1FAA3}" }], version: 13 }, soap: { id: "soap", name: "Soap", keywords: ["bar", "bathing", "cleaning", "lather"], skins: [{ unified: "1f9fc", native: "\u{1F9FC}" }], version: 11 }, bubbles: { id: "bubbles", name: "Bubbles", keywords: ["soap", "fun", "carbonation", "sparkling"], skins: [{ unified: "1fae7", native: "\u{1FAE7}" }], version: 14 }, toothbrush: { id: "toothbrush", name: "Toothbrush", keywords: ["hygiene", "dental"], skins: [{ unified: "1faa5", native: "\u{1FAA5}" }], version: 13 }, sponge: { id: "sponge", name: "Sponge", keywords: ["absorbing", "cleaning", "porous"], skins: [{ unified: "1f9fd", native: "\u{1F9FD}" }], version: 11 }, fire_extinguisher: { id: "fire_extinguisher", name: "Fire Extinguisher", keywords: ["quench"], skins: [{ unified: "1f9ef", native: "\u{1F9EF}" }], version: 11 }, shopping_trolley: { id: "shopping_trolley", name: "Shopping Cart", keywords: ["trolley"], skins: [{ unified: "1f6d2", native: "\u{1F6D2}" }], version: 3 }, smoking: { id: "smoking", name: "Cigarette", keywords: ["smoking", "kills", "tobacco", "joint", "smoke"], skins: [{ unified: "1f6ac", native: "\u{1F6AC}" }], version: 1 }, coffin: { id: "coffin", name: "Coffin", keywords: ["vampire", "dead", "die", "death", "rip", "graveyard", "cemetery", "casket", "funeral", "box"], skins: [{ unified: "26b0-fe0f", native: "\u26B0\uFE0F" }], version: 1 }, headstone: { id: "headstone", name: "Headstone", keywords: ["death", "rip", "grave"], skins: [{ unified: "1faa6", native: "\u{1FAA6}" }], version: 13 }, funeral_urn: { id: "funeral_urn", name: "Funeral Urn", keywords: ["dead", "die", "death", "rip", "ashes"], skins: [{ unified: "26b1-fe0f", native: "\u26B1\uFE0F" }], version: 1 }, moyai: { id: "moyai", name: "Moai", keywords: ["moyai", "rock", "easter", "island"], skins: [{ unified: "1f5ff", native: "\u{1F5FF}" }], version: 1 }, placard: { id: "placard", name: "Placard", keywords: ["announcement"], skins: [{ unified: "1faa7", native: "\u{1FAA7}" }], version: 13 }, identification_card: { id: "identification_card", name: "Identification Card", keywords: ["document"], skins: [{ unified: "1faaa", native: "\u{1FAAA}" }], version: 14 }, atm: { id: "atm", name: "Atm Sign", keywords: ["money", "sales", "cash", "blue", "square", "payment", "bank"], skins: [{ unified: "1f3e7", native: "\u{1F3E7}" }], version: 1 }, put_litter_in_its_place: { id: "put_litter_in_its_place", name: "Litter in Bin Sign", keywords: ["put", "its", "place", "blue", "square", "human", "info"], skins: [{ unified: "1f6ae", native: "\u{1F6AE}" }], version: 1 }, potable_water: { id: "potable_water", name: "Potable Water", keywords: ["blue", "square", "liquid", "restroom", "cleaning", "faucet"], skins: [{ unified: "1f6b0", native: "\u{1F6B0}" }], version: 1 }, wheelchair: { id: "wheelchair", name: "Wheelchair Symbol", keywords: ["blue", "square", "disabled", "accessibility"], skins: [{ unified: "267f", native: "\u267F" }], version: 1 }, mens: { id: "mens", name: "Men\u2019s Room", keywords: ["mens", "men", "s", "toilet", "restroom", "wc", "blue", "square", "gender", "male"], skins: [{ unified: "1f6b9", native: "\u{1F6B9}" }], version: 1 }, womens: { id: "womens", name: "Women\u2019s Room", keywords: ["womens", "women", "s", "purple", "square", "woman", "female", "toilet", "loo", "restroom", "gender"], skins: [{ unified: "1f6ba", native: "\u{1F6BA}" }], version: 1 }, restroom: { id: "restroom", name: "Restroom", keywords: ["blue", "square", "toilet", "refresh", "wc", "gender"], skins: [{ unified: "1f6bb", native: "\u{1F6BB}" }], version: 1 }, baby_symbol: { id: "baby_symbol", name: "Baby Symbol", keywords: ["orange", "square", "child"], skins: [{ unified: "1f6bc", native: "\u{1F6BC}" }], version: 1 }, wc: { id: "wc", name: "Water Closet", keywords: ["wc", "toilet", "restroom", "blue", "square"], skins: [{ unified: "1f6be", native: "\u{1F6BE}" }], version: 1 }, passport_control: { id: "passport_control", name: "Passport Control", keywords: ["custom", "blue", "square"], skins: [{ unified: "1f6c2", native: "\u{1F6C2}" }], version: 1 }, customs: { id: "customs", name: "Customs", keywords: ["passport", "border", "blue", "square"], skins: [{ unified: "1f6c3", native: "\u{1F6C3}" }], version: 1 }, baggage_claim: { id: "baggage_claim", name: "Baggage Claim", keywords: ["blue", "square", "airport", "transport"], skins: [{ unified: "1f6c4", native: "\u{1F6C4}" }], version: 1 }, left_luggage: { id: "left_luggage", name: "Left Luggage", keywords: ["blue", "square", "travel"], skins: [{ unified: "1f6c5", native: "\u{1F6C5}" }], version: 1 }, warning: { id: "warning", name: "Warning", keywords: ["exclamation", "wip", "alert", "error", "problem", "issue"], skins: [{ unified: "26a0-fe0f", native: "\u26A0\uFE0F" }], version: 1 }, children_crossing: { id: "children_crossing", name: "Children Crossing", keywords: ["school", "warning", "danger", "sign", "driving", "yellow", "diamond"], skins: [{ unified: "1f6b8", native: "\u{1F6B8}" }], version: 1 }, no_entry: { id: "no_entry", name: "No Entry", keywords: ["limit", "security", "privacy", "bad", "denied", "stop", "circle"], skins: [{ unified: "26d4", native: "\u26D4" }], version: 1 }, no_entry_sign: { id: "no_entry_sign", name: "Prohibited", keywords: ["no", "entry", "sign", "forbid", "stop", "limit", "denied", "disallow", "circle"], skins: [{ unified: "1f6ab", native: "\u{1F6AB}" }], version: 1 }, no_bicycles: { id: "no_bicycles", name: "No Bicycles", keywords: ["cyclist", "prohibited", "circle"], skins: [{ unified: "1f6b3", native: "\u{1F6B3}" }], version: 1 }, no_smoking: { id: "no_smoking", name: "No Smoking", keywords: ["cigarette", "blue", "square", "smell", "smoke"], skins: [{ unified: "1f6ad", native: "\u{1F6AD}" }], version: 1 }, do_not_litter: { id: "do_not_litter", name: "No Littering", keywords: ["do", "not", "litter", "trash", "bin", "garbage", "circle"], skins: [{ unified: "1f6af", native: "\u{1F6AF}" }], version: 1 }, "non-potable_water": { id: "non-potable_water", name: "Non-Potable Water", keywords: ["non", "potable", "drink", "faucet", "tap", "circle"], skins: [{ unified: "1f6b1", native: "\u{1F6B1}" }], version: 1 }, no_pedestrians: { id: "no_pedestrians", name: "No Pedestrians", keywords: ["rules", "crossing", "walking", "circle"], skins: [{ unified: "1f6b7", native: "\u{1F6B7}" }], version: 1 }, no_mobile_phones: { id: "no_mobile_phones", name: "No Mobile Phones", keywords: ["iphone", "mute", "circle"], skins: [{ unified: "1f4f5", native: "\u{1F4F5}" }], version: 1 }, underage: { id: "underage", name: "No One Under Eighteen", keywords: ["underage", "18", "drink", "pub", "night", "minor", "circle"], skins: [{ unified: "1f51e", native: "\u{1F51E}" }], version: 1 }, radioactive_sign: { id: "radioactive_sign", name: "Radioactive", keywords: ["sign", "nuclear", "danger"], skins: [{ unified: "2622-fe0f", native: "\u2622\uFE0F" }], version: 1 }, biohazard_sign: { id: "biohazard_sign", name: "Biohazard", keywords: ["sign", "danger"], skins: [{ unified: "2623-fe0f", native: "\u2623\uFE0F" }], version: 1 }, arrow_up: { id: "arrow_up", name: "Up Arrow", keywords: ["blue", "square", "continue", "top", "direction"], skins: [{ unified: "2b06-fe0f", native: "\u2B06\uFE0F" }], version: 1 }, arrow_upper_right: { id: "arrow_upper_right", name: "Up-Right Arrow", keywords: ["upper", "right", "up", "blue", "square", "point", "direction", "diagonal", "northeast"], skins: [{ unified: "2197-fe0f", native: "\u2197\uFE0F" }], version: 1 }, arrow_right: { id: "arrow_right", name: "Right Arrow", keywords: ["blue", "square", "next"], skins: [{ unified: "27a1-fe0f", native: "\u27A1\uFE0F" }], version: 1 }, arrow_lower_right: { id: "arrow_lower_right", name: "South East Arrow", keywords: ["lower", "right", "down", "blue", "square", "direction", "diagonal", "southeast"], skins: [{ unified: "2198-fe0f", native: "\u2198\uFE0F" }], version: 1 }, arrow_down: { id: "arrow_down", name: "Down Arrow", keywords: ["blue", "square", "direction", "bottom"], skins: [{ unified: "2b07-fe0f", native: "\u2B07\uFE0F" }], version: 1 }, arrow_lower_left: { id: "arrow_lower_left", name: "Down-Left Arrow", keywords: ["lower", "left", "down", "blue", "square", "direction", "diagonal", "southwest"], skins: [{ unified: "2199-fe0f", native: "\u2199\uFE0F" }], version: 1 }, arrow_left: { id: "arrow_left", name: "Left Arrow", keywords: ["blue", "square", "previous", "back"], skins: [{ unified: "2b05-fe0f", native: "\u2B05\uFE0F" }], version: 1 }, arrow_upper_left: { id: "arrow_upper_left", name: "Up-Left Arrow", keywords: ["upper", "left", "up", "blue", "square", "point", "direction", "diagonal", "northwest"], skins: [{ unified: "2196-fe0f", native: "\u2196\uFE0F" }], version: 1 }, arrow_up_down: { id: "arrow_up_down", name: "Up Down Arrow", keywords: ["blue", "square", "direction", "way", "vertical"], skins: [{ unified: "2195-fe0f", native: "\u2195\uFE0F" }], version: 1 }, left_right_arrow: { id: "left_right_arrow", name: "Left Right Arrow", keywords: ["shape", "direction", "horizontal", "sideways"], skins: [{ unified: "2194-fe0f", native: "\u2194\uFE0F" }], version: 1 }, leftwards_arrow_with_hook: { id: "leftwards_arrow_with_hook", name: "Right Arrow Curving Left", keywords: ["leftwards", "with", "hook", "back", "return", "blue", "square", "undo", "enter"], skins: [{ unified: "21a9-fe0f", native: "\u21A9\uFE0F" }], version: 1 }, arrow_right_hook: { id: "arrow_right_hook", name: "Left Arrow Curving Right", keywords: ["hook", "blue", "square", "return", "rotate", "direction"], skins: [{ unified: "21aa-fe0f", native: "\u21AA\uFE0F" }], version: 1 }, arrow_heading_up: { id: "arrow_heading_up", name: "Right Arrow Curving Up", keywords: ["heading", "blue", "square", "direction", "top"], skins: [{ unified: "2934-fe0f", native: "\u2934\uFE0F" }], version: 1 }, arrow_heading_down: { id: "arrow_heading_down", name: "Right Arrow Curving Down", keywords: ["heading", "blue", "square", "direction", "bottom"], skins: [{ unified: "2935-fe0f", native: "\u2935\uFE0F" }], version: 1 }, arrows_clockwise: { id: "arrows_clockwise", name: "Clockwise Vertical Arrows", keywords: ["sync", "cycle", "round", "repeat"], skins: [{ unified: "1f503", native: "\u{1F503}" }], version: 1 }, arrows_counterclockwise: { id: "arrows_counterclockwise", name: "Counterclockwise Arrows Button", keywords: ["blue", "square", "sync", "cycle"], skins: [{ unified: "1f504", native: "\u{1F504}" }], version: 1 }, back: { id: "back", name: "Back Arrow", keywords: ["words", "return"], skins: [{ unified: "1f519", native: "\u{1F519}" }], version: 1 }, end: { id: "end", name: "End Arrow", keywords: ["words"], skins: [{ unified: "1f51a", native: "\u{1F51A}" }], version: 1 }, on: { id: "on", name: "On! Arrow", keywords: ["on", "words"], skins: [{ unified: "1f51b", native: "\u{1F51B}" }], version: 1 }, soon: { id: "soon", name: "Soon Arrow", keywords: ["words"], skins: [{ unified: "1f51c", native: "\u{1F51C}" }], version: 1 }, top: { id: "top", name: "Top Arrow", keywords: ["words", "blue", "square"], skins: [{ unified: "1f51d", native: "\u{1F51D}" }], version: 1 }, place_of_worship: { id: "place_of_worship", name: "Place of Worship", keywords: ["religion", "church", "temple", "prayer"], skins: [{ unified: "1f6d0", native: "\u{1F6D0}" }], version: 1 }, atom_symbol: { id: "atom_symbol", name: "Atom Symbol", keywords: ["science", "physics", "chemistry"], skins: [{ unified: "269b-fe0f", native: "\u269B\uFE0F" }], version: 1 }, om_symbol: { id: "om_symbol", name: "Om", keywords: ["symbol", "hinduism", "buddhism", "sikhism", "jainism"], skins: [{ unified: "1f549-fe0f", native: "\u{1F549}\uFE0F" }], version: 1 }, star_of_david: { id: "star_of_david", name: "Star of David", keywords: ["judaism"], skins: [{ unified: "2721-fe0f", native: "\u2721\uFE0F" }], version: 1 }, wheel_of_dharma: { id: "wheel_of_dharma", name: "Wheel of Dharma", keywords: ["hinduism", "buddhism", "sikhism", "jainism"], skins: [{ unified: "2638-fe0f", native: "\u2638\uFE0F" }], version: 1 }, yin_yang: { id: "yin_yang", name: "Yin Yang", keywords: ["balance"], skins: [{ unified: "262f-fe0f", native: "\u262F\uFE0F" }], version: 1 }, latin_cross: { id: "latin_cross", name: "Latin Cross", keywords: ["christianity"], skins: [{ unified: "271d-fe0f", native: "\u271D\uFE0F" }], version: 1 }, orthodox_cross: { id: "orthodox_cross", name: "Orthodox Cross", keywords: ["suppedaneum", "religion"], skins: [{ unified: "2626-fe0f", native: "\u2626\uFE0F" }], version: 1 }, star_and_crescent: { id: "star_and_crescent", name: "Star and Crescent", keywords: ["islam"], skins: [{ unified: "262a-fe0f", native: "\u262A\uFE0F" }], version: 1 }, peace_symbol: { id: "peace_symbol", name: "Peace Symbol", keywords: ["hippie"], skins: [{ unified: "262e-fe0f", native: "\u262E\uFE0F" }], version: 1 }, menorah_with_nine_branches: { id: "menorah_with_nine_branches", name: "Menorah", keywords: ["with", "nine", "branches", "hanukkah", "candles", "jewish"], skins: [{ unified: "1f54e", native: "\u{1F54E}" }], version: 1 }, six_pointed_star: { id: "six_pointed_star", name: "Dotted Six-Pointed Star", keywords: ["six", "pointed", "purple", "square", "religion", "jewish", "hexagram"], skins: [{ unified: "1f52f", native: "\u{1F52F}" }], version: 1 }, aries: { id: "aries", name: "Aries", keywords: ["sign", "purple", "square", "zodiac", "astrology"], skins: [{ unified: "2648", native: "\u2648" }], version: 1 }, taurus: { id: "taurus", name: "Taurus", keywords: ["purple", "square", "sign", "zodiac", "astrology"], skins: [{ unified: "2649", native: "\u2649" }], version: 1 }, gemini: { id: "gemini", name: "Gemini", keywords: ["sign", "zodiac", "purple", "square", "astrology"], skins: [{ unified: "264a", native: "\u264A" }], version: 1 }, cancer: { id: "cancer", name: "Cancer", keywords: ["sign", "zodiac", "purple", "square", "astrology"], skins: [{ unified: "264b", native: "\u264B" }], version: 1 }, leo: { id: "leo", name: "Leo", keywords: ["sign", "purple", "square", "zodiac", "astrology"], skins: [{ unified: "264c", native: "\u264C" }], version: 1 }, virgo: { id: "virgo", name: "Virgo", keywords: ["sign", "zodiac", "purple", "square", "astrology"], skins: [{ unified: "264d", native: "\u264D" }], version: 1 }, libra: { id: "libra", name: "Libra", keywords: ["sign", "purple", "square", "zodiac", "astrology"], skins: [{ unified: "264e", native: "\u264E" }], version: 1 }, scorpius: { id: "scorpius", name: "Scorpio", keywords: ["scorpius", "sign", "zodiac", "purple", "square", "astrology"], skins: [{ unified: "264f", native: "\u264F" }], version: 1 }, sagittarius: { id: "sagittarius", name: "Sagittarius", keywords: ["sign", "zodiac", "purple", "square", "astrology"], skins: [{ unified: "2650", native: "\u2650" }], version: 1 }, capricorn: { id: "capricorn", name: "Capricorn", keywords: ["sign", "zodiac", "purple", "square", "astrology"], skins: [{ unified: "2651", native: "\u2651" }], version: 1 }, aquarius: { id: "aquarius", name: "Aquarius", keywords: ["sign", "purple", "square", "zodiac", "astrology"], skins: [{ unified: "2652", native: "\u2652" }], version: 1 }, pisces: { id: "pisces", name: "Pisces", keywords: ["purple", "square", "sign", "zodiac", "astrology"], skins: [{ unified: "2653", native: "\u2653" }], version: 1 }, ophiuchus: { id: "ophiuchus", name: "Ophiuchus", keywords: ["sign", "purple", "square", "constellation", "astrology"], skins: [{ unified: "26ce", native: "\u26CE" }], version: 1 }, twisted_rightwards_arrows: { id: "twisted_rightwards_arrows", name: "Shuffle Tracks Button", keywords: ["twisted", "rightwards", "arrows", "blue", "square", "music", "random"], skins: [{ unified: "1f500", native: "\u{1F500}" }], version: 1 }, repeat: { id: "repeat", name: "Repeat Button", keywords: ["loop", "record"], skins: [{ unified: "1f501", native: "\u{1F501}" }], version: 1 }, repeat_one: { id: "repeat_one", name: "Repeat Single Button", keywords: ["one", "blue", "square", "loop"], skins: [{ unified: "1f502", native: "\u{1F502}" }], version: 1 }, arrow_forward: { id: "arrow_forward", name: "Play Button", keywords: ["arrow", "forward", "blue", "square", "right", "direction"], skins: [{ unified: "25b6-fe0f", native: "\u25B6\uFE0F" }], version: 1 }, fast_forward: { id: "fast_forward", name: "Fast-Forward Button", keywords: ["fast", "forward", "blue", "square", "play", "speed", "continue"], skins: [{ unified: "23e9", native: "\u23E9" }], version: 1 }, black_right_pointing_double_triangle_with_vertical_bar: { id: "black_right_pointing_double_triangle_with_vertical_bar", name: "Next Track Button", keywords: ["black", "right", "pointing", "double", "triangle", "with", "vertical", "bar", "forward", "blue", "square"], skins: [{ unified: "23ed-fe0f", native: "\u23ED\uFE0F" }], version: 1 }, black_right_pointing_triangle_with_double_vertical_bar: { id: "black_right_pointing_triangle_with_double_vertical_bar", name: "Play or Pause Button", keywords: ["black", "right", "pointing", "triangle", "with", "double", "vertical", "bar", "blue", "square"], skins: [{ unified: "23ef-fe0f", native: "\u23EF\uFE0F" }], version: 1 }, arrow_backward: { id: "arrow_backward", name: "Reverse Button", keywords: ["arrow", "backward", "blue", "square", "left", "direction"], skins: [{ unified: "25c0-fe0f", native: "\u25C0\uFE0F" }], version: 1 }, rewind: { id: "rewind", name: "Fast Reverse Button", keywords: ["rewind", "play", "blue", "square"], skins: [{ unified: "23ea", native: "\u23EA" }], version: 1 }, black_left_pointing_double_triangle_with_vertical_bar: { id: "black_left_pointing_double_triangle_with_vertical_bar", name: "Last Track Button", keywords: ["black", "left", "pointing", "double", "triangle", "with", "vertical", "bar", "backward"], skins: [{ unified: "23ee-fe0f", native: "\u23EE\uFE0F" }], version: 1 }, arrow_up_small: { id: "arrow_up_small", name: "Upwards Button", keywords: ["arrow", "up", "small", "blue", "square", "triangle", "direction", "point", "forward", "top"], skins: [{ unified: "1f53c", native: "\u{1F53C}" }], version: 1 }, arrow_double_up: { id: "arrow_double_up", name: "Fast Up Button", keywords: ["arrow", "double", "blue", "square", "direction", "top"], skins: [{ unified: "23eb", native: "\u23EB" }], version: 1 }, arrow_down_small: { id: "arrow_down_small", name: "Downwards Button", keywords: ["arrow", "down", "small", "blue", "square", "direction", "bottom"], skins: [{ unified: "1f53d", native: "\u{1F53D}" }], version: 1 }, arrow_double_down: { id: "arrow_double_down", name: "Fast Down Button", keywords: ["arrow", "double", "blue", "square", "direction", "bottom"], skins: [{ unified: "23ec", native: "\u23EC" }], version: 1 }, double_vertical_bar: { id: "double_vertical_bar", name: "Pause Button", keywords: ["double", "vertical", "bar", "blue", "square"], skins: [{ unified: "23f8-fe0f", native: "\u23F8\uFE0F" }], version: 1 }, black_square_for_stop: { id: "black_square_for_stop", name: "Stop Button", keywords: ["black", "square", "for", "blue"], skins: [{ unified: "23f9-fe0f", native: "\u23F9\uFE0F" }], version: 1 }, black_circle_for_record: { id: "black_circle_for_record", name: "Record Button", keywords: ["black", "circle", "for", "blue", "square"], skins: [{ unified: "23fa-fe0f", native: "\u23FA\uFE0F" }], version: 1 }, eject: { id: "eject", name: "Eject Button", keywords: ["blue", "square"], skins: [{ unified: "23cf-fe0f", native: "\u23CF\uFE0F" }], version: 1 }, cinema: { id: "cinema", name: "Cinema", keywords: ["blue", "square", "record", "film", "movie", "curtain", "stage", "theater"], skins: [{ unified: "1f3a6", native: "\u{1F3A6}" }], version: 1 }, low_brightness: { id: "low_brightness", name: "Dim Button", keywords: ["low", "brightness", "sun", "afternoon", "warm", "summer"], skins: [{ unified: "1f505", native: "\u{1F505}" }], version: 1 }, high_brightness: { id: "high_brightness", name: "Bright Button", keywords: ["high", "brightness", "sun", "light"], skins: [{ unified: "1f506", native: "\u{1F506}" }], version: 1 }, signal_strength: { id: "signal_strength", name: "Antenna Bars", keywords: ["signal", "strength", "blue", "square", "reception", "phone", "internet", "connection", "wifi", "bluetooth"], skins: [{ unified: "1f4f6", native: "\u{1F4F6}" }], version: 1 }, vibration_mode: { id: "vibration_mode", name: "Vibration Mode", keywords: ["orange", "square", "phone"], skins: [{ unified: "1f4f3", native: "\u{1F4F3}" }], version: 1 }, mobile_phone_off: { id: "mobile_phone_off", name: "Mobile Phone off", keywords: ["mute", "orange", "square", "silence", "quiet"], skins: [{ unified: "1f4f4", native: "\u{1F4F4}" }], version: 1 }, female_sign: { id: "female_sign", name: "Female Sign", keywords: ["woman", "women", "lady", "girl"], skins: [{ unified: "2640-fe0f", native: "\u2640\uFE0F" }], version: 4 }, male_sign: { id: "male_sign", name: "Male Sign", keywords: ["man", "boy", "men"], skins: [{ unified: "2642-fe0f", native: "\u2642\uFE0F" }], version: 4 }, transgender_symbol: { id: "transgender_symbol", name: "Transgender Symbol", keywords: ["lgbtq"], skins: [{ unified: "26a7-fe0f", native: "\u26A7\uFE0F" }], version: 13 }, heavy_multiplication_x: { id: "heavy_multiplication_x", name: "Multiply", keywords: ["heavy", "multiplication", "x", "sign", "math", "calculation"], skins: [{ unified: "2716-fe0f", native: "\u2716\uFE0F" }], version: 1 }, heavy_plus_sign: { id: "heavy_plus_sign", name: "Plus", keywords: ["heavy", "sign", "math", "calculation", "addition", "more", "increase"], skins: [{ unified: "2795", native: "\u2795" }], version: 1 }, heavy_minus_sign: { id: "heavy_minus_sign", name: "Minus", keywords: ["heavy", "sign", "math", "calculation", "subtract", "less"], skins: [{ unified: "2796", native: "\u2796" }], version: 1 }, heavy_division_sign: { id: "heavy_division_sign", name: "Divide", keywords: ["heavy", "division", "sign", "math", "calculation"], skins: [{ unified: "2797", native: "\u2797" }], version: 1 }, heavy_equals_sign: { id: "heavy_equals_sign", name: "Heavy Equals Sign", keywords: ["math"], skins: [{ unified: "1f7f0", native: "\u{1F7F0}" }], version: 14 }, infinity: { id: "infinity", name: "Infinity", keywords: ["forever"], skins: [{ unified: "267e-fe0f", native: "\u267E\uFE0F" }], version: 11 }, bangbang: { id: "bangbang", name: "Double Exclamation Mark", keywords: ["bangbang", "surprise"], skins: [{ unified: "203c-fe0f", native: "\u203C\uFE0F" }], version: 1 }, interrobang: { id: "interrobang", name: "Exclamation Question Mark", keywords: ["interrobang", "wat", "punctuation", "surprise"], skins: [{ unified: "2049-fe0f", native: "\u2049\uFE0F" }], version: 1 }, question: { id: "question", name: "Red Question Mark", keywords: ["doubt", "confused"], skins: [{ unified: "2753", native: "\u2753" }], version: 1 }, grey_question: { id: "grey_question", name: "White Question Mark", keywords: ["grey", "doubts", "gray", "huh", "confused"], skins: [{ unified: "2754", native: "\u2754" }], version: 1 }, grey_exclamation: { id: "grey_exclamation", name: "White Exclamation Mark", keywords: ["grey", "surprise", "punctuation", "gray", "wow", "warning"], skins: [{ unified: "2755", native: "\u2755" }], version: 1 }, exclamation: { id: "exclamation", name: "Red Exclamation Mark", keywords: ["heavy", "danger", "surprise", "punctuation", "wow", "warning"], skins: [{ unified: "2757", native: "\u2757" }], version: 1 }, wavy_dash: { id: "wavy_dash", name: "Wavy Dash", keywords: ["draw", "line", "moustache", "mustache", "squiggle", "scribble"], skins: [{ unified: "3030-fe0f", native: "\u3030\uFE0F" }], version: 1 }, currency_exchange: { id: "currency_exchange", name: "Currency Exchange", keywords: ["money", "sales", "dollar", "travel"], skins: [{ unified: "1f4b1", native: "\u{1F4B1}" }], version: 1 }, heavy_dollar_sign: { id: "heavy_dollar_sign", name: "Heavy Dollar Sign", keywords: ["money", "sales", "payment", "currency", "buck"], skins: [{ unified: "1f4b2", native: "\u{1F4B2}" }], version: 1 }, medical_symbol: { id: "medical_symbol", name: "Medical Symbol", keywords: ["staff", "of", "aesculapius", "health", "hospital"], skins: [{ unified: "2695-fe0f", native: "\u2695\uFE0F" }], version: 4 }, recycle: { id: "recycle", name: "Recycling Symbol", keywords: ["recycle", "arrow", "environment", "garbage", "trash"], skins: [{ unified: "267b-fe0f", native: "\u267B\uFE0F" }], version: 1 }, fleur_de_lis: { id: "fleur_de_lis", name: "Fleur-De-Lis", keywords: ["fleur", "de", "lis", "decorative", "scout"], skins: [{ unified: "269c-fe0f", native: "\u269C\uFE0F" }], version: 1 }, trident: { id: "trident", name: "Trident Emblem", keywords: ["weapon", "spear"], skins: [{ unified: "1f531", native: "\u{1F531}" }], version: 1 }, name_badge: { id: "name_badge", name: "Name Badge", keywords: ["fire", "forbid"], skins: [{ unified: "1f4db", native: "\u{1F4DB}" }], version: 1 }, beginner: { id: "beginner", name: "Japanese Symbol for Beginner", keywords: ["badge", "shield"], skins: [{ unified: "1f530", native: "\u{1F530}" }], version: 1 }, o: { id: "o", name: "Hollow Red Circle", keywords: ["o", "round"], skins: [{ unified: "2b55", native: "\u2B55" }], version: 1 }, white_check_mark: { id: "white_check_mark", name: "Check Mark Button", keywords: ["white", "green", "square", "ok", "agree", "vote", "election", "answer", "tick"], skins: [{ unified: "2705", native: "\u2705" }], version: 1 }, ballot_box_with_check: { id: "ballot_box_with_check", name: "Check Box with Check", keywords: ["ballot", "ok", "agree", "confirm", "black", "square", "vote", "election", "yes", "tick"], skins: [{ unified: "2611-fe0f", native: "\u2611\uFE0F" }], version: 1 }, heavy_check_mark: { id: "heavy_check_mark", name: "Check Mark", keywords: ["heavy", "ok", "nike", "answer", "yes", "tick"], skins: [{ unified: "2714-fe0f", native: "\u2714\uFE0F" }], version: 1 }, x: { id: "x", name: "Cross Mark", keywords: ["x", "no", "delete", "remove", "cancel", "red"], skins: [{ unified: "274c", native: "\u274C" }], version: 1 }, negative_squared_cross_mark: { id: "negative_squared_cross_mark", name: "Cross Mark Button", keywords: ["negative", "squared", "x", "green", "square", "no", "deny"], skins: [{ unified: "274e", native: "\u274E" }], version: 1 }, curly_loop: { id: "curly_loop", name: "Curly Loop", keywords: ["scribble", "draw", "shape", "squiggle"], skins: [{ unified: "27b0", native: "\u27B0" }], version: 1 }, loop: { id: "loop", name: "Double Curly Loop", keywords: ["tape", "cassette"], skins: [{ unified: "27bf", native: "\u27BF" }], version: 1 }, part_alternation_mark: { id: "part_alternation_mark", name: "Part Alternation Mark", keywords: ["graph", "presentation", "stats", "business", "economics", "bad"], skins: [{ unified: "303d-fe0f", native: "\u303D\uFE0F" }], version: 1 }, eight_spoked_asterisk: { id: "eight_spoked_asterisk", name: "Eight Spoked Asterisk", keywords: ["star", "sparkle", "green", "square"], skins: [{ unified: "2733-fe0f", native: "\u2733\uFE0F" }], version: 1 }, eight_pointed_black_star: { id: "eight_pointed_black_star", name: "Eight-Pointed Star", keywords: ["eight", "pointed", "black", "orange", "square", "shape", "polygon"], skins: [{ unified: "2734-fe0f", native: "\u2734\uFE0F" }], version: 1 }, sparkle: { id: "sparkle", name: "Sparkle", keywords: ["stars", "green", "square", "awesome", "good", "fireworks"], skins: [{ unified: "2747-fe0f", native: "\u2747\uFE0F" }], version: 1 }, copyright: { id: "copyright", name: "Copyright", keywords: ["ip", "license", "circle", "law", "legal"], skins: [{ unified: "00a9-fe0f", native: "\xA9\uFE0F" }], version: 1 }, registered: { id: "registered", name: "Registered", keywords: ["alphabet", "circle"], skins: [{ unified: "00ae-fe0f", native: "\xAE\uFE0F" }], version: 1 }, tm: { id: "tm", name: "Trade Mark", keywords: ["tm", "trademark", "brand", "law", "legal"], skins: [{ unified: "2122-fe0f", native: "\u2122\uFE0F" }], version: 1 }, hash: { id: "hash", name: "Hash Key", keywords: ["keycap", "", "symbol", "blue", "square", "twitter"], skins: [{ unified: "0023-fe0f-20e3", native: "#\uFE0F\u20E3" }], version: 1 }, keycap_star: { id: "keycap_star", name: "Keycap: *", keywords: ["keycap", "star", ""], skins: [{ unified: "002a-fe0f-20e3", native: "*\uFE0F\u20E3" }], version: 2 }, zero: { id: "zero", name: "Keycap 0", keywords: ["zero", "numbers", "blue", "square", "null"], skins: [{ unified: "0030-fe0f-20e3", native: "0\uFE0F\u20E3" }], version: 1 }, one: { id: "one", name: "Keycap 1", keywords: ["one", "blue", "square", "numbers"], skins: [{ unified: "0031-fe0f-20e3", native: "1\uFE0F\u20E3" }], version: 1 }, two: { id: "two", name: "Keycap 2", keywords: ["two", "numbers", "prime", "blue", "square"], skins: [{ unified: "0032-fe0f-20e3", native: "2\uFE0F\u20E3" }], version: 1 }, three: { id: "three", name: "Keycap 3", keywords: ["three", "numbers", "prime", "blue", "square"], skins: [{ unified: "0033-fe0f-20e3", native: "3\uFE0F\u20E3" }], version: 1 }, four: { id: "four", name: "Keycap 4", keywords: ["four", "numbers", "blue", "square"], skins: [{ unified: "0034-fe0f-20e3", native: "4\uFE0F\u20E3" }], version: 1 }, five: { id: "five", name: "Keycap 5", keywords: ["five", "numbers", "blue", "square", "prime"], skins: [{ unified: "0035-fe0f-20e3", native: "5\uFE0F\u20E3" }], version: 1 }, six: { id: "six", name: "Keycap 6", keywords: ["six", "numbers", "blue", "square"], skins: [{ unified: "0036-fe0f-20e3", native: "6\uFE0F\u20E3" }], version: 1 }, seven: { id: "seven", name: "Keycap 7", keywords: ["seven", "numbers", "blue", "square", "prime"], skins: [{ unified: "0037-fe0f-20e3", native: "7\uFE0F\u20E3" }], version: 1 }, eight: { id: "eight", name: "Keycap 8", keywords: ["eight", "blue", "square", "numbers"], skins: [{ unified: "0038-fe0f-20e3", native: "8\uFE0F\u20E3" }], version: 1 }, nine: { id: "nine", name: "Keycap 9", keywords: ["nine", "blue", "square", "numbers"], skins: [{ unified: "0039-fe0f-20e3", native: "9\uFE0F\u20E3" }], version: 1 }, keycap_ten: { id: "keycap_ten", name: "Keycap 10", keywords: ["ten", "numbers", "blue", "square"], skins: [{ unified: "1f51f", native: "\u{1F51F}" }], version: 1 }, capital_abcd: { id: "capital_abcd", name: "Input Latin Uppercase", keywords: ["capital", "abcd", "alphabet", "words", "blue", "square"], skins: [{ unified: "1f520", native: "\u{1F520}" }], version: 1 }, abcd: { id: "abcd", name: "Input Latin Lowercase", keywords: ["abcd", "blue", "square", "alphabet"], skins: [{ unified: "1f521", native: "\u{1F521}" }], version: 1 }, symbols: { id: "symbols", name: "Input Symbols", keywords: ["blue", "square", "music", "note", "ampersand", "percent", "glyphs", "characters"], skins: [{ unified: "1f523", native: "\u{1F523}" }], version: 1 }, abc: { id: "abc", name: "Input Latin Letters", keywords: ["abc", "blue", "square", "alphabet"], skins: [{ unified: "1f524", native: "\u{1F524}" }], version: 1 }, a: { id: "a", name: "A Button (blood Type)", keywords: ["red", "square", "alphabet", "letter"], skins: [{ unified: "1f170-fe0f", native: "\u{1F170}\uFE0F" }], version: 1 }, ab: { id: "ab", name: "Negative Squared Ab", keywords: ["button", "red", "square", "alphabet"], skins: [{ unified: "1f18e", native: "\u{1F18E}" }], version: 1 }, b: { id: "b", name: "B Button (blood Type)", keywords: ["red", "square", "alphabet", "letter"], skins: [{ unified: "1f171-fe0f", native: "\u{1F171}\uFE0F" }], version: 1 }, cl: { id: "cl", name: "Cl Button", keywords: ["alphabet", "words", "red", "square"], skins: [{ unified: "1f191", native: "\u{1F191}" }], version: 1 }, cool: { id: "cool", name: "Cool Button", keywords: ["words", "blue", "square"], skins: [{ unified: "1f192", native: "\u{1F192}" }], version: 1 }, free: { id: "free", name: "Free Button", keywords: ["blue", "square", "words"], skins: [{ unified: "1f193", native: "\u{1F193}" }], version: 1 }, information_source: { id: "information_source", name: "Information", keywords: ["source", "blue", "square", "alphabet", "letter"], skins: [{ unified: "2139-fe0f", native: "\u2139\uFE0F" }], version: 1 }, id: { id: "id", name: "Id Button", keywords: ["purple", "square", "words"], skins: [{ unified: "1f194", native: "\u{1F194}" }], version: 1 }, m: { id: "m", name: "Circled M", keywords: ["alphabet", "blue", "circle", "letter"], skins: [{ unified: "24c2-fe0f", native: "\u24C2\uFE0F" }], version: 1 }, new: { id: "new", name: "New Button", keywords: ["blue", "square", "words", "start"], skins: [{ unified: "1f195", native: "\u{1F195}" }], version: 1 }, ng: { id: "ng", name: "Ng Button", keywords: ["blue", "square", "words", "shape", "icon"], skins: [{ unified: "1f196", native: "\u{1F196}" }], version: 1 }, o2: { id: "o2", name: "O Button (blood Type)", keywords: ["o2", "alphabet", "red", "square", "letter"], skins: [{ unified: "1f17e-fe0f", native: "\u{1F17E}\uFE0F" }], version: 1 }, ok: { id: "ok", name: "Ok Button", keywords: ["good", "agree", "yes", "blue", "square"], skins: [{ unified: "1f197", native: "\u{1F197}" }], version: 1 }, parking: { id: "parking", name: "P Button", keywords: ["parking", "cars", "blue", "square", "alphabet", "letter"], skins: [{ unified: "1f17f-fe0f", native: "\u{1F17F}\uFE0F" }], version: 1 }, sos: { id: "sos", name: "Sos Button", keywords: ["help", "red", "square", "words", "emergency", "911"], skins: [{ unified: "1f198", native: "\u{1F198}" }], version: 1 }, up: { id: "up", name: "Up! Button", keywords: ["up", "blue", "square", "above", "high"], skins: [{ unified: "1f199", native: "\u{1F199}" }], version: 1 }, vs: { id: "vs", name: "Vs Button", keywords: ["words", "orange", "square"], skins: [{ unified: "1f19a", native: "\u{1F19A}" }], version: 1 }, koko: { id: "koko", name: "Squared Katakana Koko", keywords: ["japanese", "here", "button", "blue", "square", "destination"], skins: [{ unified: "1f201", native: "\u{1F201}" }], version: 1 }, sa: { id: "sa", name: "Squared Katakana Sa", keywords: ["japanese", "service", "charge", "button", "blue", "square"], skins: [{ unified: "1f202-fe0f", native: "\u{1F202}\uFE0F" }], version: 1 }, u6708: { id: "u6708", name: "Japanese \u201Cmonthly Amount\u201D Button", keywords: ["u6708", "monthly", "amount", "chinese", "month", "moon", "orange", "square", "kanji"], skins: [{ unified: "1f237-fe0f", native: "\u{1F237}\uFE0F" }], version: 1 }, u6709: { id: "u6709", name: "Squared Cjk Unified Ideograph-6709", keywords: ["u6709", "japanese", "not", "free", "of", "charge", "button", "orange", "square", "chinese", "have", "kanji"], skins: [{ unified: "1f236", native: "\u{1F236}" }], version: 1 }, u6307: { id: "u6307", name: "Japanese \u201Creserved\u201D Button", keywords: ["u6307", "reserved", "chinese", "point", "green", "square", "kanji"], skins: [{ unified: "1f22f", native: "\u{1F22F}" }], version: 1 }, ideograph_advantage: { id: "ideograph_advantage", name: "Japanese \u201Cbargain\u201D Button", keywords: ["ideograph", "advantage", "bargain", "chinese", "kanji", "obtain", "get", "circle"], skins: [{ unified: "1f250", native: "\u{1F250}" }], version: 1 }, u5272: { id: "u5272", name: "Japanese \u201Cdiscount\u201D Button", keywords: ["u5272", "discount", "cut", "divide", "chinese", "kanji", "pink", "square"], skins: [{ unified: "1f239", native: "\u{1F239}" }], version: 1 }, u7121: { id: "u7121", name: "Japanese \u201Cfree of Charge\u201D Button", keywords: ["u7121", "free", "charge", "nothing", "chinese", "kanji", "orange", "square"], skins: [{ unified: "1f21a", native: "\u{1F21A}" }], version: 1 }, u7981: { id: "u7981", name: "Japanese \u201Cprohibited\u201D Button", keywords: ["u7981", "prohibited", "kanji", "chinese", "forbidden", "limit", "restricted", "red", "square"], skins: [{ unified: "1f232", native: "\u{1F232}" }], version: 1 }, accept: { id: "accept", name: "Circled Ideograph Accept", keywords: ["japanese", "acceptable", "button", "ok", "good", "chinese", "kanji", "agree", "yes", "orange", "circle"], skins: [{ unified: "1f251", native: "\u{1F251}" }], version: 1 }, u7533: { id: "u7533", name: "Japanese \u201Capplication\u201D Button", keywords: ["u7533", "application", "chinese", "kanji", "orange", "square"], skins: [{ unified: "1f238", native: "\u{1F238}" }], version: 1 }, u5408: { id: "u5408", name: "Japanese \u201Cpassing Grade\u201D Button", keywords: ["u5408", "passing", "grade", "chinese", "join", "kanji", "red", "square"], skins: [{ unified: "1f234", native: "\u{1F234}" }], version: 1 }, u7a7a: { id: "u7a7a", name: "Japanese \u201Cvacancy\u201D Button", keywords: ["u7a7a", "vacancy", "kanji", "chinese", "empty", "sky", "blue", "square"], skins: [{ unified: "1f233", native: "\u{1F233}" }], version: 1 }, congratulations: { id: "congratulations", name: "Circled Ideograph Congratulation", keywords: ["congratulations", "japanese", "button", "chinese", "kanji", "red", "circle"], skins: [{ unified: "3297-fe0f", native: "\u3297\uFE0F" }], version: 1 }, secret: { id: "secret", name: "Circled Ideograph Secret", keywords: ["japanese", "button", "privacy", "chinese", "sshh", "kanji", "red", "circle"], skins: [{ unified: "3299-fe0f", native: "\u3299\uFE0F" }], version: 1 }, u55b6: { id: "u55b6", name: "Squared Cjk Unified Ideograph-55b6", keywords: ["u55b6", "japanese", "open", "for", "business", "button", "opening", "hours", "orange", "square"], skins: [{ unified: "1f23a", native: "\u{1F23A}" }], version: 1 }, u6e80: { id: "u6e80", name: "Japanese \u201Cno Vacancy\u201D Button", keywords: ["u6e80", "no", "vacancy", "full", "chinese", "red", "square", "kanji"], skins: [{ unified: "1f235", native: "\u{1F235}" }], version: 1 }, red_circle: { id: "red_circle", name: "Red Circle", keywords: ["shape", "error", "danger"], skins: [{ unified: "1f534", native: "\u{1F534}" }], version: 1 }, large_orange_circle: { id: "large_orange_circle", name: "Orange Circle", keywords: ["large", "round"], skins: [{ unified: "1f7e0", native: "\u{1F7E0}" }], version: 12 }, large_yellow_circle: { id: "large_yellow_circle", name: "Yellow Circle", keywords: ["large", "round"], skins: [{ unified: "1f7e1", native: "\u{1F7E1}" }], version: 12 }, large_green_circle: { id: "large_green_circle", name: "Green Circle", keywords: ["large", "round"], skins: [{ unified: "1f7e2", native: "\u{1F7E2}" }], version: 12 }, large_blue_circle: { id: "large_blue_circle", name: "Blue Circle", keywords: ["large", "shape", "icon", "button"], skins: [{ unified: "1f535", native: "\u{1F535}" }], version: 1 }, large_purple_circle: { id: "large_purple_circle", name: "Purple Circle", keywords: ["large", "round"], skins: [{ unified: "1f7e3", native: "\u{1F7E3}" }], version: 12 }, large_brown_circle: { id: "large_brown_circle", name: "Brown Circle", keywords: ["large", "round"], skins: [{ unified: "1f7e4", native: "\u{1F7E4}" }], version: 12 }, black_circle: { id: "black_circle", name: "Black Circle", keywords: ["shape", "button", "round"], skins: [{ unified: "26ab", native: "\u26AB" }], version: 1 }, white_circle: { id: "white_circle", name: "White Circle", keywords: ["shape", "round"], skins: [{ unified: "26aa", native: "\u26AA" }], version: 1 }, large_red_square: { id: "large_red_square", name: "Red Square", keywords: ["large"], skins: [{ unified: "1f7e5", native: "\u{1F7E5}" }], version: 12 }, large_orange_square: { id: "large_orange_square", name: "Orange Square", keywords: ["large"], skins: [{ unified: "1f7e7", native: "\u{1F7E7}" }], version: 12 }, large_yellow_square: { id: "large_yellow_square", name: "Yellow Square", keywords: ["large"], skins: [{ unified: "1f7e8", native: "\u{1F7E8}" }], version: 12 }, large_green_square: { id: "large_green_square", name: "Green Square", keywords: ["large"], skins: [{ unified: "1f7e9", native: "\u{1F7E9}" }], version: 12 }, large_blue_square: { id: "large_blue_square", name: "Blue Square", keywords: ["large"], skins: [{ unified: "1f7e6", native: "\u{1F7E6}" }], version: 12 }, large_purple_square: { id: "large_purple_square", name: "Purple Square", keywords: ["large"], skins: [{ unified: "1f7ea", native: "\u{1F7EA}" }], version: 12 }, large_brown_square: { id: "large_brown_square", name: "Brown Square", keywords: ["large"], skins: [{ unified: "1f7eb", native: "\u{1F7EB}" }], version: 12 }, black_large_square: { id: "black_large_square", name: "Black Large Square", keywords: ["shape", "icon", "button"], skins: [{ unified: "2b1b", native: "\u2B1B" }], version: 1 }, white_large_square: { id: "white_large_square", name: "White Large Square", keywords: ["shape", "icon", "stone", "button"], skins: [{ unified: "2b1c", native: "\u2B1C" }], version: 1 }, black_medium_square: { id: "black_medium_square", name: "Black Medium Square", keywords: ["shape", "button", "icon"], skins: [{ unified: "25fc-fe0f", native: "\u25FC\uFE0F" }], version: 1 }, white_medium_square: { id: "white_medium_square", name: "White Medium Square", keywords: ["shape", "stone", "icon"], skins: [{ unified: "25fb-fe0f", native: "\u25FB\uFE0F" }], version: 1 }, black_medium_small_square: { id: "black_medium_small_square", name: "Black Medium Small Square", keywords: ["icon", "shape", "button"], skins: [{ unified: "25fe", native: "\u25FE" }], version: 1 }, white_medium_small_square: { id: "white_medium_small_square", name: "White Medium Small Square", keywords: ["shape", "stone", "icon", "button"], skins: [{ unified: "25fd", native: "\u25FD" }], version: 1 }, black_small_square: { id: "black_small_square", name: "Black Small Square", keywords: ["shape", "icon"], skins: [{ unified: "25aa-fe0f", native: "\u25AA\uFE0F" }], version: 1 }, white_small_square: { id: "white_small_square", name: "White Small Square", keywords: ["shape", "icon"], skins: [{ unified: "25ab-fe0f", native: "\u25AB\uFE0F" }], version: 1 }, large_orange_diamond: { id: "large_orange_diamond", name: "Large Orange Diamond", keywords: ["shape", "jewel", "gem"], skins: [{ unified: "1f536", native: "\u{1F536}" }], version: 1 }, large_blue_diamond: { id: "large_blue_diamond", name: "Large Blue Diamond", keywords: ["shape", "jewel", "gem"], skins: [{ unified: "1f537", native: "\u{1F537}" }], version: 1 }, small_orange_diamond: { id: "small_orange_diamond", name: "Small Orange Diamond", keywords: ["shape", "jewel", "gem"], skins: [{ unified: "1f538", native: "\u{1F538}" }], version: 1 }, small_blue_diamond: { id: "small_blue_diamond", name: "Small Blue Diamond", keywords: ["shape", "jewel", "gem"], skins: [{ unified: "1f539", native: "\u{1F539}" }], version: 1 }, small_red_triangle: { id: "small_red_triangle", name: "Red Triangle Pointed Up", keywords: ["small", "shape", "direction", "top"], skins: [{ unified: "1f53a", native: "\u{1F53A}" }], version: 1 }, small_red_triangle_down: { id: "small_red_triangle_down", name: "Red Triangle Pointed Down", keywords: ["small", "shape", "direction", "bottom"], skins: [{ unified: "1f53b", native: "\u{1F53B}" }], version: 1 }, diamond_shape_with_a_dot_inside: { id: "diamond_shape_with_a_dot_inside", name: "Diamond with a Dot", keywords: ["shape", "inside", "jewel", "blue", "gem", "crystal", "fancy"], skins: [{ unified: "1f4a0", native: "\u{1F4A0}" }], version: 1 }, radio_button: { id: "radio_button", name: "Radio Button", keywords: ["input", "old", "music", "circle"], skins: [{ unified: "1f518", native: "\u{1F518}" }], version: 1 }, white_square_button: { id: "white_square_button", name: "White Square Button", keywords: ["shape", "input"], skins: [{ unified: "1f533", native: "\u{1F533}" }], version: 1 }, black_square_button: { id: "black_square_button", name: "Black Square Button", keywords: ["shape", "input", "frame"], skins: [{ unified: "1f532", native: "\u{1F532}" }], version: 1 }, checkered_flag: { id: "checkered_flag", name: "Chequered Flag", keywords: ["checkered", "contest", "finishline", "race", "gokart"], skins: [{ unified: "1f3c1", native: "\u{1F3C1}" }], version: 1 }, triangular_flag_on_post: { id: "triangular_flag_on_post", name: "Triangular Flag", keywords: ["on", "post", "mark", "milestone", "place"], skins: [{ unified: "1f6a9", native: "\u{1F6A9}" }], version: 1 }, crossed_flags: { id: "crossed_flags", name: "Crossed Flags", keywords: ["japanese", "nation", "country", "border"], skins: [{ unified: "1f38c", native: "\u{1F38C}" }], version: 1 }, waving_black_flag: { id: "waving_black_flag", name: "Black Flag", keywords: ["waving", "pirate"], skins: [{ unified: "1f3f4", native: "\u{1F3F4}" }], version: 1 }, waving_white_flag: { id: "waving_white_flag", name: "White Flag", keywords: ["waving", "losing", "loser", "lost", "surrender", "give", "up", "fail"], skins: [{ unified: "1f3f3-fe0f", native: "\u{1F3F3}\uFE0F" }], version: 1 }, "rainbow-flag": { id: "rainbow-flag", name: "Rainbow Flag", keywords: ["pride", "gay", "lgbt", "glbt", "queer", "homosexual", "lesbian", "bisexual", "transgender"], skins: [{ unified: "1f3f3-fe0f-200d-1f308", native: "\u{1F3F3}\uFE0F\u200D\u{1F308}" }], version: 4 }, transgender_flag: { id: "transgender_flag", name: "Transgender Flag", keywords: ["lgbtq"], skins: [{ unified: "1f3f3-fe0f-200d-26a7-fe0f", native: "\u{1F3F3}\uFE0F\u200D\u26A7\uFE0F" }], version: 13 }, pirate_flag: { id: "pirate_flag", name: "Pirate Flag", keywords: ["skull", "crossbones", "banner"], skins: [{ unified: "1f3f4-200d-2620-fe0f", native: "\u{1F3F4}\u200D\u2620\uFE0F" }], version: 11 }, "flag-ac": { id: "flag-ac", name: "Ascension Island Flag", keywords: ["ac"], skins: [{ unified: "1f1e6-1f1e8", native: "\u{1F1E6}\u{1F1E8}" }], version: 2 }, "flag-ad": { id: "flag-ad", name: "Andorra Flag", keywords: ["ad", "nation", "country", "banner"], skins: [{ unified: "1f1e6-1f1e9", native: "\u{1F1E6}\u{1F1E9}" }], version: 2 }, "flag-ae": { id: "flag-ae", name: "United Arab Emirates Flag", keywords: ["ae", "nation", "country", "banner"], skins: [{ unified: "1f1e6-1f1ea", native: "\u{1F1E6}\u{1F1EA}" }], version: 2 }, "flag-af": { id: "flag-af", name: "Afghanistan Flag", keywords: ["af", "nation", "country", "banner"], skins: [{ unified: "1f1e6-1f1eb", native: "\u{1F1E6}\u{1F1EB}" }], version: 2 }, "flag-ag": { id: "flag-ag", name: "Antigua & Barbuda Flag", keywords: ["ag", "nation", "country", "banner"], skins: [{ unified: "1f1e6-1f1ec", native: "\u{1F1E6}\u{1F1EC}" }], version: 2 }, "flag-ai": { id: "flag-ai", name: "Anguilla Flag", keywords: ["ai", "nation", "country", "banner"], skins: [{ unified: "1f1e6-1f1ee", native: "\u{1F1E6}\u{1F1EE}" }], version: 2 }, "flag-al": { id: "flag-al", name: "Albania Flag", keywords: ["al", "nation", "country", "banner"], skins: [{ unified: "1f1e6-1f1f1", native: "\u{1F1E6}\u{1F1F1}" }], version: 2 }, "flag-am": { id: "flag-am", name: "Armenia Flag", keywords: ["am", "nation", "country", "banner"], skins: [{ unified: "1f1e6-1f1f2", native: "\u{1F1E6}\u{1F1F2}" }], version: 2 }, "flag-ao": { id: "flag-ao", name: "Angola Flag", keywords: ["ao", "nation", "country", "banner"], skins: [{ unified: "1f1e6-1f1f4", native: "\u{1F1E6}\u{1F1F4}" }], version: 2 }, "flag-aq": { id: "flag-aq", name: "Antarctica Flag", keywords: ["aq", "nation", "country", "banner"], skins: [{ unified: "1f1e6-1f1f6", native: "\u{1F1E6}\u{1F1F6}" }], version: 2 }, "flag-ar": { id: "flag-ar", name: "Argentina Flag", keywords: ["ar", "nation", "country", "banner"], skins: [{ unified: "1f1e6-1f1f7", native: "\u{1F1E6}\u{1F1F7}" }], version: 2 }, "flag-as": { id: "flag-as", name: "American Samoa Flag", keywords: ["as", "ws", "nation", "country", "banner"], skins: [{ unified: "1f1e6-1f1f8", native: "\u{1F1E6}\u{1F1F8}" }], version: 2 }, "flag-at": { id: "flag-at", name: "Austria Flag", keywords: ["at", "nation", "country", "banner"], skins: [{ unified: "1f1e6-1f1f9", native: "\u{1F1E6}\u{1F1F9}" }], version: 2 }, "flag-au": { id: "flag-au", name: "Australia Flag", keywords: ["au", "nation", "country", "banner"], skins: [{ unified: "1f1e6-1f1fa", native: "\u{1F1E6}\u{1F1FA}" }], version: 2 }, "flag-aw": { id: "flag-aw", name: "Aruba Flag", keywords: ["aw", "nation", "country", "banner"], skins: [{ unified: "1f1e6-1f1fc", native: "\u{1F1E6}\u{1F1FC}" }], version: 2 }, "flag-ax": { id: "flag-ax", name: "\xC5land Islands Flag", keywords: ["ax", "aland", "Aland", "nation", "country", "banner"], skins: [{ unified: "1f1e6-1f1fd", native: "\u{1F1E6}\u{1F1FD}" }], version: 2 }, "flag-az": { id: "flag-az", name: "Azerbaijan Flag", keywords: ["az", "nation", "country", "banner"], skins: [{ unified: "1f1e6-1f1ff", native: "\u{1F1E6}\u{1F1FF}" }], version: 2 }, "flag-ba": { id: "flag-ba", name: "Bosnia & Herzegovina Flag", keywords: ["ba", "nation", "country", "banner"], skins: [{ unified: "1f1e7-1f1e6", native: "\u{1F1E7}\u{1F1E6}" }], version: 2 }, "flag-bb": { id: "flag-bb", name: "Barbados Flag", keywords: ["bb", "nation", "country", "banner"], skins: [{ unified: "1f1e7-1f1e7", native: "\u{1F1E7}\u{1F1E7}" }], version: 2 }, "flag-bd": { id: "flag-bd", name: "Bangladesh Flag", keywords: ["bd", "nation", "country", "banner"], skins: [{ unified: "1f1e7-1f1e9", native: "\u{1F1E7}\u{1F1E9}" }], version: 2 }, "flag-be": { id: "flag-be", name: "Belgium Flag", keywords: ["be", "nation", "country", "banner"], skins: [{ unified: "1f1e7-1f1ea", native: "\u{1F1E7}\u{1F1EA}" }], version: 2 }, "flag-bf": { id: "flag-bf", name: "Burkina Faso Flag", keywords: ["bf", "nation", "country", "banner"], skins: [{ unified: "1f1e7-1f1eb", native: "\u{1F1E7}\u{1F1EB}" }], version: 2 }, "flag-bg": { id: "flag-bg", name: "Bulgaria Flag", keywords: ["bg", "nation", "country", "banner"], skins: [{ unified: "1f1e7-1f1ec", native: "\u{1F1E7}\u{1F1EC}" }], version: 2 }, "flag-bh": { id: "flag-bh", name: "Bahrain Flag", keywords: ["bh", "nation", "country", "banner"], skins: [{ unified: "1f1e7-1f1ed", native: "\u{1F1E7}\u{1F1ED}" }], version: 2 }, "flag-bi": { id: "flag-bi", name: "Burundi Flag", keywords: ["bi", "nation", "country", "banner"], skins: [{ unified: "1f1e7-1f1ee", native: "\u{1F1E7}\u{1F1EE}" }], version: 2 }, "flag-bj": { id: "flag-bj", name: "Benin Flag", keywords: ["bj", "nation", "country", "banner"], skins: [{ unified: "1f1e7-1f1ef", native: "\u{1F1E7}\u{1F1EF}" }], version: 2 }, "flag-bl": { id: "flag-bl", name: "St. Barth\xE9lemy Flag", keywords: ["bl", "st", "barthelemy", "saint", "nation", "country", "banner"], skins: [{ unified: "1f1e7-1f1f1", native: "\u{1F1E7}\u{1F1F1}" }], version: 2 }, "flag-bm": { id: "flag-bm", name: "Bermuda Flag", keywords: ["bm", "nation", "country", "banner"], skins: [{ unified: "1f1e7-1f1f2", native: "\u{1F1E7}\u{1F1F2}" }], version: 2 }, "flag-bn": { id: "flag-bn", name: "Brunei Flag", keywords: ["bn", "darussalam", "nation", "country", "banner"], skins: [{ unified: "1f1e7-1f1f3", native: "\u{1F1E7}\u{1F1F3}" }], version: 2 }, "flag-bo": { id: "flag-bo", name: "Bolivia Flag", keywords: ["bo", "nation", "country", "banner"], skins: [{ unified: "1f1e7-1f1f4", native: "\u{1F1E7}\u{1F1F4}" }], version: 2 }, "flag-bq": { id: "flag-bq", name: "Caribbean Netherlands Flag", keywords: ["bq", "bonaire", "nation", "country", "banner"], skins: [{ unified: "1f1e7-1f1f6", native: "\u{1F1E7}\u{1F1F6}" }], version: 2 }, "flag-br": { id: "flag-br", name: "Brazil Flag", keywords: ["br", "nation", "country", "banner"], skins: [{ unified: "1f1e7-1f1f7", native: "\u{1F1E7}\u{1F1F7}" }], version: 2 }, "flag-bs": { id: "flag-bs", name: "Bahamas Flag", keywords: ["bs", "nation", "country", "banner"], skins: [{ unified: "1f1e7-1f1f8", native: "\u{1F1E7}\u{1F1F8}" }], version: 2 }, "flag-bt": { id: "flag-bt", name: "Bhutan Flag", keywords: ["bt", "nation", "country", "banner"], skins: [{ unified: "1f1e7-1f1f9", native: "\u{1F1E7}\u{1F1F9}" }], version: 2 }, "flag-bv": { id: "flag-bv", name: "Bouvet Island Flag", keywords: ["bv", "norway"], skins: [{ unified: "1f1e7-1f1fb", native: "\u{1F1E7}\u{1F1FB}" }], version: 2 }, "flag-bw": { id: "flag-bw", name: "Botswana Flag", keywords: ["bw", "nation", "country", "banner"], skins: [{ unified: "1f1e7-1f1fc", native: "\u{1F1E7}\u{1F1FC}" }], version: 2 }, "flag-by": { id: "flag-by", name: "Belarus Flag", keywords: ["by", "nation", "country", "banner"], skins: [{ unified: "1f1e7-1f1fe", native: "\u{1F1E7}\u{1F1FE}" }], version: 2 }, "flag-bz": { id: "flag-bz", name: "Belize Flag", keywords: ["bz", "nation", "country", "banner"], skins: [{ unified: "1f1e7-1f1ff", native: "\u{1F1E7}\u{1F1FF}" }], version: 2 }, "flag-ca": { id: "flag-ca", name: "Canada Flag", keywords: ["ca", "nation", "country", "banner"], skins: [{ unified: "1f1e8-1f1e6", native: "\u{1F1E8}\u{1F1E6}" }], version: 2 }, "flag-cc": { id: "flag-cc", name: "Cocos (keeling) Islands Flag", keywords: ["cc", "keeling", "nation", "country", "banner"], skins: [{ unified: "1f1e8-1f1e8", native: "\u{1F1E8}\u{1F1E8}" }], version: 2 }, "flag-cd": { id: "flag-cd", name: "Congo - Kinshasa Flag", keywords: ["cd", "democratic", "republic", "nation", "country", "banner"], skins: [{ unified: "1f1e8-1f1e9", native: "\u{1F1E8}\u{1F1E9}" }], version: 2 }, "flag-cf": { id: "flag-cf", name: "Central African Republic Flag", keywords: ["cf", "nation", "country", "banner"], skins: [{ unified: "1f1e8-1f1eb", native: "\u{1F1E8}\u{1F1EB}" }], version: 2 }, "flag-cg": { id: "flag-cg", name: "Congo - Brazzaville Flag", keywords: ["cg", "nation", "country", "banner"], skins: [{ unified: "1f1e8-1f1ec", native: "\u{1F1E8}\u{1F1EC}" }], version: 2 }, "flag-ch": { id: "flag-ch", name: "Switzerland Flag", keywords: ["ch", "nation", "country", "banner"], skins: [{ unified: "1f1e8-1f1ed", native: "\u{1F1E8}\u{1F1ED}" }], version: 2 }, "flag-ci": { id: "flag-ci", name: "C\xF4te D\u2019ivoire Flag", keywords: ["ci", "cote", "d", "ivoire", "ivory", "coast", "nation", "country", "banner"], skins: [{ unified: "1f1e8-1f1ee", native: "\u{1F1E8}\u{1F1EE}" }], version: 2 }, "flag-ck": { id: "flag-ck", name: "Cook Islands Flag", keywords: ["ck", "nation", "country", "banner"], skins: [{ unified: "1f1e8-1f1f0", native: "\u{1F1E8}\u{1F1F0}" }], version: 2 }, "flag-cl": { id: "flag-cl", name: "Chile Flag", keywords: ["cl", "nation", "country", "banner"], skins: [{ unified: "1f1e8-1f1f1", native: "\u{1F1E8}\u{1F1F1}" }], version: 2 }, "flag-cm": { id: "flag-cm", name: "Cameroon Flag", keywords: ["cm", "nation", "country", "banner"], skins: [{ unified: "1f1e8-1f1f2", native: "\u{1F1E8}\u{1F1F2}" }], version: 2 }, cn: { id: "cn", name: "China Flag", keywords: ["cn", "chinese", "prc", "country", "nation", "banner"], skins: [{ unified: "1f1e8-1f1f3", native: "\u{1F1E8}\u{1F1F3}" }], version: 1 }, "flag-co": { id: "flag-co", name: "Colombia Flag", keywords: ["co", "nation", "country", "banner"], skins: [{ unified: "1f1e8-1f1f4", native: "\u{1F1E8}\u{1F1F4}" }], version: 2 }, "flag-cp": { id: "flag-cp", name: "Clipperton Island Flag", keywords: ["cp"], skins: [{ unified: "1f1e8-1f1f5", native: "\u{1F1E8}\u{1F1F5}" }], version: 2 }, "flag-cr": { id: "flag-cr", name: "Costa Rica Flag", keywords: ["cr", "nation", "country", "banner"], skins: [{ unified: "1f1e8-1f1f7", native: "\u{1F1E8}\u{1F1F7}" }], version: 2 }, "flag-cu": { id: "flag-cu", name: "Cuba Flag", keywords: ["cu", "nation", "country", "banner"], skins: [{ unified: "1f1e8-1f1fa", native: "\u{1F1E8}\u{1F1FA}" }], version: 2 }, "flag-cv": { id: "flag-cv", name: "Cape Verde Flag", keywords: ["cv", "cabo", "nation", "country", "banner"], skins: [{ unified: "1f1e8-1f1fb", native: "\u{1F1E8}\u{1F1FB}" }], version: 2 }, "flag-cw": { id: "flag-cw", name: "Cura\xE7ao Flag", keywords: ["cw", "curacao", "nation", "country", "banner"], skins: [{ unified: "1f1e8-1f1fc", native: "\u{1F1E8}\u{1F1FC}" }], version: 2 }, "flag-cx": { id: "flag-cx", name: "Christmas Island Flag", keywords: ["cx", "nation", "country", "banner"], skins: [{ unified: "1f1e8-1f1fd", native: "\u{1F1E8}\u{1F1FD}" }], version: 2 }, "flag-cy": { id: "flag-cy", name: "Cyprus Flag", keywords: ["cy", "nation", "country", "banner"], skins: [{ unified: "1f1e8-1f1fe", native: "\u{1F1E8}\u{1F1FE}" }], version: 2 }, "flag-cz": { id: "flag-cz", name: "Czechia Flag", keywords: ["cz", "nation", "country", "banner"], skins: [{ unified: "1f1e8-1f1ff", native: "\u{1F1E8}\u{1F1FF}" }], version: 2 }, de: { id: "de", name: "Germany Flag", keywords: ["de", "german", "nation", "country", "banner"], skins: [{ unified: "1f1e9-1f1ea", native: "\u{1F1E9}\u{1F1EA}" }], version: 1 }, "flag-dg": { id: "flag-dg", name: "Diego Garcia Flag", keywords: ["dg"], skins: [{ unified: "1f1e9-1f1ec", native: "\u{1F1E9}\u{1F1EC}" }], version: 2 }, "flag-dj": { id: "flag-dj", name: "Djibouti Flag", keywords: ["dj", "nation", "country", "banner"], skins: [{ unified: "1f1e9-1f1ef", native: "\u{1F1E9}\u{1F1EF}" }], version: 2 }, "flag-dk": { id: "flag-dk", name: "Denmark Flag", keywords: ["dk", "nation", "country", "banner"], skins: [{ unified: "1f1e9-1f1f0", native: "\u{1F1E9}\u{1F1F0}" }], version: 2 }, "flag-dm": { id: "flag-dm", name: "Dominica Flag", keywords: ["dm", "nation", "country", "banner"], skins: [{ unified: "1f1e9-1f1f2", native: "\u{1F1E9}\u{1F1F2}" }], version: 2 }, "flag-do": { id: "flag-do", name: "Dominican Republic Flag", keywords: ["do", "nation", "country", "banner"], skins: [{ unified: "1f1e9-1f1f4", native: "\u{1F1E9}\u{1F1F4}" }], version: 2 }, "flag-dz": { id: "flag-dz", name: "Algeria Flag", keywords: ["dz", "nation", "country", "banner"], skins: [{ unified: "1f1e9-1f1ff", native: "\u{1F1E9}\u{1F1FF}" }], version: 2 }, "flag-ea": { id: "flag-ea", name: "Ceuta & Melilla Flag", keywords: ["ea"], skins: [{ unified: "1f1ea-1f1e6", native: "\u{1F1EA}\u{1F1E6}" }], version: 2 }, "flag-ec": { id: "flag-ec", name: "Ecuador Flag", keywords: ["ec", "nation", "country", "banner"], skins: [{ unified: "1f1ea-1f1e8", native: "\u{1F1EA}\u{1F1E8}" }], version: 2 }, "flag-ee": { id: "flag-ee", name: "Estonia Flag", keywords: ["ee", "nation", "country", "banner"], skins: [{ unified: "1f1ea-1f1ea", native: "\u{1F1EA}\u{1F1EA}" }], version: 2 }, "flag-eg": { id: "flag-eg", name: "Egypt Flag", keywords: ["eg", "nation", "country", "banner"], skins: [{ unified: "1f1ea-1f1ec", native: "\u{1F1EA}\u{1F1EC}" }], version: 2 }, "flag-eh": { id: "flag-eh", name: "Western Sahara Flag", keywords: ["eh", "nation", "country", "banner"], skins: [{ unified: "1f1ea-1f1ed", native: "\u{1F1EA}\u{1F1ED}" }], version: 2 }, "flag-er": { id: "flag-er", name: "Eritrea Flag", keywords: ["er", "nation", "country", "banner"], skins: [{ unified: "1f1ea-1f1f7", native: "\u{1F1EA}\u{1F1F7}" }], version: 2 }, es: { id: "es", name: "Spain Flag", keywords: ["es", "nation", "country", "banner"], skins: [{ unified: "1f1ea-1f1f8", native: "\u{1F1EA}\u{1F1F8}" }], version: 1 }, "flag-et": { id: "flag-et", name: "Ethiopia Flag", keywords: ["et", "nation", "country", "banner"], skins: [{ unified: "1f1ea-1f1f9", native: "\u{1F1EA}\u{1F1F9}" }], version: 2 }, "flag-eu": { id: "flag-eu", name: "European Union Flag", keywords: ["eu", "banner"], skins: [{ unified: "1f1ea-1f1fa", native: "\u{1F1EA}\u{1F1FA}" }], version: 2 }, "flag-fi": { id: "flag-fi", name: "Finland Flag", keywords: ["fi", "nation", "country", "banner"], skins: [{ unified: "1f1eb-1f1ee", native: "\u{1F1EB}\u{1F1EE}" }], version: 2 }, "flag-fj": { id: "flag-fj", name: "Fiji Flag", keywords: ["fj", "nation", "country", "banner"], skins: [{ unified: "1f1eb-1f1ef", native: "\u{1F1EB}\u{1F1EF}" }], version: 2 }, "flag-fk": { id: "flag-fk", name: "Falkland Islands Flag", keywords: ["fk", "malvinas", "nation", "country", "banner"], skins: [{ unified: "1f1eb-1f1f0", native: "\u{1F1EB}\u{1F1F0}" }], version: 2 }, "flag-fm": { id: "flag-fm", name: "Micronesia Flag", keywords: ["fm", "federated", "states", "nation", "country", "banner"], skins: [{ unified: "1f1eb-1f1f2", native: "\u{1F1EB}\u{1F1F2}" }], version: 2 }, "flag-fo": { id: "flag-fo", name: "Faroe Islands Flag", keywords: ["fo", "nation", "country", "banner"], skins: [{ unified: "1f1eb-1f1f4", native: "\u{1F1EB}\u{1F1F4}" }], version: 2 }, fr: { id: "fr", name: "France Flag", keywords: ["fr", "banner", "nation", "french", "country"], skins: [{ unified: "1f1eb-1f1f7", native: "\u{1F1EB}\u{1F1F7}" }], version: 1 }, "flag-ga": { id: "flag-ga", name: "Gabon Flag", keywords: ["ga", "nation", "country", "banner"], skins: [{ unified: "1f1ec-1f1e6", native: "\u{1F1EC}\u{1F1E6}" }], version: 2 }, gb: { id: "gb", name: "United Kingdom Flag", keywords: ["gb", "uk", "great", "britain", "northern", "ireland", "nation", "country", "banner", "british", "UK", "english", "england", "union", "jack"], skins: [{ unified: "1f1ec-1f1e7", native: "\u{1F1EC}\u{1F1E7}" }], version: 1 }, "flag-gd": { id: "flag-gd", name: "Grenada Flag", keywords: ["gd", "nation", "country", "banner"], skins: [{ unified: "1f1ec-1f1e9", native: "\u{1F1EC}\u{1F1E9}" }], version: 2 }, "flag-ge": { id: "flag-ge", name: "Georgia Flag", keywords: ["ge", "nation", "country", "banner"], skins: [{ unified: "1f1ec-1f1ea", native: "\u{1F1EC}\u{1F1EA}" }], version: 2 }, "flag-gf": { id: "flag-gf", name: "French Guiana Flag", keywords: ["gf", "nation", "country", "banner"], skins: [{ unified: "1f1ec-1f1eb", native: "\u{1F1EC}\u{1F1EB}" }], version: 2 }, "flag-gg": { id: "flag-gg", name: "Guernsey Flag", keywords: ["gg", "nation", "country", "banner"], skins: [{ unified: "1f1ec-1f1ec", native: "\u{1F1EC}\u{1F1EC}" }], version: 2 }, "flag-gh": { id: "flag-gh", name: "Ghana Flag", keywords: ["gh", "nation", "country", "banner"], skins: [{ unified: "1f1ec-1f1ed", native: "\u{1F1EC}\u{1F1ED}" }], version: 2 }, "flag-gi": { id: "flag-gi", name: "Gibraltar Flag", keywords: ["gi", "nation", "country", "banner"], skins: [{ unified: "1f1ec-1f1ee", native: "\u{1F1EC}\u{1F1EE}" }], version: 2 }, "flag-gl": { id: "flag-gl", name: "Greenland Flag", keywords: ["gl", "nation", "country", "banner"], skins: [{ unified: "1f1ec-1f1f1", native: "\u{1F1EC}\u{1F1F1}" }], version: 2 }, "flag-gm": { id: "flag-gm", name: "Gambia Flag", keywords: ["gm", "nation", "country", "banner"], skins: [{ unified: "1f1ec-1f1f2", native: "\u{1F1EC}\u{1F1F2}" }], version: 2 }, "flag-gn": { id: "flag-gn", name: "Guinea Flag", keywords: ["gn", "nation", "country", "banner"], skins: [{ unified: "1f1ec-1f1f3", native: "\u{1F1EC}\u{1F1F3}" }], version: 2 }, "flag-gp": { id: "flag-gp", name: "Guadeloupe Flag", keywords: ["gp", "nation", "country", "banner"], skins: [{ unified: "1f1ec-1f1f5", native: "\u{1F1EC}\u{1F1F5}" }], version: 2 }, "flag-gq": { id: "flag-gq", name: "Equatorial Guinea Flag", keywords: ["gq", "gn", "nation", "country", "banner"], skins: [{ unified: "1f1ec-1f1f6", native: "\u{1F1EC}\u{1F1F6}" }], version: 2 }, "flag-gr": { id: "flag-gr", name: "Greece Flag", keywords: ["gr", "nation", "country", "banner"], skins: [{ unified: "1f1ec-1f1f7", native: "\u{1F1EC}\u{1F1F7}" }], version: 2 }, "flag-gs": { id: "flag-gs", name: "South Georgia & South Sandwich Islands Flag", keywords: ["gs", "nation", "country", "banner"], skins: [{ unified: "1f1ec-1f1f8", native: "\u{1F1EC}\u{1F1F8}" }], version: 2 }, "flag-gt": { id: "flag-gt", name: "Guatemala Flag", keywords: ["gt", "nation", "country", "banner"], skins: [{ unified: "1f1ec-1f1f9", native: "\u{1F1EC}\u{1F1F9}" }], version: 2 }, "flag-gu": { id: "flag-gu", name: "Guam Flag", keywords: ["gu", "nation", "country", "banner"], skins: [{ unified: "1f1ec-1f1fa", native: "\u{1F1EC}\u{1F1FA}" }], version: 2 }, "flag-gw": { id: "flag-gw", name: "Guinea-Bissau Flag", keywords: ["gw", "guinea", "bissau", "nation", "country", "banner"], skins: [{ unified: "1f1ec-1f1fc", native: "\u{1F1EC}\u{1F1FC}" }], version: 2 }, "flag-gy": { id: "flag-gy", name: "Guyana Flag", keywords: ["gy", "nation", "country", "banner"], skins: [{ unified: "1f1ec-1f1fe", native: "\u{1F1EC}\u{1F1FE}" }], version: 2 }, "flag-hk": { id: "flag-hk", name: "Hong Kong Sar China Flag", keywords: ["hk", "nation", "country", "banner"], skins: [{ unified: "1f1ed-1f1f0", native: "\u{1F1ED}\u{1F1F0}" }], version: 2 }, "flag-hm": { id: "flag-hm", name: "Heard & Mcdonald Islands Flag", keywords: ["hm"], skins: [{ unified: "1f1ed-1f1f2", native: "\u{1F1ED}\u{1F1F2}" }], version: 2 }, "flag-hn": { id: "flag-hn", name: "Honduras Flag", keywords: ["hn", "nation", "country", "banner"], skins: [{ unified: "1f1ed-1f1f3", native: "\u{1F1ED}\u{1F1F3}" }], version: 2 }, "flag-hr": { id: "flag-hr", name: "Croatia Flag", keywords: ["hr", "nation", "country", "banner"], skins: [{ unified: "1f1ed-1f1f7", native: "\u{1F1ED}\u{1F1F7}" }], version: 2 }, "flag-ht": { id: "flag-ht", name: "Haiti Flag", keywords: ["ht", "nation", "country", "banner"], skins: [{ unified: "1f1ed-1f1f9", native: "\u{1F1ED}\u{1F1F9}" }], version: 2 }, "flag-hu": { id: "flag-hu", name: "Hungary Flag", keywords: ["hu", "nation", "country", "banner"], skins: [{ unified: "1f1ed-1f1fa", native: "\u{1F1ED}\u{1F1FA}" }], version: 2 }, "flag-ic": { id: "flag-ic", name: "Canary Islands Flag", keywords: ["ic", "nation", "country", "banner"], skins: [{ unified: "1f1ee-1f1e8", native: "\u{1F1EE}\u{1F1E8}" }], version: 2 }, "flag-id": { id: "flag-id", name: "Indonesia Flag", keywords: ["id", "nation", "country", "banner"], skins: [{ unified: "1f1ee-1f1e9", native: "\u{1F1EE}\u{1F1E9}" }], version: 2 }, "flag-ie": { id: "flag-ie", name: "Ireland Flag", keywords: ["ie", "nation", "country", "banner"], skins: [{ unified: "1f1ee-1f1ea", native: "\u{1F1EE}\u{1F1EA}" }], version: 2 }, "flag-il": { id: "flag-il", name: "Israel Flag", keywords: ["il", "nation", "country", "banner"], skins: [{ unified: "1f1ee-1f1f1", native: "\u{1F1EE}\u{1F1F1}" }], version: 2 }, "flag-im": { id: "flag-im", name: "Isle of Man Flag", keywords: ["im", "nation", "country", "banner"], skins: [{ unified: "1f1ee-1f1f2", native: "\u{1F1EE}\u{1F1F2}" }], version: 2 }, "flag-in": { id: "flag-in", name: "India Flag", keywords: ["in", "nation", "country", "banner"], skins: [{ unified: "1f1ee-1f1f3", native: "\u{1F1EE}\u{1F1F3}" }], version: 2 }, "flag-io": { id: "flag-io", name: "British Indian Ocean Territory Flag", keywords: ["io", "nation", "country", "banner"], skins: [{ unified: "1f1ee-1f1f4", native: "\u{1F1EE}\u{1F1F4}" }], version: 2 }, "flag-iq": { id: "flag-iq", name: "Iraq Flag", keywords: ["iq", "nation", "country", "banner"], skins: [{ unified: "1f1ee-1f1f6", native: "\u{1F1EE}\u{1F1F6}" }], version: 2 }, "flag-ir": { id: "flag-ir", name: "Iran Flag", keywords: ["ir", "islamic", "republic", "nation", "country", "banner"], skins: [{ unified: "1f1ee-1f1f7", native: "\u{1F1EE}\u{1F1F7}" }], version: 2 }, "flag-is": { id: "flag-is", name: "Iceland Flag", keywords: ["is", "nation", "country", "banner"], skins: [{ unified: "1f1ee-1f1f8", native: "\u{1F1EE}\u{1F1F8}" }], version: 2 }, it: { id: "it", name: "Italy Flag", keywords: ["it", "nation", "country", "banner"], skins: [{ unified: "1f1ee-1f1f9", native: "\u{1F1EE}\u{1F1F9}" }], version: 1 }, "flag-je": { id: "flag-je", name: "Jersey Flag", keywords: ["je", "nation", "country", "banner"], skins: [{ unified: "1f1ef-1f1ea", native: "\u{1F1EF}\u{1F1EA}" }], version: 2 }, "flag-jm": { id: "flag-jm", name: "Jamaica Flag", keywords: ["jm", "nation", "country", "banner"], skins: [{ unified: "1f1ef-1f1f2", native: "\u{1F1EF}\u{1F1F2}" }], version: 2 }, "flag-jo": { id: "flag-jo", name: "Jordan Flag", keywords: ["jo", "nation", "country", "banner"], skins: [{ unified: "1f1ef-1f1f4", native: "\u{1F1EF}\u{1F1F4}" }], version: 2 }, jp: { id: "jp", name: "Japan Flag", keywords: ["jp", "japanese", "nation", "country", "banner"], skins: [{ unified: "1f1ef-1f1f5", native: "\u{1F1EF}\u{1F1F5}" }], version: 1 }, "flag-ke": { id: "flag-ke", name: "Kenya Flag", keywords: ["ke", "nation", "country", "banner"], skins: [{ unified: "1f1f0-1f1ea", native: "\u{1F1F0}\u{1F1EA}" }], version: 2 }, "flag-kg": { id: "flag-kg", name: "Kyrgyzstan Flag", keywords: ["kg", "nation", "country", "banner"], skins: [{ unified: "1f1f0-1f1ec", native: "\u{1F1F0}\u{1F1EC}" }], version: 2 }, "flag-kh": { id: "flag-kh", name: "Cambodia Flag", keywords: ["kh", "nation", "country", "banner"], skins: [{ unified: "1f1f0-1f1ed", native: "\u{1F1F0}\u{1F1ED}" }], version: 2 }, "flag-ki": { id: "flag-ki", name: "Kiribati Flag", keywords: ["ki", "nation", "country", "banner"], skins: [{ unified: "1f1f0-1f1ee", native: "\u{1F1F0}\u{1F1EE}" }], version: 2 }, "flag-km": { id: "flag-km", name: "Comoros Flag", keywords: ["km", "nation", "country", "banner"], skins: [{ unified: "1f1f0-1f1f2", native: "\u{1F1F0}\u{1F1F2}" }], version: 2 }, "flag-kn": { id: "flag-kn", name: "St. Kitts & Nevis Flag", keywords: ["kn", "st", "saint", "nation", "country", "banner"], skins: [{ unified: "1f1f0-1f1f3", native: "\u{1F1F0}\u{1F1F3}" }], version: 2 }, "flag-kp": { id: "flag-kp", name: "North Korea Flag", keywords: ["kp", "nation", "country", "banner"], skins: [{ unified: "1f1f0-1f1f5", native: "\u{1F1F0}\u{1F1F5}" }], version: 2 }, kr: { id: "kr", name: "South Korea Flag", keywords: ["kr", "nation", "country", "banner"], skins: [{ unified: "1f1f0-1f1f7", native: "\u{1F1F0}\u{1F1F7}" }], version: 1 }, "flag-kw": { id: "flag-kw", name: "Kuwait Flag", keywords: ["kw", "nation", "country", "banner"], skins: [{ unified: "1f1f0-1f1fc", native: "\u{1F1F0}\u{1F1FC}" }], version: 2 }, "flag-ky": { id: "flag-ky", name: "Cayman Islands Flag", keywords: ["ky", "nation", "country", "banner"], skins: [{ unified: "1f1f0-1f1fe", native: "\u{1F1F0}\u{1F1FE}" }], version: 2 }, "flag-kz": { id: "flag-kz", name: "Kazakhstan Flag", keywords: ["kz", "nation", "country", "banner"], skins: [{ unified: "1f1f0-1f1ff", native: "\u{1F1F0}\u{1F1FF}" }], version: 2 }, "flag-la": { id: "flag-la", name: "Laos Flag", keywords: ["la", "lao", "democratic", "republic", "nation", "country", "banner"], skins: [{ unified: "1f1f1-1f1e6", native: "\u{1F1F1}\u{1F1E6}" }], version: 2 }, "flag-lb": { id: "flag-lb", name: "Lebanon Flag", keywords: ["lb", "nation", "country", "banner"], skins: [{ unified: "1f1f1-1f1e7", native: "\u{1F1F1}\u{1F1E7}" }], version: 2 }, "flag-lc": { id: "flag-lc", name: "St. Lucia Flag", keywords: ["lc", "st", "saint", "nation", "country", "banner"], skins: [{ unified: "1f1f1-1f1e8", native: "\u{1F1F1}\u{1F1E8}" }], version: 2 }, "flag-li": { id: "flag-li", name: "Liechtenstein Flag", keywords: ["li", "nation", "country", "banner"], skins: [{ unified: "1f1f1-1f1ee", native: "\u{1F1F1}\u{1F1EE}" }], version: 2 }, "flag-lk": { id: "flag-lk", name: "Sri Lanka Flag", keywords: ["lk", "nation", "country", "banner"], skins: [{ unified: "1f1f1-1f1f0", native: "\u{1F1F1}\u{1F1F0}" }], version: 2 }, "flag-lr": { id: "flag-lr", name: "Liberia Flag", keywords: ["lr", "nation", "country", "banner"], skins: [{ unified: "1f1f1-1f1f7", native: "\u{1F1F1}\u{1F1F7}" }], version: 2 }, "flag-ls": { id: "flag-ls", name: "Lesotho Flag", keywords: ["ls", "nation", "country", "banner"], skins: [{ unified: "1f1f1-1f1f8", native: "\u{1F1F1}\u{1F1F8}" }], version: 2 }, "flag-lt": { id: "flag-lt", name: "Lithuania Flag", keywords: ["lt", "nation", "country", "banner"], skins: [{ unified: "1f1f1-1f1f9", native: "\u{1F1F1}\u{1F1F9}" }], version: 2 }, "flag-lu": { id: "flag-lu", name: "Luxembourg Flag", keywords: ["lu", "nation", "country", "banner"], skins: [{ unified: "1f1f1-1f1fa", native: "\u{1F1F1}\u{1F1FA}" }], version: 2 }, "flag-lv": { id: "flag-lv", name: "Latvia Flag", keywords: ["lv", "nation", "country", "banner"], skins: [{ unified: "1f1f1-1f1fb", native: "\u{1F1F1}\u{1F1FB}" }], version: 2 }, "flag-ly": { id: "flag-ly", name: "Libya Flag", keywords: ["ly", "nation", "country", "banner"], skins: [{ unified: "1f1f1-1f1fe", native: "\u{1F1F1}\u{1F1FE}" }], version: 2 }, "flag-ma": { id: "flag-ma", name: "Morocco Flag", keywords: ["ma", "nation", "country", "banner"], skins: [{ unified: "1f1f2-1f1e6", native: "\u{1F1F2}\u{1F1E6}" }], version: 2 }, "flag-mc": { id: "flag-mc", name: "Monaco Flag", keywords: ["mc", "nation", "country", "banner"], skins: [{ unified: "1f1f2-1f1e8", native: "\u{1F1F2}\u{1F1E8}" }], version: 2 }, "flag-md": { id: "flag-md", name: "Moldova Flag", keywords: ["md", "republic", "nation", "country", "banner"], skins: [{ unified: "1f1f2-1f1e9", native: "\u{1F1F2}\u{1F1E9}" }], version: 2 }, "flag-me": { id: "flag-me", name: "Montenegro Flag", keywords: ["me", "nation", "country", "banner"], skins: [{ unified: "1f1f2-1f1ea", native: "\u{1F1F2}\u{1F1EA}" }], version: 2 }, "flag-mf": { id: "flag-mf", name: "St. Martin Flag", keywords: ["mf", "st"], skins: [{ unified: "1f1f2-1f1eb", native: "\u{1F1F2}\u{1F1EB}" }], version: 2 }, "flag-mg": { id: "flag-mg", name: "Madagascar Flag", keywords: ["mg", "nation", "country", "banner"], skins: [{ unified: "1f1f2-1f1ec", native: "\u{1F1F2}\u{1F1EC}" }], version: 2 }, "flag-mh": { id: "flag-mh", name: "Marshall Islands Flag", keywords: ["mh", "nation", "country", "banner"], skins: [{ unified: "1f1f2-1f1ed", native: "\u{1F1F2}\u{1F1ED}" }], version: 2 }, "flag-mk": { id: "flag-mk", name: "North Macedonia Flag", keywords: ["mk", "nation", "country", "banner"], skins: [{ unified: "1f1f2-1f1f0", native: "\u{1F1F2}\u{1F1F0}" }], version: 2 }, "flag-ml": { id: "flag-ml", name: "Mali Flag", keywords: ["ml", "nation", "country", "banner"], skins: [{ unified: "1f1f2-1f1f1", native: "\u{1F1F2}\u{1F1F1}" }], version: 2 }, "flag-mm": { id: "flag-mm", name: "Myanmar (burma) Flag", keywords: ["mm", "nation", "country", "banner"], skins: [{ unified: "1f1f2-1f1f2", native: "\u{1F1F2}\u{1F1F2}" }], version: 2 }, "flag-mn": { id: "flag-mn", name: "Mongolia Flag", keywords: ["mn", "nation", "country", "banner"], skins: [{ unified: "1f1f2-1f1f3", native: "\u{1F1F2}\u{1F1F3}" }], version: 2 }, "flag-mo": { id: "flag-mo", name: "Macao Sar China Flag", keywords: ["mo", "nation", "country", "banner"], skins: [{ unified: "1f1f2-1f1f4", native: "\u{1F1F2}\u{1F1F4}" }], version: 2 }, "flag-mp": { id: "flag-mp", name: "Northern Mariana Islands Flag", keywords: ["mp", "nation", "country", "banner"], skins: [{ unified: "1f1f2-1f1f5", native: "\u{1F1F2}\u{1F1F5}" }], version: 2 }, "flag-mq": { id: "flag-mq", name: "Martinique Flag", keywords: ["mq", "nation", "country", "banner"], skins: [{ unified: "1f1f2-1f1f6", native: "\u{1F1F2}\u{1F1F6}" }], version: 2 }, "flag-mr": { id: "flag-mr", name: "Mauritania Flag", keywords: ["mr", "nation", "country", "banner"], skins: [{ unified: "1f1f2-1f1f7", native: "\u{1F1F2}\u{1F1F7}" }], version: 2 }, "flag-ms": { id: "flag-ms", name: "Montserrat Flag", keywords: ["ms", "nation", "country", "banner"], skins: [{ unified: "1f1f2-1f1f8", native: "\u{1F1F2}\u{1F1F8}" }], version: 2 }, "flag-mt": { id: "flag-mt", name: "Malta Flag", keywords: ["mt", "nation", "country", "banner"], skins: [{ unified: "1f1f2-1f1f9", native: "\u{1F1F2}\u{1F1F9}" }], version: 2 }, "flag-mu": { id: "flag-mu", name: "Mauritius Flag", keywords: ["mu", "nation", "country", "banner"], skins: [{ unified: "1f1f2-1f1fa", native: "\u{1F1F2}\u{1F1FA}" }], version: 2 }, "flag-mv": { id: "flag-mv", name: "Maldives Flag", keywords: ["mv", "nation", "country", "banner"], skins: [{ unified: "1f1f2-1f1fb", native: "\u{1F1F2}\u{1F1FB}" }], version: 2 }, "flag-mw": { id: "flag-mw", name: "Malawi Flag", keywords: ["mw", "nation", "country", "banner"], skins: [{ unified: "1f1f2-1f1fc", native: "\u{1F1F2}\u{1F1FC}" }], version: 2 }, "flag-mx": { id: "flag-mx", name: "Mexico Flag", keywords: ["mx", "nation", "country", "banner"], skins: [{ unified: "1f1f2-1f1fd", native: "\u{1F1F2}\u{1F1FD}" }], version: 2 }, "flag-my": { id: "flag-my", name: "Malaysia Flag", keywords: ["my", "nation", "country", "banner"], skins: [{ unified: "1f1f2-1f1fe", native: "\u{1F1F2}\u{1F1FE}" }], version: 2 }, "flag-mz": { id: "flag-mz", name: "Mozambique Flag", keywords: ["mz", "nation", "country", "banner"], skins: [{ unified: "1f1f2-1f1ff", native: "\u{1F1F2}\u{1F1FF}" }], version: 2 }, "flag-na": { id: "flag-na", name: "Namibia Flag", keywords: ["na", "nation", "country", "banner"], skins: [{ unified: "1f1f3-1f1e6", native: "\u{1F1F3}\u{1F1E6}" }], version: 2 }, "flag-nc": { id: "flag-nc", name: "New Caledonia Flag", keywords: ["nc", "nation", "country", "banner"], skins: [{ unified: "1f1f3-1f1e8", native: "\u{1F1F3}\u{1F1E8}" }], version: 2 }, "flag-ne": { id: "flag-ne", name: "Niger Flag", keywords: ["ne", "nation", "country", "banner"], skins: [{ unified: "1f1f3-1f1ea", native: "\u{1F1F3}\u{1F1EA}" }], version: 2 }, "flag-nf": { id: "flag-nf", name: "Norfolk Island Flag", keywords: ["nf", "nation", "country", "banner"], skins: [{ unified: "1f1f3-1f1eb", native: "\u{1F1F3}\u{1F1EB}" }], version: 2 }, "flag-ng": { id: "flag-ng", name: "Nigeria Flag", keywords: ["ng", "nation", "country", "banner"], skins: [{ unified: "1f1f3-1f1ec", native: "\u{1F1F3}\u{1F1EC}" }], version: 2 }, "flag-ni": { id: "flag-ni", name: "Nicaragua Flag", keywords: ["ni", "nation", "country", "banner"], skins: [{ unified: "1f1f3-1f1ee", native: "\u{1F1F3}\u{1F1EE}" }], version: 2 }, "flag-nl": { id: "flag-nl", name: "Netherlands Flag", keywords: ["nl", "nation", "country", "banner"], skins: [{ unified: "1f1f3-1f1f1", native: "\u{1F1F3}\u{1F1F1}" }], version: 2 }, "flag-no": { id: "flag-no", name: "Norway Flag", keywords: ["no", "nation", "country", "banner"], skins: [{ unified: "1f1f3-1f1f4", native: "\u{1F1F3}\u{1F1F4}" }], version: 2 }, "flag-np": { id: "flag-np", name: "Nepal Flag", keywords: ["np", "nation", "country", "banner"], skins: [{ unified: "1f1f3-1f1f5", native: "\u{1F1F3}\u{1F1F5}" }], version: 2 }, "flag-nr": { id: "flag-nr", name: "Nauru Flag", keywords: ["nr", "nation", "country", "banner"], skins: [{ unified: "1f1f3-1f1f7", native: "\u{1F1F3}\u{1F1F7}" }], version: 2 }, "flag-nu": { id: "flag-nu", name: "Niue Flag", keywords: ["nu", "nation", "country", "banner"], skins: [{ unified: "1f1f3-1f1fa", native: "\u{1F1F3}\u{1F1FA}" }], version: 2 }, "flag-nz": { id: "flag-nz", name: "New Zealand Flag", keywords: ["nz", "nation", "country", "banner"], skins: [{ unified: "1f1f3-1f1ff", native: "\u{1F1F3}\u{1F1FF}" }], version: 2 }, "flag-om": { id: "flag-om", name: "Oman Flag", keywords: ["om", "symbol", "nation", "country", "banner"], skins: [{ unified: "1f1f4-1f1f2", native: "\u{1F1F4}\u{1F1F2}" }], version: 2 }, "flag-pa": { id: "flag-pa", name: "Panama Flag", keywords: ["pa", "nation", "country", "banner"], skins: [{ unified: "1f1f5-1f1e6", native: "\u{1F1F5}\u{1F1E6}" }], version: 2 }, "flag-pe": { id: "flag-pe", name: "Peru Flag", keywords: ["pe", "nation", "country", "banner"], skins: [{ unified: "1f1f5-1f1ea", native: "\u{1F1F5}\u{1F1EA}" }], version: 2 }, "flag-pf": { id: "flag-pf", name: "French Polynesia Flag", keywords: ["pf", "nation", "country", "banner"], skins: [{ unified: "1f1f5-1f1eb", native: "\u{1F1F5}\u{1F1EB}" }], version: 2 }, "flag-pg": { id: "flag-pg", name: "Papua New Guinea Flag", keywords: ["pg", "nation", "country", "banner"], skins: [{ unified: "1f1f5-1f1ec", native: "\u{1F1F5}\u{1F1EC}" }], version: 2 }, "flag-ph": { id: "flag-ph", name: "Philippines Flag", keywords: ["ph", "nation", "country", "banner"], skins: [{ unified: "1f1f5-1f1ed", native: "\u{1F1F5}\u{1F1ED}" }], version: 2 }, "flag-pk": { id: "flag-pk", name: "Pakistan Flag", keywords: ["pk", "nation", "country", "banner"], skins: [{ unified: "1f1f5-1f1f0", native: "\u{1F1F5}\u{1F1F0}" }], version: 2 }, "flag-pl": { id: "flag-pl", name: "Poland Flag", keywords: ["pl", "nation", "country", "banner"], skins: [{ unified: "1f1f5-1f1f1", native: "\u{1F1F5}\u{1F1F1}" }], version: 2 }, "flag-pm": { id: "flag-pm", name: "St. Pierre & Miquelon Flag", keywords: ["pm", "st", "saint", "nation", "country", "banner"], skins: [{ unified: "1f1f5-1f1f2", native: "\u{1F1F5}\u{1F1F2}" }], version: 2 }, "flag-pn": { id: "flag-pn", name: "Pitcairn Islands Flag", keywords: ["pn", "nation", "country", "banner"], skins: [{ unified: "1f1f5-1f1f3", native: "\u{1F1F5}\u{1F1F3}" }], version: 2 }, "flag-pr": { id: "flag-pr", name: "Puerto Rico Flag", keywords: ["pr", "nation", "country", "banner"], skins: [{ unified: "1f1f5-1f1f7", native: "\u{1F1F5}\u{1F1F7}" }], version: 2 }, "flag-ps": { id: "flag-ps", name: "Palestinian Territories Flag", keywords: ["ps", "palestine", "nation", "country", "banner"], skins: [{ unified: "1f1f5-1f1f8", native: "\u{1F1F5}\u{1F1F8}" }], version: 2 }, "flag-pt": { id: "flag-pt", name: "Portugal Flag", keywords: ["pt", "nation", "country", "banner"], skins: [{ unified: "1f1f5-1f1f9", native: "\u{1F1F5}\u{1F1F9}" }], version: 2 }, "flag-pw": { id: "flag-pw", name: "Palau Flag", keywords: ["pw", "nation", "country", "banner"], skins: [{ unified: "1f1f5-1f1fc", native: "\u{1F1F5}\u{1F1FC}" }], version: 2 }, "flag-py": { id: "flag-py", name: "Paraguay Flag", keywords: ["py", "nation", "country", "banner"], skins: [{ unified: "1f1f5-1f1fe", native: "\u{1F1F5}\u{1F1FE}" }], version: 2 }, "flag-qa": { id: "flag-qa", name: "Qatar Flag", keywords: ["qa", "nation", "country", "banner"], skins: [{ unified: "1f1f6-1f1e6", native: "\u{1F1F6}\u{1F1E6}" }], version: 2 }, "flag-re": { id: "flag-re", name: "R\xE9union Flag", keywords: ["re", "reunion", "nation", "country", "banner"], skins: [{ unified: "1f1f7-1f1ea", native: "\u{1F1F7}\u{1F1EA}" }], version: 2 }, "flag-ro": { id: "flag-ro", name: "Romania Flag", keywords: ["ro", "nation", "country", "banner"], skins: [{ unified: "1f1f7-1f1f4", native: "\u{1F1F7}\u{1F1F4}" }], version: 2 }, "flag-rs": { id: "flag-rs", name: "Serbia Flag", keywords: ["rs", "nation", "country", "banner"], skins: [{ unified: "1f1f7-1f1f8", native: "\u{1F1F7}\u{1F1F8}" }], version: 2 }, ru: { id: "ru", name: "Russia Flag", keywords: ["ru", "russian", "federation", "nation", "country", "banner"], skins: [{ unified: "1f1f7-1f1fa", native: "\u{1F1F7}\u{1F1FA}" }], version: 1 }, "flag-rw": { id: "flag-rw", name: "Rwanda Flag", keywords: ["rw", "nation", "country", "banner"], skins: [{ unified: "1f1f7-1f1fc", native: "\u{1F1F7}\u{1F1FC}" }], version: 2 }, "flag-sa": { id: "flag-sa", name: "Saudi Arabia Flag", keywords: ["sa", "nation", "country", "banner"], skins: [{ unified: "1f1f8-1f1e6", native: "\u{1F1F8}\u{1F1E6}" }], version: 2 }, "flag-sb": { id: "flag-sb", name: "Solomon Islands Flag", keywords: ["sb", "nation", "country", "banner"], skins: [{ unified: "1f1f8-1f1e7", native: "\u{1F1F8}\u{1F1E7}" }], version: 2 }, "flag-sc": { id: "flag-sc", name: "Seychelles Flag", keywords: ["sc", "nation", "country", "banner"], skins: [{ unified: "1f1f8-1f1e8", native: "\u{1F1F8}\u{1F1E8}" }], version: 2 }, "flag-sd": { id: "flag-sd", name: "Sudan Flag", keywords: ["sd", "nation", "country", "banner"], skins: [{ unified: "1f1f8-1f1e9", native: "\u{1F1F8}\u{1F1E9}" }], version: 2 }, "flag-se": { id: "flag-se", name: "Sweden Flag", keywords: ["se", "nation", "country", "banner"], skins: [{ unified: "1f1f8-1f1ea", native: "\u{1F1F8}\u{1F1EA}" }], version: 2 }, "flag-sg": { id: "flag-sg", name: "Singapore Flag", keywords: ["sg", "nation", "country", "banner"], skins: [{ unified: "1f1f8-1f1ec", native: "\u{1F1F8}\u{1F1EC}" }], version: 2 }, "flag-sh": { id: "flag-sh", name: "St. Helena Flag", keywords: ["sh", "st", "saint", "ascension", "tristan", "cunha", "nation", "country", "banner"], skins: [{ unified: "1f1f8-1f1ed", native: "\u{1F1F8}\u{1F1ED}" }], version: 2 }, "flag-si": { id: "flag-si", name: "Slovenia Flag", keywords: ["si", "nation", "country", "banner"], skins: [{ unified: "1f1f8-1f1ee", native: "\u{1F1F8}\u{1F1EE}" }], version: 2 }, "flag-sj": { id: "flag-sj", name: "Svalbard & Jan Mayen Flag", keywords: ["sj"], skins: [{ unified: "1f1f8-1f1ef", native: "\u{1F1F8}\u{1F1EF}" }], version: 2 }, "flag-sk": { id: "flag-sk", name: "Slovakia Flag", keywords: ["sk", "nation", "country", "banner"], skins: [{ unified: "1f1f8-1f1f0", native: "\u{1F1F8}\u{1F1F0}" }], version: 2 }, "flag-sl": { id: "flag-sl", name: "Sierra Leone Flag", keywords: ["sl", "nation", "country", "banner"], skins: [{ unified: "1f1f8-1f1f1", native: "\u{1F1F8}\u{1F1F1}" }], version: 2 }, "flag-sm": { id: "flag-sm", name: "San Marino Flag", keywords: ["sm", "nation", "country", "banner"], skins: [{ unified: "1f1f8-1f1f2", native: "\u{1F1F8}\u{1F1F2}" }], version: 2 }, "flag-sn": { id: "flag-sn", name: "Senegal Flag", keywords: ["sn", "nation", "country", "banner"], skins: [{ unified: "1f1f8-1f1f3", native: "\u{1F1F8}\u{1F1F3}" }], version: 2 }, "flag-so": { id: "flag-so", name: "Somalia Flag", keywords: ["so", "nation", "country", "banner"], skins: [{ unified: "1f1f8-1f1f4", native: "\u{1F1F8}\u{1F1F4}" }], version: 2 }, "flag-sr": { id: "flag-sr", name: "Suriname Flag", keywords: ["sr", "nation", "country", "banner"], skins: [{ unified: "1f1f8-1f1f7", native: "\u{1F1F8}\u{1F1F7}" }], version: 2 }, "flag-ss": { id: "flag-ss", name: "South Sudan Flag", keywords: ["ss", "sd", "nation", "country", "banner"], skins: [{ unified: "1f1f8-1f1f8", native: "\u{1F1F8}\u{1F1F8}" }], version: 2 }, "flag-st": { id: "flag-st", name: "S\xE3o Tom\xE9 & Pr\xEDncipe Flag", keywords: ["st", "sao", "tome", "principe", "nation", "country", "banner"], skins: [{ unified: "1f1f8-1f1f9", native: "\u{1F1F8}\u{1F1F9}" }], version: 2 }, "flag-sv": { id: "flag-sv", name: "El Salvador Flag", keywords: ["sv", "nation", "country", "banner"], skins: [{ unified: "1f1f8-1f1fb", native: "\u{1F1F8}\u{1F1FB}" }], version: 2 }, "flag-sx": { id: "flag-sx", name: "Sint Maarten Flag", keywords: ["sx", "dutch", "nation", "country", "banner"], skins: [{ unified: "1f1f8-1f1fd", native: "\u{1F1F8}\u{1F1FD}" }], version: 2 }, "flag-sy": { id: "flag-sy", name: "Syria Flag", keywords: ["sy", "syrian", "arab", "republic", "nation", "country", "banner"], skins: [{ unified: "1f1f8-1f1fe", native: "\u{1F1F8}\u{1F1FE}" }], version: 2 }, "flag-sz": { id: "flag-sz", name: "Eswatini Flag", keywords: ["sz", "nation", "country", "banner"], skins: [{ unified: "1f1f8-1f1ff", native: "\u{1F1F8}\u{1F1FF}" }], version: 2 }, "flag-ta": { id: "flag-ta", name: "Tristan Da Cunha Flag", keywords: ["ta"], skins: [{ unified: "1f1f9-1f1e6", native: "\u{1F1F9}\u{1F1E6}" }], version: 2 }, "flag-tc": { id: "flag-tc", name: "Turks & Caicos Islands Flag", keywords: ["tc", "nation", "country", "banner"], skins: [{ unified: "1f1f9-1f1e8", native: "\u{1F1F9}\u{1F1E8}" }], version: 2 }, "flag-td": { id: "flag-td", name: "Chad Flag", keywords: ["td", "nation", "country", "banner"], skins: [{ unified: "1f1f9-1f1e9", native: "\u{1F1F9}\u{1F1E9}" }], version: 2 }, "flag-tf": { id: "flag-tf", name: "French Southern Territories Flag", keywords: ["tf", "nation", "country", "banner"], skins: [{ unified: "1f1f9-1f1eb", native: "\u{1F1F9}\u{1F1EB}" }], version: 2 }, "flag-tg": { id: "flag-tg", name: "Togo Flag", keywords: ["tg", "nation", "country", "banner"], skins: [{ unified: "1f1f9-1f1ec", native: "\u{1F1F9}\u{1F1EC}" }], version: 2 }, "flag-th": { id: "flag-th", name: "Thailand Flag", keywords: ["th", "nation", "country", "banner"], skins: [{ unified: "1f1f9-1f1ed", native: "\u{1F1F9}\u{1F1ED}" }], version: 2 }, "flag-tj": { id: "flag-tj", name: "Tajikistan Flag", keywords: ["tj", "nation", "country", "banner"], skins: [{ unified: "1f1f9-1f1ef", native: "\u{1F1F9}\u{1F1EF}" }], version: 2 }, "flag-tk": { id: "flag-tk", name: "Tokelau Flag", keywords: ["tk", "nation", "country", "banner"], skins: [{ unified: "1f1f9-1f1f0", native: "\u{1F1F9}\u{1F1F0}" }], version: 2 }, "flag-tl": { id: "flag-tl", name: "Timor-Leste Flag", keywords: ["tl", "timor", "leste", "nation", "country", "banner"], skins: [{ unified: "1f1f9-1f1f1", native: "\u{1F1F9}\u{1F1F1}" }], version: 2 }, "flag-tm": { id: "flag-tm", name: "Turkmenistan Flag", keywords: ["tm", "nation", "country", "banner"], skins: [{ unified: "1f1f9-1f1f2", native: "\u{1F1F9}\u{1F1F2}" }], version: 2 }, "flag-tn": { id: "flag-tn", name: "Tunisia Flag", keywords: ["tn", "nation", "country", "banner"], skins: [{ unified: "1f1f9-1f1f3", native: "\u{1F1F9}\u{1F1F3}" }], version: 2 }, "flag-to": { id: "flag-to", name: "Tonga Flag", keywords: ["to", "nation", "country", "banner"], skins: [{ unified: "1f1f9-1f1f4", native: "\u{1F1F9}\u{1F1F4}" }], version: 2 }, "flag-tr": { id: "flag-tr", name: "Turkey Flag", keywords: ["tr", "nation", "country", "banner"], skins: [{ unified: "1f1f9-1f1f7", native: "\u{1F1F9}\u{1F1F7}" }], version: 2 }, "flag-tt": { id: "flag-tt", name: "Trinidad & Tobago Flag", keywords: ["tt", "nation", "country", "banner"], skins: [{ unified: "1f1f9-1f1f9", native: "\u{1F1F9}\u{1F1F9}" }], version: 2 }, "flag-tv": { id: "flag-tv", name: "Tuvalu Flag", keywords: ["tv", "nation", "country", "banner"], skins: [{ unified: "1f1f9-1f1fb", native: "\u{1F1F9}\u{1F1FB}" }], version: 2 }, "flag-tw": { id: "flag-tw", name: "Taiwan Flag", keywords: ["tw", "nation", "country", "banner"], skins: [{ unified: "1f1f9-1f1fc", native: "\u{1F1F9}\u{1F1FC}" }], version: 2 }, "flag-tz": { id: "flag-tz", name: "Tanzania Flag", keywords: ["tz", "united", "republic", "nation", "country", "banner"], skins: [{ unified: "1f1f9-1f1ff", native: "\u{1F1F9}\u{1F1FF}" }], version: 2 }, "flag-ua": { id: "flag-ua", name: "Ukraine Flag", keywords: ["ua", "nation", "country", "banner"], skins: [{ unified: "1f1fa-1f1e6", native: "\u{1F1FA}\u{1F1E6}" }], version: 2 }, "flag-ug": { id: "flag-ug", name: "Uganda Flag", keywords: ["ug", "nation", "country", "banner"], skins: [{ unified: "1f1fa-1f1ec", native: "\u{1F1FA}\u{1F1EC}" }], version: 2 }, "flag-um": { id: "flag-um", name: "U.s. Outlying Islands Flag", keywords: ["um", "u", "s"], skins: [{ unified: "1f1fa-1f1f2", native: "\u{1F1FA}\u{1F1F2}" }], version: 2 }, "flag-un": { id: "flag-un", name: "United Nations Flag", keywords: ["un", "banner"], skins: [{ unified: "1f1fa-1f1f3", native: "\u{1F1FA}\u{1F1F3}" }], version: 4 }, us: { id: "us", name: "United States Flag", keywords: ["us", "america", "nation", "country", "banner"], skins: [{ unified: "1f1fa-1f1f8", native: "\u{1F1FA}\u{1F1F8}" }], version: 1 }, "flag-uy": { id: "flag-uy", name: "Uruguay Flag", keywords: ["uy", "nation", "country", "banner"], skins: [{ unified: "1f1fa-1f1fe", native: "\u{1F1FA}\u{1F1FE}" }], version: 2 }, "flag-uz": { id: "flag-uz", name: "Uzbekistan Flag", keywords: ["uz", "nation", "country", "banner"], skins: [{ unified: "1f1fa-1f1ff", native: "\u{1F1FA}\u{1F1FF}" }], version: 2 }, "flag-va": { id: "flag-va", name: "Vatican City Flag", keywords: ["va", "nation", "country", "banner"], skins: [{ unified: "1f1fb-1f1e6", native: "\u{1F1FB}\u{1F1E6}" }], version: 2 }, "flag-vc": { id: "flag-vc", name: "St. Vincent & Grenadines Flag", keywords: ["vc", "st", "saint", "nation", "country", "banner"], skins: [{ unified: "1f1fb-1f1e8", native: "\u{1F1FB}\u{1F1E8}" }], version: 2 }, "flag-ve": { id: "flag-ve", name: "Venezuela Flag", keywords: ["ve", "bolivarian", "republic", "nation", "country", "banner"], skins: [{ unified: "1f1fb-1f1ea", native: "\u{1F1FB}\u{1F1EA}" }], version: 2 }, "flag-vg": { id: "flag-vg", name: "British Virgin Islands Flag", keywords: ["vg", "bvi", "nation", "country", "banner"], skins: [{ unified: "1f1fb-1f1ec", native: "\u{1F1FB}\u{1F1EC}" }], version: 2 }, "flag-vi": { id: "flag-vi", name: "U.s. Virgin Islands Flag", keywords: ["vi", "u", "s", "us", "nation", "country", "banner"], skins: [{ unified: "1f1fb-1f1ee", native: "\u{1F1FB}\u{1F1EE}" }], version: 2 }, "flag-vn": { id: "flag-vn", name: "Vietnam Flag", keywords: ["vn", "viet", "nam", "nation", "country", "banner"], skins: [{ unified: "1f1fb-1f1f3", native: "\u{1F1FB}\u{1F1F3}" }], version: 2 }, "flag-vu": { id: "flag-vu", name: "Vanuatu Flag", keywords: ["vu", "nation", "country", "banner"], skins: [{ unified: "1f1fb-1f1fa", native: "\u{1F1FB}\u{1F1FA}" }], version: 2 }, "flag-wf": { id: "flag-wf", name: "Wallis & Futuna Flag", keywords: ["wf", "nation", "country", "banner"], skins: [{ unified: "1f1fc-1f1eb", native: "\u{1F1FC}\u{1F1EB}" }], version: 2 }, "flag-ws": { id: "flag-ws", name: "Samoa Flag", keywords: ["ws", "nation", "country", "banner"], skins: [{ unified: "1f1fc-1f1f8", native: "\u{1F1FC}\u{1F1F8}" }], version: 2 }, "flag-xk": { id: "flag-xk", name: "Kosovo Flag", keywords: ["xk", "nation", "country", "banner"], skins: [{ unified: "1f1fd-1f1f0", native: "\u{1F1FD}\u{1F1F0}" }], version: 2 }, "flag-ye": { id: "flag-ye", name: "Yemen Flag", keywords: ["ye", "nation", "country", "banner"], skins: [{ unified: "1f1fe-1f1ea", native: "\u{1F1FE}\u{1F1EA}" }], version: 2 }, "flag-yt": { id: "flag-yt", name: "Mayotte Flag", keywords: ["yt", "nation", "country", "banner"], skins: [{ unified: "1f1fe-1f1f9", native: "\u{1F1FE}\u{1F1F9}" }], version: 2 }, "flag-za": { id: "flag-za", name: "South Africa Flag", keywords: ["za", "nation", "country", "banner"], skins: [{ unified: "1f1ff-1f1e6", native: "\u{1F1FF}\u{1F1E6}" }], version: 2 }, "flag-zm": { id: "flag-zm", name: "Zambia Flag", keywords: ["zm", "nation", "country", "banner"], skins: [{ unified: "1f1ff-1f1f2", native: "\u{1F1FF}\u{1F1F2}" }], version: 2 }, "flag-zw": { id: "flag-zw", name: "Zimbabwe Flag", keywords: ["zw", "nation", "country", "banner"], skins: [{ unified: "1f1ff-1f1fc", native: "\u{1F1FF}\u{1F1FC}" }], version: 2 }, "flag-england": { id: "flag-england", name: "England Flag", keywords: ["english"], skins: [{ unified: "1f3f4-e0067-e0062-e0065-e006e-e0067-e007f", native: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}" }], version: 5 }, "flag-scotland": { id: "flag-scotland", name: "Scotland Flag", keywords: ["scottish"], skins: [{ unified: "1f3f4-e0067-e0062-e0073-e0063-e0074-e007f", native: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}" }], version: 5 }, "flag-wales": { id: "flag-wales", name: "Wales Flag", keywords: ["welsh"], skins: [{ unified: "1f3f4-e0067-e0062-e0077-e006c-e0073-e007f", native: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}\u{E007F}" }], version: 5 } }, aliases: { satisfied: "laughing", grinning_face_with_star_eyes: "star-struck", grinning_face_with_one_large_and_one_small_eye: "zany_face", smiling_face_with_smiling_eyes_and_hand_covering_mouth: "face_with_hand_over_mouth", face_with_finger_covering_closed_lips: "shushing_face", face_with_one_eyebrow_raised: "face_with_raised_eyebrow", face_with_open_mouth_vomiting: "face_vomiting", shocked_face_with_exploding_head: "exploding_head", serious_face_with_symbols_covering_mouth: "face_with_symbols_on_mouth", poop: "hankey", shit: "hankey", collision: "boom", raised_hand: "hand", hand_with_index_and_middle_fingers_crossed: "crossed_fingers", sign_of_the_horns: "the_horns", reversed_hand_with_middle_finger_extended: "middle_finger", thumbsup: "+1", thumbsdown: "-1", punch: "facepunch", mother_christmas: "mrs_claus", running: "runner", "man-with-bunny-ears-partying": "men-with-bunny-ears-partying", "woman-with-bunny-ears-partying": "women-with-bunny-ears-partying", women_holding_hands: "two_women_holding_hands", woman_and_man_holding_hands: "man_and_woman_holding_hands", couple: "man_and_woman_holding_hands", men_holding_hands: "two_men_holding_hands", paw_prints: "feet", flipper: "dolphin", honeybee: "bee", lady_beetle: "ladybug", cooking: "fried_egg", knife: "hocho", red_car: "car", sailboat: "boat", waxing_gibbous_moon: "moon", sun_small_cloud: "mostly_sunny", sun_behind_cloud: "barely_sunny", sun_behind_rain_cloud: "partly_sunny_rain", lightning_cloud: "lightning", tornado_cloud: "tornado", tshirt: "shirt", shoe: "mans_shoe", telephone: "phone", lantern: "izakaya_lantern", open_book: "book", envelope: "email", pencil: "memo", heavy_exclamation_mark: "exclamation", staff_of_aesculapius: "medical_symbol", "flag-cn": "cn", "flag-de": "de", "flag-es": "es", "flag-fr": "fr", uk: "gb", "flag-gb": "gb", "flag-it": "it", "flag-jp": "jp", "flag-kr": "kr", "flag-ru": "ru", "flag-us": "us" }, sheet: { cols: 61, rows: 61 } };

// app/components/EmojiPicker.tsx
var import_react5 = __toESM(require_react(), 1);
var import_jsx_dev_runtime7 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\components\\\\EmojiPicker.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s6 = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\components\\EmojiPicker.tsx"
  );
  import.meta.hot.lastModified = "1703176338744.3916";
}
var categoryToEmoji = {
  favorites: "\u2B50",
  recents: "\u{1F501}",
  people: "\u{1F642}",
  nature: "\u{1F342}",
  foods: "\u{1F35E}",
  activity: "\u{1F3AE}",
  places: "\u{1F6B2}",
  objects: "\u{1F6CB}",
  symbols: "\u2665",
  flags: "\u{1F3F4}"
};
var CategoryIconButton = ({
  categoryId,
  id
}) => {
  const emoji = categoryToEmoji[categoryId];
  return /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("button", { className: "block mx-auto", onClick: () => {
    const sectionHeader = document.getElementById(`${id}-${categoryId}`);
    if (sectionHeader) {
      sectionHeader.scrollIntoView();
    }
  }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(Twemoji, { emoji, className: "h-5 grayscale" }, void 0, false, {
    fileName: "app/components/EmojiPicker.tsx",
    lineNumber: 62,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/components/EmojiPicker.tsx",
    lineNumber: 56,
    columnNumber: 10
  }, this);
};
_c7 = CategoryIconButton;
var GridEmoji = ({
  emoji,
  onEmojiClick,
  setHoverEmoji
}) => /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("button", { className: "rounded p-1 h-11 w-11 hover:bg-white/10 transition", onClick: () => onEmojiClick(emoji), onMouseOver: () => setHoverEmoji(emoji), children: /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(Twemoji, { emoji: emoji.skin.native, className: "h-full w-full", title: emoji.id }, void 0, false, {
  fileName: "app/components/EmojiPicker.tsx",
  lineNumber: 71,
  columnNumber: 5
}, this) }, void 0, false, {
  fileName: "app/components/EmojiPicker.tsx",
  lineNumber: 70,
  columnNumber: 7
}, this);
_c23 = GridEmoji;
var EmojiPicker_ = ({
  id,
  onEmojiClick
}) => {
  _s6();
  const [settings, setSettings] = useLocalStorage();
  const [hoverEmoji, setHoverEmoji] = (0, import_react5.useState)();
  const [query, setQuery] = (0, import_react5.useState)("");
  const data = native_default;
  const skinTone = settings.skinTone;
  const categories = [
    {
      id: "favorites",
      emojis: []
    },
    // {
    //   id: "recents",
    //   emojis: [],
    // },
    ...data.categories
  ];
  return /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("div", { className: "rounded bg-gray-300 dark:bg-gray-800 w-[385px] h-80 border border-black/5 shadow-md flex flex-col", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("div", { className: "p-2 shadow border-b border-b-black/5 flex", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("div", { className: "grow", children: /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(TextInput, { label: "", className: "w-full", placeholder: "Find the perfect emoji", onInput: (e) => setQuery(e.currentTarget.value.toLowerCase().trim()) }, void 0, false, {
        fileName: "app/components/EmojiPicker.tsx",
        lineNumber: 96,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "app/components/EmojiPicker.tsx",
        lineNumber: 95,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("div", { className: "shrink-0 ml-3 mr-1 my-auto", children: /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("button", { onClick: () => {
        if (skinTone === void 0) {
          setSettings({
            skinTone: 0
          });
        } else if (skinTone < 4) {
          setSettings({
            skinTone: skinTone + 1
          });
        } else {
          setSettings({
            skinTone: void 0
          });
        }
      }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(Twemoji, { emoji: skinTone === 0 ? "\u{1F44F}\u{1F3FB}" : skinTone === 1 ? "\u{1F44F}\u{1F3FC}" : skinTone === 2 ? "\u{1F44F}\u{1F3FD}" : skinTone === 3 ? "\u{1F44F}\u{1F3FE}" : skinTone === 4 ? "\u{1F44F}\u{1F3FF}" : "\u{1F44F}", className: "h-6 align-[-0.3em] w-6", title: "Set skin tone" }, void 0, false, {
        fileName: "app/components/EmojiPicker.tsx",
        lineNumber: 114,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "app/components/EmojiPicker.tsx",
        lineNumber: 99,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "app/components/EmojiPicker.tsx",
        lineNumber: 98,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/EmojiPicker.tsx",
      lineNumber: 94,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("div", { className: "flex grow h-full overflow-hidden", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("div", { className: "w-10 shrink-0 bg-gray-400 dark:bg-gray-900 overflow-y-auto h-full scrollbar-none space-y-1 p-1 py-2 flex flex-col", children: categories.filter((c) => c.emojis.length > 0).map((category) => /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(CategoryIconButton, { categoryId: category.id, id }, `emoji-category-${category.id}-icon`, false, {
        fileName: "app/components/EmojiPicker.tsx",
        lineNumber: 120,
        columnNumber: 72
      }, this)) }, void 0, false, {
        fileName: "app/components/EmojiPicker.tsx",
        lineNumber: 119,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("div", { className: "overflow-y-auto flex flex-col grow select-none", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("div", { className: "grow px-1.5 pb-1", children: query ? Object.values(data.emojis).filter((e) => e.id.includes(query) || e.keywords.map((k) => k.includes(query)).includes(true)).map((emoji) => {
          const skin = emoji.skins[skinTone === void 0 ? 0 : skinTone + 1] ?? emoji.skins[0];
          const selected = {
            ...emoji,
            skin
          };
          return /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(GridEmoji, { emoji: selected, onEmojiClick, setHoverEmoji }, `emoji-search-${emoji.id}`, false, {
            fileName: "app/components/EmojiPicker.tsx",
            lineNumber: 130,
            columnNumber: 20
          }, this);
        }) : categories.filter((c) => c.emojis.length > 0).map((category) => /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("div", { className: "pt-3 first:pt-1", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("div", { id: `${id}-${category.id}`, className: "uppercase text-xs font-semibold pt-1 mb-1 ml-1 flex", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(Twemoji, { emoji: categoryToEmoji[category.id], className: "my-auto mr-1.5 grayscale" }, void 0, false, {
              fileName: "app/components/EmojiPicker.tsx",
              lineNumber: 133,
              columnNumber: 25
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("p", { className: "my-auto", children: category.id }, void 0, false, {
              fileName: "app/components/EmojiPicker.tsx",
              lineNumber: 134,
              columnNumber: 25
            }, this)
          ] }, void 0, true, {
            fileName: "app/components/EmojiPicker.tsx",
            lineNumber: 132,
            columnNumber: 23
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("div", { className: "flex gap-px flex-wrap", children: category.emojis.map((name) => {
            const emoji = data.emojis[name];
            const skin = emoji.skins[skinTone === void 0 ? 0 : skinTone + 1] ?? emoji.skins[0];
            const selected = {
              ...emoji,
              skin
            };
            return /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(GridEmoji, { emoji: selected, onEmojiClick, setHoverEmoji }, `emoji-category-${category.id}-emoji-${emoji.id}`, false, {
              fileName: "app/components/EmojiPicker.tsx",
              lineNumber: 144,
              columnNumber: 24
            }, this);
          }) }, void 0, false, {
            fileName: "app/components/EmojiPicker.tsx",
            lineNumber: 136,
            columnNumber: 23
          }, this)
        ] }, `emoji-category-${category.id}-body`, true, {
          fileName: "app/components/EmojiPicker.tsx",
          lineNumber: 131,
          columnNumber: 76
        }, this)) }, void 0, false, {
          fileName: "app/components/EmojiPicker.tsx",
          lineNumber: 123,
          columnNumber: 11
        }, this),
        hoverEmoji && /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("div", { className: "sticky bottom-0 left-0 w-full bg-gray-400 dark:bg-gray-900 flex items-center px-4 py-2", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(Twemoji, { emoji: hoverEmoji.skin.native, className: "h-7 my-auto shrink-0 !align-bottom", title: hoverEmoji.id }, void 0, false, {
            fileName: "app/components/EmojiPicker.tsx",
            lineNumber: 150,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("p", { className: "ml-2 text-base font-semibold my-auto truncate", children: [
            ":",
            hoverEmoji.id,
            ":"
          ] }, void 0, true, {
            fileName: "app/components/EmojiPicker.tsx",
            lineNumber: 151,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "app/components/EmojiPicker.tsx",
          lineNumber: 149,
          columnNumber: 26
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/EmojiPicker.tsx",
        lineNumber: 122,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/EmojiPicker.tsx",
      lineNumber: 118,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/EmojiPicker.tsx",
    lineNumber: 93,
    columnNumber: 10
  }, this);
};
_s6(EmojiPicker_, "odJimiOkv7Rjwm3kDbn49jCqQfY=", false, function() {
  return [useLocalStorage];
});
_c33 = EmojiPicker_;
var EmojiPicker = (0, import_react5.memo)(EmojiPicker_);
_c43 = EmojiPicker;
var PopoutEmojiPicker = ({
  emoji,
  setEmoji
}) => {
  const id = randomString(10);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(
    "details",
    {
      className: "relative group/emoji",
      children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("summary", { className: "flex cursor-pointer marker:hidden marker-none", children: /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("div", { className: "h-9 w-9 rounded flex bg-gray-300 dark:bg-[#292b2f]", children: /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("div", { className: "m-auto", children: emoji ? emoji.id ? /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("img", { className: "w-[22px]", src: cdn.emoji(emoji.id, emoji.animated ? "gif" : "webp"), alt: emoji.name }, void 0, false, {
          fileName: "app/components/EmojiPicker.tsx",
          lineNumber: 180,
          columnNumber: 33
        }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(Twemoji, { emoji: emoji.name, className: "h-[22px]" }, void 0, false, {
          fileName: "app/components/EmojiPicker.tsx",
          lineNumber: 180,
          columnNumber: 140
        }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(Twemoji, { emoji: "\u{1F44F}", className: "h-[22px] opacity-20 align-[-0.3em]" }, void 0, false, {
          fileName: "app/components/EmojiPicker.tsx",
          lineNumber: 180,
          columnNumber: 194
        }, this) }, void 0, false, {
          fileName: "app/components/EmojiPicker.tsx",
          lineNumber: 179,
          columnNumber: 11
        }, this) }, void 0, false, {
          fileName: "app/components/EmojiPicker.tsx",
          lineNumber: 178,
          columnNumber: 9
        }, this) }, void 0, false, {
          fileName: "app/components/EmojiPicker.tsx",
          lineNumber: 177,
          columnNumber: 7
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("div", { className: "absolute z-20 pb-8", children: /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(EmojiPicker, { id, onEmojiClick: (selectedEmoji) => {
          const newEmoji = {
            name: selectedEmoji.skin.native
          };
          if (emoji && emoji.id === newEmoji.id && emoji.name === newEmoji.name) {
            setEmoji(void 0);
          } else {
            setEmoji(newEmoji);
          }
        } }, void 0, false, {
          fileName: "app/components/EmojiPicker.tsx",
          lineNumber: 185,
          columnNumber: 9
        }, this) }, void 0, false, {
          fileName: "app/components/EmojiPicker.tsx",
          lineNumber: 184,
          columnNumber: 7
        }, this)
      ]
    },
    void 0,
    true,
    {
      fileName: "app/components/EmojiPicker.tsx",
      lineNumber: 174,
      columnNumber: 10
    },
    this
  );
};
_c52 = PopoutEmojiPicker;
var _c7;
var _c23;
var _c33;
var _c43;
var _c52;
$RefreshReg$(_c7, "CategoryIconButton");
$RefreshReg$(_c23, "GridEmoji");
$RefreshReg$(_c33, "EmojiPicker_");
$RefreshReg$(_c43, "EmojiPicker");
$RefreshReg$(_c52, "PopoutEmojiPicker");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/components/editor/ComponentEditor.tsx
var import_jsx_dev_runtime8 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\components\\\\editor\\\\ComponentEditor.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\components\\editor\\ComponentEditor.tsx"
  );
  import.meta.hot.lastModified = "1703017180436.3086";
}
var getComponentText = (component) => component.type === ComponentType.Button ? component.label ?? component.emoji?.name : component.type === ComponentType.StringSelect ? component.placeholder : void 0;
var getComponentWidth = (component) => {
  switch (component.type) {
    case ComponentType.Button:
      return 1;
    case ComponentType.StringSelect:
    case ComponentType.UserSelect:
    case ComponentType.RoleSelect:
    case ComponentType.MentionableSelect:
    case ComponentType.ChannelSelect:
    case ComponentType.TextInput:
      return 5;
    default:
      break;
  }
  return 0;
};
var getRowWidth = (row) => {
  return row.components.reduce((last, component) => getComponentWidth(component) + last, 0);
};
var strings = {
  rowEmpty: "Must contain at least one component (button/select)",
  labelEmpty: "Must have a label or emoji, or both",
  urlEmpty: "Link button must have a URL",
  optionsEmpty: "Must contain at least one select option"
};
var getComponentErrors = (component) => {
  const errors = [];
  switch (component.type) {
    case ComponentType.ActionRow:
      if (component.components.length === 0) {
        errors.push(strings.rowEmpty);
      }
      break;
    case ComponentType.Button:
      if (!component.emoji && !component.label) {
        errors.push(strings.labelEmpty);
      }
      if (component.style === ButtonStyle.Link && !component.url) {
        errors.push(strings.urlEmpty);
      }
      break;
    case ComponentType.StringSelect:
      if (component.options.length === 0) {
        errors.push(strings.optionsEmpty);
      }
      break;
    default:
      break;
  }
  return errors;
};
var ActionRowEditor = ({
  message,
  row,
  rowIndex: i,
  data,
  setData,
  open
}) => {
  const mi = data.messages.indexOf(message);
  const errors = getComponentErrors(row);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("details", { className: "group/action-row", open, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("summary", { className: "group-open/action-row:mb-2 transition-[margin] marker:content-none marker-none flex text-base text-gray-600 dark:text-gray-400 font-semibold cursor-default select-none", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(CoolIcon, { icon: "Chevron_Right", className: "group-open/action-row:rotate-90 mr-2 my-auto transition-transform" }, void 0, false, {
        fileName: "app/components/editor/ComponentEditor.tsx",
        lineNumber: 98,
        columnNumber: 9
      }, this),
      "Row ",
      i + 1,
      /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "ml-auto text-xl space-x-2.5 my-auto shrink-0", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("button", { className: i === 0 ? "hidden" : "", onClick: () => {
          message.data.components.splice(i, 1);
          message.data.components.splice(i - 1, 0, row);
          setData({
            ...data
          });
        }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(CoolIcon, { icon: "Chevron_Up" }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 108,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 101,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("button", { className: i === message.data.components.length - 1 ? "hidden" : "", onClick: () => {
          message.data.components.splice(i, 1);
          message.data.components.splice(i + 1, 0, row);
          setData({
            ...data
          });
        }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(CoolIcon, { icon: "Chevron_Down" }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 117,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 110,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("button", { className: message.data.components.length - 1 + 1 >= 5 ? "hidden" : "", onClick: () => {
          message.data.components.splice(i + 1, 0, structuredClone(row));
          setData({
            ...data
          });
        }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(CoolIcon, { icon: "Copy" }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 125,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 119,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("button", { onClick: () => {
          message.data.components.splice(i, 1);
          setData({
            ...data
          });
        }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(CoolIcon, { icon: "Trash_Full" }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 133,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 127,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/editor/ComponentEditor.tsx",
        lineNumber: 100,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/editor/ComponentEditor.tsx",
      lineNumber: 97,
      columnNumber: 7
    }, this),
    errors.length > 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "-mt-1 mb-1", children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(InfoBox, { severity: "red", icon: "Circle_Warning", children: errors.join("\n") }, void 0, false, {
      fileName: "app/components/editor/ComponentEditor.tsx",
      lineNumber: 138,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "app/components/editor/ComponentEditor.tsx",
      lineNumber: 137,
      columnNumber: 29
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "ml-1 md:ml-2", children: row.components.map((component, ci) => /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(IndividualComponentEditor, { component, index: ci, row, updateRow: () => setData({
      ...data
    }), open: component.type !== ComponentType.Button, children: component.type === ComponentType.Button ? /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(import_jsx_dev_runtime8.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "flex", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "mr-2 mt-auto", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("p", { className: "text-sm cursor-default font-medium", children: "Emoji" }, void 0, false, {
            fileName: "app/components/editor/ComponentEditor.tsx",
            lineNumber: 149,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(PopoutEmojiPicker, { emoji: component.emoji, setEmoji: (emoji) => {
            component.emoji = emoji;
            setData({
              ...data
            });
          } }, void 0, false, {
            fileName: "app/components/editor/ComponentEditor.tsx",
            lineNumber: 150,
            columnNumber: 21
          }, this)
        ] }, void 0, true, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 148,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "grow", children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(TextInput, { label: "Label", className: "w-full", value: component.label ?? "", onInput: (e) => {
          component.label = e.currentTarget.value;
          setData({
            ...data
          });
        }, maxLength: 80 }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 158,
          columnNumber: 21
        }, this) }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 157,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "ml-2 my-auto", children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(Checkbox, { label: "Disabled", checked: component.disabled ?? false, onChange: (e) => {
          component.disabled = e.currentTarget.checked;
          setData({
            ...data
          });
        } }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 166,
          columnNumber: 21
        }, this) }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 165,
          columnNumber: 19
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/editor/ComponentEditor.tsx",
        lineNumber: 147,
        columnNumber: 17
      }, this),
      component.style === ButtonStyle.Link ? /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(TextInput, { label: "URL", type: "url", className: "w-full", value: component.url, onInput: (e) => {
        component.url = e.currentTarget.value;
        setData({
          ...data
        });
      } }, void 0, false, {
        fileName: "app/components/editor/ComponentEditor.tsx",
        lineNumber: 174,
        columnNumber: 57
      }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("p", { className: "text-sm font-medium cursor-default", children: "Style" }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 180,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "grid gap-1 grid-cols-4", children: [ButtonStyle.Primary, ButtonStyle.Secondary, ButtonStyle.Success, ButtonStyle.Danger].map((style) => /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(ButtonStylePicker, { style, component, update: () => setData({
          ...data
        }) }, `edit-message-${i}-row-${i}-component-${component.type}-${ci}-style-${style}`, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 182,
          columnNumber: 123
        }, this)) }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 181,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/editor/ComponentEditor.tsx",
        lineNumber: 179,
        columnNumber: 19
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/editor/ComponentEditor.tsx",
      lineNumber: 146,
      columnNumber: 56
    }, this) : [ComponentType.StringSelect, ComponentType.UserSelect, ComponentType.RoleSelect, ComponentType.MentionableSelect, ComponentType.ChannelSelect].includes(component.type) && /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(import_jsx_dev_runtime8.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "flex", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "grow", children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(TextInput, { label: "Placeholder", value: component.placeholder ?? "", placeholder: selectStrings.defaultPlaceholder, maxLength: 150, className: "w-full", onInput: (e) => {
          component.placeholder = e.currentTarget.value || void 0;
          setData({
            ...data
          });
        } }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 190,
          columnNumber: 23
        }, this) }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 189,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "ml-2 my-auto", children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(Checkbox, { label: "Disabled", checked: component.disabled ?? false, onChange: (e) => {
          component.disabled = e.currentTarget.checked;
          setData({
            ...data
          });
        } }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 198,
          columnNumber: 23
        }, this) }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 197,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/editor/ComponentEditor.tsx",
        lineNumber: 188,
        columnNumber: 19
      }, this),
      component.type === ComponentType.StringSelect && /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(import_jsx_dev_runtime8.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "pt-2 -mb-2", children: component.options.map((option, oi) => /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(SelectMenuOptionsSection, { option, index: oi, component, update: () => setData({
          ...data
        }), children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "flex", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "grow", children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(TextInput, { label: "Label", className: "w-full", value: option.label ?? "", maxLength: 100, onInput: (e) => {
              option.label = e.currentTarget.value;
              setData({
                ...data
              });
            }, required: true }, void 0, false, {
              fileName: "app/components/editor/ComponentEditor.tsx",
              lineNumber: 213,
              columnNumber: 33
            }, this) }, void 0, false, {
              fileName: "app/components/editor/ComponentEditor.tsx",
              lineNumber: 212,
              columnNumber: 31
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "ml-2 my-auto", children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(Checkbox, { label: "Default", checked: option.default ?? false, onChange: (e) => {
              option.default = e.currentTarget.checked;
              setData({
                ...data
              });
            } }, void 0, false, {
              fileName: "app/components/editor/ComponentEditor.tsx",
              lineNumber: 221,
              columnNumber: 33
            }, this) }, void 0, false, {
              fileName: "app/components/editor/ComponentEditor.tsx",
              lineNumber: 220,
              columnNumber: 31
            }, this)
          ] }, void 0, true, {
            fileName: "app/components/editor/ComponentEditor.tsx",
            lineNumber: 211,
            columnNumber: 29
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(TextInput, { label: "Emoji", className: "w-full", value: option.emoji?.id ? `<${option.emoji.animated ? "a" : ""}:${option.emoji.name}:${option.emoji.id}>` : option.emoji?.name ?? "", onInput: (e) => {
            const {
              value
            } = e.currentTarget;
            if (!value) {
              option.emoji = void 0;
              setData({
                ...data
              });
              return;
            }
            const customMatch = value.match(CUSTOM_EMOJI_RE);
            if (customMatch) {
              option.emoji = {
                id: customMatch[3],
                name: customMatch[2],
                animated: customMatch[1] === "a"
              };
              setData({
                ...data
              });
            }
          } }, void 0, false, {
            fileName: "app/components/editor/ComponentEditor.tsx",
            lineNumber: 229,
            columnNumber: 29
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(TextInput, { label: "Description", className: "w-full", value: option.description ?? "", maxLength: 100, onInput: (e) => {
            option.description = e.currentTarget.value;
            setData({
              ...data
            });
          } }, void 0, false, {
            fileName: "app/components/editor/ComponentEditor.tsx",
            lineNumber: 258,
            columnNumber: 29
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(TextInput, { label: "Value (hidden)", className: "w-full", value: option.value ?? "", maxLength: 100, onInput: (e) => {
            option.value = e.currentTarget.value;
            setData({
              ...data
            });
          }, required: true }, void 0, false, {
            fileName: "app/components/editor/ComponentEditor.tsx",
            lineNumber: 264,
            columnNumber: 29
          }, this)
        ] }, `edit-message-${mi}-row-${i}-component-${component.type}-${ci}-option-${oi}`, true, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 208,
          columnNumber: 64
        }, this)) }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 207,
          columnNumber: 23
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(Button, { className: "", disabled: component.options.length >= 25, onClick: () => {
          component.options.push({
            label: "",
            value: ""
          });
          setData({
            ...data
          });
        }, children: "Add Option" }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 272,
          columnNumber: 23
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/editor/ComponentEditor.tsx",
        lineNumber: 206,
        columnNumber: 69
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/editor/ComponentEditor.tsx",
      lineNumber: 187,
      columnNumber: 192
    }, this) }, `edit-message-${mi}-row-${i}-component-${component.type}-${ci}`, false, {
      fileName: "app/components/editor/ComponentEditor.tsx",
      lineNumber: 143,
      columnNumber: 48
    }, this)) }, void 0, false, {
      fileName: "app/components/editor/ComponentEditor.tsx",
      lineNumber: 142,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(ButtonSelect, { name: "component-type", options: [{
      label: "Button",
      value: "button",
      isDisabled: getRowWidth(row) >= 5
    }, {
      label: "Link Button",
      value: "link-button",
      isDisabled: getRowWidth(row) >= 5
    }, {
      label: "String Select Menu",
      value: "string-select",
      isDisabled: getRowWidth(row) > 0
    }, {
      label: "User Select Menu",
      value: "user-select",
      isDisabled: getRowWidth(row) > 0
    }, {
      label: "Role Select Menu",
      value: "role-select",
      isDisabled: getRowWidth(row) > 0
    }, {
      label: "User & Role Select Menu",
      value: "mentionable-select",
      isDisabled: getRowWidth(row) > 0
    }, {
      label: "Channel Select Menu",
      value: "channel-select",
      isDisabled: getRowWidth(row) > 0
    }], isDisabled: getRowWidth(row) >= 5, onChange: (v) => {
      const {
        value: type
      } = v;
      switch (type) {
        case "button": {
          row.components.push({
            type: ComponentType.Button,
            style: ButtonStyle.Primary,
            custom_id: ""
          });
          break;
        }
        case "link-button": {
          row.components.push({
            type: ComponentType.Button,
            style: ButtonStyle.Link,
            url: ""
          });
          break;
        }
        case "string-select": {
          row.components.push({
            type: ComponentType.StringSelect,
            options: [],
            custom_id: ""
          });
          break;
        }
        case "user-select": {
          row.components.push({
            custom_id: "",
            type: ComponentType.UserSelect
          });
          break;
        }
        case "role-select": {
          row.components.push({
            custom_id: "",
            type: ComponentType.RoleSelect
          });
          break;
        }
        case "mentionable-select": {
          row.components.push({
            custom_id: "",
            type: ComponentType.MentionableSelect
          });
          break;
        }
        case "channel-select": {
          row.components.push({
            custom_id: "",
            type: ComponentType.ChannelSelect
          });
          break;
        }
        default:
          break;
      }
      setData({
        ...data
      });
    }, children: "Add Component" }, void 0, false, {
      fileName: "app/components/editor/ComponentEditor.tsx",
      lineNumber: 287,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/editor/ComponentEditor.tsx",
    lineNumber: 96,
    columnNumber: 10
  }, this);
};
_c8 = ActionRowEditor;
var ButtonStylePicker = ({
  style,
  component,
  update
}) => /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(Button, { className: "block min-h-0 h-7 !p-0", discordstyle: style, onClick: () => {
  component.style = style;
  update();
}, children: component.style === style && /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(CoolIcon, { icon: "Check", className: "text-xl" }, void 0, false, {
  fileName: "app/components/editor/ComponentEditor.tsx",
  lineNumber: 399,
  columnNumber: 35
}, this) }, void 0, false, {
  fileName: "app/components/editor/ComponentEditor.tsx",
  lineNumber: 395,
  columnNumber: 7
}, this);
_c24 = ButtonStylePicker;
var IndividualComponentEditor = ({
  component,
  index,
  row,
  updateRow,
  open,
  children
}) => {
  const previewText = getComponentText(component);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("details", { className: "group/component pb-2 -my-1", open, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("summary", { className: "group-open/component:mb-2 transition-[margin] marker:content-none marker-none flex text-base text-gray-600 dark:text-gray-400 font-semibold cursor-default select-none", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(CoolIcon, { icon: "Chevron_Right", className: "group-open/component:rotate-90 mr-2 my-auto transition-transform" }, void 0, false, {
        fileName: "app/components/editor/ComponentEditor.tsx",
        lineNumber: 413,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("span", { className: "shrink-0", children: component.type === ComponentType.Button ? `Button ${index + 1}` : /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(import_jsx_dev_runtime8.Fragment, { children: [
        (component.type === ComponentType.UserSelect ? "User" : component.type === ComponentType.RoleSelect ? "Role" : component.type === ComponentType.MentionableSelect ? "User & Role" : component.type === ComponentType.ChannelSelect ? "Channel" : "") + " ",
        "Select Menu"
      ] }, void 0, true, {
        fileName: "app/components/editor/ComponentEditor.tsx",
        lineNumber: 415,
        columnNumber: 78
      }, this) }, void 0, false, {
        fileName: "app/components/editor/ComponentEditor.tsx",
        lineNumber: 414,
        columnNumber: 9
      }, this),
      previewText && /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("span", { className: "truncate ml-1", children: [
        "- ",
        previewText
      ] }, void 0, true, {
        fileName: "app/components/editor/ComponentEditor.tsx",
        lineNumber: 420,
        columnNumber: 25
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "ml-auto text-lg space-x-2.5 my-auto shrink-0", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("button", { className: index === 0 ? "hidden" : "", onClick: () => {
          row.components.splice(index, 1);
          row.components.splice(index - 1, 0, component);
          updateRow();
        }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(CoolIcon, { icon: "Chevron_Up" }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 427,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 422,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("button", { className: index === row.components.length - 1 ? "hidden" : "", onClick: () => {
          row.components.splice(index, 1);
          row.components.splice(index + 1, 0, component);
          updateRow();
        }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(CoolIcon, { icon: "Chevron_Down" }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 434,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 429,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("button", { className: getRowWidth(row) >= 5 ? "hidden" : "", onClick: () => {
          row.components.splice(index + 1, 0, structuredClone(component));
          updateRow();
        }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(CoolIcon, { icon: "Copy" }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 440,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 436,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("button", { onClick: () => {
          row.components.splice(index, 1);
          updateRow();
        }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(CoolIcon, { icon: "Trash_Full" }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 446,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 442,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/editor/ComponentEditor.tsx",
        lineNumber: 421,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/editor/ComponentEditor.tsx",
      lineNumber: 412,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "space-y-2 mb-2", children }, void 0, false, {
      fileName: "app/components/editor/ComponentEditor.tsx",
      lineNumber: 450,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/editor/ComponentEditor.tsx",
    lineNumber: 411,
    columnNumber: 10
  }, this);
};
_c34 = IndividualComponentEditor;
var SelectMenuOptionsSection = ({
  option,
  index,
  component,
  update,
  open,
  children
}) => {
  const previewText = option.label || option.description || option.value;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("details", { className: "group/select-option pb-2 -my-1", open, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("summary", { className: "group-open/select-option:mb-2 transition-[margin] marker:content-none marker-none flex text-base text-gray-600 dark:text-gray-400 font-semibold cursor-default select-none", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(CoolIcon, { icon: "Chevron_Right", className: "group-open/select-option:rotate-90 mr-2 my-auto transition-transform" }, void 0, false, {
        fileName: "app/components/editor/ComponentEditor.tsx",
        lineNumber: 465,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("span", { className: "shrink-0", children: [
        "Option ",
        index + 1
      ] }, void 0, true, {
        fileName: "app/components/editor/ComponentEditor.tsx",
        lineNumber: 466,
        columnNumber: 9
      }, this),
      previewText && /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("span", { className: "truncate ml-1", children: [
        "- ",
        previewText
      ] }, void 0, true, {
        fileName: "app/components/editor/ComponentEditor.tsx",
        lineNumber: 467,
        columnNumber: 25
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "ml-auto text-lg space-x-2.5 my-auto shrink-0", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("button", { className: index === 0 ? "hidden" : "", onClick: () => {
          component.options.splice(index, 1);
          component.options.splice(index - 1, 0, option);
          update();
        }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(CoolIcon, { icon: "Chevron_Up" }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 474,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 469,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("button", { className: index === component.options.length - 1 ? "hidden" : "", onClick: () => {
          component.options.splice(index, 1);
          component.options.splice(index + 1, 0, option);
          update();
        }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(CoolIcon, { icon: "Chevron_Down" }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 481,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 476,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("button", { className: component.options.length >= 25 ? "hidden" : "", onClick: () => {
          component.options.splice(index + 1, 0, structuredClone(option));
          update();
        }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(CoolIcon, { icon: "Copy" }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 487,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 483,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("button", { onClick: () => {
          component.options.splice(index, 1);
          update();
        }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(CoolIcon, { icon: "Trash_Full" }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 493,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/components/editor/ComponentEditor.tsx",
          lineNumber: 489,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/editor/ComponentEditor.tsx",
        lineNumber: 468,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/editor/ComponentEditor.tsx",
      lineNumber: 464,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "space-y-2 mb-2", children }, void 0, false, {
      fileName: "app/components/editor/ComponentEditor.tsx",
      lineNumber: 497,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/editor/ComponentEditor.tsx",
    lineNumber: 463,
    columnNumber: 10
  }, this);
};
_c44 = SelectMenuOptionsSection;
var _c8;
var _c24;
var _c34;
var _c44;
$RefreshReg$(_c8, "ActionRowEditor");
$RefreshReg$(_c24, "ButtonStylePicker");
$RefreshReg$(_c34, "IndividualComponentEditor");
$RefreshReg$(_c44, "SelectMenuOptionsSection");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/components/editor/EmbedEditor.tsx
var import_jsx_dev_runtime9 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\components\\\\editor\\\\EmbedEditor.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\components\\editor\\EmbedEditor.tsx"
  );
  import.meta.hot.lastModified = "1702866248054.8035";
}
var getEmbedText = (embed) => embed.author?.name || embed.title || (embed.fields ? embed.fields.find((f) => !!f.name)?.name : void 0) || embed.description || embed.footer?.text;
var getEmbedLength = (embed) => {
  let totalCharacters = (embed.title ?? "").length + (embed.description ?? "").length + (embed.author?.name ?? "").length + (embed.footer?.text ?? "").length;
  const fieldLengths = (embed.fields ?? []).map((f) => f.name.length + f.value.length);
  if (fieldLengths.length > 0) {
    totalCharacters += fieldLengths.reduce((a, b) => a + b);
  }
  return totalCharacters;
};
var getEmbedErrors = (embed) => {
  const errors = [];
  const totalCharacters = getEmbedLength(embed);
  if (totalCharacters === 0 && !embed.image?.url && !embed.thumbnail?.url) {
    errors.push(strings2.embedEmpty);
  }
  return errors;
};
var strings2 = {
  embedEmpty: "Must contain text or an image"
};
var EmbedEditor = ({
  message,
  messageIndex: mi,
  embed,
  embedIndex: i,
  data,
  setData,
  open
}) => {
  const updateEmbed = (partialEmbed) => {
    if (partialEmbed.author && !partialEmbed.author.name && !partialEmbed.author.icon_url && !partialEmbed.author.url) {
      partialEmbed.author = void 0;
    }
    if (partialEmbed.footer && !partialEmbed.footer.text && !partialEmbed.footer.icon_url) {
      partialEmbed.footer = void 0;
    }
    message.data.embeds.splice(i, 1, {
      ...embed,
      ...partialEmbed
    });
    setData({
      ...data
    });
  };
  const galleryEmbeds = message.data.embeds.filter((e) => embed.url && e.url === embed.url);
  const galleryChildren = galleryEmbeds.slice(1);
  const isChild = galleryChildren.includes(embed);
  const localIndex = isChild ? galleryChildren.indexOf(embed) : i;
  const localIndexMax = isChild ? galleryChildren.length - 1 : message.data.embeds.length - 1;
  const localMaxMembers = isChild ? 3 : 10;
  const previewText = getEmbedText(embed);
  const errors = getEmbedErrors(embed);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("details", { className: "group/embed rounded p-2 bg-gray-100 dark:bg-gray-800 border border-l-4 border-gray-300 dark:border-gray-700 border-l-gray-500 dark:border-l-[#1E1F22] shadow", open, style: embed.color ? {
    borderLeftColor: `#${embed.color.toString(16)}`
  } : void 0, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("summary", { className: "group-open/embed:mb-2 py-1 px-1 transition-[margin] marker:content-none marker-none flex text-lg font-semibold cursor-default select-none", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(CoolIcon, { icon: "Chevron_Right", className: "group-open/embed:rotate-90 mr-2 my-auto transition-transform" }, void 0, false, {
        fileName: "app/components/editor/EmbedEditor.tsx",
        lineNumber: 87,
        columnNumber: 9
      }, this),
      errors.length > 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(CoolIcon, { icon: "Circle_Warning", className: "my-auto text-rose-600 dark:text-rose-400 mr-1.5" }, void 0, false, {
        fileName: "app/components/editor/EmbedEditor.tsx",
        lineNumber: 88,
        columnNumber: 31
      }, this),
      isChild ? /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(import_jsx_dev_runtime9.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("span", { className: "shrink-0", children: [
          "Gallery Image ",
          localIndex + 2
        ] }, void 0, true, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 90,
          columnNumber: 13
        }, this),
        embed.image?.url && /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("span", { className: "truncate ml-1", children: [
          " - ",
          embed.image.url
        ] }, void 0, true, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 91,
          columnNumber: 34
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/editor/EmbedEditor.tsx",
        lineNumber: 89,
        columnNumber: 20
      }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(import_jsx_dev_runtime9.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("span", { className: "shrink-0", children: [
          "Embed ",
          i + 1
        ] }, void 0, true, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 93,
          columnNumber: 13
        }, this),
        previewText ? /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("span", { className: "truncate ml-1", children: [
          "- ",
          previewText
        ] }, void 0, true, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 94,
          columnNumber: 28
        }, this) : ""
      ] }, void 0, true, {
        fileName: "app/components/editor/EmbedEditor.tsx",
        lineNumber: 92,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "ml-auto text-xl space-x-2.5 my-auto shrink-0", children: [
        !isChild && // Was having issues with this, may re-introduce later
        // For now users just have to manually move gallery items
        /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(import_jsx_dev_runtime9.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("button", { className: localIndex === 0 ? "hidden" : "", onClick: () => {
            message.data.embeds.splice(i, 1);
            message.data.embeds.splice(i - 1, 0, embed);
            setData({
              ...data
            });
          }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(CoolIcon, { icon: "Chevron_Up" }, void 0, false, {
            fileName: "app/components/editor/EmbedEditor.tsx",
            lineNumber: 108,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "app/components/editor/EmbedEditor.tsx",
            lineNumber: 101,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("button", { className: localIndex === localIndexMax ? "hidden" : "", onClick: () => {
            message.data.embeds.splice(i, 1);
            message.data.embeds.splice(i + 1, 0, embed);
            setData({
              ...data
            });
          }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(CoolIcon, { icon: "Chevron_Down" }, void 0, false, {
            fileName: "app/components/editor/EmbedEditor.tsx",
            lineNumber: 117,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "app/components/editor/EmbedEditor.tsx",
            lineNumber: 110,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("button", { className: localIndexMax + 1 >= localMaxMembers ? "hidden" : "", onClick: () => {
            message.data.embeds.splice(i + 1, 0, structuredClone(embed));
            setData({
              ...data
            });
          }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(CoolIcon, { icon: "Copy" }, void 0, false, {
            fileName: "app/components/editor/EmbedEditor.tsx",
            lineNumber: 125,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "app/components/editor/EmbedEditor.tsx",
            lineNumber: 119,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 100,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("button", { onClick: () => {
          message.data.embeds.splice(i, 1);
          setData({
            ...data
          });
        }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(CoolIcon, { icon: "Trash_Full" }, void 0, false, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 134,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 128,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/editor/EmbedEditor.tsx",
        lineNumber: 96,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/editor/EmbedEditor.tsx",
      lineNumber: 86,
      columnNumber: 7
    }, this),
    errors.length > 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "-mt-1 mb-1", children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(InfoBox, { severity: "red", icon: "Circle_Warning", children: errors.join("\n") }, void 0, false, {
      fileName: "app/components/editor/EmbedEditor.tsx",
      lineNumber: 139,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "app/components/editor/EmbedEditor.tsx",
      lineNumber: 138,
      columnNumber: 29
    }, this),
    !isChild && /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(import_jsx_dev_runtime9.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(EmbedEditorSection, { name: "Author", open, children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "flex", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "grow", children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(TextInput, { label: "Name", className: "w-full", maxLength: 256, value: embed.author?.name ?? "", onInput: (e) => updateEmbed({
            author: {
              ...embed.author ?? {},
              name: e.currentTarget.value
            }
          }) }, void 0, false, {
            fileName: "app/components/editor/EmbedEditor.tsx",
            lineNumber: 147,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "app/components/editor/EmbedEditor.tsx",
            lineNumber: 146,
            columnNumber: 15
          }, this),
          embed.author?.url === void 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(Button, { className: "ml-2 mt-auto shrink-0", onClick: () => updateEmbed({
            author: {
              ...embed.author ?? {
                name: ""
              },
              url: location.origin
            }
          }), children: "Add URL" }, void 0, false, {
            fileName: "app/components/editor/EmbedEditor.tsx",
            lineNumber: 154,
            columnNumber: 51
          }, this)
        ] }, void 0, true, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 145,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "grid gap-2 mt-2", children: [
          embed.author?.url !== void 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "flex", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "grow", children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(TextInput, { label: "Author URL", className: "w-full", type: "url", value: embed.author?.url ?? "", onInput: (e) => updateEmbed({
              author: {
                ...embed.author ?? {
                  name: ""
                },
                url: e.currentTarget.value
              }
            }) }, void 0, false, {
              fileName: "app/components/editor/EmbedEditor.tsx",
              lineNumber: 168,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "app/components/editor/EmbedEditor.tsx",
              lineNumber: 167,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(Button, { className: "ml-2 mt-auto shrink-0", onClick: () => updateEmbed({
              author: {
                ...embed.author ?? {
                  name: ""
                },
                url: void 0
              }
            }), children: [
              "Remove",
              /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("span", { className: "hidden sm:inline", children: " URL" }, void 0, false, {
                fileName: "app/components/editor/EmbedEditor.tsx",
                lineNumber: 186,
                columnNumber: 21
              }, this)
            ] }, void 0, true, {
              fileName: "app/components/editor/EmbedEditor.tsx",
              lineNumber: 177,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "app/components/editor/EmbedEditor.tsx",
            lineNumber: 166,
            columnNumber: 51
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(TextInput, { label: "Icon URL", className: "w-full", type: "url", value: embed.author?.icon_url ?? "", onInput: (e) => updateEmbed({
            author: {
              ...embed.author ?? {
                name: ""
              },
              icon_url: e.currentTarget.value
            }
          }) }, void 0, false, {
            fileName: "app/components/editor/EmbedEditor.tsx",
            lineNumber: 189,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 165,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/editor/EmbedEditor.tsx",
        lineNumber: 144,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("hr", { className: "border border-gray-500/20" }, void 0, false, {
        fileName: "app/components/editor/EmbedEditor.tsx",
        lineNumber: 199,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/editor/EmbedEditor.tsx",
      lineNumber: 143,
      columnNumber: 20
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(EmbedEditorSection, { name: "Body", open, children: [
      !isChild && /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(import_jsx_dev_runtime9.Fragment, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "flex", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "grow", children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(TextInput, { label: "Title", className: "w-full", maxLength: 256, value: embed.title ?? "", onInput: (e) => updateEmbed({
          title: e.currentTarget.value || void 0
        }) }, void 0, false, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 205,
          columnNumber: 17
        }, this) }, void 0, false, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 204,
          columnNumber: 15
        }, this),
        embed.url === void 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(Button, { className: "ml-2 mt-auto shrink-0", onClick: () => updateEmbed({
          url: location.origin + `#default-${randomString(8)}`
        }), children: "Add URL" }, void 0, false, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 209,
          columnNumber: 43
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/editor/EmbedEditor.tsx",
        lineNumber: 203,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "app/components/editor/EmbedEditor.tsx",
        lineNumber: 202,
        columnNumber: 22
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "grid gap-2", children: [
        (isChild || embed.url !== void 0) && /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "flex", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "grow", children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(TextInput, { label: "Title URL", description: isChild ? "This is set automatically by the main embed in the gallery. Only change this if you want to change which gallery this image belongs to." : void 0, className: "w-full", type: "url", value: embed.url ?? "", onInput: (e) => {
            for (const emb of galleryEmbeds) {
              emb.url = e.currentTarget.value;
            }
            setData({
              ...data
            });
          } }, void 0, false, {
            fileName: "app/components/editor/EmbedEditor.tsx",
            lineNumber: 219,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "app/components/editor/EmbedEditor.tsx",
            lineNumber: 218,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(Button, { disabled: isChild, className: "ml-2 mt-auto shrink-0", onClick: () => {
            embed.url = void 0;
            message.data.embeds = message.data.embeds.filter((e) => !galleryChildren.includes(e));
            setData({
              ...data
            });
          }, children: [
            "Remove",
            /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("span", { className: "hidden sm:inline", children: " URL" }, void 0, false, {
              fileName: "app/components/editor/EmbedEditor.tsx",
              lineNumber: 236,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "app/components/editor/EmbedEditor.tsx",
            lineNumber: 228,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 217,
          columnNumber: 52
        }, this),
        !isChild && /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("details", { className: "relative", children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("summary", { className: "flex cursor-pointer", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "grow", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("p", { className: "text-sm font-medium", children: "Sidebar Color" }, void 0, false, {
              fileName: "app/components/editor/EmbedEditor.tsx",
              lineNumber: 242,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("p", { className: "rounded border h-9 py-0 px-[14px] bg-gray-300 dark:border-transparent dark:bg-[#292b2f]", children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("span", { className: "align-middle", children: embed.color ? `#${embed.color.toString(16)}` : "Click to set" }, void 0, false, {
              fileName: "app/components/editor/EmbedEditor.tsx",
              lineNumber: 244,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "app/components/editor/EmbedEditor.tsx",
              lineNumber: 243,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "app/components/editor/EmbedEditor.tsx",
            lineNumber: 241,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "h-9 w-9 mt-auto rounded ml-2 bg-gray-500", style: {
            backgroundColor: embed.color ? `#${embed.color.toString(16)}` : void 0
          } }, void 0, false, {
            fileName: "app/components/editor/EmbedEditor.tsx",
            lineNumber: 249,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 240,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 239,
          columnNumber: 24
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/editor/EmbedEditor.tsx",
        lineNumber: 216,
        columnNumber: 9
      }, this),
      !isChild && /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(TextArea, { label: "Description", className: "w-full h-40", value: embed.description ?? "", maxLength: 4096, onInput: (e) => updateEmbed({
        description: e.currentTarget.value || void 0
      }) }, void 0, false, {
        fileName: "app/components/editor/EmbedEditor.tsx",
        lineNumber: 266,
        columnNumber: 22
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/editor/EmbedEditor.tsx",
      lineNumber: 201,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("hr", { className: "border border-gray-500/20" }, void 0, false, {
      fileName: "app/components/editor/EmbedEditor.tsx",
      lineNumber: 270,
      columnNumber: 7
    }, this),
    !isChild && /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(import_jsx_dev_runtime9.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(EmbedEditorSection, { name: "Fields", open, children: [
        embed.fields && /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "ml-2 md:ml-4 transition-[margin-left]", children: embed.fields.map((field, fi) => /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(EmbedFieldEditorSection, { embed, updateEmbed, field, index: fi, open, children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "flex", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "grow", children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(TextInput, { label: "Name", value: field.name, maxLength: 256, className: "w-full", onInput: (e) => {
              field.name = e.currentTarget.value;
              updateEmbed({});
            } }, void 0, false, {
              fileName: "app/components/editor/EmbedEditor.tsx",
              lineNumber: 277,
              columnNumber: 25
            }, this) }, void 0, false, {
              fileName: "app/components/editor/EmbedEditor.tsx",
              lineNumber: 276,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "ml-2 my-auto", children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(Checkbox, { label: "Inline", checked: field.inline ?? false, onChange: (e) => {
              field.inline = e.currentTarget.checked;
              updateEmbed({});
            } }, void 0, false, {
              fileName: "app/components/editor/EmbedEditor.tsx",
              lineNumber: 283,
              columnNumber: 25
            }, this) }, void 0, false, {
              fileName: "app/components/editor/EmbedEditor.tsx",
              lineNumber: 282,
              columnNumber: 23
            }, this)
          ] }, void 0, true, {
            fileName: "app/components/editor/EmbedEditor.tsx",
            lineNumber: 275,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(TextArea, { label: "Value", value: field.value, maxLength: 1024, className: "w-full", onInput: (e) => {
            field.value = e.currentTarget.value;
            updateEmbed({});
          } }, void 0, false, {
            fileName: "app/components/editor/EmbedEditor.tsx",
            lineNumber: 289,
            columnNumber: 21
          }, this)
        ] }, `edit-message-${mi}-embed-${i}-field-${fi}`, true, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 274,
          columnNumber: 50
        }, this)) }, void 0, false, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 273,
          columnNumber: 30
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(Button, { disabled: !!embed.fields && embed.fields.length >= 25, onClick: () => updateEmbed({
          fields: [...embed.fields ?? [], {
            name: "",
            value: ""
          }]
        }), children: "Add Field" }, void 0, false, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 295,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/editor/EmbedEditor.tsx",
        lineNumber: 272,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("hr", { className: "border border-gray-500/20" }, void 0, false, {
        fileName: "app/components/editor/EmbedEditor.tsx",
        lineNumber: 304,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/editor/EmbedEditor.tsx",
      lineNumber: 271,
      columnNumber: 20
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(EmbedEditorSection, { name: "Images", open: isChild || open, children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "flex", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "grow", children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(TextInput, { label: "Large Image URL", type: "url", className: "w-full", value: embed.image?.url ?? "", onInput: (e) => updateEmbed({
          image: {
            url: e.currentTarget.value
          }
        }) }, void 0, false, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 309,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 308,
          columnNumber: 11
        }, this),
        !galleryChildren.includes(embed) && /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(Button, { className: "ml-2 mt-auto shrink-0", disabled: !embed.image?.url || message.data.embeds.length >= 10 || galleryEmbeds.length >= 4, onClick: () => {
          const url = embed.url || location.origin + `#gallery-${randomString(8)}`;
          embed.url = url;
          message.data.embeds = message.data.embeds ?? [];
          message.data.embeds.splice(i + 1, 0, {
            url
          });
          setData({
            ...data
          });
        }, children: "Add Another" }, void 0, false, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 315,
          columnNumber: 48
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/editor/EmbedEditor.tsx",
        lineNumber: 307,
        columnNumber: 9
      }, this),
      !isChild && /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(TextInput, { label: "Thumbnail URL", type: "url", className: "w-full", value: embed.thumbnail?.url ?? "", onInput: (e) => updateEmbed({
        thumbnail: {
          url: e.currentTarget.value
        }
      }) }, void 0, false, {
        fileName: "app/components/editor/EmbedEditor.tsx",
        lineNumber: 329,
        columnNumber: 22
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/editor/EmbedEditor.tsx",
      lineNumber: 306,
      columnNumber: 7
    }, this),
    !isChild && /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(import_jsx_dev_runtime9.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("hr", { className: "border border-gray-500/20" }, void 0, false, {
        fileName: "app/components/editor/EmbedEditor.tsx",
        lineNumber: 336,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(EmbedEditorSection, { name: "Footer", open, children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "flex", children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "grow", children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(TextInput, { label: "Text", className: "w-full", maxLength: 2048, value: embed.footer?.text ?? "", onInput: (e) => updateEmbed({
          footer: {
            ...embed.footer ?? {},
            text: e.currentTarget.value
          }
        }) }, void 0, false, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 340,
          columnNumber: 17
        }, this) }, void 0, false, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 339,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 338,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "grid gap-2 mt-2", children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(TextInput, { label: "Icon URL", className: "w-full", type: "url", value: embed.footer?.icon_url ?? "", onInput: (e) => updateEmbed({
          footer: {
            ...embed.footer ?? {
              text: ""
            },
            icon_url: e.currentTarget.value
          }
        }) }, void 0, false, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 349,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 348,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/editor/EmbedEditor.tsx",
        lineNumber: 337,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/editor/EmbedEditor.tsx",
      lineNumber: 335,
      columnNumber: 20
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/editor/EmbedEditor.tsx",
    lineNumber: 83,
    columnNumber: 10
  }, this);
};
_c9 = EmbedEditor;
var EmbedEditorSection = ({
  name,
  open,
  children
}) => {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("details", { className: "group/section p-2", open, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("summary", { className: "group-open/section:mb-2 transition-[margin] marker:content-none marker-none flex text-base text-gray-600 dark:text-gray-400 font-semibold cursor-default select-none", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(CoolIcon, { icon: "Chevron_Right", className: "group-open/section:rotate-90 mr-2 my-auto transition-transform" }, void 0, false, {
        fileName: "app/components/editor/EmbedEditor.tsx",
        lineNumber: 370,
        columnNumber: 9
      }, this),
      name
    ] }, void 0, true, {
      fileName: "app/components/editor/EmbedEditor.tsx",
      lineNumber: 369,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "space-y-2", children }, void 0, false, {
      fileName: "app/components/editor/EmbedEditor.tsx",
      lineNumber: 373,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/editor/EmbedEditor.tsx",
    lineNumber: 368,
    columnNumber: 10
  }, this);
};
_c25 = EmbedEditorSection;
var EmbedFieldEditorSection = ({
  embed,
  updateEmbed,
  field,
  index,
  open,
  children
}) => {
  const previewText = field.name.trim() || field.value.trim();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("details", { className: "group/field pb-2 -my-1", open, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("summary", { className: "group-open/field:mb-2 transition-[margin] marker:content-none marker-none flex text-base text-gray-600 dark:text-gray-400 font-semibold cursor-default select-none", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(CoolIcon, { icon: "Chevron_Right", className: "group-open/field:rotate-90 mr-2 my-auto transition-transform" }, void 0, false, {
        fileName: "app/components/editor/EmbedEditor.tsx",
        lineNumber: 388,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("span", { className: "shrink-0", children: [
        "Field ",
        index + 1
      ] }, void 0, true, {
        fileName: "app/components/editor/EmbedEditor.tsx",
        lineNumber: 389,
        columnNumber: 9
      }, this),
      previewText && /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("span", { className: "truncate ml-1", children: [
        "- ",
        previewText
      ] }, void 0, true, {
        fileName: "app/components/editor/EmbedEditor.tsx",
        lineNumber: 390,
        columnNumber: 25
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "ml-auto text-lg space-x-2.5 my-auto shrink-0", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("button", { className: index === 0 ? "hidden" : "", onClick: () => {
          embed.fields.splice(index, 1);
          embed.fields.splice(index - 1, 0, field);
          updateEmbed({});
        }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(CoolIcon, { icon: "Chevron_Up" }, void 0, false, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 397,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 392,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("button", { className: index === embed.fields.length - 1 ? "hidden" : "", onClick: () => {
          embed.fields.splice(index, 1);
          embed.fields.splice(index + 1, 0, field);
          updateEmbed({});
        }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(CoolIcon, { icon: "Chevron_Down" }, void 0, false, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 404,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 399,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("button", { className: embed.fields.length >= 25 ? "hidden" : "", onClick: () => {
          embed.fields.splice(index + 1, 0, structuredClone(field));
          updateEmbed({});
        }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(CoolIcon, { icon: "Copy" }, void 0, false, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 410,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 406,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("button", { onClick: () => {
          embed.fields.splice(index, 1);
          updateEmbed({});
        }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(CoolIcon, { icon: "Trash_Full" }, void 0, false, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 416,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/components/editor/EmbedEditor.tsx",
          lineNumber: 412,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/editor/EmbedEditor.tsx",
        lineNumber: 391,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/editor/EmbedEditor.tsx",
      lineNumber: 387,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "space-y-2", children }, void 0, false, {
      fileName: "app/components/editor/EmbedEditor.tsx",
      lineNumber: 420,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/editor/EmbedEditor.tsx",
    lineNumber: 386,
    columnNumber: 10
  }, this);
};
_c35 = EmbedFieldEditorSection;
var _c9;
var _c25;
var _c35;
$RefreshReg$(_c9, "EmbedEditor");
$RefreshReg$(_c25, "EmbedEditorSection");
$RefreshReg$(_c35, "EmbedFieldEditorSection");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/components/editor/MessageEditor.tsx
var import_jsx_dev_runtime10 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\components\\\\editor\\\\MessageEditor.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\components\\editor\\MessageEditor.tsx"
  );
  import.meta.hot.lastModified = "1702866320168.6233";
}
var strings3 = {
  embedsTooLarge: "Embeds must contain at most 6000 characters total (currently {0} too many)"
};
var getMessageText = (message) => message.content ?? (message.embeds ? message.embeds.map(getEmbedText).find((t) => !!t) : void 0);
var MessageEditor = ({
  index: i,
  data,
  discordApplicationId,
  setData,
  setSettingMessageIndex,
  webhooks
}) => {
  const message = data.messages[i];
  const embedsLength = message.data.embeds && message.data.embeds.length > 0 ? message.data.embeds.map(getEmbedLength).reduce((a, b) => a + b) : 0;
  const previewText = getMessageText(message.data);
  const authorTypes = webhooks ? webhooks.map((w) => getAuthorType(discordApplicationId, w)) : [];
  const possiblyActionable = authorTypes.includes(AuthorType.ActionableWebhook);
  const possiblyApplication = authorTypes.includes(AuthorType.ApplicationWebhook);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("details", { className: "group/message mt-4 pb-2", open: true, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("summary", { className: "group-open/message:mb-2 transition-[margin] marker:content-none marker-none flex font-semibold text-base cursor-default select-none", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(CoolIcon, { icon: "Chevron_Right", className: "group-open/message:rotate-90 mr-2 my-auto transition-transform" }, void 0, false, {
        fileName: "app/components/editor/MessageEditor.tsx",
        lineNumber: 48,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("span", { className: "shrink-0", children: [
        "Message ",
        i + 1
      ] }, void 0, true, {
        fileName: "app/components/editor/MessageEditor.tsx",
        lineNumber: 49,
        columnNumber: 9
      }, this),
      previewText && /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("span", { className: "truncate ml-1", children: [
        "- ",
        previewText
      ] }, void 0, true, {
        fileName: "app/components/editor/MessageEditor.tsx",
        lineNumber: 50,
        columnNumber: 25
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("div", { className: "ml-auto space-x-2 my-auto shrink-0", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("button", { className: i === 0 ? "hidden" : "", onClick: () => {
          data.messages.splice(i, 1);
          data.messages.splice(i - 1, 0, message);
          setData({
            ...data
          });
        }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(CoolIcon, { icon: "Chevron_Up" }, void 0, false, {
          fileName: "app/components/editor/MessageEditor.tsx",
          lineNumber: 59,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/components/editor/MessageEditor.tsx",
          lineNumber: 52,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("button", { className: i === data.messages.length - 1 ? "hidden" : "", onClick: () => {
          data.messages.splice(i, 1);
          data.messages.splice(i + 1, 0, message);
          setData({
            ...data
          });
        }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(CoolIcon, { icon: "Chevron_Down" }, void 0, false, {
          fileName: "app/components/editor/MessageEditor.tsx",
          lineNumber: 68,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/components/editor/MessageEditor.tsx",
          lineNumber: 61,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("button", { className: data.messages.length >= 10 ? "hidden" : "", onClick: () => {
          data.messages.splice(i + 1, 0, structuredClone(message));
          setData({
            ...data
          });
        }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(CoolIcon, { icon: "Copy" }, void 0, false, {
          fileName: "app/components/editor/MessageEditor.tsx",
          lineNumber: 76,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/components/editor/MessageEditor.tsx",
          lineNumber: 70,
          columnNumber: 11
        }, this),
        data.messages.length > 1 && /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("button", { onClick: () => {
          data.messages.splice(i, 1);
          setData({
            ...data
          });
        }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(CoolIcon, { icon: "Trash_Full" }, void 0, false, {
          fileName: "app/components/editor/MessageEditor.tsx",
          lineNumber: 84,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "app/components/editor/MessageEditor.tsx",
          lineNumber: 78,
          columnNumber: 40
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/editor/MessageEditor.tsx",
        lineNumber: 51,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/editor/MessageEditor.tsx",
      lineNumber: 47,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("div", { className: "rounded bg-gray-100 dark:bg-gray-800 border-2 border-transparent dark:border-gray-700 p-2 dark:px-3 dark:-mx-1 mt-1 space-y-2", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(TextArea, { label: "Content", className: "w-full h-40", value: message.data.content ?? void 0, maxLength: 2e3, onInput: (e) => {
        message.data.content = e.currentTarget.value || void 0;
        setData({
          ...data
        });
      } }, void 0, false, {
        fileName: "app/components/editor/MessageEditor.tsx",
        lineNumber: 89,
        columnNumber: 9
      }, this),
      message.data.embeds && message.data.embeds.length > 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("div", { className: "mt-1 space-y-1", children: [
        embedsLength > 6e3 && /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("div", { className: "-mb-2", children: /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(InfoBox, { severity: "red", icon: "Circle_Warning", children: strings3.embedsTooLarge }, void 0, false, {
          fileName: "app/components/editor/MessageEditor.tsx",
          lineNumber: 97,
          columnNumber: 17
        }, this) }, void 0, false, {
          fileName: "app/components/editor/MessageEditor.tsx",
          lineNumber: 96,
          columnNumber: 37
        }, this),
        message.data.embeds.map((embed, ei) => /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(EmbedEditor, { message, messageIndex: i, embed, embedIndex: ei, data, setData }, `edit-message-${i}-embed-${ei}`, false, {
          fileName: "app/components/editor/MessageEditor.tsx",
          lineNumber: 105,
          columnNumber: 53
        }, this))
      ] }, void 0, true, {
        fileName: "app/components/editor/MessageEditor.tsx",
        lineNumber: 95,
        columnNumber: 67
      }, this),
      message.data.components && message.data.components.length > 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(import_jsx_dev_runtime10.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("p", { className: "mt-1 text-lg font-semibold cursor-default select-none", children: "Components" }, void 0, false, {
          fileName: "app/components/editor/MessageEditor.tsx",
          lineNumber: 108,
          columnNumber: 13
        }, this),
        !possiblyActionable && /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(InfoBox, { icon: "Info", collapsible: true, open: true, children: !webhooks || webhooks?.length === 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(import_jsx_dev_runtime10.Fragment, { children: "Component availability is dependent on the type of webhook that you send a message with. In order to send link buttons, the webhook must be created by an application (any bot), but to send other buttons and select menus, the webhook must be owned by the Boogiehook application (this website/its bot). Add a webhook for more information." }, void 0, false, {
          fileName: "app/components/editor/MessageEditor.tsx",
          lineNumber: 112,
          columnNumber: 56
        }, this) : possiblyApplication ? /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(import_jsx_dev_runtime10.Fragment, { children: "One or more of your webhooks are owned by an application, but not Boogiehook, so you can only add link buttons. Add a webhook owned by the Boogiehook bot to be able to use more types of components." }, void 0, false, {
          fileName: "app/components/editor/MessageEditor.tsx",
          lineNumber: 119,
          columnNumber: 47
        }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(import_jsx_dev_runtime10.Fragment, { children: "None of your webhooks are compatibile with components. Add a webhook owned by the Boogiehook bot." }, void 0, false, {
          fileName: "app/components/editor/MessageEditor.tsx",
          lineNumber: 124,
          columnNumber: 25
        }, this) }, void 0, false, {
          fileName: "app/components/editor/MessageEditor.tsx",
          lineNumber: 111,
          columnNumber: 37
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("div", { className: "mt-1 space-y-1 rounded p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow", children: message.data.components.map((row, ri) => /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(ActionRowEditor, { message, row, rowIndex: ri, data, setData, open: true }, void 0, false, {
            fileName: "app/components/editor/MessageEditor.tsx",
            lineNumber: 131,
            columnNumber: 19
          }, this),
          ri < message.data.components.length - 1 && /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("hr", { className: "border border-gray-500/20 my-2" }, void 0, false, {
            fileName: "app/components/editor/MessageEditor.tsx",
            lineNumber: 132,
            columnNumber: 63
          }, this)
        ] }, `edit-message-${i}-row-${ri}`, true, {
          fileName: "app/components/editor/MessageEditor.tsx",
          lineNumber: 130,
          columnNumber: 57
        }, this)) }, void 0, false, {
          fileName: "app/components/editor/MessageEditor.tsx",
          lineNumber: 129,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/editor/MessageEditor.tsx",
        lineNumber: 107,
        columnNumber: 75
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("div", { className: "flex", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(Button, { onClick: () => setSettingMessageIndex(i), children: message.reference ? "Change Reference" : "Set Reference" }, void 0, false, {
          fileName: "app/components/editor/MessageEditor.tsx",
          lineNumber: 137,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(Button, { className: "ml-auto", onClick: () => {
          message.data.embeds = message.data.embeds ? [...message.data.embeds, {}] : [{}];
          setData({
            ...data
          });
        }, disabled: !!message.data.embeds && message.data.embeds.length >= 10, children: "Add Embed" }, void 0, false, {
          fileName: "app/components/editor/MessageEditor.tsx",
          lineNumber: 140,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(Button, { className: "ml-2", onClick: () => {
          const emptyRow = {
            type: 1,
            components: []
          };
          message.data.components = message.data.components ? [...message.data.components, emptyRow] : [emptyRow];
          setData({
            ...data
          });
        }, disabled: !!message.data.components && message.data.components.length >= 5, children: message.data.components && message.data.components.length >= 1 ? "Add Row" : "Add Components" }, void 0, false, {
          fileName: "app/components/editor/MessageEditor.tsx",
          lineNumber: 148,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/editor/MessageEditor.tsx",
        lineNumber: 136,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/editor/MessageEditor.tsx",
      lineNumber: 88,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/editor/MessageEditor.tsx",
    lineNumber: 46,
    columnNumber: 10
  }, this);
};
_c10 = MessageEditor;
var _c10;
$RefreshReg$(_c10, "MessageEditor");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/modals/MessageSendResultModal.tsx
var import_jsx_dev_runtime11 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\modals\\\\MessageSendResultModal.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\modals\\MessageSendResultModal.tsx"
  );
  import.meta.hot.lastModified = "1702866502418.625";
}
var strings4 = {
  title: "Submit Result",
  success: "Success",
  error: "Error",
  fullError: "Full Error:",
  messageDetails: "Message Details",
  messageId: "Message ID:",
  channelId: "Channel ID:",
  createdAt: "Created at:",
  successTroubleshoot: "If you cannot see the message, make sure it wasn't deleted by another bot. Some moderation bots consider all webhook messages to be spam by default."
};
var MessageSendResultModal = (props) => {
  const {
    result
  } = props;
  const success = result?.status === "success";
  return /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)(Modal, { title: strings4.title, ...props, children: result && /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("p", { className: "text-xl font-medium flex", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)(CoolIcon, { icon: success ? "Check" : "Close_MD", className: `mr-1 text-2xl ${success ? "text-green-600" : "text-rose-600"}` }, void 0, false, {
        fileName: "app/modals/MessageSendResultModal.tsx",
        lineNumber: 43,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("span", { className: "my-auto", children: strings4[result.status] }, void 0, false, {
        fileName: "app/modals/MessageSendResultModal.tsx",
        lineNumber: 44,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "app/modals/MessageSendResultModal.tsx",
      lineNumber: 42,
      columnNumber: 11
    }, this),
    success && /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("p", { children: strings4.successTroubleshoot }, void 0, false, {
      fileName: "app/modals/MessageSendResultModal.tsx",
      lineNumber: 46,
      columnNumber: 23
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("hr", { className: "border border-gray-400 dark:border-gray-600 my-4" }, void 0, false, {
      fileName: "app/modals/MessageSendResultModal.tsx",
      lineNumber: 47,
      columnNumber: 11
    }, this),
    success ? /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("div", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("details", { className: "p-2 bg-gray-200 dark:bg-gray-700 rounded", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("summary", { className: "font-medium", children: strings4.messageDetails }, void 0, false, {
        fileName: "app/modals/MessageSendResultModal.tsx",
        lineNumber: 50,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("p", { children: [
        strings4.messageId,
        " ",
        result.data.id,
        /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("br", {}, void 0, false, {
          fileName: "app/modals/MessageSendResultModal.tsx",
          lineNumber: 55,
          columnNumber: 19
        }, this),
        strings4.channelId,
        " ",
        result.data.channel_id,
        /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("br", {}, void 0, false, {
          fileName: "app/modals/MessageSendResultModal.tsx",
          lineNumber: 57,
          columnNumber: 19
        }, this),
        strings4.createdAt,
        " ",
        getSnowflakeDate(result.data.id).toLocaleString()
      ] }, void 0, true, {
        fileName: "app/modals/MessageSendResultModal.tsx",
        lineNumber: 53,
        columnNumber: 17
      }, this)
    ] }, void 0, true, {
      fileName: "app/modals/MessageSendResultModal.tsx",
      lineNumber: 49,
      columnNumber: 15
    }, this) }, void 0, false, {
      fileName: "app/modals/MessageSendResultModal.tsx",
      lineNumber: 48,
      columnNumber: 22
    }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("p", { children: strings4.fullError }, void 0, false, {
        fileName: "app/modals/MessageSendResultModal.tsx",
        lineNumber: 63,
        columnNumber: 15
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("pre", { className: "overflow-x-auto whitespace-pre-wrap rounded bg-gray-200 dark:bg-gray-700 p-2", children: JSON.stringify(result.data, null, 2) }, void 0, false, {
        fileName: "app/modals/MessageSendResultModal.tsx",
        lineNumber: 64,
        columnNumber: 15
      }, this)
    ] }, void 0, true, {
      fileName: "app/modals/MessageSendResultModal.tsx",
      lineNumber: 62,
      columnNumber: 22
    }, this)
  ] }, void 0, true, {
    fileName: "app/modals/MessageSendResultModal.tsx",
    lineNumber: 41,
    columnNumber: 18
  }, this) }, void 0, false, {
    fileName: "app/modals/MessageSendResultModal.tsx",
    lineNumber: 40,
    columnNumber: 10
  }, this);
};
_c11 = MessageSendResultModal;
var _c11;
$RefreshReg$(_c11, "MessageSendResultModal");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/modals/MessageSendModal.tsx
var import_jsx_dev_runtime12 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\modals\\\\MessageSendModal.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s7 = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\modals\\MessageSendModal.tsx"
  );
  import.meta.hot.lastModified = "1703084791533.7852";
}
var strings5 = {
  send: "Send",
  sendToAll: "Send to All",
  sendAll: "Send All",
  noMessages: "You have no messages to send.",
  willBeEdited: "This message has a reference set, so it will be edited.",
  skippedEdit: "Skipped edit due to mismatched webhook ID."
};
var countSelected = (data) => Object.values(data).filter((v) => v).length;
var submitMessage = async (target, message) => {
  let data;
  if (message.reference) {
    data = await updateWebhookMessage(target.id, target.token, message.reference.match(MESSAGE_REF_RE)[3], {
      content: message.data.content?.trim() || void 0,
      embeds: message.data.embeds || void 0
    });
  } else {
    data = await executeWebhook(target.id, target.token, {
      username: message.data.author?.name,
      avatar_url: message.data.author?.icon_url,
      content: message.data.content?.trim() || void 0,
      embeds: message.data.embeds || void 0
    });
  }
  return {
    status: "code" in data ? "error" : "success",
    data: "code" in data ? data : data
  };
};
var MessageSendModal = (props) => {
  _s7();
  const {
    targets,
    setAddingTarget,
    data
  } = props;
  const auditLogFetcher = useFetcher();
  const [selectedWebhooks, updateSelectedWebhooks] = (0, import_react7.useReducer)((d, partialD) => ({
    ...d,
    ...partialD
  }), {});
  (0, import_react7.useEffect)(() => {
    updateSelectedWebhooks(Object.keys(targets).filter((targetId) => !Object.keys(selectedWebhooks).includes(targetId)).reduce((o, targetId) => ({
      ...o,
      [targetId]: true
    }), {}));
  }, [targets]);
  const [messages, updateMessages] = (0, import_react7.useReducer)((d, partialD) => ({
    ...d,
    ...partialD
  }), {});
  const enabledMessagesCount = Object.values(messages).filter((d) => d.enabled).length;
  (0, import_react7.useEffect)(() => {
    updateMessages(data.messages.map((_, i) => i).reduce((o, index) => ({
      ...o,
      [index]: {
        enabled: true
      }
    }), {}));
  }, [data.messages]);
  const setOpen = (s) => {
    props.setOpen(s);
    if (!s) {
      updateMessages(Array(10).fill(void 0).map((_, i) => i).reduce((o, index) => ({
        ...o,
        [index]: {
          result: void 0,
          enabled: true
        }
      }), {}));
    }
  };
  const [showingResult, setShowingResult] = (0, import_react7.useState)();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)(Modal, { title: `Send Message${data.messages.length === 1 ? "" : "s"}`, ...props, setOpen, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)(MessageSendResultModal, { open: !!showingResult, setOpen: () => setShowingResult(void 0), result: showingResult }, void 0, false, {
      fileName: "app/modals/MessageSendModal.tsx",
      lineNumber: 112,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("p", { className: "text-sm font-medium", children: "Messages" }, void 0, false, {
      fileName: "app/modals/MessageSendModal.tsx",
      lineNumber: 113,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("div", { className: "space-y-1", children: data.messages.length > 0 ? data.messages.map((message, i) => {
      const previewText = getMessageText(message.data);
      return /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("div", { className: "flex", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("label", { className: "flex grow rounded bg-gray-200 dark:bg-gray-700 py-2 px-4 w-full cursor-pointer overflow-hidden", children: [
          !!messages[i]?.result && /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)(CoolIcon, { icon: messages[i]?.result.status === "success" ? "Check" : "Close_MD", className: `text-2xl my-auto mr-1 ${messages[i]?.result.status === "success" ? "text-green-600" : "text-rose-600"}` }, void 0, false, {
            fileName: "app/modals/MessageSendModal.tsx",
            lineNumber: 119,
            columnNumber: 45
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("div", { className: "my-auto grow text-left mr-2 truncate", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("p", { className: "font-semibold text-base truncate", children: [
              "Message ",
              i + 1,
              !!previewText && /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("span", { className: "truncate ml-1", children: [
                "- ",
                previewText
              ] }, void 0, true, {
                fileName: "app/modals/MessageSendModal.tsx",
                lineNumber: 123,
                columnNumber: 41
              }, this)
            ] }, void 0, true, {
              fileName: "app/modals/MessageSendModal.tsx",
              lineNumber: 121,
              columnNumber: 21
            }, this),
            messages[i]?.result?.status === "error" && /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("p", { className: "text-rose-500 text-sm leading-none", children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)(CoolIcon, { icon: "Circle_Warning", className: "mr-1" }, void 0, false, {
                fileName: "app/modals/MessageSendModal.tsx",
                lineNumber: 126,
                columnNumber: 25
              }, this),
              (messages[i].result?.data).message
            ] }, void 0, true, {
              fileName: "app/modals/MessageSendModal.tsx",
              lineNumber: 125,
              columnNumber: 65
            }, this)
          ] }, void 0, true, {
            fileName: "app/modals/MessageSendModal.tsx",
            lineNumber: 120,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("input", { type: "checkbox", name: "message", checked: !!messages[i]?.enabled, onChange: (e) => updateMessages({
            [i]: {
              enabled: e.currentTarget.checked
            }
          }), hidden: true }, void 0, false, {
            fileName: "app/modals/MessageSendModal.tsx",
            lineNumber: 130,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("div", { className: "ml-auto my-auto space-x-2 text-2xl text-blurple dark:text-blurple-400", children: [
            message.reference && /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)(CoolIcon, { title: strings5.willBeEdited, icon: "Edit_Pencil_01" }, void 0, false, {
              fileName: "app/modals/MessageSendModal.tsx",
              lineNumber: 136,
              columnNumber: 43
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)(CoolIcon, { icon: messages[i]?.enabled ? "Checkbox_Check" : "Checkbox_Unchecked" }, void 0, false, {
              fileName: "app/modals/MessageSendModal.tsx",
              lineNumber: 137,
              columnNumber: 21
            }, this)
          ] }, void 0, true, {
            fileName: "app/modals/MessageSendModal.tsx",
            lineNumber: 135,
            columnNumber: 19
          }, this)
        ] }, void 0, true, {
          fileName: "app/modals/MessageSendModal.tsx",
          lineNumber: 118,
          columnNumber: 17
        }, this),
        messages[i]?.result && /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("button", { className: "flex ml-2 p-2 text-2xl rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 hover:dark:bg-gray-600 text-blurple dark:text-blurple-400 hover:text-blurple-400 hover:dark:text-blurple-300 transition", onClick: () => setShowingResult(messages[i].result), children: /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)(CoolIcon, { icon: "Info", className: "m-auto" }, void 0, false, {
          fileName: "app/modals/MessageSendModal.tsx",
          lineNumber: 141,
          columnNumber: 21
        }, this) }, void 0, false, {
          fileName: "app/modals/MessageSendModal.tsx",
          lineNumber: 140,
          columnNumber: 41
        }, this)
      ] }, `message-send-${i}`, true, {
        fileName: "app/modals/MessageSendModal.tsx",
        lineNumber: 117,
        columnNumber: 16
      }, this);
    }) : /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("p", { children: strings5.noMessages }, void 0, false, {
      fileName: "app/modals/MessageSendModal.tsx",
      lineNumber: 144,
      columnNumber: 12
    }, this) }, void 0, false, {
      fileName: "app/modals/MessageSendModal.tsx",
      lineNumber: 114,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("hr", { className: "border border-gray-400 dark:border-gray-600 my-4" }, void 0, false, {
      fileName: "app/modals/MessageSendModal.tsx",
      lineNumber: 146,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("p", { className: "text-sm font-medium", children: "Webhooks" }, void 0, false, {
      fileName: "app/modals/MessageSendModal.tsx",
      lineNumber: 147,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("div", { className: "space-y-1", children: Object.keys(targets).length > 0 ? Object.entries(targets).map(([targetId, target]) => {
      return /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("label", { className: "flex rounded bg-gray-200 dark:bg-gray-700 py-2 px-4 w-full cursor-pointer", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("img", { src: target.avatar ? cdn.avatar(target.id, target.avatar, {
          size: 64
        }) : cdn.defaultAvatar(5), alt: target.name ?? "Webhook", className: "rounded-full h-12 w-12 mr-2 my-auto shrink-0" }, void 0, false, {
          fileName: "app/modals/MessageSendModal.tsx",
          lineNumber: 151,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("div", { className: "my-auto grow text-left truncate mr-2", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("p", { className: "font-semibold text-base truncate", children: target.name ?? "Webhook" }, void 0, false, {
            fileName: "app/modals/MessageSendModal.tsx",
            lineNumber: 155,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("p", { className: "text-sm leading-none truncate", children: [
            "Channel ID ",
            target.channel_id
          ] }, void 0, true, {
            fileName: "app/modals/MessageSendModal.tsx",
            lineNumber: 158,
            columnNumber: 19
          }, this)
        ] }, void 0, true, {
          fileName: "app/modals/MessageSendModal.tsx",
          lineNumber: 154,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("input", { type: "checkbox", name: "webhook", checked: !!selectedWebhooks[target.id], onChange: (e) => updateSelectedWebhooks({
          [target.id]: e.currentTarget.checked
        }), hidden: true }, void 0, false, {
          fileName: "app/modals/MessageSendModal.tsx",
          lineNumber: 162,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)(CoolIcon, { icon: selectedWebhooks[target.id] ? "Checkbox_Check" : "Checkbox_Unchecked", className: "ml-auto my-auto text-2xl text-blurple dark:text-blurple-400" }, void 0, false, {
          fileName: "app/modals/MessageSendModal.tsx",
          lineNumber: 165,
          columnNumber: 17
        }, this)
      ] }, `target-${targetId}`, true, {
        fileName: "app/modals/MessageSendModal.tsx",
        lineNumber: 150,
        columnNumber: 16
      }, this);
    }) : /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("p", { children: "You have no webhooks to send to." }, void 0, false, {
        fileName: "app/modals/MessageSendModal.tsx",
        lineNumber: 168,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)(Button, { onClick: () => setAddingTarget(true), children: "Add Webhook" }, void 0, false, {
        fileName: "app/modals/MessageSendModal.tsx",
        lineNumber: 169,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "app/modals/MessageSendModal.tsx",
      lineNumber: 167,
      columnNumber: 12
    }, this) }, void 0, false, {
      fileName: "app/modals/MessageSendModal.tsx",
      lineNumber: 148,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("div", { className: "flex mt-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("div", { className: "mx-auto space-x-2", children: /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)(Button, { disabled: countSelected(selectedWebhooks) === 0 || enabledMessagesCount === 0, onClick: async () => {
      for (const [targetId] of Object.entries(selectedWebhooks).filter(([_, v]) => v)) {
        const webhook = targets[targetId];
        for (const [index] of Object.entries(messages).filter(([_, v]) => v.enabled)) {
          const message = data.messages[Number(index)];
          if (!message)
            continue;
          if (message.data.webhook_id && targetId !== message.data.webhook_id) {
            updateMessages({
              [index]: {
                result: {
                  status: "error",
                  data: {
                    code: 0,
                    message: strings5.skippedEdit
                  }
                },
                enabled: true
              }
            });
            continue;
          }
          const result = await submitMessage(webhook, message);
          if (result.status === "success") {
            auditLogFetcher.submit({
              type: message.reference ? "edit" : "send",
              webhookId: webhook.id,
              webhookToken: webhook.token,
              messageId: result.data.id
              // threadId: ,
            }, {
              method: "POST",
              action: "/api/audit-log"
            });
          }
          updateMessages({
            [index]: {
              result,
              enabled: true
            }
          });
        }
      }
    }, children: countSelected(selectedWebhooks) <= 1 && enabledMessagesCount > 1 ? strings5.sendAll : countSelected(selectedWebhooks) > 1 ? strings5.sendToAll : strings5.send }, void 0, false, {
      fileName: "app/modals/MessageSendModal.tsx",
      lineNumber: 174,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "app/modals/MessageSendModal.tsx",
      lineNumber: 173,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/modals/MessageSendModal.tsx",
      lineNumber: 172,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/modals/MessageSendModal.tsx",
    lineNumber: 111,
    columnNumber: 10
  }, this);
};
_s7(MessageSendModal, "wl+bqw4ZuiEqlF8rb4BtbPotFew=", false, function() {
  return [useFetcher];
});
_c12 = MessageSendModal;
var _c12;
$RefreshReg$(_c12, "MessageSendModal");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/modals/WebhookEditModal.tsx
var import_react8 = __toESM(require_react(), 1);
var import_zodix = __toESM(require_dist(), 1);
var import_jsx_dev_runtime13 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\modals\\\\WebhookEditModal.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s8 = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\modals\\WebhookEditModal.tsx"
  );
  import.meta.hot.lastModified = "1702866618850.452";
}
var strings6 = {
  title: "Edit Webhook",
  name: "Name",
  channel: "Channel",
  cannotChangeChannel: "Webhook channel must be set inside Discord.",
  requestedBy: "Requested on Boogiehook by {0}",
  resetAvatar: "Remove",
  save: "Save"
};
var WebhookEditModal = (props) => {
  _s8();
  const {
    webhookId,
    targets,
    updateTargets,
    user
  } = props;
  const webhook = webhookId ? targets[webhookId] : void 0;
  const [payload, updatePayload] = (0, import_react8.useReducer)((d, partialD) => ({
    ...d,
    ...partialD
  }), {});
  (0, import_react8.useEffect)(() => {
    if (webhook) {
      updatePayload({
        name: webhook.name ?? "",
        avatarUrl: webhook.avatar ? cdn.avatar(webhook.id, webhook.avatar) : void 0
      });
    }
  }, [webhook]);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)(Modal, { title: strings6.title, ...props, children: /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)("form", { onSubmit: async (e) => {
    e.preventDefault();
    if (!webhook || !webhook.token)
      return;
    const body = new FormData(e.currentTarget);
    const parsed = await import_zodix.zx.parseFormSafe(body, {
      name: z.ostring(),
      avatar: z.ostring()
    });
    if (!parsed.success) {
      return;
    }
    const result = await modifyWebhook(
      webhook.id,
      webhook.token,
      {
        ...parsed.data,
        avatar: payload.avatarUrl === null ? null : !parsed.data.avatar ? void 0 : parsed.data.avatar
      },
      user ? getUserTag(user) : "anonymous"
      // strings
      //   .formatString(
      //     strings.requestedBy,
      //     user ? getUserTag(user) : "anonymous"
      //   )
      //   .toString()
    );
    updateTargets({
      [webhook.id]: result
    });
  }, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)("div", { className: "flex", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)("div", { className: "my-auto mr-6 shrink-0", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)("input", { type: "type", name: "avatar", readOnly: true, hidden: true }, void 0, false, {
          fileName: "app/modals/WebhookEditModal.tsx",
          lineNumber: 95,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)("label", { className: "relative group block cursor-pointer", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)("input", { type: "file", accept: ".jpeg,.jpg,.png,.gif", onChange: ({
            currentTarget
          }) => {
            const files = currentTarget.files;
            if (!files || files.length === 0)
              return;
            const file = files[0];
            if (!currentTarget.accept.split(",").map((ext) => ext.replace(".", "")).includes(file.name.split(".").slice(-1)[0]))
              return;
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target.result;
              document.querySelector('input[name="avatar"]').value = result;
              updatePayload({
                avatarUrl: result
              });
            };
            reader.readAsDataURL(file);
          }, hidden: true }, void 0, false, {
            fileName: "app/modals/WebhookEditModal.tsx",
            lineNumber: 97,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)("img", { src: payload.avatarUrl ?? cdn.defaultAvatar(5), className: "rounded-full h-24 w-24" }, void 0, false, {
            fileName: "app/modals/WebhookEditModal.tsx",
            lineNumber: 114,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)("div", { className: "absolute top-0 left-0 rounded-full h-24 w-24 bg-black/50 opacity-0 group-hover:opacity-100 transition" }, void 0, false, {
            fileName: "app/modals/WebhookEditModal.tsx",
            lineNumber: 115,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)("div", { className: "absolute top-0 right-0 rounded-full p-1 px-2 flex dark:bg-white", children: /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)(CoolIcon, { icon: "Image_01", className: "m-auto dark:text-gray-500 text-xl" }, void 0, false, {
            fileName: "app/modals/WebhookEditModal.tsx",
            lineNumber: 117,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "app/modals/WebhookEditModal.tsx",
            lineNumber: 116,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "app/modals/WebhookEditModal.tsx",
          lineNumber: 96,
          columnNumber: 13
        }, this),
        payload.avatarUrl && /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)("div", { className: "w-full flex mt-2", children: /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)("button", { className: "font-medium text-sm text-[#006ce7] dark:text-[#00a8fc] hover:underline mx-auto", onClick: () => {
          updatePayload({
            avatarUrl: null
          });
          const input = document.querySelector('input[name="avatar"]');
          if (input)
            input.value = "";
        }, children: strings6.resetAvatar }, void 0, false, {
          fileName: "app/modals/WebhookEditModal.tsx",
          lineNumber: 121,
          columnNumber: 17
        }, this) }, void 0, false, {
          fileName: "app/modals/WebhookEditModal.tsx",
          lineNumber: 120,
          columnNumber: 35
        }, this)
      ] }, void 0, true, {
        fileName: "app/modals/WebhookEditModal.tsx",
        lineNumber: 94,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)("div", { className: "grow space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)(TextInput, { label: strings6.name, name: "name", maxLength: 80, value: payload.name ?? "", onInput: (e) => updatePayload({
          name: e.currentTarget.value
        }), className: "w-full" }, void 0, false, {
          fileName: "app/modals/WebhookEditModal.tsx",
          lineNumber: 133,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)(TextInput, { label: strings6.channel, description: strings6.cannotChangeChannel, value: webhook?.channel_id ?? "", className: "w-full", readOnly: true }, void 0, false, {
          fileName: "app/modals/WebhookEditModal.tsx",
          lineNumber: 136,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "app/modals/WebhookEditModal.tsx",
        lineNumber: 132,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "app/modals/WebhookEditModal.tsx",
      lineNumber: 93,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)("div", { className: "flex w-full mt-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)(Button, { className: "mx-auto", children: strings6.save }, void 0, false, {
      fileName: "app/modals/WebhookEditModal.tsx",
      lineNumber: 140,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "app/modals/WebhookEditModal.tsx",
      lineNumber: 139,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "app/modals/WebhookEditModal.tsx",
    lineNumber: 67,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/modals/WebhookEditModal.tsx",
    lineNumber: 66,
    columnNumber: 10
  }, this);
};
_s8(WebhookEditModal, "2fCbpII4W7evNB1Ndr4iqDaQgwE=");
_c13 = WebhookEditModal;
var _c13;
$RefreshReg$(_c13, "WebhookEditModal");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/modals/MessageSaveModal.tsx
var import_react10 = __toESM(require_react(), 1);
var import_jsx_dev_runtime14 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\modals\\\\MessageSaveModal.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s9 = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\modals\\MessageSaveModal.tsx"
  );
  import.meta.hot.lastModified = "1702866680681.1084";
}
var strings7 = {
  title: "Save Message",
  temporaryUrl: "Temporary Share URL",
  generate: "Generate",
  clickGenerate: 'Press "Generate" to generate a share link',
  copy: "Copy",
  includeWebhookUrls: "Include webhook URLs",
  expiresAt: "This link expires at {0} ({1}).",
  options: "Options",
  manageBackups: "Visit your user page to manage backups.",
  logInToSave: "Log in to save permanent backups.",
  savedAutomatically: "Saved automatically",
  manuallySave: "Save",
  saveBackup: "Save Backup"
};
var MessageSaveModal = (props) => {
  _s9();
  const {
    targets,
    data,
    setData,
    user
  } = props;
  const [includeTargets, setIncludeTargets] = (0, import_react10.useState)(false);
  const shareFetcher = useFetcher(), backupFetcher = useFetcher();
  const generateShareData = (0, import_react10.useCallback)((options) => {
    const {
      includeTargets_
    } = options ?? {};
    shareFetcher.submit({
      data: JSON.stringify({
        ...data,
        targets: includeTargets_ ?? includeTargets ? Object.values(targets).map((t) => ({
          url: `https://discord.com/api/webhooks/${t.id}/${t.token}`
        })) : void 0
      })
    }, {
      method: "POST",
      action: "/api/share"
    });
  }, [includeTargets, data, targets]);
  const [backup, setBackup] = (0, import_react10.useState)();
  (0, import_react10.useEffect)(() => setBackup(backupFetcher.data), [backupFetcher.data]);
  (0, import_react10.useEffect)(() => {
    if (props.open && user && data.backup_id !== void 0 && !backup) {
      backupFetcher.load(`/api/backups/${data.backup_id}`);
    }
    if (props.open && backup && typeof data.backup_id !== "number") {
      setData({
        ...data,
        backup_id: backup.id
      });
    }
  }, [props.open, data.backup_id, backup]);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(Modal, { title: strings7.title, ...props, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)("div", { className: "flex", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)("div", { className: "grow", children: /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(TextInput, { label: strings7.temporaryUrl, className: "w-full", value: shareFetcher.data ? shareFetcher.data.url : "", placeholder: strings7.clickGenerate, readOnly: true }, void 0, false, {
        fileName: "app/modals/MessageSaveModal.tsx",
        lineNumber: 89,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "app/modals/MessageSaveModal.tsx",
        lineNumber: 88,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(Button, { disabled: shareFetcher.state !== "idle", onClick: () => {
        if (shareFetcher.data) {
          copyText(shareFetcher.data.url);
        } else {
          generateShareData();
        }
      }, className: "ml-2 mt-auto", children: shareFetcher.data ? strings7.copy : strings7.generate }, void 0, false, {
        fileName: "app/modals/MessageSaveModal.tsx",
        lineNumber: 91,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/modals/MessageSaveModal.tsx",
      lineNumber: 87,
      columnNumber: 7
    }, this),
    shareFetcher.data && /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)("p", { className: "mt-1" }, void 0, false, {
      fileName: "app/modals/MessageSaveModal.tsx",
      lineNumber: 101,
      columnNumber: 29
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)("p", { className: "text-sm font-medium mt-1", children: strings7.options }, void 0, false, {
      fileName: "app/modals/MessageSaveModal.tsx",
      lineNumber: 110,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(Checkbox, { label: strings7.includeWebhookUrls, checked: includeTargets, onChange: (e) => {
      setIncludeTargets(e.currentTarget.checked);
      if (shareFetcher.data) {
        generateShareData({
          includeTargets_: e.currentTarget.checked
        });
      }
    } }, void 0, false, {
      fileName: "app/modals/MessageSaveModal.tsx",
      lineNumber: 111,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)("hr", { className: "border border-gray-400 dark:border-gray-600 my-4" }, void 0, false, {
      fileName: "app/modals/MessageSaveModal.tsx",
      lineNumber: 119,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)("p", { className: "text-lg font-medium", children: "Backup" }, void 0, false, {
      fileName: "app/modals/MessageSaveModal.tsx",
      lineNumber: 120,
      columnNumber: 7
    }, this),
    user ? /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(Link, { to: "/me", target: "_blank", className: "text-[#006ce7] dark:text-[#00a8fc] hover:underline", children: strings7.manageBackups }, void 0, false, {
        fileName: "app/modals/MessageSaveModal.tsx",
        lineNumber: 122,
        columnNumber: 11
      }, this),
      backupFetcher.state !== "idle" || backup ? /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)("div", { className: "rounded bg-gray-200 dark:bg-gray-700 p-2 flex", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(CoolIcon, { icon: "File_Document", className: "ml-2 mr-4 text-4xl my-auto" }, void 0, false, {
          fileName: "app/modals/MessageSaveModal.tsx",
          lineNumber: 126,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)("div", { className: "my-auto grow", children: [
          backup ? /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)("p", { className: "font-semibold", children: backup.name }, void 0, false, {
            fileName: "app/modals/MessageSaveModal.tsx",
            lineNumber: 128,
            columnNumber: 27
          }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)("div", { className: "h-5 rounded-full bg-gray-400 dark:bg-gray-600 w-1/5 mt-px" }, void 0, false, {
            fileName: "app/modals/MessageSaveModal.tsx",
            lineNumber: 128,
            columnNumber: 76
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)("p", { className: "text-sm", children: strings7.savedAutomatically }, void 0, false, {
            fileName: "app/modals/MessageSaveModal.tsx",
            lineNumber: 129,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "app/modals/MessageSaveModal.tsx",
          lineNumber: 127,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(Button, { disabled: !backup, className: "my-auto ml-auto", discordstyle: ButtonStyle.Success, onClick: () => {
          backupFetcher.submit({
            data: JSON.stringify(data)
          }, {
            action: `/api/backups/${backup.id}`,
            method: "PATCH"
          });
        }, children: strings7.manuallySave }, void 0, false, {
          fileName: "app/modals/MessageSaveModal.tsx",
          lineNumber: 131,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "app/modals/MessageSaveModal.tsx",
        lineNumber: 125,
        columnNumber: 55
      }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)("div", { className: "mt-1", children: /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(Button, { onClick: () => backupFetcher.submit({
        name: (/* @__PURE__ */ new Date()).toLocaleDateString(),
        data: JSON.stringify(data)
      }, {
        action: "/api/backups",
        method: "POST"
      }), children: strings7.saveBackup }, void 0, false, {
        fileName: "app/modals/MessageSaveModal.tsx",
        lineNumber: 142,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "app/modals/MessageSaveModal.tsx",
        lineNumber: 141,
        columnNumber: 22
      }, this)
    ] }, void 0, true, {
      fileName: "app/modals/MessageSaveModal.tsx",
      lineNumber: 121,
      columnNumber: 15
    }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(Link, { to: "/auth/discord", target: "_blank", className: "text-[#006ce7] dark:text-[#00a8fc] hover:underline", children: strings7.logInToSave }, void 0, false, {
      fileName: "app/modals/MessageSaveModal.tsx",
      lineNumber: 152,
      columnNumber: 18
    }, this)
  ] }, void 0, true, {
    fileName: "app/modals/MessageSaveModal.tsx",
    lineNumber: 86,
    columnNumber: 10
  }, this);
};
_s9(MessageSaveModal, "jb32tT5F6xnKVwCwYV0tqTKzFog=", false, function() {
  return [useFetcher, useFetcher];
});
_c14 = MessageSaveModal;
var _c14;
$RefreshReg$(_c14, "MessageSaveModal");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/modals/AuthFaillureModal.tsx
var import_jsx_dev_runtime15 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\modals\\\\AuthFaillureModal.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\modals\\AuthFaillureModal.tsx"
  );
  import.meta.hot.lastModified = "1695913027541.587";
}
var AuthFailureModal = (props) => {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(Modal, { title: "Failure", ...props, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)("p", { children: "You have not been logged in. One of the required scopes may be missing or you may have simply cancelled." }, void 0, false, {
      fileName: "app/modals/AuthFaillureModal.tsx",
      lineNumber: 25,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)("div", { className: "flex w-full mt-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(Button, { onClick: () => props.setOpen(false), className: "mx-auto", children: "OK" }, void 0, false, {
      fileName: "app/modals/AuthFaillureModal.tsx",
      lineNumber: 30,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/modals/AuthFaillureModal.tsx",
      lineNumber: 29,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/modals/AuthFaillureModal.tsx",
    lineNumber: 24,
    columnNumber: 10
  }, this);
};
_c15 = AuthFailureModal;
var _c15;
$RefreshReg$(_c15, "AuthFailureModal");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/modals/AuthSuccessModal.tsx
var import_jsx_dev_runtime16 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\modals\\\\AuthSuccessModal.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\modals\\AuthSuccessModal.tsx"
  );
  import.meta.hot.lastModified = "1695913027541.587";
}
var AuthSuccessModal = (props) => {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)(Modal, { title: "Success", ...props, children: [
    props.user && /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)("p", { children: [
      "You are now logged in as",
      " ",
      /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)("img", { className: "rounded-full inline-block h-5 ml-1 mr-0.5", src: getUserAvatar(props.user, {
        size: 32
      }) }, void 0, false, {
        fileName: "app/modals/AuthSuccessModal.tsx",
        lineNumber: 28,
        columnNumber: 11
      }, this),
      " ",
      /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)("span", { className: "font-medium", children: getUserTag(props.user) }, void 0, false, {
        fileName: "app/modals/AuthSuccessModal.tsx",
        lineNumber: 31,
        columnNumber: 11
      }, this),
      "."
    ] }, void 0, true, {
      fileName: "app/modals/AuthSuccessModal.tsx",
      lineNumber: 26,
      columnNumber: 22
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)("div", { className: "flex w-full mt-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)(Button, { onClick: () => props.setOpen(false), className: "mx-auto", children: "Yay!" }, void 0, false, {
      fileName: "app/modals/AuthSuccessModal.tsx",
      lineNumber: 34,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/modals/AuthSuccessModal.tsx",
      lineNumber: 33,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/modals/AuthSuccessModal.tsx",
    lineNumber: 25,
    columnNumber: 10
  }, this);
};
_c16 = AuthSuccessModal;
var _c16;
$RefreshReg$(_c16, "AuthSuccessModal");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/modals/HistoryModal.tsx
var import_jsx_dev_runtime17 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\modals\\\\HistoryModal.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s10 = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\modals\\HistoryModal.tsx"
  );
  import.meta.hot.lastModified = "1702945123120.7766";
}
var strings8 = {
  title: "History",
  noHistory: "This editor session has no history recorded.",
  description: 'This is cleared whenever the editor is loaded. If you need to store messages persistently, use the "Save Message" button.',
  xMessage: "{0} message",
  xMessages: "{0} messages",
  xEmbed: "{0} embed",
  xEmbeds: "{0} embeds",
  restore: "Restore to this point",
  removeFromHistory: "Remove from history"
};
var HistoryModal = (props) => {
  _s10();
  const {
    localHistory,
    setLocalHistory,
    setData
  } = props;
  const [settings] = useLocalStorage();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)(Modal, { title: strings8.title, ...props, children: localHistory.length === 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)("p", { children: strings8.noHistory }, void 0, false, {
    fileName: "app/modals/HistoryModal.tsx",
    lineNumber: 46,
    columnNumber: 36
  }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)("div", { className: "space-y-1", children: localHistory.map((item, itemI) => {
    let embeds = 0;
    for (const message of item.data.messages) {
      embeds += (message.data.embeds ?? []).length;
    }
    return /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)("details", { className: "group p-2 bg-gray-200 dark:bg-gray-700", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)("summary", { className: "group-open:mb-2 transition-[margin] marker:content-none marker-none flex text-base cursor-default select-none", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)(CoolIcon, { icon: "Chevron_Right", className: "group-open:rotate-90 mr-2 my-auto transition-transform" }, void 0, false, {
          fileName: "app/modals/HistoryModal.tsx",
          lineNumber: 54,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)("span", { className: "shrink-0 font-semibold", children: item.createdAt.toLocaleTimeString() }, void 0, false, {
          fileName: "app/modals/HistoryModal.tsx",
          lineNumber: 55,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)("span", { className: "truncate ml-1", children: [
          "-",
          " "
        ] }, void 0, true, {
          fileName: "app/modals/HistoryModal.tsx",
          lineNumber: 58,
          columnNumber: 19
        }, this)
      ] }, void 0, true, {
        fileName: "app/modals/HistoryModal.tsx",
        lineNumber: 53,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)("div", { className: "flex w-full", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)("div", { className: "bg-white dark:bg-[#313338] border border-gray-300 dark:border-transparent shadow rounded p-2 grow", children: item.data.messages.map((message, i) => /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)(Message, { message: message.data, date: item.createdAt, index: i, data: item.data, messageDisplay: settings.messageDisplay, compactAvatars: settings.compactAvatars }, `history-${item.id}-message-${i}`, false, {
          fileName: "app/modals/HistoryModal.tsx",
          lineNumber: 80,
          columnNumber: 61
        }, this)) }, void 0, false, {
          fileName: "app/modals/HistoryModal.tsx",
          lineNumber: 79,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)("div", { className: "space-y-1 ml-2 text-xl", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)("button", { className: "block", title: strings8.restore, onClick: () => {
            setData(item.data);
            setLocalHistory(localHistory.filter((_, i) => i < itemI));
            props.setOpen(false);
          }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)(CoolIcon, { icon: "Redo", className: "text-blurple dark:text-blurple-400" }, void 0, false, {
            fileName: "app/modals/HistoryModal.tsx",
            lineNumber: 88,
            columnNumber: 23
          }, this) }, void 0, false, {
            fileName: "app/modals/HistoryModal.tsx",
            lineNumber: 83,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)("button", { className: "block", title: strings8.removeFromHistory, onClick: () => {
            setLocalHistory(localHistory.filter((_, i) => i !== itemI));
          }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime17.jsxDEV)(CoolIcon, { icon: "Trash_Full", className: "text-rose-500 dark:text-rose-400" }, void 0, false, {
            fileName: "app/modals/HistoryModal.tsx",
            lineNumber: 93,
            columnNumber: 23
          }, this) }, void 0, false, {
            fileName: "app/modals/HistoryModal.tsx",
            lineNumber: 90,
            columnNumber: 21
          }, this)
        ] }, void 0, true, {
          fileName: "app/modals/HistoryModal.tsx",
          lineNumber: 82,
          columnNumber: 19
        }, this)
      ] }, void 0, true, {
        fileName: "app/modals/HistoryModal.tsx",
        lineNumber: 78,
        columnNumber: 17
      }, this)
    ] }, item.id, true, {
      fileName: "app/modals/HistoryModal.tsx",
      lineNumber: 52,
      columnNumber: 16
    }, this);
  }) }, void 0, false, {
    fileName: "app/modals/HistoryModal.tsx",
    lineNumber: 46,
    columnNumber: 65
  }, this) }, void 0, false, {
    fileName: "app/modals/HistoryModal.tsx",
    lineNumber: 45,
    columnNumber: 10
  }, this);
};
_s10(HistoryModal, "Dl2f5k4j3CFPpN2cS2Jksd056AU=", false, function() {
  return [useLocalStorage];
});
_c17 = HistoryModal;
var _c17;
$RefreshReg$(_c17, "HistoryModal");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/modals/TargetAddModal.tsx
var import_react11 = __toESM(require_react(), 1);
var import_jsx_dev_runtime18 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\modals\\\\TargetAddModal.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s11 = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\modals\\TargetAddModal.tsx"
  );
  import.meta.hot.lastModified = "1702866543979.5793";
}
var strings9 = {
  title: "Add Target",
  webhookUrl: "Webhook URL",
  invalidWebhookUrl: "Invalid webhook URL. They start with https://discord.com/api/webhooks/...",
  createdAtBy: "Created {0} by {1}",
  someone: "someone",
  channelId: "Channel ID: {0}",
  guildId: "Server ID: {0}",
  addWebhook: "Add Webhook",
  createWebhook: "Create Webhook"
};
var TargetAddModal = (props) => {
  _s11();
  const [webhook, setWebhook] = (0, import_react11.useState)();
  const [error, setError] = (0, import_react11.useState)();
  const avatarUrl = webhook ? webhook.avatar ? cdn.avatar(webhook.id, webhook.avatar, {
    size: 128
  }) : cdn.defaultAvatar(5) : null;
  const setOpen = (s) => {
    props.setOpen(s);
    if (!s)
      setWebhook(void 0);
  };
  (0, import_react11.useEffect)(() => {
    window.handlePopupClose = (result) => {
      props.updateTargets({
        [result.id]: result
      });
      setOpen(false);
    };
  }, [webhook]);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)(Modal, { title: strings9.title, ...props, setOpen, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)("div", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)(TextInput, { label: strings9.webhookUrl, type: "password", className: "w-full", errors: [error], onFocus: (e) => e.currentTarget.type = "text", onBlur: (e) => e.currentTarget.type = "password", delayOnInput: 200, onInput: async (e) => {
      setError(void 0);
      setWebhook(void 0);
      if (!e.currentTarget.value)
        return;
      const match = e.currentTarget.value.match(WEBHOOK_URL_RE);
      if (!match) {
        setError(strings9.invalidWebhookUrl);
        return;
      }
      const webhook2 = await getWebhook(match[1], match[2]);
      if (webhook2.id) {
        setWebhook(webhook2);
      } else if ("message" in webhook2) {
        setError(webhook2.message);
      }
    } }, void 0, false, {
      fileName: "app/modals/TargetAddModal.tsx",
      lineNumber: 62,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/modals/TargetAddModal.tsx",
      lineNumber: 61,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)("hr", { className: "border border-gray-400 dark:border-gray-600 my-4" }, void 0, false, {
      fileName: "app/modals/TargetAddModal.tsx",
      lineNumber: 79,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)("div", { className: `flex py-4 ${!webhook ? "animate-pulse" : ""}`, children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)("div", { className: "w-1/3 mr-4 my-auto", children: avatarUrl ? /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)("img", { className: "rounded-full h-24 w-24 m-auto", src: avatarUrl, alt: webhook.name ?? "Webhook" }, void 0, false, {
        fileName: "app/modals/TargetAddModal.tsx",
        lineNumber: 82,
        columnNumber: 24
      }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)("div", { className: "rounded-full h-24 w-24 bg-gray-400 dark:bg-gray-600 m-auto" }, void 0, false, {
        fileName: "app/modals/TargetAddModal.tsx",
        lineNumber: 82,
        columnNumber: 124
      }, this) }, void 0, false, {
        fileName: "app/modals/TargetAddModal.tsx",
        lineNumber: 81,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)("div", { className: "grow", children: webhook ? /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)(import_jsx_dev_runtime18.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)("p", { className: "font-bold text-xl", children: webhook.name }, void 0, false, {
          fileName: "app/modals/TargetAddModal.tsx",
          lineNumber: 86,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)("p", {}, void 0, false, {
          fileName: "app/modals/TargetAddModal.tsx",
          lineNumber: 87,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)("hr", { className: "border border-gray-400 dark:border-gray-600 my-2" }, void 0, false, {
          fileName: "app/modals/TargetAddModal.tsx",
          lineNumber: 94,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)("p", { className: "text-gray-500 hover:text-gray-700 dark:text-gray-500 hover:dark:text-gray-500 transition" }, void 0, false, {
          fileName: "app/modals/TargetAddModal.tsx",
          lineNumber: 95,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)("p", { className: "text-gray-500 hover:text-gray-700 dark:text-gray-500 hover:dark:text-gray-500 transition" }, void 0, false, {
          fileName: "app/modals/TargetAddModal.tsx",
          lineNumber: 108,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "app/modals/TargetAddModal.tsx",
        lineNumber: 85,
        columnNumber: 22
      }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)("div", { className: "h-5 rounded-full bg-gray-400 dark:bg-gray-600 w-1/3" }, void 0, false, {
          fileName: "app/modals/TargetAddModal.tsx",
          lineNumber: 122,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)("div", { className: "h-4 rounded-full bg-gray-400 dark:bg-gray-600 mt-1 w-1/2" }, void 0, false, {
          fileName: "app/modals/TargetAddModal.tsx",
          lineNumber: 123,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)("hr", { className: "border border-gray-400 dark:border-gray-600 my-4" }, void 0, false, {
          fileName: "app/modals/TargetAddModal.tsx",
          lineNumber: 124,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)("div", { className: "h-4 rounded-full bg-gray-400 dark:bg-gray-600 mt-1 w-4/6" }, void 0, false, {
          fileName: "app/modals/TargetAddModal.tsx",
          lineNumber: 125,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)("div", { className: "h-4 rounded-full bg-gray-400 dark:bg-gray-600 mt-1 w-3/6" }, void 0, false, {
          fileName: "app/modals/TargetAddModal.tsx",
          lineNumber: 126,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "app/modals/TargetAddModal.tsx",
        lineNumber: 121,
        columnNumber: 19
      }, this) }, void 0, false, {
        fileName: "app/modals/TargetAddModal.tsx",
        lineNumber: 84,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/modals/TargetAddModal.tsx",
      lineNumber: 80,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)("div", { className: "flex mt-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)("div", { className: "mx-auto space-x-2", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)(Button, { disabled: !webhook, onClick: () => {
        if (webhook) {
          props.updateTargets({
            [webhook.id]: webhook
          });
          setOpen(false);
        }
      }, children: strings9.addWebhook }, void 0, false, {
        fileName: "app/modals/TargetAddModal.tsx",
        lineNumber: 132,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime18.jsxDEV)(Button, { discordstyle: ButtonStyle.Link, onClick: () => window.open("/auth/discord-webhook", "_blank", "popup width=530 height=750"), children: strings9.createWebhook }, void 0, false, {
        fileName: "app/modals/TargetAddModal.tsx",
        lineNumber: 142,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "app/modals/TargetAddModal.tsx",
      lineNumber: 131,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/modals/TargetAddModal.tsx",
      lineNumber: 130,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/modals/TargetAddModal.tsx",
    lineNumber: 60,
    columnNumber: 10
  }, this);
};
_s11(TargetAddModal, "i/9uGSkx1cySqYO8OVGso9bkrm8=");
_c18 = TargetAddModal;
var _c18;
$RefreshReg$(_c18, "TargetAddModal");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/routes/_index.tsx
var import_jsx_dev_runtime19 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\routes\\\\_index.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s12 = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\routes\\_index.tsx"
  );
  import.meta.hot.lastModified = "1702949272962.9287";
}
var strings10 = {
  editor: "Editor",
  preview: "Preview",
  send: "Send",
  saveMessage: "Save Message",
  addWebhook: "Add Webhook",
  addMessage: "Add Message",
  embedExample: "Embed Example",
  previewInfo: "Preview Info",
  history: "History",
  editingBackup: `You're editing a backup, so your work is saved periodically while you edit. In order to share this message with others, use the "Save Message" button.`
};
function Index() {
  _s12();
  const {
    user,
    discordApplicationId
  } = useLoaderData();
  const [settings] = useLocalStorage();
  const [searchParams] = useSearchParams();
  const dm = searchParams.get("m");
  const shareId = searchParams.get("share");
  const backupIdParsed = import_zodix2.zx.NumAsString.safeParse(searchParams.get("backup"));
  const [backupId, setBackupId] = (0, import_react13.useState)();
  const [data, setData] = (0, import_react13.useState)({
    version: "d2",
    messages: []
  });
  const [urlTooLong, setUrlTooLong] = (0, import_react13.useState)(false);
  (0, import_react13.useEffect)(() => {
    if (shareId) {
      fetch(`/api/share/${shareId}`, {
        method: "GET"
      }).then((r) => {
        if (r.status === 200) {
          r.json().then((d) => setData(d.data));
        }
      });
    } else if (backupIdParsed.success) {
      fetch(`/api/backups/${backupIdParsed.data}?data=true`, {
        method: "GET"
      }).then((r) => {
        if (r.status === 200) {
          setBackupId(backupIdParsed.data);
          r.json().then((d) => setData({
            ...d.data,
            backup_id: backupIdParsed.data
          }));
        }
      });
    } else {
      let parsed;
      try {
        parsed = ZodQueryData.safeParse(JSON.parse(searchParams.get("data") ? base64Decode(searchParams.get("data") ?? "{}") ?? "{}" : JSON.stringify({
          messages: [INDEX_MESSAGE]
        })));
      } catch {
        parsed = {};
      }
      if (parsed.success) {
        if (parsed.data?.backup_id !== void 0) {
          setBackupId(parsed.data.backup_id);
        }
        setData({
          version: "d2",
          ...parsed.data
        });
        if (parsed.data?.targets && parsed.data.targets.length !== 0) {
          (async () => {
            for (const target of parsed.data.targets) {
              const match = target.url.match(WEBHOOK_URL_RE);
              if (!match)
                continue;
              const webhook = await getWebhook(match[1], match[2]);
              if (webhook.id) {
                updateTargets({
                  [webhook.id]: webhook
                });
              }
            }
          })();
        }
      } else {
        setData({
          version: "d2",
          messages: [INDEX_FAILURE_MESSAGE]
        });
      }
    }
  }, []);
  const [localHistory, setLocalHistory] = (0, import_react13.useState)([]);
  const [updateCount, setUpdateCount] = (0, import_react13.useState)(-1);
  (0, import_react13.useEffect)(() => setUpdateCount(updateCount + 1), [data]);
  (0, import_react13.useEffect)(() => {
    if (updateCount % 20 === 0) {
      const lastHistoryItem = localHistory.slice(-1)[0];
      if (!lastHistoryItem || JSON.stringify(lastHistoryItem.data) !== JSON.stringify(data)) {
        if (data.messages.length > 0) {
          setLocalHistory([...localHistory, {
            id: randomString(10),
            createdAt: /* @__PURE__ */ new Date(),
            data: structuredClone(data)
          }].slice(-20));
        }
        setUpdateCount(updateCount + 1);
        if (backupId !== void 0) {
          console.log("Saving backup", backupId);
          fetch(`/api/backups/${backupId}`, {
            method: "PATCH",
            body: new URLSearchParams({
              data: JSON.stringify(data)
            }),
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          });
        }
      }
    }
    const pathUrl = location.origin + location.pathname;
    const encoded = base64UrlEncode(JSON.stringify(data));
    if (backupId === void 0) {
      const fullUrl = new URL(pathUrl + `?data=${encoded}`);
      if (fullUrl.toString().length >= 16e3) {
        setUrlTooLong(true);
        if (searchParams.get("data")) {
          history.pushState({
            path: pathUrl
          }, "", pathUrl);
        }
      } else {
        setUrlTooLong(false);
        history.pushState({
          path: fullUrl.toString()
        }, "", fullUrl.toString());
      }
    } else {
      setUrlTooLong(false);
      const fullUrl = pathUrl + `?backup=${backupId}`;
      history.pushState({
        path: fullUrl.toString()
      }, "", fullUrl.toString());
    }
  }, [backupId, data, updateCount]);
  const [targets, updateTargets] = (0, import_react13.useReducer)((d, partialD) => ({
    ...d,
    ...partialD
  }), {});
  const [showDisclaimer, setShowDisclaimer] = (0, import_react13.useState)(dm === "preview");
  const [addingTarget, setAddingTarget] = (0, import_react13.useState)(dm === "add-target");
  const [settingMessageIndex, setSettingMessageIndex] = (0, import_react13.useState)(dm && dm.startsWith("set-reference") ? Number(dm.split("-")[2]) : void 0);
  const [imageModalData, setImageModalData] = (0, import_react13.useState)();
  const [exampleOpen, setExampleOpen] = (0, import_react13.useState)(dm === "embed-example");
  const [authSuccessOpen, setAuthSuccessOpen] = (0, import_react13.useState)(dm === "auth-success");
  const [authFailureOpen, setAuthFailureOpen] = (0, import_react13.useState)(dm === "auth-failure");
  const [sendingMessages, setSendingMessages] = (0, import_react13.useState)(dm === "submit");
  const [sharing, setSharing] = (0, import_react13.useState)(dm === "share-create");
  const [editingWebhook, setEditingWebhook] = (0, import_react13.useState)();
  const [showHistory, setShowHistory] = (0, import_react13.useState)(dm === "history");
  const [tab, setTab] = (0, import_react13.useState)("editor");
  return /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)("div", { className: "h-screen overflow-hidden", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(PreviewDisclaimerModal, { open: showDisclaimer, setOpen: setShowDisclaimer }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 227,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(ExampleModal, { open: exampleOpen, setOpen: setExampleOpen }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 228,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(MessageSetModal, { open: settingMessageIndex !== void 0, setOpen: () => setSettingMessageIndex(void 0), targets, setAddingTarget, data, setData, messageIndex: settingMessageIndex }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 229,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(MessageSendModal, { open: sendingMessages, setOpen: setSendingMessages, setAddingTarget, targets, data }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 230,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(WebhookEditModal, { open: editingWebhook !== void 0, setOpen: () => setEditingWebhook(void 0), targets, updateTargets, webhookId: editingWebhook, user }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 231,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(MessageSaveModal, { open: sharing, setOpen: setSharing, targets, data, setData, user }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 232,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(HistoryModal, { open: showHistory, setOpen: setShowHistory, localHistory, setLocalHistory, setData }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 233,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(TargetAddModal, { open: addingTarget, setOpen: setAddingTarget, updateTargets }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 234,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(AuthSuccessModal, { open: authSuccessOpen, setOpen: setAuthSuccessOpen, user }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 235,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(AuthFailureModal, { open: authFailureOpen, setOpen: setAuthFailureOpen }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 236,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(ImageModal, { images: imageModalData?.images, startIndex: imageModalData?.startIndex, clear: () => setImageModalData(void 0) }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 237,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(Header, { user }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 238,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)("div", { className: "md:flex h-[calc(100%_-_3rem)]", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)("div", { className: `p-4 md:w-1/2 h-full overflow-y-scroll ${tab === "editor" ? "" : "hidden md:block"}`, children: [
        urlTooLong && /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(InfoBox, { icon: "Triangle_Warning", severity: "yellow", children: 'Your message data is too large to be shown in the page URL. If you need to share this page, use the "Share Message" button.' }, void 0, false, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 241,
          columnNumber: 26
        }, this),
        backupId !== void 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(InfoBox, { icon: "Save", collapsible: true, open: true, children: strings10.editingBackup }, void 0, false, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 245,
          columnNumber: 38
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)("div", { className: "flex mb-2", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(Button, { onClick: () => setAddingTarget(true), disabled: Object.keys(targets).length >= 10, children: strings10.addWebhook }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 249,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(Button, { className: "ml-auto md:hidden", onClick: () => setTab("preview"), discordstyle: ButtonStyle.Secondary, children: [
            strings10.preview,
            " ",
            /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(CoolIcon, { icon: "Chevron_Right" }, void 0, false, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 253,
              columnNumber: 33
            }, this)
          ] }, void 0, true, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 252,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 248,
          columnNumber: 11
        }, this),
        Object.values(targets).map((webhook) => {
          const avatarUrl = webhook.avatar ? cdn.avatar(webhook.id, webhook.avatar, {
            size: 64
          }) : cdn.defaultAvatar(5);
          return /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)("div", { className: "flex rounded bg-gray-300 dark:bg-gray-800 border-2 border-transparent dark:border-gray-700 p-2 md:px-4 mb-2", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)("img", { className: "rounded-full mr-4 h-12 my-auto", src: avatarUrl }, void 0, false, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 261,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)("div", { className: "my-auto grow truncate", children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)("p", { className: "font-semibold truncate", children: webhook.name }, void 0, false, {
                fileName: "app/routes/_index.tsx",
                lineNumber: 263,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)("p", { className: "text-sm leading-none truncate", children: webhook.application_id === discordApplicationId ? /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(import_jsx_dev_runtime19.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(CoolIcon, { icon: "Circle_Check", className: "text-blurple-500" }, void 0, false, {
                  fileName: "app/routes/_index.tsx",
                  lineNumber: 266,
                  columnNumber: 25
                }, this),
                " ",
                "Owned by Boogiehook"
              ] }, void 0, true, {
                fileName: "app/routes/_index.tsx",
                lineNumber: 265,
                columnNumber: 72
              }, this) : webhook.user?.username }, void 0, false, {
                fileName: "app/routes/_index.tsx",
                lineNumber: 264,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 262,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)("div", { className: "ml-auto space-x-2 my-auto shrink-0 text-xl", children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)("button", { onClick: () => setEditingWebhook(webhook.id), children: /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(CoolIcon, { icon: "Edit_Pencil_01" }, void 0, false, {
                fileName: "app/routes/_index.tsx",
                lineNumber: 273,
                columnNumber: 21
              }, this) }, void 0, false, {
                fileName: "app/routes/_index.tsx",
                lineNumber: 272,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)("button", { onClick: () => {
                delete targets[webhook.id];
                updateTargets({
                  ...targets
                });
              }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(CoolIcon, { icon: "Trash_Full" }, void 0, false, {
                fileName: "app/routes/_index.tsx",
                lineNumber: 281,
                columnNumber: 21
              }, this) }, void 0, false, {
                fileName: "app/routes/_index.tsx",
                lineNumber: 275,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 271,
              columnNumber: 17
            }, this)
          ] }, `target-${webhook.id}`, true, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 260,
            columnNumber: 18
          }, this);
        }),
        /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)("div", { className: "flex", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(Button, { onClick: () => setSendingMessages(true), disabled: data.messages.length === 0, children: strings10.send }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 287,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(Button, { className: "ml-2", onClick: () => setSharing(true), discordstyle: ButtonStyle.Secondary, disabled: data.messages.length === 0, children: strings10.saveMessage }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 290,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(Button, { className: "ml-2", onClick: () => setShowHistory(true), discordstyle: ButtonStyle.Secondary, disabled: localHistory.length === 0, children: strings10.history }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 293,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 286,
          columnNumber: 11
        }, this),
        data.messages.map((_, i) => /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(MessageEditor, { index: i, data, discordApplicationId, setData, setSettingMessageIndex, webhooks: Object.values(targets) }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 298,
            columnNumber: 15
          }, this),
          i < data.messages.length - 1 && /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)("hr", { className: "border border-gray-500/20 mt-4" }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 299,
            columnNumber: 48
          }, this)
        ] }, `edit-message-${i}`, true, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 297,
          columnNumber: 40
        }, this)),
        /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(Button, { className: "mt-4 w-full", disabled: data.messages.length >= 10, onClick: () => {
          data.messages.push({
            data: {}
          });
          setData({
            ...data
          });
        }, children: strings10.addMessage }, void 0, false, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 301,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 240,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)("div", { className: `md:border-l-2 border-l-gray-400 dark:border-l-[#1E1F22] p-4 md:w-1/2 h-full overflow-y-scroll relative ${tab === "preview" ? "" : "hidden md:block"}`, children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)("div", { className: "md:hidden", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(Button, { onClick: () => setTab("editor"), discordstyle: ButtonStyle.Secondary, children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(CoolIcon, { icon: "Chevron_Left" }, void 0, false, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 315,
              columnNumber: 15
            }, this),
            " ",
            strings10.editor
          ] }, void 0, true, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 314,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)("hr", { className: "border border-gray-400 dark:border-gray-600 my-4" }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 317,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 313,
          columnNumber: 11
        }, this),
        data.messages.map((message, i) => /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(Message, { message: message.data, discordApplicationId, webhooks: Object.values(targets), index: i, data, setImageModalData, messageDisplay: settings.messageDisplay, compactAvatars: settings.compactAvatars }, `preview-message-${i}`, false, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 319,
          columnNumber: 46
        }, this)),
        /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)("div", { className: "fixed bottom-4 right-4 grid gap-2 grid-cols-1", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(Button, { discordstyle: ButtonStyle.Secondary, onClick: () => setExampleOpen(true), children: strings10.embedExample }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 321,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(Button, { discordstyle: ButtonStyle.Secondary, onClick: () => setShowDisclaimer(true), children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime19.jsxDEV)(CoolIcon, { icon: "Info", className: "mr-1.5" }, void 0, false, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 325,
              columnNumber: 15
            }, this),
            strings10.previewInfo
          ] }, void 0, true, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 324,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 320,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 312,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 239,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/_index.tsx",
    lineNumber: 226,
    columnNumber: 10
  }, this);
}
_s12(Index, "dHsimsu/WP8m6rWUybWGVSK5WVo=", false, function() {
  return [useLoaderData, useLocalStorage, useSearchParams];
});
_c19 = Index;
var _c19;
$RefreshReg$(_c19, "Index");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  Index as default
};
//# sourceMappingURL=/build/routes/_index-5KOOQHJJ.js.map
