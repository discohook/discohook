export const MessageDivider: React.FC<React.PropsWithChildren> = ({
  children,
}) => (
  <div className="my-6 relative left-auto right-auto h-0 border-t-[1px] border-t-muted opacity-50 items-center flex pointer-events-none box-border">
    <span className="text-xs leading-[13px] text-muted dark:text-muted-dark -mt-px font-semibold rounded-lg mx-auto py-[2px] px-1 bg-white dark:bg-primary-600">
      {children}
    </span>
  </div>
);
