# store

Shared database/redis package for Discohook.

## Migrations

### February 2026: Drizzle 0.33 breaking change

Prerequisites:
- Run a `yarn install` to ensure you are up to date (above drizzle-orm version 0.32.1)

Run `yarn db-migrate` (root dir) to update all your old json columns which were previously incorrectly stringified by drizzle. If you cannot, just make sure [migration 006](/drizzle/0006_json-columns.sql) is applied.
