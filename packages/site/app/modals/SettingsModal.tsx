import { Link } from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import type React from "react";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { apiUrl, BRoutes } from "~/api/routing";
import { Button } from "~/components/Button";
import { Checkbox } from "~/components/Checkbox";
import { CoolIcon, type CoolIconsGlyph } from "~/components/icons/CoolIcon";
import { Twemoji } from "~/components/icons/Twemoji";
import { linkClassName } from "~/components/preview/Markdown";
import { Radio } from "~/components/Radio";
import { TextInput } from "~/components/TextInput";
import type { LocaleCode } from "~/i18n";
import type { User } from "~/session.server";
import type { i18n, TFunction } from "~/types/i18next";
import { fileHosts } from "~/util/filehosts";
import { type Settings, useLocalStorage } from "~/util/localstorage";
import { fileSize } from "~/util/text";
import { Modal, type ModalProps, PlainModalHeader } from "./Modal";

interface LanguageEntry {
  native: string;
  flag: string;
}

const languages: Partial<Record<LocaleCode, LanguageEntry>> = {
  ar: { native: "العربية", flag: "🇪🇬" },
  zh: { native: "中文", flag: "🇨🇳" },
  "zh-TW": { native: "繁體中文", flag: "🇹🇼" },
  // he: { native: "עברית", flag: "" },
  nl: { native: "Nederlands", flag: "🇳🇱" },
  en: { native: "English, US", flag: "🇺🇸" },
  "en-GB": { native: "English, UK", flag: "🇬🇧" },
  fr: { native: "Français", flag: "🇫🇷" },
  es: { native: "Español", flag: "🇪🇸" },
  de: { native: "Deutsch", flag: "🇩🇪" },
  it: { native: "Italiano", flag: "🇮🇹" },
  cs: { native: "Česky", flag: "🇨🇿" },
  uk: { native: "українська", flag: "🇺🇦" },
  ru: { native: "Русский", flag: "🇷🇺" },
  tr: { native: "Türkçe", flag: "🇹🇷" },
};

const LocaleRadio = ({
  locale,
  entry: { native, flag },
  i18n,
  settings,
  updateSettings,
}: {
  locale: LocaleCode;
  entry: LanguageEntry;
  i18n: { changeLanguage: (lng?: string) => Promise<TFunction> };
  settings: Settings;
  updateSettings: (data: Partial<Settings>) => void;
}) => (
  <Radio
    name="locale"
    label={
      <>
        <Twemoji
          className="h-5 align-text-bottom me-2 saturate-[0.8]"
          emoji={flag}
        />
        {native}
      </>
    }
    checked={
      (locale === "en" ? !settings.locale : false) || settings.locale === locale
    }
    onChange={(e) => {
      if (e.currentTarget.checked) {
        // Set `i18n` cookie
        fetch(`/api/v1/locale/${locale}`, { method: "POST" }).catch(
          console.error,
        );
        updateSettings({ locale });
        i18n.changeLanguage(locale);
      }
    }}
  />
);

const summarizeAccept = (types: string[]): string => {
  const summary: string[] = [];
  if (types.includes("image/*")) {
    summary.push("images");
  } else {
    const exts = types
      .filter(
        (t) =>
          t.startsWith("image/") ||
          // biome-ignore format: long
          [".png",".jpg",".jpeg",".webp",".heic",".heif",".avif",".bmp",".tif",".tiff",".gif",".hdr",".pic",".pict",".raw",".tga",".svg",".psd"].includes(t),
      )
      .map((t) => t.replace(/^image\/|^\./, ""));
    if (
      // I consider this "baseline" image support; what most people would
      // expect to be able to upload to a service that "accepts images"
      exts.includes("png") &&
      (exts.includes("jpg") || exts.includes("jpeg")) &&
      exts.includes("gif") &&
      exts.includes("webp")
    ) {
      summary.push("images");
    } else {
      const formatted = exts
        .map((ext) => {
          const cased = { webp: "WebP", jpeg: "JPG" }[ext] ?? ext.toUpperCase();
          return `${cased}s`;
        })
        // remove duplicates (jpeg and jpg both come out to "JPGs")
        .filter((v, i, a) => a.indexOf(v) === i);
      summary.push(...formatted);
    }
  }
  if (types.includes("video/*")) {
    summary.push("videos");
  } else {
    const exts = types
      .filter(
        (t) =>
          t.startsWith("video/") ||
          // biome-ignore format: long
          [".mp4",".avi",".divx",".wmv",".mov",".mov",".mkv",".mpeg",".mpg"].includes(t),
      )
      .map((t) => {
        const stripped = t.replace(/^video\/|^\./, "");
        const formatted = { divx: "DivX" }[stripped] ?? stripped.toUpperCase();
        return `${formatted}s`;
      });
    summary.push(...exts);
  }
  if (
    types.includes(".pdf") ||
    types.includes(".doc") ||
    types.includes(".docx") ||
    types.includes(".xls") ||
    types.includes(".xlsx")
  ) {
    summary.push("documents");
  }
  if (
    types.includes(".exe") ||
    types.includes(".bin") ||
    types.includes(".dylib") ||
    types.includes(".dll") ||
    types.includes(".jar")
  ) {
    summary.push("program files");
  }
  return new Intl.ListFormat().format(summary);
};

