import { useRef } from "react";
import type { APIAttachment } from "~/types/QueryData-raw";
import { PlayIcon, VolumeMaxIcon } from "../icons/media";

const Dot = () => (
  <div className="rounded-full size-0.5 bg-muted dark:bg-muted-dark" />
);

// Not yet tested how Discord displays unusual timestamps, e.g. >24 hours
const secondsToTimecode = (seconds: number): string => {
  const sec = Math.round(seconds); // unsure if discord rounds properly or just does ceil

  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor((sec % 3600) % 60);
  return (
    `0${h}`.slice(-2) +
    ":" +
    `0${m}`.slice(-2) +
    ":" +
    `0${s}`.slice(-2)
  ).replace(/^[0:]+/, "");
};

export const VoiceMemo: React.FC<{ attachment: APIAttachment }> = ({
  attachment,
}) => {
  // TODO: do something with attachment.waveform for discord-loaded attachments
  const ref = useRef<HTMLAudioElement>(null);
  const duration = attachment.duration_secs ?? ref.current?.duration;

  return (
    <div className="rounded-full w-fit px-2 h-12 flex items-center gap-3 bg-background-secondary dark:bg-background-secondary-dark border border-border-normal dark:border-border-normal-dark">
      {/* Don't load the resource if the attachment already includes duration_secs */}
      {attachment.url && attachment.duration_secs === undefined ? (
        <audio ref={ref} src={attachment.url} autoPlay={false} muted hidden />
      ) : null}
      <div className="rounded-full flex size-8 bg-blurple hover:bg-blurple-400 cursor-pointer">
        <PlayIcon className="text-white m-auto size-[18px]" />
      </div>
      <div className="flex gap-1 items-center overflow-x-hidden">
        <Dot />
        <Dot />
        <Dot />
        <Dot />
        <Dot />
        <Dot />
        <Dot />
      </div>
      <div className="px-1">
        <p className="text-sm font-code text-muted dark:text-muted-dark">
          {duration !== undefined ? secondsToTimecode(duration) : "--:--"}
        </p>
      </div>
      <div className="flex gap-2 items-center mr-1">
        <div className="text-xs rounded-md bg-[#E4E4E6] dark:bg-gray-600 text-[#2F3035] hover:text-black px-2.5 py-px cursor-pointer dark:text-[#C4C5C9] dark:hover:text-white transition">
          <p className="font-medium">1X</p>
        </div>
        <div className="cursor-pointer group">
          <VolumeMaxIcon className="text-[#5F6069] group-hover:text-[#2F3035] dark:text-[#C4C5C9] dark:group-hover:text-white size-6 transition" />
        </div>
      </div>
    </div>
  );
};
