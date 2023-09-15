import type { V2_MetaFunction } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { zx } from "zodix";
import { TextInput } from "~/components/TextInput";
import { ZodQueryData } from "~/types/QueryData";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Boogiehook" },
    { name: "description", content: "The funkiest webhook interface since Discohook." },
  ];
};

export default function Index() {
  const [searchParams, setSearchParams] = useSearchParams();
  const parsed = zx.parseQuerySafe(searchParams, { data: ZodQueryData });
  const [data, setData] = useState(parsed.success ? parsed.data.data : { messages: [] });

  const [tab, setTab] = useState<"editor" | "preview">("editor");

  return (
    <div className="h-screen">
      <div className="md:flex h-full">
        <div className="p-4 w-1/2 overflow-y-auto">
        <TextInput
          label="Webhook URL"
          className="w-full"
        />
        </div>
        <div className="border-l-4 border-l-gray-400 p-4 w-1/2 overflow-y-auto">
        </div>
      </div>
    </div>
  );
}
