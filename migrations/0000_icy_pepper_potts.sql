CREATE TABLE `Backup` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	`dataVersion` text NOT NULL,
	`data` text NOT NULL,
	`ownerId` integer NOT NULL,
	FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `DiscordGuild` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon` text
);
--> statement-breakpoint
CREATE TABLE `DiscordMember` (
	`userId` text NOT NULL,
	`guildId` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `DiscordMessageComponent` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`guildId` text NOT NULL,
	`channelId` text NOT NULL,
	`messageId` text NOT NULL,
	`createdById` integer,
	`updatedById` integer,
	`createdAt` integer,
	`updatedAt` integer,
	`customId` text,
	`data` text NOT NULL,
	FOREIGN KEY (`guildId`) REFERENCES `DiscordGuild`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `DiscordRoles` (
	`id` text NOT NULL,
	`guildId` text NOT NULL,
	`name` text NOT NULL,
	`color` integer DEFAULT 0,
	`permissions` text DEFAULT '0',
	`icon` text,
	`unicodeEmoji` text,
	`position` integer NOT NULL,
	`hoist` integer DEFAULT false,
	`managed` integer DEFAULT false,
	`mentionable` integer DEFAULT false,
	FOREIGN KEY (`guildId`) REFERENCES `DiscordGuild`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `DiscordUser` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`globalName` text,
	`discriminator` text,
	`avatar` text
);
--> statement-breakpoint
CREATE TABLE `GuildedServer` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`avatarUrl` text
);
--> statement-breakpoint
CREATE TABLE `GuildedUser` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`avatarUrl` text
);
--> statement-breakpoint
CREATE TABLE `MessageLogEntry` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text,
	`webhookId` text NOT NULL,
	`channelId` text NOT NULL,
	`messageId` text NOT NULL,
	`threadId` text,
	`userId` integer,
	`notifiedEveryoneHere` integer DEFAULT false,
	`notifiedRoles` text,
	`notifiedUsers` text,
	`hasContent` integer DEFAULT false,
	`embedCount` integer DEFAULT 0,
	FOREIGN KEY (`webhookId`) REFERENCES `Webhook`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ShareLink` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`shareId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`expiresAt` integer NOT NULL,
	`origin` text,
	`userId` integer,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`firstSubscribed` integer,
	`subscribedSince` integer,
	`lifetime` integer DEFAULT false,
	`discordId` text,
	`guildedId` text,
	FOREIGN KEY (`discordId`) REFERENCES `DiscordUser`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`guildedId`) REFERENCES `GuildedUser`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Webhook` (
	`platform` text NOT NULL,
	`id` text NOT NULL,
	`token` text,
	`name` text NOT NULL,
	`avatar` text,
	`channelId` text NOT NULL,
	`applicationId` text,
	`userId` integer,
	`discordGuildId` text,
	`guildedServerId` text,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`discordGuildId`) REFERENCES `DiscordGuild`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`guildedServerId`) REFERENCES `GuildedServer`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `DiscordMember_userId_guildId_unique` ON `DiscordMember` (`userId`,`guildId`);--> statement-breakpoint
CREATE UNIQUE INDEX `DiscordMessageComponent_messageId_customId_unique` ON `DiscordMessageComponent` (`messageId`,`customId`);--> statement-breakpoint
CREATE UNIQUE INDEX `DiscordRoles_id_guildId_unique` ON `DiscordRoles` (`id`,`guildId`);--> statement-breakpoint
CREATE UNIQUE INDEX `User_discordId_unique` ON `User` (`discordId`);--> statement-breakpoint
CREATE UNIQUE INDEX `User_guildedId_unique` ON `User` (`guildedId`);--> statement-breakpoint
CREATE UNIQUE INDEX `Webhook_platform_id_unique` ON `Webhook` (`platform`,`id`);