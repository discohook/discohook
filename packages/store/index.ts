import { FlowActionType } from "./src/types/index.js";

export * from "./src/db.js";
export * from "./src/kv.js";
export * from "./src/redis.js";
export * from "./src/schema/index.js";
export * from "./src/types/index.js";
export * from "./src/zod/index.js";

export const flowActionTypeMeta: Partial<
  Record<
    FlowActionType,
    {
      /** This action can finalize an interaction flow */
      isResponse?: boolean;
      /** This action must happen after a response */
      mustFollow?: boolean;
    }
  >
> = {
  [FlowActionType.Dud]: { isResponse: true },
  [FlowActionType.Wait]: { mustFollow: true },
  [FlowActionType.SendMessage]: { isResponse: true },
};
