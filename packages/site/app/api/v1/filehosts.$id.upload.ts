import z from "zod/v3";
import {
  deleteFile as catboxDeleteFiles,
  uploadFile as catboxUploadFile,
} from "~/util/filehosts/catbox";
import {
  BASE as IMGBB_BASE,
  uploadFileAPI as imgbbUploadFileAPI,
} from "~/util/filehosts/imgbb";
import type { ActionArgs, LoaderArgs } from "~/util/loader";
import { zxParseForm, zxParseParams } from "~/util/zod";
import {
  catboxCookie,
  decryptEncryptedJwt,
  imgbbCookie,
} from "./filehosts.$id.config";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { id } = zxParseParams(params, {
    id: z.literal("imgbb"),
    // id: z.union([z.literal("imgbb"), z.literal("imgur")]),
  });

  switch (id) {
    case "imgbb": {
      const response = await fetch(IMGBB_BASE);
      if (!response.ok) {
        throw Response.json(
          { message: `Failed to get ImgBB data: HTTP ${response.status}` },
          { status: 500 },
        );
      }
      // const cookie = response.headers.get("Set-Cookie");
      const text = await response.text();
      const tokenMatch = text.match(/config\.auth_token="([\w-]+)";?$/m);
      if (!tokenMatch?.[1]) {
        throw Response.json(
          { message: "Could not obtain auth token from ImgBB" },
          { status: 500 },
        );
      }
      const typesMatch = text.match(/"image_types": ?(\[[\w", ]+\])/);
      let extensions: string[] | undefined;
      if (typesMatch?.[1]) {
        extensions = JSON.parse(typesMatch[1]);
      }
      return {
        token: tokenMatch[1],
        types: extensions,
        // cookie,
      };
    }
    default:
      throw Response.json(
        { message: "Unhandled service name" },
        { status: 404 },
      );
  }
};

export const action = async ({ request, context, params }: ActionArgs) => {
  const { id } = zxParseParams(params, {
    id: z.union([z.literal("catbox"), z.literal("imgbb")]),
  });

  const cookieHeader = request.headers.get("Cookie");
  switch (id) {
    case "catbox": {
      // Catbox does allow anonymous uploads, but I would rather not support
      // that functionality because of what would probably happen if people
      // started using Discohook as a proxy to abuse the service
      const cookie = await catboxCookie.parse(cookieHeader);
      if (cookie === null) {
        throw Response.json(
          { message: "Cannot use catbox without first configuring a userhash" },
          { status: 401 },
        );
      }
      const { userhash } = await decryptEncryptedJwt<{ userhash: string }>(
        context.env,
        cookie,
        id,
      );

      const formData = await request.formData();
      const data = await zxParseForm(
        formData,
        z.discriminatedUnion("type", [
          z.object({ type: z.literal("url"), url: z.string().url() }),
          z.object({ type: z.literal("file") }),
          z.object({ type: z.literal("delete"), ids: z.string().array() }),
        ]),
      );

      if (data.type === "delete") {
        await catboxDeleteFiles(data.ids, { userhash });
        return new Response(null, { status: 204 });
      }

      let source: Blob | string;
      switch (data.type) {
        case "url": {
          source = data.url;
          break;
        }
        case "file": {
          const file = formData.get("file");
          if (!file) {
            throw Response.json(
              { message: "Missing required file when using file upload type" },
              { status: 400 },
            );
          } else if (!(file instanceof File)) {
            throw Response.json(
              { message: "Provided file parameter was not of type File" },
              { status: 400 },
            );
          }
          source = file;
          break;
        }
        default:
          throw Response.json(
            {
              message: "Could not determine source to upload from your request",
            },
            { status: 500 },
          );
      }

      const uploaded = await catboxUploadFile(source, { userhash });
      return uploaded;
    }
    case "imgbb": {
      const cookie = await imgbbCookie.parse(cookieHeader);
      if (cookie === null) {
        throw Response.json(
          { message: "Cannot use ImgBB without first configuring a key" },
          { status: 401 },
        );
      }
      const { key } = await decryptEncryptedJwt<{ key: string }>(
        context.env,
        cookie,
        id,
      );

      const formData = await request.formData();
      const data = await zxParseForm(
        formData,
        z.discriminatedUnion("type", [
          z.object({
            type: z.literal("url"),
            url: z.string().url(),
            name: z.string().optional(),
          }),
          z.object({ type: z.literal("file"), name: z.string().optional() }),
        ]),
      );

      let source: Blob | string;
      switch (data.type) {
        case "url": {
          source = data.url;
          break;
        }
        case "file": {
          const file = formData.get("file");
          if (!file) {
            throw Response.json(
              { message: "Missing required file when using file upload type" },
              { status: 400 },
            );
          } else if (!(file instanceof File)) {
            throw Response.json(
              { message: "Provided file parameter was not of type File" },
              { status: 400 },
            );
          }
          source = file;
          break;
        }
        default:
          throw Response.json(
            {
              message: "Could not determine source to upload from your request",
            },
            { status: 500 },
          );
      }

      const uploaded = await imgbbUploadFileAPI(source, {
        key,
        name: data.name,
      });
      return uploaded;
    }
    default:
      throw Response.json(
        { message: "Unhandled service name" },
        { status: 404 },
      );
  }
};
