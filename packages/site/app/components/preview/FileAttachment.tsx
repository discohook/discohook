import { APIAttachment } from "discord-api-types/v10";
import { fileSize } from "~/util/text";
import { CoolIcon } from "../CoolIcon";

export const FileAttachment: React.FC<{ attachment: APIAttachment }> = ({
  attachment,
}) => {
  return (
    <div className="rounded-lg p-2 flex bg-[#f2f3f5] dark:bg-[#232428] border border-primary-160 dark:border-[#232428]">
      <CoolIcon
        icon="File_Document"
        className="shrink-0 mr-1 my-auto text-4xl text-blurple-300"
      />
      {/*
      Discord has lots of fancy icons for different file types. Not sure if
      we'll do this but it seems neat.
      <img
        src=""
        alt="Non-media attachment"
        className="shrink-0 mr-1 my-auto h-12"
      /> */}
      <div className="my-auto">
        <a
          className="block hover:underline text-base underline-offset-1 font-normal text-blue-430 dark:text-blue-345 leading-4"
          href={attachment.url}
          target="_blank"
          rel="noreferrer"
        >
          {attachment.filename}
        </a>
        <p className="text-xs text-primary-400 font-normal leading-4">
          {fileSize(attachment.size)}
        </p>
      </div>
    </div>
  );
};
