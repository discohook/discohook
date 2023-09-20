import { useSearchParams } from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import { useState } from "react";
import { ExampleModal } from "~/modals/ExampleModal";
import { HelpModal } from "~/modals/HelpModal";
import { Button } from "./Button";

export const Header: React.FC<{}> = ({}) => {
  const [searchParams] = useSearchParams();
  const [helpOpen, setHelpOpen] = useState(searchParams.get("m") === "help");
  const [exampleOpen, setExampleOpen] = useState(searchParams.get("m") === "embed-example");

  return (
    <div className="sticky top-0 left-0 z-10 bg-slate-50 shadow-md w-full px-4 h-12 flex">
      <HelpModal open={helpOpen} setOpen={setHelpOpen} />
      <ExampleModal open={exampleOpen} setOpen={setExampleOpen} />
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
