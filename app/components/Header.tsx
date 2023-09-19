import { useSearchParams } from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import { useState } from "react";
import { HelpModal } from "~/modals/HelpModal";
import { Button } from "./Button";

export const Header: React.FC<{}> = ({}) => {
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(searchParams.get("m") === "help");

  return (
    <div className="sticky top-0 left-0 z-10 bg-slate-50 shadow-md w-full px-4 h-12 flex">
      <HelpModal open={open} setOpen={setOpen} />
      <Button
        className="my-auto ml-auto"
        discordstyle={ButtonStyle.Secondary}
        onClick={() => setOpen(true)}
      >
        Help
      </Button>
    </div>
  );
};