const FilehostConfigurationModal = ({
  id,
  name,
  children,
  ...props
}: ModalProps & {
  id: string;
  name: string;
  children: React.ReactNode;
}) => {
  return (
    <Modal {...props}>
      <PlainModalHeader onClose={() => props.setOpen(false)}>
        Link your {name}
      </PlainModalHeader>
      {children}
    </Modal>
  );
};

const FilehostConfigurationBase = ({
  id,
  name,
  iconUrl,
  clearConfig,
  children,
}: React.PropsWithChildren<{
  t: TFunction;
  id: string;
  name: string;
  iconUrl: string;
  hasConfig?: boolean;
  clearConfig?: () => void;
}>) => {
  const info = fileHosts.find((f) => f.id === id);
  return (
    <div
      className={twJoin(
        "rounded-lg bg-gray-100 dark:bg-gray-700",
        "border border-border-normal dark:border-border-normal-dark",
      )}
    >
      <div className="flex items-center p-4 pb-0">
        <img
          src={iconUrl}
          alt={`${name} logo`}
          className="size-8 me-3 rounded"
        />
        <div>
          <p className="font-medium text-lg">{name}</p>
          {info ? (
            <p className="text-sm text-muted dark:text-muted-dark leading-tight">
              {fileSize(info.maxSize)} per file
              {info.accept ? (
                <>
                  ,{" "}
                  <span title={info.accept.join(", ")}>
                    accepts {summarizeAccept(info.accept)}
                  </span>
                </>
              ) : (
                ""
              )}
            </p>
          ) : null}
        </div>
        {clearConfig ? (
          <button
            type="button"
            onClick={clearConfig}
            className="ms-auto self-start opacity-50 hover:opacity-100 transition-opacity"
          >
            <CoolIcon
              icon="Close_MD"
              className="text-muted dark:text-muted-dark"
            />
          </button>
        ) : null}
      </div>
      <div className="p-4 pt-2">{children}</div>
    </div>
  );
};

