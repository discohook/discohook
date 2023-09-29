import LocalizedStrings from "react-localization";
import { Checkbox } from "~/components/Checkbox";
import { CoolIcon } from "~/components/CoolIcon";
import { Radio } from "~/components/Radio";
import { User } from "~/session.server";
import { useLocalStorage } from "~/util/localstorage";
import { Modal, ModalProps } from "./Modal";

const strings = new LocalizedStrings({
  en: {
    title: "Settings",
    theme: "Theme",
    messageDisplay: "Message Display",
  },
});

export const SettingsModal = (props: ModalProps & { user?: User | null }) => {
  // const { user } = props;
  const [settings, updateSettings] = useLocalStorage();

  return (
    <Modal title={strings.title} {...props}>
      <div>
        <p className="text-sm font-black uppercase dark:text-gray-400">
          {strings.theme}
        </p>
        <div className="flex space-x-6 mt-2 overflow-x-auto">
          <ThemeRadio
            bg="bg-white"
            checked={settings.theme === "light"}
            onChange={(e) => {
              if (e.currentTarget.checked) {
                updateSettings({ theme: "light" });
              }
            }}
          />
          <ThemeRadio
            bg="bg-gray-800"
            checked={settings.theme === "dark"}
            onChange={(e) => {
              if (e.currentTarget.checked) {
                updateSettings({ theme: "dark" });
              }
            }}
          />
          {/* <ThemeRadio value="amoled" bg="bg-black" /> */}
          <ThemeRadio
            bg="bg-gray-800"
            checked={!settings.theme || settings.theme === "sync"}
            onChange={(e) => {
              if (e.currentTarget.checked) {
                updateSettings({ theme: "sync" });
              }
            }}
          >
            <CoolIcon icon="Redo" className="m-auto text-xl" />
          </ThemeRadio>
        </div>
      </div>
      <div className="mt-8">
        <p className="text-sm font-black uppercase dark:text-gray-400">
          {strings.messageDisplay}
        </p>
        <div className="space-y-2 mt-2">
          <Radio
            name="display"
            label="Cozy"
            description="Nice and spacious"
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
            label="Compact"
            description="Get shrunk"
            checked={settings.messageDisplay === "compact"}
            onChange={(e) => {
              if (e.currentTarget.checked) {
                updateSettings({ messageDisplay: "compact" });
              }
            }}
          />
          <Checkbox
            label="Show avatars in Compact mode"
            checked={settings.compactAvatars === true}
            onChange={(e) =>
              updateSettings({ compactAvatars: e.currentTarget.checked })
            }
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
      className={`rounded-full flex ${bg} h-[60px] w-[60px] cursor-pointer peer-checked:cursor-default border border-gray-50/50 peer-checked:border-2 peer-checked:border-blurple`}
    >
      {children}
    </div>
  </label>
);
