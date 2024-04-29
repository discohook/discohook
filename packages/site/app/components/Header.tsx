import {
  Link,
  useLocation,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { HelpModal } from "~/modals/HelpModal";
import { SettingsModal } from "~/modals/SettingsModal";
import { User } from "~/session.server";
import { getUserAvatar, getUserPremiumDetails, getUserTag } from "~/util/users";
import { Button } from "./Button";
import { CoolIcon } from "./icons/CoolIcon";
import { Logo } from "./icons/Logo";

export const Header: React.FC<{ user?: User | null }> = ({ user }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dm = searchParams.get("m");
  const [helpOpen, setHelpOpen] = useState(dm === "help");
  const [settingsOpen, setSettingsOpen] = useState(dm === "settings");
  const navigation = useNavigation();

  const premiumDetails = user ? getUserPremiumDetails(user) : undefined;
  const logo = (
    <div className="h-8 w-8 my-auto mr-4">
      <Logo pink={premiumDetails?.active} />
    </div>
  );

  const editorPaths = ["/link", "/simple"];
  const isEditorPage =
    location.pathname === "/" ||
    editorPaths.includes(location.pathname.replace(/\/$/, ""));

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
      {user ? (
        <Link
          to="/me"
          className="flex my-auto -mx-2 py-1 px-2 rounded hover:bg-gray-200 hover:dark:bg-gray-700 transition"
          target={isEditorPage ? "_blank" : undefined}
        >
          <img
            className="rounded-full h-7 w-7"
            src={getUserAvatar(user, { size: 64 })}
            alt={user.name}
          />
          <p className="ml-1.5 text-base font-medium hidden sm:block my-auto">
            {user.discordUser?.globalName ?? getUserTag(user)}
          </p>
          {premiumDetails?.active && (
            <p
              className={twJoin(
                "ml-2 text-xs font-semibold hidden sm:block my-auto rounded py-px px-2 text-black uppercase",
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
        </Link>
      ) : (
        <Link
          to="/auth/discord"
          className="flex my-auto -mx-2 py-1 px-2 rounded hover:bg-gray-200 hover:dark:bg-gray-700 transition"
          target={isEditorPage ? "_blank" : undefined}
        >
          <CoolIcon
            icon="Log_Out"
            className="text-[28px] text-blurple dark:text-blurple-400 rotate-180"
            title={t("logIn")}
          />
          <p className="ml-1.5 text-base font-medium hidden sm:block my-auto">
            {t("logIn")}
          </p>
        </Link>
      )}
      <div className="grow flex overflow-x-auto ml-6">
        <Button
          className="my-auto mr-2 shrink-0"
          discordstyle={ButtonStyle.Secondary}
          onClick={() => setSettingsOpen(true)}
        >
          {t("settings")}
        </Button>
        <Button
          className="my-auto ml-auto shrink-0"
          discordstyle={ButtonStyle.Secondary}
          onClick={() => setHelpOpen(true)}
        >
          {t("help")}
        </Button>
      </div>
    </div>
  );
};
