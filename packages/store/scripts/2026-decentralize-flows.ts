import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { autoRollbackTx, type DBTransaction, getDb } from "../src/db";
import {
  flows as dbFlows,
  discordMessageComponents,
  discordMessageComponentsToFlows,
  triggers,
} from "../src/schema/schema";
import type {
  DraftComponent,
  DraftFlow,
  StorableComponent,
} from "../src/types/components";

// January 2026: Move flows away from a relational structure. I initially
// decided to give flows their own table because I thought I would introduce
// a feature where multiple components or triggers could share flows, but it
// never materialized and it's not worth the added complexity.
// I would have preferred to do this with a regular .sql script but I'm not
// very skilled at writing those such that it could do what this file does.

const connectionString = process.argv[2];
if (!connectionString) {
  throw Error("Must provide a database connection string to this script");
}
const db = getDb({ connectionString });

const perPage = 1000;

const stripId = <T extends { id: bigint }>(d: T): Omit<T, "id"> => {
  const { id: _, ...rest } = d;
  return rest;
};

const migrateComponents = async (
  tx: DBTransaction,
  toDeleteFlowIds: Set<bigint>,
) => {
  const toDeleteComponents = new Set<bigint>();
  const migratedComponentIds = new Set<bigint>();

  const purgeComponents = async () => {
    if (toDeleteComponents.size === 0) return;
    console.log(
      `Purging ${toDeleteComponents.size} deletable (no flow, no guild) components`,
    );
    await tx
      .delete(discordMessageComponents)
      .where(
        inArray(discordMessageComponents.id, Array.from(toDeleteComponents)),
      );
    toDeleteComponents.clear();
  };

  let page = 0;
  while (true) {
    const entries = await tx.query.discordMessageComponents.findMany({
      columns: { id: true, data: true, guildId: true },
      with: {
        componentsToFlows: {
          columns: {},
          with: {
            flow: {
              columns: { id: true, name: true },
              with: { actions: { columns: { data: true } } },
            },
          },
        },
      },
      offset: perPage * page,
      limit: perPage,
    });
    if (entries.length === 0) {
      console.log("Reached end of pagination for components");
      break;
    }
    console.log(
      "---\n",
      `Page: ${page * perPage + 1}-${page * perPage + perPage} (next ${entries.length})`,
      "\n---",
    );
    page += 1;

    for (const component of entries) {
      if (migratedComponentIds.has(component.id)) {
        // console.log(`Duplicate: ${component.id}`);
        continue;
      }

      const flows = component.componentsToFlows.map((ctf) => ({
        id: ctf.flow.id,
        name: ctf.flow.name || undefined,
        actions: ctf.flow.actions.map((a) => a.data),
      }));
      if (flows.length === 0) {
        if (
          component.data.type === ComponentType.Button &&
          (component.data.style === ButtonStyle.Link ||
            component.data.style === ButtonStyle.Premium)
        ) {
          // No log for N/A components
          continue;
        }
        if (
          component.guildId === null &&
          !("flow" in component.data) &&
          !("flows" in component.data)
        ) {
          // No flows and no guild: no reason to store this component. If it
          // has been placed on a message (unlikely), it can be removed by
          // index or data added via the web editor.
          toDeleteComponents.add(component.id);
          // if (toDeleteComponents.size >= 1000) {
          //   await purgeComponents();
          // }
          continue;
        }
        console.log(
          `Skipping component ${component.id}: no flows, perhaps already migrated`,
        );
        continue;
      }
      const data = component.data as StorableComponent | DraftComponent;
      let newData: DraftComponent | undefined;
      switch (data.type) {
        case ComponentType.Button: {
          if (
            data.style === ButtonStyle.Link ||
            data.style === ButtonStyle.Premium
          ) {
            // Shouldn't happen
            console.log(`Component ${component.id} is N/A`);
            continue;
          }
          if ("flow" in data) {
            // Shouldn't happen
            console.log(`Component ${component.id} is already migrated`);
            continue;
          }
          const { flowId: _, ...rest } = data;
          newData = {
            ...rest,
            flow: stripId(flows[0]),
          };
          break;
        }
        case ComponentType.StringSelect: {
          if ("flows" in data || "flow" in data) {
            // Shouldn't happen
            console.log(`Component ${component.id} is already migrated`);
            continue;
          }

          const flowMap = Object.fromEntries(
            (
              Object.entries(data.flowIds)
                .map(([optionValue, flowId]) => [
                  optionValue,
                  flows.find((f) => String(f.id) === flowId),
                ])
                .filter(([_, flow]) => !!flow) as [
                string,
                (typeof flows)[number],
              ][]
            ).map(([key, flow]) => [key, stripId(flow)]),
          );
          const newKeys = Object.keys(flowMap).length;
          const oldKeys = Object.keys(data.flowIds).length;
          if (newKeys !== oldKeys) {
            console.log(
              `WARNING: Component ${component.id}'s flow map has ${newKeys} keys, but the previous number of flows was ${oldKeys}.`,
            );
          }

          const { flowIds: _, ...rest } = data;
          newData = { ...rest, flows: flowMap };
          break;
        }
        case ComponentType.ChannelSelect:
        case ComponentType.MentionableSelect:
        case ComponentType.RoleSelect:
        case ComponentType.UserSelect: {
          if ("flow" in data) {
            // Shouldn't happen
            console.log(`Component ${component.id} is already migrated`);
            continue;
          }
          const { flowId: _, ...rest } = data;
          newData = {
            ...rest,
            flow: stripId(flows[0]),
          };
          break;
        }
        default:
          break;
      }
      if (!newData) {
        console.log(
          `Failed to get data for component ${component.id} (${component.data.type})`,
        );
        continue;
      }

      await tx
        .update(discordMessageComponents)
        .set({ data: newData })
        .where(eq(discordMessageComponents.id, component.id));
      console.log(`Migrated flows for component ${component.id}`);
      migratedComponentIds.add(component.id);
      for (const flow of flows) {
        toDeleteFlowIds.add(flow.id);
      }

      if (toDeleteFlowIds.size >= 1000) {
        await tx
          .delete(dbFlows)
          .where(inArray(dbFlows.id, Array.from(toDeleteFlowIds)));
        console.log("Deleted", toDeleteFlowIds.size, "flow entries");
        toDeleteFlowIds.clear();
      }
    }
  }
  await purgeComponents();
};

