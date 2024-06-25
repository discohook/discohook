import { Snowflake } from "tif-snowflake";

// Not exported by the package
export type DeconstructedSnowflake = ReturnType<typeof Snowflake.parse>;

export const EPOCH = Date.UTC(2024, 1, 1).valueOf();

export const getId = ({ id }: { id: string | bigint }) => {
  return {
    ...Snowflake.parse(String(id), EPOCH),
    id: String(id),
  };
};
