CREATE TABLE `DiscordMessageComponent` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`guildId` blob NOT NULL,
	`channelId` blob NOT NULL,
	`messageId` blob NOT NULL,
	`type` integer NOT NULL,
	`flow` text,
	`customId` text,
	`style` integer,
	`url` text,
	FOREIGN KEY (`guildId`) REFERENCES `DiscordGuild`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `DiscordSelectOption` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`componentId` integer NOT NULL,
	`type` integer NOT NULL,
	`flow` text
);
--> statement-breakpoint
ALTER TABLE `MessageLogEntries` RENAME TO `MessageLogEntry`;--> statement-breakpoint
/*
 SQLite does not support "Dropping foreign key" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
/*
 SQLite does not support "Creating foreign key on existing column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/