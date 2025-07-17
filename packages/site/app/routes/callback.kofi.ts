import { json } from "@remix-run/cloudflare";
import {
  ZodKofiDonationPayload,
  ZodKofiGetSupporterDetails,
} from "~/types/kofi";
import type { ActionArgs } from "~/util/loader";
import Scraper from "~/util/scraper";
import { zxParseForm, zxParseJson } from "~/util/zod";

const KOFI_BASE = "https://ko-fi.com";

// This regex only works post-username change because now all non-bot
// usernames follow this scheme. If Ko-fi provides an old username, then it's
// not valid and we can't use it anyway.
const DISCORD_NAME_RE = /: ([a-z0-9_.]+)(?:#0)?$/;

export const action = async ({ request, context }: ActionArgs) => {
  const verificationToken = context.env.KOFI_WEBHOOK_TOKEN;
  if (!verificationToken) {
    // Technically optional on ko-fi's side,
    // but there's no reason not to do this.
    throw new Error("Must provide KOFI_WEBHOOK_TOKEN");
  }

  const { data } = await zxParseForm(request, ZodKofiDonationPayload);
  if (data.verification_token !== verificationToken) {
    throw json({ message: "Invalid verification token." }, 403);
  }

  if (!data.email) {
    return json({ message: "No email" });
  }

  const timestamp = new Date().getTime().toString();
  const params = new URLSearchParams({
    range: "7",
    types: "One-off,AllMonthly,Commission,ShopPaid",
    searchKey: data.email,
    sortByKey: "lastsupported",
    isDesc: "true",
    pageNumber: "1",
    itemsPerPage: "50",
    _: timestamp,
  });

  // Ko-fi doesn't tell you the donator's Discord username in
  // the payload, so we have to find it
  const response = await fetch(
    `${KOFI_BASE}/SupporterManagement/GetSupporterDetailsAsJson?${params}`,
    { method: "GET" },
  );
  const { List: details } = await zxParseJson(
    new Request(await response.text(), response),
    ZodKofiGetSupporterDetails,
  );
  // Make sure since ko-fi's search seems fuzzy
  const filtered = details.filter((d) => d.Supporter.Email === data.email);
  if (filtered.length === 0) {
    return json({ message: "No payments from this email" });
  }
  const supporter = filtered[0].Supporter;

  const pageResponse = await fetch(
    `${KOFI_BASE}/api/supporters/${supporter.PageId}/info-dialog?_=${timestamp}`,
    { method: "GET" },
  );
  const scraper = new Scraper().fromResponse(pageResponse);
  const discordNameRaw = await scraper
    .querySelector("div.kfds-lyt-column-start>span.hint:last-child")
    .getText({ last: true });
  if (!discordNameRaw) {
    return json({ message: "Could not locate user's Discord username" });
  }

  const match = DISCORD_NAME_RE.exec(discordNameRaw);
  if (!match) {
    return json({ message: `Discord name was invalid (${discordNameRaw})` });
  }

  // const username = match[1];

  return null;
};
