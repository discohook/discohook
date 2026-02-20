import { json } from "@remix-run/cloudflare";
import type { Params } from "@remix-run/react";
import { isSnowflake } from "discord-snowflake";
import {
  type output,
  type SafeParseReturnType,
  ZodError,
  type ZodObject,
  type ZodRawShape,
  type ZodTypeAny,
  z,
} from "zod/v3";
import { zx } from "zodix";

export const jsonAsString = <T extends z.ZodTypeAny>(schema?: T) =>
  z
    .string()
    .refine((val) => {
      try {
        const parsed = JSON.parse(val);
        if (schema) {
          const sp = schema.safeParse(parsed);
          // if (!sp.success) console.log(sp.error.issues);
          return sp.success;
        }
        return true;
      } catch {
        return false;
      }
    })
    .transform((val) => JSON.parse(val) as z.infer<T>);

export const snowflakeAsString = () =>
  z
    .string()
    .min(17, "Invalid ID")
    .max(22, "Invalid ID")
    .refine((v) => isSnowflake(v), "Invalid ID")
    .transform((v) => BigInt(v));

type ParsedData<T extends ZodRawShape | ZodTypeAny> = T extends ZodTypeAny
  ? output<T>
  : T extends ZodRawShape
    ? output<ZodObject<T>>
    : never;

type SafeParsedData<T extends ZodRawShape | ZodTypeAny> = T extends ZodTypeAny
  ? SafeParseReturnType<z.infer<T>, ParsedData<T>>
  : T extends ZodRawShape
    ? SafeParseReturnType<ZodObject<T>, ParsedData<T>>
    : never;

type Options = {
  /** Custom error message for when the validation fails. */
  message?: string;
  /** Status code for thrown request when validation fails. */
  status?: number;
};

const isZodType = (input: ZodTypeAny | ZodRawShape) => {
  return typeof input.parse === "function";
};

export const zxParseParams = <T extends ZodRawShape | ZodTypeAny>(
  params: Params,
  schema: T,
  options?: Options,
): ParsedData<T> => {
  const parsed = zx.parseParamsSafe(params, schema);
  if (!parsed.success) {
    throw json(
      {
        message: options?.message ?? "Bad Request",
        issues: parsed.error.issues,
      },
      { status: options?.status ?? 400 },
    );
  }
  return parsed.data;
};

export const zxParseQuery = <T extends ZodRawShape | ZodTypeAny>(
  request: Request | URLSearchParams,
  schema: T,
  options?: Options,
): ParsedData<T> => {
  const parsed = zx.parseQuerySafe(request, schema);
  if (!parsed.success) {
    throw json(
      {
        message: options?.message ?? "Bad Request",
        issues: parsed.error.issues,
      },
      { status: options?.status ?? 400 },
    );
  }
  return parsed.data;
};

export const zxParseForm = async <T extends ZodRawShape | ZodTypeAny>(
  request: Request | FormData,
  schema: T,
  options?: Options,
): Promise<ParsedData<T>> => {
  const parsed = await zx.parseFormSafe(request, schema);
  if (!parsed.success) {
    throw json(
      {
        message: options?.message ?? "Bad Request",
        issues: parsed.error.issues,
      },
      { status: options?.status ?? 400 },
    );
  }
  return parsed.data;
};

export const zxParseJsonSafe = async <T extends ZodRawShape | ZodTypeAny>(
  request: Request,
  schema: T,
  _options?: Options,
): Promise<SafeParsedData<T>> => {
  const data = await request.json();
  // @ts-expect-error
  const finalSchema = isZodType(schema) ? schema : z.object(schema);
  // @ts-expect-error
  return finalSchema.safeParseAsync(data);
};

export const zxParseJson = async <T extends ZodRawShape | ZodTypeAny>(
  request: Request,
  schema: T,
  options?: Options,
): Promise<ParsedData<T>> => {
  try {
    const data = await request.json();
    // @ts-expect-error
    const finalSchema = isZodType(schema) ? schema : z.object(schema);
    // @ts-expect-error
    return await finalSchema.parseAsync(data);
  } catch (error) {
    throw json(
      {
        message: options?.message ?? "Bad Request",
        issues: error instanceof ZodError ? error.format() : undefined,
      },
      { status: options?.status ?? 400 },
    );
  }
};
