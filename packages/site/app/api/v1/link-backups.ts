import { json } from "@remix-run/cloudflare";
import { z } from "zod/v3";
import { getUser } from "~/session.server";
import { ZodLinkQueryData } from "~/types/QueryData";
import type { ActionArgs } from "~/util/loader";
import { randomString } from "~/util/text";
import { requirePremiumOrThrow } from "~/util/users";
import { zxParseJson } from "~/util/zod";
import { getDb, linkBackups } from "../../store.server";
import { findMessagesPreviewImageUrl } from "./backups";

export const action = async ({ request, context }: ActionArgs) => {
  const { name, data } = await zxParseJson(request, {
    name: z.string().max(100),
    data: ZodLinkQueryData,
  });

  const user = await getUser(request, context, true);
  requirePremiumOrThrow(user);
  const db = getDb(context.env.HYPERDRIVE);

  // Roughly 99.7m combinations of 62 characters at a length of 6
  let length = 6;
  let code = randomString(length);
  let tries = 0;
  while (true) {
    if (tries >= 10) {
      throw json({
        message:
          "Failed to generate a unique code for this backup. Try again later.",
      });
    }
    const extant = await db.query.linkBackups.findFirst({
      where: (linkBackups, { eq }) => eq(linkBackups.code, code),
      columns: {
        id: true,
      },
    });
    if (extant) {
      tries += 1;
      if (tries >= 3) {
        // After 3 tries, increment length by 1 each try
        length += 1;
      }
      code = randomString(length);
    } else {
      break;
    }
  }

  return (
    await db
      .insert(linkBackups)
      .values({
        name,
        code,
        data,
        dataVersion: String(data.version ?? 1),
        previewImageUrl: findMessagesPreviewImageUrl([
          { data: { embeds: [data.embed.data] } },
        ]),
        ownerId: user.id,
      })
      .returning({
        id: linkBackups.id,
        name: linkBackups.name,
        code: linkBackups.code,
        dataVersion: linkBackups.dataVersion,
      })
  )[0];
};
