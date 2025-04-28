import { APITextDisplayComponent } from "discord-api-types/v10";
import { twJoin } from "tailwind-merge";
import { CacheManager } from "~/util/cache/CacheManager";
import { Markdown } from "./Markdown";

export const PreviewTextDisplay: React.FC<{
  component: APITextDisplayComponent;
  cache: CacheManager | undefined;
}> = ({ component, cache }) => {
  return (
    <div
      className={twJoin(
        "contents font-medium text-primary-600 dark:text-primary-230 dark:font-normal leading-[1.375] whitespace-pre-line",
        // smaller base size when parent is a container
        "[--font-size:1rem] group-data-[type='17']/parent:text-sm group-data-[type='17']/parent:[--font-size:0.875rem]",
      )}
    >
      <Markdown content={component.content} cache={cache} features="full" />
    </div>
  );
};
