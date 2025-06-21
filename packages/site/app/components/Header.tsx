import { Avatar } from "@base-ui-components/react/avatar";
import { Dialog } from "@base-ui-components/react/dialog";
import { Tooltip } from "@base-ui-components/react/tooltip";
import {
  Link,
  useLocation,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import type { Membership } from "~/api/v1/users.@me.memberships";
import { HelpModal } from "~/modals/HelpModal";
import { SettingsModal } from "~/modals/SettingsModal";
import type { User } from "~/session.server";
import { cdn, cdnImgAttributes } from "~/util/discord";
import { useLocalStorage } from "~/util/localstorage";
import { getUserAvatar, getUserPremiumDetails, getUserTag } from "~/util/users";
import { Button } from "./Button";
import { Drawer } from "./Drawer";
import { CoolIcon } from "./icons/CoolIcon";
import { Logo } from "./icons/Logo";
import { Twemoji } from "./icons/Twemoji";

const drawerHeaderClassName =
  "px-3 uppercase font-semibold text-sm text-muted dark:text-muted-dark select-none cursor-default";

const drawerListItemClassName =
  "flex items-center rounded-lg py-1 px-2 gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors";

export const Header: React.FC<{
  user?: User | null;
  setShowHistoryModal?: (value: React.SetStateAction<boolean>) => void;
  memberships?: Membership[];
}> = ({ user, setShowHistoryModal, memberships: memberships_ }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [searchParams] = useSearchParams();
  const dm = searchParams.get("m");
  const [helpOpen, setHelpOpen] = useState(dm === "help");
  const [settingsOpen, setSettingsOpen] = useState(dm === "settings");
  const [drawerOpen, setDrawerOpen] = useState(dm === "sidebar");

  const premiumDetails = user ? getUserPremiumDetails(user) : undefined;
  const logo = (
    <div className="h-8 w-8 my-auto mr-4">
      <Logo pink={premiumDetails?.active} />
    </div>
  );

  const location = useLocation();
  const editorPathsRe = /^(\/$|\/link|\/simple|\/edit\/.+)\/?/;
  const isEditorPage = editorPathsRe.test(location.pathname);
  const target = isEditorPage ? "_blank" : "_self";

  const [{ memberships }, setCache] = useLocalStorage<{
    memberships: typeof memberships_;
  }>("discohook_cache");
  useEffect(() => {
    if (memberships_) setCache({ memberships: memberships_ });
  }, [memberships_, setCache]);

  const currentGuild = useMemo(() => {
    const serverPathMatch = location.pathname.match(/^\/s\/(\d+)/);
    if (serverPathMatch) {
      const guildId = serverPathMatch[1];
      const guild = memberships?.find(
        (m) => String(m.guild.id) === guildId,
      )?.guild;
      return guild ?? null;
    }
    return null;
  }, [memberships, location.pathname]);

  return (
    <div
      className={twJoin(
        "sticky top-0 left-0 z-20 bg-slate-50 dark:bg-[#1E1F22] border-2 border-slate-50 dark:border-[#1E1F22] shadow-md w-full px-4 h-12 flex",
        navigation.state === "idle"
          ? ""
          : twJoin(
              "animate-pulse",
              premiumDetails?.active
                ? "!border-b-brand-pink/30"
                : "!border-b-brand-blue/30",
            ),
      )}
    >
      <HelpModal open={helpOpen} setOpen={setHelpOpen} />
      <SettingsModal
        open={settingsOpen}
        setOpen={setSettingsOpen}
        user={user}
      />
      {isEditorPage ? (
        logo
      ) : (
        <Link to="/" className="my-auto">
          {logo}
        </Link>
      )}
      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        className="flex flex-col"
      >
        <div
          className={twJoin(
            "bg-white dark:bg-[#1E1F22] w-full px-4 h-12 flex items-center gap-2",
            "border-b border-gray-200 dark:border-[#404248]",
          )}
        >
          <Link to="/" target={target}>
            {logo}
          </Link>
          {currentGuild || !user ? (
            <p className="font-medium text-base truncate">
              {currentGuild?.name ?? "Discohook"}
            </p>
          ) : (
            <div className="truncate flex items-center">
              <Avatar.Root className="size-7 shrink-0">
                <Avatar.Image
                  {...cdnImgAttributes(64, (size) =>
                    getUserAvatar(user, { size }),
                  )}
                  className="rounded-full size-full"
                  alt=""
                />
                <Avatar.Fallback>
                  <img
                    src={getUserAvatar(user, { forceDefault: true })}
                    className="rounded-full size-full"
                    alt=""
                  />
                </Avatar.Fallback>
              </Avatar.Root>
              <p className="ms-1.5 truncate text-base font-medium">
                {user.discordUser?.globalName ?? getUserTag(user)}
              </p>
            </div>
          )}
          <Dialog.Close className="ms-auto">
            <CoolIcon icon="Close_MD" className="text-2xl" />
          </Dialog.Close>
        </div>
        <div className="flex flex-row">
          {memberships && memberships.length !== 0 ? (
            <Tooltip.Provider delay={0}>
              <div
                className={twJoin(
                  "grid gap-y-px overflow-y-auto max-h-[calc(100vh_-_3rem)] shrink-0 h-full w-16 justify-items-center py-1",
                  "bg-white dark:bg-gray-800",
                  "border-e border-gray-200 dark:border-[#404248]",
                )}
              >
                {memberships
                  .sort((a, b) => {
                    if (a.favorite && !b.favorite) return -1;
                    if (b.favorite && !a.favorite) return 1;
                    return a.guild.name > b.guild.name ? 1 : -1;
                  })
                  .map(({ guild, favorite }) => (
                    <Tooltip.Root key={`guild-${guild.id}`}>
                      <Tooltip.Trigger>
                        <Link
                          to={`/s/${guild.id}`}
                          target={target}
                          className="flex p-1 shrink-0"
                        >
                          <Avatar.Root className="size-10">
                            <Avatar.Image
                              // not great
                              {...cdnImgAttributes(128, (size) =>
                                guild.icon
                                  ? cdn.icon(guild.id.toString(), guild.icon, {
                                      size,
                                    })
                                  : cdn.defaultAvatar(5),
                              )}
                              className="rounded-xl size-full aspect-square"
                            />
                            <Avatar.Fallback className="text-xl flex rounded-xl size-full items-center justify-center bg-gray-100 dark:bg-gray-900 truncate uppercase">
                              {guild.name.split(" ").map((seg) => seg[0] ?? "")}
                            </Avatar.Fallback>
                          </Avatar.Root>
                        </Link>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Positioner
                          sideOffset={6}
                          side="inline-end"
                          className="z-40"
                        >
                          <Tooltip.Popup
                            className={twJoin(
                              "flex origin-[var(--transform-origin)] flex-col rounded-lg px-2 py-1 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[instant]:duration-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0",
                              "bg-gray-50 dark:bg-gray-800 outline outline-1 outline-gray-200 dark:outline-gray-600",
                              "shadow-lg dark:shadow-none dark:-outline-offset-1",
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <p className="text-base font-medium">
                                {guild.name}
                              </p>
                              {favorite ? (
                                <Twemoji emoji="⭐️" className="h-4 w-4" />
                              ) : null}
                            </div>
                          </Tooltip.Popup>
                        </Tooltip.Positioner>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  ))}
              </div>
            </Tooltip.Provider>
          ) : null}
          <div className="flex flex-col gap-px grow p-2">
            {/* <p className={drawerHeaderClassName}>{t("profile")}</p> */}
            {!user ? (
              <Link
                to="/auth/discord"
                target={target}
                className={drawerListItemClassName}
              >
                <CoolIcon
                  icon="Log_Out"
                  className="text-xl text-blurple dark:text-blurple-400 rotate-180"
                />
                {t(user ? "profile" : "logIn")}
              </Link>
            ) : (
              <>
                <Link
                  to="/me/backups"
                  target={target}
                  className={drawerListItemClassName}
                >
                  <CoolIcon icon="File_Document" className="text-xl" />
                  {t("backups")}
                </Link>
                <Link
                  to="/me/share-links"
                  target={target}
                  className={drawerListItemClassName}
                >
                  <CoolIcon icon="Link" className="text-xl" />
                  {t("shareLinks")}
                </Link>
                {premiumDetails?.active ? (
                  <Link
                    to="/me/link-embeds"
                    target={target}
                    className={drawerListItemClassName}
                  >
                    <CoolIcon icon="Window" className="text-xl" />
                    {t("linkEmbeds")}
                  </Link>
                ) : null}
              </>
            )}
            <hr className="border-gray-200 dark:border-[#404248] my-1" />
            {/* <p className={drawerHeaderClassName}>{t("usingDiscohook")}</p> */}
            <Link
              to="/guide"
              target={target}
              className={drawerListItemClassName}
            >
              <CoolIcon icon="Book_Open" className="text-xl" />
              {t("guides")}
            </Link>
            <Link to="/bot" target={target} className={drawerListItemClassName}>
              <CoolIcon icon="Download" className="text-xl" />
              {t("inviteBot")}
            </Link>
            <Link
              to="/discord"
              target={target}
              className={drawerListItemClassName}
            >
              <CoolIcon icon="Users" className="text-xl" />
              {t("supportServer")}
            </Link>
            {user ? (
              <>
                <hr className="border-gray-200 dark:border-[#404248] my-1" />
                <Link
                  to="/auth/logout"
                  target={target}
                  className={drawerListItemClassName}
                >
                  <CoolIcon icon="Log_Out" className="text-xl text-red-400" />
                  {t("logOut")}
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </Drawer>
      {user ? (
        <button
          type="button"
          className="flex my-auto ltr:-mx-2 rtl:mr-2 rtl:-ml-2 py-1 px-2 rounded-lg shrink-0 hover:bg-gray-200 hover:dark:bg-gray-700 transition"
          onClick={() => setDrawerOpen(true)}
        >
          <Avatar.Root>
            <Avatar.Image
              {...cdnImgAttributes(64, (size) => getUserAvatar(user, { size }))}
              className="rounded-full h-7 w-7"
              alt={user.name}
            />
            <Avatar.Fallback>
              <img
                // default avatars are always the same size (256) so specifying it is unnecessary
                src={getUserAvatar(user, { forceDefault: true })}
                className="rounded-full h-7 w-7"
                alt={user.name}
              />
            </Avatar.Fallback>
          </Avatar.Root>
          <p className="ms-1.5 text-base font-medium hidden sm:block my-auto">
            {user.discordUser?.globalName ?? getUserTag(user)}
          </p>
          {premiumDetails?.active && (
            <p
              className={twJoin(
                "ltr:ml-2 rtl:mr-2 text-xs font-semibold hidden sm:block my-auto rounded py-px px-2 text-black uppercase",
                premiumDetails.grace ? "bg-yellow-400" : "bg-brand-pink",
              )}
            >
              {premiumDetails.grace
                ? t("graceRemaining", {
                    count: premiumDetails.graceDaysRemaining ?? -1,
                  })
                : t(user.lifetime ? "lifetime" : "deluxe")}
            </p>
          )}
        </button>
      ) : (
        <button
          type="button"
          className="flex my-auto ltr:-mx-2 rtl:mr-2 rtl:-ml-2 py-1 px-2 rounded-lg shrink-0 hover:bg-gray-200 hover:dark:bg-gray-700 transition"
          onClick={() => setDrawerOpen(true)}
        >
          <CoolIcon
            icon="Log_Out"
            className="text-[28px] text-blurple dark:text-blurple-400 rotate-180"
            title={t("logIn")}
          />
          <p className="ltr:ml-1.5 rtl:mr-1.5 text-base font-medium hidden sm:block my-auto">
            {t("logIn")}
          </p>
        </button>
      )}
      <div className="grow flex overflow-x-auto ltr:ml-6 rtl:mr-6">
        <Button
          className="my-auto ltr:mr-2 rtl:ml-2"
          discordstyle={ButtonStyle.Secondary}
          onClick={() => setSettingsOpen(true)}
        >
          {t("settings")}
        </Button>
        {setShowHistoryModal && (
          <Button
            className="my-auto ltr:mr-2 rtl:ml-2"
            onClick={() => setShowHistoryModal(true)}
            discordstyle={ButtonStyle.Secondary}
          >
            {t("history")}
          </Button>
        )}
        <Button
          className="my-auto ltr:ml-auto rtl:mr-auto"
          discordstyle={ButtonStyle.Secondary}
          onClick={() => setHelpOpen(true)}
        >
          {t("help")}
        </Button>
        {!premiumDetails?.active && (
          <Link to="/donate" target="_blank" className="contents">
            <Button
              discordstyle={ButtonStyle.Secondary}
              className="my-auto ltr:ml-2 rtl:mr-2 bg-gradient-to-r from-blurple/80 to-brand-pink/80 shadow shadow-transparent hover:shadow-blurple/70 transition-shadow"
            >
              {t("donate")}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
