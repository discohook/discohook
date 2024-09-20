import { Link } from "@remix-run/react";
import { type i18n as i18nT } from "i18next";
import { Trans, useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { Checkbox } from "~/components/Checkbox";
import { Radio } from "~/components/Radio";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { Twemoji } from "~/components/icons/Twemoji";
import { linkClassName } from "~/components/preview/Markdown";
import { User } from "~/session.server";
import { LocaleCode, Settings, useLocalStorage } from "~/util/localstorage";
import { Modal, ModalProps } from "./Modal";

const languages: Record<LocaleCode, string> = {
  ar: "🇪🇬",
  zh: "🇨🇳",
  nl: "🇳🇱",
  "en-US": "🇺🇸",
  "en-GB": "🇬🇧",
  fr: "🇫🇷",
  es: "🇪🇸",
  de: "🇩🇪",
  it: "🇮🇹",
  cs: "🇨🇿",
};

const LocaleRadio = ({
  locale,
  flag,
  i18n,
  settings,
  updateSettings,
}: {
  locale: LocaleCode;
  flag: string;
  i18n: i18nT;
  settings: Settings;
  updateSettings: (data: Partial<Settings>) => void;
}) => (
  <Radio
    name="locale"
    label={
      <>
        <Twemoji
          className="h-5 align-text-bottom ltr:mr-2 rtl:ml-2 saturate-[0.8]"
          emoji={flag}
        />
        {i18n.t(`locales.${locale}`, { lng: locale })}
      </>
    }
    checked={
      (locale === "en-US" ? !settings.locale : false) ||
      settings.locale === locale
    }
    onChange={(e) => {
      if (e.currentTarget.checked) {
        updateSettings({ locale });
        i18n.changeLanguage(locale);
        const html = document.querySelector("html");
        if (html) {
          html.dir = ["ar"].includes(locale) ? "rtl" : "ltr";
        }
      }
    }}
  />
);

export const SettingsModal = (props: ModalProps & { user?: User | null }) => {
  const { t, i18n } = useTranslation();
  // const { user } = props;
  const [settings, updateSettings] = useLocalStorage();

  return (
    <Modal title={t("settings")} {...props}>
      <div>
        <p className="text-sm font-bold uppercase dark:text-gray-400">
          {t("theme")}
        </p>
        <div className="flex mt-2 overflow-x-auto">
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
          <Checkbox
            label={t("compactAvatars")}
            checked={settings.compactAvatars === true}
            onChange={(e) =>
              updateSettings({ compactAvatars: e.currentTarget.checked })
            }
          />
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
            onChange={(e) =>
              updateSettings({ forceDualPane: e.currentTarget.checked })
            }
          />
        </div>
      </div>
      <div className="mt-8">
        <p className="text-sm font-bold uppercase dark:text-gray-400">
          {t("language")}
        </p>
        <div className="space-y-2 mt-2">
          {Object.entries(languages)
            .sort(([localeA], [localeB]) => {
              const nativeA = t(`locales.${localeA}`, { lng: localeA });
              const nativeB = t(`locales.${localeB}`, { lng: localeB });
              return nativeA > nativeB ? 1 : -1;
            })
            .map(([locale, flag]) => (
              <LocaleRadio
                key={`locale-radio-${locale}`}
                locale={locale as LocaleCode}
                flag={flag}
                i18n={i18n}
                settings={settings}
                updateSettings={updateSettings}
              />
            ))}
        </div>
        <p className="text-sm text-muted dark:text-muted-dark">
          <Trans
            t={t}
            i18nKey="translatePrompt"
            components={[
              <Link
                to="https://translate.shay.cat/engage/discohook/"
                target="_blank"
                className={linkClassName}
              />,
              <Link to="/discord" target="_blank" className={linkClassName} />,
            ]}
          />
        </p>
      </div>
      <div className="mt-8">
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
  <label>
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
        "rounded-full flex h-[60px] w-[60px] cursor-pointer peer-checked:cursor-default border border-black/50 dark:border-gray-50/50 peer-checked:border-2 peer-checked:border-blurple ltr:mr-6 rtl:ml-6",
        bg,
      )}
    >
      {children}
    </div>
  </label>
);
