import { z } from "zod/v3";

// For when we can't use the schema directly because it's used to construct the type we're parsing with
export const futureSchema = <T extends z.ZodType<any>>(schema: () => T) =>
  z
    .any()
    .refine((obj) => schema().safeParse(obj).success)
    .transform((obj) => schema().parse(obj));

// Thanks lorenzodejong!
// https://github.com/colinhacks/zod/issues/831#issuecomment-1773734131
export const isValidZodLiteralUnion = <T extends z.ZodLiteral<unknown>>(
  literals: T[],
): literals is [T, T, ...T[]] => literals.length >= 2;

export const constructZodLiteralUnionType = <T extends z.ZodLiteral<unknown>>(
  literals: T[],
) => {
  if (!isValidZodLiteralUnion(literals)) {
    throw new Error(
      "Literals passed do not meet the criteria for constructing a union schema, the minimum length is 2",
    );
  }
  return z.union(literals);
};

export const zodUnionFromReadonly = <T extends z.Primitive>(
  values: readonly T[],
) => constructZodLiteralUnionType(values.map((value) => z.literal(value)));
