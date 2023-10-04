import { z } from "zod";

export const jsonAsString = <T extends z.AnyZodObject>(schema?: T) =>
  z
    .string()
    .refine((val) => {
      try {
        const parsed = JSON.parse(val);
        if (schema) {
          return schema.safeParse(parsed).success;
        }
        return true;
      } catch {
        return false;
      }
    })
    .transform((val) => JSON.parse(val) as z.infer<T>);
