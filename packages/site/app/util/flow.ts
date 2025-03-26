import type { DraftFlow, Flow } from "~/store.server";

export const flowToDraftFlow = (flow: Flow): DraftFlow => ({
  name: flow.name,
  actions: flow.actions.map((a) => a.data),
});

export const draftFlowToFlow = (flow: DraftFlow): Flow => ({
  id: 0n,
  name: flow.name ?? null,
  actions: flow.actions.map((a) => ({
    id: 0n,
    flowId: 0n,
    type: a.type,
    data: a,
  })),
});
