import type {
  ActionFunctionArgs as RRActionFunctionArgs,
  LoaderFunctionArgs as RRLoaderFunctionArgs,
} from "@remix-run/router";
import { Env } from "~/types/env";

export interface Context {
  origin: string;
  env: Env;
}

// We are specifically using these imports from @remix-run/router because the
// adapter exports are not generic and we cannot pass Env like this.
export type LoaderArgs = RRLoaderFunctionArgs<Context> & { context: Context };
export type ActionArgs = RRActionFunctionArgs<Context> & { context: Context };
