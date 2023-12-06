DROP TABLE `DiscordSelectOption`;--> statement-breakpoint
ALTER TABLE DiscordMessageComponent ADD `data` text;--> statement-breakpoint
CREATE UNIQUE INDEX `DiscordMessageComponent_messageId_customId_unique` ON `DiscordMessageComponent` (`messageId`,`customId`);--> statement-breakpoint
ALTER TABLE `DiscordMessageComponent` DROP COLUMN `type`;--> statement-breakpoint
ALTER TABLE `DiscordMessageComponent` DROP COLUMN `flow`;--> statement-breakpoint
ALTER TABLE `DiscordMessageComponent` DROP COLUMN `style`;--> statement-breakpoint
ALTER TABLE `DiscordMessageComponent` DROP COLUMN `url`;