const migrateTriggers = async (
  tx: DBTransaction,
  toDeleteFlowIds: Set<bigint>,
) => {
  let page = 0;
  while (true) {
    const entries = await tx.query.triggers.findMany({
      where: isNull(triggers.flow),
      columns: { id: true },
      with: {
        flow: {
          columns: { id: true, name: true },
          with: { actions: { columns: { data: true } } },
        },
      },
      offset: perPage * page,
      limit: perPage,
    });
    if (entries.length === 0) {
      console.log("Reached end of pagination for triggers");
      break;
    }
    console.log(
      "---\n",
      `Page: ${page * perPage + 1}-${page * perPage + perPage} (next ${entries.length})`,
      "\n---",
    );
    page += 1;

    for (const trigger of entries) {
      if (!trigger.flow) {
        console.log(
          `Skipping trigger ${trigger.id}: no linked flow, perhaps already migrated`,
        );
        continue;
      }
      const flow: DraftFlow = {
        name: trigger.flow.name ?? undefined,
        actions: trigger.flow.actions.map((a) => a.data),
      };

      await tx
        .update(triggers)
        .set({ flow, flowId: null })
        .where(eq(triggers.id, trigger.id));
      console.log(`Migrated flow for trigger ${trigger.id}`);
      // migratedTriggerIds.add(trigger.id);
      toDeleteFlowIds.add(trigger.flow.id);

      if (toDeleteFlowIds.size >= 1000) {
        await tx
          .delete(dbFlows)
          .where(inArray(dbFlows.id, Array.from(toDeleteFlowIds)));
        console.log("Deleted", toDeleteFlowIds.size, "flow entries");
        toDeleteFlowIds.clear();
      }
    }
  }
};

await db.transaction(
  autoRollbackTx(async (tx) => {
    const toDeleteFlowIds = new Set<bigint>();

    console.log("---\nMigrating components\n---");
    await migrateComponents(tx, toDeleteFlowIds);

    console.log("---\nMigrating triggers\n---");
    await migrateTriggers(tx, toDeleteFlowIds);

    if (toDeleteFlowIds.size !== 0) {
      await tx
        .delete(dbFlows)
        .where(inArray(dbFlows.id, Array.from(toDeleteFlowIds)));
      await tx
        .delete(discordMessageComponentsToFlows)
        .where(
          inArray(
            discordMessageComponentsToFlows.flowId,
            Array.from(toDeleteFlowIds),
          ),
        );
      console.log("Deleted", toDeleteFlowIds.size, "flow entries");
      toDeleteFlowIds.clear();
    }

    // while (true) {
    //   const deletableFlows = await tx
    //     .select({
    //       id: dbFlows.id,
    //       ctfCount: count(discordMessageComponentsToFlows),
    //     })
    //     .from(dbFlows)
    //     .groupBy(dbFlows.id)
    //     .leftJoin(
    //       discordMessageComponentsToFlows,
    //       eq(discordMessageComponentsToFlows.flowId, dbFlows.id),
    //     );
    //   const hasCtf = deletableFlows.filter((f) => f.ctfCount !== 0);
    //   if (hasCtf.length === 0) break;

    //   console.log("---\nComponents re-pass\n---");
    //   await migrateComponents(tx, toDeleteFlowIds);
    // }

    // Remove flows with no associations
    console.log("---\nCleaning up flows with no components or triggers\n---");

    // Debug (making sure count is accurate)
    // const x = (
    //   await tx.query.discordMessageComponentsToFlows.findMany({
    //     columns: {
    //       // discordMessageComponentId: true,
    //       // flowId: true,
    //     },
    //     with: {
    //       discordMessageComponent: true,
    //       flow: {
    //         columns: { id: true },
    //         with: {
    //           actions: { columns: { data: true } },
    //         },
    //       },
    //     },
    //   })
    // );
    // console.log(x[0].discordMessageComponent.data)
    // const remainingComponents = await tx
    //   .select({
    //     id: discordMessageComponentsToFlows.discordMessageComponentId,
    //     flowId: discordMessageComponentsToFlows.flowId,
    //   })
    //   .from(discordMessageComponentsToFlows);
    // console.log(remainingComponents);

    // console.log("All left:", await tx.select({ c: count() }).from(dbFlows));

    const deleted = await tx
      .delete(dbFlows)
      .where(
        and(
          eq(
            sql`(select count(*) from ${triggers} where ${triggers.flowId} = ${dbFlows.id})`,
            0,
          ),
          eq(
            sql`(select count(*) from ${discordMessageComponentsToFlows} where ${discordMessageComponentsToFlows.flowId} = ${dbFlows.id})`,
            0,
          ),
        ),
      )
      .returning({ id: dbFlows.id });
    console.log("Deleted", deleted.length, "remaining flows");

    // console.log("All left:", await tx.select({ c: count() }).from(dbFlows));

    console.log("indev: rolling back");
    tx.rollback();
  }),
);
