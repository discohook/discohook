# store

Shared database/redis package for Discohook.

## Migrations

### January 2026: Flow Decentralization

Prerequisites:
- Use the `db-migrate` script on root to get up to 0005 (flow-flattening), but no higher, so that `triggers` has a `flow` and its `flowId` is nullable, but no tables have been deleted.
- Be prepared to deploy commit <> so that your production code doesn't create unmigrated relational flows

Run `bun scripts/2026-decentralize-flows.ts postgresql://connectionurlhere` in this directory. It will iterate through all components and triggers to move their flows out of the `Flow` relational table and into their respective records, deleting associated flows as it goes along. Then, it will identify and delete all the remaining `Flow` records which do not point to either a component or a trigger as a cleanup measure. After it is complete, there should be zero flows remaining in your database, and the `Flow`, `Action`, and `DMC_to_Flow` tables should be safe to delete in a future migration.
