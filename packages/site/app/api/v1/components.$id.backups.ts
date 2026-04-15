import { getUserId } from "~/session.server";
import { getDb, sql } from "~/store.server";
import { extractInteractiveComponents } from "~/util/discord";
import { LoaderArgs } from "~/util/loader";
import { snowflakeAsString, zxParseParams } from "~/util/zod";

export interface ComponentFoundBackup {
  id: string;
  name?: string;
  message: {
    index: number;
    name?: string;
    total: number;
  };
}

export type ComponentFoundBackupMap = Record<string, ComponentFoundBackup[]>;
export type ComponentFoundBackupStateAction = {
  action: "add";
  id: string;
  value: ComponentFoundBackup[];
};
export type ComponentFoundBackupHook = [
  ComponentFoundBackupMap,
  React.Dispatch<ComponentFoundBackupStateAction>,
];

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { id: componentId } = zxParseParams(params, {
    id: snowflakeAsString(),
  });
  const userId = await getUserId(request, context, true);

  const db = getDb(context.env.HYPERDRIVE);
  const component = await db.query.discordMessageComponents.findFirst({
    where: (table, { eq }) => eq(table.id, componentId),
    columns: { id: true, createdById: true },
  });
  if (
    !component ||
    (component.createdById !== null && component.createdById !== userId)
  ) {
    throw Response.json(
      { message: "Unknown component or you do not own it" },
      { status: 404 },
    );
  }

  // Find backups that this component is present in. This is useful for notifying the user of
  // duplicated data that they may have mistakenly created. We intentionally do not create
  // distinct IDs for components when backups are duplicated, but this sometimes leads to users
  // thinking components in duplicated backups are entirely separate, when they are not.
  const presentInBackups = await db.query.backups.findMany({
    where: (table, { and, eq, like }) =>
      and(
        // For now we're limiting to owner because of performance concerns,
        // and also because in most cases it will not be very useful to see
        // links to backups you cannot modify.
        eq(table.ownerId, userId),
        like(sql`${table.data}::text`, `%"custom_id":"p_${componentId}"%`),
      ),
    columns: { id: true, name: true, data: true, ownerId: true },
  });

  const backups: ComponentFoundBackup[] = [];
  for (const backup of presentInBackups) {
    let mi = -1;
    for (const message of backup.data.messages) {
      mi += 1;
      if (!message.data.components) continue;
      const backupComponents = extractInteractiveComponents(
        message.data.components,
      );
      if (backupComponents.find((c) => c.custom_id === `p_${componentId}`)) {
        backups.push({
          id: String(backup.id),
          name: backup.ownerId === userId ? backup.name : undefined,
          message: {
            index: mi,
            name: backup.ownerId === userId ? message.name : undefined,
            total: backup.data.messages.length,
          },
        });
      }
    }
  }

  return backups;
};
