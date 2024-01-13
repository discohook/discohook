import { APIAttachment } from "discord-api-types/v10";
import { CoolIcon } from "../CoolIcon";

export const FileAttachment: React.FC<{ attachment: APIAttachment }> = ({
  attachment,
}) => {
  return (
    <div className="rounded-lg p-2 bg-gray-300 flex">
      <CoolIcon
        icon="File_Blank"
        className="shrink-0 mr-1 my-auto text-5xl text-gray-500"
      />
      <div className="my-auto">
        <a
          className="block hover:underline text-base underline-offset-1 font-normal text-blurple-400 leading-none"
          href={attachment.url}
        >
          {attachment.filename}
        </a>
        <p className="text-xs text-gray-500 font-normal leading-none">
          {attachment.size} bytes
        </p>
      </div>
    </div>
  );
};
