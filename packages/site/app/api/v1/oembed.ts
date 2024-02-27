import { z } from "zod";
import { zx } from "zodix";
import { LoaderArgs } from "~/util/loader";
import { jsonAsString } from "~/util/zod";

// Schemas and descriptions from https://oembed.com/#section2

export const ZodOEmbedType = z.enum(["photo", "video", "link", "rich"]);

export const ZodOEmbedData = z.object({
  /** The resource type. Valid values, along with value-specific parameters, are described below. */
  type: ZodOEmbedType,
  /** The oEmbed version number. This must be 1.0. */
  version: z.literal("1.0"),
  /** A text title, describing the resource. */
  title: z.ostring(),
  /** The name of the author/owner of the resource. */
  author_name: z.ostring(),
  /** A URL for the author/owner of the resource. */
  author_url: z.ostring(),
  /** The name of the resource provider. */
  provider_name: z.ostring(),
  /** The url of the resource provider. */
  provider_url: z.ostring(),
  /** The suggested cache lifetime for this resource, in seconds. Consumers may choose to use this value or not. */
  cache_age: z.ostring(),
  /** A URL to a thumbnail image representing the resource. The thumbnail must respect any maxwidth and maxheight parameters. If this parameter is present, thumbnail_width and thumbnail_height must also be present. */
  thumbnail_url: z.ostring(),
  /** The width of the optional thumbnail. If this parameter is present, thumbnail_url and thumbnail_height must also be present. */
  thumbnail_width: z.onumber(),
  /** The height of the optional thumbnail. If this parameter is present, thumbnail_url and thumbnail_width must also be present.  */
  thumbnail_height: z.onumber(),
  height: z.onumber(),
  width: z.onumber(),
  html: z.ostring(),
});

export const loader = async ({ request }: LoaderArgs) =>
  zx.parseQuery(request, {
    data: jsonAsString(ZodOEmbedData),
  }).data;
