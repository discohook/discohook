import { z } from "zod";

// For when we can't use the schema directly because it's used to construct the type we're parsing with
export const futureSchema = <T extends z.ZodType<any>>(schema: () => T) =>
  z
    .any()
    .refine((obj) => schema().safeParse(obj).success)
    .transform((obj) => schema().parse(obj));