const FilehostConfigurationImgbb = ({
  t,
  settings,
  updateSettings,
}: {
  t: TFunction;
  settings: Settings;
  updateSettings: (data: Partial<Settings>) => void;
}) => {
  const id = "imgbb";
  const fh = settings.filehosts ?? {};
  return (
    <FilehostConfigurationBase
      t={t}
      id={id}
      name="ImgBB"
      iconUrl="/logos/imgbb.png"
      clearConfig={async () => {
        const res = await fetch(apiUrl(BRoutes.filehostsConfig(id)), {
          method: "POST",
          body: JSON.stringify({ key: null }),
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          updateSettings({ filehosts: { ...fh, [id]: undefined } });
        }
      }}
    >
      <form
        className="flex items-end gap-2"
        onSubmit={async (e) => {
          const form = e.currentTarget;
          e.preventDefault();
          const key = new FormData(form).get("key");
          if (!key) return;

          const res = await fetch(apiUrl(BRoutes.filehostsConfig(id)), {
            method: "POST",
            body: JSON.stringify({ key }),
            headers: { "Content-Type": "application/json" },
          });
          if (res.ok) {
            updateSettings({
              filehosts: {
                ...fh,
                [id]: { ...fh[id], cookie: true },
              },
            });
            form.reset();
          }
        }}
      >
        <TextInput
          name="key"
          labelClassName="grow"
          label={
            <p className="flex items-center gap-x-1">
              Key{" "}
              {fh[id]?.cookie ? (
                <CoolIcon
                  icon="Circle_Check"
                  className="text-green-400 align-[center]"
                />
              ) : (
                <CoolIcon
                  icon="Remove_Minus_Circle"
                  className="text-muted dark:text-muted-dark align-[center]"
                />
              )}
            </p>
          }
          description={
            <Trans
              t={t}
              i18nKey={
                fh[id]?.cookie
                  ? "Your API key is set, but not shown here for security. Visit <anchor>imgbb.com</anchor> to view or delete it."
                  : "Your <anchor>API key</anchor> is a private string that Discohook can use to upload on your behalf. Without it, images may still be uploaded anonymously."
              }
              components={{
                anchor: (
                  // biome-ignore lint/a11y/useAnchorContent: Added by i18n
                  <a
                    href="https://api.imgbb.com"
                    className={linkClassName}
                    target="_blank"
                    rel="noopener"
                  />
                ),
              }}
            />
          }
          pattern="^\w+$"
          type="password"
          className="w-full"
          placeholder="1abcd2345e6fg7h8ijk901lmno234p5q"
        />
        <Button
          type="submit"
          discordstyle={ButtonStyle.Primary}
          className="h-9"
        >
          {t("save")}
        </Button>
      </form>
    </FilehostConfigurationBase>
  );
};

// const FilehostConfigurationCatbox = ({
//   t,
//   settings,
//   updateSettings,
// }: {
//   t: TFunction;
//   settings: Settings;
//   updateSettings: (data: Partial<Settings>) => void;
// }) => {
//   const fh = settings.filehosts ?? {};
//   return (
//     <FilehostConfigurationBase
//       t={t}
//       id="catbox"
//       name="Catbox"
//       iconUrl="/logos/catbox.png"
//       clearConfig={async () => {
//         const res = await fetch(apiUrl(BRoutes.filehostsConfig("catbox")), {
//           method: "POST",
//           body: JSON.stringify({ userhash: null }),
//           headers: { "Content-Type": "application/json" },
//         });
//         if (res.ok) {
//           updateSettings({ filehosts: { ...fh, catbox: undefined } });
//         }
//       }}
//     >
//       <form
//         className="flex items-end gap-2"
//         onSubmit={async (e) => {
//           const form = e.currentTarget;
//           e.preventDefault();
//           const userhash = new FormData(form).get("userhash");
//           if (!userhash) return;

//           const res = await fetch(apiUrl(BRoutes.filehostsConfig("catbox")), {
//             method: "POST",
//             body: JSON.stringify({ userhash }),
//             headers: { "Content-Type": "application/json" },
//           });
//           if (res.ok) {
//             updateSettings({
//               filehosts: {
//                 ...fh,
//                 catbox: { ...fh.catbox, cookie: true },
//               },
//             });
//             form.reset();
//           }
//         }}
//       >
//         <TextInput
//           name="userhash"
//           labelClassName="grow"
//           label={
//             <p className="flex items-center gap-x-1">
//               Userhash{" "}
//               {fh.catbox?.cookie ? (
//                 <CoolIcon
//                   icon="Circle_Check"
//                   className="text-green-400 align-[center]"
//                 />
//               ) : (
//                 <CoolIcon
//                   icon="Remove_Minus_Circle"
//                   className="text-muted dark:text-muted-dark align-[center]"
//                 />
//               )}
//             </p>
//           }
//           description={
//             <Trans
//               t={t}
//               i18nKey={
//                 fh.catbox?.cookie
//                   ? "Your userhash is set, but not shown here for security. Visit <anchor>catbox.moe</anchor> to view or regenerate it."
//                   : "Your <anchor>userhash</anchor> is a private string that can be used to manage your Catbox account. Discohook will use it to upload on your behalf."
//               }
//               components={{
//                 anchor: (
//                   // biome-ignore lint/a11y/useAnchorContent: Added by i18n
//                   <a
//                     href="https://catbox.moe/user/"
//                     className={linkClassName}
//                     target="_blank"
//                     rel="noopener"
//                   />
//                 ),
//               }}
//             />
//           }
//           pattern="^\w+$"
//           type="password"
//           className="w-full"
//           placeholder="abcdefghijklmnopqrstuvwxyz" // --Big Bird, 1970
//         />
//         <Button
//           type="submit"
//           discordstyle={ButtonStyle.Primary}
//           className="h-9"
//         >
//           {t("save")}
//         </Button>
//       </form>
//     </FilehostConfigurationBase>
//   );
// };

// const FilehostConfigurationSxcu = ({
//   t,
//   settings,
//   updateSettings,
// }: {
//   t: TFunction;
//   settings: Settings;
//   updateSettings: (data: Partial<Settings>) => void;
// }) => {
//   const id = "sxcu";
//   const fh = settings.filehosts ?? {};
//   return (
//     <FilehostConfigurationBase
//       t={t}
//       id={id}
//       name="sxcu.net"
//       iconUrl="/logos/sxcu.png"
//       clearConfig={async () => {
//         const res = await fetch(apiUrl(BRoutes.filehostsConfig(id)), {
//           method: "POST",
//           body: JSON.stringify({ key: null }),
//           headers: { "Content-Type": "application/json" },
//         });
//         if (res.ok) {
//           updateSettings({ filehosts: { ...fh, [id]: undefined } });
//         }
//       }}
//     >
//       <form
//         className="flex items-end gap-2"
//         onSubmit={async (e) => {
//           const form = e.currentTarget;
//           e.preventDefault();
//           const key = new FormData(form).get("key");
//           if (!key) return;

//           const res = await fetch(apiUrl(BRoutes.filehostsConfig(id)), {
//             method: "POST",
//             body: JSON.stringify({ key }),
//             headers: { "Content-Type": "application/json" },
//           });
//           if (res.ok) {
//             updateSettings({
//               filehosts: {
//                 ...fh,
//                 [id]: { ...fh[id], cookie: true },
//               },
//             });
//             form.reset();
//           }
//         }}
//       >
//         <TextInput
//           name="key"
//           labelClassName="grow"
//           label={
//             <p className="flex items-center gap-x-1">
//               Key{" "}
//               {fh[id]?.cookie ? (
//                 <CoolIcon
//                   icon="Circle_Check"
//                   className="text-green-400 align-[center]"
//                 />
//               ) : (
//                 <CoolIcon
//                   icon="Remove_Minus_Circle"
//                   className="text-muted dark:text-muted-dark align-[center]"
//                 />
//               )}
//             </p>
//           }
//           description={
//             <Trans
//               t={t}
//               i18nKey={
//                 fh[id]?.cookie
//                   ? "Your API key is set, but not shown here for security. Visit <anchor>imgbb.com</anchor> to view or delete it."
//                   : "Your <anchor>API key</anchor> is a private string that Discohook can use to upload on your behalf. Without it, images may still be uploaded anonymously."
//               }
//               components={{
//                 anchor: (
//                   // biome-ignore lint/a11y/useAnchorContent: Added by i18n
//                   <a
//                     href="https://api.imgbb.com"
//                     className={linkClassName}
//                     target="_blank"
//                     rel="noopener"
//                   />
//                 ),
//               }}
//             />
//           }
//           pattern="^\w+$"
//           type="password"
//           className="w-full"
//           placeholder="1abcd2345e6fg7h8ijk901lmno234p5q"
//         />
//         <Button
//           type="submit"
//           discordstyle={ButtonStyle.Primary}
//           className="h-9"
//         >
//           {t("save")}
//         </Button>
//       </form>
//     </FilehostConfigurationBase>
//   );
// };

interface TabContentProps {
  settings: Settings;
  updateSettings: (data: Partial<Settings>) => void;
  t: TFunction;
  i18n: i18n;
}

const tabs: {
  id: string;
  icon: CoolIconsGlyph;
  content: (props: TabContentProps) => JSX.Element;
}[] = [
  {
    id: "appearance",
    icon: "Desktop",
    content: ({ t, settings, updateSettings }) => (
      <>
        <div>
          <p className="text-sm font-bold uppercase dark:text-gray-400">
            {t("theme")}
          </p>
          <div className="flex gap-3 mt-2 pt-1 overflow-x-auto">
            <ThemeRadio
              bg="bg-white"
              checked={settings.theme === "light"}
              onChange={(e) => {
                if (e.currentTarget.checked) {
                  updateSettings({ theme: "light" });
                  document.documentElement.classList.remove("dark");
                }
              }}
            />
            <ThemeRadio
              bg="bg-gray-800"
              checked={settings.theme === "dark"}
              onChange={(e) => {
                if (e.currentTarget.checked) {
                  updateSettings({ theme: "dark" });
                  document.documentElement.classList.add("dark");
                }
              }}
            />
            {/* <ThemeRadio value="amoled" bg="bg-black" /> */}
            <ThemeRadio
              bg="bg-gray-800"
              checked={!settings.theme}
              onChange={(e) => {
                if (e.currentTarget.checked) {
                  updateSettings({ theme: undefined });
                  if (
                    window.matchMedia("(prefers-color-scheme: light)").matches
                  ) {
                    document.documentElement.classList.remove("dark");
                  } else {
                    document.documentElement.classList.add("dark");
                  }
                }
              }}
            >
              <CoolIcon icon="Redo" className="m-auto text-xl text-gray-50" />
            </ThemeRadio>
          </div>
        </div>
        <div className="mt-8">
          <p className="text-sm font-bold uppercase dark:text-gray-400">
            {t("messageDisplay")}
          </p>
          <div className="space-y-2 mt-2">
            <Radio
              name="display"
              label={t("cozy")}
              checked={
                !settings.messageDisplay || settings.messageDisplay === "cozy"
              }
              onChange={(e) => {
                if (e.currentTarget.checked) {
                  updateSettings({ messageDisplay: "cozy" });
                }
              }}
            />
            <Radio
              name="display"
              label={t("compact")}
              checked={settings.messageDisplay === "compact"}
              onChange={(e) => {
                if (e.currentTarget.checked) {
                  updateSettings({ messageDisplay: "compact" });
                }
              }}
            />
            {settings.messageDisplay === "compact" ? (
              <Checkbox
                label={t("compactAvatars")}
                checked={settings.compactAvatars === true}
                onCheckedChange={(checked) =>
                  updateSettings({ compactAvatars: checked })
                }
              />
            ) : null}
          </div>
        </div>
        <div className="mt-8">
          <p className="text-sm font-bold uppercase dark:text-gray-400">
            {t("editorPanes")}
          </p>
          <div className="space-y-2 mt-2">
            <Checkbox
              label={t("forceDualPane")}
              checked={settings.forceDualPane === true}
              onCheckedChange={(checked) =>
                updateSettings({ forceDualPane: checked })
              }
            />
          </div>
        </div>
      </>
    ),
  },
  {
    id: "language",
    icon: "Globe",
    content: ({ t, i18n, settings, updateSettings }) => (
      <div>
        <div className="space-y-2">
          {Object.entries(languages)
            .sort(([, entryA], [, entryB]) => {
              return entryA.native > entryB.native ? 1 : -1;
            })
            .map(([locale, entry]) => (
              <LocaleRadio
                key={`locale-radio-${locale}`}
                locale={locale as LocaleCode}
                entry={entry}
                i18n={i18n}
                settings={settings}
                updateSettings={updateSettings}
              />
            ))}
        </div>
        <p className="text-sm text-muted dark:text-muted-dark mt-1">
          <Trans
            t={t}
            i18nKey="translatePrompt"
            components={[
              <Link
                key="0"
                to="https://translate.shay.cat/engage/discohook/"
                target="_blank"
                className={linkClassName}
              />,
              <Link
                key="1"
                to="/discord"
                target="_blank"
                className={linkClassName}
              />,
            ]}
          />
        </p>
      </div>
    ),
  },
  {
    id: "behavior",
    icon: "Cookie",
    content: ({ t, settings, updateSettings }) => (
      <>
        <div>
          <p className="text-sm font-bold uppercase dark:text-gray-400">
            {t("webhookInput")}
          </p>
          <div className="space-y-2 mt-2">
            <Radio
              name="webhookInput"
              label={t("modern")}
              checked={
                !settings.webhookInput || settings.webhookInput === "modern"
              }
              onChange={(e) => {
                if (e.currentTarget.checked) {
                  updateSettings({ webhookInput: "modern" });
                }
              }}
            />
            <Radio
              name="webhookInput"
              label={t("classic")}
              checked={settings.webhookInput === "classic"}
              onChange={(e) => {
                if (e.currentTarget.checked) {
                  updateSettings({ webhookInput: "classic" });
                }
              }}
            />
          </div>
        </div>
        <div className="mt-8">
          <p className="text-sm font-bold uppercase dark:text-gray-400">
            {t("defaultMessageCreationChoice")}
          </p>
          <div className="space-y-2 mt-2">
            <Radio
              name="defaultMessageFlag"
              label={t("standardMessage")}
              checked={
                !settings.defaultMessageFlag ||
                settings.defaultMessageFlag === "standard"
              }
              onChange={(e) => {
                if (e.currentTarget.checked) {
                  updateSettings({ defaultMessageFlag: "standard" });
                }
              }}
            />
            <Radio
              name="defaultMessageFlag"
              label={t("componentsMessage")}
              checked={settings.defaultMessageFlag === "components"}
              onChange={(e) => {
                if (e.currentTarget.checked) {
                  updateSettings({ defaultMessageFlag: "components" });
                }
              }}
            />
          </div>
        </div>
        {settings.experiments?.find((e) => e.id === "SAVE_ATTACHMENTS") ? (
          <div className="mt-8">
            <p className="text-sm font-bold uppercase dark:text-gray-400">
              {t("saveAttachmentsTitle")}
            </p>
            <p className="text-sm">
              <Trans
                t={t}
                i18nKey="saveAttachmentsDescription"
                components={{
                  privacy: (
                    <Link
                      to="/legal"
                      target="_blank"
                      className={linkClassName}
                    />
                  ),
                }}
              />
            </p>
            <div className="mt-2 flex flex-row gap-x-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => {}}
                className={twJoin(
                  "size-11 flex rounded-lg",
                  "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-600",
                  "border border-border-normal/50 dark:border-border-normal-dark/50",
                )}
              >
                <img
                  src="/logos/imgbb.png"
                  alt="ImgBB logo"
                  className="size-7 m-auto object-contain rounded-md"
                />
              </button>
            </div>
            <div className="space-y-2 mt-2">
              {/* <FilehostConfigurationImgbb
                t={t}
                settings={settings}
                updateSettings={updateSettings}
              /> */}
              {/*
                Have not yet received approval from the catbox administrator to
                publish this feature, so it remains in limbo
                <FilehostConfigurationCatbox
                  t={t}
                  settings={settings}
                  updateSettings={updateSettings}
                />
              */}
              {/*
                I didn't want to write another proxy for this service just yet.
                It returns an appropriate CORS origin header, but not an appropriate
                allowed methods header. Hopefully this is a mistake and it may allow
                CORS requests in the future.
                <FilehostConfigurationSxcu
                  t={t}
                  settings={settings}
                  updateSettings={updateSettings}
                />
              */}
            </div>
          </div>
        ) : undefined}
      </>
    ),
  },
  {
    id: "advanced",
    icon: "Data",
    content: ({ t }) => (
      <div>
        <p className="text-sm font-bold uppercase dark:text-gray-400">
          {t("settingsCache.title")}
        </p>
        <div className="mt-1">
          <p>{t("settingsCache.emojiDescription")}</p>
          <Button
            discordstyle={ButtonStyle.Secondary}
            className="mt-1"
            onClick={() => {
              localStorage.removeItem("discohook_unicode_emojis");
            }}
          >
            {t("settingsCache.emojiButton")}
          </Button>
        </div>
        {/* <p className="text-sm font-bold uppercase dark:text-gray-400">
          {t("developerMode")}
        </p> */}
        {/* <hr className="border-border-normal dark:border-border-normal-dark border rounded my-2" />
        <p className="text-sm font-bold uppercase dark:text-gray-400">
          {t("experiments")}
        </p> */}
      </div>
    ),
  },
];

export const SettingsModal = (props: ModalProps & { user?: User | null }) => {
  const { t, i18n } = useTranslation();
  // const { user } = props;
  const [settings, updateSettings] = useLocalStorage();

  const [tab, setTab] = useState<(typeof tabs)[number]>();
  // Default to first tab on `md` sized screens
  useEffect(() => {
    if (props.open && !tab && window.innerWidth >= 768) setTab(tabs[0]);
  }, [tab, props.open]);

  return (
    <Modal {...props} className="min-h-full p-0 flex" parentClassName="h-full">
      <div
        id="settings-sidebar"
        className={twJoin(
          "relative",
          tab ? "hidden md:flex" : "flex",
          "w-full md:w-auto md:min-w-1/4 flex-col p-4 shrink-0",
          "md:border-e-2 border-e-gray-200 dark:border-e-transparent dark:bg-gray-800",
        )}
      >
        <div className="space-y-0.5">
          {tabs.map((tabItem) => (
            <button
              key={tabItem.id}
              type="button"
              data-active={tab?.id === tabItem.id ? "" : null}
              onClick={() => setTab(tabItem)}
              className={twJoin(
                "flex flex-row items-center w-full",
                "rounded-lg px-2.5 py-1",
                "text-muted hover:text-black",
                "data-[active]:md:bg-gray-200 data-[active]:text-black",
                "dark:text-muted-dark dark:hover:text-white",
                "dark:data-[active]:md:bg-[#3C3D42] dark:data-[active]:text-white",
                "transition-colors",
              )}
            >
              <CoolIcon icon={tabItem.icon} className="me-1.5 text-lg" />
              <p className="font-medium me-0.5">{t(tabItem.id)}</p>
              <CoolIcon
                icon="Chevron_Right"
                rtl="Chevron_Left"
                className="ms-auto md:!hidden"
              />
            </button>
          ))}
        </div>
        <div className="mt-auto sticky bottom-4">
          <p className="text-muted dark:text-muted-dark text-xs">
            {t("settingsFooter")}
          </p>
        </div>
      </div>
      <div
        id="settings-content"
        className={twJoin(
          tab ? undefined : "hidden md:block",
          "grow w-full p-4 md:px-6",
        )}
      >
        {tab ? (
          <div>
            <button
              type="button"
              className={twJoin(
                "flex md:hidden items-center gap-1.5 px-1.5 py-0.5 text-sm rounded-md",
                "hover:bg-background-secondary dark:hover:bg-gray-800 transition-colors",
                "text-muted dark:text-muted-dark",
              )}
              onClick={() => setTab(undefined)}
            >
              <CoolIcon icon="Chevron_Left" rtl="Chevron_Right" />
              <p>{t("backToSettings")}</p>
            </button>
            <PlainModalHeader onClose={() => props.setOpen(false)}>
              {t(tab.id)}
            </PlainModalHeader>
            <hr className="border-border-normal dark:border-border-normal-dark border rounded mb-4 -mt-1" />
            <tab.content
              t={t}
              i18n={i18n}
              settings={settings}
              updateSettings={updateSettings}
            />
          </div>
        ) : (
          <div>
            <PlainModalHeader onClose={() => props.setOpen(false)}>
              {t("settings")}
            </PlainModalHeader>
            <p className="text-muted dark:text-muted-dark">
              Nothing to see here.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

const ThemeRadio: React.FC<
  React.PropsWithChildren<{
    bg: string;
    checked?: boolean;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
  }>
> = ({ bg, checked, onChange, children }) => (
  <label className="relative">
    <input
      name="theme"
      type="radio"
      className="peer"
      checked={checked}
      onChange={onChange}
      hidden
    />
    <div
      className={twJoin(
        "rounded-xl flex size-[60px] cursor-pointer peer-checked:cursor-default",
        "border border-black/50 dark:border-gray-50/50",
        "peer-checked:border-4 peer-checked:border-blurple box-border",
        bg,
      )}
    >
      {children}
    </div>
    <div className="hidden peer-checked:flex absolute -top-1 -end-1 bg-blurple rounded-full size-5">
      <CoolIcon icon="Check" className="m-auto text-sm text-white" />
    </div>
  </label>
);
