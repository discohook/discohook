import {
  TextInput,
  base64UrlEncode,
  require_dist
} from "/build/_shared/chunk-22RUGG5T.js";
import {
  Prose
} from "/build/_shared/chunk-BI26XF4X.js";
import {
  Button,
  ButtonStyle,
  CoolIcon,
  Header,
  Modal,
  getUserAvatar,
  getUserTag,
  require_session
} from "/build/_shared/chunk-CENY6B5C.js";
import {
  Form,
  Link,
  useFetcher,
  useLoaderData,
  useSubmit
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

// empty-module:@remix-run/cloudflare
var require_cloudflare = __commonJS({
  "empty-module:@remix-run/cloudflare"(exports, module) {
    module.exports = {};
  }
});

// empty-module:~/db/index.server
var require_db = __commonJS({
  "empty-module:~/db/index.server"(exports, module) {
    module.exports = {};
  }
});

// empty-module:~/db/schema.server
var require_schema = __commonJS({
  "empty-module:~/db/schema.server"(exports, module) {
    module.exports = {};
  }
});

// app/routes/me.tsx
var import_cloudflare = __toESM(require_cloudflare(), 1);
var import_react5 = __toESM(require_react(), 1);
var import_zodix = __toESM(require_dist(), 1);
var import_db = __toESM(require_db(), 1);
var import_schema = __toESM(require_schema(), 1);

// app/modals/BackupEditModal.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\modals\\\\BackupEditModal.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\modals\\BackupEditModal.tsx"
  );
  import.meta.hot.lastModified = "1702866406368.0703";
}
var strings = {
  title: "Edit Backup Details",
  editMessage: "To edit the messages in a backup, click the {0} button.",
  name: "Name",
  save: "Save"
};
var BackupEditModal = (props) => {
  _s();
  const {
    backup
  } = props;
  const fetcher = useFetcher();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Modal, { title: strings.title, ...props, children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Form, { onSubmit: (e) => {
    e.preventDefault();
    fetcher.submit(new FormData(e.currentTarget), {
      action: `/api/backups/${backup?.id}`,
      method: "PATCH"
    });
  }, children: [
    backup && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "space-y-2", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: strings.editMessage }, void 0, false, {
        fileName: "app/modals/BackupEditModal.tsx",
        lineNumber: 55,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TextInput, { name: "name", label: strings.name, defaultValue: backup.name, className: "w-full", maxLength: 100, required: true }, void 0, false, {
        fileName: "app/modals/BackupEditModal.tsx",
        lineNumber: 62,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "app/modals/BackupEditModal.tsx",
      lineNumber: 54,
      columnNumber: 20
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex w-full mt-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, { className: "mx-auto", disabled: fetcher.state !== "idle", children: strings.save }, void 0, false, {
      fileName: "app/modals/BackupEditModal.tsx",
      lineNumber: 65,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "app/modals/BackupEditModal.tsx",
      lineNumber: 64,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "app/modals/BackupEditModal.tsx",
    lineNumber: 47,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/modals/BackupEditModal.tsx",
    lineNumber: 46,
    columnNumber: 10
  }, this);
};
_s(BackupEditModal, "2WHaGQTcUOgkXDaibwUgjUp1MBY=", false, function() {
  return [useFetcher];
});
_c = BackupEditModal;
var _c;
$RefreshReg$(_c, "BackupEditModal");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/modals/BackupImportModal.tsx
var import_react3 = __toESM(require_react(), 1);

// app/components/FileInput.tsx
var import_jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\components\\\\FileInput.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\components\\FileInput.tsx"
  );
  import.meta.hot.lastModified = "1702664231510.0134";
}
var FileInput = (props) => /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("label", { className: "block group/input", children: [
  /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("p", { className: "text-sm font-medium flex", children: props.label }, void 0, false, {
    fileName: "app/components/FileInput.tsx",
    lineNumber: 23,
    columnNumber: 5
  }, this),
  props.description && /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("p", { className: "text-sm", children: props.description }, void 0, false, {
    fileName: "app/components/FileInput.tsx",
    lineNumber: 24,
    columnNumber: 27
  }, this),
  /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: `flex ${props.className ?? ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("input", { ...props, type: "file", className: "peer/input", hidden: true, onInput: (e) => {
      const files = e.currentTarget.files;
      let fileNames = [];
      if (files) {
        for (const file of files) {
          fileNames.push(file.name);
        }
      }
      const textBox = e.currentTarget.parentElement.querySelector("p.filenames");
      if (textBox) {
        if (fileNames.length === 0) {
          textBox.innerText = "Select a file";
        } else {
          textBox.innerText = fileNames.join(", ");
        }
      }
      if (props.onInput) {
        props.onInput(e);
      }
    } }, void 0, false, {
      fileName: "app/components/FileInput.tsx",
      lineNumber: 26,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "h-9 w-9 rounded mr-2 bg-gray-300 border-gray-200 dark:border-transparent dark:bg-[#292b2f] dark:group-hover/input:border-black/5 peer-invalid/input:border-rose-400 flex shrink-0 transition cursor-pointer", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(CoolIcon, { icon: "File_Upload", className: "text-2xl m-auto" }, void 0, false, {
      fileName: "app/components/FileInput.tsx",
      lineNumber: 47,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/components/FileInput.tsx",
      lineNumber: 46,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "h-9 rounded border bg-gray-300 border-gray-200 dark:border-transparent dark:bg-[#292b2f] dark:group-hover/input:border-black/5 peer-invalid/input:border-rose-400 grow flex px-[14px] transition cursor-pointer", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("p", { className: "my-auto filenames", children: "Select a file" }, void 0, false, {
      fileName: "app/components/FileInput.tsx",
      lineNumber: 50,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/components/FileInput.tsx",
      lineNumber: 49,
      columnNumber: 7
    }, this),
    props.clearable && /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("button", { className: "h-9 w-9 rounded ml-2 bg-gray-300 border-gray-200 dark:border-transparent dark:bg-[#292b2f] dark:group-hover/input:border-black/5 text-rose-400 flex shrink-0 transition", onClick: (e) => {
      const p = e.currentTarget.parentElement, input = p.querySelector(
        // input.peer/input is invalid
        `input[class="peer/input"]`
      ), textBox = p.querySelector("p.filenames");
      if (input) {
        input.value = "";
      }
      if (textBox) {
        textBox.innerText = "Select a file";
      }
    }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(CoolIcon, { icon: "Trash_Full", className: "text-2xl m-auto" }, void 0, false, {
      fileName: "app/components/FileInput.tsx",
      lineNumber: 65,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "app/components/FileInput.tsx",
      lineNumber: 52,
      columnNumber: 27
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/FileInput.tsx",
    lineNumber: 25,
    columnNumber: 5
  }, this),
  props.errors && props.errors.filter((e) => e !== void 0).map((error, i) => /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("p", { className: "text-rose-500 dark:text-rose-300 font-medium mt-1 text-sm", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(CoolIcon, { icon: "Circle_Warning", className: "mr-1.5" }, void 0, false, {
      fileName: "app/components/FileInput.tsx",
      lineNumber: 69,
      columnNumber: 13
    }, this),
    error
  ] }, `${props.id ?? props.label}-error-${i}`, true, {
    fileName: "app/components/FileInput.tsx",
    lineNumber: 68,
    columnNumber: 82
  }, this))
] }, void 0, true, {
  fileName: "app/components/FileInput.tsx",
  lineNumber: 22,
  columnNumber: 35
}, this);
_c2 = FileInput;
var _c2;
$RefreshReg$(_c2, "FileInput");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/modals/BackupImportModal.tsx
var import_jsx_dev_runtime3 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\modals\\\\BackupImportModal.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s2 = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\modals\\BackupImportModal.tsx"
  );
  import.meta.hot.lastModified = "1702746652821.827";
}
var backupDataAsNewest = (data) => {
  switch (data.version) {
    case 3:
      return data.backups.map((backup) => ({
        name: backup.name,
        messages: [{
          data: backup.message
        }],
        targets: backup.webhookUrl ? [{
          url: backup.webhookUrl
        }] : void 0
      }));
    case 4:
      return data.backups.map((backup) => ({
        name: backup.name,
        messages: backup.messages.map((message) => ({
          data: message
        })),
        targets: backup.webhookUrl ? [{
          url: backup.webhookUrl
        }] : void 0
      }));
    case 5:
      return data.backups.map((backup) => ({
        name: backup.name,
        messages: backup.messages.map((message) => ({
          data: message,
          reference: backup.target.message
        })),
        targets: backup.target.url ? [{
          url: backup.target.url
        }] : void 0
      }));
    case 6:
      return data.backups.map((backup) => ({
        name: backup.name,
        messages: backup.messages,
        targets: backup.target.url ? [{
          url: backup.target.url
        }] : void 0
      }));
    case 7:
      return data.backups;
    default:
      break;
  }
  return [];
};
var BackupImportModal = (props) => {
  _s2();
  const [fileErrors, setFileErrors] = (0, import_react3.useState)([]);
  const [data, setData] = (0, import_react3.useState)();
  const [selectedBackups, setSelectedBackups] = (0, import_react3.useState)([]);
  const submit = useSubmit();
  (0, import_react3.useEffect)(() => {
    if (!props.open) {
      setFileErrors([]);
      setData(void 0);
      setSelectedBackups([]);
    }
  }, [props.open]);
  const backups = data ? backupDataAsNewest(data) : void 0;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(Modal, { title: "Import Backups", ...props, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(FileInput, { label: "Backups File", accept: ".json", errors: fileErrors, onInput: (e) => {
      const files = e.currentTarget.files;
      const file = files ? files[0] : void 0;
      if (file) {
        setData(void 0);
        setFileErrors([]);
        setSelectedBackups([]);
        if (file.type !== "application/json") {
          setFileErrors(["This is not a properly encoded JSON file."]);
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parsed = JSON.parse(reader.result);
            const result = parsed;
            setData(result);
            if ("backups" in result) {
              setSelectedBackups(result.backups.map((b) => b.name));
            }
          } catch {
            setFileErrors(["Failed to parse the file. Make sure it is a valid, unmodified backup export."]);
          }
        };
        reader.readAsText(file);
      }
    } }, void 0, false, {
      fileName: "app/modals/BackupImportModal.tsx",
      lineNumber: 92,
      columnNumber: 7
    }, this),
    data && (data.version === 1 || data.version === 2 ? /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("p", { children: "Sorry, Boogiehook doesn't support backups that are this old. Try importing the file into Discohook and then exporting it again." }, void 0, false, {
      fileName: "app/modals/BackupImportModal.tsx",
      lineNumber: 122,
      columnNumber: 60
    }, this) : backups && /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("div", { className: "my-2 space-y-1 overflow-y-auto max-h-96", children: backups.map((backup, i) => {
      return /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("div", { className: "flex", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("button", { className: "rounded px-4 bg-gray-300 dark:bg-gray-700 flex grow min-h-[2.5rem]", onClick: () => {
          if (selectedBackups.includes(backup.name)) {
            setSelectedBackups(selectedBackups.filter((b) => b !== backup.name));
          } else {
            setSelectedBackups([...selectedBackups, backup.name]);
          }
        }, children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("div", { className: "my-auto truncate mr-2 text-left py-2", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("p", { className: "font-semibold truncate", children: backup.name }, void 0, false, {
              fileName: "app/modals/BackupImportModal.tsx",
              lineNumber: 136,
              columnNumber: 25
            }, this),
            props.backups.map((b) => b.name).includes(backup.name) && /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("p", { className: "text-sm text-yellow-700 dark:text-yellow-400", children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(CoolIcon, { icon: "Circle_Warning" }, void 0, false, {
                fileName: "app/modals/BackupImportModal.tsx",
                lineNumber: 138,
                columnNumber: 29
              }, this),
              " You already have a backup with this name"
            ] }, void 0, true, {
              fileName: "app/modals/BackupImportModal.tsx",
              lineNumber: 137,
              columnNumber: 82
            }, this)
          ] }, void 0, true, {
            fileName: "app/modals/BackupImportModal.tsx",
            lineNumber: 135,
            columnNumber: 23
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("div", { className: "my-auto ml-auto", children: /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(CoolIcon, { icon: selectedBackups.includes(backup.name) ? "Checkbox_Check" : "Checkbox_Unchecked", className: "text-blurple-400 text-xl" }, void 0, false, {
            fileName: "app/modals/BackupImportModal.tsx",
            lineNumber: 143,
            columnNumber: 25
          }, this) }, void 0, false, {
            fileName: "app/modals/BackupImportModal.tsx",
            lineNumber: 142,
            columnNumber: 23
          }, this)
        ] }, void 0, true, {
          fileName: "app/modals/BackupImportModal.tsx",
          lineNumber: 128,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(Link, { to: `/?data=${base64UrlEncode(JSON.stringify({
          version: "d2",
          messages: backup.messages,
          targets: backup.targets
        }))}`, className: "flex text-xl ml-1 shrink-0 rounded bg-gray-300 dark:bg-gray-700 w-10 min-h-[2.5rem]", title: `View ${backup.name}`, target: "_blank", children: /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(CoolIcon, { icon: "External_Link", className: "text-blurple-400 m-auto" }, void 0, false, {
          fileName: "app/modals/BackupImportModal.tsx",
          lineNumber: 151,
          columnNumber: 23
        }, this) }, void 0, false, {
          fileName: "app/modals/BackupImportModal.tsx",
          lineNumber: 146,
          columnNumber: 21
        }, this)
      ] }, `import-backup-${backup.name}-${i}`, true, {
        fileName: "app/modals/BackupImportModal.tsx",
        lineNumber: 127,
        columnNumber: 16
      }, this);
    }) }, void 0, false, {
      fileName: "app/modals/BackupImportModal.tsx",
      lineNumber: 125,
      columnNumber: 29
    }, this)),
    /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("div", { className: "flex w-full mt-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(Button, { onClick: () => {
      submit({
        action: "IMPORT_BACKUPS",
        backups: JSON.stringify(backups.filter((b) => selectedBackups.includes(b.name)))
      }, {
        method: "POST",
        replace: true
      });
      props.setOpen(false);
    }, className: "mx-auto", disabled: selectedBackups.length === 0, children: [
      "Import ",
      selectedBackups.length
    ] }, void 0, true, {
      fileName: "app/modals/BackupImportModal.tsx",
      lineNumber: 157,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/modals/BackupImportModal.tsx",
      lineNumber: 156,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/modals/BackupImportModal.tsx",
    lineNumber: 91,
    columnNumber: 10
  }, this);
};
_s2(BackupImportModal, "GSHWw0o2IzUqCt6cNiaylTsYr8I=", false, function() {
  return [useSubmit];
});
_c3 = BackupImportModal;
var _c3;
$RefreshReg$(_c3, "BackupImportModal");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/routes/me.tsx
var import_session = __toESM(require_session(), 1);
var import_jsx_dev_runtime4 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\routes\\\\me.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s3 = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\routes\\me.tsx"
  );
  import.meta.hot.lastModified = "1702942831481.6428";
}
var strings2 = {
  yourBackups: "Your Backups",
  noBackups: "You haven't created any backups.",
  import: "Import",
  version: "Version: {0}",
  yourLinks: "Your Links",
  noLinks: "You haven't created any share links.",
  id: "ID: {0}",
  contentUnavailable: "Share link data is not kept after expiration. If you need to permanently store a message, use the backups feature instead.",
  logOut: "Log Out",
  subscribedSince: "Subscribed Since",
  notSubscribed: "Not subscribed",
  firstSubscribed: "First Subscribed",
  never: "Never"
};
var meta = () => [{
  title: "Your Data - Boogiehook"
}];
function Me() {
  _s3();
  const {
    user,
    backups,
    links
  } = useLoaderData();
  const submit = useSubmit();
  const now = /* @__PURE__ */ new Date();
  const [importModalOpen, setImportModalOpen] = (0, import_react5.useState)(false);
  const [editingBackup, setEditingBackup] = (0, import_react5.useState)();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(BackupImportModal, { open: importModalOpen, setOpen: setImportModalOpen, backups }, void 0, false, {
      fileName: "app/routes/me.tsx",
      lineNumber: 179,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(BackupEditModal, { open: !!editingBackup, setOpen: () => setEditingBackup(void 0), backup: editingBackup }, void 0, false, {
      fileName: "app/routes/me.tsx",
      lineNumber: 180,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(Header, { user }, void 0, false, {
      fileName: "app/routes/me.tsx",
      lineNumber: 181,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(Prose, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { className: "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { className: "w-full rounded-lg bg-gray-200 dark:bg-gray-700 shadow-md p-2 h-fit", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { className: "flex", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("img", { className: "rounded-full mr-4 h-16 w-16", src: getUserAvatar(user), alt: user.name }, void 0, false, {
            fileName: "app/routes/me.tsx",
            lineNumber: 186,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { className: "grow my-auto", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("p", { className: "text-2xl font-semibold dark:text-gray-100", children: user.name }, void 0, false, {
              fileName: "app/routes/me.tsx",
              lineNumber: 188,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("p", { className: "leading-none", children: getUserTag(user) }, void 0, false, {
              fileName: "app/routes/me.tsx",
              lineNumber: 191,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "app/routes/me.tsx",
            lineNumber: 187,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/me.tsx",
          lineNumber: 185,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { className: "grid gap-2 grid-cols-2 mt-4", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("p", { className: "uppercase font-bold text-xs leading-4 dark:text-gray-100", children: strings2.subscribedSince }, void 0, false, {
              fileName: "app/routes/me.tsx",
              lineNumber: 196,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("p", { className: "text-sm font-normal", children: user.subscribedSince ? new Date(user.subscribedSince).toLocaleDateString(void 0, {
              month: "short",
              day: "numeric",
              year: "numeric"
            }) : strings2.notSubscribed }, void 0, false, {
              fileName: "app/routes/me.tsx",
              lineNumber: 199,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "app/routes/me.tsx",
            lineNumber: 195,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("p", { className: "uppercase font-bold text-xs leading-4 dark:text-gray-100", children: strings2.firstSubscribed }, void 0, false, {
              fileName: "app/routes/me.tsx",
              lineNumber: 208,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("p", { className: "text-sm font-normal", children: user.firstSubscribed ? new Date(user.firstSubscribed).toLocaleDateString(void 0, {
              month: "short",
              day: "numeric",
              year: "numeric"
            }) : strings2.never }, void 0, false, {
              fileName: "app/routes/me.tsx",
              lineNumber: 211,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "app/routes/me.tsx",
            lineNumber: 207,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/me.tsx",
          lineNumber: 194,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { className: "w-full flex mt-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(Link, { to: "/auth/logout", className: "ml-auto", children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(Button, { discordstyle: ButtonStyle.Secondary, children: strings2.logOut }, void 0, false, {
          fileName: "app/routes/me.tsx",
          lineNumber: 222,
          columnNumber: 17
        }, this) }, void 0, false, {
          fileName: "app/routes/me.tsx",
          lineNumber: 221,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "app/routes/me.tsx",
          lineNumber: 220,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/me.tsx",
        lineNumber: 184,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { className: "w-full h-fit", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("p", { className: "text-xl font-semibold dark:text-gray-100", children: strings2.yourBackups }, void 0, false, {
          fileName: "app/routes/me.tsx",
          lineNumber: 229,
          columnNumber: 13
        }, this),
        backups.length > 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { className: "space-y-1 mt-1 overflow-y-auto max-h-96", children: backups.map((backup) => {
          return /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { className: "w-full rounded p-2 bg-gray-100 dark:bg-gray-700 flex", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { className: "truncate", children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { className: "flex max-w-full", children: [
                /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("p", { className: "font-medium truncate", children: backup.name }, void 0, false, {
                  fileName: "app/routes/me.tsx",
                  lineNumber: 237,
                  columnNumber: 27
                }, this),
                /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("button", { className: "ml-2 my-auto", onClick: () => setEditingBackup(backup), children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(CoolIcon, { icon: "Edit_Pencil_01" }, void 0, false, {
                  fileName: "app/routes/me.tsx",
                  lineNumber: 239,
                  columnNumber: 29
                }, this) }, void 0, false, {
                  fileName: "app/routes/me.tsx",
                  lineNumber: 238,
                  columnNumber: 27
                }, this)
              ] }, void 0, true, {
                fileName: "app/routes/me.tsx",
                lineNumber: 236,
                columnNumber: 25
              }, this),
              /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("p", { className: "text-gray-600 dark:text-gray-500 text-sm" }, void 0, false, {
                fileName: "app/routes/me.tsx",
                lineNumber: 242,
                columnNumber: 25
              }, this)
            ] }, void 0, true, {
              fileName: "app/routes/me.tsx",
              lineNumber: 235,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { className: "ml-auto pl-2 my-auto flex flex-col", children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(Link, { to: `/?backup=${backup.id}`, target: "_blank", children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(CoolIcon, { icon: "External_Link" }, void 0, false, {
                fileName: "app/routes/me.tsx",
                lineNumber: 251,
                columnNumber: 27
              }, this) }, void 0, false, {
                fileName: "app/routes/me.tsx",
                lineNumber: 250,
                columnNumber: 25
              }, this),
              /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("button", { onClick: () => {
                submit({
                  action: "DELETE_BACKUP",
                  backupId: backup.id
                }, {
                  method: "POST",
                  replace: true
                });
              }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(CoolIcon, { icon: "Trash_Full", className: "text-rose-600" }, void 0, false, {
                fileName: "app/routes/me.tsx",
                lineNumber: 262,
                columnNumber: 27
              }, this) }, void 0, false, {
                fileName: "app/routes/me.tsx",
                lineNumber: 253,
                columnNumber: 25
              }, this)
            ] }, void 0, true, {
              fileName: "app/routes/me.tsx",
              lineNumber: 249,
              columnNumber: 23
            }, this)
          ] }, `backup-${backup.id}`, true, {
            fileName: "app/routes/me.tsx",
            lineNumber: 234,
            columnNumber: 22
          }, this);
        }) }, void 0, false, {
          fileName: "app/routes/me.tsx",
          lineNumber: 232,
          columnNumber: 35
        }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("p", { className: "text-gray-500", children: strings2.noBackups }, void 0, false, {
          fileName: "app/routes/me.tsx",
          lineNumber: 267,
          columnNumber: 24
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(Button, { className: "mt-1", onClick: () => setImportModalOpen(true), children: strings2.import }, void 0, false, {
          fileName: "app/routes/me.tsx",
          lineNumber: 268,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/me.tsx",
        lineNumber: 228,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { className: "w-full h-fit", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("p", { className: "text-xl font-semibold dark:text-gray-100", children: strings2.yourLinks }, void 0, false, {
          fileName: "app/routes/me.tsx",
          lineNumber: 273,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("p", { children: strings2.contentUnavailable }, void 0, false, {
          fileName: "app/routes/me.tsx",
          lineNumber: 276,
          columnNumber: 13
        }, this),
        links.length > 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { className: "space-y-1 mt-1 overflow-y-auto max-h-96", children: links.map((link) => {
          const created = new Date(link.createdAt), expires = new Date(link.expiresAt);
          return /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { className: "w-full rounded p-2 bg-gray-100 dark:bg-gray-700 flex", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { className: "truncate shrink-0", children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("p", { className: "font-medium", children: [
                created.toLocaleDateString(void 0, {
                  month: "short",
                  day: "numeric",
                  year: now.getFullYear() === created.getFullYear() ? void 0 : "numeric"
                }),
                /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("span", { className: `ml-1 ${expires < now ? "text-rose-400" : expires.getTime() - now.getTime() <= 864e5 ? "text-yellow-500 dark:text-yellow-400" : "text-gray-600 dark:text-gray-500"}`, children: [
                  "-",
                  " ",
                  expires.toLocaleDateString(void 0, {
                    month: "short",
                    day: "numeric",
                    year: now.getFullYear() === expires.getFullYear() ? void 0 : "numeric"
                  })
                ] }, void 0, true, {
                  fileName: "app/routes/me.tsx",
                  lineNumber: 289,
                  columnNumber: 27
                }, this)
              ] }, void 0, true, {
                fileName: "app/routes/me.tsx",
                lineNumber: 283,
                columnNumber: 25
              }, this),
              /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("p", { className: "text-gray-600 dark:text-gray-500 text-sm" }, void 0, false, {
                fileName: "app/routes/me.tsx",
                lineNumber: 298,
                columnNumber: 25
              }, this)
            ] }, void 0, true, {
              fileName: "app/routes/me.tsx",
              lineNumber: 282,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { className: "ml-auto pl-2 my-auto flex flex-col", children: [
              expires > now && /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(Link, { to: `/?share=${link.shareId}`, target: "_blank", children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(CoolIcon, { icon: "External_Link" }, void 0, false, {
                fileName: "app/routes/me.tsx",
                lineNumber: 304,
                columnNumber: 29
              }, this) }, void 0, false, {
                fileName: "app/routes/me.tsx",
                lineNumber: 303,
                columnNumber: 43
              }, this),
              /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("button", { onClick: () => {
                submit({
                  action: "DELETE_SHARE_LINK",
                  linkId: link.id
                }, {
                  method: "POST",
                  replace: true
                });
              }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(CoolIcon, { icon: "Trash_Full", className: "text-rose-600" }, void 0, false, {
                fileName: "app/routes/me.tsx",
                lineNumber: 315,
                columnNumber: 27
              }, this) }, void 0, false, {
                fileName: "app/routes/me.tsx",
                lineNumber: 306,
                columnNumber: 25
              }, this)
            ] }, void 0, true, {
              fileName: "app/routes/me.tsx",
              lineNumber: 302,
              columnNumber: 23
            }, this)
          ] }, `link-${link.id}`, true, {
            fileName: "app/routes/me.tsx",
            lineNumber: 281,
            columnNumber: 22
          }, this);
        }) }, void 0, false, {
          fileName: "app/routes/me.tsx",
          lineNumber: 277,
          columnNumber: 33
        }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("p", { className: "text-gray-500", children: strings2.noLinks }, void 0, false, {
          fileName: "app/routes/me.tsx",
          lineNumber: 320,
          columnNumber: 24
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/me.tsx",
        lineNumber: 272,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/me.tsx",
      lineNumber: 183,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/routes/me.tsx",
      lineNumber: 182,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/me.tsx",
    lineNumber: 178,
    columnNumber: 10
  }, this);
}
_s3(Me, "Sub1keCYXmu6tJgSp8ayO2//fDg=", false, function() {
  return [useLoaderData, useSubmit];
});
_c4 = Me;
var _c4;
$RefreshReg$(_c4, "Me");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  Me as default,
  meta
};
//# sourceMappingURL=/build/routes/me-E3LBADK5.js.map
