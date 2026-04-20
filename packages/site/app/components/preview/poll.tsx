import type { QueryData } from "~/types/QueryData";
import { Button } from "../Button";

export const Poll: React.FC<{
  poll: NonNullable<QueryData["messages"][number]["data"]["poll"]>;
}> = ({ poll }) => {
  return (
    <div className="border border-[#E2E2E4] dark:border-[#434349] bg-white dark:bg-background-secondary-dark rounded-lg p-4 max-w-[472px]">
      <h4 className="break-words whitespace-pre-wrap font-medium dark:text-[#fbfbfb] text-[#28282d] mr-9">
        {poll.question.text}
      </h4>
      <div className="mt-1 text-muted dark:text-muted-dark text-[14px]">
        Select one answer
      </div>
      <div className="mt-2 mb-4 text-[14px] space-y-2">
        {poll.answers.map((answer, index) => (
          <div
            key={`message-preview-poll-answer-${index}`}
            className="flex min-h-[50px] cursor-pointer items-center gap-3 rounded-lg border border-transparent bg-[#97979f14] dark:bg-[#97979f0a] px-4 py-2 font-medium text-[#28282d] dark:text-[#fbfbfb] transition-[border-color] duration-200 hover:border-[#97979f70]"
          >
            <span className="min-w-0 grow break-words whitespace-pre-wrap font-semibold">
              {answer.poll_media.text}
            </span>
            {poll.allow_multiselect ? (
              <div className="border-2 dark:border-[#fbfbfb] border-[#28282d] rounded-[3px] size-5 shrink-0"/>
            ) : (
            <svg
              aria-hidden="true"
              role="img"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="shrink-0"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                fill="currentColor"
              />
              {/* The circle for a selected answer
              <circle cx="12" cy="12" r="5" fill="currentColor"></circle>
              */}
            </svg>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center text-[14px]">
          <div className="text-[#28282d] dark:text-[#fbfbfb] hover:underline cursor-pointer">
            0 votes
          </div>
          <div className="before:mx-2 before:text-[20px] before:leading-none before:content-['\2219'] text-muted dark:text-muted-dark" />
          <div className="text-muted dark:text-muted-dark">
            {poll.duration ?? 24}h left
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[#28282d] dark:text-[#fbfbfb] hover:underline cursor-pointer text-[14px]">
            Show results
          </div>
          <Button disabled>Vote</Button>
        </div>
      </div>
    </div>
  );
};
