import { Link } from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { Button } from "~/components/Button";
import { Checkbox } from "~/components/Checkbox";
import { CoolIcon, CoolIconsGlyph } from "~/components/icons/CoolIcon";
import { Twemoji } from "~/components/icons/Twemoji";
import { linkClassName } from "~/components/preview/Markdown";
import { Radio } from "~/components/Radio";
import type { LocaleCode } from "~/i18n";
import type { User } from "~/session.server";
import type { TFunction, i18n } from "~/types/i18next";
import { type Settings, useLocalStorage } from "~/util/localstorage";
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
