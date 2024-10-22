import { Snowflake } from "tif-snowflake";

export const EPOCH = Date.UTC(2024, 1, 1).valueOf();

/** @type {(timestamp?: number | Date) => string} */
export const generateId = (timestamp) => {
  return Snowflake.generate({
    timestamp,
    epoch: EPOCH,
  });
};

console.log(generateId());
