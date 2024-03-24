import { z } from "zod";
import {
  QueryData,
  ZodQueryDataMessage,
  ZodQueryDataTarget,
} from "./QueryData";

export interface DiscohookBackup {
  id?: number;
  name: string;
  messages: QueryData["messages"];
  targets: QueryData["targets"];
  schedule?: {
    cron: string;
    timezone?: string;
  };
}

export const ZodDiscohookBackup: z.ZodType<DiscohookBackup> = z.object({
  id: z.onumber(),
  name: z.string(),
  messages: ZodQueryDataMessage.array(),
  targets: ZodQueryDataTarget.array(),
  schedule: z
    .object({
      cron: z.string(),
      timezone: z.ostring(),
    })
    .optional(),
});

// https://github.com/discohook/site/blob/main/modules/database/backup/types/ExportData.ts

type MessageData = QueryData["messages"][number]["data"];

export type DiscohookBackupExportDataWithBackups =
  | {
      version: 3;
      backups: {
        name: string;
        webhookUrl?: string;
        message: MessageData;
      }[];
    }
  | {
      version: 4;
      backups: {
        name: string;
        webhookUrl?: string;
        messages: MessageData[];
      }[];
    }
  | {
      version: 5;
      backups: {
        name: string;
        messages: MessageData[];
        target: {
          url?: string;
          message?: string;
        };
      }[];
    }
  | {
      version: 6;
      backups: {
        name: string;
        messages: QueryData["messages"];
        target: {
          url?: string;
        };
      }[];
    }
  | {
      version: 7;
      backups: Pick<DiscohookBackup, "name" | "messages" | "targets">[];
    }
  | {
      version: 8;
      backups: Omit<DiscohookBackup, "id">[];
    };

export type DiscohookBackupExportData =
  | {
      version: 1;
      name: string;
      // camel case version of MessageData
      message: Record<string, unknown>;
    }
  | {
      version: 2;
      name: string;
      message: MessageData;
    }
  | DiscohookBackupExportDataWithBackups;
