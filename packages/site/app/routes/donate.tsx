import { MetaFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import React, { useState } from "react";
import { twJoin } from "tailwind-merge";
import { Header } from "~/components/Header";
import { Twemoji } from "~/components/icons/Twemoji";
import { linkClassName } from "~/components/preview/Markdown";
import { CryptoDonateInfoModal } from "~/modals/CryptoDonateInfoModal";
import {
  SimpleTextModal,
  SimpleTextModalProps,
} from "~/modals/SimpleTextModal";
import { getUser } from "~/session.server";
import { LoaderArgs } from "~/util/loader";

export const loader = async ({ request, context }: LoaderArgs) => {
  const user = await getUser(request, context);
  const wallets = {
    // btc: context.env.BITCOIN_ADDRESS,
  };

  return { user, wallets };
};

export const meta: MetaFunction = () => {
  return [
    { title: "Discohook Deluxe" },
    { name: "og:site_name", content: "Discohook" },
    { name: "og:title", content: "Subscribe to Deluxe!" },
    { name: "theme-color", content: "#FF81FF" },
  ];
};

export const Cell: React.FC<
  React.PropsWithChildren & {
    className?: string;
    premium?: boolean;
    onClick?: () => void;
  }
> = ({ children, className, premium, onClick }) => (
  <div
    className={twJoin(
      "table-cell text-center p-1 border border-black/10 dark:border-gray-50/10",
      premium ? "bg-sky-200 dark:bg-sky-800/30" : "",
      className ?? "",
    )}
  >
    {onClick ? (
      <button
        type="button"
        onClick={onClick}
        className="text-blurple-400 hover:underline"
      >
        {children}
      </button>
    ) : (
      children
    )}
  </div>
);

const Feature: React.FC<
  React.PropsWithChildren<{
    id: string;
    setFeatProps: React.Dispatch<
      React.SetStateAction<SimpleTextModalProps | undefined>
    >;
  }>
> = ({ id, setFeatProps }) => (
  <button
    type="button"
    id={id}
    className="block ltr:text-left rtl:text-right w-full p-4 rounded-lg bg-slate-100 dark:bg-gray-700 border border-black/10 dark:border-gray-50/10 shadow hover:shadow-lg transition"
    onClick={() =>
      setFeatProps({
        ...features[id],
        title: `Deluxe feature: ${features[id].title}`,
      })
    }
  >
    <p className="font-semibold text-lg">{features[id].title}</p>
    <div className="truncate max-h-6">{features[id].children}</div>
  </button>
);

const features: Record<string, SimpleTextModalProps> = {
  "max-actions": {
    title: "Max. flow actions",
    children: (
      <>
        Free users can have 10 non-check/stop actions per flow - plenty for
        simple designs, but something more advanced could require the massive{" "}
        <Twemoji emoji="💪" /> 40 <Twemoji emoji="💪" /> actions afforded to
        Deluxe members.
        <br />
        <br />
        Each flow can send up to 15 messages, not including a stop-type action.
        Read more about{" "}
        <Link to="/guide/getting-started/flows" className={linkClassName}>
          flows and action types
        </Link>
        . This is not a limitation placed on the amount of messages you can send
        with your webhooks independently of flows.
      </>
    ),
  },
  // "custom-bot": {
  //   title: "Custom bot profile",
  //   children: (
  //     <>
  //       Use completely custom branding in your server by creating your own bot.
  //     </>
  //   ),
  // },
  "link-embeds": {
    title: "Globally usable embeds (+ embedded videos)",
    children: (
      <>
        Why limit yourself to the functionality of webhook embeds? Deluxe
        members can create custom embeds that can be posted anywhere on Discord,
        even without access to a webhook. These embeds can even contain videos
        and up to 4 images.
        <br />
        <br />
        Head to the{" "}
        <Link to="/link" className={linkClassName}>
          link embed editor
        </Link>{" "}
        to see what's possible.
      </>
    ),
  },
  // "hosted-files": {
  //   title: "Hosted image links & files",
  //   children: (
  //     <>
  //       Many users experience difficulty finding a good place to upload files
  //       that's easy to use and Discord will accept long-term. Discohook offers a
  //       CDN specifically designed for webhook messages. Images, GIFs, and videos
  //       uploaded to it do not expire and can be up to 100MB, the maximum for a
  //       webhook in a level 3 server.
  //     </>
  //   ),
  // },
};

export default function DonatePage() {
  const { user, wallets } = useLoaderData<typeof loader>();
  const [cryptoOpen, setCryptoOpen] = useState(false);
  const [cryptoInfo, setCryptoInfo] = useState<{
    type: string;
    donationKey: string;
  }>();
  const [featProps, setFeatProps] = useState<SimpleTextModalProps>();

  return (
    <div>
      <SimpleTextModal
        open={!!featProps}
        setOpen={() => setFeatProps(undefined)}
        {...featProps}
      />
      <CryptoDonateInfoModal
        open={cryptoOpen}
        setOpen={setCryptoOpen}
        wallets={wallets}
        {...cryptoInfo}
      />
      <Header user={user} />
      <div className="max-w-4xl mx-auto p-4 text-lg">
        <h1 className="text-2xl font-bold">
          <Twemoji emoji="✨" className="h-6" /> Discohook Deluxe
        </h1>
        <p>
          Thanks for your interest in donating! Your contribution will help keep
          Discohook up and running for everyone, and it can earn you some sweet
          perks. Donate at least{" "}
          <span className="font-bold">$6 USD per month</span> to maintain your
          subscription.
          {/* If you donate [x] one time, you can unlock a super-secret lifetime
          subscription. */}
        </p>
        <div className="mt-4 rounded bg-slate-100 dark:bg-gray-700 border border-black/10 dark:border-gray-50/10 table w-full">
          <div className="table-header-group">
            <div className="table-row">
              <Cell className="font-semibold rounded-tl">Feature</Cell>
              <Cell className="font-semibold">Free</Cell>
              <Cell className="font-semibold rounded-tr" premium>
                Deluxe
              </Cell>
            </div>
          </div>
          <div className="table-row-group">
            <div className="table-row">
              <Cell>Full-featured message editor</Cell>
              <Cell>
                <Twemoji emoji="✅" />
              </Cell>
              <Cell premium>
                <Twemoji emoji="✅" />
              </Cell>
            </div>
            <div className="table-row">
              <Cell>All component types</Cell>
              <Cell>
                <Twemoji emoji="✅" />
              </Cell>
              <Cell premium>
                <Twemoji emoji="✅" />
              </Cell>
            </div>
            <div className="table-row">
              <Cell onClick={() => setFeatProps(features["max-actions"])}>
                Max. flow actions
              </Cell>
              <Cell>10</Cell>
              <Cell premium>40</Cell>
            </div>
            {/* <div className="table-row">
              <Cell onClick={() => setFeatProps(features["custom-bot"])}>
                Custom bot profile
              </Cell>
              <Cell>-</Cell>
              <Cell premium>
                <Twemoji emoji="✅" />
              </Cell>
            </div> */}
            <div className="table-row">
              <Cell onClick={() => setFeatProps(features["link-embeds"])}>
                Use-anywhere embeds (+ embedded videos)
              </Cell>
              <Cell>-</Cell>
              <Cell premium>
                <Twemoji emoji="✅" />
              </Cell>
            </div>
            {/* <div className="table-row">
              <Cell
                onClick={() => setFeatProps(features["hosted-files"])}
                className="rounded-bl"
              >
                Hosted image links & files
              </Cell>
              <Cell>-</Cell>
              <Cell className="rounded-br" premium>
                <Twemoji emoji="✅" />
              </Cell>
            </div> */}
          </div>
        </div>
        <h1 className="text-xl font-bold mt-4">
          <Twemoji emoji="💰" className="h-5" /> How to donate
        </h1>
        <p>
          {/* There are multiple ways to donate. You get the same thing in the end,
          but you can decide which method is right for you. And when you donate
          with a direct method (Ko-fi/Bitcoin), your Deluxe membership stacks
          and adapts to how much you donated. For example: for about a week of
          Deluxe, donate $2, or for a year, $72. */}
          You can currently donate through Discord. Click on Discohook Utils in
          the member sidebar, click "Store", then select a Deluxe subscription.
        </p>
        {/* <div className="mt-4 rounded bg-slate-100 dark:bg-gray-700 border border-black/10 dark:border-gray-50/10 table table-auto w-full">
          <div className="table-header-group">
            <div className="table-row">
              <Cell className="font-semibold rounded-tl sm:px-6">Method</Cell>
              <Cell className="font-semibold sm:px-6">Price</Cell>
              <Cell className="font-semibold rounded-tr">Summary</Cell>
            </div>
          </div>
          <div className="table-row-group">
            <div className="table-row">
              <Cell>
                <PreviewButton
                  data={{
                    type: ComponentType.Button,
                    style: ButtonStyle.Link,
                    url: "https://support.discord.com/hc/en-us/articles/9359445233303#h_01GFK3CW8A5C3M2MYZEN5XRFS3",
                    label: "Discord",
                  }}
                />
              </Cell>
              <Cell>$6</Cell>
              <Cell>
                Most convenient option, but Discohook earns ~$4.7 due to fees.
              </Cell>
            </div>
            <div className="table-row">
              <Cell>
                <PreviewButton
                  data={{
                    type: ComponentType.Button,
                    style: ButtonStyle.Link,
                    url: "https://ko-fi.com/shayypy",
                    label: "Ko-fi",
                  }}
                />
              </Cell>
              <Cell>$6</Cell>
              <Cell>
                Straightforward and direct support. Accepts PayPal, cards, etc.
              </Cell>
            </div>
            <div className="table-row">
              <Cell className="rounded-bl">
                <Button
                  disabled={!user || !wallets.btc}
                  onClick={async () => {
                    if (!cryptoInfo) {
                      const r = await fetch(apiUrl(BRoutes.donate("btc")), {
                        method: "POST",
                      });
                      const d = (await r.json()) as { key: string };
                      setCryptoInfo({
                        type: "btc",
                        donationKey: d.key,
                      });
                    }
                    setCryptoOpen(true);
                  }}
                >
                  Bitcoin
                </Button>
              </Cell>
              <Cell>$6</Cell>
              <Cell className="rounded-br">
                Available for users who prefer cryptocurrency.
              </Cell>
            </div>
          </div>
        </div>
        {!user && (
          <Link to="/auth/discord?redirect=/donate" className="mt-2 block">
            <InfoBox severity="blue">
              Please sign in to donate with cryptocurrencies.
            </InfoBox>
          </Link>
        )} */}
        <h1 className="text-xl font-bold mt-4">
          <Twemoji className="h-5" emoji="✨" /> Features
        </h1>
        <div className="space-y-2 mt-1">
          {/* <Feature id="editor">
            Everyone gets access to the delightful Discohook message editor for
            free, including all markdown features and sending functionality.
          </Feature>
          <Feature id="components">
            The Discohook bot can be used to add every currently available type
            of component, free of charge - buttons, link buttons, and all select
            menus. But what if you crave more action?
          </Feature> */}
          {Object.keys(features).map((feature) => (
            <Feature
              key={`feature-${feature}`}
              id={feature}
              setFeatProps={setFeatProps}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
