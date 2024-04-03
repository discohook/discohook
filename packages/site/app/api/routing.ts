import { z } from "zod";
import { ZodDonateKeyType } from "./v1/donate.$type";

export const BRoutes = {
  /** - POST /audit-log */
  auditLog() {
    return "/audit-log" as const;
  },

  /**
   * - POST /backups
   * - GET /backups/:id
   * - PATCH /backups/:id
   */
  backups(id?: number) {
    return id ? (`/backups/${id}` as const) : ("/backups" as const);
  },

  /**
   * - POST /components
   * - GET /components?id=...
   */
  components() {
    return "/components" as const;
  },

  /** - POST /donate/:type */
  donate(type: z.infer<typeof ZodDonateKeyType>) {
    return `/donate/${type}` as const;
  },

  /**
   * - POST /link-backups
   * - GET /link-backups/:id
   * - PATCH /link-backups/:id
   */
  linkBackups(id?: number) {
    return id ? (`/link-backups/${id}` as const) : ("/link-backups" as const);
  },

  /** - GET /oembed?data=... */
  oembed() {
    return "/oembed" as const;
  },

  /**
   * - POST /share
   * - GET /share/:shareId
   * - PATCH /share/:shareId
   */
  share(shareId?: string) {
    return shareId ? (`/share/${shareId}` as const) : ("/share" as const);
  },

  /** - GET /unfurl?url=... */
  unfurl() {
    return "/unfurl" as const;
  },
};

export const apiUrl = (
  route: ReturnType<(typeof BRoutes)[keyof typeof BRoutes]>,
  version?: 1,
) => `/api/v${version ?? 1}${route}`;
