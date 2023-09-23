import { useSearchParams } from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import { useState } from "react";
import { ExampleModal } from "~/modals/ExampleModal";
import { HelpModal } from "~/modals/HelpModal";
import { User } from "~/session.server";
import { getUserAvatar, getUserTag } from "~/util/users";
import { Button } from "./Button";

export const Header: React.FC<{ user?: User | null }> = ({ user }) => {
  const [searchParams] = useSearchParams();
  const [helpOpen, setHelpOpen] = useState(searchParams.get("m") === "help");
  const [exampleOpen, setExampleOpen] = useState(
    searchParams.get("m") === "embed-example"
  );

  return (
    <div className="sticky top-0 left-0 z-10 bg-slate-50 shadow-md w-full px-4 h-12 flex">
      <HelpModal open={helpOpen} setOpen={setHelpOpen} />
      <ExampleModal open={exampleOpen} setOpen={setExampleOpen} />
      <div className="h-9 w-9 my-auto mr-4 bg-[url('/logos/boogiehook.svg')] hover:bg-[url('/logos/boogiehook_star.svg')] bg-cover bg-center" />
      {user && (
        <div className="flex my-auto">
          <img
            className="rounded-full h-7 w-7 mr-1.5"
            src={getUserAvatar(user, { size: 64 })}
          />
          <p className="text-base font-medium hidden sm:block my-auto">
            {user.discordUser?.globalName ?? getUserTag(user)}
          </p>
        </div>
      )}
      <Button
        className="my-auto ml-auto"
        discordstyle={ButtonStyle.Secondary}
        onClick={() => setHelpOpen(true)}
      >
        Help
      </Button>
      <Button
        className="my-auto ml-2"
        discordstyle={ButtonStyle.Secondary}
        onClick={() => setExampleOpen(true)}
      >
        Embed Example
      </Button>
    </div>
  );
};
