import { Emoji, EmojiStyle } from "emoji-picker-react";

export const Twemoji: React.FC<{
  emoji: string;
  size?: number;
  className?: string;
}> = ({ emoji, size, className }) => (
  <div className={className ?? "contents"}>
    <Emoji
      unified={emoji}
      size={size}
      emojiStyle={EmojiStyle.TWITTER}
      lazyLoad
    />
  </div>
);
