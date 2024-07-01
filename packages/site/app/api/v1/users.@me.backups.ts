import { SerializeFrom } from "@remix-run/cloudflare";
import { getMessageText } from "~/components/editor/MessageEditor.client";
import { getUserId } from "~/session.server";
import { getDb } from "~/store.server";
import { LoaderArgs } from "~/util/loader";

export const loader = async ({ request, context }: LoaderArgs) => {
  const userId = await getUserId(request, context, true);
  const db = getDb(context.env.HYPERDRIVE.connectionString);
  const userBackups = await db.query.backups.findMany({
    where: (backups, { eq }) => eq(backups.ownerId, userId),
    columns: {
      id: true,
      name: true,
      previewImageUrl: true,
      data: true,
    },
  });

  return userBackups.map((backup) => ({
    id: backup.id.toString(),
    name: backup.name,
    previewImageUrl: backup.previewImageUrl,
    data: {
      messages: backup.data.messages.map((message) => ({
        text: getMessageText(message.data)?.slice(0, 100),
      })),
    },
  }));
};

export type PartialBackupsWithMessages = SerializeFrom<typeof loader>;
