import { MetaFunction, useLoaderData } from "@remix-run/react";
import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import { useTranslation } from "react-i18next";
import { Header } from "~/components/Header";
import { Prose } from "~/components/Prose";
import { MessageComponents } from "~/components/preview/Components";
import { getUser } from "~/session.server";
import { LoaderArgs } from "~/util/loader";

export const loader = ({ request, context }: LoaderArgs) =>
  getUser(request, context);

export const meta: MetaFunction = () => [{ title: "Flows - Discohook" }];

export default function Legal() {
  const user = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <div>
      <Header user={user} />
      <Prose>
        <h1 className="font-bold text-2xl">How Flows Work</h1>
        <p>Flows make your buttons and actions extremely versatile.</p>
        <hr className="border border-gray-500/20 my-4" />
        <MessageComponents
          components={[
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  type: ComponentType.Button,
                  style: ButtonStyle.Link,
                  url: "/bot",
                  label: t("inviteBot"),
                },
              ],
            },
          ]}
        />
      </Prose>
    </div>
  );
}
