import { Link, useLocation, useSearchParams } from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import { useState } from "react";
import LocalizedStrings from "react-localization";
import { ExampleModal } from "~/modals/ExampleModal";
import { HelpModal } from "~/modals/HelpModal";
import { SettingsModal } from "~/modals/SettingsModal";
import { User } from "~/session.server";
import { getUserAvatar, getUserTag } from "~/util/users";
import { Button } from "./Button";

const strings = new LocalizedStrings({
  en: {
    settings: "Settings",
    help: "Help",
    embedExample: "Embed Example",
  },
  fr: {
    settings: "Paramètres",
    help: "Aide",
    embedExample: "Exemple",
  },
});

export const Header: React.FC<{ user?: User | null }> = ({ user }) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dm = searchParams.get("m");
  const [helpOpen, setHelpOpen] = useState(dm === "help");
  const [exampleOpen, setExampleOpen] = useState(dm === "embed-example");
  const [settingsOpen, setSettingsOpen] = useState(dm === "settings");

  return (
    <div className="sticky top-0 left-0 z-10 bg-slate-50 dark:bg-[#1E1F22] shadow-md w-full px-4 h-12 flex">
      <HelpModal open={helpOpen} setOpen={setHelpOpen} />
      <ExampleModal open={exampleOpen} setOpen={setExampleOpen} />
      <SettingsModal
        open={settingsOpen}
        setOpen={setSettingsOpen}
        user={user}
      />
      <div className="h-9 w-9 my-auto mr-4 bg-[url('/logos/boogiehook.svg')] hover:bg-[url('/logos/boogiehook_star.svg')] bg-cover bg-center" />
      {user && (
        <Link to="/me" className="flex my-auto -mx-2 py-1 px-2 rounded hover:bg-gray-200 hover:dark:bg-gray-700 transition" target={location.pathname === "/" ? "_blank" : undefined}>
          <img
            className="rounded-full h-7 w-7 mr-1.5"
            src={getUserAvatar(user, { size: 64 })}
          />
          <p className="text-base font-medium hidden sm:block my-auto">
            {user.discordUser?.globalName ?? getUserTag(user)}
          </p>
        </Link>
      )}
      <div className="grow flex overflow-x-auto ml-6">
        <Button
          className="my-auto mr-2 shrink-0"
          discordstyle={ButtonStyle.Secondary}
          onClick={() => setSettingsOpen(true)}
        >
          {strings.settings}
        </Button>
        <Button
          className="my-auto ml-auto shrink-0"
          discordstyle={ButtonStyle.Secondary}
          onClick={() => setHelpOpen(true)}
        >
          {strings.help}
        </Button>
        <Button
          className="my-auto ml-2 shrink-0"
          discordstyle={ButtonStyle.Secondary}
          onClick={() => setExampleOpen(true)}
        >
          {strings.embedExample}
        </Button>
      </div>
    </div>
  );
};
