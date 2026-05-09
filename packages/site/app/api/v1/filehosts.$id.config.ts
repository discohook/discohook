import { createCookie } from "@remix-run/cloudflare";
import { EncryptJWT, jwtDecrypt } from "jose";
import z from "zod/v3";
import type { ActionArgs, Context } from "~/util/loader";
import { zxParseJson, zxParseParams } from "~/util/zod";

const getGenericSignedCookie = (name: string) => {
  return createCookie(name, {
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secure: true,
    maxAge: 86400 * 30 * 6, // 6 months
  });
};

export const catboxCookie = getGenericSignedCookie("__discohook_catbox");
export const imgbbCookie = getGenericSignedCookie("__discohook_imgbb");

const generateEncryptedJwt = async (
  env: Context["env"],
  body: any,
  scope: string,
): Promise<string> => {
  if (!env.ENC_SECRET) throw Error("ENC_SECRET is required to encrypt");

  const secretKey = Uint8Array.from(
    env.ENC_SECRET.split("").map((x) => x.charCodeAt(0)),
  );
  return await new EncryptJWT({ ...body, _sc: scope })
    .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
    .setIssuedAt()
    .encrypt(secretKey);
};

export const decryptEncryptedJwt = async <T>(
  env: Context["env"],
  jwt: string,
  scope: string,
): Promise<T> => {
  if (!env.ENC_SECRET) throw Error("ENC_SECRET is required to decrypt");

  const secretKey = Uint8Array.from(
    env.ENC_SECRET.split("").map((x) => x.charCodeAt(0)),
  );
  const { payload } = await jwtDecrypt(jwt, secretKey);
  if (payload._sc !== scope) {
    throw Error("Incorrect scope");
  }
  const { _sc, ...rest } = payload;
  return rest as T;
};

export const action = async ({ request, context, params }: ActionArgs) => {
  const { id } = zxParseParams(params, {
    id: z.union([z.literal("catbox"), z.literal("imgbb")]),
  });

  switch (id) {
    case "catbox": {
      const { userhash } = await zxParseJson(request, {
        userhash: z.string().nullable(),
      });
      if (userhash === null) {
        const value = await catboxCookie.serialize("", { maxAge: 0 });
        return new Response(null, {
          status: 204,
          headers: { "Set-Cookie": value },
        });
      }
      const value = await catboxCookie.serialize(
        await generateEncryptedJwt(context.env, { userhash }, id),
      );
      return new Response(null, {
        status: 204,
        headers: { "Set-Cookie": value },
      });
    }
    case "imgbb": {
      const { key } = await zxParseJson(request, {
        key: z.string().nullable(),
      });
      const value = await imgbbCookie.serialize(
        await generateEncryptedJwt(context.env, { key }, id),
      );
      return new Response(null, {
        status: 204,
        headers: { "Set-Cookie": value },
      });
    }
    default:
      throw Response.json(
        { message: "Unhandled service name" },
        { status: 404 },
      );
  }
};
