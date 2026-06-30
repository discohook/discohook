import z from "zod/v3";
import { SHORT } from "~/util/filehosts/postimages";
import type { LoaderArgs } from "~/util/loader";
import { zxParseParams } from "~/util/zod";

export interface PostimageDetails {
  image: string;
  url: string;
  filename?: string;
  hash?: string;
  delete_url?: string;
  thumbnail_url?: string;
}

export const loader = async ({ params }: LoaderArgs) => {
  const { id: image, hash } = zxParseParams(params, {
    id: z.string().regex(/^(\w+)$/),
    hash: z
      .string()
      .regex(/^(\w+)$/)
      .optional(),
  });
  const url = new URL(`${SHORT}/${image}/${hash ?? ""}`);

  const resp = await fetch(url);
  if (resp.ok) {
    const text = await resp.text();
    const details: PostimageDetails = {
      image,
      hash,
      url: "",
    };

    const urlMatches = text.matchAll(/"(https:\/\/i\.[^"]+)"/g);
    for (const match of urlMatches) {
      const imageUrl = match[1];
      try {
        new URL(imageUrl);
      } catch {
        continue;
      }
      if (!details.url) {
        details.url = imageUrl;
        details.filename = new URL(imageUrl).pathname.split("/").slice(-1)[0];
      } else if (details.url !== imageUrl) {
        details.thumbnail_url = imageUrl;
      }
    }

    const deleteUrlMatch = text.match(
      /https:\/\/postimg\.cc\/delete\/(\w+)\/(\w+)/g,
    );
    if (deleteUrlMatch) details.delete_url = deleteUrlMatch[0];

    if (details.url) return details;
    throw Response.json({ message: "Not Found" }, { status: 404 });
  }
  throw Response.json({ message: resp.statusText }, { status: resp.status });
};
