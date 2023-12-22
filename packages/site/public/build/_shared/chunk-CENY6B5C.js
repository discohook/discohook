import {
  Link,
  useLocation,
  useSearchParams
} from "/build/_shared/chunk-2EAB6TCV.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-XU7DNSPJ.js";
import {
  createHotContext
} from "/build/_shared/chunk-RV54M5LD.js";
import {
  require_react_dom
} from "/build/_shared/chunk-GIAAE3CH.js";
import {
  require_react
} from "/build/_shared/chunk-BOXFZXVX.js";
import {
  __commonJS,
  __esm,
  __export,
  __toCommonJS,
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// node_modules/discord-api-types/gateway/common.js
var require_common = __commonJS({
  "node_modules/discord-api-types/gateway/common.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/gateway/v10.js
var require_v10 = __commonJS({
  "node_modules/discord-api-types/gateway/v10.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GatewayDispatchEvents = exports.GatewayIntentBits = exports.GatewayCloseCodes = exports.GatewayOpcodes = exports.GatewayVersion = void 0;
    __exportStar(require_common(), exports);
    exports.GatewayVersion = "10";
    var GatewayOpcodes2;
    (function(GatewayOpcodes3) {
      GatewayOpcodes3[GatewayOpcodes3["Dispatch"] = 0] = "Dispatch";
      GatewayOpcodes3[GatewayOpcodes3["Heartbeat"] = 1] = "Heartbeat";
      GatewayOpcodes3[GatewayOpcodes3["Identify"] = 2] = "Identify";
      GatewayOpcodes3[GatewayOpcodes3["PresenceUpdate"] = 3] = "PresenceUpdate";
      GatewayOpcodes3[GatewayOpcodes3["VoiceStateUpdate"] = 4] = "VoiceStateUpdate";
      GatewayOpcodes3[GatewayOpcodes3["Resume"] = 6] = "Resume";
      GatewayOpcodes3[GatewayOpcodes3["Reconnect"] = 7] = "Reconnect";
      GatewayOpcodes3[GatewayOpcodes3["RequestGuildMembers"] = 8] = "RequestGuildMembers";
      GatewayOpcodes3[GatewayOpcodes3["InvalidSession"] = 9] = "InvalidSession";
      GatewayOpcodes3[GatewayOpcodes3["Hello"] = 10] = "Hello";
      GatewayOpcodes3[GatewayOpcodes3["HeartbeatAck"] = 11] = "HeartbeatAck";
    })(GatewayOpcodes2 = exports.GatewayOpcodes || (exports.GatewayOpcodes = {}));
    var GatewayCloseCodes2;
    (function(GatewayCloseCodes3) {
      GatewayCloseCodes3[GatewayCloseCodes3["UnknownError"] = 4e3] = "UnknownError";
      GatewayCloseCodes3[GatewayCloseCodes3["UnknownOpcode"] = 4001] = "UnknownOpcode";
      GatewayCloseCodes3[GatewayCloseCodes3["DecodeError"] = 4002] = "DecodeError";
      GatewayCloseCodes3[GatewayCloseCodes3["NotAuthenticated"] = 4003] = "NotAuthenticated";
      GatewayCloseCodes3[GatewayCloseCodes3["AuthenticationFailed"] = 4004] = "AuthenticationFailed";
      GatewayCloseCodes3[GatewayCloseCodes3["AlreadyAuthenticated"] = 4005] = "AlreadyAuthenticated";
      GatewayCloseCodes3[GatewayCloseCodes3["InvalidSeq"] = 4007] = "InvalidSeq";
      GatewayCloseCodes3[GatewayCloseCodes3["RateLimited"] = 4008] = "RateLimited";
      GatewayCloseCodes3[GatewayCloseCodes3["SessionTimedOut"] = 4009] = "SessionTimedOut";
      GatewayCloseCodes3[GatewayCloseCodes3["InvalidShard"] = 4010] = "InvalidShard";
      GatewayCloseCodes3[GatewayCloseCodes3["ShardingRequired"] = 4011] = "ShardingRequired";
      GatewayCloseCodes3[GatewayCloseCodes3["InvalidAPIVersion"] = 4012] = "InvalidAPIVersion";
      GatewayCloseCodes3[GatewayCloseCodes3["InvalidIntents"] = 4013] = "InvalidIntents";
      GatewayCloseCodes3[GatewayCloseCodes3["DisallowedIntents"] = 4014] = "DisallowedIntents";
    })(GatewayCloseCodes2 = exports.GatewayCloseCodes || (exports.GatewayCloseCodes = {}));
    var GatewayIntentBits2;
    (function(GatewayIntentBits3) {
      GatewayIntentBits3[GatewayIntentBits3["Guilds"] = 1] = "Guilds";
      GatewayIntentBits3[GatewayIntentBits3["GuildMembers"] = 2] = "GuildMembers";
      GatewayIntentBits3[GatewayIntentBits3["GuildModeration"] = 4] = "GuildModeration";
      GatewayIntentBits3[GatewayIntentBits3["GuildBans"] = 4] = "GuildBans";
      GatewayIntentBits3[GatewayIntentBits3["GuildEmojisAndStickers"] = 8] = "GuildEmojisAndStickers";
      GatewayIntentBits3[GatewayIntentBits3["GuildIntegrations"] = 16] = "GuildIntegrations";
      GatewayIntentBits3[GatewayIntentBits3["GuildWebhooks"] = 32] = "GuildWebhooks";
      GatewayIntentBits3[GatewayIntentBits3["GuildInvites"] = 64] = "GuildInvites";
      GatewayIntentBits3[GatewayIntentBits3["GuildVoiceStates"] = 128] = "GuildVoiceStates";
      GatewayIntentBits3[GatewayIntentBits3["GuildPresences"] = 256] = "GuildPresences";
      GatewayIntentBits3[GatewayIntentBits3["GuildMessages"] = 512] = "GuildMessages";
      GatewayIntentBits3[GatewayIntentBits3["GuildMessageReactions"] = 1024] = "GuildMessageReactions";
      GatewayIntentBits3[GatewayIntentBits3["GuildMessageTyping"] = 2048] = "GuildMessageTyping";
      GatewayIntentBits3[GatewayIntentBits3["DirectMessages"] = 4096] = "DirectMessages";
      GatewayIntentBits3[GatewayIntentBits3["DirectMessageReactions"] = 8192] = "DirectMessageReactions";
      GatewayIntentBits3[GatewayIntentBits3["DirectMessageTyping"] = 16384] = "DirectMessageTyping";
      GatewayIntentBits3[GatewayIntentBits3["MessageContent"] = 32768] = "MessageContent";
      GatewayIntentBits3[GatewayIntentBits3["GuildScheduledEvents"] = 65536] = "GuildScheduledEvents";
      GatewayIntentBits3[GatewayIntentBits3["AutoModerationConfiguration"] = 1048576] = "AutoModerationConfiguration";
      GatewayIntentBits3[GatewayIntentBits3["AutoModerationExecution"] = 2097152] = "AutoModerationExecution";
    })(GatewayIntentBits2 = exports.GatewayIntentBits || (exports.GatewayIntentBits = {}));
    var GatewayDispatchEvents2;
    (function(GatewayDispatchEvents3) {
      GatewayDispatchEvents3["ApplicationCommandPermissionsUpdate"] = "APPLICATION_COMMAND_PERMISSIONS_UPDATE";
      GatewayDispatchEvents3["ChannelCreate"] = "CHANNEL_CREATE";
      GatewayDispatchEvents3["ChannelDelete"] = "CHANNEL_DELETE";
      GatewayDispatchEvents3["ChannelPinsUpdate"] = "CHANNEL_PINS_UPDATE";
      GatewayDispatchEvents3["ChannelUpdate"] = "CHANNEL_UPDATE";
      GatewayDispatchEvents3["GuildBanAdd"] = "GUILD_BAN_ADD";
      GatewayDispatchEvents3["GuildBanRemove"] = "GUILD_BAN_REMOVE";
      GatewayDispatchEvents3["GuildCreate"] = "GUILD_CREATE";
      GatewayDispatchEvents3["GuildDelete"] = "GUILD_DELETE";
      GatewayDispatchEvents3["GuildEmojisUpdate"] = "GUILD_EMOJIS_UPDATE";
      GatewayDispatchEvents3["GuildIntegrationsUpdate"] = "GUILD_INTEGRATIONS_UPDATE";
      GatewayDispatchEvents3["GuildMemberAdd"] = "GUILD_MEMBER_ADD";
      GatewayDispatchEvents3["GuildMemberRemove"] = "GUILD_MEMBER_REMOVE";
      GatewayDispatchEvents3["GuildMembersChunk"] = "GUILD_MEMBERS_CHUNK";
      GatewayDispatchEvents3["GuildMemberUpdate"] = "GUILD_MEMBER_UPDATE";
      GatewayDispatchEvents3["GuildRoleCreate"] = "GUILD_ROLE_CREATE";
      GatewayDispatchEvents3["GuildRoleDelete"] = "GUILD_ROLE_DELETE";
      GatewayDispatchEvents3["GuildRoleUpdate"] = "GUILD_ROLE_UPDATE";
      GatewayDispatchEvents3["GuildStickersUpdate"] = "GUILD_STICKERS_UPDATE";
      GatewayDispatchEvents3["GuildUpdate"] = "GUILD_UPDATE";
      GatewayDispatchEvents3["IntegrationCreate"] = "INTEGRATION_CREATE";
      GatewayDispatchEvents3["IntegrationDelete"] = "INTEGRATION_DELETE";
      GatewayDispatchEvents3["IntegrationUpdate"] = "INTEGRATION_UPDATE";
      GatewayDispatchEvents3["InteractionCreate"] = "INTERACTION_CREATE";
      GatewayDispatchEvents3["InviteCreate"] = "INVITE_CREATE";
      GatewayDispatchEvents3["InviteDelete"] = "INVITE_DELETE";
      GatewayDispatchEvents3["MessageCreate"] = "MESSAGE_CREATE";
      GatewayDispatchEvents3["MessageDelete"] = "MESSAGE_DELETE";
      GatewayDispatchEvents3["MessageDeleteBulk"] = "MESSAGE_DELETE_BULK";
      GatewayDispatchEvents3["MessageReactionAdd"] = "MESSAGE_REACTION_ADD";
      GatewayDispatchEvents3["MessageReactionRemove"] = "MESSAGE_REACTION_REMOVE";
      GatewayDispatchEvents3["MessageReactionRemoveAll"] = "MESSAGE_REACTION_REMOVE_ALL";
      GatewayDispatchEvents3["MessageReactionRemoveEmoji"] = "MESSAGE_REACTION_REMOVE_EMOJI";
      GatewayDispatchEvents3["MessageUpdate"] = "MESSAGE_UPDATE";
      GatewayDispatchEvents3["PresenceUpdate"] = "PRESENCE_UPDATE";
      GatewayDispatchEvents3["StageInstanceCreate"] = "STAGE_INSTANCE_CREATE";
      GatewayDispatchEvents3["StageInstanceDelete"] = "STAGE_INSTANCE_DELETE";
      GatewayDispatchEvents3["StageInstanceUpdate"] = "STAGE_INSTANCE_UPDATE";
      GatewayDispatchEvents3["Ready"] = "READY";
      GatewayDispatchEvents3["Resumed"] = "RESUMED";
      GatewayDispatchEvents3["ThreadCreate"] = "THREAD_CREATE";
      GatewayDispatchEvents3["ThreadDelete"] = "THREAD_DELETE";
      GatewayDispatchEvents3["ThreadListSync"] = "THREAD_LIST_SYNC";
      GatewayDispatchEvents3["ThreadMembersUpdate"] = "THREAD_MEMBERS_UPDATE";
      GatewayDispatchEvents3["ThreadMemberUpdate"] = "THREAD_MEMBER_UPDATE";
      GatewayDispatchEvents3["ThreadUpdate"] = "THREAD_UPDATE";
      GatewayDispatchEvents3["TypingStart"] = "TYPING_START";
      GatewayDispatchEvents3["UserUpdate"] = "USER_UPDATE";
      GatewayDispatchEvents3["VoiceServerUpdate"] = "VOICE_SERVER_UPDATE";
      GatewayDispatchEvents3["VoiceStateUpdate"] = "VOICE_STATE_UPDATE";
      GatewayDispatchEvents3["WebhooksUpdate"] = "WEBHOOKS_UPDATE";
      GatewayDispatchEvents3["GuildScheduledEventCreate"] = "GUILD_SCHEDULED_EVENT_CREATE";
      GatewayDispatchEvents3["GuildScheduledEventUpdate"] = "GUILD_SCHEDULED_EVENT_UPDATE";
      GatewayDispatchEvents3["GuildScheduledEventDelete"] = "GUILD_SCHEDULED_EVENT_DELETE";
      GatewayDispatchEvents3["GuildScheduledEventUserAdd"] = "GUILD_SCHEDULED_EVENT_USER_ADD";
      GatewayDispatchEvents3["GuildScheduledEventUserRemove"] = "GUILD_SCHEDULED_EVENT_USER_REMOVE";
      GatewayDispatchEvents3["AutoModerationRuleCreate"] = "AUTO_MODERATION_RULE_CREATE";
      GatewayDispatchEvents3["AutoModerationRuleUpdate"] = "AUTO_MODERATION_RULE_UPDATE";
      GatewayDispatchEvents3["AutoModerationRuleDelete"] = "AUTO_MODERATION_RULE_DELETE";
      GatewayDispatchEvents3["AutoModerationActionExecution"] = "AUTO_MODERATION_ACTION_EXECUTION";
      GatewayDispatchEvents3["GuildAuditLogEntryCreate"] = "GUILD_AUDIT_LOG_ENTRY_CREATE";
      GatewayDispatchEvents3["EntitlementCreate"] = "ENTITLEMENT_CREATE";
      GatewayDispatchEvents3["EntitlementUpdate"] = "ENTITLEMENT_UPDATE";
      GatewayDispatchEvents3["EntitlementDelete"] = "ENTITLEMENT_DELETE";
    })(GatewayDispatchEvents2 = exports.GatewayDispatchEvents || (exports.GatewayDispatchEvents = {}));
  }
});

// node_modules/discord-api-types/globals.js
var require_globals = __commonJS({
  "node_modules/discord-api-types/globals.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FormattingPatterns = void 0;
    exports.FormattingPatterns = {
      /**
       * Regular expression for matching a user mention, strictly without a nickname
       *
       * The `id` group property is present on the `exec` result of this expression
       */
      User: /<@(?<id>\d{17,20})>/,
      /**
       * Regular expression for matching a user mention, strictly with a nickname
       *
       * The `id` group property is present on the `exec` result of this expression
       *
       * @deprecated Passing `!` in user mentions is no longer necessary / supported, and future message contents won't have it
       */
      UserWithNickname: /<@!(?<id>\d{17,20})>/,
      /**
       * Regular expression for matching a user mention, with or without a nickname
       *
       * The `id` group property is present on the `exec` result of this expression
       *
       * @deprecated Passing `!` in user mentions is no longer necessary / supported, and future message contents won't have it
       */
      UserWithOptionalNickname: /<@!?(?<id>\d{17,20})>/,
      /**
       * Regular expression for matching a channel mention
       *
       * The `id` group property is present on the `exec` result of this expression
       */
      Channel: /<#(?<id>\d{17,20})>/,
      /**
       * Regular expression for matching a role mention
       *
       * The `id` group property is present on the `exec` result of this expression
       */
      Role: /<@&(?<id>\d{17,20})>/,
      /**
       * Regular expression for matching a application command mention
       *
       * The `fullName` (possibly including `name`, `subcommandOrGroup` and `subcommand`) and `id` group properties are present on the `exec` result of this expression
       */
      SlashCommand: (
        // eslint-disable-next-line unicorn/no-unsafe-regex
        /<\/(?<fullName>(?<name>[-_\p{Letter}\p{Number}\p{sc=Deva}\p{sc=Thai}]{1,32})(?: (?<subcommandOrGroup>[-_\p{Letter}\p{Number}\p{sc=Deva}\p{sc=Thai}]{1,32}))?(?: (?<subcommand>[-_\p{Letter}\p{Number}\p{sc=Deva}\p{sc=Thai}]{1,32}))?):(?<id>\d{17,20})>/u
      ),
      /**
       * Regular expression for matching a custom emoji, either static or animated
       *
       * The `animated`, `name` and `id` group properties are present on the `exec` result of this expression
       */
      Emoji: /<(?<animated>a)?:(?<name>\w{2,32}):(?<id>\d{17,20})>/,
      /**
       * Regular expression for matching strictly an animated custom emoji
       *
       * The `animated`, `name` and `id` group properties are present on the `exec` result of this expression
       */
      AnimatedEmoji: /<(?<animated>a):(?<name>\w{2,32}):(?<id>\d{17,20})>/,
      /**
       * Regular expression for matching strictly a static custom emoji
       *
       * The `name` and `id` group properties are present on the `exec` result of this expression
       */
      StaticEmoji: /<:(?<name>\w{2,32}):(?<id>\d{17,20})>/,
      /**
       * Regular expression for matching a timestamp, either default or custom styled
       *
       * The `timestamp` and `style` group properties are present on the `exec` result of this expression
       */
      // eslint-disable-next-line prefer-named-capture-group
      Timestamp: /<t:(?<timestamp>-?\d{1,13})(:(?<style>[DFRTdft]))?>/,
      /**
       * Regular expression for matching strictly default styled timestamps
       *
       * The `timestamp` group property is present on the `exec` result of this expression
       */
      DefaultStyledTimestamp: /<t:(?<timestamp>-?\d{1,13})>/,
      /**
       * Regular expression for matching strictly custom styled timestamps
       *
       * The `timestamp` and `style` group properties are present on the `exec` result of this expression
       */
      StyledTimestamp: /<t:(?<timestamp>-?\d{1,13}):(?<style>[DFRTdft])>/
    };
    Object.freeze(exports.FormattingPatterns);
  }
});

// node_modules/discord-api-types/payloads/common.js
var require_common2 = __commonJS({
  "node_modules/discord-api-types/payloads/common.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PermissionFlagsBits = void 0;
    exports.PermissionFlagsBits = {
      /**
       * Allows creation of instant invites
       *
       * Applies to channel types: Text, Voice, Stage
       */
      CreateInstantInvite: 1n << 0n,
      /**
       * Allows kicking members
       */
      // eslint-disable-next-line sonarjs/no-identical-expressions
      KickMembers: 1n << 1n,
      /**
       * Allows banning members
       */
      BanMembers: 1n << 2n,
      /**
       * Allows all permissions and bypasses channel permission overwrites
       */
      Administrator: 1n << 3n,
      /**
       * Allows management and editing of channels
       *
       * Applies to channel types: Text, Voice, Stage
       */
      ManageChannels: 1n << 4n,
      /**
       * Allows management and editing of the guild
       */
      ManageGuild: 1n << 5n,
      /**
       * Allows for the addition of reactions to messages
       *
       * Applies to channel types: Text, Voice, Stage
       */
      AddReactions: 1n << 6n,
      /**
       * Allows for viewing of audit logs
       */
      ViewAuditLog: 1n << 7n,
      /**
       * Allows for using priority speaker in a voice channel
       *
       * Applies to channel types: Voice
       */
      PrioritySpeaker: 1n << 8n,
      /**
       * Allows the user to go live
       *
       * Applies to channel types: Voice, Stage
       */
      Stream: 1n << 9n,
      /**
       * Allows guild members to view a channel, which includes reading messages in text channels and joining voice channels
       *
       * Applies to channel types: Text, Voice, Stage
       */
      ViewChannel: 1n << 10n,
      /**
       * Allows for sending messages in a channel and creating threads in a forum
       * (does not allow sending messages in threads)
       *
       * Applies to channel types: Text, Voice, Stage
       */
      SendMessages: 1n << 11n,
      /**
       * Allows for sending of `/tts` messages
       *
       * Applies to channel types: Text, Voice, Stage
       */
      SendTTSMessages: 1n << 12n,
      /**
       * Allows for deletion of other users messages
       *
       * Applies to channel types: Text, Voice, Stage
       */
      ManageMessages: 1n << 13n,
      /**
       * Links sent by users with this permission will be auto-embedded
       *
       * Applies to channel types: Text, Voice, Stage
       */
      EmbedLinks: 1n << 14n,
      /**
       * Allows for uploading images and files
       *
       * Applies to channel types: Text, Voice, Stage
       */
      AttachFiles: 1n << 15n,
      /**
       * Allows for reading of message history
       *
       * Applies to channel types: Text, Voice, Stage
       */
      ReadMessageHistory: 1n << 16n,
      /**
       * Allows for using the `@everyone` tag to notify all users in a channel,
       * and the `@here` tag to notify all online users in a channel
       *
       * Applies to channel types: Text, Voice, Stage
       */
      MentionEveryone: 1n << 17n,
      /**
       * Allows the usage of custom emojis from other servers
       *
       * Applies to channel types: Text, Voice, Stage
       */
      UseExternalEmojis: 1n << 18n,
      /**
       * Allows for viewing guild insights
       */
      ViewGuildInsights: 1n << 19n,
      /**
       * Allows for joining of a voice channel
       *
       * Applies to channel types: Voice, Stage
       */
      Connect: 1n << 20n,
      /**
       * Allows for speaking in a voice channel
       *
       * Applies to channel types: Voice
       */
      Speak: 1n << 21n,
      /**
       * Allows for muting members in a voice channel
       *
       * Applies to channel types: Voice, Stage
       */
      MuteMembers: 1n << 22n,
      /**
       * Allows for deafening of members in a voice channel
       *
       * Applies to channel types: Voice
       */
      DeafenMembers: 1n << 23n,
      /**
       * Allows for moving of members between voice channels
       *
       * Applies to channel types: Voice, Stage
       */
      MoveMembers: 1n << 24n,
      /**
       * Allows for using voice-activity-detection in a voice channel
       *
       * Applies to channel types: Voice
       */
      UseVAD: 1n << 25n,
      /**
       * Allows for modification of own nickname
       */
      ChangeNickname: 1n << 26n,
      /**
       * Allows for modification of other users nicknames
       */
      ManageNicknames: 1n << 27n,
      /**
       * Allows management and editing of roles
       *
       * Applies to channel types: Text, Voice, Stage
       */
      ManageRoles: 1n << 28n,
      /**
       * Allows management and editing of webhooks
       *
       * Applies to channel types: Text, Voice, Stage
       */
      ManageWebhooks: 1n << 29n,
      /**
       * Allows management and editing of emojis, stickers, and soundboard sounds
       *
       * @deprecated This is the old name for {@apilink PermissionFlagsBits#ManageGuildExpressions}
       */
      ManageEmojisAndStickers: 1n << 30n,
      /**
       * Allows for editing and deleting emojis, stickers, and soundboard sounds created by all users
       */
      ManageGuildExpressions: 1n << 30n,
      /**
       * Allows members to use application commands, including slash commands and context menu commands
       *
       * Applies to channel types: Text, Voice, Stage
       */
      UseApplicationCommands: 1n << 31n,
      /**
       * Allows for requesting to speak in stage channels
       *
       * Applies to channel types: Stage
       */
      RequestToSpeak: 1n << 32n,
      /**
       * Allows for editing and deleting scheduled events created by all users
       *
       * Applies to channel types: Voice, Stage
       */
      ManageEvents: 1n << 33n,
      /**
       * Allows for deleting and archiving threads, and viewing all private threads
       *
       * Applies to channel types: Text
       */
      ManageThreads: 1n << 34n,
      /**
       * Allows for creating public and announcement threads
       *
       * Applies to channel types: Text
       */
      CreatePublicThreads: 1n << 35n,
      /**
       * Allows for creating private threads
       *
       * Applies to channel types: Text
       */
      CreatePrivateThreads: 1n << 36n,
      /**
       * Allows the usage of custom stickers from other servers
       *
       * Applies to channel types: Text, Voice, Stage
       */
      UseExternalStickers: 1n << 37n,
      /**
       * Allows for sending messages in threads
       *
       * Applies to channel types: Text
       */
      SendMessagesInThreads: 1n << 38n,
      /**
       * Allows for using Activities (applications with the {@apilink ApplicationFlags.Embedded} flag) in a voice channel
       *
       * Applies to channel types: Voice
       */
      UseEmbeddedActivities: 1n << 39n,
      /**
       * Allows for timing out users to prevent them from sending or reacting to messages in chat and threads,
       * and from speaking in voice and stage channels
       */
      ModerateMembers: 1n << 40n,
      /**
       * Allows for viewing role subscription insights
       */
      ViewCreatorMonetizationAnalytics: 1n << 41n,
      /**
       * Allows for using soundboard in a voice channel
       *
       * Applies to channel types: Voice
       */
      UseSoundboard: 1n << 42n,
      /**
       * Allows for creating emojis, stickers, and soundboard sounds, and editing and deleting those created by the current user
       */
      CreateGuildExpressions: 1n << 43n,
      /**
       * Allows for creating scheduled events, and editing and deleting those created by the current user
       *
       * Applies to channel types: Voice, Stage
       */
      CreateEvents: 1n << 44n,
      /**
       * Allows the usage of custom soundboard sounds from other servers
       *
       * Applies to channel types: Voice
       */
      UseExternalSounds: 1n << 45n,
      /**
       * Allows sending voice messages
       *
       * Applies to channel types: Text, Voice, Stage
       */
      SendVoiceMessages: 1n << 46n
    };
    Object.freeze(exports.PermissionFlagsBits);
  }
});

// node_modules/discord-api-types/payloads/v10/application.js
var require_application = __commonJS({
  "node_modules/discord-api-types/payloads/v10/application.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ApplicationRoleConnectionMetadataType = exports.ApplicationFlags = void 0;
    var ApplicationFlags2;
    (function(ApplicationFlags3) {
      ApplicationFlags3[ApplicationFlags3["EmbeddedReleased"] = 2] = "EmbeddedReleased";
      ApplicationFlags3[ApplicationFlags3["ManagedEmoji"] = 4] = "ManagedEmoji";
      ApplicationFlags3[ApplicationFlags3["EmbeddedIAP"] = 8] = "EmbeddedIAP";
      ApplicationFlags3[ApplicationFlags3["GroupDMCreate"] = 16] = "GroupDMCreate";
      ApplicationFlags3[ApplicationFlags3["ApplicationAutoModerationRuleCreateBadge"] = 64] = "ApplicationAutoModerationRuleCreateBadge";
      ApplicationFlags3[ApplicationFlags3["RPCHasConnected"] = 2048] = "RPCHasConnected";
      ApplicationFlags3[ApplicationFlags3["GatewayPresence"] = 4096] = "GatewayPresence";
      ApplicationFlags3[ApplicationFlags3["GatewayPresenceLimited"] = 8192] = "GatewayPresenceLimited";
      ApplicationFlags3[ApplicationFlags3["GatewayGuildMembers"] = 16384] = "GatewayGuildMembers";
      ApplicationFlags3[ApplicationFlags3["GatewayGuildMembersLimited"] = 32768] = "GatewayGuildMembersLimited";
      ApplicationFlags3[ApplicationFlags3["VerificationPendingGuildLimit"] = 65536] = "VerificationPendingGuildLimit";
      ApplicationFlags3[ApplicationFlags3["Embedded"] = 131072] = "Embedded";
      ApplicationFlags3[ApplicationFlags3["GatewayMessageContent"] = 262144] = "GatewayMessageContent";
      ApplicationFlags3[ApplicationFlags3["GatewayMessageContentLimited"] = 524288] = "GatewayMessageContentLimited";
      ApplicationFlags3[ApplicationFlags3["EmbeddedFirstParty"] = 1048576] = "EmbeddedFirstParty";
      ApplicationFlags3[ApplicationFlags3["ApplicationCommandBadge"] = 8388608] = "ApplicationCommandBadge";
    })(ApplicationFlags2 = exports.ApplicationFlags || (exports.ApplicationFlags = {}));
    var ApplicationRoleConnectionMetadataType2;
    (function(ApplicationRoleConnectionMetadataType3) {
      ApplicationRoleConnectionMetadataType3[ApplicationRoleConnectionMetadataType3["IntegerLessThanOrEqual"] = 1] = "IntegerLessThanOrEqual";
      ApplicationRoleConnectionMetadataType3[ApplicationRoleConnectionMetadataType3["IntegerGreaterThanOrEqual"] = 2] = "IntegerGreaterThanOrEqual";
      ApplicationRoleConnectionMetadataType3[ApplicationRoleConnectionMetadataType3["IntegerEqual"] = 3] = "IntegerEqual";
      ApplicationRoleConnectionMetadataType3[ApplicationRoleConnectionMetadataType3["IntegerNotEqual"] = 4] = "IntegerNotEqual";
      ApplicationRoleConnectionMetadataType3[ApplicationRoleConnectionMetadataType3["DatetimeLessThanOrEqual"] = 5] = "DatetimeLessThanOrEqual";
      ApplicationRoleConnectionMetadataType3[ApplicationRoleConnectionMetadataType3["DatetimeGreaterThanOrEqual"] = 6] = "DatetimeGreaterThanOrEqual";
      ApplicationRoleConnectionMetadataType3[ApplicationRoleConnectionMetadataType3["BooleanEqual"] = 7] = "BooleanEqual";
      ApplicationRoleConnectionMetadataType3[ApplicationRoleConnectionMetadataType3["BooleanNotEqual"] = 8] = "BooleanNotEqual";
    })(ApplicationRoleConnectionMetadataType2 = exports.ApplicationRoleConnectionMetadataType || (exports.ApplicationRoleConnectionMetadataType = {}));
  }
});

// node_modules/discord-api-types/payloads/v10/auditLog.js
var require_auditLog = __commonJS({
  "node_modules/discord-api-types/payloads/v10/auditLog.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AuditLogOptionsType = exports.AuditLogEvent = void 0;
    var AuditLogEvent2;
    (function(AuditLogEvent3) {
      AuditLogEvent3[AuditLogEvent3["GuildUpdate"] = 1] = "GuildUpdate";
      AuditLogEvent3[AuditLogEvent3["ChannelCreate"] = 10] = "ChannelCreate";
      AuditLogEvent3[AuditLogEvent3["ChannelUpdate"] = 11] = "ChannelUpdate";
      AuditLogEvent3[AuditLogEvent3["ChannelDelete"] = 12] = "ChannelDelete";
      AuditLogEvent3[AuditLogEvent3["ChannelOverwriteCreate"] = 13] = "ChannelOverwriteCreate";
      AuditLogEvent3[AuditLogEvent3["ChannelOverwriteUpdate"] = 14] = "ChannelOverwriteUpdate";
      AuditLogEvent3[AuditLogEvent3["ChannelOverwriteDelete"] = 15] = "ChannelOverwriteDelete";
      AuditLogEvent3[AuditLogEvent3["MemberKick"] = 20] = "MemberKick";
      AuditLogEvent3[AuditLogEvent3["MemberPrune"] = 21] = "MemberPrune";
      AuditLogEvent3[AuditLogEvent3["MemberBanAdd"] = 22] = "MemberBanAdd";
      AuditLogEvent3[AuditLogEvent3["MemberBanRemove"] = 23] = "MemberBanRemove";
      AuditLogEvent3[AuditLogEvent3["MemberUpdate"] = 24] = "MemberUpdate";
      AuditLogEvent3[AuditLogEvent3["MemberRoleUpdate"] = 25] = "MemberRoleUpdate";
      AuditLogEvent3[AuditLogEvent3["MemberMove"] = 26] = "MemberMove";
      AuditLogEvent3[AuditLogEvent3["MemberDisconnect"] = 27] = "MemberDisconnect";
      AuditLogEvent3[AuditLogEvent3["BotAdd"] = 28] = "BotAdd";
      AuditLogEvent3[AuditLogEvent3["RoleCreate"] = 30] = "RoleCreate";
      AuditLogEvent3[AuditLogEvent3["RoleUpdate"] = 31] = "RoleUpdate";
      AuditLogEvent3[AuditLogEvent3["RoleDelete"] = 32] = "RoleDelete";
      AuditLogEvent3[AuditLogEvent3["InviteCreate"] = 40] = "InviteCreate";
      AuditLogEvent3[AuditLogEvent3["InviteUpdate"] = 41] = "InviteUpdate";
      AuditLogEvent3[AuditLogEvent3["InviteDelete"] = 42] = "InviteDelete";
      AuditLogEvent3[AuditLogEvent3["WebhookCreate"] = 50] = "WebhookCreate";
      AuditLogEvent3[AuditLogEvent3["WebhookUpdate"] = 51] = "WebhookUpdate";
      AuditLogEvent3[AuditLogEvent3["WebhookDelete"] = 52] = "WebhookDelete";
      AuditLogEvent3[AuditLogEvent3["EmojiCreate"] = 60] = "EmojiCreate";
      AuditLogEvent3[AuditLogEvent3["EmojiUpdate"] = 61] = "EmojiUpdate";
      AuditLogEvent3[AuditLogEvent3["EmojiDelete"] = 62] = "EmojiDelete";
      AuditLogEvent3[AuditLogEvent3["MessageDelete"] = 72] = "MessageDelete";
      AuditLogEvent3[AuditLogEvent3["MessageBulkDelete"] = 73] = "MessageBulkDelete";
      AuditLogEvent3[AuditLogEvent3["MessagePin"] = 74] = "MessagePin";
      AuditLogEvent3[AuditLogEvent3["MessageUnpin"] = 75] = "MessageUnpin";
      AuditLogEvent3[AuditLogEvent3["IntegrationCreate"] = 80] = "IntegrationCreate";
      AuditLogEvent3[AuditLogEvent3["IntegrationUpdate"] = 81] = "IntegrationUpdate";
      AuditLogEvent3[AuditLogEvent3["IntegrationDelete"] = 82] = "IntegrationDelete";
      AuditLogEvent3[AuditLogEvent3["StageInstanceCreate"] = 83] = "StageInstanceCreate";
      AuditLogEvent3[AuditLogEvent3["StageInstanceUpdate"] = 84] = "StageInstanceUpdate";
      AuditLogEvent3[AuditLogEvent3["StageInstanceDelete"] = 85] = "StageInstanceDelete";
      AuditLogEvent3[AuditLogEvent3["StickerCreate"] = 90] = "StickerCreate";
      AuditLogEvent3[AuditLogEvent3["StickerUpdate"] = 91] = "StickerUpdate";
      AuditLogEvent3[AuditLogEvent3["StickerDelete"] = 92] = "StickerDelete";
      AuditLogEvent3[AuditLogEvent3["GuildScheduledEventCreate"] = 100] = "GuildScheduledEventCreate";
      AuditLogEvent3[AuditLogEvent3["GuildScheduledEventUpdate"] = 101] = "GuildScheduledEventUpdate";
      AuditLogEvent3[AuditLogEvent3["GuildScheduledEventDelete"] = 102] = "GuildScheduledEventDelete";
      AuditLogEvent3[AuditLogEvent3["ThreadCreate"] = 110] = "ThreadCreate";
      AuditLogEvent3[AuditLogEvent3["ThreadUpdate"] = 111] = "ThreadUpdate";
      AuditLogEvent3[AuditLogEvent3["ThreadDelete"] = 112] = "ThreadDelete";
      AuditLogEvent3[AuditLogEvent3["ApplicationCommandPermissionUpdate"] = 121] = "ApplicationCommandPermissionUpdate";
      AuditLogEvent3[AuditLogEvent3["AutoModerationRuleCreate"] = 140] = "AutoModerationRuleCreate";
      AuditLogEvent3[AuditLogEvent3["AutoModerationRuleUpdate"] = 141] = "AutoModerationRuleUpdate";
      AuditLogEvent3[AuditLogEvent3["AutoModerationRuleDelete"] = 142] = "AutoModerationRuleDelete";
      AuditLogEvent3[AuditLogEvent3["AutoModerationBlockMessage"] = 143] = "AutoModerationBlockMessage";
      AuditLogEvent3[AuditLogEvent3["AutoModerationFlagToChannel"] = 144] = "AutoModerationFlagToChannel";
      AuditLogEvent3[AuditLogEvent3["AutoModerationUserCommunicationDisabled"] = 145] = "AutoModerationUserCommunicationDisabled";
      AuditLogEvent3[AuditLogEvent3["CreatorMonetizationRequestCreated"] = 150] = "CreatorMonetizationRequestCreated";
      AuditLogEvent3[AuditLogEvent3["CreatorMonetizationTermsAccepted"] = 151] = "CreatorMonetizationTermsAccepted";
    })(AuditLogEvent2 = exports.AuditLogEvent || (exports.AuditLogEvent = {}));
    var AuditLogOptionsType2;
    (function(AuditLogOptionsType3) {
      AuditLogOptionsType3["Role"] = "0";
      AuditLogOptionsType3["Member"] = "1";
    })(AuditLogOptionsType2 = exports.AuditLogOptionsType || (exports.AuditLogOptionsType = {}));
  }
});

// node_modules/discord-api-types/payloads/v10/autoModeration.js
var require_autoModeration = __commonJS({
  "node_modules/discord-api-types/payloads/v10/autoModeration.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AutoModerationActionType = exports.AutoModerationRuleEventType = exports.AutoModerationRuleKeywordPresetType = exports.AutoModerationRuleTriggerType = void 0;
    var AutoModerationRuleTriggerType2;
    (function(AutoModerationRuleTriggerType3) {
      AutoModerationRuleTriggerType3[AutoModerationRuleTriggerType3["Keyword"] = 1] = "Keyword";
      AutoModerationRuleTriggerType3[AutoModerationRuleTriggerType3["Spam"] = 3] = "Spam";
      AutoModerationRuleTriggerType3[AutoModerationRuleTriggerType3["KeywordPreset"] = 4] = "KeywordPreset";
      AutoModerationRuleTriggerType3[AutoModerationRuleTriggerType3["MentionSpam"] = 5] = "MentionSpam";
    })(AutoModerationRuleTriggerType2 = exports.AutoModerationRuleTriggerType || (exports.AutoModerationRuleTriggerType = {}));
    var AutoModerationRuleKeywordPresetType2;
    (function(AutoModerationRuleKeywordPresetType3) {
      AutoModerationRuleKeywordPresetType3[AutoModerationRuleKeywordPresetType3["Profanity"] = 1] = "Profanity";
      AutoModerationRuleKeywordPresetType3[AutoModerationRuleKeywordPresetType3["SexualContent"] = 2] = "SexualContent";
      AutoModerationRuleKeywordPresetType3[AutoModerationRuleKeywordPresetType3["Slurs"] = 3] = "Slurs";
    })(AutoModerationRuleKeywordPresetType2 = exports.AutoModerationRuleKeywordPresetType || (exports.AutoModerationRuleKeywordPresetType = {}));
    var AutoModerationRuleEventType2;
    (function(AutoModerationRuleEventType3) {
      AutoModerationRuleEventType3[AutoModerationRuleEventType3["MessageSend"] = 1] = "MessageSend";
    })(AutoModerationRuleEventType2 = exports.AutoModerationRuleEventType || (exports.AutoModerationRuleEventType = {}));
    var AutoModerationActionType2;
    (function(AutoModerationActionType3) {
      AutoModerationActionType3[AutoModerationActionType3["BlockMessage"] = 1] = "BlockMessage";
      AutoModerationActionType3[AutoModerationActionType3["SendAlertMessage"] = 2] = "SendAlertMessage";
      AutoModerationActionType3[AutoModerationActionType3["Timeout"] = 3] = "Timeout";
    })(AutoModerationActionType2 = exports.AutoModerationActionType || (exports.AutoModerationActionType = {}));
  }
});

// node_modules/discord-api-types/payloads/v10/channel.js
var require_channel = __commonJS({
  "node_modules/discord-api-types/payloads/v10/channel.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChannelFlags = exports.SelectMenuDefaultValueType = exports.TextInputStyle = exports.ButtonStyle = exports.ComponentType = exports.AllowedMentionsTypes = exports.AttachmentFlags = exports.EmbedType = exports.ThreadMemberFlags = exports.ThreadAutoArchiveDuration = exports.OverwriteType = exports.MessageFlags = exports.MessageActivityType = exports.MessageType = exports.VideoQualityMode = exports.ChannelType = exports.ForumLayoutType = exports.SortOrderType = void 0;
    var SortOrderType2;
    (function(SortOrderType3) {
      SortOrderType3[SortOrderType3["LatestActivity"] = 0] = "LatestActivity";
      SortOrderType3[SortOrderType3["CreationDate"] = 1] = "CreationDate";
    })(SortOrderType2 = exports.SortOrderType || (exports.SortOrderType = {}));
    var ForumLayoutType2;
    (function(ForumLayoutType3) {
      ForumLayoutType3[ForumLayoutType3["NotSet"] = 0] = "NotSet";
      ForumLayoutType3[ForumLayoutType3["ListView"] = 1] = "ListView";
      ForumLayoutType3[ForumLayoutType3["GalleryView"] = 2] = "GalleryView";
    })(ForumLayoutType2 = exports.ForumLayoutType || (exports.ForumLayoutType = {}));
    var ChannelType2;
    (function(ChannelType3) {
      ChannelType3[ChannelType3["GuildText"] = 0] = "GuildText";
      ChannelType3[ChannelType3["DM"] = 1] = "DM";
      ChannelType3[ChannelType3["GuildVoice"] = 2] = "GuildVoice";
      ChannelType3[ChannelType3["GroupDM"] = 3] = "GroupDM";
      ChannelType3[ChannelType3["GuildCategory"] = 4] = "GuildCategory";
      ChannelType3[ChannelType3["GuildAnnouncement"] = 5] = "GuildAnnouncement";
      ChannelType3[ChannelType3["AnnouncementThread"] = 10] = "AnnouncementThread";
      ChannelType3[ChannelType3["PublicThread"] = 11] = "PublicThread";
      ChannelType3[ChannelType3["PrivateThread"] = 12] = "PrivateThread";
      ChannelType3[ChannelType3["GuildStageVoice"] = 13] = "GuildStageVoice";
      ChannelType3[ChannelType3["GuildDirectory"] = 14] = "GuildDirectory";
      ChannelType3[ChannelType3["GuildForum"] = 15] = "GuildForum";
      ChannelType3[ChannelType3["GuildMedia"] = 16] = "GuildMedia";
      ChannelType3[ChannelType3["GuildNews"] = 5] = "GuildNews";
      ChannelType3[ChannelType3["GuildNewsThread"] = 10] = "GuildNewsThread";
      ChannelType3[ChannelType3["GuildPublicThread"] = 11] = "GuildPublicThread";
      ChannelType3[ChannelType3["GuildPrivateThread"] = 12] = "GuildPrivateThread";
    })(ChannelType2 = exports.ChannelType || (exports.ChannelType = {}));
    var VideoQualityMode2;
    (function(VideoQualityMode3) {
      VideoQualityMode3[VideoQualityMode3["Auto"] = 1] = "Auto";
      VideoQualityMode3[VideoQualityMode3["Full"] = 2] = "Full";
    })(VideoQualityMode2 = exports.VideoQualityMode || (exports.VideoQualityMode = {}));
    var MessageType2;
    (function(MessageType3) {
      MessageType3[MessageType3["Default"] = 0] = "Default";
      MessageType3[MessageType3["RecipientAdd"] = 1] = "RecipientAdd";
      MessageType3[MessageType3["RecipientRemove"] = 2] = "RecipientRemove";
      MessageType3[MessageType3["Call"] = 3] = "Call";
      MessageType3[MessageType3["ChannelNameChange"] = 4] = "ChannelNameChange";
      MessageType3[MessageType3["ChannelIconChange"] = 5] = "ChannelIconChange";
      MessageType3[MessageType3["ChannelPinnedMessage"] = 6] = "ChannelPinnedMessage";
      MessageType3[MessageType3["UserJoin"] = 7] = "UserJoin";
      MessageType3[MessageType3["GuildBoost"] = 8] = "GuildBoost";
      MessageType3[MessageType3["GuildBoostTier1"] = 9] = "GuildBoostTier1";
      MessageType3[MessageType3["GuildBoostTier2"] = 10] = "GuildBoostTier2";
      MessageType3[MessageType3["GuildBoostTier3"] = 11] = "GuildBoostTier3";
      MessageType3[MessageType3["ChannelFollowAdd"] = 12] = "ChannelFollowAdd";
      MessageType3[MessageType3["GuildDiscoveryDisqualified"] = 14] = "GuildDiscoveryDisqualified";
      MessageType3[MessageType3["GuildDiscoveryRequalified"] = 15] = "GuildDiscoveryRequalified";
      MessageType3[MessageType3["GuildDiscoveryGracePeriodInitialWarning"] = 16] = "GuildDiscoveryGracePeriodInitialWarning";
      MessageType3[MessageType3["GuildDiscoveryGracePeriodFinalWarning"] = 17] = "GuildDiscoveryGracePeriodFinalWarning";
      MessageType3[MessageType3["ThreadCreated"] = 18] = "ThreadCreated";
      MessageType3[MessageType3["Reply"] = 19] = "Reply";
      MessageType3[MessageType3["ChatInputCommand"] = 20] = "ChatInputCommand";
      MessageType3[MessageType3["ThreadStarterMessage"] = 21] = "ThreadStarterMessage";
      MessageType3[MessageType3["GuildInviteReminder"] = 22] = "GuildInviteReminder";
      MessageType3[MessageType3["ContextMenuCommand"] = 23] = "ContextMenuCommand";
      MessageType3[MessageType3["AutoModerationAction"] = 24] = "AutoModerationAction";
      MessageType3[MessageType3["RoleSubscriptionPurchase"] = 25] = "RoleSubscriptionPurchase";
      MessageType3[MessageType3["InteractionPremiumUpsell"] = 26] = "InteractionPremiumUpsell";
      MessageType3[MessageType3["StageStart"] = 27] = "StageStart";
      MessageType3[MessageType3["StageEnd"] = 28] = "StageEnd";
      MessageType3[MessageType3["StageSpeaker"] = 29] = "StageSpeaker";
      MessageType3[MessageType3["StageRaiseHand"] = 30] = "StageRaiseHand";
      MessageType3[MessageType3["StageTopic"] = 31] = "StageTopic";
      MessageType3[MessageType3["GuildApplicationPremiumSubscription"] = 32] = "GuildApplicationPremiumSubscription";
    })(MessageType2 = exports.MessageType || (exports.MessageType = {}));
    var MessageActivityType2;
    (function(MessageActivityType3) {
      MessageActivityType3[MessageActivityType3["Join"] = 1] = "Join";
      MessageActivityType3[MessageActivityType3["Spectate"] = 2] = "Spectate";
      MessageActivityType3[MessageActivityType3["Listen"] = 3] = "Listen";
      MessageActivityType3[MessageActivityType3["JoinRequest"] = 5] = "JoinRequest";
    })(MessageActivityType2 = exports.MessageActivityType || (exports.MessageActivityType = {}));
    var MessageFlags2;
    (function(MessageFlags3) {
      MessageFlags3[MessageFlags3["Crossposted"] = 1] = "Crossposted";
      MessageFlags3[MessageFlags3["IsCrosspost"] = 2] = "IsCrosspost";
      MessageFlags3[MessageFlags3["SuppressEmbeds"] = 4] = "SuppressEmbeds";
      MessageFlags3[MessageFlags3["SourceMessageDeleted"] = 8] = "SourceMessageDeleted";
      MessageFlags3[MessageFlags3["Urgent"] = 16] = "Urgent";
      MessageFlags3[MessageFlags3["HasThread"] = 32] = "HasThread";
      MessageFlags3[MessageFlags3["Ephemeral"] = 64] = "Ephemeral";
      MessageFlags3[MessageFlags3["Loading"] = 128] = "Loading";
      MessageFlags3[MessageFlags3["FailedToMentionSomeRolesInThread"] = 256] = "FailedToMentionSomeRolesInThread";
      MessageFlags3[MessageFlags3["ShouldShowLinkNotDiscordWarning"] = 1024] = "ShouldShowLinkNotDiscordWarning";
      MessageFlags3[MessageFlags3["SuppressNotifications"] = 4096] = "SuppressNotifications";
      MessageFlags3[MessageFlags3["IsVoiceMessage"] = 8192] = "IsVoiceMessage";
    })(MessageFlags2 = exports.MessageFlags || (exports.MessageFlags = {}));
    var OverwriteType2;
    (function(OverwriteType3) {
      OverwriteType3[OverwriteType3["Role"] = 0] = "Role";
      OverwriteType3[OverwriteType3["Member"] = 1] = "Member";
    })(OverwriteType2 = exports.OverwriteType || (exports.OverwriteType = {}));
    var ThreadAutoArchiveDuration2;
    (function(ThreadAutoArchiveDuration3) {
      ThreadAutoArchiveDuration3[ThreadAutoArchiveDuration3["OneHour"] = 60] = "OneHour";
      ThreadAutoArchiveDuration3[ThreadAutoArchiveDuration3["OneDay"] = 1440] = "OneDay";
      ThreadAutoArchiveDuration3[ThreadAutoArchiveDuration3["ThreeDays"] = 4320] = "ThreeDays";
      ThreadAutoArchiveDuration3[ThreadAutoArchiveDuration3["OneWeek"] = 10080] = "OneWeek";
    })(ThreadAutoArchiveDuration2 = exports.ThreadAutoArchiveDuration || (exports.ThreadAutoArchiveDuration = {}));
    var ThreadMemberFlags2;
    (function(ThreadMemberFlags3) {
      ThreadMemberFlags3[ThreadMemberFlags3["HasInteracted"] = 1] = "HasInteracted";
      ThreadMemberFlags3[ThreadMemberFlags3["AllMessages"] = 2] = "AllMessages";
      ThreadMemberFlags3[ThreadMemberFlags3["OnlyMentions"] = 4] = "OnlyMentions";
      ThreadMemberFlags3[ThreadMemberFlags3["NoMessages"] = 8] = "NoMessages";
    })(ThreadMemberFlags2 = exports.ThreadMemberFlags || (exports.ThreadMemberFlags = {}));
    var EmbedType2;
    (function(EmbedType3) {
      EmbedType3["Rich"] = "rich";
      EmbedType3["Image"] = "image";
      EmbedType3["Video"] = "video";
      EmbedType3["GIFV"] = "gifv";
      EmbedType3["Article"] = "article";
      EmbedType3["Link"] = "link";
      EmbedType3["AutoModerationMessage"] = "auto_moderation_message";
    })(EmbedType2 = exports.EmbedType || (exports.EmbedType = {}));
    var AttachmentFlags2;
    (function(AttachmentFlags3) {
      AttachmentFlags3[AttachmentFlags3["IsRemix"] = 4] = "IsRemix";
    })(AttachmentFlags2 = exports.AttachmentFlags || (exports.AttachmentFlags = {}));
    var AllowedMentionsTypes2;
    (function(AllowedMentionsTypes3) {
      AllowedMentionsTypes3["Everyone"] = "everyone";
      AllowedMentionsTypes3["Role"] = "roles";
      AllowedMentionsTypes3["User"] = "users";
    })(AllowedMentionsTypes2 = exports.AllowedMentionsTypes || (exports.AllowedMentionsTypes = {}));
    var ComponentType2;
    (function(ComponentType3) {
      ComponentType3[ComponentType3["ActionRow"] = 1] = "ActionRow";
      ComponentType3[ComponentType3["Button"] = 2] = "Button";
      ComponentType3[ComponentType3["StringSelect"] = 3] = "StringSelect";
      ComponentType3[ComponentType3["TextInput"] = 4] = "TextInput";
      ComponentType3[ComponentType3["UserSelect"] = 5] = "UserSelect";
      ComponentType3[ComponentType3["RoleSelect"] = 6] = "RoleSelect";
      ComponentType3[ComponentType3["MentionableSelect"] = 7] = "MentionableSelect";
      ComponentType3[ComponentType3["ChannelSelect"] = 8] = "ChannelSelect";
      ComponentType3[ComponentType3["SelectMenu"] = 3] = "SelectMenu";
    })(ComponentType2 = exports.ComponentType || (exports.ComponentType = {}));
    var ButtonStyle2;
    (function(ButtonStyle3) {
      ButtonStyle3[ButtonStyle3["Primary"] = 1] = "Primary";
      ButtonStyle3[ButtonStyle3["Secondary"] = 2] = "Secondary";
      ButtonStyle3[ButtonStyle3["Success"] = 3] = "Success";
      ButtonStyle3[ButtonStyle3["Danger"] = 4] = "Danger";
      ButtonStyle3[ButtonStyle3["Link"] = 5] = "Link";
    })(ButtonStyle2 = exports.ButtonStyle || (exports.ButtonStyle = {}));
    var TextInputStyle2;
    (function(TextInputStyle3) {
      TextInputStyle3[TextInputStyle3["Short"] = 1] = "Short";
      TextInputStyle3[TextInputStyle3["Paragraph"] = 2] = "Paragraph";
    })(TextInputStyle2 = exports.TextInputStyle || (exports.TextInputStyle = {}));
    var SelectMenuDefaultValueType2;
    (function(SelectMenuDefaultValueType3) {
      SelectMenuDefaultValueType3["Channel"] = "channel";
      SelectMenuDefaultValueType3["Role"] = "role";
      SelectMenuDefaultValueType3["User"] = "user";
    })(SelectMenuDefaultValueType2 = exports.SelectMenuDefaultValueType || (exports.SelectMenuDefaultValueType = {}));
    var ChannelFlags2;
    (function(ChannelFlags3) {
      ChannelFlags3[ChannelFlags3["GuildFeedRemoved"] = 1] = "GuildFeedRemoved";
      ChannelFlags3[ChannelFlags3["Pinned"] = 2] = "Pinned";
      ChannelFlags3[ChannelFlags3["ActiveChannelsRemoved"] = 4] = "ActiveChannelsRemoved";
      ChannelFlags3[ChannelFlags3["RequireTag"] = 16] = "RequireTag";
      ChannelFlags3[ChannelFlags3["IsSpam"] = 32] = "IsSpam";
      ChannelFlags3[ChannelFlags3["IsGuildResourceChannel"] = 128] = "IsGuildResourceChannel";
      ChannelFlags3[ChannelFlags3["ClydeAI"] = 256] = "ClydeAI";
      ChannelFlags3[ChannelFlags3["IsScheduledForDeletion"] = 512] = "IsScheduledForDeletion";
      ChannelFlags3[ChannelFlags3["HideMediaDownloadOptions"] = 32768] = "HideMediaDownloadOptions";
    })(ChannelFlags2 = exports.ChannelFlags || (exports.ChannelFlags = {}));
  }
});

// node_modules/discord-api-types/payloads/v10/emoji.js
var require_emoji = __commonJS({
  "node_modules/discord-api-types/payloads/v10/emoji.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/payloads/v10/gateway.js
var require_gateway = __commonJS({
  "node_modules/discord-api-types/payloads/v10/gateway.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ActivityFlags = exports.ActivityType = exports.ActivityPlatform = exports.PresenceUpdateStatus = void 0;
    var PresenceUpdateStatus2;
    (function(PresenceUpdateStatus3) {
      PresenceUpdateStatus3["Online"] = "online";
      PresenceUpdateStatus3["DoNotDisturb"] = "dnd";
      PresenceUpdateStatus3["Idle"] = "idle";
      PresenceUpdateStatus3["Invisible"] = "invisible";
      PresenceUpdateStatus3["Offline"] = "offline";
    })(PresenceUpdateStatus2 = exports.PresenceUpdateStatus || (exports.PresenceUpdateStatus = {}));
    var ActivityPlatform2;
    (function(ActivityPlatform3) {
      ActivityPlatform3["Desktop"] = "desktop";
      ActivityPlatform3["Xbox"] = "xbox";
      ActivityPlatform3["Samsung"] = "samsung";
      ActivityPlatform3["IOS"] = "ios";
      ActivityPlatform3["Android"] = "android";
      ActivityPlatform3["Embedded"] = "embedded";
      ActivityPlatform3["PS4"] = "ps4";
      ActivityPlatform3["PS5"] = "ps5";
    })(ActivityPlatform2 = exports.ActivityPlatform || (exports.ActivityPlatform = {}));
    var ActivityType2;
    (function(ActivityType3) {
      ActivityType3[ActivityType3["Playing"] = 0] = "Playing";
      ActivityType3[ActivityType3["Streaming"] = 1] = "Streaming";
      ActivityType3[ActivityType3["Listening"] = 2] = "Listening";
      ActivityType3[ActivityType3["Watching"] = 3] = "Watching";
      ActivityType3[ActivityType3["Custom"] = 4] = "Custom";
      ActivityType3[ActivityType3["Competing"] = 5] = "Competing";
    })(ActivityType2 = exports.ActivityType || (exports.ActivityType = {}));
    var ActivityFlags2;
    (function(ActivityFlags3) {
      ActivityFlags3[ActivityFlags3["Instance"] = 1] = "Instance";
      ActivityFlags3[ActivityFlags3["Join"] = 2] = "Join";
      ActivityFlags3[ActivityFlags3["Spectate"] = 4] = "Spectate";
      ActivityFlags3[ActivityFlags3["JoinRequest"] = 8] = "JoinRequest";
      ActivityFlags3[ActivityFlags3["Sync"] = 16] = "Sync";
      ActivityFlags3[ActivityFlags3["Play"] = 32] = "Play";
      ActivityFlags3[ActivityFlags3["PartyPrivacyFriends"] = 64] = "PartyPrivacyFriends";
      ActivityFlags3[ActivityFlags3["PartyPrivacyVoiceChannel"] = 128] = "PartyPrivacyVoiceChannel";
      ActivityFlags3[ActivityFlags3["Embedded"] = 256] = "Embedded";
    })(ActivityFlags2 = exports.ActivityFlags || (exports.ActivityFlags = {}));
  }
});

// node_modules/discord-api-types/payloads/v10/guild.js
var require_guild = __commonJS({
  "node_modules/discord-api-types/payloads/v10/guild.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GuildOnboardingPromptType = exports.GuildOnboardingMode = exports.MembershipScreeningFieldType = exports.GuildWidgetStyle = exports.IntegrationExpireBehavior = exports.GuildMemberFlags = exports.GuildFeature = exports.GuildSystemChannelFlags = exports.GuildHubType = exports.GuildPremiumTier = exports.GuildVerificationLevel = exports.GuildNSFWLevel = exports.GuildMFALevel = exports.GuildExplicitContentFilter = exports.GuildDefaultMessageNotifications = void 0;
    var GuildDefaultMessageNotifications2;
    (function(GuildDefaultMessageNotifications3) {
      GuildDefaultMessageNotifications3[GuildDefaultMessageNotifications3["AllMessages"] = 0] = "AllMessages";
      GuildDefaultMessageNotifications3[GuildDefaultMessageNotifications3["OnlyMentions"] = 1] = "OnlyMentions";
    })(GuildDefaultMessageNotifications2 = exports.GuildDefaultMessageNotifications || (exports.GuildDefaultMessageNotifications = {}));
    var GuildExplicitContentFilter2;
    (function(GuildExplicitContentFilter3) {
      GuildExplicitContentFilter3[GuildExplicitContentFilter3["Disabled"] = 0] = "Disabled";
      GuildExplicitContentFilter3[GuildExplicitContentFilter3["MembersWithoutRoles"] = 1] = "MembersWithoutRoles";
      GuildExplicitContentFilter3[GuildExplicitContentFilter3["AllMembers"] = 2] = "AllMembers";
    })(GuildExplicitContentFilter2 = exports.GuildExplicitContentFilter || (exports.GuildExplicitContentFilter = {}));
    var GuildMFALevel2;
    (function(GuildMFALevel3) {
      GuildMFALevel3[GuildMFALevel3["None"] = 0] = "None";
      GuildMFALevel3[GuildMFALevel3["Elevated"] = 1] = "Elevated";
    })(GuildMFALevel2 = exports.GuildMFALevel || (exports.GuildMFALevel = {}));
    var GuildNSFWLevel2;
    (function(GuildNSFWLevel3) {
      GuildNSFWLevel3[GuildNSFWLevel3["Default"] = 0] = "Default";
      GuildNSFWLevel3[GuildNSFWLevel3["Explicit"] = 1] = "Explicit";
      GuildNSFWLevel3[GuildNSFWLevel3["Safe"] = 2] = "Safe";
      GuildNSFWLevel3[GuildNSFWLevel3["AgeRestricted"] = 3] = "AgeRestricted";
    })(GuildNSFWLevel2 = exports.GuildNSFWLevel || (exports.GuildNSFWLevel = {}));
    var GuildVerificationLevel2;
    (function(GuildVerificationLevel3) {
      GuildVerificationLevel3[GuildVerificationLevel3["None"] = 0] = "None";
      GuildVerificationLevel3[GuildVerificationLevel3["Low"] = 1] = "Low";
      GuildVerificationLevel3[GuildVerificationLevel3["Medium"] = 2] = "Medium";
      GuildVerificationLevel3[GuildVerificationLevel3["High"] = 3] = "High";
      GuildVerificationLevel3[GuildVerificationLevel3["VeryHigh"] = 4] = "VeryHigh";
    })(GuildVerificationLevel2 = exports.GuildVerificationLevel || (exports.GuildVerificationLevel = {}));
    var GuildPremiumTier2;
    (function(GuildPremiumTier3) {
      GuildPremiumTier3[GuildPremiumTier3["None"] = 0] = "None";
      GuildPremiumTier3[GuildPremiumTier3["Tier1"] = 1] = "Tier1";
      GuildPremiumTier3[GuildPremiumTier3["Tier2"] = 2] = "Tier2";
      GuildPremiumTier3[GuildPremiumTier3["Tier3"] = 3] = "Tier3";
    })(GuildPremiumTier2 = exports.GuildPremiumTier || (exports.GuildPremiumTier = {}));
    var GuildHubType2;
    (function(GuildHubType3) {
      GuildHubType3[GuildHubType3["Default"] = 0] = "Default";
      GuildHubType3[GuildHubType3["HighSchool"] = 1] = "HighSchool";
      GuildHubType3[GuildHubType3["College"] = 2] = "College";
    })(GuildHubType2 = exports.GuildHubType || (exports.GuildHubType = {}));
    var GuildSystemChannelFlags2;
    (function(GuildSystemChannelFlags3) {
      GuildSystemChannelFlags3[GuildSystemChannelFlags3["SuppressJoinNotifications"] = 1] = "SuppressJoinNotifications";
      GuildSystemChannelFlags3[GuildSystemChannelFlags3["SuppressPremiumSubscriptions"] = 2] = "SuppressPremiumSubscriptions";
      GuildSystemChannelFlags3[GuildSystemChannelFlags3["SuppressGuildReminderNotifications"] = 4] = "SuppressGuildReminderNotifications";
      GuildSystemChannelFlags3[GuildSystemChannelFlags3["SuppressJoinNotificationReplies"] = 8] = "SuppressJoinNotificationReplies";
      GuildSystemChannelFlags3[GuildSystemChannelFlags3["SuppressRoleSubscriptionPurchaseNotifications"] = 16] = "SuppressRoleSubscriptionPurchaseNotifications";
      GuildSystemChannelFlags3[GuildSystemChannelFlags3["SuppressRoleSubscriptionPurchaseNotificationReplies"] = 32] = "SuppressRoleSubscriptionPurchaseNotificationReplies";
    })(GuildSystemChannelFlags2 = exports.GuildSystemChannelFlags || (exports.GuildSystemChannelFlags = {}));
    var GuildFeature2;
    (function(GuildFeature3) {
      GuildFeature3["AnimatedBanner"] = "ANIMATED_BANNER";
      GuildFeature3["AnimatedIcon"] = "ANIMATED_ICON";
      GuildFeature3["ApplicationCommandPermissionsV2"] = "APPLICATION_COMMAND_PERMISSIONS_V2";
      GuildFeature3["AutoModeration"] = "AUTO_MODERATION";
      GuildFeature3["Banner"] = "BANNER";
      GuildFeature3["Community"] = "COMMUNITY";
      GuildFeature3["CreatorMonetizableProvisional"] = "CREATOR_MONETIZABLE_PROVISIONAL";
      GuildFeature3["CreatorStorePage"] = "CREATOR_STORE_PAGE";
      GuildFeature3["DeveloperSupportServer"] = "DEVELOPER_SUPPORT_SERVER";
      GuildFeature3["Discoverable"] = "DISCOVERABLE";
      GuildFeature3["Featurable"] = "FEATURABLE";
      GuildFeature3["HasDirectoryEntry"] = "HAS_DIRECTORY_ENTRY";
      GuildFeature3["Hub"] = "HUB";
      GuildFeature3["InvitesDisabled"] = "INVITES_DISABLED";
      GuildFeature3["InviteSplash"] = "INVITE_SPLASH";
      GuildFeature3["LinkedToHub"] = "LINKED_TO_HUB";
      GuildFeature3["MemberVerificationGateEnabled"] = "MEMBER_VERIFICATION_GATE_ENABLED";
      GuildFeature3["MonetizationEnabled"] = "MONETIZATION_ENABLED";
      GuildFeature3["MoreStickers"] = "MORE_STICKERS";
      GuildFeature3["News"] = "NEWS";
      GuildFeature3["Partnered"] = "PARTNERED";
      GuildFeature3["PreviewEnabled"] = "PREVIEW_ENABLED";
      GuildFeature3["PrivateThreads"] = "PRIVATE_THREADS";
      GuildFeature3["RaidAlertsDisabled"] = "RAID_ALERTS_DISABLED";
      GuildFeature3["RelayEnabled"] = "RELAY_ENABLED";
      GuildFeature3["RoleIcons"] = "ROLE_ICONS";
      GuildFeature3["RoleSubscriptionsAvailableForPurchase"] = "ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE";
      GuildFeature3["RoleSubscriptionsEnabled"] = "ROLE_SUBSCRIPTIONS_ENABLED";
      GuildFeature3["TicketedEventsEnabled"] = "TICKETED_EVENTS_ENABLED";
      GuildFeature3["VanityURL"] = "VANITY_URL";
      GuildFeature3["Verified"] = "VERIFIED";
      GuildFeature3["VIPRegions"] = "VIP_REGIONS";
      GuildFeature3["WelcomeScreenEnabled"] = "WELCOME_SCREEN_ENABLED";
    })(GuildFeature2 = exports.GuildFeature || (exports.GuildFeature = {}));
    var GuildMemberFlags2;
    (function(GuildMemberFlags3) {
      GuildMemberFlags3[GuildMemberFlags3["DidRejoin"] = 1] = "DidRejoin";
      GuildMemberFlags3[GuildMemberFlags3["CompletedOnboarding"] = 2] = "CompletedOnboarding";
      GuildMemberFlags3[GuildMemberFlags3["BypassesVerification"] = 4] = "BypassesVerification";
      GuildMemberFlags3[GuildMemberFlags3["StartedOnboarding"] = 8] = "StartedOnboarding";
      GuildMemberFlags3[GuildMemberFlags3["StartedHomeActions"] = 32] = "StartedHomeActions";
      GuildMemberFlags3[GuildMemberFlags3["CompletedHomeActions"] = 64] = "CompletedHomeActions";
      GuildMemberFlags3[GuildMemberFlags3["AutomodQuarantinedUsernameOrGuildNickname"] = 128] = "AutomodQuarantinedUsernameOrGuildNickname";
      GuildMemberFlags3[GuildMemberFlags3["AutomodQuarantinedBio"] = 256] = "AutomodQuarantinedBio";
    })(GuildMemberFlags2 = exports.GuildMemberFlags || (exports.GuildMemberFlags = {}));
    var IntegrationExpireBehavior2;
    (function(IntegrationExpireBehavior3) {
      IntegrationExpireBehavior3[IntegrationExpireBehavior3["RemoveRole"] = 0] = "RemoveRole";
      IntegrationExpireBehavior3[IntegrationExpireBehavior3["Kick"] = 1] = "Kick";
    })(IntegrationExpireBehavior2 = exports.IntegrationExpireBehavior || (exports.IntegrationExpireBehavior = {}));
    var GuildWidgetStyle2;
    (function(GuildWidgetStyle3) {
      GuildWidgetStyle3["Shield"] = "shield";
      GuildWidgetStyle3["Banner1"] = "banner1";
      GuildWidgetStyle3["Banner2"] = "banner2";
      GuildWidgetStyle3["Banner3"] = "banner3";
      GuildWidgetStyle3["Banner4"] = "banner4";
    })(GuildWidgetStyle2 = exports.GuildWidgetStyle || (exports.GuildWidgetStyle = {}));
    var MembershipScreeningFieldType2;
    (function(MembershipScreeningFieldType3) {
      MembershipScreeningFieldType3["Terms"] = "TERMS";
    })(MembershipScreeningFieldType2 = exports.MembershipScreeningFieldType || (exports.MembershipScreeningFieldType = {}));
    var GuildOnboardingMode2;
    (function(GuildOnboardingMode3) {
      GuildOnboardingMode3[GuildOnboardingMode3["OnboardingDefault"] = 0] = "OnboardingDefault";
      GuildOnboardingMode3[GuildOnboardingMode3["OnboardingAdvanced"] = 1] = "OnboardingAdvanced";
    })(GuildOnboardingMode2 = exports.GuildOnboardingMode || (exports.GuildOnboardingMode = {}));
    var GuildOnboardingPromptType2;
    (function(GuildOnboardingPromptType3) {
      GuildOnboardingPromptType3[GuildOnboardingPromptType3["MultipleChoice"] = 0] = "MultipleChoice";
      GuildOnboardingPromptType3[GuildOnboardingPromptType3["Dropdown"] = 1] = "Dropdown";
    })(GuildOnboardingPromptType2 = exports.GuildOnboardingPromptType || (exports.GuildOnboardingPromptType = {}));
  }
});

// node_modules/discord-api-types/payloads/v10/guildScheduledEvent.js
var require_guildScheduledEvent = __commonJS({
  "node_modules/discord-api-types/payloads/v10/guildScheduledEvent.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GuildScheduledEventPrivacyLevel = exports.GuildScheduledEventStatus = exports.GuildScheduledEventEntityType = void 0;
    var GuildScheduledEventEntityType2;
    (function(GuildScheduledEventEntityType3) {
      GuildScheduledEventEntityType3[GuildScheduledEventEntityType3["StageInstance"] = 1] = "StageInstance";
      GuildScheduledEventEntityType3[GuildScheduledEventEntityType3["Voice"] = 2] = "Voice";
      GuildScheduledEventEntityType3[GuildScheduledEventEntityType3["External"] = 3] = "External";
    })(GuildScheduledEventEntityType2 = exports.GuildScheduledEventEntityType || (exports.GuildScheduledEventEntityType = {}));
    var GuildScheduledEventStatus2;
    (function(GuildScheduledEventStatus3) {
      GuildScheduledEventStatus3[GuildScheduledEventStatus3["Scheduled"] = 1] = "Scheduled";
      GuildScheduledEventStatus3[GuildScheduledEventStatus3["Active"] = 2] = "Active";
      GuildScheduledEventStatus3[GuildScheduledEventStatus3["Completed"] = 3] = "Completed";
      GuildScheduledEventStatus3[GuildScheduledEventStatus3["Canceled"] = 4] = "Canceled";
    })(GuildScheduledEventStatus2 = exports.GuildScheduledEventStatus || (exports.GuildScheduledEventStatus = {}));
    var GuildScheduledEventPrivacyLevel2;
    (function(GuildScheduledEventPrivacyLevel3) {
      GuildScheduledEventPrivacyLevel3[GuildScheduledEventPrivacyLevel3["GuildOnly"] = 2] = "GuildOnly";
    })(GuildScheduledEventPrivacyLevel2 = exports.GuildScheduledEventPrivacyLevel || (exports.GuildScheduledEventPrivacyLevel = {}));
  }
});

// node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/attachment.js
var require_attachment = __commonJS({
  "node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/attachment.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/base.js
var require_base = __commonJS({
  "node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/base.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/boolean.js
var require_boolean = __commonJS({
  "node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/boolean.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/channel.js
var require_channel2 = __commonJS({
  "node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/channel.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/integer.js
var require_integer = __commonJS({
  "node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/integer.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/mentionable.js
var require_mentionable = __commonJS({
  "node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/mentionable.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/number.js
var require_number = __commonJS({
  "node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/number.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/role.js
var require_role = __commonJS({
  "node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/role.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/shared.js
var require_shared = __commonJS({
  "node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/shared.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ApplicationCommandOptionType = void 0;
    var ApplicationCommandOptionType2;
    (function(ApplicationCommandOptionType3) {
      ApplicationCommandOptionType3[ApplicationCommandOptionType3["Subcommand"] = 1] = "Subcommand";
      ApplicationCommandOptionType3[ApplicationCommandOptionType3["SubcommandGroup"] = 2] = "SubcommandGroup";
      ApplicationCommandOptionType3[ApplicationCommandOptionType3["String"] = 3] = "String";
      ApplicationCommandOptionType3[ApplicationCommandOptionType3["Integer"] = 4] = "Integer";
      ApplicationCommandOptionType3[ApplicationCommandOptionType3["Boolean"] = 5] = "Boolean";
      ApplicationCommandOptionType3[ApplicationCommandOptionType3["User"] = 6] = "User";
      ApplicationCommandOptionType3[ApplicationCommandOptionType3["Channel"] = 7] = "Channel";
      ApplicationCommandOptionType3[ApplicationCommandOptionType3["Role"] = 8] = "Role";
      ApplicationCommandOptionType3[ApplicationCommandOptionType3["Mentionable"] = 9] = "Mentionable";
      ApplicationCommandOptionType3[ApplicationCommandOptionType3["Number"] = 10] = "Number";
      ApplicationCommandOptionType3[ApplicationCommandOptionType3["Attachment"] = 11] = "Attachment";
    })(ApplicationCommandOptionType2 = exports.ApplicationCommandOptionType || (exports.ApplicationCommandOptionType = {}));
  }
});

// node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/string.js
var require_string = __commonJS({
  "node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/string.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/subcommand.js
var require_subcommand = __commonJS({
  "node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/subcommand.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/subcommandGroup.js
var require_subcommandGroup = __commonJS({
  "node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/subcommandGroup.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/user.js
var require_user = __commonJS({
  "node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/_chatInput/user.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/chatInput.js
var require_chatInput = __commonJS({
  "node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/chatInput.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_attachment(), exports);
    __exportStar(require_base(), exports);
    __exportStar(require_boolean(), exports);
    __exportStar(require_channel2(), exports);
    __exportStar(require_integer(), exports);
    __exportStar(require_mentionable(), exports);
    __exportStar(require_number(), exports);
    __exportStar(require_role(), exports);
    __exportStar(require_shared(), exports);
    __exportStar(require_string(), exports);
    __exportStar(require_subcommand(), exports);
    __exportStar(require_subcommandGroup(), exports);
    __exportStar(require_user(), exports);
  }
});

// node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/contextMenu.js
var require_contextMenu = __commonJS({
  "node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/contextMenu.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/permissions.js
var require_permissions = __commonJS({
  "node_modules/discord-api-types/payloads/v10/_interactions/_applicationCommands/permissions.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.APIApplicationCommandPermissionsConstant = exports.ApplicationCommandPermissionType = void 0;
    var ApplicationCommandPermissionType2;
    (function(ApplicationCommandPermissionType3) {
      ApplicationCommandPermissionType3[ApplicationCommandPermissionType3["Role"] = 1] = "Role";
      ApplicationCommandPermissionType3[ApplicationCommandPermissionType3["User"] = 2] = "User";
      ApplicationCommandPermissionType3[ApplicationCommandPermissionType3["Channel"] = 3] = "Channel";
    })(ApplicationCommandPermissionType2 = exports.ApplicationCommandPermissionType || (exports.ApplicationCommandPermissionType = {}));
    exports.APIApplicationCommandPermissionsConstant = {
      // eslint-disable-next-line unicorn/prefer-native-coercion-functions
      Everyone: (guildId) => String(guildId),
      AllChannels: (guildId) => String(BigInt(guildId) - 1n)
    };
  }
});

// node_modules/discord-api-types/payloads/v10/_interactions/applicationCommands.js
var require_applicationCommands = __commonJS({
  "node_modules/discord-api-types/payloads/v10/_interactions/applicationCommands.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ApplicationCommandType = void 0;
    __exportStar(require_chatInput(), exports);
    __exportStar(require_contextMenu(), exports);
    __exportStar(require_permissions(), exports);
    var ApplicationCommandType2;
    (function(ApplicationCommandType3) {
      ApplicationCommandType3[ApplicationCommandType3["ChatInput"] = 1] = "ChatInput";
      ApplicationCommandType3[ApplicationCommandType3["User"] = 2] = "User";
      ApplicationCommandType3[ApplicationCommandType3["Message"] = 3] = "Message";
    })(ApplicationCommandType2 = exports.ApplicationCommandType || (exports.ApplicationCommandType = {}));
  }
});

// node_modules/discord-api-types/payloads/v10/_interactions/autocomplete.js
var require_autocomplete = __commonJS({
  "node_modules/discord-api-types/payloads/v10/_interactions/autocomplete.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/payloads/v10/_interactions/base.js
var require_base2 = __commonJS({
  "node_modules/discord-api-types/payloads/v10/_interactions/base.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/payloads/v10/_interactions/messageComponents.js
var require_messageComponents = __commonJS({
  "node_modules/discord-api-types/payloads/v10/_interactions/messageComponents.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/payloads/v10/_interactions/modalSubmit.js
var require_modalSubmit = __commonJS({
  "node_modules/discord-api-types/payloads/v10/_interactions/modalSubmit.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/payloads/v10/_interactions/ping.js
var require_ping = __commonJS({
  "node_modules/discord-api-types/payloads/v10/_interactions/ping.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/payloads/v10/_interactions/responses.js
var require_responses = __commonJS({
  "node_modules/discord-api-types/payloads/v10/_interactions/responses.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InteractionResponseType = exports.InteractionType = void 0;
    var InteractionType2;
    (function(InteractionType3) {
      InteractionType3[InteractionType3["Ping"] = 1] = "Ping";
      InteractionType3[InteractionType3["ApplicationCommand"] = 2] = "ApplicationCommand";
      InteractionType3[InteractionType3["MessageComponent"] = 3] = "MessageComponent";
      InteractionType3[InteractionType3["ApplicationCommandAutocomplete"] = 4] = "ApplicationCommandAutocomplete";
      InteractionType3[InteractionType3["ModalSubmit"] = 5] = "ModalSubmit";
    })(InteractionType2 = exports.InteractionType || (exports.InteractionType = {}));
    var InteractionResponseType2;
    (function(InteractionResponseType3) {
      InteractionResponseType3[InteractionResponseType3["Pong"] = 1] = "Pong";
      InteractionResponseType3[InteractionResponseType3["ChannelMessageWithSource"] = 4] = "ChannelMessageWithSource";
      InteractionResponseType3[InteractionResponseType3["DeferredChannelMessageWithSource"] = 5] = "DeferredChannelMessageWithSource";
      InteractionResponseType3[InteractionResponseType3["DeferredMessageUpdate"] = 6] = "DeferredMessageUpdate";
      InteractionResponseType3[InteractionResponseType3["UpdateMessage"] = 7] = "UpdateMessage";
      InteractionResponseType3[InteractionResponseType3["ApplicationCommandAutocompleteResult"] = 8] = "ApplicationCommandAutocompleteResult";
      InteractionResponseType3[InteractionResponseType3["Modal"] = 9] = "Modal";
      InteractionResponseType3[InteractionResponseType3["PremiumRequired"] = 10] = "PremiumRequired";
    })(InteractionResponseType2 = exports.InteractionResponseType || (exports.InteractionResponseType = {}));
  }
});

// node_modules/discord-api-types/payloads/v10/interactions.js
var require_interactions = __commonJS({
  "node_modules/discord-api-types/payloads/v10/interactions.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_applicationCommands(), exports);
    __exportStar(require_autocomplete(), exports);
    __exportStar(require_base2(), exports);
    __exportStar(require_messageComponents(), exports);
    __exportStar(require_modalSubmit(), exports);
    __exportStar(require_ping(), exports);
    __exportStar(require_responses(), exports);
  }
});

// node_modules/discord-api-types/payloads/v10/invite.js
var require_invite = __commonJS({
  "node_modules/discord-api-types/payloads/v10/invite.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InviteTargetType = void 0;
    var InviteTargetType2;
    (function(InviteTargetType3) {
      InviteTargetType3[InviteTargetType3["Stream"] = 1] = "Stream";
      InviteTargetType3[InviteTargetType3["EmbeddedApplication"] = 2] = "EmbeddedApplication";
    })(InviteTargetType2 = exports.InviteTargetType || (exports.InviteTargetType = {}));
  }
});

// node_modules/discord-api-types/payloads/v10/oauth2.js
var require_oauth2 = __commonJS({
  "node_modules/discord-api-types/payloads/v10/oauth2.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OAuth2Scopes = void 0;
    var OAuth2Scopes2;
    (function(OAuth2Scopes3) {
      OAuth2Scopes3["Bot"] = "bot";
      OAuth2Scopes3["Connections"] = "connections";
      OAuth2Scopes3["DMChannelsRead"] = "dm_channels.read";
      OAuth2Scopes3["Email"] = "email";
      OAuth2Scopes3["Identify"] = "identify";
      OAuth2Scopes3["Guilds"] = "guilds";
      OAuth2Scopes3["GuildsJoin"] = "guilds.join";
      OAuth2Scopes3["GuildsMembersRead"] = "guilds.members.read";
      OAuth2Scopes3["GroupDMJoins"] = "gdm.join";
      OAuth2Scopes3["MessagesRead"] = "messages.read";
      OAuth2Scopes3["RoleConnectionsWrite"] = "role_connections.write";
      OAuth2Scopes3["RPC"] = "rpc";
      OAuth2Scopes3["RPCNotificationsRead"] = "rpc.notifications.read";
      OAuth2Scopes3["WebhookIncoming"] = "webhook.incoming";
      OAuth2Scopes3["Voice"] = "voice";
      OAuth2Scopes3["ApplicationsBuildsUpload"] = "applications.builds.upload";
      OAuth2Scopes3["ApplicationsBuildsRead"] = "applications.builds.read";
      OAuth2Scopes3["ApplicationsStoreUpdate"] = "applications.store.update";
      OAuth2Scopes3["ApplicationsEntitlements"] = "applications.entitlements";
      OAuth2Scopes3["RelationshipsRead"] = "relationships.read";
      OAuth2Scopes3["ActivitiesRead"] = "activities.read";
      OAuth2Scopes3["ActivitiesWrite"] = "activities.write";
      OAuth2Scopes3["ApplicationsCommands"] = "applications.commands";
      OAuth2Scopes3["ApplicationsCommandsUpdate"] = "applications.commands.update";
      OAuth2Scopes3["ApplicationCommandsPermissionsUpdate"] = "applications.commands.permissions.update";
    })(OAuth2Scopes2 = exports.OAuth2Scopes || (exports.OAuth2Scopes = {}));
  }
});

// node_modules/discord-api-types/payloads/v10/permissions.js
var require_permissions2 = __commonJS({
  "node_modules/discord-api-types/payloads/v10/permissions.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RoleFlags = void 0;
    var RoleFlags2;
    (function(RoleFlags3) {
      RoleFlags3[RoleFlags3["InPrompt"] = 1] = "InPrompt";
    })(RoleFlags2 = exports.RoleFlags || (exports.RoleFlags = {}));
  }
});

// node_modules/discord-api-types/payloads/v10/stageInstance.js
var require_stageInstance = __commonJS({
  "node_modules/discord-api-types/payloads/v10/stageInstance.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StageInstancePrivacyLevel = void 0;
    var StageInstancePrivacyLevel2;
    (function(StageInstancePrivacyLevel3) {
      StageInstancePrivacyLevel3[StageInstancePrivacyLevel3["Public"] = 1] = "Public";
      StageInstancePrivacyLevel3[StageInstancePrivacyLevel3["GuildOnly"] = 2] = "GuildOnly";
    })(StageInstancePrivacyLevel2 = exports.StageInstancePrivacyLevel || (exports.StageInstancePrivacyLevel = {}));
  }
});

// node_modules/discord-api-types/payloads/v10/sticker.js
var require_sticker = __commonJS({
  "node_modules/discord-api-types/payloads/v10/sticker.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StickerFormatType = exports.StickerType = void 0;
    var StickerType2;
    (function(StickerType3) {
      StickerType3[StickerType3["Standard"] = 1] = "Standard";
      StickerType3[StickerType3["Guild"] = 2] = "Guild";
    })(StickerType2 = exports.StickerType || (exports.StickerType = {}));
    var StickerFormatType2;
    (function(StickerFormatType3) {
      StickerFormatType3[StickerFormatType3["PNG"] = 1] = "PNG";
      StickerFormatType3[StickerFormatType3["APNG"] = 2] = "APNG";
      StickerFormatType3[StickerFormatType3["Lottie"] = 3] = "Lottie";
      StickerFormatType3[StickerFormatType3["GIF"] = 4] = "GIF";
    })(StickerFormatType2 = exports.StickerFormatType || (exports.StickerFormatType = {}));
  }
});

// node_modules/discord-api-types/payloads/v10/teams.js
var require_teams = __commonJS({
  "node_modules/discord-api-types/payloads/v10/teams.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TeamMemberRole = exports.TeamMemberMembershipState = void 0;
    var TeamMemberMembershipState2;
    (function(TeamMemberMembershipState3) {
      TeamMemberMembershipState3[TeamMemberMembershipState3["Invited"] = 1] = "Invited";
      TeamMemberMembershipState3[TeamMemberMembershipState3["Accepted"] = 2] = "Accepted";
    })(TeamMemberMembershipState2 = exports.TeamMemberMembershipState || (exports.TeamMemberMembershipState = {}));
    var TeamMemberRole2;
    (function(TeamMemberRole3) {
      TeamMemberRole3["Admin"] = "admin";
      TeamMemberRole3["Developer"] = "developer";
      TeamMemberRole3["ReadOnly"] = "read_only";
    })(TeamMemberRole2 = exports.TeamMemberRole || (exports.TeamMemberRole = {}));
  }
});

// node_modules/discord-api-types/payloads/v10/template.js
var require_template = __commonJS({
  "node_modules/discord-api-types/payloads/v10/template.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/payloads/v10/user.js
var require_user2 = __commonJS({
  "node_modules/discord-api-types/payloads/v10/user.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConnectionVisibility = exports.ConnectionService = exports.UserPremiumType = exports.UserFlags = void 0;
    var UserFlags2;
    (function(UserFlags3) {
      UserFlags3[UserFlags3["Staff"] = 1] = "Staff";
      UserFlags3[UserFlags3["Partner"] = 2] = "Partner";
      UserFlags3[UserFlags3["Hypesquad"] = 4] = "Hypesquad";
      UserFlags3[UserFlags3["BugHunterLevel1"] = 8] = "BugHunterLevel1";
      UserFlags3[UserFlags3["MFASMS"] = 16] = "MFASMS";
      UserFlags3[UserFlags3["PremiumPromoDismissed"] = 32] = "PremiumPromoDismissed";
      UserFlags3[UserFlags3["HypeSquadOnlineHouse1"] = 64] = "HypeSquadOnlineHouse1";
      UserFlags3[UserFlags3["HypeSquadOnlineHouse2"] = 128] = "HypeSquadOnlineHouse2";
      UserFlags3[UserFlags3["HypeSquadOnlineHouse3"] = 256] = "HypeSquadOnlineHouse3";
      UserFlags3[UserFlags3["PremiumEarlySupporter"] = 512] = "PremiumEarlySupporter";
      UserFlags3[UserFlags3["TeamPseudoUser"] = 1024] = "TeamPseudoUser";
      UserFlags3[UserFlags3["HasUnreadUrgentMessages"] = 8192] = "HasUnreadUrgentMessages";
      UserFlags3[UserFlags3["BugHunterLevel2"] = 16384] = "BugHunterLevel2";
      UserFlags3[UserFlags3["VerifiedBot"] = 65536] = "VerifiedBot";
      UserFlags3[UserFlags3["VerifiedDeveloper"] = 131072] = "VerifiedDeveloper";
      UserFlags3[UserFlags3["CertifiedModerator"] = 262144] = "CertifiedModerator";
      UserFlags3[UserFlags3["BotHTTPInteractions"] = 524288] = "BotHTTPInteractions";
      UserFlags3[UserFlags3["Spammer"] = 1048576] = "Spammer";
      UserFlags3[UserFlags3["DisablePremium"] = 2097152] = "DisablePremium";
      UserFlags3[UserFlags3["ActiveDeveloper"] = 4194304] = "ActiveDeveloper";
      UserFlags3[UserFlags3["Quarantined"] = 17592186044416] = "Quarantined";
      UserFlags3[UserFlags3["Collaborator"] = 1125899906842624] = "Collaborator";
      UserFlags3[UserFlags3["RestrictedCollaborator"] = 2251799813685248] = "RestrictedCollaborator";
    })(UserFlags2 = exports.UserFlags || (exports.UserFlags = {}));
    var UserPremiumType2;
    (function(UserPremiumType3) {
      UserPremiumType3[UserPremiumType3["None"] = 0] = "None";
      UserPremiumType3[UserPremiumType3["NitroClassic"] = 1] = "NitroClassic";
      UserPremiumType3[UserPremiumType3["Nitro"] = 2] = "Nitro";
      UserPremiumType3[UserPremiumType3["NitroBasic"] = 3] = "NitroBasic";
    })(UserPremiumType2 = exports.UserPremiumType || (exports.UserPremiumType = {}));
    var ConnectionService2;
    (function(ConnectionService3) {
      ConnectionService3["BattleNet"] = "battlenet";
      ConnectionService3["eBay"] = "ebay";
      ConnectionService3["EpicGames"] = "epicgames";
      ConnectionService3["Facebook"] = "facebook";
      ConnectionService3["GitHub"] = "github";
      ConnectionService3["Instagram"] = "instagram";
      ConnectionService3["LeagueOfLegends"] = "leagueoflegends";
      ConnectionService3["PayPal"] = "paypal";
      ConnectionService3["PlayStationNetwork"] = "playstation";
      ConnectionService3["Reddit"] = "reddit";
      ConnectionService3["RiotGames"] = "riotgames";
      ConnectionService3["Spotify"] = "spotify";
      ConnectionService3["Skype"] = "skype";
      ConnectionService3["Steam"] = "steam";
      ConnectionService3["TikTok"] = "tiktok";
      ConnectionService3["Twitch"] = "twitch";
      ConnectionService3["X"] = "twitter";
      ConnectionService3["Twitter"] = "twitter";
      ConnectionService3["Xbox"] = "xbox";
      ConnectionService3["YouTube"] = "youtube";
    })(ConnectionService2 = exports.ConnectionService || (exports.ConnectionService = {}));
    var ConnectionVisibility2;
    (function(ConnectionVisibility3) {
      ConnectionVisibility3[ConnectionVisibility3["None"] = 0] = "None";
      ConnectionVisibility3[ConnectionVisibility3["Everyone"] = 1] = "Everyone";
    })(ConnectionVisibility2 = exports.ConnectionVisibility || (exports.ConnectionVisibility = {}));
  }
});

// node_modules/discord-api-types/payloads/v10/voice.js
var require_voice = __commonJS({
  "node_modules/discord-api-types/payloads/v10/voice.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/payloads/v10/webhook.js
var require_webhook = __commonJS({
  "node_modules/discord-api-types/payloads/v10/webhook.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebhookType = void 0;
    var WebhookType2;
    (function(WebhookType3) {
      WebhookType3[WebhookType3["Incoming"] = 1] = "Incoming";
      WebhookType3[WebhookType3["ChannelFollower"] = 2] = "ChannelFollower";
      WebhookType3[WebhookType3["Application"] = 3] = "Application";
    })(WebhookType2 = exports.WebhookType || (exports.WebhookType = {}));
  }
});

// node_modules/discord-api-types/payloads/v10/monetization.js
var require_monetization = __commonJS({
  "node_modules/discord-api-types/payloads/v10/monetization.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SKUType = exports.SKUFlags = exports.EntitlementType = void 0;
    var EntitlementType2;
    (function(EntitlementType3) {
      EntitlementType3[EntitlementType3["ApplicationSubscription"] = 8] = "ApplicationSubscription";
    })(EntitlementType2 = exports.EntitlementType || (exports.EntitlementType = {}));
    var SKUFlags2;
    (function(SKUFlags3) {
      SKUFlags3[SKUFlags3["Available"] = 4] = "Available";
      SKUFlags3[SKUFlags3["GuildSubscription"] = 128] = "GuildSubscription";
      SKUFlags3[SKUFlags3["UserSubscription"] = 256] = "UserSubscription";
    })(SKUFlags2 = exports.SKUFlags || (exports.SKUFlags = {}));
    var SKUType2;
    (function(SKUType3) {
      SKUType3[SKUType3["Subscription"] = 5] = "Subscription";
      SKUType3[SKUType3["SubscriptionGroup"] = 6] = "SubscriptionGroup";
    })(SKUType2 = exports.SKUType || (exports.SKUType = {}));
  }
});

// node_modules/discord-api-types/payloads/v10/index.js
var require_v102 = __commonJS({
  "node_modules/discord-api-types/payloads/v10/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_common2(), exports);
    __exportStar(require_application(), exports);
    __exportStar(require_auditLog(), exports);
    __exportStar(require_autoModeration(), exports);
    __exportStar(require_channel(), exports);
    __exportStar(require_emoji(), exports);
    __exportStar(require_gateway(), exports);
    __exportStar(require_guild(), exports);
    __exportStar(require_guildScheduledEvent(), exports);
    __exportStar(require_interactions(), exports);
    __exportStar(require_invite(), exports);
    __exportStar(require_oauth2(), exports);
    __exportStar(require_permissions2(), exports);
    __exportStar(require_stageInstance(), exports);
    __exportStar(require_sticker(), exports);
    __exportStar(require_teams(), exports);
    __exportStar(require_template(), exports);
    __exportStar(require_user2(), exports);
    __exportStar(require_voice(), exports);
    __exportStar(require_webhook(), exports);
    __exportStar(require_monetization(), exports);
  }
});

// node_modules/discord-api-types/rest/common.js
var require_common3 = __commonJS({
  "node_modules/discord-api-types/rest/common.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Locale = exports.RESTJSONErrorCodes = void 0;
    var RESTJSONErrorCodes2;
    (function(RESTJSONErrorCodes3) {
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["GeneralError"] = 0] = "GeneralError";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownAccount"] = 10001] = "UnknownAccount";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownApplication"] = 10002] = "UnknownApplication";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownChannel"] = 10003] = "UnknownChannel";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownGuild"] = 10004] = "UnknownGuild";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownIntegration"] = 10005] = "UnknownIntegration";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownInvite"] = 10006] = "UnknownInvite";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownMember"] = 10007] = "UnknownMember";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownMessage"] = 10008] = "UnknownMessage";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownPermissionOverwrite"] = 10009] = "UnknownPermissionOverwrite";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownProvider"] = 10010] = "UnknownProvider";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownRole"] = 10011] = "UnknownRole";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownToken"] = 10012] = "UnknownToken";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownUser"] = 10013] = "UnknownUser";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownEmoji"] = 10014] = "UnknownEmoji";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownWebhook"] = 10015] = "UnknownWebhook";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownWebhookService"] = 10016] = "UnknownWebhookService";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownSession"] = 10020] = "UnknownSession";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownBan"] = 10026] = "UnknownBan";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownSKU"] = 10027] = "UnknownSKU";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownStoreListing"] = 10028] = "UnknownStoreListing";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownEntitlement"] = 10029] = "UnknownEntitlement";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownBuild"] = 10030] = "UnknownBuild";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownLobby"] = 10031] = "UnknownLobby";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownBranch"] = 10032] = "UnknownBranch";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownStoreDirectoryLayout"] = 10033] = "UnknownStoreDirectoryLayout";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownRedistributable"] = 10036] = "UnknownRedistributable";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownGiftCode"] = 10038] = "UnknownGiftCode";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownStream"] = 10049] = "UnknownStream";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownPremiumServerSubscribeCooldown"] = 10050] = "UnknownPremiumServerSubscribeCooldown";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownGuildTemplate"] = 10057] = "UnknownGuildTemplate";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownDiscoverableServerCategory"] = 10059] = "UnknownDiscoverableServerCategory";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownSticker"] = 10060] = "UnknownSticker";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownInteraction"] = 10062] = "UnknownInteraction";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownApplicationCommand"] = 10063] = "UnknownApplicationCommand";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownVoiceState"] = 10065] = "UnknownVoiceState";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownApplicationCommandPermissions"] = 10066] = "UnknownApplicationCommandPermissions";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownStageInstance"] = 10067] = "UnknownStageInstance";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownGuildMemberVerificationForm"] = 10068] = "UnknownGuildMemberVerificationForm";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownGuildWelcomeScreen"] = 10069] = "UnknownGuildWelcomeScreen";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownGuildScheduledEvent"] = 10070] = "UnknownGuildScheduledEvent";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownGuildScheduledEventUser"] = 10071] = "UnknownGuildScheduledEventUser";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnknownTag"] = 10087] = "UnknownTag";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["BotsCannotUseThisEndpoint"] = 20001] = "BotsCannotUseThisEndpoint";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["OnlyBotsCanUseThisEndpoint"] = 20002] = "OnlyBotsCanUseThisEndpoint";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["ExplicitContentCannotBeSentToTheDesiredRecipient"] = 20009] = "ExplicitContentCannotBeSentToTheDesiredRecipient";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["NotAuthorizedToPerformThisActionOnThisApplication"] = 20012] = "NotAuthorizedToPerformThisActionOnThisApplication";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["ActionCannotBePerformedDueToSlowmodeRateLimit"] = 20016] = "ActionCannotBePerformedDueToSlowmodeRateLimit";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["TheMazeIsntMeantForYou"] = 20017] = "TheMazeIsntMeantForYou";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["OnlyTheOwnerOfThisAccountCanPerformThisAction"] = 20018] = "OnlyTheOwnerOfThisAccountCanPerformThisAction";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["AnnouncementEditLimitExceeded"] = 20022] = "AnnouncementEditLimitExceeded";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UnderMinimumAge"] = 20024] = "UnderMinimumAge";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["ChannelSendRateLimit"] = 20028] = "ChannelSendRateLimit";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["ServerSendRateLimit"] = 20029] = "ServerSendRateLimit";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["StageTopicServerNameServerDescriptionOrChannelNamesContainDisallowedWords"] = 20031] = "StageTopicServerNameServerDescriptionOrChannelNamesContainDisallowedWords";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["GuildPremiumSubscriptionLevelTooLow"] = 20035] = "GuildPremiumSubscriptionLevelTooLow";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfGuildsReached"] = 30001] = "MaximumNumberOfGuildsReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfFriendsReached"] = 30002] = "MaximumNumberOfFriendsReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfPinsReachedForTheChannel"] = 30003] = "MaximumNumberOfPinsReachedForTheChannel";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfRecipientsReached"] = 30004] = "MaximumNumberOfRecipientsReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfGuildRolesReached"] = 30005] = "MaximumNumberOfGuildRolesReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfWebhooksReached"] = 30007] = "MaximumNumberOfWebhooksReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfEmojisReached"] = 30008] = "MaximumNumberOfEmojisReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfReactionsReached"] = 30010] = "MaximumNumberOfReactionsReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfGroupDMsReached"] = 30011] = "MaximumNumberOfGroupDMsReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfGuildChannelsReached"] = 30013] = "MaximumNumberOfGuildChannelsReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfAttachmentsInAMessageReached"] = 30015] = "MaximumNumberOfAttachmentsInAMessageReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfInvitesReached"] = 30016] = "MaximumNumberOfInvitesReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfAnimatedEmojisReached"] = 30018] = "MaximumNumberOfAnimatedEmojisReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfServerMembersReached"] = 30019] = "MaximumNumberOfServerMembersReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfServerCategoriesReached"] = 30030] = "MaximumNumberOfServerCategoriesReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["GuildAlreadyHasTemplate"] = 30031] = "GuildAlreadyHasTemplate";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfApplicationCommandsReached"] = 30032] = "MaximumNumberOfApplicationCommandsReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumThreadParticipantsReached"] = 30033] = "MaximumThreadParticipantsReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumDailyApplicationCommandCreatesReached"] = 30034] = "MaximumDailyApplicationCommandCreatesReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfNonGuildMemberBansHasBeenExceeded"] = 30035] = "MaximumNumberOfNonGuildMemberBansHasBeenExceeded";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfBanFetchesHasBeenReached"] = 30037] = "MaximumNumberOfBanFetchesHasBeenReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfUncompletedGuildScheduledEventsReached"] = 30038] = "MaximumNumberOfUncompletedGuildScheduledEventsReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfStickersReached"] = 30039] = "MaximumNumberOfStickersReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfPruneRequestsHasBeenReached"] = 30040] = "MaximumNumberOfPruneRequestsHasBeenReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfGuildWidgetSettingsUpdatesHasBeenReached"] = 30042] = "MaximumNumberOfGuildWidgetSettingsUpdatesHasBeenReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfEditsToMessagesOlderThanOneHourReached"] = 30046] = "MaximumNumberOfEditsToMessagesOlderThanOneHourReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfPinnedThreadsInForumHasBeenReached"] = 30047] = "MaximumNumberOfPinnedThreadsInForumHasBeenReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfTagsInForumHasBeenReached"] = 30048] = "MaximumNumberOfTagsInForumHasBeenReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["BitrateIsTooHighForChannelOfThisType"] = 30052] = "BitrateIsTooHighForChannelOfThisType";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfPremiumEmojisReached"] = 30056] = "MaximumNumberOfPremiumEmojisReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfWebhooksPerGuildReached"] = 30058] = "MaximumNumberOfWebhooksPerGuildReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumNumberOfChannelPermissionOverwritesReached"] = 30060] = "MaximumNumberOfChannelPermissionOverwritesReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["TheChannelsForThisGuildAreTooLarge"] = 30061] = "TheChannelsForThisGuildAreTooLarge";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["Unauthorized"] = 40001] = "Unauthorized";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["VerifyYourAccount"] = 40002] = "VerifyYourAccount";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["OpeningDirectMessagesTooFast"] = 40003] = "OpeningDirectMessagesTooFast";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["SendMessagesHasBeenTemporarilyDisabled"] = 40004] = "SendMessagesHasBeenTemporarilyDisabled";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["RequestEntityTooLarge"] = 40005] = "RequestEntityTooLarge";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["FeatureTemporarilyDisabledServerSide"] = 40006] = "FeatureTemporarilyDisabledServerSide";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UserBannedFromThisGuild"] = 40007] = "UserBannedFromThisGuild";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["ConnectionHasBeenRevoked"] = 40012] = "ConnectionHasBeenRevoked";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["TargetUserIsNotConnectedToVoice"] = 40032] = "TargetUserIsNotConnectedToVoice";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["ThisMessageWasAlreadyCrossposted"] = 40033] = "ThisMessageWasAlreadyCrossposted";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["ApplicationCommandWithThatNameAlreadyExists"] = 40041] = "ApplicationCommandWithThatNameAlreadyExists";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["ApplicationInteractionFailedToSend"] = 40043] = "ApplicationInteractionFailedToSend";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["CannotSendAMessageInAForumChannel"] = 40058] = "CannotSendAMessageInAForumChannel";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["InteractionHasAlreadyBeenAcknowledged"] = 40060] = "InteractionHasAlreadyBeenAcknowledged";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["TagNamesMustBeUnique"] = 40061] = "TagNamesMustBeUnique";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["ServiceResourceIsBeingRateLimited"] = 40062] = "ServiceResourceIsBeingRateLimited";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["ThereAreNoTagsAvailableThatCanBeSetByNonModerators"] = 40066] = "ThereAreNoTagsAvailableThatCanBeSetByNonModerators";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["TagRequiredToCreateAForumPostInThisChannel"] = 40067] = "TagRequiredToCreateAForumPostInThisChannel";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["AnEntitlementHasAlreadyBeenGrantedForThisResource"] = 40074] = "AnEntitlementHasAlreadyBeenGrantedForThisResource";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MissingAccess"] = 50001] = "MissingAccess";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["InvalidAccountType"] = 50002] = "InvalidAccountType";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["CannotExecuteActionOnDMChannel"] = 50003] = "CannotExecuteActionOnDMChannel";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["GuildWidgetDisabled"] = 50004] = "GuildWidgetDisabled";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["CannotEditMessageAuthoredByAnotherUser"] = 50005] = "CannotEditMessageAuthoredByAnotherUser";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["CannotSendAnEmptyMessage"] = 50006] = "CannotSendAnEmptyMessage";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["CannotSendMessagesToThisUser"] = 50007] = "CannotSendMessagesToThisUser";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["CannotSendMessagesInNonTextChannel"] = 50008] = "CannotSendMessagesInNonTextChannel";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["ChannelVerificationLevelTooHighForYouToGainAccess"] = 50009] = "ChannelVerificationLevelTooHighForYouToGainAccess";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["OAuth2ApplicationDoesNotHaveBot"] = 50010] = "OAuth2ApplicationDoesNotHaveBot";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["OAuth2ApplicationLimitReached"] = 50011] = "OAuth2ApplicationLimitReached";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["InvalidOAuth2State"] = 50012] = "InvalidOAuth2State";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MissingPermissions"] = 50013] = "MissingPermissions";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["InvalidToken"] = 50014] = "InvalidToken";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["NoteWasTooLong"] = 50015] = "NoteWasTooLong";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["ProvidedTooFewOrTooManyMessagesToDelete"] = 50016] = "ProvidedTooFewOrTooManyMessagesToDelete";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["InvalidMFALevel"] = 50017] = "InvalidMFALevel";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MessageCanOnlyBePinnedInTheChannelItWasSentIn"] = 50019] = "MessageCanOnlyBePinnedInTheChannelItWasSentIn";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["InviteCodeInvalidOrTaken"] = 50020] = "InviteCodeInvalidOrTaken";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["CannotExecuteActionOnSystemMessage"] = 50021] = "CannotExecuteActionOnSystemMessage";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["CannotExecuteActionOnThisChannelType"] = 50024] = "CannotExecuteActionOnThisChannelType";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["InvalidOAuth2AccessToken"] = 50025] = "InvalidOAuth2AccessToken";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MissingRequiredOAuth2Scope"] = 50026] = "MissingRequiredOAuth2Scope";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["InvalidWebhookToken"] = 50027] = "InvalidWebhookToken";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["InvalidRole"] = 50028] = "InvalidRole";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["InvalidRecipients"] = 50033] = "InvalidRecipients";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["OneOfTheMessagesProvidedWasTooOldForBulkDelete"] = 50034] = "OneOfTheMessagesProvidedWasTooOldForBulkDelete";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["InvalidFormBodyOrContentType"] = 50035] = "InvalidFormBodyOrContentType";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["InviteAcceptedToGuildWithoutTheBotBeingIn"] = 50036] = "InviteAcceptedToGuildWithoutTheBotBeingIn";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["InvalidActivityAction"] = 50039] = "InvalidActivityAction";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["InvalidAPIVersion"] = 50041] = "InvalidAPIVersion";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["FileUploadedExceedsMaximumSize"] = 50045] = "FileUploadedExceedsMaximumSize";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["InvalidFileUploaded"] = 50046] = "InvalidFileUploaded";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["CannotSelfRedeemThisGift"] = 50054] = "CannotSelfRedeemThisGift";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["InvalidGuild"] = 50055] = "InvalidGuild";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["InvalidSKU"] = 50057] = "InvalidSKU";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["InvalidRequestOrigin"] = 50067] = "InvalidRequestOrigin";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["InvalidMessageType"] = 50068] = "InvalidMessageType";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["PaymentSourceRequiredToRedeemGift"] = 50070] = "PaymentSourceRequiredToRedeemGift";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["CannotModifyASystemWebhook"] = 50073] = "CannotModifyASystemWebhook";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["CannotDeleteChannelRequiredForCommunityGuilds"] = 50074] = "CannotDeleteChannelRequiredForCommunityGuilds";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["CannotEditStickersWithinMessage"] = 50080] = "CannotEditStickersWithinMessage";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["InvalidStickerSent"] = 50081] = "InvalidStickerSent";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["InvalidActionOnArchivedThread"] = 50083] = "InvalidActionOnArchivedThread";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["InvalidThreadNotificationSettings"] = 50084] = "InvalidThreadNotificationSettings";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["ParameterEarlierThanCreation"] = 50085] = "ParameterEarlierThanCreation";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["CommunityServerChannelsMustBeTextChannels"] = 50086] = "CommunityServerChannelsMustBeTextChannels";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["TheEntityTypeOfTheEventIsDifferentFromTheEntityYouAreTryingToStartTheEventFor"] = 50091] = "TheEntityTypeOfTheEventIsDifferentFromTheEntityYouAreTryingToStartTheEventFor";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["ServerNotAvailableInYourLocation"] = 50095] = "ServerNotAvailableInYourLocation";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["ServerNeedsMonetizationEnabledToPerformThisAction"] = 50097] = "ServerNeedsMonetizationEnabledToPerformThisAction";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["ServerNeedsMoreBoostsToPerformThisAction"] = 50101] = "ServerNeedsMoreBoostsToPerformThisAction";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["RequestBodyContainsInvalidJSON"] = 50109] = "RequestBodyContainsInvalidJSON";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["OwnerCannotBePendingMember"] = 50131] = "OwnerCannotBePendingMember";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["OwnershipCannotBeMovedToABotUser"] = 50132] = "OwnershipCannotBeMovedToABotUser";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["FailedToResizeAssetBelowTheMinimumSize"] = 50138] = "FailedToResizeAssetBelowTheMinimumSize";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["CannotMixSubscriptionAndNonSubscriptionRolesForAnEmoji"] = 50144] = "CannotMixSubscriptionAndNonSubscriptionRolesForAnEmoji";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["CannotConvertBetweenPremiumEmojiAndNormalEmoji"] = 50145] = "CannotConvertBetweenPremiumEmojiAndNormalEmoji";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UploadedFileNotFound"] = 50146] = "UploadedFileNotFound";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["VoiceMessagesDoNotSupportAdditionalContent"] = 50159] = "VoiceMessagesDoNotSupportAdditionalContent";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["VoiceMessagesMustHaveASingleAudioAttachment"] = 50160] = "VoiceMessagesMustHaveASingleAudioAttachment";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["VoiceMessagesMustHaveSupportingMetadata"] = 50161] = "VoiceMessagesMustHaveSupportingMetadata";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["VoiceMessagesCannotBeEdited"] = 50162] = "VoiceMessagesCannotBeEdited";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["CannotDeleteGuildSubscriptionIntegration"] = 50163] = "CannotDeleteGuildSubscriptionIntegration";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["YouCannotSendVoiceMessagesInThisChannel"] = 50173] = "YouCannotSendVoiceMessagesInThisChannel";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["TheUserAccountMustFirstBeVerified"] = 50178] = "TheUserAccountMustFirstBeVerified";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["YouDoNotHavePermissionToSendThisSticker"] = 50600] = "YouDoNotHavePermissionToSendThisSticker";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["TwoFactorAuthenticationIsRequired"] = 60003] = "TwoFactorAuthenticationIsRequired";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["NoUsersWithDiscordTagExist"] = 80004] = "NoUsersWithDiscordTagExist";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["ReactionWasBlocked"] = 90001] = "ReactionWasBlocked";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["ApplicationNotYetAvailable"] = 110001] = "ApplicationNotYetAvailable";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["APIResourceOverloaded"] = 13e4] = "APIResourceOverloaded";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["TheStageIsAlreadyOpen"] = 150006] = "TheStageIsAlreadyOpen";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["CannotReplyWithoutPermissionToReadMessageHistory"] = 160002] = "CannotReplyWithoutPermissionToReadMessageHistory";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["ThreadAlreadyCreatedForMessage"] = 160004] = "ThreadAlreadyCreatedForMessage";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["ThreadLocked"] = 160005] = "ThreadLocked";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumActiveThreads"] = 160006] = "MaximumActiveThreads";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MaximumActiveAnnouncementThreads"] = 160007] = "MaximumActiveAnnouncementThreads";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["InvalidJSONForUploadedLottieFile"] = 170001] = "InvalidJSONForUploadedLottieFile";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["UploadedLottiesCannotContainRasterizedImages"] = 170002] = "UploadedLottiesCannotContainRasterizedImages";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["StickerMaximumFramerateExceeded"] = 170003] = "StickerMaximumFramerateExceeded";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["StickerFrameCountExceedsMaximumOf1000Frames"] = 170004] = "StickerFrameCountExceedsMaximumOf1000Frames";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["LottieAnimationMaximumDimensionsExceeded"] = 170005] = "LottieAnimationMaximumDimensionsExceeded";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["StickerFramerateIsTooSmallOrTooLarge"] = 170006] = "StickerFramerateIsTooSmallOrTooLarge";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["StickerAnimationDurationExceedsMaximumOf5Seconds"] = 170007] = "StickerAnimationDurationExceedsMaximumOf5Seconds";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["CannotUpdateAFinishedEvent"] = 18e4] = "CannotUpdateAFinishedEvent";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["FailedToCreateStageNeededForStageEvent"] = 180002] = "FailedToCreateStageNeededForStageEvent";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MessageWasBlockedByAutomaticModeration"] = 2e5] = "MessageWasBlockedByAutomaticModeration";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["TitleWasBlockedByAutomaticModeration"] = 200001] = "TitleWasBlockedByAutomaticModeration";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["WebhooksPostedToForumChannelsMustHaveAThreadNameOrThreadId"] = 220001] = "WebhooksPostedToForumChannelsMustHaveAThreadNameOrThreadId";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["WebhooksPostedToForumChannelsCannotHaveBothAThreadNameAndThreadId"] = 220002] = "WebhooksPostedToForumChannelsCannotHaveBothAThreadNameAndThreadId";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["WebhooksCanOnlyCreateThreadsInForumChannels"] = 220003] = "WebhooksCanOnlyCreateThreadsInForumChannels";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["WebhookServicesCannotBeUsedInForumChannels"] = 220004] = "WebhookServicesCannotBeUsedInForumChannels";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["MessageBlockedByHarmfulLinksFilter"] = 24e4] = "MessageBlockedByHarmfulLinksFilter";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["CannotEnableOnboardingRequirementsAreNotMet"] = 35e4] = "CannotEnableOnboardingRequirementsAreNotMet";
      RESTJSONErrorCodes3[RESTJSONErrorCodes3["CannotUpdateOnboardingWhileBelowRequirements"] = 350001] = "CannotUpdateOnboardingWhileBelowRequirements";
    })(RESTJSONErrorCodes2 = exports.RESTJSONErrorCodes || (exports.RESTJSONErrorCodes = {}));
    var Locale2;
    (function(Locale3) {
      Locale3["Indonesian"] = "id";
      Locale3["EnglishUS"] = "en-US";
      Locale3["EnglishGB"] = "en-GB";
      Locale3["Bulgarian"] = "bg";
      Locale3["ChineseCN"] = "zh-CN";
      Locale3["ChineseTW"] = "zh-TW";
      Locale3["Croatian"] = "hr";
      Locale3["Czech"] = "cs";
      Locale3["Danish"] = "da";
      Locale3["Dutch"] = "nl";
      Locale3["Finnish"] = "fi";
      Locale3["French"] = "fr";
      Locale3["German"] = "de";
      Locale3["Greek"] = "el";
      Locale3["Hindi"] = "hi";
      Locale3["Hungarian"] = "hu";
      Locale3["Italian"] = "it";
      Locale3["Japanese"] = "ja";
      Locale3["Korean"] = "ko";
      Locale3["Lithuanian"] = "lt";
      Locale3["Norwegian"] = "no";
      Locale3["Polish"] = "pl";
      Locale3["PortugueseBR"] = "pt-BR";
      Locale3["Romanian"] = "ro";
      Locale3["Russian"] = "ru";
      Locale3["SpanishES"] = "es-ES";
      Locale3["Swedish"] = "sv-SE";
      Locale3["Thai"] = "th";
      Locale3["Turkish"] = "tr";
      Locale3["Ukrainian"] = "uk";
      Locale3["Vietnamese"] = "vi";
    })(Locale2 = exports.Locale || (exports.Locale = {}));
  }
});

// node_modules/discord-api-types/rest/v10/application.js
var require_application2 = __commonJS({
  "node_modules/discord-api-types/rest/v10/application.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/rest/v10/auditLog.js
var require_auditLog2 = __commonJS({
  "node_modules/discord-api-types/rest/v10/auditLog.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/rest/v10/autoModeration.js
var require_autoModeration2 = __commonJS({
  "node_modules/discord-api-types/rest/v10/autoModeration.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/rest/v10/channel.js
var require_channel3 = __commonJS({
  "node_modules/discord-api-types/rest/v10/channel.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/rest/v10/emoji.js
var require_emoji2 = __commonJS({
  "node_modules/discord-api-types/rest/v10/emoji.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/rest/v10/gateway.js
var require_gateway2 = __commonJS({
  "node_modules/discord-api-types/rest/v10/gateway.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/rest/v10/guild.js
var require_guild2 = __commonJS({
  "node_modules/discord-api-types/rest/v10/guild.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/rest/v10/guildScheduledEvent.js
var require_guildScheduledEvent2 = __commonJS({
  "node_modules/discord-api-types/rest/v10/guildScheduledEvent.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/rest/v10/interactions.js
var require_interactions2 = __commonJS({
  "node_modules/discord-api-types/rest/v10/interactions.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/rest/v10/invite.js
var require_invite2 = __commonJS({
  "node_modules/discord-api-types/rest/v10/invite.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/rest/v10/oauth2.js
var require_oauth22 = __commonJS({
  "node_modules/discord-api-types/rest/v10/oauth2.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/rest/v10/stageInstance.js
var require_stageInstance2 = __commonJS({
  "node_modules/discord-api-types/rest/v10/stageInstance.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/rest/v10/sticker.js
var require_sticker2 = __commonJS({
  "node_modules/discord-api-types/rest/v10/sticker.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/rest/v10/template.js
var require_template2 = __commonJS({
  "node_modules/discord-api-types/rest/v10/template.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/rest/v10/user.js
var require_user3 = __commonJS({
  "node_modules/discord-api-types/rest/v10/user.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/rest/v10/voice.js
var require_voice2 = __commonJS({
  "node_modules/discord-api-types/rest/v10/voice.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/rest/v10/webhook.js
var require_webhook2 = __commonJS({
  "node_modules/discord-api-types/rest/v10/webhook.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/discord-api-types/rest/v10/monetization.js
var require_monetization2 = __commonJS({
  "node_modules/discord-api-types/rest/v10/monetization.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EntitlementOwnerType = void 0;
    var EntitlementOwnerType2;
    (function(EntitlementOwnerType3) {
      EntitlementOwnerType3[EntitlementOwnerType3["Guild"] = 1] = "Guild";
      EntitlementOwnerType3[EntitlementOwnerType3["User"] = 2] = "User";
    })(EntitlementOwnerType2 = exports.EntitlementOwnerType || (exports.EntitlementOwnerType = {}));
  }
});

// node_modules/discord-api-types/rest/v10/index.js
var require_v103 = __commonJS({
  "node_modules/discord-api-types/rest/v10/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OAuth2Routes = exports.RouteBases = exports.ImageFormat = exports.CDNRoutes = exports.StickerPackApplicationId = exports.Routes = exports.APIVersion = void 0;
    __exportStar(require_common3(), exports);
    __exportStar(require_application2(), exports);
    __exportStar(require_auditLog2(), exports);
    __exportStar(require_autoModeration2(), exports);
    __exportStar(require_channel3(), exports);
    __exportStar(require_emoji2(), exports);
    __exportStar(require_gateway2(), exports);
    __exportStar(require_guild2(), exports);
    __exportStar(require_guildScheduledEvent2(), exports);
    __exportStar(require_interactions2(), exports);
    __exportStar(require_invite2(), exports);
    __exportStar(require_oauth22(), exports);
    __exportStar(require_stageInstance2(), exports);
    __exportStar(require_sticker2(), exports);
    __exportStar(require_template2(), exports);
    __exportStar(require_user3(), exports);
    __exportStar(require_voice2(), exports);
    __exportStar(require_webhook2(), exports);
    __exportStar(require_monetization2(), exports);
    exports.APIVersion = "10";
    exports.Routes = {
      /**
       * Route for:
       * - GET `/applications/{application.id}/role-connections/metadata`
       * - PUT `/applications/{application.id}/role-connections/metadata`
       */
      applicationRoleConnectionMetadata(applicationId) {
        return `/applications/${applicationId}/role-connections/metadata`;
      },
      /**
       * Route for:
       * - GET  `/guilds/{guild.id}/auto-moderation/rules`
       * - POST `/guilds/{guild.id}/auto-moderation/rules`
       */
      guildAutoModerationRules(guildId) {
        return `/guilds/${guildId}/auto-moderation/rules`;
      },
      /**
       * Routes for:
       * - GET    `/guilds/{guild.id}/auto-moderation/rules/{rule.id}`
       * - PATCH  `/guilds/{guild.id}/auto-moderation/rules/{rule.id}`
       * - DELETE `/guilds/{guild.id}/auto-moderation/rules/{rule.id}`
       */
      guildAutoModerationRule(guildId, ruleId) {
        return `/guilds/${guildId}/auto-moderation/rules/${ruleId}`;
      },
      /**
       * Route for:
       * - GET `/guilds/{guild.id}/audit-logs`
       */
      guildAuditLog(guildId) {
        return `/guilds/${guildId}/audit-logs`;
      },
      /**
       * Route for:
       * - GET    `/channels/{channel.id}`
       * - PATCH  `/channels/{channel.id}`
       * - DELETE `/channels/{channel.id}`
       */
      channel(channelId) {
        return `/channels/${channelId}`;
      },
      /**
       * Route for:
       * - GET  `/channels/{channel.id}/messages`
       * - POST `/channels/{channel.id}/messages`
       */
      channelMessages(channelId) {
        return `/channels/${channelId}/messages`;
      },
      /**
       * Route for:
       * - GET    `/channels/{channel.id}/messages/{message.id}`
       * - PATCH  `/channels/{channel.id}/messages/{message.id}`
       * - DELETE `/channels/{channel.id}/messages/{message.id}`
       */
      channelMessage(channelId, messageId) {
        return `/channels/${channelId}/messages/${messageId}`;
      },
      /**
       * Route for:
       * - POST `/channels/{channel.id}/messages/{message.id}/crosspost`
       */
      channelMessageCrosspost(channelId, messageId) {
        return `/channels/${channelId}/messages/${messageId}/crosspost`;
      },
      /**
       * Route for:
       * - PUT    `/channels/{channel.id}/messages/{message.id}/reactions/{emoji}/@me`
       * - DELETE `/channels/{channel.id}/messages/{message.id}/reactions/{emoji}/@me`
       *
       * **Note**: You need to URL encode the emoji yourself
       */
      channelMessageOwnReaction(channelId, messageId, emoji) {
        return `/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`;
      },
      /**
       * Route for:
       * - DELETE `/channels/{channel.id}/messages/{message.id}/reactions/{emoji}/{user.id}`
       *
       * **Note**: You need to URL encode the emoji yourself
       */
      channelMessageUserReaction(channelId, messageId, emoji, userId) {
        return `/channels/${channelId}/messages/${messageId}/reactions/${emoji}/${userId}`;
      },
      /**
       * Route for:
       * - GET    `/channels/{channel.id}/messages/{message.id}/reactions/{emoji}`
       * - DELETE `/channels/{channel.id}/messages/{message.id}/reactions/{emoji}`
       *
       * **Note**: You need to URL encode the emoji yourself
       */
      channelMessageReaction(channelId, messageId, emoji) {
        return `/channels/${channelId}/messages/${messageId}/reactions/${emoji}`;
      },
      /**
       * Route for:
       * - DELETE `/channels/{channel.id}/messages/{message.id}/reactions`
       */
      channelMessageAllReactions(channelId, messageId) {
        return `/channels/${channelId}/messages/${messageId}/reactions`;
      },
      /**
       * Route for:
       * - POST `/channels/{channel.id}/messages/bulk-delete`
       */
      channelBulkDelete(channelId) {
        return `/channels/${channelId}/messages/bulk-delete`;
      },
      /**
       * Route for:
       * - PUT    `/channels/{channel.id}/permissions/{overwrite.id}`
       * - DELETE `/channels/{channel.id}/permissions/{overwrite.id}`
       */
      channelPermission(channelId, overwriteId) {
        return `/channels/${channelId}/permissions/${overwriteId}`;
      },
      /**
       * Route for:
       * - GET  `/channels/{channel.id}/invites`
       * - POST `/channels/{channel.id}/invites`
       */
      channelInvites(channelId) {
        return `/channels/${channelId}/invites`;
      },
      /**
       * Route for:
       * - POST `/channels/{channel.id}/followers`
       */
      channelFollowers(channelId) {
        return `/channels/${channelId}/followers`;
      },
      /**
       * Route for:
       * - POST `/channels/{channel.id}/typing`
       */
      channelTyping(channelId) {
        return `/channels/${channelId}/typing`;
      },
      /**
       * Route for:
       * - GET `/channels/{channel.id}/pins`
       */
      channelPins(channelId) {
        return `/channels/${channelId}/pins`;
      },
      /**
       * Route for:
       * - PUT    `/channels/{channel.id}/pins/{message.id}`
       * - DELETE `/channels/{channel.id}/pins/{message.id}`
       */
      channelPin(channelId, messageId) {
        return `/channels/${channelId}/pins/${messageId}`;
      },
      /**
       * Route for:
       * - PUT    `/channels/{channel.id}/recipients/{user.id}`
       * - DELETE `/channels/{channel.id}/recipients/{user.id}`
       */
      channelRecipient(channelId, userId) {
        return `/channels/${channelId}/recipients/${userId}`;
      },
      /**
       * Route for:
       * - GET  `/guilds/{guild.id}/emojis`
       * - POST `/guilds/{guild.id}/emojis`
       */
      guildEmojis(guildId) {
        return `/guilds/${guildId}/emojis`;
      },
      /**
       * Route for:
       * - GET    `/guilds/{guild.id}/emojis/{emoji.id}`
       * - PATCH  `/guilds/{guild.id}/emojis/{emoji.id}`
       * - DELETE `/guilds/{guild.id}/emojis/{emoji.id}`
       */
      guildEmoji(guildId, emojiId) {
        return `/guilds/${guildId}/emojis/${emojiId}`;
      },
      /**
       * Route for:
       * - POST `/guilds`
       */
      guilds() {
        return "/guilds";
      },
      /**
       * Route for:
       * - GET    `/guilds/{guild.id}`
       * - PATCH  `/guilds/{guild.id}`
       * - DELETE `/guilds/{guild.id}`
       */
      guild(guildId) {
        return `/guilds/${guildId}`;
      },
      /**
       * Route for:
       * - GET `/guilds/{guild.id}/preview`
       */
      guildPreview(guildId) {
        return `/guilds/${guildId}/preview`;
      },
      /**
       * Route for:
       * - GET   `/guilds/{guild.id}/channels`
       * - POST  `/guilds/{guild.id}/channels`
       * - PATCH `/guilds/{guild.id}/channels`
       */
      guildChannels(guildId) {
        return `/guilds/${guildId}/channels`;
      },
      /**
       * Route for:
       * - GET    `/guilds/{guild.id}/members/{user.id}`
       * - PUT    `/guilds/{guild.id}/members/{user.id}`
       * - PATCH  `/guilds/{guild.id}/members/@me`
       * - PATCH  `/guilds/{guild.id}/members/{user.id}`
       * - DELETE `/guilds/{guild.id}/members/{user.id}`
       */
      guildMember(guildId, userId = "@me") {
        return `/guilds/${guildId}/members/${userId}`;
      },
      /**
       * Route for:
       * - GET `/guilds/{guild.id}/members`
       */
      guildMembers(guildId) {
        return `/guilds/${guildId}/members`;
      },
      /**
       * Route for:
       * - GET `/guilds/{guild.id}/members/search`
       */
      guildMembersSearch(guildId) {
        return `/guilds/${guildId}/members/search`;
      },
      /**
       * Route for:
       * - PATCH `/guilds/{guild.id}/members/@me/nick`
       *
       * @deprecated Use {@link Routes.guildMember} instead.
       */
      guildCurrentMemberNickname(guildId) {
        return `/guilds/${guildId}/members/@me/nick`;
      },
      /**
       * Route for:
       * - PUT    `/guilds/{guild.id}/members/{user.id}/roles/{role.id}`
       * - DELETE `/guilds/{guild.id}/members/{user.id}/roles/{role.id}`
       */
      guildMemberRole(guildId, memberId, roleId) {
        return `/guilds/${guildId}/members/${memberId}/roles/${roleId}`;
      },
      /**
       * Route for:
       * - POST `/guilds/{guild.id}/mfa`
       */
      guildMFA(guildId) {
        return `/guilds/${guildId}/mfa`;
      },
      /**
       * Route for:
       * - GET `/guilds/{guild.id}/bans`
       */
      guildBans(guildId) {
        return `/guilds/${guildId}/bans`;
      },
      /**
       * Route for:
       * - GET    `/guilds/{guild.id}/bans/{user.id}`
       * - PUT    `/guilds/{guild.id}/bans/{user.id}`
       * - DELETE `/guilds/{guild.id}/bans/{user.id}`
       */
      guildBan(guildId, userId) {
        return `/guilds/${guildId}/bans/${userId}`;
      },
      /**
       * Route for:
       * - GET   `/guilds/{guild.id}/roles`
       * - POST  `/guilds/{guild.id}/roles`
       * - PATCH `/guilds/{guild.id}/roles`
       */
      guildRoles(guildId) {
        return `/guilds/${guildId}/roles`;
      },
      /**
       * Route for:
       * - PATCH  `/guilds/{guild.id}/roles/{role.id}`
       * - DELETE `/guilds/{guild.id}/roles/{role.id}`
       */
      guildRole(guildId, roleId) {
        return `/guilds/${guildId}/roles/${roleId}`;
      },
      /**
       * Route for:
       * - GET  `/guilds/{guild.id}/prune`
       * - POST `/guilds/{guild.id}/prune`
       */
      guildPrune(guildId) {
        return `/guilds/${guildId}/prune`;
      },
      /**
       * Route for:
       * - GET `/guilds/{guild.id}/regions`
       */
      guildVoiceRegions(guildId) {
        return `/guilds/${guildId}/regions`;
      },
      /**
       * Route for:
       * - GET `/guilds/{guild.id}/invites`
       */
      guildInvites(guildId) {
        return `/guilds/${guildId}/invites`;
      },
      /**
       * Route for:
       * - GET  `/guilds/{guild.id}/integrations`
       */
      guildIntegrations(guildId) {
        return `/guilds/${guildId}/integrations`;
      },
      /**
       * Route for:
       * - DELETE `/guilds/{guild.id}/integrations/{integration.id}`
       */
      guildIntegration(guildId, integrationId) {
        return `/guilds/${guildId}/integrations/${integrationId}`;
      },
      /**
       * Route for:
       * - GET   `/guilds/{guild.id}/widget`
       * - PATCH `/guilds/{guild.id}/widget`
       */
      guildWidgetSettings(guildId) {
        return `/guilds/${guildId}/widget`;
      },
      /**
       * Route for:
       * - GET `/guilds/{guild.id}/widget.json`
       */
      guildWidgetJSON(guildId) {
        return `/guilds/${guildId}/widget.json`;
      },
      /**
       * Route for:
       * - GET `/guilds/{guild.id}/vanity-url`
       */
      guildVanityUrl(guildId) {
        return `/guilds/${guildId}/vanity-url`;
      },
      /**
       * Route for:
       * - GET `/guilds/{guild.id}/widget.png`
       */
      guildWidgetImage(guildId) {
        return `/guilds/${guildId}/widget.png`;
      },
      /**
       * Route for:
       * - GET    `/invites/{invite.code}`
       * - DELETE `/invites/{invite.code}`
       */
      invite(code) {
        return `/invites/${code}`;
      },
      /**
       * Route for:
       * - GET  `/guilds/templates/{template.code}`
       * - POST `/guilds/templates/{template.code}`
       */
      template(code) {
        return `/guilds/templates/${code}`;
      },
      /**
       * Route for:
       * - GET  `/guilds/{guild.id}/templates`
       * - POST `/guilds/{guild.id}/templates`
       */
      guildTemplates(guildId) {
        return `/guilds/${guildId}/templates`;
      },
      /**
       * Route for:
       * - PUT    `/guilds/{guild.id}/templates/{template.code}`
       * - PATCH  `/guilds/{guild.id}/templates/{template.code}`
       * - DELETE `/guilds/{guild.id}/templates/{template.code}`
       */
      guildTemplate(guildId, code) {
        return `/guilds/${guildId}/templates/${code}`;
      },
      /**
       * Route for:
       * - POST `/channels/{channel.id}/threads`
       * - POST `/channels/{channel.id}/messages/{message.id}/threads`
       */
      threads(parentId, messageId) {
        const parts = ["", "channels", parentId];
        if (messageId)
          parts.push("messages", messageId);
        parts.push("threads");
        return parts.join("/");
      },
      /**
       * Route for:
       * - GET `/guilds/{guild.id}/threads/active`
       */
      guildActiveThreads(guildId) {
        return `/guilds/${guildId}/threads/active`;
      },
      /**
       * Route for:
       * - GET `/channels/{channel.id}/threads/archived/public`
       * - GET `/channels/{channel.id}/threads/archived/private`
       */
      channelThreads(channelId, archivedStatus) {
        return `/channels/${channelId}/threads/archived/${archivedStatus}`;
      },
      /**
       * Route for:
       * - GET `/channels/{channel.id}/users/@me/threads/archived/private`
       */
      channelJoinedArchivedThreads(channelId) {
        return `/channels/${channelId}/users/@me/threads/archived/private`;
      },
      /**
       * Route for:
       * - GET    `/channels/{thread.id}/thread-members`
       * - GET    `/channels/{thread.id}/thread-members/{user.id}`
       * - PUT    `/channels/{thread.id}/thread-members/@me`
       * - PUT    `/channels/{thread.id}/thread-members/{user.id}`
       * - DELETE `/channels/{thread.id}/thread-members/@me`
       * - DELETE `/channels/{thread.id}/thread-members/{user.id}`
       */
      threadMembers(threadId, userId) {
        const parts = ["", "channels", threadId, "thread-members"];
        if (userId)
          parts.push(userId);
        return parts.join("/");
      },
      /**
       * Route for:
       * - GET   `/users/@me`
       * - GET   `/users/{user.id}`
       * - PATCH `/users/@me`
       *
       * @param [userId] The user ID, defaulted to `@me`
       */
      user(userId = "@me") {
        return `/users/${userId}`;
      },
      /**
       * Route for:
       * - GET `/users/@me/applications/{application.id}/role-connection`
       * - PUT `/users/@me/applications/{application.id}/role-connection`
       */
      userApplicationRoleConnection(applicationId) {
        return `/users/@me/applications/${applicationId}/role-connection`;
      },
      /**
       * Route for:
       * - GET `/users/@me/guilds`
       */
      userGuilds() {
        return `/users/@me/guilds`;
      },
      /**
       * Route for:
       * - GET `/users/@me/guilds/{guild.id}/member`
       */
      userGuildMember(guildId) {
        return `/users/@me/guilds/${guildId}/member`;
      },
      /**
       * Route for:
       * - DELETE `/users/@me/guilds/{guild.id}`
       */
      userGuild(guildId) {
        return `/users/@me/guilds/${guildId}`;
      },
      /**
       * Route for:
       * - POST `/users/@me/channels`
       */
      userChannels() {
        return `/users/@me/channels`;
      },
      /**
       * Route for:
       * - GET `/users/@me/connections`
       */
      userConnections() {
        return `/users/@me/connections`;
      },
      /**
       * Route for:
       * - GET `/voice/regions`
       */
      voiceRegions() {
        return `/voice/regions`;
      },
      /**
       * Route for:
       * - GET  `/channels/{channel.id}/webhooks`
       * - POST `/channels/{channel.id}/webhooks`
       */
      channelWebhooks(channelId) {
        return `/channels/${channelId}/webhooks`;
      },
      /**
       * Route for:
       * - GET `/guilds/{guild.id}/webhooks`
       */
      guildWebhooks(guildId) {
        return `/guilds/${guildId}/webhooks`;
      },
      /**
       * Route for:
       * - GET    `/webhooks/{webhook.id}`
       * - GET    `/webhooks/{webhook.id}/{webhook.token}`
       * - PATCH  `/webhooks/{webhook.id}`
       * - PATCH  `/webhooks/{webhook.id}/{webhook.token}`
       * - DELETE `/webhooks/{webhook.id}`
       * - DELETE `/webhooks/{webhook.id}/{webhook.token}`
       * - POST   `/webhooks/{webhook.id}/{webhook.token}`
       *
       * - POST   `/webhooks/{application.id}/{interaction.token}`
       */
      webhook(webhookId, webhookToken) {
        const parts = ["", "webhooks", webhookId];
        if (webhookToken)
          parts.push(webhookToken);
        return parts.join("/");
      },
      /**
       * Route for:
       * - GET    `/webhooks/{webhook.id}/{webhook.token}/messages/@original`
       * - GET    `/webhooks/{webhook.id}/{webhook.token}/messages/{message.id}`
       * - PATCH  `/webhooks/{webhook.id}/{webhook.token}/messages/@original`
       * - PATCH  `/webhooks/{webhook.id}/{webhook.token}/messages/{message.id}`
       * - DELETE `/webhooks/{webhook.id}/{webhook.token}/messages/@original`
       * - DELETE `/webhooks/{webhook.id}/{webhook.token}/messages/{message.id}`
       *
       * - PATCH  `/webhooks/{application.id}/{interaction.token}/messages/@original`
       * - PATCH  `/webhooks/{application.id}/{interaction.token}/messages/{message.id}`
       * - DELETE `/webhooks/{application.id}/{interaction.token}/messages/{message.id}`
       */
      webhookMessage(webhookId, webhookToken, messageId = "@original") {
        return `/webhooks/${webhookId}/${webhookToken}/messages/${messageId}`;
      },
      /**
       * Route for:
       * - POST `/webhooks/{webhook.id}/{webhook.token}/github`
       * - POST `/webhooks/{webhook.id}/{webhook.token}/slack`
       */
      webhookPlatform(webhookId, webhookToken, platform) {
        return `/webhooks/${webhookId}/${webhookToken}/${platform}`;
      },
      /**
       * Route for:
       * - GET `/gateway`
       */
      gateway() {
        return `/gateway`;
      },
      /**
       * Route for:
       * - GET `/gateway/bot`
       */
      gatewayBot() {
        return `/gateway/bot`;
      },
      /**
       * Route for:
       * - GET `/oauth2/applications/@me`
       */
      oauth2CurrentApplication() {
        return `/oauth2/applications/@me`;
      },
      /**
       * Route for:
       * - GET `/oauth2/@me`
       */
      oauth2CurrentAuthorization() {
        return `/oauth2/@me`;
      },
      /**
       * Route for:
       * - GET `/oauth2/authorize`
       */
      oauth2Authorization() {
        return `/oauth2/authorize`;
      },
      /**
       * Route for:
       * - POST `/oauth2/token`
       */
      oauth2TokenExchange() {
        return `/oauth2/token`;
      },
      /**
       * Route for:
       * - POST `/oauth2/token/revoke`
       */
      oauth2TokenRevocation() {
        return `/oauth2/token/revoke`;
      },
      /**
       * Route for:
       * - GET  `/applications/{application.id}/commands`
       * - PUT  `/applications/{application.id}/commands`
       * - POST `/applications/{application.id}/commands`
       */
      applicationCommands(applicationId) {
        return `/applications/${applicationId}/commands`;
      },
      /**
       * Route for:
       * - GET    `/applications/{application.id}/commands/{command.id}`
       * - PATCH  `/applications/{application.id}/commands/{command.id}`
       * - DELETE `/applications/{application.id}/commands/{command.id}`
       */
      applicationCommand(applicationId, commandId) {
        return `/applications/${applicationId}/commands/${commandId}`;
      },
      /**
       * Route for:
       * - GET  `/applications/{application.id}/guilds/{guild.id}/commands`
       * - PUT  `/applications/{application.id}/guilds/{guild.id}/commands`
       * - POST `/applications/{application.id}/guilds/{guild.id}/commands`
       */
      applicationGuildCommands(applicationId, guildId) {
        return `/applications/${applicationId}/guilds/${guildId}/commands`;
      },
      /**
       * Route for:
       * - GET    `/applications/{application.id}/guilds/{guild.id}/commands/{command.id}`
       * - PATCH  `/applications/{application.id}/guilds/{guild.id}/commands/{command.id}`
       * - DELETE `/applications/{application.id}/guilds/{guild.id}/commands/{command.id}`
       */
      applicationGuildCommand(applicationId, guildId, commandId) {
        return `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}`;
      },
      /**
       * Route for:
       * - POST `/interactions/{interaction.id}/{interaction.token}/callback`
       */
      interactionCallback(interactionId, interactionToken) {
        return `/interactions/${interactionId}/${interactionToken}/callback`;
      },
      /**
       * Route for:
       * - GET   `/guilds/{guild.id}/member-verification`
       * - PATCH `/guilds/{guild.id}/member-verification`
       */
      guildMemberVerification(guildId) {
        return `/guilds/${guildId}/member-verification`;
      },
      /**
       * Route for:
       * - PATCH `/guilds/{guild.id}/voice-states/@me`
       * - PATCH `/guilds/{guild.id}/voice-states/{user.id}`
       */
      guildVoiceState(guildId, userId = "@me") {
        return `/guilds/${guildId}/voice-states/${userId}`;
      },
      /**
       * Route for:
       * - GET `/applications/{application.id}/guilds/{guild.id}/commands/permissions`
       * - PUT `/applications/{application.id}/guilds/{guild.id}/commands/permissions`
       */
      guildApplicationCommandsPermissions(applicationId, guildId) {
        return `/applications/${applicationId}/guilds/${guildId}/commands/permissions`;
      },
      /**
       * Route for:
       * - GET `/applications/{application.id}/guilds/{guild.id}/commands/{command.id}/permissions`
       * - PUT `/applications/{application.id}/guilds/{guild.id}/commands/{command.id}/permissions`
       */
      applicationCommandPermissions(applicationId, guildId, commandId) {
        return `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}/permissions`;
      },
      /**
       * Route for:
       * - GET   `/guilds/{guild.id}/welcome-screen`
       * - PATCH `/guilds/{guild.id}/welcome-screen`
       */
      guildWelcomeScreen(guildId) {
        return `/guilds/${guildId}/welcome-screen`;
      },
      /**
       * Route for:
       * - POST `/stage-instances`
       */
      stageInstances() {
        return `/stage-instances`;
      },
      /**
       * Route for:
       * - GET `/stage-instances/{channel.id}`
       * - PATCH `/stage-instances/{channel.id}`
       * - DELETE `/stage-instances/{channel.id}`
       */
      stageInstance(channelId) {
        return `/stage-instances/${channelId}`;
      },
      /**
       * Route for:
       * - GET `/stickers/{sticker.id}`
       */
      sticker(stickerId) {
        return `/stickers/${stickerId}`;
      },
      /**
       * Route for:
       * - GET `/sticker-packs`
       */
      stickerPacks() {
        return "/sticker-packs";
      },
      /**
       * Route for:
       * - GET `/sticker-packs`
       *
       * @deprecated Use {@link Routes.stickerPacks} instead.
       */
      nitroStickerPacks() {
        return "/sticker-packs";
      },
      /**
       * Route for:
       * - GET  `/guilds/{guild.id}/stickers`
       * - POST `/guilds/{guild.id}/stickers`
       */
      guildStickers(guildId) {
        return `/guilds/${guildId}/stickers`;
      },
      /**
       * Route for:
       * - GET    `/guilds/{guild.id}/stickers/{sticker.id}`
       * - PATCH  `/guilds/{guild.id}/stickers/{sticker.id}`
       * - DELETE `/guilds/{guild.id}/stickers/{sticker.id}`
       */
      guildSticker(guildId, stickerId) {
        return `/guilds/${guildId}/stickers/${stickerId}`;
      },
      /**
       * Route for:
       * - GET  `/guilds/{guild.id}/scheduled-events`
       * - POST `/guilds/{guild.id}/scheduled-events`
       */
      guildScheduledEvents(guildId) {
        return `/guilds/${guildId}/scheduled-events`;
      },
      /**
       * Route for:
       * - GET  `/guilds/{guild.id}/scheduled-events/{guildScheduledEvent.id}`
       * - PATCH `/guilds/{guild.id}/scheduled-events/{guildScheduledEvent.id}`
       * - DELETE `/guilds/{guild.id}/scheduled-events/{guildScheduledEvent.id}`
       */
      guildScheduledEvent(guildId, guildScheduledEventId) {
        return `/guilds/${guildId}/scheduled-events/${guildScheduledEventId}`;
      },
      /**
       * Route for:
       * - GET `/guilds/{guild.id}/scheduled-events/{guildScheduledEvent.id}/users`
       */
      guildScheduledEventUsers(guildId, guildScheduledEventId) {
        return `/guilds/${guildId}/scheduled-events/${guildScheduledEventId}/users`;
      },
      /**
       * Route for:
       * - GET `/guilds/${guild.id}/onboarding`
       * - PUT `/guilds/${guild.id}/onboarding`
       */
      guildOnboarding(guildId) {
        return `/guilds/${guildId}/onboarding`;
      },
      /**
       * Route for:
       * - GET `/applications/@me`
       * - PATCH `/applications/@me`
       */
      currentApplication() {
        return "/applications/@me";
      },
      /**
       * Route for:
       * - GET `/applications/{application.id}/entitlements`
       * - POST `/applications/{application.id}/entitlements`
       */
      entitlements(applicationId) {
        return `/applications/${applicationId}/entitlements`;
      },
      /**
       * Route for:
       * - DELETE `/applications/{application.id}/entitlements/{entitlement.id}`
       */
      entitlement(applicationId, entitlementId) {
        return `/applications/${applicationId}/entitlements/${entitlementId}`;
      },
      /**
       * Route for:
       * - GET `/applications/{application.id}/skus`
       */
      skus(applicationId) {
        return `/applications/${applicationId}/skus`;
      }
    };
    exports.StickerPackApplicationId = "710982414301790216";
    exports.CDNRoutes = {
      /**
       * Route for:
       * - GET `/emojis/{emoji.id}.{png|jpeg|webp|gif}`
       *
       * As this route supports GIFs, the hash will begin with `a_` if it is available in GIF format
       *
       * This route supports the extensions: PNG, JPEG, WebP, GIF
       */
      emoji(emojiId, format) {
        return `/emojis/${emojiId}.${format}`;
      },
      /**
       * Route for:
       * - GET `/guilds/{guild.id}/icons/{guild.id}.{png|jpeg|webp|gif}`
       *
       * As this route supports GIFs, the hash will begin with `a_` if it is available in GIF format
       *
       * This route supports the extensions: PNG, JPEG, WebP, GIF
       */
      guildIcon(guildId, guildIcon, format) {
        return `icons/${guildId}/${guildIcon}.${format}`;
      },
      /**
       * Route for:
       * - GET `/splashes/{guild.id}/{guild.splash}.{png|jpeg|webp}`
       *
       * This route supports the extensions: PNG, JPEG, WebP
       */
      guildSplash(guildId, guildSplash, format) {
        return `/splashes/${guildId}/${guildSplash}.${format}`;
      },
      /**
       * Route for:
       * - GET `/discovery-splashes/{guild.id}/{guild.discovery_splash}.{png|jpeg|webp}`
       *
       * This route supports the extensions: PNG, JPEG, WebP
       */
      guildDiscoverySplash(guildId, guildDiscoverySplash, format) {
        return `/discovery-splashes/${guildId}/${guildDiscoverySplash}.${format}`;
      },
      /**
       * Route for:
       * - GET `/banners/{guild.id}/{guild.banner}.{png|jpeg|webp|gif}`
       *
       * As this route supports GIFs, the hash will begin with `a_` if it is available in GIF format
       *
       * This route supports the extensions: PNG, JPEG, WebP, GIF
       */
      guildBanner(guildId, guildBanner, format) {
        return `/banners/${guildId}/${guildBanner}.${format}`;
      },
      /**
       * Route for:
       * - GET `/banners/{user.id}/{user.banner}.{png|jpeg|webp|gif}`
       *
       * As this route supports GIFs, the hash will begin with `a_` if it is available in GIF format
       *
       * This route supports the extensions: PNG, JPEG, WebP, GIF
       */
      userBanner(userId, userBanner, format) {
        return `/banners/${userId}/${userBanner}.${format}`;
      },
      /**
       * Route for:
       * - GET `/embed/avatars/{index}.png`
       *
       * The value for `index` parameter depends on whether the user is [migrated to the new username system](https://discord.com/developers/docs/change-log#unique-usernames-on-discord).
       * For users on the new username system, `index` will be `(user.id >> 22) % 6`.
       * For users on the legacy username system, `index` will be `user.discriminator % 5`.
       *
       * This route supports the extension: PNG
       */
      defaultUserAvatar(index2) {
        return `/embed/avatars/${index2}.png`;
      },
      /**
       * Route for:
       * - GET `/avatars/{user.id}/{user.avatar}.{png|jpeg|webp|gif}`
       *
       * As this route supports GIFs, the hash will begin with `a_` if it is available in GIF format
       *
       * This route supports the extensions: PNG, JPEG, WebP, GIF
       */
      userAvatar(userId, userAvatar, format) {
        return `/avatars/${userId}/${userAvatar}.${format}`;
      },
      /**
       * Route for:
       * - GET `/guilds/{guild.id}/users/{user.id}/{guild_member.avatar}.{png|jpeg|webp|gif}`
       *
       * As this route supports GIFs, the hash will begin with `a_` if it is available in GIF format
       *
       * This route supports the extensions: PNG, JPEG, WebP, GIF
       */
      guildMemberAvatar(guildId, userId, memberAvatar, format) {
        return `/guilds/${guildId}/users/${userId}/avatars/${memberAvatar}.${format}`;
      },
      /**
       * Route for:
       * - GET `/avatar-decorations/{user.id}/{user.avatar_decoration}.png`
       *
       * This route supports the extension: PNG
       */
      userAvatarDecoration(userId, userAvatarDecoration) {
        return `/avatar-decorations/${userId}/${userAvatarDecoration}.png`;
      },
      /**
       * Route for:
       * - GET `/app-icons/{application.id}/{application.icon}.{png|jpeg|webp}`
       *
       * This route supports the extensions: PNG, JPEG, WebP
       */
      applicationIcon(applicationId, applicationIcon, format) {
        return `/app-icons/${applicationId}/${applicationIcon}.${format}`;
      },
      /**
       * Route for:
       * - GET `/app-icons/{application.id}/{application.cover_image}.{png|jpeg|webp}`
       *
       * This route supports the extensions: PNG, JPEG, WebP
       */
      applicationCover(applicationId, applicationCoverImage, format) {
        return `/app-icons/${applicationId}/${applicationCoverImage}.${format}`;
      },
      /**
       * Route for:
       * - GET `/app-assets/{application.id}/{application.asset_id}.{png|jpeg|webp}`
       *
       * This route supports the extensions: PNG, JPEG, WebP
       */
      applicationAsset(applicationId, applicationAssetId, format) {
        return `/app-assets/${applicationId}/${applicationAssetId}.${format}`;
      },
      /**
       * Route for:
       * - GET `/app-assets/{application.id}/achievements/{achievement.id}/icons/{achievement.icon}.{png|jpeg|webp}`
       *
       * This route supports the extensions: PNG, JPEG, WebP
       */
      achievementIcon(applicationId, achievementId, achievementIconHash, format) {
        return `/app-assets/${applicationId}/achievements/${achievementId}/icons/${achievementIconHash}.${format}`;
      },
      /**
       * Route for:
       * - GET `/app-assets/710982414301790216/store/{sticker_pack.banner.asset_id}.{png|jpeg|webp}`
       *
       * This route supports the extensions: PNG, JPEG, WebP
       */
      stickerPackBanner(stickerPackBannerAssetId, format) {
        return `/app-assets/${exports.StickerPackApplicationId}/store/${stickerPackBannerAssetId}.${format}`;
      },
      /**
       * Route for:
       * - GET `/app-assets/${application.id}/store/${asset.id}.{png|jpeg|webp}}`
       *
       * This route supports the extensions: PNG, JPEG, WebP
       */
      storePageAsset(applicationId, assetId) {
        return `/app-assets/${applicationId}/store/${assetId}.png`;
      },
      /**
       * Route for:
       * - GET `team-icons/{team.id}/{team.icon}.{png|jpeg|webp}`
       *
       * This route supports the extensions: PNG, JPEG, WebP
       */
      teamIcon(teamId, teamIcon, format) {
        return `/team-icons/${teamId}/${teamIcon}.${format}`;
      },
      /**
       * Route for:
       * - GET `/stickers/{sticker.id}.{png|json}`
       *
       * This route supports the extensions: PNG, Lottie, GIF
       */
      sticker(stickerId, format) {
        return `/stickers/${stickerId}.${format}`;
      },
      /**
       * Route for:
       * - GET `/role-icons/{role.id}/{role.icon}.{png|jpeg|webp}`
       *
       * This route supports the extensions: PNG, JPEG, WebP
       */
      roleIcon(roleId, roleIcon, format) {
        return `/role-icons/${roleId}/${roleIcon}.${format}`;
      },
      /**
       * Route for:
       * - GET `/guild-events/{guild_scheduled_event.id}/{guild_scheduled_event.image}.{png|jpeg|webp}`
       *
       * This route supports the extensions: PNG, JPEG, WebP
       */
      guildScheduledEventCover(guildScheduledEventId, guildScheduledEventCoverImage, format) {
        return `/guild-events/${guildScheduledEventId}/${guildScheduledEventCoverImage}.${format}`;
      },
      /**
       * Route for:
       * - GET `/guilds/${guild.id}/users/${user.id}/banners/${guild_member.banner}.{png|jpeg|webp|gif}`
       *
       * This route supports the extensions: PNG, JPEG, WebP, GIF
       */
      guildMemberBanner(guildId, userId, guildMemberBanner, format) {
        return `/guilds/${guildId}/users/${userId}/banners/${guildMemberBanner}.${format}`;
      }
    };
    var ImageFormat2;
    (function(ImageFormat3) {
      ImageFormat3["JPEG"] = "jpeg";
      ImageFormat3["PNG"] = "png";
      ImageFormat3["WebP"] = "webp";
      ImageFormat3["GIF"] = "gif";
      ImageFormat3["Lottie"] = "json";
    })(ImageFormat2 = exports.ImageFormat || (exports.ImageFormat = {}));
    exports.RouteBases = {
      api: `https://discord.com/api/v${exports.APIVersion}`,
      cdn: "https://cdn.discordapp.com",
      invite: "https://discord.gg",
      template: "https://discord.new",
      gift: "https://discord.gift",
      scheduledEvent: "https://discord.com/events"
    };
    Object.freeze(exports.RouteBases);
    exports.OAuth2Routes = {
      authorizationURL: `${exports.RouteBases.api}${exports.Routes.oauth2Authorization()}`,
      tokenURL: `${exports.RouteBases.api}${exports.Routes.oauth2TokenExchange()}`,
      /**
       * See https://tools.ietf.org/html/rfc7009
       */
      tokenRevocationURL: `${exports.RouteBases.api}${exports.Routes.oauth2TokenRevocation()}`
    };
    Object.freeze(exports.OAuth2Routes);
  }
});

// node_modules/discord-api-types/rpc/common.js
var require_common4 = __commonJS({
  "node_modules/discord-api-types/rpc/common.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RPCCloseEventCodes = exports.RPCErrorCodes = void 0;
    var RPCErrorCodes2;
    (function(RPCErrorCodes3) {
      RPCErrorCodes3[RPCErrorCodes3["UnknownError"] = 1e3] = "UnknownError";
      RPCErrorCodes3[RPCErrorCodes3["InvalidPayload"] = 4e3] = "InvalidPayload";
      RPCErrorCodes3[RPCErrorCodes3["InvalidCommand"] = 4002] = "InvalidCommand";
      RPCErrorCodes3[RPCErrorCodes3["InvalidGuild"] = 4003] = "InvalidGuild";
      RPCErrorCodes3[RPCErrorCodes3["InvalidEvent"] = 4004] = "InvalidEvent";
      RPCErrorCodes3[RPCErrorCodes3["InvalidChannel"] = 4005] = "InvalidChannel";
      RPCErrorCodes3[RPCErrorCodes3["InvalidPermissions"] = 4006] = "InvalidPermissions";
      RPCErrorCodes3[RPCErrorCodes3["InvalidClientId"] = 4007] = "InvalidClientId";
      RPCErrorCodes3[RPCErrorCodes3["InvalidOrigin"] = 4008] = "InvalidOrigin";
      RPCErrorCodes3[RPCErrorCodes3["InvalidToken"] = 4009] = "InvalidToken";
      RPCErrorCodes3[RPCErrorCodes3["InvalidUser"] = 4010] = "InvalidUser";
      RPCErrorCodes3[RPCErrorCodes3["OAuth2Error"] = 5e3] = "OAuth2Error";
      RPCErrorCodes3[RPCErrorCodes3["SelectChannelTimedOut"] = 5001] = "SelectChannelTimedOut";
      RPCErrorCodes3[RPCErrorCodes3["GetGuildTimedOut"] = 5002] = "GetGuildTimedOut";
      RPCErrorCodes3[RPCErrorCodes3["SelectVoiceForceRequired"] = 5003] = "SelectVoiceForceRequired";
      RPCErrorCodes3[RPCErrorCodes3["CaptureShortcutAlreadyListening"] = 5004] = "CaptureShortcutAlreadyListening";
    })(RPCErrorCodes2 = exports.RPCErrorCodes || (exports.RPCErrorCodes = {}));
    var RPCCloseEventCodes2;
    (function(RPCCloseEventCodes3) {
      RPCCloseEventCodes3[RPCCloseEventCodes3["InvalidClientId"] = 4e3] = "InvalidClientId";
      RPCCloseEventCodes3[RPCCloseEventCodes3["InvalidOrigin"] = 4001] = "InvalidOrigin";
      RPCCloseEventCodes3[RPCCloseEventCodes3["RateLimited"] = 4002] = "RateLimited";
      RPCCloseEventCodes3[RPCCloseEventCodes3["TokenRevoked"] = 4003] = "TokenRevoked";
      RPCCloseEventCodes3[RPCCloseEventCodes3["InvalidVersion"] = 4004] = "InvalidVersion";
      RPCCloseEventCodes3[RPCCloseEventCodes3["InvalidEncoding"] = 4005] = "InvalidEncoding";
    })(RPCCloseEventCodes2 = exports.RPCCloseEventCodes || (exports.RPCCloseEventCodes = {}));
  }
});

// node_modules/discord-api-types/rpc/v10.js
var require_v104 = __commonJS({
  "node_modules/discord-api-types/rpc/v10.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_common4(), exports);
  }
});

// node_modules/discord-api-types/utils/v10.js
var require_v105 = __commonJS({
  "node_modules/discord-api-types/utils/v10.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isContextMenuApplicationCommandInteraction = exports.isChatInputApplicationCommandInteraction = exports.isMessageComponentSelectMenuInteraction = exports.isMessageComponentButtonInteraction = exports.isMessageComponentInteraction = exports.isInteractionButton = exports.isLinkButton = exports.isMessageComponentGuildInteraction = exports.isMessageComponentDMInteraction = exports.isApplicationCommandGuildInteraction = exports.isApplicationCommandDMInteraction = exports.isGuildInteraction = exports.isDMInteraction = void 0;
    var index_1 = require_v102();
    function isDMInteraction(interaction) {
      return Reflect.has(interaction, "user");
    }
    exports.isDMInteraction = isDMInteraction;
    function isGuildInteraction(interaction) {
      return Reflect.has(interaction, "guild_id");
    }
    exports.isGuildInteraction = isGuildInteraction;
    function isApplicationCommandDMInteraction(interaction) {
      return isDMInteraction(interaction);
    }
    exports.isApplicationCommandDMInteraction = isApplicationCommandDMInteraction;
    function isApplicationCommandGuildInteraction(interaction) {
      return isGuildInteraction(interaction);
    }
    exports.isApplicationCommandGuildInteraction = isApplicationCommandGuildInteraction;
    function isMessageComponentDMInteraction(interaction) {
      return isDMInteraction(interaction);
    }
    exports.isMessageComponentDMInteraction = isMessageComponentDMInteraction;
    function isMessageComponentGuildInteraction(interaction) {
      return isGuildInteraction(interaction);
    }
    exports.isMessageComponentGuildInteraction = isMessageComponentGuildInteraction;
    function isLinkButton(component) {
      return component.style === index_1.ButtonStyle.Link;
    }
    exports.isLinkButton = isLinkButton;
    function isInteractionButton(component) {
      return component.style !== index_1.ButtonStyle.Link;
    }
    exports.isInteractionButton = isInteractionButton;
    function isMessageComponentInteraction(interaction) {
      return interaction.type === index_1.InteractionType.MessageComponent;
    }
    exports.isMessageComponentInteraction = isMessageComponentInteraction;
    function isMessageComponentButtonInteraction(interaction) {
      return interaction.data.component_type === index_1.ComponentType.Button;
    }
    exports.isMessageComponentButtonInteraction = isMessageComponentButtonInteraction;
    function isMessageComponentSelectMenuInteraction(interaction) {
      return [
        index_1.ComponentType.StringSelect,
        index_1.ComponentType.UserSelect,
        index_1.ComponentType.RoleSelect,
        index_1.ComponentType.MentionableSelect,
        index_1.ComponentType.ChannelSelect
      ].includes(interaction.data.component_type);
    }
    exports.isMessageComponentSelectMenuInteraction = isMessageComponentSelectMenuInteraction;
    function isChatInputApplicationCommandInteraction(interaction) {
      return interaction.data.type === index_1.ApplicationCommandType.ChatInput;
    }
    exports.isChatInputApplicationCommandInteraction = isChatInputApplicationCommandInteraction;
    function isContextMenuApplicationCommandInteraction(interaction) {
      return interaction.data.type === index_1.ApplicationCommandType.Message || interaction.data.type === index_1.ApplicationCommandType.User;
    }
    exports.isContextMenuApplicationCommandInteraction = isContextMenuApplicationCommandInteraction;
  }
});

// node_modules/discord-api-types/v10.js
var require_v106 = __commonJS({
  "node_modules/discord-api-types/v10.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Utils = void 0;
    __exportStar(require_v10(), exports);
    __exportStar(require_globals(), exports);
    __exportStar(require_v102(), exports);
    __exportStar(require_v103(), exports);
    __exportStar(require_v104(), exports);
    exports.Utils = require_v105();
  }
});

// node_modules/react-is/cjs/react-is.development.js
var require_react_is_development = __commonJS({
  "node_modules/react-is/cjs/react-is.development.js"(exports) {
    "use strict";
    if (true) {
      (function() {
        "use strict";
        var hasSymbol = typeof Symbol === "function" && Symbol.for;
        var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for("react.element") : 60103;
        var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for("react.portal") : 60106;
        var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for("react.fragment") : 60107;
        var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for("react.strict_mode") : 60108;
        var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for("react.profiler") : 60114;
        var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for("react.provider") : 60109;
        var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for("react.context") : 60110;
        var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for("react.async_mode") : 60111;
        var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for("react.concurrent_mode") : 60111;
        var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for("react.forward_ref") : 60112;
        var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for("react.suspense") : 60113;
        var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for("react.suspense_list") : 60120;
        var REACT_MEMO_TYPE = hasSymbol ? Symbol.for("react.memo") : 60115;
        var REACT_LAZY_TYPE = hasSymbol ? Symbol.for("react.lazy") : 60116;
        var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for("react.block") : 60121;
        var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for("react.fundamental") : 60117;
        var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for("react.responder") : 60118;
        var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for("react.scope") : 60119;
        function isValidElementType(type) {
          return typeof type === "string" || typeof type === "function" || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
          type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === "object" && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
        }
        function typeOf(object) {
          if (typeof object === "object" && object !== null) {
            var $$typeof = object.$$typeof;
            switch ($$typeof) {
              case REACT_ELEMENT_TYPE:
                var type = object.type;
                switch (type) {
                  case REACT_ASYNC_MODE_TYPE:
                  case REACT_CONCURRENT_MODE_TYPE:
                  case REACT_FRAGMENT_TYPE:
                  case REACT_PROFILER_TYPE:
                  case REACT_STRICT_MODE_TYPE:
                  case REACT_SUSPENSE_TYPE:
                    return type;
                  default:
                    var $$typeofType = type && type.$$typeof;
                    switch ($$typeofType) {
                      case REACT_CONTEXT_TYPE:
                      case REACT_FORWARD_REF_TYPE:
                      case REACT_LAZY_TYPE:
                      case REACT_MEMO_TYPE:
                      case REACT_PROVIDER_TYPE:
                        return $$typeofType;
                      default:
                        return $$typeof;
                    }
                }
              case REACT_PORTAL_TYPE:
                return $$typeof;
            }
          }
          return void 0;
        }
        var AsyncMode = REACT_ASYNC_MODE_TYPE;
        var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
        var ContextConsumer = REACT_CONTEXT_TYPE;
        var ContextProvider = REACT_PROVIDER_TYPE;
        var Element3 = REACT_ELEMENT_TYPE;
        var ForwardRef = REACT_FORWARD_REF_TYPE;
        var Fragment4 = REACT_FRAGMENT_TYPE;
        var Lazy = REACT_LAZY_TYPE;
        var Memo = REACT_MEMO_TYPE;
        var Portal = REACT_PORTAL_TYPE;
        var Profiler = REACT_PROFILER_TYPE;
        var StrictMode = REACT_STRICT_MODE_TYPE;
        var Suspense = REACT_SUSPENSE_TYPE;
        var hasWarnedAboutDeprecatedIsAsyncMode = false;
        function isAsyncMode(object) {
          {
            if (!hasWarnedAboutDeprecatedIsAsyncMode) {
              hasWarnedAboutDeprecatedIsAsyncMode = true;
              console["warn"]("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 17+. Update your code to use ReactIs.isConcurrentMode() instead. It has the exact same API.");
            }
          }
          return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
        }
        function isConcurrentMode(object) {
          return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
        }
        function isContextConsumer(object) {
          return typeOf(object) === REACT_CONTEXT_TYPE;
        }
        function isContextProvider(object) {
          return typeOf(object) === REACT_PROVIDER_TYPE;
        }
        function isElement2(object) {
          return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
        }
        function isForwardRef(object) {
          return typeOf(object) === REACT_FORWARD_REF_TYPE;
        }
        function isFragment(object) {
          return typeOf(object) === REACT_FRAGMENT_TYPE;
        }
        function isLazy(object) {
          return typeOf(object) === REACT_LAZY_TYPE;
        }
        function isMemo(object) {
          return typeOf(object) === REACT_MEMO_TYPE;
        }
        function isPortal(object) {
          return typeOf(object) === REACT_PORTAL_TYPE;
        }
        function isProfiler(object) {
          return typeOf(object) === REACT_PROFILER_TYPE;
        }
        function isStrictMode(object) {
          return typeOf(object) === REACT_STRICT_MODE_TYPE;
        }
        function isSuspense(object) {
          return typeOf(object) === REACT_SUSPENSE_TYPE;
        }
        exports.AsyncMode = AsyncMode;
        exports.ConcurrentMode = ConcurrentMode;
        exports.ContextConsumer = ContextConsumer;
        exports.ContextProvider = ContextProvider;
        exports.Element = Element3;
        exports.ForwardRef = ForwardRef;
        exports.Fragment = Fragment4;
        exports.Lazy = Lazy;
        exports.Memo = Memo;
        exports.Portal = Portal;
        exports.Profiler = Profiler;
        exports.StrictMode = StrictMode;
        exports.Suspense = Suspense;
        exports.isAsyncMode = isAsyncMode;
        exports.isConcurrentMode = isConcurrentMode;
        exports.isContextConsumer = isContextConsumer;
        exports.isContextProvider = isContextProvider;
        exports.isElement = isElement2;
        exports.isForwardRef = isForwardRef;
        exports.isFragment = isFragment;
        exports.isLazy = isLazy;
        exports.isMemo = isMemo;
        exports.isPortal = isPortal;
        exports.isProfiler = isProfiler;
        exports.isStrictMode = isStrictMode;
        exports.isSuspense = isSuspense;
        exports.isValidElementType = isValidElementType;
        exports.typeOf = typeOf;
      })();
    }
  }
});

// node_modules/react-is/index.js
var require_react_is = __commonJS({
  "node_modules/react-is/index.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_react_is_development();
    }
  }
});

// node_modules/hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js
var require_hoist_non_react_statics_cjs = __commonJS({
  "node_modules/hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js"(exports, module) {
    "use strict";
    var reactIs = require_react_is();
    var REACT_STATICS = {
      childContextTypes: true,
      contextType: true,
      contextTypes: true,
      defaultProps: true,
      displayName: true,
      getDefaultProps: true,
      getDerivedStateFromError: true,
      getDerivedStateFromProps: true,
      mixins: true,
      propTypes: true,
      type: true
    };
    var KNOWN_STATICS = {
      name: true,
      length: true,
      prototype: true,
      caller: true,
      callee: true,
      arguments: true,
      arity: true
    };
    var FORWARD_REF_STATICS = {
      "$$typeof": true,
      render: true,
      defaultProps: true,
      displayName: true,
      propTypes: true
    };
    var MEMO_STATICS = {
      "$$typeof": true,
      compare: true,
      defaultProps: true,
      displayName: true,
      propTypes: true,
      type: true
    };
    var TYPE_STATICS = {};
    TYPE_STATICS[reactIs.ForwardRef] = FORWARD_REF_STATICS;
    TYPE_STATICS[reactIs.Memo] = MEMO_STATICS;
    function getStatics(component) {
      if (reactIs.isMemo(component)) {
        return MEMO_STATICS;
      }
      return TYPE_STATICS[component["$$typeof"]] || REACT_STATICS;
    }
    var defineProperty = Object.defineProperty;
    var getOwnPropertyNames = Object.getOwnPropertyNames;
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var getPrototypeOf = Object.getPrototypeOf;
    var objectPrototype = Object.prototype;
    function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
      if (typeof sourceComponent !== "string") {
        if (objectPrototype) {
          var inheritedComponent = getPrototypeOf(sourceComponent);
          if (inheritedComponent && inheritedComponent !== objectPrototype) {
            hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
          }
        }
        var keys = getOwnPropertyNames(sourceComponent);
        if (getOwnPropertySymbols) {
          keys = keys.concat(getOwnPropertySymbols(sourceComponent));
        }
        var targetStatics = getStatics(targetComponent);
        var sourceStatics = getStatics(sourceComponent);
        for (var i = 0; i < keys.length; ++i) {
          var key = keys[i];
          if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
            var descriptor = getOwnPropertyDescriptor(sourceComponent, key);
            try {
              defineProperty(targetComponent, key, descriptor);
            } catch (e) {
            }
          }
        }
      }
      return targetComponent;
    }
    module.exports = hoistNonReactStatics;
  }
});

// node_modules/showdown/dist/showdown.js
var require_showdown = __commonJS({
  "node_modules/showdown/dist/showdown.js"(exports, module) {
    (function() {
      function getDefaultOpts(simple) {
        "use strict";
        var defaultOptions = {
          omitExtraWLInCodeBlocks: {
            defaultValue: false,
            describe: "Omit the default extra whiteline added to code blocks",
            type: "boolean"
          },
          noHeaderId: {
            defaultValue: false,
            describe: "Turn on/off generated header id",
            type: "boolean"
          },
          prefixHeaderId: {
            defaultValue: false,
            describe: "Add a prefix to the generated header ids. Passing a string will prefix that string to the header id. Setting to true will add a generic 'section-' prefix",
            type: "string"
          },
          rawPrefixHeaderId: {
            defaultValue: false,
            describe: 'Setting this option to true will prevent showdown from modifying the prefix. This might result in malformed IDs (if, for instance, the " char is used in the prefix)',
            type: "boolean"
          },
          ghCompatibleHeaderId: {
            defaultValue: false,
            describe: "Generate header ids compatible with github style (spaces are replaced with dashes, a bunch of non alphanumeric chars are removed)",
            type: "boolean"
          },
          rawHeaderId: {
            defaultValue: false,
            describe: `Remove only spaces, ' and " from generated header ids (including prefixes), replacing them with dashes (-). WARNING: This might result in malformed ids`,
            type: "boolean"
          },
          headerLevelStart: {
            defaultValue: false,
            describe: "The header blocks level start",
            type: "integer"
          },
          parseImgDimensions: {
            defaultValue: false,
            describe: "Turn on/off image dimension parsing",
            type: "boolean"
          },
          simplifiedAutoLink: {
            defaultValue: false,
            describe: "Turn on/off GFM autolink style",
            type: "boolean"
          },
          excludeTrailingPunctuationFromURLs: {
            defaultValue: false,
            describe: "Excludes trailing punctuation from links generated with autoLinking",
            type: "boolean"
          },
          literalMidWordUnderscores: {
            defaultValue: false,
            describe: "Parse midword underscores as literal underscores",
            type: "boolean"
          },
          literalMidWordAsterisks: {
            defaultValue: false,
            describe: "Parse midword asterisks as literal asterisks",
            type: "boolean"
          },
          strikethrough: {
            defaultValue: false,
            describe: "Turn on/off strikethrough support",
            type: "boolean"
          },
          tables: {
            defaultValue: false,
            describe: "Turn on/off tables support",
            type: "boolean"
          },
          tablesHeaderId: {
            defaultValue: false,
            describe: "Add an id to table headers",
            type: "boolean"
          },
          ghCodeBlocks: {
            defaultValue: true,
            describe: "Turn on/off GFM fenced code blocks support",
            type: "boolean"
          },
          tasklists: {
            defaultValue: false,
            describe: "Turn on/off GFM tasklist support",
            type: "boolean"
          },
          smoothLivePreview: {
            defaultValue: false,
            describe: "Prevents weird effects in live previews due to incomplete input",
            type: "boolean"
          },
          smartIndentationFix: {
            defaultValue: false,
            description: "Tries to smartly fix indentation in es6 strings",
            type: "boolean"
          },
          disableForced4SpacesIndentedSublists: {
            defaultValue: false,
            description: "Disables the requirement of indenting nested sublists by 4 spaces",
            type: "boolean"
          },
          simpleLineBreaks: {
            defaultValue: false,
            description: "Parses simple line breaks as <br> (GFM Style)",
            type: "boolean"
          },
          requireSpaceBeforeHeadingText: {
            defaultValue: false,
            description: "Makes adding a space between `#` and the header text mandatory (GFM Style)",
            type: "boolean"
          },
          ghMentions: {
            defaultValue: false,
            description: "Enables github @mentions",
            type: "boolean"
          },
          ghMentionsLink: {
            defaultValue: "https://github.com/{u}",
            description: "Changes the link generated by @mentions. Only applies if ghMentions option is enabled.",
            type: "string"
          },
          encodeEmails: {
            defaultValue: true,
            description: "Encode e-mail addresses through the use of Character Entities, transforming ASCII e-mail addresses into its equivalent decimal entities",
            type: "boolean"
          },
          openLinksInNewWindow: {
            defaultValue: false,
            description: "Open all links in new windows",
            type: "boolean"
          },
          backslashEscapesHTMLTags: {
            defaultValue: false,
            description: "Support for HTML Tag escaping. ex: <div>foo</div>",
            type: "boolean"
          },
          emoji: {
            defaultValue: false,
            description: "Enable emoji support. Ex: `this is a :smile: emoji`",
            type: "boolean"
          },
          underline: {
            defaultValue: false,
            description: "Enable support for underline. Syntax is double or triple underscores: `__underline word__`. With this option enabled, underscores no longer parses into `<em>` and `<strong>`",
            type: "boolean"
          },
          completeHTMLDocument: {
            defaultValue: false,
            description: "Outputs a complete html document, including `<html>`, `<head>` and `<body>` tags",
            type: "boolean"
          },
          metadata: {
            defaultValue: false,
            description: "Enable support for document metadata (defined at the top of the document between `\xAB\xAB\xAB` and `\xBB\xBB\xBB` or between `---` and `---`).",
            type: "boolean"
          },
          splitAdjacentBlockquotes: {
            defaultValue: false,
            description: "Split adjacent blockquote blocks",
            type: "boolean"
          }
        };
        if (simple === false) {
          return JSON.parse(JSON.stringify(defaultOptions));
        }
        var ret = {};
        for (var opt in defaultOptions) {
          if (defaultOptions.hasOwnProperty(opt)) {
            ret[opt] = defaultOptions[opt].defaultValue;
          }
        }
        return ret;
      }
      function allOptionsOn() {
        "use strict";
        var options2 = getDefaultOpts(true), ret = {};
        for (var opt in options2) {
          if (options2.hasOwnProperty(opt)) {
            ret[opt] = true;
          }
        }
        return ret;
      }
      var showdown = {}, parsers = {}, extensions = {}, globalOptions = getDefaultOpts(true), setFlavor2 = "vanilla", flavor = {
        github: {
          omitExtraWLInCodeBlocks: true,
          simplifiedAutoLink: true,
          excludeTrailingPunctuationFromURLs: true,
          literalMidWordUnderscores: true,
          strikethrough: true,
          tables: true,
          tablesHeaderId: true,
          ghCodeBlocks: true,
          tasklists: true,
          disableForced4SpacesIndentedSublists: true,
          simpleLineBreaks: true,
          requireSpaceBeforeHeadingText: true,
          ghCompatibleHeaderId: true,
          ghMentions: true,
          backslashEscapesHTMLTags: true,
          emoji: true,
          splitAdjacentBlockquotes: true
        },
        original: {
          noHeaderId: true,
          ghCodeBlocks: false
        },
        ghost: {
          omitExtraWLInCodeBlocks: true,
          parseImgDimensions: true,
          simplifiedAutoLink: true,
          excludeTrailingPunctuationFromURLs: true,
          literalMidWordUnderscores: true,
          strikethrough: true,
          tables: true,
          tablesHeaderId: true,
          ghCodeBlocks: true,
          tasklists: true,
          smoothLivePreview: true,
          simpleLineBreaks: true,
          requireSpaceBeforeHeadingText: true,
          ghMentions: false,
          encodeEmails: true
        },
        vanilla: getDefaultOpts(true),
        allOn: allOptionsOn()
      };
      showdown.helper = {};
      showdown.extensions = {};
      showdown.setOption = function(key, value) {
        "use strict";
        globalOptions[key] = value;
        return this;
      };
      showdown.getOption = function(key) {
        "use strict";
        return globalOptions[key];
      };
      showdown.getOptions = function() {
        "use strict";
        return globalOptions;
      };
      showdown.resetOptions = function() {
        "use strict";
        globalOptions = getDefaultOpts(true);
      };
      showdown.setFlavor = function(name) {
        "use strict";
        if (!flavor.hasOwnProperty(name)) {
          throw Error(name + " flavor was not found");
        }
        showdown.resetOptions();
        var preset = flavor[name];
        setFlavor2 = name;
        for (var option in preset) {
          if (preset.hasOwnProperty(option)) {
            globalOptions[option] = preset[option];
          }
        }
      };
      showdown.getFlavor = function() {
        "use strict";
        return setFlavor2;
      };
      showdown.getFlavorOptions = function(name) {
        "use strict";
        if (flavor.hasOwnProperty(name)) {
          return flavor[name];
        }
      };
      showdown.getDefaultOptions = function(simple) {
        "use strict";
        return getDefaultOpts(simple);
      };
      showdown.subParser = function(name, func) {
        "use strict";
        if (showdown.helper.isString(name)) {
          if (typeof func !== "undefined") {
            parsers[name] = func;
          } else {
            if (parsers.hasOwnProperty(name)) {
              return parsers[name];
            } else {
              throw Error("SubParser named " + name + " not registered!");
            }
          }
        }
      };
      showdown.extension = function(name, ext) {
        "use strict";
        if (!showdown.helper.isString(name)) {
          throw Error("Extension 'name' must be a string");
        }
        name = showdown.helper.stdExtName(name);
        if (showdown.helper.isUndefined(ext)) {
          if (!extensions.hasOwnProperty(name)) {
            throw Error("Extension named " + name + " is not registered!");
          }
          return extensions[name];
        } else {
          if (typeof ext === "function") {
            ext = ext();
          }
          if (!showdown.helper.isArray(ext)) {
            ext = [ext];
          }
          var validExtension = validate(ext, name);
          if (validExtension.valid) {
            extensions[name] = ext;
          } else {
            throw Error(validExtension.error);
          }
        }
      };
      showdown.getAllExtensions = function() {
        "use strict";
        return extensions;
      };
      showdown.removeExtension = function(name) {
        "use strict";
        delete extensions[name];
      };
      showdown.resetExtensions = function() {
        "use strict";
        extensions = {};
      };
      function validate(extension2, name) {
        "use strict";
        var errMsg = name ? "Error in " + name + " extension->" : "Error in unnamed extension", ret = {
          valid: true,
          error: ""
        };
        if (!showdown.helper.isArray(extension2)) {
          extension2 = [extension2];
        }
        for (var i = 0; i < extension2.length; ++i) {
          var baseMsg = errMsg + " sub-extension " + i + ": ", ext = extension2[i];
          if (typeof ext !== "object") {
            ret.valid = false;
            ret.error = baseMsg + "must be an object, but " + typeof ext + " given";
            return ret;
          }
          if (!showdown.helper.isString(ext.type)) {
            ret.valid = false;
            ret.error = baseMsg + 'property "type" must be a string, but ' + typeof ext.type + " given";
            return ret;
          }
          var type = ext.type = ext.type.toLowerCase();
          if (type === "language") {
            type = ext.type = "lang";
          }
          if (type === "html") {
            type = ext.type = "output";
          }
          if (type !== "lang" && type !== "output" && type !== "listener") {
            ret.valid = false;
            ret.error = baseMsg + "type " + type + ' is not recognized. Valid values: "lang/language", "output/html" or "listener"';
            return ret;
          }
          if (type === "listener") {
            if (showdown.helper.isUndefined(ext.listeners)) {
              ret.valid = false;
              ret.error = baseMsg + '. Extensions of type "listener" must have a property called "listeners"';
              return ret;
            }
          } else {
            if (showdown.helper.isUndefined(ext.filter) && showdown.helper.isUndefined(ext.regex)) {
              ret.valid = false;
              ret.error = baseMsg + type + ' extensions must define either a "regex" property or a "filter" method';
              return ret;
            }
          }
          if (ext.listeners) {
            if (typeof ext.listeners !== "object") {
              ret.valid = false;
              ret.error = baseMsg + '"listeners" property must be an object but ' + typeof ext.listeners + " given";
              return ret;
            }
            for (var ln in ext.listeners) {
              if (ext.listeners.hasOwnProperty(ln)) {
                if (typeof ext.listeners[ln] !== "function") {
                  ret.valid = false;
                  ret.error = baseMsg + '"listeners" property must be an hash of [event name]: [callback]. listeners.' + ln + " must be a function but " + typeof ext.listeners[ln] + " given";
                  return ret;
                }
              }
            }
          }
          if (ext.filter) {
            if (typeof ext.filter !== "function") {
              ret.valid = false;
              ret.error = baseMsg + '"filter" must be a function, but ' + typeof ext.filter + " given";
              return ret;
            }
          } else if (ext.regex) {
            if (showdown.helper.isString(ext.regex)) {
              ext.regex = new RegExp(ext.regex, "g");
            }
            if (!(ext.regex instanceof RegExp)) {
              ret.valid = false;
              ret.error = baseMsg + '"regex" property must either be a string or a RegExp object, but ' + typeof ext.regex + " given";
              return ret;
            }
            if (showdown.helper.isUndefined(ext.replace)) {
              ret.valid = false;
              ret.error = baseMsg + '"regex" extensions must implement a replace string or function';
              return ret;
            }
          }
        }
        return ret;
      }
      showdown.validateExtension = function(ext) {
        "use strict";
        var validateExtension = validate(ext, null);
        if (!validateExtension.valid) {
          console.warn(validateExtension.error);
          return false;
        }
        return true;
      };
      if (!showdown.hasOwnProperty("helper")) {
        showdown.helper = {};
      }
      showdown.helper.isString = function(a) {
        "use strict";
        return typeof a === "string" || a instanceof String;
      };
      showdown.helper.isFunction = function(a) {
        "use strict";
        var getType = {};
        return a && getType.toString.call(a) === "[object Function]";
      };
      showdown.helper.isArray = function(a) {
        "use strict";
        return Array.isArray(a);
      };
      showdown.helper.isUndefined = function(value) {
        "use strict";
        return typeof value === "undefined";
      };
      showdown.helper.forEach = function(obj, callback) {
        "use strict";
        if (showdown.helper.isUndefined(obj)) {
          throw new Error("obj param is required");
        }
        if (showdown.helper.isUndefined(callback)) {
          throw new Error("callback param is required");
        }
        if (!showdown.helper.isFunction(callback)) {
          throw new Error("callback param must be a function/closure");
        }
        if (typeof obj.forEach === "function") {
          obj.forEach(callback);
        } else if (showdown.helper.isArray(obj)) {
          for (var i = 0; i < obj.length; i++) {
            callback(obj[i], i, obj);
          }
        } else if (typeof obj === "object") {
          for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
              callback(obj[prop], prop, obj);
            }
          }
        } else {
          throw new Error("obj does not seem to be an array or an iterable object");
        }
      };
      showdown.helper.stdExtName = function(s) {
        "use strict";
        return s.replace(/[_?*+\/\\.^-]/g, "").replace(/\s/g, "").toLowerCase();
      };
      function escapeCharactersCallback(wholeMatch, m1) {
        "use strict";
        var charCodeToEscape = m1.charCodeAt(0);
        return "\xA8E" + charCodeToEscape + "E";
      }
      showdown.helper.escapeCharactersCallback = escapeCharactersCallback;
      showdown.helper.escapeCharacters = function(text, charsToEscape, afterBackslash) {
        "use strict";
        var regexString = "([" + charsToEscape.replace(/([\[\]\\])/g, "\\$1") + "])";
        if (afterBackslash) {
          regexString = "\\\\" + regexString;
        }
        var regex = new RegExp(regexString, "g");
        text = text.replace(regex, escapeCharactersCallback);
        return text;
      };
      showdown.helper.unescapeHTMLEntities = function(txt) {
        "use strict";
        return txt.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
      };
      var rgxFindMatchPos = function(str, left, right, flags) {
        "use strict";
        var f = flags || "", g = f.indexOf("g") > -1, x = new RegExp(left + "|" + right, "g" + f.replace(/g/g, "")), l = new RegExp(left, f.replace(/g/g, "")), pos = [], t, s, m, start, end;
        do {
          t = 0;
          while (m = x.exec(str)) {
            if (l.test(m[0])) {
              if (!t++) {
                s = x.lastIndex;
                start = s - m[0].length;
              }
            } else if (t) {
              if (!--t) {
                end = m.index + m[0].length;
                var obj = {
                  left: { start, end: s },
                  match: { start: s, end: m.index },
                  right: { start: m.index, end },
                  wholeMatch: { start, end }
                };
                pos.push(obj);
                if (!g) {
                  return pos;
                }
              }
            }
          }
        } while (t && (x.lastIndex = s));
        return pos;
      };
      showdown.helper.matchRecursiveRegExp = function(str, left, right, flags) {
        "use strict";
        var matchPos = rgxFindMatchPos(str, left, right, flags), results = [];
        for (var i = 0; i < matchPos.length; ++i) {
          results.push([
            str.slice(matchPos[i].wholeMatch.start, matchPos[i].wholeMatch.end),
            str.slice(matchPos[i].match.start, matchPos[i].match.end),
            str.slice(matchPos[i].left.start, matchPos[i].left.end),
            str.slice(matchPos[i].right.start, matchPos[i].right.end)
          ]);
        }
        return results;
      };
      showdown.helper.replaceRecursiveRegExp = function(str, replacement, left, right, flags) {
        "use strict";
        if (!showdown.helper.isFunction(replacement)) {
          var repStr = replacement;
          replacement = function() {
            return repStr;
          };
        }
        var matchPos = rgxFindMatchPos(str, left, right, flags), finalStr = str, lng = matchPos.length;
        if (lng > 0) {
          var bits = [];
          if (matchPos[0].wholeMatch.start !== 0) {
            bits.push(str.slice(0, matchPos[0].wholeMatch.start));
          }
          for (var i = 0; i < lng; ++i) {
            bits.push(
              replacement(
                str.slice(matchPos[i].wholeMatch.start, matchPos[i].wholeMatch.end),
                str.slice(matchPos[i].match.start, matchPos[i].match.end),
                str.slice(matchPos[i].left.start, matchPos[i].left.end),
                str.slice(matchPos[i].right.start, matchPos[i].right.end)
              )
            );
            if (i < lng - 1) {
              bits.push(str.slice(matchPos[i].wholeMatch.end, matchPos[i + 1].wholeMatch.start));
            }
          }
          if (matchPos[lng - 1].wholeMatch.end < str.length) {
            bits.push(str.slice(matchPos[lng - 1].wholeMatch.end));
          }
          finalStr = bits.join("");
        }
        return finalStr;
      };
      showdown.helper.regexIndexOf = function(str, regex, fromIndex) {
        "use strict";
        if (!showdown.helper.isString(str)) {
          throw "InvalidArgumentError: first parameter of showdown.helper.regexIndexOf function must be a string";
        }
        if (regex instanceof RegExp === false) {
          throw "InvalidArgumentError: second parameter of showdown.helper.regexIndexOf function must be an instance of RegExp";
        }
        var indexOf = str.substring(fromIndex || 0).search(regex);
        return indexOf >= 0 ? indexOf + (fromIndex || 0) : indexOf;
      };
      showdown.helper.splitAtIndex = function(str, index2) {
        "use strict";
        if (!showdown.helper.isString(str)) {
          throw "InvalidArgumentError: first parameter of showdown.helper.regexIndexOf function must be a string";
        }
        return [str.substring(0, index2), str.substring(index2)];
      };
      showdown.helper.encodeEmailAddress = function(mail) {
        "use strict";
        var encode = [
          function(ch) {
            return "&#" + ch.charCodeAt(0) + ";";
          },
          function(ch) {
            return "&#x" + ch.charCodeAt(0).toString(16) + ";";
          },
          function(ch) {
            return ch;
          }
        ];
        mail = mail.replace(/./g, function(ch) {
          if (ch === "@") {
            ch = encode[Math.floor(Math.random() * 2)](ch);
          } else {
            var r = Math.random();
            ch = r > 0.9 ? encode[2](ch) : r > 0.45 ? encode[1](ch) : encode[0](ch);
          }
          return ch;
        });
        return mail;
      };
      showdown.helper.padEnd = function padEnd(str, targetLength, padString) {
        "use strict";
        targetLength = targetLength >> 0;
        padString = String(padString || " ");
        if (str.length > targetLength) {
          return String(str);
        } else {
          targetLength = targetLength - str.length;
          if (targetLength > padString.length) {
            padString += padString.repeat(targetLength / padString.length);
          }
          return String(str) + padString.slice(0, targetLength);
        }
      };
      if (typeof console === "undefined") {
        console = {
          warn: function(msg) {
            "use strict";
            alert(msg);
          },
          log: function(msg) {
            "use strict";
            alert(msg);
          },
          error: function(msg) {
            "use strict";
            throw msg;
          }
        };
      }
      showdown.helper.regexes = {
        asteriskDashAndColon: /([*_:~])/g
      };
      showdown.helper.emojis = {
        "+1": "\u{1F44D}",
        "-1": "\u{1F44E}",
        "100": "\u{1F4AF}",
        "1234": "\u{1F522}",
        "1st_place_medal": "\u{1F947}",
        "2nd_place_medal": "\u{1F948}",
        "3rd_place_medal": "\u{1F949}",
        "8ball": "\u{1F3B1}",
        "a": "\u{1F170}\uFE0F",
        "ab": "\u{1F18E}",
        "abc": "\u{1F524}",
        "abcd": "\u{1F521}",
        "accept": "\u{1F251}",
        "aerial_tramway": "\u{1F6A1}",
        "airplane": "\u2708\uFE0F",
        "alarm_clock": "\u23F0",
        "alembic": "\u2697\uFE0F",
        "alien": "\u{1F47D}",
        "ambulance": "\u{1F691}",
        "amphora": "\u{1F3FA}",
        "anchor": "\u2693\uFE0F",
        "angel": "\u{1F47C}",
        "anger": "\u{1F4A2}",
        "angry": "\u{1F620}",
        "anguished": "\u{1F627}",
        "ant": "\u{1F41C}",
        "apple": "\u{1F34E}",
        "aquarius": "\u2652\uFE0F",
        "aries": "\u2648\uFE0F",
        "arrow_backward": "\u25C0\uFE0F",
        "arrow_double_down": "\u23EC",
        "arrow_double_up": "\u23EB",
        "arrow_down": "\u2B07\uFE0F",
        "arrow_down_small": "\u{1F53D}",
        "arrow_forward": "\u25B6\uFE0F",
        "arrow_heading_down": "\u2935\uFE0F",
        "arrow_heading_up": "\u2934\uFE0F",
        "arrow_left": "\u2B05\uFE0F",
        "arrow_lower_left": "\u2199\uFE0F",
        "arrow_lower_right": "\u2198\uFE0F",
        "arrow_right": "\u27A1\uFE0F",
        "arrow_right_hook": "\u21AA\uFE0F",
        "arrow_up": "\u2B06\uFE0F",
        "arrow_up_down": "\u2195\uFE0F",
        "arrow_up_small": "\u{1F53C}",
        "arrow_upper_left": "\u2196\uFE0F",
        "arrow_upper_right": "\u2197\uFE0F",
        "arrows_clockwise": "\u{1F503}",
        "arrows_counterclockwise": "\u{1F504}",
        "art": "\u{1F3A8}",
        "articulated_lorry": "\u{1F69B}",
        "artificial_satellite": "\u{1F6F0}",
        "astonished": "\u{1F632}",
        "athletic_shoe": "\u{1F45F}",
        "atm": "\u{1F3E7}",
        "atom_symbol": "\u269B\uFE0F",
        "avocado": "\u{1F951}",
        "b": "\u{1F171}\uFE0F",
        "baby": "\u{1F476}",
        "baby_bottle": "\u{1F37C}",
        "baby_chick": "\u{1F424}",
        "baby_symbol": "\u{1F6BC}",
        "back": "\u{1F519}",
        "bacon": "\u{1F953}",
        "badminton": "\u{1F3F8}",
        "baggage_claim": "\u{1F6C4}",
        "baguette_bread": "\u{1F956}",
        "balance_scale": "\u2696\uFE0F",
        "balloon": "\u{1F388}",
        "ballot_box": "\u{1F5F3}",
        "ballot_box_with_check": "\u2611\uFE0F",
        "bamboo": "\u{1F38D}",
        "banana": "\u{1F34C}",
        "bangbang": "\u203C\uFE0F",
        "bank": "\u{1F3E6}",
        "bar_chart": "\u{1F4CA}",
        "barber": "\u{1F488}",
        "baseball": "\u26BE\uFE0F",
        "basketball": "\u{1F3C0}",
        "basketball_man": "\u26F9\uFE0F",
        "basketball_woman": "\u26F9\uFE0F&zwj;\u2640\uFE0F",
        "bat": "\u{1F987}",
        "bath": "\u{1F6C0}",
        "bathtub": "\u{1F6C1}",
        "battery": "\u{1F50B}",
        "beach_umbrella": "\u{1F3D6}",
        "bear": "\u{1F43B}",
        "bed": "\u{1F6CF}",
        "bee": "\u{1F41D}",
        "beer": "\u{1F37A}",
        "beers": "\u{1F37B}",
        "beetle": "\u{1F41E}",
        "beginner": "\u{1F530}",
        "bell": "\u{1F514}",
        "bellhop_bell": "\u{1F6CE}",
        "bento": "\u{1F371}",
        "biking_man": "\u{1F6B4}",
        "bike": "\u{1F6B2}",
        "biking_woman": "\u{1F6B4}&zwj;\u2640\uFE0F",
        "bikini": "\u{1F459}",
        "biohazard": "\u2623\uFE0F",
        "bird": "\u{1F426}",
        "birthday": "\u{1F382}",
        "black_circle": "\u26AB\uFE0F",
        "black_flag": "\u{1F3F4}",
        "black_heart": "\u{1F5A4}",
        "black_joker": "\u{1F0CF}",
        "black_large_square": "\u2B1B\uFE0F",
        "black_medium_small_square": "\u25FE\uFE0F",
        "black_medium_square": "\u25FC\uFE0F",
        "black_nib": "\u2712\uFE0F",
        "black_small_square": "\u25AA\uFE0F",
        "black_square_button": "\u{1F532}",
        "blonde_man": "\u{1F471}",
        "blonde_woman": "\u{1F471}&zwj;\u2640\uFE0F",
        "blossom": "\u{1F33C}",
        "blowfish": "\u{1F421}",
        "blue_book": "\u{1F4D8}",
        "blue_car": "\u{1F699}",
        "blue_heart": "\u{1F499}",
        "blush": "\u{1F60A}",
        "boar": "\u{1F417}",
        "boat": "\u26F5\uFE0F",
        "bomb": "\u{1F4A3}",
        "book": "\u{1F4D6}",
        "bookmark": "\u{1F516}",
        "bookmark_tabs": "\u{1F4D1}",
        "books": "\u{1F4DA}",
        "boom": "\u{1F4A5}",
        "boot": "\u{1F462}",
        "bouquet": "\u{1F490}",
        "bowing_man": "\u{1F647}",
        "bow_and_arrow": "\u{1F3F9}",
        "bowing_woman": "\u{1F647}&zwj;\u2640\uFE0F",
        "bowling": "\u{1F3B3}",
        "boxing_glove": "\u{1F94A}",
        "boy": "\u{1F466}",
        "bread": "\u{1F35E}",
        "bride_with_veil": "\u{1F470}",
        "bridge_at_night": "\u{1F309}",
        "briefcase": "\u{1F4BC}",
        "broken_heart": "\u{1F494}",
        "bug": "\u{1F41B}",
        "building_construction": "\u{1F3D7}",
        "bulb": "\u{1F4A1}",
        "bullettrain_front": "\u{1F685}",
        "bullettrain_side": "\u{1F684}",
        "burrito": "\u{1F32F}",
        "bus": "\u{1F68C}",
        "business_suit_levitating": "\u{1F574}",
        "busstop": "\u{1F68F}",
        "bust_in_silhouette": "\u{1F464}",
        "busts_in_silhouette": "\u{1F465}",
        "butterfly": "\u{1F98B}",
        "cactus": "\u{1F335}",
        "cake": "\u{1F370}",
        "calendar": "\u{1F4C6}",
        "call_me_hand": "\u{1F919}",
        "calling": "\u{1F4F2}",
        "camel": "\u{1F42B}",
        "camera": "\u{1F4F7}",
        "camera_flash": "\u{1F4F8}",
        "camping": "\u{1F3D5}",
        "cancer": "\u264B\uFE0F",
        "candle": "\u{1F56F}",
        "candy": "\u{1F36C}",
        "canoe": "\u{1F6F6}",
        "capital_abcd": "\u{1F520}",
        "capricorn": "\u2651\uFE0F",
        "car": "\u{1F697}",
        "card_file_box": "\u{1F5C3}",
        "card_index": "\u{1F4C7}",
        "card_index_dividers": "\u{1F5C2}",
        "carousel_horse": "\u{1F3A0}",
        "carrot": "\u{1F955}",
        "cat": "\u{1F431}",
        "cat2": "\u{1F408}",
        "cd": "\u{1F4BF}",
        "chains": "\u26D3",
        "champagne": "\u{1F37E}",
        "chart": "\u{1F4B9}",
        "chart_with_downwards_trend": "\u{1F4C9}",
        "chart_with_upwards_trend": "\u{1F4C8}",
        "checkered_flag": "\u{1F3C1}",
        "cheese": "\u{1F9C0}",
        "cherries": "\u{1F352}",
        "cherry_blossom": "\u{1F338}",
        "chestnut": "\u{1F330}",
        "chicken": "\u{1F414}",
        "children_crossing": "\u{1F6B8}",
        "chipmunk": "\u{1F43F}",
        "chocolate_bar": "\u{1F36B}",
        "christmas_tree": "\u{1F384}",
        "church": "\u26EA\uFE0F",
        "cinema": "\u{1F3A6}",
        "circus_tent": "\u{1F3AA}",
        "city_sunrise": "\u{1F307}",
        "city_sunset": "\u{1F306}",
        "cityscape": "\u{1F3D9}",
        "cl": "\u{1F191}",
        "clamp": "\u{1F5DC}",
        "clap": "\u{1F44F}",
        "clapper": "\u{1F3AC}",
        "classical_building": "\u{1F3DB}",
        "clinking_glasses": "\u{1F942}",
        "clipboard": "\u{1F4CB}",
        "clock1": "\u{1F550}",
        "clock10": "\u{1F559}",
        "clock1030": "\u{1F565}",
        "clock11": "\u{1F55A}",
        "clock1130": "\u{1F566}",
        "clock12": "\u{1F55B}",
        "clock1230": "\u{1F567}",
        "clock130": "\u{1F55C}",
        "clock2": "\u{1F551}",
        "clock230": "\u{1F55D}",
        "clock3": "\u{1F552}",
        "clock330": "\u{1F55E}",
        "clock4": "\u{1F553}",
        "clock430": "\u{1F55F}",
        "clock5": "\u{1F554}",
        "clock530": "\u{1F560}",
        "clock6": "\u{1F555}",
        "clock630": "\u{1F561}",
        "clock7": "\u{1F556}",
        "clock730": "\u{1F562}",
        "clock8": "\u{1F557}",
        "clock830": "\u{1F563}",
        "clock9": "\u{1F558}",
        "clock930": "\u{1F564}",
        "closed_book": "\u{1F4D5}",
        "closed_lock_with_key": "\u{1F510}",
        "closed_umbrella": "\u{1F302}",
        "cloud": "\u2601\uFE0F",
        "cloud_with_lightning": "\u{1F329}",
        "cloud_with_lightning_and_rain": "\u26C8",
        "cloud_with_rain": "\u{1F327}",
        "cloud_with_snow": "\u{1F328}",
        "clown_face": "\u{1F921}",
        "clubs": "\u2663\uFE0F",
        "cocktail": "\u{1F378}",
        "coffee": "\u2615\uFE0F",
        "coffin": "\u26B0\uFE0F",
        "cold_sweat": "\u{1F630}",
        "comet": "\u2604\uFE0F",
        "computer": "\u{1F4BB}",
        "computer_mouse": "\u{1F5B1}",
        "confetti_ball": "\u{1F38A}",
        "confounded": "\u{1F616}",
        "confused": "\u{1F615}",
        "congratulations": "\u3297\uFE0F",
        "construction": "\u{1F6A7}",
        "construction_worker_man": "\u{1F477}",
        "construction_worker_woman": "\u{1F477}&zwj;\u2640\uFE0F",
        "control_knobs": "\u{1F39B}",
        "convenience_store": "\u{1F3EA}",
        "cookie": "\u{1F36A}",
        "cool": "\u{1F192}",
        "policeman": "\u{1F46E}",
        "copyright": "\xA9\uFE0F",
        "corn": "\u{1F33D}",
        "couch_and_lamp": "\u{1F6CB}",
        "couple": "\u{1F46B}",
        "couple_with_heart_woman_man": "\u{1F491}",
        "couple_with_heart_man_man": "\u{1F468}&zwj;\u2764\uFE0F&zwj;\u{1F468}",
        "couple_with_heart_woman_woman": "\u{1F469}&zwj;\u2764\uFE0F&zwj;\u{1F469}",
        "couplekiss_man_man": "\u{1F468}&zwj;\u2764\uFE0F&zwj;\u{1F48B}&zwj;\u{1F468}",
        "couplekiss_man_woman": "\u{1F48F}",
        "couplekiss_woman_woman": "\u{1F469}&zwj;\u2764\uFE0F&zwj;\u{1F48B}&zwj;\u{1F469}",
        "cow": "\u{1F42E}",
        "cow2": "\u{1F404}",
        "cowboy_hat_face": "\u{1F920}",
        "crab": "\u{1F980}",
        "crayon": "\u{1F58D}",
        "credit_card": "\u{1F4B3}",
        "crescent_moon": "\u{1F319}",
        "cricket": "\u{1F3CF}",
        "crocodile": "\u{1F40A}",
        "croissant": "\u{1F950}",
        "crossed_fingers": "\u{1F91E}",
        "crossed_flags": "\u{1F38C}",
        "crossed_swords": "\u2694\uFE0F",
        "crown": "\u{1F451}",
        "cry": "\u{1F622}",
        "crying_cat_face": "\u{1F63F}",
        "crystal_ball": "\u{1F52E}",
        "cucumber": "\u{1F952}",
        "cupid": "\u{1F498}",
        "curly_loop": "\u27B0",
        "currency_exchange": "\u{1F4B1}",
        "curry": "\u{1F35B}",
        "custard": "\u{1F36E}",
        "customs": "\u{1F6C3}",
        "cyclone": "\u{1F300}",
        "dagger": "\u{1F5E1}",
        "dancer": "\u{1F483}",
        "dancing_women": "\u{1F46F}",
        "dancing_men": "\u{1F46F}&zwj;\u2642\uFE0F",
        "dango": "\u{1F361}",
        "dark_sunglasses": "\u{1F576}",
        "dart": "\u{1F3AF}",
        "dash": "\u{1F4A8}",
        "date": "\u{1F4C5}",
        "deciduous_tree": "\u{1F333}",
        "deer": "\u{1F98C}",
        "department_store": "\u{1F3EC}",
        "derelict_house": "\u{1F3DA}",
        "desert": "\u{1F3DC}",
        "desert_island": "\u{1F3DD}",
        "desktop_computer": "\u{1F5A5}",
        "male_detective": "\u{1F575}\uFE0F",
        "diamond_shape_with_a_dot_inside": "\u{1F4A0}",
        "diamonds": "\u2666\uFE0F",
        "disappointed": "\u{1F61E}",
        "disappointed_relieved": "\u{1F625}",
        "dizzy": "\u{1F4AB}",
        "dizzy_face": "\u{1F635}",
        "do_not_litter": "\u{1F6AF}",
        "dog": "\u{1F436}",
        "dog2": "\u{1F415}",
        "dollar": "\u{1F4B5}",
        "dolls": "\u{1F38E}",
        "dolphin": "\u{1F42C}",
        "door": "\u{1F6AA}",
        "doughnut": "\u{1F369}",
        "dove": "\u{1F54A}",
        "dragon": "\u{1F409}",
        "dragon_face": "\u{1F432}",
        "dress": "\u{1F457}",
        "dromedary_camel": "\u{1F42A}",
        "drooling_face": "\u{1F924}",
        "droplet": "\u{1F4A7}",
        "drum": "\u{1F941}",
        "duck": "\u{1F986}",
        "dvd": "\u{1F4C0}",
        "e-mail": "\u{1F4E7}",
        "eagle": "\u{1F985}",
        "ear": "\u{1F442}",
        "ear_of_rice": "\u{1F33E}",
        "earth_africa": "\u{1F30D}",
        "earth_americas": "\u{1F30E}",
        "earth_asia": "\u{1F30F}",
        "egg": "\u{1F95A}",
        "eggplant": "\u{1F346}",
        "eight_pointed_black_star": "\u2734\uFE0F",
        "eight_spoked_asterisk": "\u2733\uFE0F",
        "electric_plug": "\u{1F50C}",
        "elephant": "\u{1F418}",
        "email": "\u2709\uFE0F",
        "end": "\u{1F51A}",
        "envelope_with_arrow": "\u{1F4E9}",
        "euro": "\u{1F4B6}",
        "european_castle": "\u{1F3F0}",
        "european_post_office": "\u{1F3E4}",
        "evergreen_tree": "\u{1F332}",
        "exclamation": "\u2757\uFE0F",
        "expressionless": "\u{1F611}",
        "eye": "\u{1F441}",
        "eye_speech_bubble": "\u{1F441}&zwj;\u{1F5E8}",
        "eyeglasses": "\u{1F453}",
        "eyes": "\u{1F440}",
        "face_with_head_bandage": "\u{1F915}",
        "face_with_thermometer": "\u{1F912}",
        "fist_oncoming": "\u{1F44A}",
        "factory": "\u{1F3ED}",
        "fallen_leaf": "\u{1F342}",
        "family_man_woman_boy": "\u{1F46A}",
        "family_man_boy": "\u{1F468}&zwj;\u{1F466}",
        "family_man_boy_boy": "\u{1F468}&zwj;\u{1F466}&zwj;\u{1F466}",
        "family_man_girl": "\u{1F468}&zwj;\u{1F467}",
        "family_man_girl_boy": "\u{1F468}&zwj;\u{1F467}&zwj;\u{1F466}",
        "family_man_girl_girl": "\u{1F468}&zwj;\u{1F467}&zwj;\u{1F467}",
        "family_man_man_boy": "\u{1F468}&zwj;\u{1F468}&zwj;\u{1F466}",
        "family_man_man_boy_boy": "\u{1F468}&zwj;\u{1F468}&zwj;\u{1F466}&zwj;\u{1F466}",
        "family_man_man_girl": "\u{1F468}&zwj;\u{1F468}&zwj;\u{1F467}",
        "family_man_man_girl_boy": "\u{1F468}&zwj;\u{1F468}&zwj;\u{1F467}&zwj;\u{1F466}",
        "family_man_man_girl_girl": "\u{1F468}&zwj;\u{1F468}&zwj;\u{1F467}&zwj;\u{1F467}",
        "family_man_woman_boy_boy": "\u{1F468}&zwj;\u{1F469}&zwj;\u{1F466}&zwj;\u{1F466}",
        "family_man_woman_girl": "\u{1F468}&zwj;\u{1F469}&zwj;\u{1F467}",
        "family_man_woman_girl_boy": "\u{1F468}&zwj;\u{1F469}&zwj;\u{1F467}&zwj;\u{1F466}",
        "family_man_woman_girl_girl": "\u{1F468}&zwj;\u{1F469}&zwj;\u{1F467}&zwj;\u{1F467}",
        "family_woman_boy": "\u{1F469}&zwj;\u{1F466}",
        "family_woman_boy_boy": "\u{1F469}&zwj;\u{1F466}&zwj;\u{1F466}",
        "family_woman_girl": "\u{1F469}&zwj;\u{1F467}",
        "family_woman_girl_boy": "\u{1F469}&zwj;\u{1F467}&zwj;\u{1F466}",
        "family_woman_girl_girl": "\u{1F469}&zwj;\u{1F467}&zwj;\u{1F467}",
        "family_woman_woman_boy": "\u{1F469}&zwj;\u{1F469}&zwj;\u{1F466}",
        "family_woman_woman_boy_boy": "\u{1F469}&zwj;\u{1F469}&zwj;\u{1F466}&zwj;\u{1F466}",
        "family_woman_woman_girl": "\u{1F469}&zwj;\u{1F469}&zwj;\u{1F467}",
        "family_woman_woman_girl_boy": "\u{1F469}&zwj;\u{1F469}&zwj;\u{1F467}&zwj;\u{1F466}",
        "family_woman_woman_girl_girl": "\u{1F469}&zwj;\u{1F469}&zwj;\u{1F467}&zwj;\u{1F467}",
        "fast_forward": "\u23E9",
        "fax": "\u{1F4E0}",
        "fearful": "\u{1F628}",
        "feet": "\u{1F43E}",
        "female_detective": "\u{1F575}\uFE0F&zwj;\u2640\uFE0F",
        "ferris_wheel": "\u{1F3A1}",
        "ferry": "\u26F4",
        "field_hockey": "\u{1F3D1}",
        "file_cabinet": "\u{1F5C4}",
        "file_folder": "\u{1F4C1}",
        "film_projector": "\u{1F4FD}",
        "film_strip": "\u{1F39E}",
        "fire": "\u{1F525}",
        "fire_engine": "\u{1F692}",
        "fireworks": "\u{1F386}",
        "first_quarter_moon": "\u{1F313}",
        "first_quarter_moon_with_face": "\u{1F31B}",
        "fish": "\u{1F41F}",
        "fish_cake": "\u{1F365}",
        "fishing_pole_and_fish": "\u{1F3A3}",
        "fist_raised": "\u270A",
        "fist_left": "\u{1F91B}",
        "fist_right": "\u{1F91C}",
        "flags": "\u{1F38F}",
        "flashlight": "\u{1F526}",
        "fleur_de_lis": "\u269C\uFE0F",
        "flight_arrival": "\u{1F6EC}",
        "flight_departure": "\u{1F6EB}",
        "floppy_disk": "\u{1F4BE}",
        "flower_playing_cards": "\u{1F3B4}",
        "flushed": "\u{1F633}",
        "fog": "\u{1F32B}",
        "foggy": "\u{1F301}",
        "football": "\u{1F3C8}",
        "footprints": "\u{1F463}",
        "fork_and_knife": "\u{1F374}",
        "fountain": "\u26F2\uFE0F",
        "fountain_pen": "\u{1F58B}",
        "four_leaf_clover": "\u{1F340}",
        "fox_face": "\u{1F98A}",
        "framed_picture": "\u{1F5BC}",
        "free": "\u{1F193}",
        "fried_egg": "\u{1F373}",
        "fried_shrimp": "\u{1F364}",
        "fries": "\u{1F35F}",
        "frog": "\u{1F438}",
        "frowning": "\u{1F626}",
        "frowning_face": "\u2639\uFE0F",
        "frowning_man": "\u{1F64D}&zwj;\u2642\uFE0F",
        "frowning_woman": "\u{1F64D}",
        "middle_finger": "\u{1F595}",
        "fuelpump": "\u26FD\uFE0F",
        "full_moon": "\u{1F315}",
        "full_moon_with_face": "\u{1F31D}",
        "funeral_urn": "\u26B1\uFE0F",
        "game_die": "\u{1F3B2}",
        "gear": "\u2699\uFE0F",
        "gem": "\u{1F48E}",
        "gemini": "\u264A\uFE0F",
        "ghost": "\u{1F47B}",
        "gift": "\u{1F381}",
        "gift_heart": "\u{1F49D}",
        "girl": "\u{1F467}",
        "globe_with_meridians": "\u{1F310}",
        "goal_net": "\u{1F945}",
        "goat": "\u{1F410}",
        "golf": "\u26F3\uFE0F",
        "golfing_man": "\u{1F3CC}\uFE0F",
        "golfing_woman": "\u{1F3CC}\uFE0F&zwj;\u2640\uFE0F",
        "gorilla": "\u{1F98D}",
        "grapes": "\u{1F347}",
        "green_apple": "\u{1F34F}",
        "green_book": "\u{1F4D7}",
        "green_heart": "\u{1F49A}",
        "green_salad": "\u{1F957}",
        "grey_exclamation": "\u2755",
        "grey_question": "\u2754",
        "grimacing": "\u{1F62C}",
        "grin": "\u{1F601}",
        "grinning": "\u{1F600}",
        "guardsman": "\u{1F482}",
        "guardswoman": "\u{1F482}&zwj;\u2640\uFE0F",
        "guitar": "\u{1F3B8}",
        "gun": "\u{1F52B}",
        "haircut_woman": "\u{1F487}",
        "haircut_man": "\u{1F487}&zwj;\u2642\uFE0F",
        "hamburger": "\u{1F354}",
        "hammer": "\u{1F528}",
        "hammer_and_pick": "\u2692",
        "hammer_and_wrench": "\u{1F6E0}",
        "hamster": "\u{1F439}",
        "hand": "\u270B",
        "handbag": "\u{1F45C}",
        "handshake": "\u{1F91D}",
        "hankey": "\u{1F4A9}",
        "hatched_chick": "\u{1F425}",
        "hatching_chick": "\u{1F423}",
        "headphones": "\u{1F3A7}",
        "hear_no_evil": "\u{1F649}",
        "heart": "\u2764\uFE0F",
        "heart_decoration": "\u{1F49F}",
        "heart_eyes": "\u{1F60D}",
        "heart_eyes_cat": "\u{1F63B}",
        "heartbeat": "\u{1F493}",
        "heartpulse": "\u{1F497}",
        "hearts": "\u2665\uFE0F",
        "heavy_check_mark": "\u2714\uFE0F",
        "heavy_division_sign": "\u2797",
        "heavy_dollar_sign": "\u{1F4B2}",
        "heavy_heart_exclamation": "\u2763\uFE0F",
        "heavy_minus_sign": "\u2796",
        "heavy_multiplication_x": "\u2716\uFE0F",
        "heavy_plus_sign": "\u2795",
        "helicopter": "\u{1F681}",
        "herb": "\u{1F33F}",
        "hibiscus": "\u{1F33A}",
        "high_brightness": "\u{1F506}",
        "high_heel": "\u{1F460}",
        "hocho": "\u{1F52A}",
        "hole": "\u{1F573}",
        "honey_pot": "\u{1F36F}",
        "horse": "\u{1F434}",
        "horse_racing": "\u{1F3C7}",
        "hospital": "\u{1F3E5}",
        "hot_pepper": "\u{1F336}",
        "hotdog": "\u{1F32D}",
        "hotel": "\u{1F3E8}",
        "hotsprings": "\u2668\uFE0F",
        "hourglass": "\u231B\uFE0F",
        "hourglass_flowing_sand": "\u23F3",
        "house": "\u{1F3E0}",
        "house_with_garden": "\u{1F3E1}",
        "houses": "\u{1F3D8}",
        "hugs": "\u{1F917}",
        "hushed": "\u{1F62F}",
        "ice_cream": "\u{1F368}",
        "ice_hockey": "\u{1F3D2}",
        "ice_skate": "\u26F8",
        "icecream": "\u{1F366}",
        "id": "\u{1F194}",
        "ideograph_advantage": "\u{1F250}",
        "imp": "\u{1F47F}",
        "inbox_tray": "\u{1F4E5}",
        "incoming_envelope": "\u{1F4E8}",
        "tipping_hand_woman": "\u{1F481}",
        "information_source": "\u2139\uFE0F",
        "innocent": "\u{1F607}",
        "interrobang": "\u2049\uFE0F",
        "iphone": "\u{1F4F1}",
        "izakaya_lantern": "\u{1F3EE}",
        "jack_o_lantern": "\u{1F383}",
        "japan": "\u{1F5FE}",
        "japanese_castle": "\u{1F3EF}",
        "japanese_goblin": "\u{1F47A}",
        "japanese_ogre": "\u{1F479}",
        "jeans": "\u{1F456}",
        "joy": "\u{1F602}",
        "joy_cat": "\u{1F639}",
        "joystick": "\u{1F579}",
        "kaaba": "\u{1F54B}",
        "key": "\u{1F511}",
        "keyboard": "\u2328\uFE0F",
        "keycap_ten": "\u{1F51F}",
        "kick_scooter": "\u{1F6F4}",
        "kimono": "\u{1F458}",
        "kiss": "\u{1F48B}",
        "kissing": "\u{1F617}",
        "kissing_cat": "\u{1F63D}",
        "kissing_closed_eyes": "\u{1F61A}",
        "kissing_heart": "\u{1F618}",
        "kissing_smiling_eyes": "\u{1F619}",
        "kiwi_fruit": "\u{1F95D}",
        "koala": "\u{1F428}",
        "koko": "\u{1F201}",
        "label": "\u{1F3F7}",
        "large_blue_circle": "\u{1F535}",
        "large_blue_diamond": "\u{1F537}",
        "large_orange_diamond": "\u{1F536}",
        "last_quarter_moon": "\u{1F317}",
        "last_quarter_moon_with_face": "\u{1F31C}",
        "latin_cross": "\u271D\uFE0F",
        "laughing": "\u{1F606}",
        "leaves": "\u{1F343}",
        "ledger": "\u{1F4D2}",
        "left_luggage": "\u{1F6C5}",
        "left_right_arrow": "\u2194\uFE0F",
        "leftwards_arrow_with_hook": "\u21A9\uFE0F",
        "lemon": "\u{1F34B}",
        "leo": "\u264C\uFE0F",
        "leopard": "\u{1F406}",
        "level_slider": "\u{1F39A}",
        "libra": "\u264E\uFE0F",
        "light_rail": "\u{1F688}",
        "link": "\u{1F517}",
        "lion": "\u{1F981}",
        "lips": "\u{1F444}",
        "lipstick": "\u{1F484}",
        "lizard": "\u{1F98E}",
        "lock": "\u{1F512}",
        "lock_with_ink_pen": "\u{1F50F}",
        "lollipop": "\u{1F36D}",
        "loop": "\u27BF",
        "loud_sound": "\u{1F50A}",
        "loudspeaker": "\u{1F4E2}",
        "love_hotel": "\u{1F3E9}",
        "love_letter": "\u{1F48C}",
        "low_brightness": "\u{1F505}",
        "lying_face": "\u{1F925}",
        "m": "\u24C2\uFE0F",
        "mag": "\u{1F50D}",
        "mag_right": "\u{1F50E}",
        "mahjong": "\u{1F004}\uFE0F",
        "mailbox": "\u{1F4EB}",
        "mailbox_closed": "\u{1F4EA}",
        "mailbox_with_mail": "\u{1F4EC}",
        "mailbox_with_no_mail": "\u{1F4ED}",
        "man": "\u{1F468}",
        "man_artist": "\u{1F468}&zwj;\u{1F3A8}",
        "man_astronaut": "\u{1F468}&zwj;\u{1F680}",
        "man_cartwheeling": "\u{1F938}&zwj;\u2642\uFE0F",
        "man_cook": "\u{1F468}&zwj;\u{1F373}",
        "man_dancing": "\u{1F57A}",
        "man_facepalming": "\u{1F926}&zwj;\u2642\uFE0F",
        "man_factory_worker": "\u{1F468}&zwj;\u{1F3ED}",
        "man_farmer": "\u{1F468}&zwj;\u{1F33E}",
        "man_firefighter": "\u{1F468}&zwj;\u{1F692}",
        "man_health_worker": "\u{1F468}&zwj;\u2695\uFE0F",
        "man_in_tuxedo": "\u{1F935}",
        "man_judge": "\u{1F468}&zwj;\u2696\uFE0F",
        "man_juggling": "\u{1F939}&zwj;\u2642\uFE0F",
        "man_mechanic": "\u{1F468}&zwj;\u{1F527}",
        "man_office_worker": "\u{1F468}&zwj;\u{1F4BC}",
        "man_pilot": "\u{1F468}&zwj;\u2708\uFE0F",
        "man_playing_handball": "\u{1F93E}&zwj;\u2642\uFE0F",
        "man_playing_water_polo": "\u{1F93D}&zwj;\u2642\uFE0F",
        "man_scientist": "\u{1F468}&zwj;\u{1F52C}",
        "man_shrugging": "\u{1F937}&zwj;\u2642\uFE0F",
        "man_singer": "\u{1F468}&zwj;\u{1F3A4}",
        "man_student": "\u{1F468}&zwj;\u{1F393}",
        "man_teacher": "\u{1F468}&zwj;\u{1F3EB}",
        "man_technologist": "\u{1F468}&zwj;\u{1F4BB}",
        "man_with_gua_pi_mao": "\u{1F472}",
        "man_with_turban": "\u{1F473}",
        "tangerine": "\u{1F34A}",
        "mans_shoe": "\u{1F45E}",
        "mantelpiece_clock": "\u{1F570}",
        "maple_leaf": "\u{1F341}",
        "martial_arts_uniform": "\u{1F94B}",
        "mask": "\u{1F637}",
        "massage_woman": "\u{1F486}",
        "massage_man": "\u{1F486}&zwj;\u2642\uFE0F",
        "meat_on_bone": "\u{1F356}",
        "medal_military": "\u{1F396}",
        "medal_sports": "\u{1F3C5}",
        "mega": "\u{1F4E3}",
        "melon": "\u{1F348}",
        "memo": "\u{1F4DD}",
        "men_wrestling": "\u{1F93C}&zwj;\u2642\uFE0F",
        "menorah": "\u{1F54E}",
        "mens": "\u{1F6B9}",
        "metal": "\u{1F918}",
        "metro": "\u{1F687}",
        "microphone": "\u{1F3A4}",
        "microscope": "\u{1F52C}",
        "milk_glass": "\u{1F95B}",
        "milky_way": "\u{1F30C}",
        "minibus": "\u{1F690}",
        "minidisc": "\u{1F4BD}",
        "mobile_phone_off": "\u{1F4F4}",
        "money_mouth_face": "\u{1F911}",
        "money_with_wings": "\u{1F4B8}",
        "moneybag": "\u{1F4B0}",
        "monkey": "\u{1F412}",
        "monkey_face": "\u{1F435}",
        "monorail": "\u{1F69D}",
        "moon": "\u{1F314}",
        "mortar_board": "\u{1F393}",
        "mosque": "\u{1F54C}",
        "motor_boat": "\u{1F6E5}",
        "motor_scooter": "\u{1F6F5}",
        "motorcycle": "\u{1F3CD}",
        "motorway": "\u{1F6E3}",
        "mount_fuji": "\u{1F5FB}",
        "mountain": "\u26F0",
        "mountain_biking_man": "\u{1F6B5}",
        "mountain_biking_woman": "\u{1F6B5}&zwj;\u2640\uFE0F",
        "mountain_cableway": "\u{1F6A0}",
        "mountain_railway": "\u{1F69E}",
        "mountain_snow": "\u{1F3D4}",
        "mouse": "\u{1F42D}",
        "mouse2": "\u{1F401}",
        "movie_camera": "\u{1F3A5}",
        "moyai": "\u{1F5FF}",
        "mrs_claus": "\u{1F936}",
        "muscle": "\u{1F4AA}",
        "mushroom": "\u{1F344}",
        "musical_keyboard": "\u{1F3B9}",
        "musical_note": "\u{1F3B5}",
        "musical_score": "\u{1F3BC}",
        "mute": "\u{1F507}",
        "nail_care": "\u{1F485}",
        "name_badge": "\u{1F4DB}",
        "national_park": "\u{1F3DE}",
        "nauseated_face": "\u{1F922}",
        "necktie": "\u{1F454}",
        "negative_squared_cross_mark": "\u274E",
        "nerd_face": "\u{1F913}",
        "neutral_face": "\u{1F610}",
        "new": "\u{1F195}",
        "new_moon": "\u{1F311}",
        "new_moon_with_face": "\u{1F31A}",
        "newspaper": "\u{1F4F0}",
        "newspaper_roll": "\u{1F5DE}",
        "next_track_button": "\u23ED",
        "ng": "\u{1F196}",
        "no_good_man": "\u{1F645}&zwj;\u2642\uFE0F",
        "no_good_woman": "\u{1F645}",
        "night_with_stars": "\u{1F303}",
        "no_bell": "\u{1F515}",
        "no_bicycles": "\u{1F6B3}",
        "no_entry": "\u26D4\uFE0F",
        "no_entry_sign": "\u{1F6AB}",
        "no_mobile_phones": "\u{1F4F5}",
        "no_mouth": "\u{1F636}",
        "no_pedestrians": "\u{1F6B7}",
        "no_smoking": "\u{1F6AD}",
        "non-potable_water": "\u{1F6B1}",
        "nose": "\u{1F443}",
        "notebook": "\u{1F4D3}",
        "notebook_with_decorative_cover": "\u{1F4D4}",
        "notes": "\u{1F3B6}",
        "nut_and_bolt": "\u{1F529}",
        "o": "\u2B55\uFE0F",
        "o2": "\u{1F17E}\uFE0F",
        "ocean": "\u{1F30A}",
        "octopus": "\u{1F419}",
        "oden": "\u{1F362}",
        "office": "\u{1F3E2}",
        "oil_drum": "\u{1F6E2}",
        "ok": "\u{1F197}",
        "ok_hand": "\u{1F44C}",
        "ok_man": "\u{1F646}&zwj;\u2642\uFE0F",
        "ok_woman": "\u{1F646}",
        "old_key": "\u{1F5DD}",
        "older_man": "\u{1F474}",
        "older_woman": "\u{1F475}",
        "om": "\u{1F549}",
        "on": "\u{1F51B}",
        "oncoming_automobile": "\u{1F698}",
        "oncoming_bus": "\u{1F68D}",
        "oncoming_police_car": "\u{1F694}",
        "oncoming_taxi": "\u{1F696}",
        "open_file_folder": "\u{1F4C2}",
        "open_hands": "\u{1F450}",
        "open_mouth": "\u{1F62E}",
        "open_umbrella": "\u2602\uFE0F",
        "ophiuchus": "\u26CE",
        "orange_book": "\u{1F4D9}",
        "orthodox_cross": "\u2626\uFE0F",
        "outbox_tray": "\u{1F4E4}",
        "owl": "\u{1F989}",
        "ox": "\u{1F402}",
        "package": "\u{1F4E6}",
        "page_facing_up": "\u{1F4C4}",
        "page_with_curl": "\u{1F4C3}",
        "pager": "\u{1F4DF}",
        "paintbrush": "\u{1F58C}",
        "palm_tree": "\u{1F334}",
        "pancakes": "\u{1F95E}",
        "panda_face": "\u{1F43C}",
        "paperclip": "\u{1F4CE}",
        "paperclips": "\u{1F587}",
        "parasol_on_ground": "\u26F1",
        "parking": "\u{1F17F}\uFE0F",
        "part_alternation_mark": "\u303D\uFE0F",
        "partly_sunny": "\u26C5\uFE0F",
        "passenger_ship": "\u{1F6F3}",
        "passport_control": "\u{1F6C2}",
        "pause_button": "\u23F8",
        "peace_symbol": "\u262E\uFE0F",
        "peach": "\u{1F351}",
        "peanuts": "\u{1F95C}",
        "pear": "\u{1F350}",
        "pen": "\u{1F58A}",
        "pencil2": "\u270F\uFE0F",
        "penguin": "\u{1F427}",
        "pensive": "\u{1F614}",
        "performing_arts": "\u{1F3AD}",
        "persevere": "\u{1F623}",
        "person_fencing": "\u{1F93A}",
        "pouting_woman": "\u{1F64E}",
        "phone": "\u260E\uFE0F",
        "pick": "\u26CF",
        "pig": "\u{1F437}",
        "pig2": "\u{1F416}",
        "pig_nose": "\u{1F43D}",
        "pill": "\u{1F48A}",
        "pineapple": "\u{1F34D}",
        "ping_pong": "\u{1F3D3}",
        "pisces": "\u2653\uFE0F",
        "pizza": "\u{1F355}",
        "place_of_worship": "\u{1F6D0}",
        "plate_with_cutlery": "\u{1F37D}",
        "play_or_pause_button": "\u23EF",
        "point_down": "\u{1F447}",
        "point_left": "\u{1F448}",
        "point_right": "\u{1F449}",
        "point_up": "\u261D\uFE0F",
        "point_up_2": "\u{1F446}",
        "police_car": "\u{1F693}",
        "policewoman": "\u{1F46E}&zwj;\u2640\uFE0F",
        "poodle": "\u{1F429}",
        "popcorn": "\u{1F37F}",
        "post_office": "\u{1F3E3}",
        "postal_horn": "\u{1F4EF}",
        "postbox": "\u{1F4EE}",
        "potable_water": "\u{1F6B0}",
        "potato": "\u{1F954}",
        "pouch": "\u{1F45D}",
        "poultry_leg": "\u{1F357}",
        "pound": "\u{1F4B7}",
        "rage": "\u{1F621}",
        "pouting_cat": "\u{1F63E}",
        "pouting_man": "\u{1F64E}&zwj;\u2642\uFE0F",
        "pray": "\u{1F64F}",
        "prayer_beads": "\u{1F4FF}",
        "pregnant_woman": "\u{1F930}",
        "previous_track_button": "\u23EE",
        "prince": "\u{1F934}",
        "princess": "\u{1F478}",
        "printer": "\u{1F5A8}",
        "purple_heart": "\u{1F49C}",
        "purse": "\u{1F45B}",
        "pushpin": "\u{1F4CC}",
        "put_litter_in_its_place": "\u{1F6AE}",
        "question": "\u2753",
        "rabbit": "\u{1F430}",
        "rabbit2": "\u{1F407}",
        "racehorse": "\u{1F40E}",
        "racing_car": "\u{1F3CE}",
        "radio": "\u{1F4FB}",
        "radio_button": "\u{1F518}",
        "radioactive": "\u2622\uFE0F",
        "railway_car": "\u{1F683}",
        "railway_track": "\u{1F6E4}",
        "rainbow": "\u{1F308}",
        "rainbow_flag": "\u{1F3F3}\uFE0F&zwj;\u{1F308}",
        "raised_back_of_hand": "\u{1F91A}",
        "raised_hand_with_fingers_splayed": "\u{1F590}",
        "raised_hands": "\u{1F64C}",
        "raising_hand_woman": "\u{1F64B}",
        "raising_hand_man": "\u{1F64B}&zwj;\u2642\uFE0F",
        "ram": "\u{1F40F}",
        "ramen": "\u{1F35C}",
        "rat": "\u{1F400}",
        "record_button": "\u23FA",
        "recycle": "\u267B\uFE0F",
        "red_circle": "\u{1F534}",
        "registered": "\xAE\uFE0F",
        "relaxed": "\u263A\uFE0F",
        "relieved": "\u{1F60C}",
        "reminder_ribbon": "\u{1F397}",
        "repeat": "\u{1F501}",
        "repeat_one": "\u{1F502}",
        "rescue_worker_helmet": "\u26D1",
        "restroom": "\u{1F6BB}",
        "revolving_hearts": "\u{1F49E}",
        "rewind": "\u23EA",
        "rhinoceros": "\u{1F98F}",
        "ribbon": "\u{1F380}",
        "rice": "\u{1F35A}",
        "rice_ball": "\u{1F359}",
        "rice_cracker": "\u{1F358}",
        "rice_scene": "\u{1F391}",
        "right_anger_bubble": "\u{1F5EF}",
        "ring": "\u{1F48D}",
        "robot": "\u{1F916}",
        "rocket": "\u{1F680}",
        "rofl": "\u{1F923}",
        "roll_eyes": "\u{1F644}",
        "roller_coaster": "\u{1F3A2}",
        "rooster": "\u{1F413}",
        "rose": "\u{1F339}",
        "rosette": "\u{1F3F5}",
        "rotating_light": "\u{1F6A8}",
        "round_pushpin": "\u{1F4CD}",
        "rowing_man": "\u{1F6A3}",
        "rowing_woman": "\u{1F6A3}&zwj;\u2640\uFE0F",
        "rugby_football": "\u{1F3C9}",
        "running_man": "\u{1F3C3}",
        "running_shirt_with_sash": "\u{1F3BD}",
        "running_woman": "\u{1F3C3}&zwj;\u2640\uFE0F",
        "sa": "\u{1F202}\uFE0F",
        "sagittarius": "\u2650\uFE0F",
        "sake": "\u{1F376}",
        "sandal": "\u{1F461}",
        "santa": "\u{1F385}",
        "satellite": "\u{1F4E1}",
        "saxophone": "\u{1F3B7}",
        "school": "\u{1F3EB}",
        "school_satchel": "\u{1F392}",
        "scissors": "\u2702\uFE0F",
        "scorpion": "\u{1F982}",
        "scorpius": "\u264F\uFE0F",
        "scream": "\u{1F631}",
        "scream_cat": "\u{1F640}",
        "scroll": "\u{1F4DC}",
        "seat": "\u{1F4BA}",
        "secret": "\u3299\uFE0F",
        "see_no_evil": "\u{1F648}",
        "seedling": "\u{1F331}",
        "selfie": "\u{1F933}",
        "shallow_pan_of_food": "\u{1F958}",
        "shamrock": "\u2618\uFE0F",
        "shark": "\u{1F988}",
        "shaved_ice": "\u{1F367}",
        "sheep": "\u{1F411}",
        "shell": "\u{1F41A}",
        "shield": "\u{1F6E1}",
        "shinto_shrine": "\u26E9",
        "ship": "\u{1F6A2}",
        "shirt": "\u{1F455}",
        "shopping": "\u{1F6CD}",
        "shopping_cart": "\u{1F6D2}",
        "shower": "\u{1F6BF}",
        "shrimp": "\u{1F990}",
        "signal_strength": "\u{1F4F6}",
        "six_pointed_star": "\u{1F52F}",
        "ski": "\u{1F3BF}",
        "skier": "\u26F7",
        "skull": "\u{1F480}",
        "skull_and_crossbones": "\u2620\uFE0F",
        "sleeping": "\u{1F634}",
        "sleeping_bed": "\u{1F6CC}",
        "sleepy": "\u{1F62A}",
        "slightly_frowning_face": "\u{1F641}",
        "slightly_smiling_face": "\u{1F642}",
        "slot_machine": "\u{1F3B0}",
        "small_airplane": "\u{1F6E9}",
        "small_blue_diamond": "\u{1F539}",
        "small_orange_diamond": "\u{1F538}",
        "small_red_triangle": "\u{1F53A}",
        "small_red_triangle_down": "\u{1F53B}",
        "smile": "\u{1F604}",
        "smile_cat": "\u{1F638}",
        "smiley": "\u{1F603}",
        "smiley_cat": "\u{1F63A}",
        "smiling_imp": "\u{1F608}",
        "smirk": "\u{1F60F}",
        "smirk_cat": "\u{1F63C}",
        "smoking": "\u{1F6AC}",
        "snail": "\u{1F40C}",
        "snake": "\u{1F40D}",
        "sneezing_face": "\u{1F927}",
        "snowboarder": "\u{1F3C2}",
        "snowflake": "\u2744\uFE0F",
        "snowman": "\u26C4\uFE0F",
        "snowman_with_snow": "\u2603\uFE0F",
        "sob": "\u{1F62D}",
        "soccer": "\u26BD\uFE0F",
        "soon": "\u{1F51C}",
        "sos": "\u{1F198}",
        "sound": "\u{1F509}",
        "space_invader": "\u{1F47E}",
        "spades": "\u2660\uFE0F",
        "spaghetti": "\u{1F35D}",
        "sparkle": "\u2747\uFE0F",
        "sparkler": "\u{1F387}",
        "sparkles": "\u2728",
        "sparkling_heart": "\u{1F496}",
        "speak_no_evil": "\u{1F64A}",
        "speaker": "\u{1F508}",
        "speaking_head": "\u{1F5E3}",
        "speech_balloon": "\u{1F4AC}",
        "speedboat": "\u{1F6A4}",
        "spider": "\u{1F577}",
        "spider_web": "\u{1F578}",
        "spiral_calendar": "\u{1F5D3}",
        "spiral_notepad": "\u{1F5D2}",
        "spoon": "\u{1F944}",
        "squid": "\u{1F991}",
        "stadium": "\u{1F3DF}",
        "star": "\u2B50\uFE0F",
        "star2": "\u{1F31F}",
        "star_and_crescent": "\u262A\uFE0F",
        "star_of_david": "\u2721\uFE0F",
        "stars": "\u{1F320}",
        "station": "\u{1F689}",
        "statue_of_liberty": "\u{1F5FD}",
        "steam_locomotive": "\u{1F682}",
        "stew": "\u{1F372}",
        "stop_button": "\u23F9",
        "stop_sign": "\u{1F6D1}",
        "stopwatch": "\u23F1",
        "straight_ruler": "\u{1F4CF}",
        "strawberry": "\u{1F353}",
        "stuck_out_tongue": "\u{1F61B}",
        "stuck_out_tongue_closed_eyes": "\u{1F61D}",
        "stuck_out_tongue_winking_eye": "\u{1F61C}",
        "studio_microphone": "\u{1F399}",
        "stuffed_flatbread": "\u{1F959}",
        "sun_behind_large_cloud": "\u{1F325}",
        "sun_behind_rain_cloud": "\u{1F326}",
        "sun_behind_small_cloud": "\u{1F324}",
        "sun_with_face": "\u{1F31E}",
        "sunflower": "\u{1F33B}",
        "sunglasses": "\u{1F60E}",
        "sunny": "\u2600\uFE0F",
        "sunrise": "\u{1F305}",
        "sunrise_over_mountains": "\u{1F304}",
        "surfing_man": "\u{1F3C4}",
        "surfing_woman": "\u{1F3C4}&zwj;\u2640\uFE0F",
        "sushi": "\u{1F363}",
        "suspension_railway": "\u{1F69F}",
        "sweat": "\u{1F613}",
        "sweat_drops": "\u{1F4A6}",
        "sweat_smile": "\u{1F605}",
        "sweet_potato": "\u{1F360}",
        "swimming_man": "\u{1F3CA}",
        "swimming_woman": "\u{1F3CA}&zwj;\u2640\uFE0F",
        "symbols": "\u{1F523}",
        "synagogue": "\u{1F54D}",
        "syringe": "\u{1F489}",
        "taco": "\u{1F32E}",
        "tada": "\u{1F389}",
        "tanabata_tree": "\u{1F38B}",
        "taurus": "\u2649\uFE0F",
        "taxi": "\u{1F695}",
        "tea": "\u{1F375}",
        "telephone_receiver": "\u{1F4DE}",
        "telescope": "\u{1F52D}",
        "tennis": "\u{1F3BE}",
        "tent": "\u26FA\uFE0F",
        "thermometer": "\u{1F321}",
        "thinking": "\u{1F914}",
        "thought_balloon": "\u{1F4AD}",
        "ticket": "\u{1F3AB}",
        "tickets": "\u{1F39F}",
        "tiger": "\u{1F42F}",
        "tiger2": "\u{1F405}",
        "timer_clock": "\u23F2",
        "tipping_hand_man": "\u{1F481}&zwj;\u2642\uFE0F",
        "tired_face": "\u{1F62B}",
        "tm": "\u2122\uFE0F",
        "toilet": "\u{1F6BD}",
        "tokyo_tower": "\u{1F5FC}",
        "tomato": "\u{1F345}",
        "tongue": "\u{1F445}",
        "top": "\u{1F51D}",
        "tophat": "\u{1F3A9}",
        "tornado": "\u{1F32A}",
        "trackball": "\u{1F5B2}",
        "tractor": "\u{1F69C}",
        "traffic_light": "\u{1F6A5}",
        "train": "\u{1F68B}",
        "train2": "\u{1F686}",
        "tram": "\u{1F68A}",
        "triangular_flag_on_post": "\u{1F6A9}",
        "triangular_ruler": "\u{1F4D0}",
        "trident": "\u{1F531}",
        "triumph": "\u{1F624}",
        "trolleybus": "\u{1F68E}",
        "trophy": "\u{1F3C6}",
        "tropical_drink": "\u{1F379}",
        "tropical_fish": "\u{1F420}",
        "truck": "\u{1F69A}",
        "trumpet": "\u{1F3BA}",
        "tulip": "\u{1F337}",
        "tumbler_glass": "\u{1F943}",
        "turkey": "\u{1F983}",
        "turtle": "\u{1F422}",
        "tv": "\u{1F4FA}",
        "twisted_rightwards_arrows": "\u{1F500}",
        "two_hearts": "\u{1F495}",
        "two_men_holding_hands": "\u{1F46C}",
        "two_women_holding_hands": "\u{1F46D}",
        "u5272": "\u{1F239}",
        "u5408": "\u{1F234}",
        "u55b6": "\u{1F23A}",
        "u6307": "\u{1F22F}\uFE0F",
        "u6708": "\u{1F237}\uFE0F",
        "u6709": "\u{1F236}",
        "u6e80": "\u{1F235}",
        "u7121": "\u{1F21A}\uFE0F",
        "u7533": "\u{1F238}",
        "u7981": "\u{1F232}",
        "u7a7a": "\u{1F233}",
        "umbrella": "\u2614\uFE0F",
        "unamused": "\u{1F612}",
        "underage": "\u{1F51E}",
        "unicorn": "\u{1F984}",
        "unlock": "\u{1F513}",
        "up": "\u{1F199}",
        "upside_down_face": "\u{1F643}",
        "v": "\u270C\uFE0F",
        "vertical_traffic_light": "\u{1F6A6}",
        "vhs": "\u{1F4FC}",
        "vibration_mode": "\u{1F4F3}",
        "video_camera": "\u{1F4F9}",
        "video_game": "\u{1F3AE}",
        "violin": "\u{1F3BB}",
        "virgo": "\u264D\uFE0F",
        "volcano": "\u{1F30B}",
        "volleyball": "\u{1F3D0}",
        "vs": "\u{1F19A}",
        "vulcan_salute": "\u{1F596}",
        "walking_man": "\u{1F6B6}",
        "walking_woman": "\u{1F6B6}&zwj;\u2640\uFE0F",
        "waning_crescent_moon": "\u{1F318}",
        "waning_gibbous_moon": "\u{1F316}",
        "warning": "\u26A0\uFE0F",
        "wastebasket": "\u{1F5D1}",
        "watch": "\u231A\uFE0F",
        "water_buffalo": "\u{1F403}",
        "watermelon": "\u{1F349}",
        "wave": "\u{1F44B}",
        "wavy_dash": "\u3030\uFE0F",
        "waxing_crescent_moon": "\u{1F312}",
        "wc": "\u{1F6BE}",
        "weary": "\u{1F629}",
        "wedding": "\u{1F492}",
        "weight_lifting_man": "\u{1F3CB}\uFE0F",
        "weight_lifting_woman": "\u{1F3CB}\uFE0F&zwj;\u2640\uFE0F",
        "whale": "\u{1F433}",
        "whale2": "\u{1F40B}",
        "wheel_of_dharma": "\u2638\uFE0F",
        "wheelchair": "\u267F\uFE0F",
        "white_check_mark": "\u2705",
        "white_circle": "\u26AA\uFE0F",
        "white_flag": "\u{1F3F3}\uFE0F",
        "white_flower": "\u{1F4AE}",
        "white_large_square": "\u2B1C\uFE0F",
        "white_medium_small_square": "\u25FD\uFE0F",
        "white_medium_square": "\u25FB\uFE0F",
        "white_small_square": "\u25AB\uFE0F",
        "white_square_button": "\u{1F533}",
        "wilted_flower": "\u{1F940}",
        "wind_chime": "\u{1F390}",
        "wind_face": "\u{1F32C}",
        "wine_glass": "\u{1F377}",
        "wink": "\u{1F609}",
        "wolf": "\u{1F43A}",
        "woman": "\u{1F469}",
        "woman_artist": "\u{1F469}&zwj;\u{1F3A8}",
        "woman_astronaut": "\u{1F469}&zwj;\u{1F680}",
        "woman_cartwheeling": "\u{1F938}&zwj;\u2640\uFE0F",
        "woman_cook": "\u{1F469}&zwj;\u{1F373}",
        "woman_facepalming": "\u{1F926}&zwj;\u2640\uFE0F",
        "woman_factory_worker": "\u{1F469}&zwj;\u{1F3ED}",
        "woman_farmer": "\u{1F469}&zwj;\u{1F33E}",
        "woman_firefighter": "\u{1F469}&zwj;\u{1F692}",
        "woman_health_worker": "\u{1F469}&zwj;\u2695\uFE0F",
        "woman_judge": "\u{1F469}&zwj;\u2696\uFE0F",
        "woman_juggling": "\u{1F939}&zwj;\u2640\uFE0F",
        "woman_mechanic": "\u{1F469}&zwj;\u{1F527}",
        "woman_office_worker": "\u{1F469}&zwj;\u{1F4BC}",
        "woman_pilot": "\u{1F469}&zwj;\u2708\uFE0F",
        "woman_playing_handball": "\u{1F93E}&zwj;\u2640\uFE0F",
        "woman_playing_water_polo": "\u{1F93D}&zwj;\u2640\uFE0F",
        "woman_scientist": "\u{1F469}&zwj;\u{1F52C}",
        "woman_shrugging": "\u{1F937}&zwj;\u2640\uFE0F",
        "woman_singer": "\u{1F469}&zwj;\u{1F3A4}",
        "woman_student": "\u{1F469}&zwj;\u{1F393}",
        "woman_teacher": "\u{1F469}&zwj;\u{1F3EB}",
        "woman_technologist": "\u{1F469}&zwj;\u{1F4BB}",
        "woman_with_turban": "\u{1F473}&zwj;\u2640\uFE0F",
        "womans_clothes": "\u{1F45A}",
        "womans_hat": "\u{1F452}",
        "women_wrestling": "\u{1F93C}&zwj;\u2640\uFE0F",
        "womens": "\u{1F6BA}",
        "world_map": "\u{1F5FA}",
        "worried": "\u{1F61F}",
        "wrench": "\u{1F527}",
        "writing_hand": "\u270D\uFE0F",
        "x": "\u274C",
        "yellow_heart": "\u{1F49B}",
        "yen": "\u{1F4B4}",
        "yin_yang": "\u262F\uFE0F",
        "yum": "\u{1F60B}",
        "zap": "\u26A1\uFE0F",
        "zipper_mouth_face": "\u{1F910}",
        "zzz": "\u{1F4A4}",
        /* special emojis :P */
        "octocat": '<img alt=":octocat:" height="20" width="20" align="absmiddle" src="https://assets-cdn.github.com/images/icons/emoji/octocat.png">',
        "showdown": `<span style="font-family: 'Anonymous Pro', monospace; text-decoration: underline; text-decoration-style: dashed; text-decoration-color: #3e8b8a;text-underline-position: under;">S</span>`
      };
      showdown.Converter = function(converterOptions) {
        "use strict";
        var options2 = {}, langExtensions = [], outputModifiers = [], listeners = {}, setConvFlavor = setFlavor2, metadata = {
          parsed: {},
          raw: "",
          format: ""
        };
        _constructor();
        function _constructor() {
          converterOptions = converterOptions || {};
          for (var gOpt in globalOptions) {
            if (globalOptions.hasOwnProperty(gOpt)) {
              options2[gOpt] = globalOptions[gOpt];
            }
          }
          if (typeof converterOptions === "object") {
            for (var opt in converterOptions) {
              if (converterOptions.hasOwnProperty(opt)) {
                options2[opt] = converterOptions[opt];
              }
            }
          } else {
            throw Error("Converter expects the passed parameter to be an object, but " + typeof converterOptions + " was passed instead.");
          }
          if (options2.extensions) {
            showdown.helper.forEach(options2.extensions, _parseExtension);
          }
        }
        function _parseExtension(ext, name) {
          name = name || null;
          if (showdown.helper.isString(ext)) {
            ext = showdown.helper.stdExtName(ext);
            name = ext;
            if (showdown.extensions[ext]) {
              console.warn("DEPRECATION WARNING: " + ext + " is an old extension that uses a deprecated loading method.Please inform the developer that the extension should be updated!");
              legacyExtensionLoading(showdown.extensions[ext], ext);
              return;
            } else if (!showdown.helper.isUndefined(extensions[ext])) {
              ext = extensions[ext];
            } else {
              throw Error('Extension "' + ext + '" could not be loaded. It was either not found or is not a valid extension.');
            }
          }
          if (typeof ext === "function") {
            ext = ext();
          }
          if (!showdown.helper.isArray(ext)) {
            ext = [ext];
          }
          var validExt = validate(ext, name);
          if (!validExt.valid) {
            throw Error(validExt.error);
          }
          for (var i = 0; i < ext.length; ++i) {
            switch (ext[i].type) {
              case "lang":
                langExtensions.push(ext[i]);
                break;
              case "output":
                outputModifiers.push(ext[i]);
                break;
            }
            if (ext[i].hasOwnProperty("listeners")) {
              for (var ln in ext[i].listeners) {
                if (ext[i].listeners.hasOwnProperty(ln)) {
                  listen(ln, ext[i].listeners[ln]);
                }
              }
            }
          }
        }
        function legacyExtensionLoading(ext, name) {
          if (typeof ext === "function") {
            ext = ext(new showdown.Converter());
          }
          if (!showdown.helper.isArray(ext)) {
            ext = [ext];
          }
          var valid = validate(ext, name);
          if (!valid.valid) {
            throw Error(valid.error);
          }
          for (var i = 0; i < ext.length; ++i) {
            switch (ext[i].type) {
              case "lang":
                langExtensions.push(ext[i]);
                break;
              case "output":
                outputModifiers.push(ext[i]);
                break;
              default:
                throw Error("Extension loader error: Type unrecognized!!!");
            }
          }
        }
        function listen(name, callback) {
          if (!showdown.helper.isString(name)) {
            throw Error("Invalid argument in converter.listen() method: name must be a string, but " + typeof name + " given");
          }
          if (typeof callback !== "function") {
            throw Error("Invalid argument in converter.listen() method: callback must be a function, but " + typeof callback + " given");
          }
          if (!listeners.hasOwnProperty(name)) {
            listeners[name] = [];
          }
          listeners[name].push(callback);
        }
        function rTrimInputText(text) {
          var rsp = text.match(/^\s*/)[0].length, rgx = new RegExp("^\\s{0," + rsp + "}", "gm");
          return text.replace(rgx, "");
        }
        this._dispatch = function dispatch(evtName, text, options3, globals) {
          if (listeners.hasOwnProperty(evtName)) {
            for (var ei = 0; ei < listeners[evtName].length; ++ei) {
              var nText = listeners[evtName][ei](evtName, text, this, options3, globals);
              if (nText && typeof nText !== "undefined") {
                text = nText;
              }
            }
          }
          return text;
        };
        this.listen = function(name, callback) {
          listen(name, callback);
          return this;
        };
        this.makeHtml = function(text) {
          if (!text) {
            return text;
          }
          var globals = {
            gHtmlBlocks: [],
            gHtmlMdBlocks: [],
            gHtmlSpans: [],
            gUrls: {},
            gTitles: {},
            gDimensions: {},
            gListLevel: 0,
            hashLinkCounts: {},
            langExtensions,
            outputModifiers,
            converter: this,
            ghCodeBlocks: [],
            metadata: {
              parsed: {},
              raw: "",
              format: ""
            }
          };
          text = text.replace(/¨/g, "\xA8T");
          text = text.replace(/\$/g, "\xA8D");
          text = text.replace(/\r\n/g, "\n");
          text = text.replace(/\r/g, "\n");
          text = text.replace(/\u00A0/g, "&nbsp;");
          if (options2.smartIndentationFix) {
            text = rTrimInputText(text);
          }
          text = "\n\n" + text + "\n\n";
          text = showdown.subParser("detab")(text, options2, globals);
          text = text.replace(/^[ \t]+$/mg, "");
          showdown.helper.forEach(langExtensions, function(ext) {
            text = showdown.subParser("runExtension")(ext, text, options2, globals);
          });
          text = showdown.subParser("metadata")(text, options2, globals);
          text = showdown.subParser("hashPreCodeTags")(text, options2, globals);
          text = showdown.subParser("githubCodeBlocks")(text, options2, globals);
          text = showdown.subParser("hashHTMLBlocks")(text, options2, globals);
          text = showdown.subParser("hashCodeTags")(text, options2, globals);
          text = showdown.subParser("stripLinkDefinitions")(text, options2, globals);
          text = showdown.subParser("blockGamut")(text, options2, globals);
          text = showdown.subParser("unhashHTMLSpans")(text, options2, globals);
          text = showdown.subParser("unescapeSpecialChars")(text, options2, globals);
          text = text.replace(/¨D/g, "$$");
          text = text.replace(/¨T/g, "\xA8");
          text = showdown.subParser("completeHTMLDocument")(text, options2, globals);
          showdown.helper.forEach(outputModifiers, function(ext) {
            text = showdown.subParser("runExtension")(ext, text, options2, globals);
          });
          metadata = globals.metadata;
          return text;
        };
        this.makeMarkdown = this.makeMd = function(src, HTMLParser) {
          src = src.replace(/\r\n/g, "\n");
          src = src.replace(/\r/g, "\n");
          src = src.replace(/>[ \t]+</, ">\xA8NBSP;<");
          if (!HTMLParser) {
            if (window && window.document) {
              HTMLParser = window.document;
            } else {
              throw new Error("HTMLParser is undefined. If in a webworker or nodejs environment, you need to provide a WHATWG DOM and HTML such as JSDOM");
            }
          }
          var doc = HTMLParser.createElement("div");
          doc.innerHTML = src;
          var globals = {
            preList: substitutePreCodeTags(doc)
          };
          clean(doc);
          var nodes = doc.childNodes, mdDoc = "";
          for (var i = 0; i < nodes.length; i++) {
            mdDoc += showdown.subParser("makeMarkdown.node")(nodes[i], globals);
          }
          function clean(node2) {
            for (var n = 0; n < node2.childNodes.length; ++n) {
              var child = node2.childNodes[n];
              if (child.nodeType === 3) {
                if (!/\S/.test(child.nodeValue)) {
                  node2.removeChild(child);
                  --n;
                } else {
                  child.nodeValue = child.nodeValue.split("\n").join(" ");
                  child.nodeValue = child.nodeValue.replace(/(\s)+/g, "$1");
                }
              } else if (child.nodeType === 1) {
                clean(child);
              }
            }
          }
          function substitutePreCodeTags(doc2) {
            var pres = doc2.querySelectorAll("pre"), presPH = [];
            for (var i2 = 0; i2 < pres.length; ++i2) {
              if (pres[i2].childElementCount === 1 && pres[i2].firstChild.tagName.toLowerCase() === "code") {
                var content = pres[i2].firstChild.innerHTML.trim(), language = pres[i2].firstChild.getAttribute("data-language") || "";
                if (language === "") {
                  var classes = pres[i2].firstChild.className.split(" ");
                  for (var c = 0; c < classes.length; ++c) {
                    var matches = classes[c].match(/^language-(.+)$/);
                    if (matches !== null) {
                      language = matches[1];
                      break;
                    }
                  }
                }
                content = showdown.helper.unescapeHTMLEntities(content);
                presPH.push(content);
                pres[i2].outerHTML = '<precode language="' + language + '" precodenum="' + i2.toString() + '"></precode>';
              } else {
                presPH.push(pres[i2].innerHTML);
                pres[i2].innerHTML = "";
                pres[i2].setAttribute("prenum", i2.toString());
              }
            }
            return presPH;
          }
          return mdDoc;
        };
        this.setOption = function(key, value) {
          options2[key] = value;
        };
        this.getOption = function(key) {
          return options2[key];
        };
        this.getOptions = function() {
          return options2;
        };
        this.addExtension = function(extension2, name) {
          name = name || null;
          _parseExtension(extension2, name);
        };
        this.useExtension = function(extensionName) {
          _parseExtension(extensionName);
        };
        this.setFlavor = function(name) {
          if (!flavor.hasOwnProperty(name)) {
            throw Error(name + " flavor was not found");
          }
          var preset = flavor[name];
          setConvFlavor = name;
          for (var option in preset) {
            if (preset.hasOwnProperty(option)) {
              options2[option] = preset[option];
            }
          }
        };
        this.getFlavor = function() {
          return setConvFlavor;
        };
        this.removeExtension = function(extension2) {
          if (!showdown.helper.isArray(extension2)) {
            extension2 = [extension2];
          }
          for (var a = 0; a < extension2.length; ++a) {
            var ext = extension2[a];
            for (var i = 0; i < langExtensions.length; ++i) {
              if (langExtensions[i] === ext) {
                langExtensions[i].splice(i, 1);
              }
            }
            for (var ii = 0; ii < outputModifiers.length; ++i) {
              if (outputModifiers[ii] === ext) {
                outputModifiers[ii].splice(i, 1);
              }
            }
          }
        };
        this.getAllExtensions = function() {
          return {
            language: langExtensions,
            output: outputModifiers
          };
        };
        this.getMetadata = function(raw) {
          if (raw) {
            return metadata.raw;
          } else {
            return metadata.parsed;
          }
        };
        this.getMetadataFormat = function() {
          return metadata.format;
        };
        this._setMetadataPair = function(key, value) {
          metadata.parsed[key] = value;
        };
        this._setMetadataFormat = function(format) {
          metadata.format = format;
        };
        this._setMetadataRaw = function(raw) {
          metadata.raw = raw;
        };
      };
      showdown.subParser("anchors", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("anchors.before", text, options2, globals);
        var writeAnchorTag = function(wholeMatch, linkText, linkId, url, m5, m6, title) {
          if (showdown.helper.isUndefined(title)) {
            title = "";
          }
          linkId = linkId.toLowerCase();
          if (wholeMatch.search(/\(<?\s*>? ?(['"].*['"])?\)$/m) > -1) {
            url = "";
          } else if (!url) {
            if (!linkId) {
              linkId = linkText.toLowerCase().replace(/ ?\n/g, " ");
            }
            url = "#" + linkId;
            if (!showdown.helper.isUndefined(globals.gUrls[linkId])) {
              url = globals.gUrls[linkId];
              if (!showdown.helper.isUndefined(globals.gTitles[linkId])) {
                title = globals.gTitles[linkId];
              }
            } else {
              return wholeMatch;
            }
          }
          url = url.replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
          var result = '<a href="' + url + '"';
          if (title !== "" && title !== null) {
            title = title.replace(/"/g, "&quot;");
            title = title.replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
            result += ' title="' + title + '"';
          }
          if (options2.openLinksInNewWindow && !/^#/.test(url)) {
            result += ' rel="noopener noreferrer" target="\xA8E95Eblank"';
          }
          result += ">" + linkText + "</a>";
          return result;
        };
        text = text.replace(/\[((?:\[[^\]]*]|[^\[\]])*)] ?(?:\n *)?\[(.*?)]()()()()/g, writeAnchorTag);
        text = text.replace(
          /\[((?:\[[^\]]*]|[^\[\]])*)]()[ \t]*\([ \t]?<([^>]*)>(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g,
          writeAnchorTag
        );
        text = text.replace(
          /\[((?:\[[^\]]*]|[^\[\]])*)]()[ \t]*\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g,
          writeAnchorTag
        );
        text = text.replace(/\[([^\[\]]+)]()()()()()/g, writeAnchorTag);
        if (options2.ghMentions) {
          text = text.replace(/(^|\s)(\\)?(@([a-z\d]+(?:[a-z\d.-]+?[a-z\d]+)*))/gmi, function(wm, st, escape, mentions, username) {
            if (escape === "\\") {
              return st + mentions;
            }
            if (!showdown.helper.isString(options2.ghMentionsLink)) {
              throw new Error("ghMentionsLink option must be a string");
            }
            var lnk = options2.ghMentionsLink.replace(/\{u}/g, username), target = "";
            if (options2.openLinksInNewWindow) {
              target = ' rel="noopener noreferrer" target="\xA8E95Eblank"';
            }
            return st + '<a href="' + lnk + '"' + target + ">" + mentions + "</a>";
          });
        }
        text = globals.converter._dispatch("anchors.after", text, options2, globals);
        return text;
      });
      var simpleURLRegex = /([*~_]+|\b)(((https?|ftp|dict):\/\/|www\.)[^'">\s]+?\.[^'">\s]+?)()(\1)?(?=\s|$)(?!["<>])/gi, simpleURLRegex2 = /([*~_]+|\b)(((https?|ftp|dict):\/\/|www\.)[^'">\s]+\.[^'">\s]+?)([.!?,()\[\]])?(\1)?(?=\s|$)(?!["<>])/gi, delimUrlRegex = /()<(((https?|ftp|dict):\/\/|www\.)[^'">\s]+)()>()/gi, simpleMailRegex = /(^|\s)(?:mailto:)?([A-Za-z0-9!#$%&'*+-/=?^_`{|}~.]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)(?=$|\s)/gmi, delimMailRegex = /<()(?:mailto:)?([-.\w]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi, replaceLink = function(options2) {
        "use strict";
        return function(wm, leadingMagicChars, link, m2, m3, trailingPunctuation, trailingMagicChars) {
          link = link.replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
          var lnkTxt = link, append2 = "", target = "", lmc = leadingMagicChars || "", tmc = trailingMagicChars || "";
          if (/^www\./i.test(link)) {
            link = link.replace(/^www\./i, "http://www.");
          }
          if (options2.excludeTrailingPunctuationFromURLs && trailingPunctuation) {
            append2 = trailingPunctuation;
          }
          if (options2.openLinksInNewWindow) {
            target = ' rel="noopener noreferrer" target="\xA8E95Eblank"';
          }
          return lmc + '<a href="' + link + '"' + target + ">" + lnkTxt + "</a>" + append2 + tmc;
        };
      }, replaceMail = function(options2, globals) {
        "use strict";
        return function(wholeMatch, b, mail) {
          var href = "mailto:";
          b = b || "";
          mail = showdown.subParser("unescapeSpecialChars")(mail, options2, globals);
          if (options2.encodeEmails) {
            href = showdown.helper.encodeEmailAddress(href + mail);
            mail = showdown.helper.encodeEmailAddress(mail);
          } else {
            href = href + mail;
          }
          return b + '<a href="' + href + '">' + mail + "</a>";
        };
      };
      showdown.subParser("autoLinks", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("autoLinks.before", text, options2, globals);
        text = text.replace(delimUrlRegex, replaceLink(options2));
        text = text.replace(delimMailRegex, replaceMail(options2, globals));
        text = globals.converter._dispatch("autoLinks.after", text, options2, globals);
        return text;
      });
      showdown.subParser("simplifiedAutoLinks", function(text, options2, globals) {
        "use strict";
        if (!options2.simplifiedAutoLink) {
          return text;
        }
        text = globals.converter._dispatch("simplifiedAutoLinks.before", text, options2, globals);
        if (options2.excludeTrailingPunctuationFromURLs) {
          text = text.replace(simpleURLRegex2, replaceLink(options2));
        } else {
          text = text.replace(simpleURLRegex, replaceLink(options2));
        }
        text = text.replace(simpleMailRegex, replaceMail(options2, globals));
        text = globals.converter._dispatch("simplifiedAutoLinks.after", text, options2, globals);
        return text;
      });
      showdown.subParser("blockGamut", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("blockGamut.before", text, options2, globals);
        text = showdown.subParser("blockQuotes")(text, options2, globals);
        text = showdown.subParser("headers")(text, options2, globals);
        text = showdown.subParser("horizontalRule")(text, options2, globals);
        text = showdown.subParser("lists")(text, options2, globals);
        text = showdown.subParser("codeBlocks")(text, options2, globals);
        text = showdown.subParser("tables")(text, options2, globals);
        text = showdown.subParser("hashHTMLBlocks")(text, options2, globals);
        text = showdown.subParser("paragraphs")(text, options2, globals);
        text = globals.converter._dispatch("blockGamut.after", text, options2, globals);
        return text;
      });
      showdown.subParser("blockQuotes", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("blockQuotes.before", text, options2, globals);
        text = text + "\n\n";
        var rgx = /(^ {0,3}>[ \t]?.+\n(.+\n)*\n*)+/gm;
        if (options2.splitAdjacentBlockquotes) {
          rgx = /^ {0,3}>[\s\S]*?(?:\n\n)/gm;
        }
        text = text.replace(rgx, function(bq) {
          bq = bq.replace(/^[ \t]*>[ \t]?/gm, "");
          bq = bq.replace(/¨0/g, "");
          bq = bq.replace(/^[ \t]+$/gm, "");
          bq = showdown.subParser("githubCodeBlocks")(bq, options2, globals);
          bq = showdown.subParser("blockGamut")(bq, options2, globals);
          bq = bq.replace(/(^|\n)/g, "$1  ");
          bq = bq.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm, function(wholeMatch, m1) {
            var pre = m1;
            pre = pre.replace(/^  /mg, "\xA80");
            pre = pre.replace(/¨0/g, "");
            return pre;
          });
          return showdown.subParser("hashBlock")("<blockquote>\n" + bq + "\n</blockquote>", options2, globals);
        });
        text = globals.converter._dispatch("blockQuotes.after", text, options2, globals);
        return text;
      });
      showdown.subParser("codeBlocks", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("codeBlocks.before", text, options2, globals);
        text += "\xA80";
        var pattern = /(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=¨0))/g;
        text = text.replace(pattern, function(wholeMatch, m1, m2) {
          var codeblock = m1, nextChar = m2, end = "\n";
          codeblock = showdown.subParser("outdent")(codeblock, options2, globals);
          codeblock = showdown.subParser("encodeCode")(codeblock, options2, globals);
          codeblock = showdown.subParser("detab")(codeblock, options2, globals);
          codeblock = codeblock.replace(/^\n+/g, "");
          codeblock = codeblock.replace(/\n+$/g, "");
          if (options2.omitExtraWLInCodeBlocks) {
            end = "";
          }
          codeblock = "<pre><code>" + codeblock + end + "</code></pre>";
          return showdown.subParser("hashBlock")(codeblock, options2, globals) + nextChar;
        });
        text = text.replace(/¨0/, "");
        text = globals.converter._dispatch("codeBlocks.after", text, options2, globals);
        return text;
      });
      showdown.subParser("codeSpans", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("codeSpans.before", text, options2, globals);
        if (typeof text === "undefined") {
          text = "";
        }
        text = text.replace(
          /(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,
          function(wholeMatch, m1, m2, m3) {
            var c = m3;
            c = c.replace(/^([ \t]*)/g, "");
            c = c.replace(/[ \t]*$/g, "");
            c = showdown.subParser("encodeCode")(c, options2, globals);
            c = m1 + "<code>" + c + "</code>";
            c = showdown.subParser("hashHTMLSpans")(c, options2, globals);
            return c;
          }
        );
        text = globals.converter._dispatch("codeSpans.after", text, options2, globals);
        return text;
      });
      showdown.subParser("completeHTMLDocument", function(text, options2, globals) {
        "use strict";
        if (!options2.completeHTMLDocument) {
          return text;
        }
        text = globals.converter._dispatch("completeHTMLDocument.before", text, options2, globals);
        var doctype = "html", doctypeParsed = "<!DOCTYPE HTML>\n", title = "", charset = '<meta charset="utf-8">\n', lang = "", metadata = "";
        if (typeof globals.metadata.parsed.doctype !== "undefined") {
          doctypeParsed = "<!DOCTYPE " + globals.metadata.parsed.doctype + ">\n";
          doctype = globals.metadata.parsed.doctype.toString().toLowerCase();
          if (doctype === "html" || doctype === "html5") {
            charset = '<meta charset="utf-8">';
          }
        }
        for (var meta in globals.metadata.parsed) {
          if (globals.metadata.parsed.hasOwnProperty(meta)) {
            switch (meta.toLowerCase()) {
              case "doctype":
                break;
              case "title":
                title = "<title>" + globals.metadata.parsed.title + "</title>\n";
                break;
              case "charset":
                if (doctype === "html" || doctype === "html5") {
                  charset = '<meta charset="' + globals.metadata.parsed.charset + '">\n';
                } else {
                  charset = '<meta name="charset" content="' + globals.metadata.parsed.charset + '">\n';
                }
                break;
              case "language":
              case "lang":
                lang = ' lang="' + globals.metadata.parsed[meta] + '"';
                metadata += '<meta name="' + meta + '" content="' + globals.metadata.parsed[meta] + '">\n';
                break;
              default:
                metadata += '<meta name="' + meta + '" content="' + globals.metadata.parsed[meta] + '">\n';
            }
          }
        }
        text = doctypeParsed + "<html" + lang + ">\n<head>\n" + title + charset + metadata + "</head>\n<body>\n" + text.trim() + "\n</body>\n</html>";
        text = globals.converter._dispatch("completeHTMLDocument.after", text, options2, globals);
        return text;
      });
      showdown.subParser("detab", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("detab.before", text, options2, globals);
        text = text.replace(/\t(?=\t)/g, "    ");
        text = text.replace(/\t/g, "\xA8A\xA8B");
        text = text.replace(/¨B(.+?)¨A/g, function(wholeMatch, m1) {
          var leadingText = m1, numSpaces = 4 - leadingText.length % 4;
          for (var i = 0; i < numSpaces; i++) {
            leadingText += " ";
          }
          return leadingText;
        });
        text = text.replace(/¨A/g, "    ");
        text = text.replace(/¨B/g, "");
        text = globals.converter._dispatch("detab.after", text, options2, globals);
        return text;
      });
      showdown.subParser("ellipsis", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("ellipsis.before", text, options2, globals);
        text = text.replace(/\.\.\./g, "\u2026");
        text = globals.converter._dispatch("ellipsis.after", text, options2, globals);
        return text;
      });
      showdown.subParser("emoji", function(text, options2, globals) {
        "use strict";
        if (!options2.emoji) {
          return text;
        }
        text = globals.converter._dispatch("emoji.before", text, options2, globals);
        var emojiRgx = /:([\S]+?):/g;
        text = text.replace(emojiRgx, function(wm, emojiCode) {
          if (showdown.helper.emojis.hasOwnProperty(emojiCode)) {
            return showdown.helper.emojis[emojiCode];
          }
          return wm;
        });
        text = globals.converter._dispatch("emoji.after", text, options2, globals);
        return text;
      });
      showdown.subParser("encodeAmpsAndAngles", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("encodeAmpsAndAngles.before", text, options2, globals);
        text = text.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g, "&amp;");
        text = text.replace(/<(?![a-z\/?$!])/gi, "&lt;");
        text = text.replace(/</g, "&lt;");
        text = text.replace(/>/g, "&gt;");
        text = globals.converter._dispatch("encodeAmpsAndAngles.after", text, options2, globals);
        return text;
      });
      showdown.subParser("encodeBackslashEscapes", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("encodeBackslashEscapes.before", text, options2, globals);
        text = text.replace(/\\(\\)/g, showdown.helper.escapeCharactersCallback);
        text = text.replace(/\\([`*_{}\[\]()>#+.!~=|-])/g, showdown.helper.escapeCharactersCallback);
        text = globals.converter._dispatch("encodeBackslashEscapes.after", text, options2, globals);
        return text;
      });
      showdown.subParser("encodeCode", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("encodeCode.before", text, options2, globals);
        text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/([*_{}\[\]\\=~-])/g, showdown.helper.escapeCharactersCallback);
        text = globals.converter._dispatch("encodeCode.after", text, options2, globals);
        return text;
      });
      showdown.subParser("escapeSpecialCharsWithinTagAttributes", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("escapeSpecialCharsWithinTagAttributes.before", text, options2, globals);
        var tags = /<\/?[a-z\d_:-]+(?:[\s]+[\s\S]+?)?>/gi, comments = /<!(--(?:(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>/gi;
        text = text.replace(tags, function(wholeMatch) {
          return wholeMatch.replace(/(.)<\/?code>(?=.)/g, "$1`").replace(/([\\`*_~=|])/g, showdown.helper.escapeCharactersCallback);
        });
        text = text.replace(comments, function(wholeMatch) {
          return wholeMatch.replace(/([\\`*_~=|])/g, showdown.helper.escapeCharactersCallback);
        });
        text = globals.converter._dispatch("escapeSpecialCharsWithinTagAttributes.after", text, options2, globals);
        return text;
      });
      showdown.subParser("githubCodeBlocks", function(text, options2, globals) {
        "use strict";
        if (!options2.ghCodeBlocks) {
          return text;
        }
        text = globals.converter._dispatch("githubCodeBlocks.before", text, options2, globals);
        text += "\xA80";
        text = text.replace(/(?:^|\n)(?: {0,3})(```+|~~~+)(?: *)([^\s`~]*)\n([\s\S]*?)\n(?: {0,3})\1/g, function(wholeMatch, delim, language, codeblock) {
          var end = options2.omitExtraWLInCodeBlocks ? "" : "\n";
          codeblock = showdown.subParser("encodeCode")(codeblock, options2, globals);
          codeblock = showdown.subParser("detab")(codeblock, options2, globals);
          codeblock = codeblock.replace(/^\n+/g, "");
          codeblock = codeblock.replace(/\n+$/g, "");
          codeblock = "<pre><code" + (language ? ' class="' + language + " language-" + language + '"' : "") + ">" + codeblock + end + "</code></pre>";
          codeblock = showdown.subParser("hashBlock")(codeblock, options2, globals);
          return "\n\n\xA8G" + (globals.ghCodeBlocks.push({ text: wholeMatch, codeblock }) - 1) + "G\n\n";
        });
        text = text.replace(/¨0/, "");
        return globals.converter._dispatch("githubCodeBlocks.after", text, options2, globals);
      });
      showdown.subParser("hashBlock", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("hashBlock.before", text, options2, globals);
        text = text.replace(/(^\n+|\n+$)/g, "");
        text = "\n\n\xA8K" + (globals.gHtmlBlocks.push(text) - 1) + "K\n\n";
        text = globals.converter._dispatch("hashBlock.after", text, options2, globals);
        return text;
      });
      showdown.subParser("hashCodeTags", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("hashCodeTags.before", text, options2, globals);
        var repFunc = function(wholeMatch, match2, left, right) {
          var codeblock = left + showdown.subParser("encodeCode")(match2, options2, globals) + right;
          return "\xA8C" + (globals.gHtmlSpans.push(codeblock) - 1) + "C";
        };
        text = showdown.helper.replaceRecursiveRegExp(text, repFunc, "<code\\b[^>]*>", "</code>", "gim");
        text = globals.converter._dispatch("hashCodeTags.after", text, options2, globals);
        return text;
      });
      showdown.subParser("hashElement", function(text, options2, globals) {
        "use strict";
        return function(wholeMatch, m1) {
          var blockText = m1;
          blockText = blockText.replace(/\n\n/g, "\n");
          blockText = blockText.replace(/^\n/, "");
          blockText = blockText.replace(/\n+$/g, "");
          blockText = "\n\n\xA8K" + (globals.gHtmlBlocks.push(blockText) - 1) + "K\n\n";
          return blockText;
        };
      });
      showdown.subParser("hashHTMLBlocks", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("hashHTMLBlocks.before", text, options2, globals);
        var blockTags = [
          "pre",
          "div",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "blockquote",
          "table",
          "dl",
          "ol",
          "ul",
          "script",
          "noscript",
          "form",
          "fieldset",
          "iframe",
          "math",
          "style",
          "section",
          "header",
          "footer",
          "nav",
          "article",
          "aside",
          "address",
          "audio",
          "canvas",
          "figure",
          "hgroup",
          "output",
          "video",
          "p"
        ], repFunc = function(wholeMatch, match2, left, right) {
          var txt = wholeMatch;
          if (left.search(/\bmarkdown\b/) !== -1) {
            txt = left + globals.converter.makeHtml(match2) + right;
          }
          return "\n\n\xA8K" + (globals.gHtmlBlocks.push(txt) - 1) + "K\n\n";
        };
        if (options2.backslashEscapesHTMLTags) {
          text = text.replace(/\\<(\/?[^>]+?)>/g, function(wm, inside) {
            return "&lt;" + inside + "&gt;";
          });
        }
        for (var i = 0; i < blockTags.length; ++i) {
          var opTagPos, rgx1 = new RegExp("^ {0,3}(<" + blockTags[i] + "\\b[^>]*>)", "im"), patLeft = "<" + blockTags[i] + "\\b[^>]*>", patRight = "</" + blockTags[i] + ">";
          while ((opTagPos = showdown.helper.regexIndexOf(text, rgx1)) !== -1) {
            var subTexts = showdown.helper.splitAtIndex(text, opTagPos), newSubText1 = showdown.helper.replaceRecursiveRegExp(subTexts[1], repFunc, patLeft, patRight, "im");
            if (newSubText1 === subTexts[1]) {
              break;
            }
            text = subTexts[0].concat(newSubText1);
          }
        }
        text = text.replace(
          /(\n {0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,
          showdown.subParser("hashElement")(text, options2, globals)
        );
        text = showdown.helper.replaceRecursiveRegExp(text, function(txt) {
          return "\n\n\xA8K" + (globals.gHtmlBlocks.push(txt) - 1) + "K\n\n";
        }, "^ {0,3}<!--", "-->", "gm");
        text = text.replace(
          /(?:\n\n)( {0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,
          showdown.subParser("hashElement")(text, options2, globals)
        );
        text = globals.converter._dispatch("hashHTMLBlocks.after", text, options2, globals);
        return text;
      });
      showdown.subParser("hashHTMLSpans", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("hashHTMLSpans.before", text, options2, globals);
        function hashHTMLSpan(html) {
          return "\xA8C" + (globals.gHtmlSpans.push(html) - 1) + "C";
        }
        text = text.replace(/<[^>]+?\/>/gi, function(wm) {
          return hashHTMLSpan(wm);
        });
        text = text.replace(/<([^>]+?)>[\s\S]*?<\/\1>/g, function(wm) {
          return hashHTMLSpan(wm);
        });
        text = text.replace(/<([^>]+?)\s[^>]+?>[\s\S]*?<\/\1>/g, function(wm) {
          return hashHTMLSpan(wm);
        });
        text = text.replace(/<[^>]+?>/gi, function(wm) {
          return hashHTMLSpan(wm);
        });
        text = globals.converter._dispatch("hashHTMLSpans.after", text, options2, globals);
        return text;
      });
      showdown.subParser("unhashHTMLSpans", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("unhashHTMLSpans.before", text, options2, globals);
        for (var i = 0; i < globals.gHtmlSpans.length; ++i) {
          var repText = globals.gHtmlSpans[i], limit = 0;
          while (/¨C(\d+)C/.test(repText)) {
            var num = RegExp.$1;
            repText = repText.replace("\xA8C" + num + "C", globals.gHtmlSpans[num]);
            if (limit === 10) {
              console.error("maximum nesting of 10 spans reached!!!");
              break;
            }
            ++limit;
          }
          text = text.replace("\xA8C" + i + "C", repText);
        }
        text = globals.converter._dispatch("unhashHTMLSpans.after", text, options2, globals);
        return text;
      });
      showdown.subParser("hashPreCodeTags", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("hashPreCodeTags.before", text, options2, globals);
        var repFunc = function(wholeMatch, match2, left, right) {
          var codeblock = left + showdown.subParser("encodeCode")(match2, options2, globals) + right;
          return "\n\n\xA8G" + (globals.ghCodeBlocks.push({ text: wholeMatch, codeblock }) - 1) + "G\n\n";
        };
        text = showdown.helper.replaceRecursiveRegExp(text, repFunc, "^ {0,3}<pre\\b[^>]*>\\s*<code\\b[^>]*>", "^ {0,3}</code>\\s*</pre>", "gim");
        text = globals.converter._dispatch("hashPreCodeTags.after", text, options2, globals);
        return text;
      });
      showdown.subParser("headers", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("headers.before", text, options2, globals);
        var headerLevelStart = isNaN(parseInt(options2.headerLevelStart)) ? 1 : parseInt(options2.headerLevelStart), setextRegexH1 = options2.smoothLivePreview ? /^(.+)[ \t]*\n={2,}[ \t]*\n+/gm : /^(.+)[ \t]*\n=+[ \t]*\n+/gm, setextRegexH2 = options2.smoothLivePreview ? /^(.+)[ \t]*\n-{2,}[ \t]*\n+/gm : /^(.+)[ \t]*\n-+[ \t]*\n+/gm;
        text = text.replace(setextRegexH1, function(wholeMatch, m1) {
          var spanGamut = showdown.subParser("spanGamut")(m1, options2, globals), hID = options2.noHeaderId ? "" : ' id="' + headerId(m1) + '"', hLevel = headerLevelStart, hashBlock = "<h" + hLevel + hID + ">" + spanGamut + "</h" + hLevel + ">";
          return showdown.subParser("hashBlock")(hashBlock, options2, globals);
        });
        text = text.replace(setextRegexH2, function(matchFound, m1) {
          var spanGamut = showdown.subParser("spanGamut")(m1, options2, globals), hID = options2.noHeaderId ? "" : ' id="' + headerId(m1) + '"', hLevel = headerLevelStart + 1, hashBlock = "<h" + hLevel + hID + ">" + spanGamut + "</h" + hLevel + ">";
          return showdown.subParser("hashBlock")(hashBlock, options2, globals);
        });
        var atxStyle = options2.requireSpaceBeforeHeadingText ? /^(#{1,6})[ \t]+(.+?)[ \t]*#*\n+/gm : /^(#{1,6})[ \t]*(.+?)[ \t]*#*\n+/gm;
        text = text.replace(atxStyle, function(wholeMatch, m1, m2) {
          var hText = m2;
          if (options2.customizedHeaderId) {
            hText = m2.replace(/\s?\{([^{]+?)}\s*$/, "");
          }
          var span = showdown.subParser("spanGamut")(hText, options2, globals), hID = options2.noHeaderId ? "" : ' id="' + headerId(m2) + '"', hLevel = headerLevelStart - 1 + m1.length, header = "<h" + hLevel + hID + ">" + span + "</h" + hLevel + ">";
          return showdown.subParser("hashBlock")(header, options2, globals);
        });
        function headerId(m) {
          var title, prefix2;
          if (options2.customizedHeaderId) {
            var match2 = m.match(/\{([^{]+?)}\s*$/);
            if (match2 && match2[1]) {
              m = match2[1];
            }
          }
          title = m;
          if (showdown.helper.isString(options2.prefixHeaderId)) {
            prefix2 = options2.prefixHeaderId;
          } else if (options2.prefixHeaderId === true) {
            prefix2 = "section-";
          } else {
            prefix2 = "";
          }
          if (!options2.rawPrefixHeaderId) {
            title = prefix2 + title;
          }
          if (options2.ghCompatibleHeaderId) {
            title = title.replace(/ /g, "-").replace(/&amp;/g, "").replace(/¨T/g, "").replace(/¨D/g, "").replace(/[&+$,\/:;=?@"#{}|^¨~\[\]`\\*)(%.!'<>]/g, "").toLowerCase();
          } else if (options2.rawHeaderId) {
            title = title.replace(/ /g, "-").replace(/&amp;/g, "&").replace(/¨T/g, "\xA8").replace(/¨D/g, "$").replace(/["']/g, "-").toLowerCase();
          } else {
            title = title.replace(/[^\w]/g, "").toLowerCase();
          }
          if (options2.rawPrefixHeaderId) {
            title = prefix2 + title;
          }
          if (globals.hashLinkCounts[title]) {
            title = title + "-" + globals.hashLinkCounts[title]++;
          } else {
            globals.hashLinkCounts[title] = 1;
          }
          return title;
        }
        text = globals.converter._dispatch("headers.after", text, options2, globals);
        return text;
      });
      showdown.subParser("horizontalRule", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("horizontalRule.before", text, options2, globals);
        var key = showdown.subParser("hashBlock")("<hr />", options2, globals);
        text = text.replace(/^ {0,2}( ?-){3,}[ \t]*$/gm, key);
        text = text.replace(/^ {0,2}( ?\*){3,}[ \t]*$/gm, key);
        text = text.replace(/^ {0,2}( ?_){3,}[ \t]*$/gm, key);
        text = globals.converter._dispatch("horizontalRule.after", text, options2, globals);
        return text;
      });
      showdown.subParser("images", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("images.before", text, options2, globals);
        var inlineRegExp = /!\[([^\]]*?)][ \t]*()\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g, crazyRegExp = /!\[([^\]]*?)][ \t]*()\([ \t]?<([^>]*)>(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(?:(["'])([^"]*?)\6))?[ \t]?\)/g, base64RegExp = /!\[([^\]]*?)][ \t]*()\([ \t]?<?(data:.+?\/.+?;base64,[A-Za-z0-9+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g, referenceRegExp = /!\[([^\]]*?)] ?(?:\n *)?\[([\s\S]*?)]()()()()()/g, refShortcutRegExp = /!\[([^\[\]]+)]()()()()()/g;
        function writeImageTagBase64(wholeMatch, altText, linkId, url, width, height, m5, title) {
          url = url.replace(/\s/g, "");
          return writeImageTag(wholeMatch, altText, linkId, url, width, height, m5, title);
        }
        function writeImageTag(wholeMatch, altText, linkId, url, width, height, m5, title) {
          var gUrls = globals.gUrls, gTitles = globals.gTitles, gDims = globals.gDimensions;
          linkId = linkId.toLowerCase();
          if (!title) {
            title = "";
          }
          if (wholeMatch.search(/\(<?\s*>? ?(['"].*['"])?\)$/m) > -1) {
            url = "";
          } else if (url === "" || url === null) {
            if (linkId === "" || linkId === null) {
              linkId = altText.toLowerCase().replace(/ ?\n/g, " ");
            }
            url = "#" + linkId;
            if (!showdown.helper.isUndefined(gUrls[linkId])) {
              url = gUrls[linkId];
              if (!showdown.helper.isUndefined(gTitles[linkId])) {
                title = gTitles[linkId];
              }
              if (!showdown.helper.isUndefined(gDims[linkId])) {
                width = gDims[linkId].width;
                height = gDims[linkId].height;
              }
            } else {
              return wholeMatch;
            }
          }
          altText = altText.replace(/"/g, "&quot;").replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
          url = url.replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
          var result = '<img src="' + url + '" alt="' + altText + '"';
          if (title && showdown.helper.isString(title)) {
            title = title.replace(/"/g, "&quot;").replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
            result += ' title="' + title + '"';
          }
          if (width && height) {
            width = width === "*" ? "auto" : width;
            height = height === "*" ? "auto" : height;
            result += ' width="' + width + '"';
            result += ' height="' + height + '"';
          }
          result += " />";
          return result;
        }
        text = text.replace(referenceRegExp, writeImageTag);
        text = text.replace(base64RegExp, writeImageTagBase64);
        text = text.replace(crazyRegExp, writeImageTag);
        text = text.replace(inlineRegExp, writeImageTag);
        text = text.replace(refShortcutRegExp, writeImageTag);
        text = globals.converter._dispatch("images.after", text, options2, globals);
        return text;
      });
      showdown.subParser("italicsAndBold", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("italicsAndBold.before", text, options2, globals);
        function parseInside(txt, left, right) {
          return left + txt + right;
        }
        if (options2.literalMidWordUnderscores) {
          text = text.replace(/\b___(\S[\s\S]*?)___\b/g, function(wm, txt) {
            return parseInside(txt, "<strong><em>", "</em></strong>");
          });
          text = text.replace(/\b__(\S[\s\S]*?)__\b/g, function(wm, txt) {
            return parseInside(txt, "<strong>", "</strong>");
          });
          text = text.replace(/\b_(\S[\s\S]*?)_\b/g, function(wm, txt) {
            return parseInside(txt, "<em>", "</em>");
          });
        } else {
          text = text.replace(/___(\S[\s\S]*?)___/g, function(wm, m) {
            return /\S$/.test(m) ? parseInside(m, "<strong><em>", "</em></strong>") : wm;
          });
          text = text.replace(/__(\S[\s\S]*?)__/g, function(wm, m) {
            return /\S$/.test(m) ? parseInside(m, "<strong>", "</strong>") : wm;
          });
          text = text.replace(/_([^\s_][\s\S]*?)_/g, function(wm, m) {
            return /\S$/.test(m) ? parseInside(m, "<em>", "</em>") : wm;
          });
        }
        if (options2.literalMidWordAsterisks) {
          text = text.replace(/([^*]|^)\B\*\*\*(\S[\s\S]*?)\*\*\*\B(?!\*)/g, function(wm, lead, txt) {
            return parseInside(txt, lead + "<strong><em>", "</em></strong>");
          });
          text = text.replace(/([^*]|^)\B\*\*(\S[\s\S]*?)\*\*\B(?!\*)/g, function(wm, lead, txt) {
            return parseInside(txt, lead + "<strong>", "</strong>");
          });
          text = text.replace(/([^*]|^)\B\*(\S[\s\S]*?)\*\B(?!\*)/g, function(wm, lead, txt) {
            return parseInside(txt, lead + "<em>", "</em>");
          });
        } else {
          text = text.replace(/\*\*\*(\S[\s\S]*?)\*\*\*/g, function(wm, m) {
            return /\S$/.test(m) ? parseInside(m, "<strong><em>", "</em></strong>") : wm;
          });
          text = text.replace(/\*\*(\S[\s\S]*?)\*\*/g, function(wm, m) {
            return /\S$/.test(m) ? parseInside(m, "<strong>", "</strong>") : wm;
          });
          text = text.replace(/\*([^\s*][\s\S]*?)\*/g, function(wm, m) {
            return /\S$/.test(m) ? parseInside(m, "<em>", "</em>") : wm;
          });
        }
        text = globals.converter._dispatch("italicsAndBold.after", text, options2, globals);
        return text;
      });
      showdown.subParser("lists", function(text, options2, globals) {
        "use strict";
        function processListItems(listStr, trimTrailing) {
          globals.gListLevel++;
          listStr = listStr.replace(/\n{2,}$/, "\n");
          listStr += "\xA80";
          var rgx = /(\n)?(^ {0,3})([*+-]|\d+[.])[ \t]+((\[(x|X| )?])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(¨0| {0,3}([*+-]|\d+[.])[ \t]+))/gm, isParagraphed = /\n[ \t]*\n(?!¨0)/.test(listStr);
          if (options2.disableForced4SpacesIndentedSublists) {
            rgx = /(\n)?(^ {0,3})([*+-]|\d+[.])[ \t]+((\[(x|X| )?])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(¨0|\2([*+-]|\d+[.])[ \t]+))/gm;
          }
          listStr = listStr.replace(rgx, function(wholeMatch, m1, m2, m3, m4, taskbtn, checked) {
            checked = checked && checked.trim() !== "";
            var item = showdown.subParser("outdent")(m4, options2, globals), bulletStyle = "";
            if (taskbtn && options2.tasklists) {
              bulletStyle = ' class="task-list-item" style="list-style-type: none;"';
              item = item.replace(/^[ \t]*\[(x|X| )?]/m, function() {
                var otp = '<input type="checkbox" disabled style="margin: 0px 0.35em 0.25em -1.6em; vertical-align: middle;"';
                if (checked) {
                  otp += " checked";
                }
                otp += ">";
                return otp;
              });
            }
            item = item.replace(/^([-*+]|\d\.)[ \t]+[\S\n ]*/g, function(wm2) {
              return "\xA8A" + wm2;
            });
            if (m1 || item.search(/\n{2,}/) > -1) {
              item = showdown.subParser("githubCodeBlocks")(item, options2, globals);
              item = showdown.subParser("blockGamut")(item, options2, globals);
            } else {
              item = showdown.subParser("lists")(item, options2, globals);
              item = item.replace(/\n$/, "");
              item = showdown.subParser("hashHTMLBlocks")(item, options2, globals);
              item = item.replace(/\n\n+/g, "\n\n");
              if (isParagraphed) {
                item = showdown.subParser("paragraphs")(item, options2, globals);
              } else {
                item = showdown.subParser("spanGamut")(item, options2, globals);
              }
            }
            item = item.replace("\xA8A", "");
            item = "<li" + bulletStyle + ">" + item + "</li>\n";
            return item;
          });
          listStr = listStr.replace(/¨0/g, "");
          globals.gListLevel--;
          if (trimTrailing) {
            listStr = listStr.replace(/\s+$/, "");
          }
          return listStr;
        }
        function styleStartNumber(list, listType) {
          if (listType === "ol") {
            var res = list.match(/^ *(\d+)\./);
            if (res && res[1] !== "1") {
              return ' start="' + res[1] + '"';
            }
          }
          return "";
        }
        function parseConsecutiveLists(list, listType, trimTrailing) {
          var olRgx = options2.disableForced4SpacesIndentedSublists ? /^ ?\d+\.[ \t]/gm : /^ {0,3}\d+\.[ \t]/gm, ulRgx = options2.disableForced4SpacesIndentedSublists ? /^ ?[*+-][ \t]/gm : /^ {0,3}[*+-][ \t]/gm, counterRxg = listType === "ul" ? olRgx : ulRgx, result = "";
          if (list.search(counterRxg) !== -1) {
            (function parseCL(txt) {
              var pos = txt.search(counterRxg), style2 = styleStartNumber(list, listType);
              if (pos !== -1) {
                result += "\n\n<" + listType + style2 + ">\n" + processListItems(txt.slice(0, pos), !!trimTrailing) + "</" + listType + ">\n";
                listType = listType === "ul" ? "ol" : "ul";
                counterRxg = listType === "ul" ? olRgx : ulRgx;
                parseCL(txt.slice(pos));
              } else {
                result += "\n\n<" + listType + style2 + ">\n" + processListItems(txt, !!trimTrailing) + "</" + listType + ">\n";
              }
            })(list);
          } else {
            var style = styleStartNumber(list, listType);
            result = "\n\n<" + listType + style + ">\n" + processListItems(list, !!trimTrailing) + "</" + listType + ">\n";
          }
          return result;
        }
        text = globals.converter._dispatch("lists.before", text, options2, globals);
        text += "\xA80";
        if (globals.gListLevel) {
          text = text.replace(
            /^(( {0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(¨0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm,
            function(wholeMatch, list, m2) {
              var listType = m2.search(/[*+-]/g) > -1 ? "ul" : "ol";
              return parseConsecutiveLists(list, listType, true);
            }
          );
        } else {
          text = text.replace(
            /(\n\n|^\n?)(( {0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(¨0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm,
            function(wholeMatch, m1, list, m3) {
              var listType = m3.search(/[*+-]/g) > -1 ? "ul" : "ol";
              return parseConsecutiveLists(list, listType, false);
            }
          );
        }
        text = text.replace(/¨0/, "");
        text = globals.converter._dispatch("lists.after", text, options2, globals);
        return text;
      });
      showdown.subParser("metadata", function(text, options2, globals) {
        "use strict";
        if (!options2.metadata) {
          return text;
        }
        text = globals.converter._dispatch("metadata.before", text, options2, globals);
        function parseMetadataContents(content) {
          globals.metadata.raw = content;
          content = content.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
          content = content.replace(/\n {4}/g, " ");
          content.replace(/^([\S ]+): +([\s\S]+?)$/gm, function(wm, key, value) {
            globals.metadata.parsed[key] = value;
            return "";
          });
        }
        text = text.replace(/^\s*«««+(\S*?)\n([\s\S]+?)\n»»»+\n/, function(wholematch, format, content) {
          parseMetadataContents(content);
          return "\xA8M";
        });
        text = text.replace(/^\s*---+(\S*?)\n([\s\S]+?)\n---+\n/, function(wholematch, format, content) {
          if (format) {
            globals.metadata.format = format;
          }
          parseMetadataContents(content);
          return "\xA8M";
        });
        text = text.replace(/¨M/g, "");
        text = globals.converter._dispatch("metadata.after", text, options2, globals);
        return text;
      });
      showdown.subParser("outdent", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("outdent.before", text, options2, globals);
        text = text.replace(/^(\t|[ ]{1,4})/gm, "\xA80");
        text = text.replace(/¨0/g, "");
        text = globals.converter._dispatch("outdent.after", text, options2, globals);
        return text;
      });
      showdown.subParser("paragraphs", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("paragraphs.before", text, options2, globals);
        text = text.replace(/^\n+/g, "");
        text = text.replace(/\n+$/g, "");
        var grafs = text.split(/\n{2,}/g), grafsOut = [], end = grafs.length;
        for (var i = 0; i < end; i++) {
          var str = grafs[i];
          if (str.search(/¨(K|G)(\d+)\1/g) >= 0) {
            grafsOut.push(str);
          } else if (str.search(/\S/) >= 0) {
            str = showdown.subParser("spanGamut")(str, options2, globals);
            str = str.replace(/^([ \t]*)/g, "<p>");
            str += "</p>";
            grafsOut.push(str);
          }
        }
        end = grafsOut.length;
        for (i = 0; i < end; i++) {
          var blockText = "", grafsOutIt = grafsOut[i], codeFlag = false;
          while (/¨(K|G)(\d+)\1/.test(grafsOutIt)) {
            var delim = RegExp.$1, num = RegExp.$2;
            if (delim === "K") {
              blockText = globals.gHtmlBlocks[num];
            } else {
              if (codeFlag) {
                blockText = showdown.subParser("encodeCode")(globals.ghCodeBlocks[num].text, options2, globals);
              } else {
                blockText = globals.ghCodeBlocks[num].codeblock;
              }
            }
            blockText = blockText.replace(/\$/g, "$$$$");
            grafsOutIt = grafsOutIt.replace(/(\n\n)?¨(K|G)\d+\2(\n\n)?/, blockText);
            if (/^<pre\b[^>]*>\s*<code\b[^>]*>/.test(grafsOutIt)) {
              codeFlag = true;
            }
          }
          grafsOut[i] = grafsOutIt;
        }
        text = grafsOut.join("\n");
        text = text.replace(/^\n+/g, "");
        text = text.replace(/\n+$/g, "");
        return globals.converter._dispatch("paragraphs.after", text, options2, globals);
      });
      showdown.subParser("runExtension", function(ext, text, options2, globals) {
        "use strict";
        if (ext.filter) {
          text = ext.filter(text, globals.converter, options2);
        } else if (ext.regex) {
          var re = ext.regex;
          if (!(re instanceof RegExp)) {
            re = new RegExp(re, "g");
          }
          text = text.replace(re, ext.replace);
        }
        return text;
      });
      showdown.subParser("spanGamut", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("spanGamut.before", text, options2, globals);
        text = showdown.subParser("codeSpans")(text, options2, globals);
        text = showdown.subParser("escapeSpecialCharsWithinTagAttributes")(text, options2, globals);
        text = showdown.subParser("encodeBackslashEscapes")(text, options2, globals);
        text = showdown.subParser("images")(text, options2, globals);
        text = showdown.subParser("anchors")(text, options2, globals);
        text = showdown.subParser("autoLinks")(text, options2, globals);
        text = showdown.subParser("simplifiedAutoLinks")(text, options2, globals);
        text = showdown.subParser("emoji")(text, options2, globals);
        text = showdown.subParser("underline")(text, options2, globals);
        text = showdown.subParser("italicsAndBold")(text, options2, globals);
        text = showdown.subParser("strikethrough")(text, options2, globals);
        text = showdown.subParser("ellipsis")(text, options2, globals);
        text = showdown.subParser("hashHTMLSpans")(text, options2, globals);
        text = showdown.subParser("encodeAmpsAndAngles")(text, options2, globals);
        if (options2.simpleLineBreaks) {
          if (!/\n\n¨K/.test(text)) {
            text = text.replace(/\n+/g, "<br />\n");
          }
        } else {
          text = text.replace(/  +\n/g, "<br />\n");
        }
        text = globals.converter._dispatch("spanGamut.after", text, options2, globals);
        return text;
      });
      showdown.subParser("strikethrough", function(text, options2, globals) {
        "use strict";
        function parseInside(txt) {
          if (options2.simplifiedAutoLink) {
            txt = showdown.subParser("simplifiedAutoLinks")(txt, options2, globals);
          }
          return "<del>" + txt + "</del>";
        }
        if (options2.strikethrough) {
          text = globals.converter._dispatch("strikethrough.before", text, options2, globals);
          text = text.replace(/(?:~){2}([\s\S]+?)(?:~){2}/g, function(wm, txt) {
            return parseInside(txt);
          });
          text = globals.converter._dispatch("strikethrough.after", text, options2, globals);
        }
        return text;
      });
      showdown.subParser("stripLinkDefinitions", function(text, options2, globals) {
        "use strict";
        var regex = /^ {0,3}\[(.+)]:[ \t]*\n?[ \t]*<?([^>\s]+)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n+|(?=¨0))/gm, base64Regex = /^ {0,3}\[(.+)]:[ \t]*\n?[ \t]*<?(data:.+?\/.+?;base64,[A-Za-z0-9+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n\n|(?=¨0)|(?=\n\[))/gm;
        text += "\xA80";
        var replaceFunc = function(wholeMatch, linkId, url, width, height, blankLines, title) {
          linkId = linkId.toLowerCase();
          if (url.match(/^data:.+?\/.+?;base64,/)) {
            globals.gUrls[linkId] = url.replace(/\s/g, "");
          } else {
            globals.gUrls[linkId] = showdown.subParser("encodeAmpsAndAngles")(url, options2, globals);
          }
          if (blankLines) {
            return blankLines + title;
          } else {
            if (title) {
              globals.gTitles[linkId] = title.replace(/"|'/g, "&quot;");
            }
            if (options2.parseImgDimensions && width && height) {
              globals.gDimensions[linkId] = {
                width,
                height
              };
            }
          }
          return "";
        };
        text = text.replace(base64Regex, replaceFunc);
        text = text.replace(regex, replaceFunc);
        text = text.replace(/¨0/, "");
        return text;
      });
      showdown.subParser("tables", function(text, options2, globals) {
        "use strict";
        if (!options2.tables) {
          return text;
        }
        var tableRgx = /^ {0,3}\|?.+\|.+\n {0,3}\|?[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*:?[ \t]*(?:[-=]){2,}[\s\S]+?(?:\n\n|¨0)/gm, singeColTblRgx = /^ {0,3}\|.+\|[ \t]*\n {0,3}\|[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*\n( {0,3}\|.+\|[ \t]*\n)*(?:\n|¨0)/gm;
        function parseStyles(sLine) {
          if (/^:[ \t]*--*$/.test(sLine)) {
            return ' style="text-align:left;"';
          } else if (/^--*[ \t]*:[ \t]*$/.test(sLine)) {
            return ' style="text-align:right;"';
          } else if (/^:[ \t]*--*[ \t]*:$/.test(sLine)) {
            return ' style="text-align:center;"';
          } else {
            return "";
          }
        }
        function parseHeaders(header, style) {
          var id = "";
          header = header.trim();
          if (options2.tablesHeaderId || options2.tableHeaderId) {
            id = ' id="' + header.replace(/ /g, "_").toLowerCase() + '"';
          }
          header = showdown.subParser("spanGamut")(header, options2, globals);
          return "<th" + id + style + ">" + header + "</th>\n";
        }
        function parseCells(cell, style) {
          var subText = showdown.subParser("spanGamut")(cell, options2, globals);
          return "<td" + style + ">" + subText + "</td>\n";
        }
        function buildTable(headers, cells) {
          var tb = "<table>\n<thead>\n<tr>\n", tblLgn = headers.length;
          for (var i = 0; i < tblLgn; ++i) {
            tb += headers[i];
          }
          tb += "</tr>\n</thead>\n<tbody>\n";
          for (i = 0; i < cells.length; ++i) {
            tb += "<tr>\n";
            for (var ii = 0; ii < tblLgn; ++ii) {
              tb += cells[i][ii];
            }
            tb += "</tr>\n";
          }
          tb += "</tbody>\n</table>\n";
          return tb;
        }
        function parseTable(rawTable) {
          var i, tableLines = rawTable.split("\n");
          for (i = 0; i < tableLines.length; ++i) {
            if (/^ {0,3}\|/.test(tableLines[i])) {
              tableLines[i] = tableLines[i].replace(/^ {0,3}\|/, "");
            }
            if (/\|[ \t]*$/.test(tableLines[i])) {
              tableLines[i] = tableLines[i].replace(/\|[ \t]*$/, "");
            }
            tableLines[i] = showdown.subParser("codeSpans")(tableLines[i], options2, globals);
          }
          var rawHeaders = tableLines[0].split("|").map(function(s) {
            return s.trim();
          }), rawStyles = tableLines[1].split("|").map(function(s) {
            return s.trim();
          }), rawCells = [], headers = [], styles = [], cells = [];
          tableLines.shift();
          tableLines.shift();
          for (i = 0; i < tableLines.length; ++i) {
            if (tableLines[i].trim() === "") {
              continue;
            }
            rawCells.push(
              tableLines[i].split("|").map(function(s) {
                return s.trim();
              })
            );
          }
          if (rawHeaders.length < rawStyles.length) {
            return rawTable;
          }
          for (i = 0; i < rawStyles.length; ++i) {
            styles.push(parseStyles(rawStyles[i]));
          }
          for (i = 0; i < rawHeaders.length; ++i) {
            if (showdown.helper.isUndefined(styles[i])) {
              styles[i] = "";
            }
            headers.push(parseHeaders(rawHeaders[i], styles[i]));
          }
          for (i = 0; i < rawCells.length; ++i) {
            var row = [];
            for (var ii = 0; ii < headers.length; ++ii) {
              if (showdown.helper.isUndefined(rawCells[i][ii])) {
              }
              row.push(parseCells(rawCells[i][ii], styles[ii]));
            }
            cells.push(row);
          }
          return buildTable(headers, cells);
        }
        text = globals.converter._dispatch("tables.before", text, options2, globals);
        text = text.replace(/\\(\|)/g, showdown.helper.escapeCharactersCallback);
        text = text.replace(tableRgx, parseTable);
        text = text.replace(singeColTblRgx, parseTable);
        text = globals.converter._dispatch("tables.after", text, options2, globals);
        return text;
      });
      showdown.subParser("underline", function(text, options2, globals) {
        "use strict";
        if (!options2.underline) {
          return text;
        }
        text = globals.converter._dispatch("underline.before", text, options2, globals);
        if (options2.literalMidWordUnderscores) {
          text = text.replace(/\b___(\S[\s\S]*?)___\b/g, function(wm, txt) {
            return "<u>" + txt + "</u>";
          });
          text = text.replace(/\b__(\S[\s\S]*?)__\b/g, function(wm, txt) {
            return "<u>" + txt + "</u>";
          });
        } else {
          text = text.replace(/___(\S[\s\S]*?)___/g, function(wm, m) {
            return /\S$/.test(m) ? "<u>" + m + "</u>" : wm;
          });
          text = text.replace(/__(\S[\s\S]*?)__/g, function(wm, m) {
            return /\S$/.test(m) ? "<u>" + m + "</u>" : wm;
          });
        }
        text = text.replace(/(_)/g, showdown.helper.escapeCharactersCallback);
        text = globals.converter._dispatch("underline.after", text, options2, globals);
        return text;
      });
      showdown.subParser("unescapeSpecialChars", function(text, options2, globals) {
        "use strict";
        text = globals.converter._dispatch("unescapeSpecialChars.before", text, options2, globals);
        text = text.replace(/¨E(\d+)E/g, function(wholeMatch, m1) {
          var charCodeToReplace = parseInt(m1);
          return String.fromCharCode(charCodeToReplace);
        });
        text = globals.converter._dispatch("unescapeSpecialChars.after", text, options2, globals);
        return text;
      });
      showdown.subParser("makeMarkdown.blockquote", function(node2, globals) {
        "use strict";
        var txt = "";
        if (node2.hasChildNodes()) {
          var children = node2.childNodes, childrenLength = children.length;
          for (var i = 0; i < childrenLength; ++i) {
            var innerTxt = showdown.subParser("makeMarkdown.node")(children[i], globals);
            if (innerTxt === "") {
              continue;
            }
            txt += innerTxt;
          }
        }
        txt = txt.trim();
        txt = "> " + txt.split("\n").join("\n> ");
        return txt;
      });
      showdown.subParser("makeMarkdown.codeBlock", function(node2, globals) {
        "use strict";
        var lang = node2.getAttribute("language"), num = node2.getAttribute("precodenum");
        return "```" + lang + "\n" + globals.preList[num] + "\n```";
      });
      showdown.subParser("makeMarkdown.codeSpan", function(node2) {
        "use strict";
        return "`" + node2.innerHTML + "`";
      });
      showdown.subParser("makeMarkdown.emphasis", function(node2, globals) {
        "use strict";
        var txt = "";
        if (node2.hasChildNodes()) {
          txt += "*";
          var children = node2.childNodes, childrenLength = children.length;
          for (var i = 0; i < childrenLength; ++i) {
            txt += showdown.subParser("makeMarkdown.node")(children[i], globals);
          }
          txt += "*";
        }
        return txt;
      });
      showdown.subParser("makeMarkdown.header", function(node2, globals, headerLevel) {
        "use strict";
        var headerMark = new Array(headerLevel + 1).join("#"), txt = "";
        if (node2.hasChildNodes()) {
          txt = headerMark + " ";
          var children = node2.childNodes, childrenLength = children.length;
          for (var i = 0; i < childrenLength; ++i) {
            txt += showdown.subParser("makeMarkdown.node")(children[i], globals);
          }
        }
        return txt;
      });
      showdown.subParser("makeMarkdown.hr", function() {
        "use strict";
        return "---";
      });
      showdown.subParser("makeMarkdown.image", function(node2) {
        "use strict";
        var txt = "";
        if (node2.hasAttribute("src")) {
          txt += "![" + node2.getAttribute("alt") + "](";
          txt += "<" + node2.getAttribute("src") + ">";
          if (node2.hasAttribute("width") && node2.hasAttribute("height")) {
            txt += " =" + node2.getAttribute("width") + "x" + node2.getAttribute("height");
          }
          if (node2.hasAttribute("title")) {
            txt += ' "' + node2.getAttribute("title") + '"';
          }
          txt += ")";
        }
        return txt;
      });
      showdown.subParser("makeMarkdown.links", function(node2, globals) {
        "use strict";
        var txt = "";
        if (node2.hasChildNodes() && node2.hasAttribute("href")) {
          var children = node2.childNodes, childrenLength = children.length;
          txt = "[";
          for (var i = 0; i < childrenLength; ++i) {
            txt += showdown.subParser("makeMarkdown.node")(children[i], globals);
          }
          txt += "](";
          txt += "<" + node2.getAttribute("href") + ">";
          if (node2.hasAttribute("title")) {
            txt += ' "' + node2.getAttribute("title") + '"';
          }
          txt += ")";
        }
        return txt;
      });
      showdown.subParser("makeMarkdown.list", function(node2, globals, type) {
        "use strict";
        var txt = "";
        if (!node2.hasChildNodes()) {
          return "";
        }
        var listItems = node2.childNodes, listItemsLenght = listItems.length, listNum = node2.getAttribute("start") || 1;
        for (var i = 0; i < listItemsLenght; ++i) {
          if (typeof listItems[i].tagName === "undefined" || listItems[i].tagName.toLowerCase() !== "li") {
            continue;
          }
          var bullet = "";
          if (type === "ol") {
            bullet = listNum.toString() + ". ";
          } else {
            bullet = "- ";
          }
          txt += bullet + showdown.subParser("makeMarkdown.listItem")(listItems[i], globals);
          ++listNum;
        }
        txt += "\n<!-- -->\n";
        return txt.trim();
      });
      showdown.subParser("makeMarkdown.listItem", function(node2, globals) {
        "use strict";
        var listItemTxt = "";
        var children = node2.childNodes, childrenLenght = children.length;
        for (var i = 0; i < childrenLenght; ++i) {
          listItemTxt += showdown.subParser("makeMarkdown.node")(children[i], globals);
        }
        if (!/\n$/.test(listItemTxt)) {
          listItemTxt += "\n";
        } else {
          listItemTxt = listItemTxt.split("\n").join("\n    ").replace(/^ {4}$/gm, "").replace(/\n\n+/g, "\n\n");
        }
        return listItemTxt;
      });
      showdown.subParser("makeMarkdown.node", function(node2, globals, spansOnly) {
        "use strict";
        spansOnly = spansOnly || false;
        var txt = "";
        if (node2.nodeType === 3) {
          return showdown.subParser("makeMarkdown.txt")(node2, globals);
        }
        if (node2.nodeType === 8) {
          return "<!--" + node2.data + "-->\n\n";
        }
        if (node2.nodeType !== 1) {
          return "";
        }
        var tagName = node2.tagName.toLowerCase();
        switch (tagName) {
          case "h1":
            if (!spansOnly) {
              txt = showdown.subParser("makeMarkdown.header")(node2, globals, 1) + "\n\n";
            }
            break;
          case "h2":
            if (!spansOnly) {
              txt = showdown.subParser("makeMarkdown.header")(node2, globals, 2) + "\n\n";
            }
            break;
          case "h3":
            if (!spansOnly) {
              txt = showdown.subParser("makeMarkdown.header")(node2, globals, 3) + "\n\n";
            }
            break;
          case "h4":
            if (!spansOnly) {
              txt = showdown.subParser("makeMarkdown.header")(node2, globals, 4) + "\n\n";
            }
            break;
          case "h5":
            if (!spansOnly) {
              txt = showdown.subParser("makeMarkdown.header")(node2, globals, 5) + "\n\n";
            }
            break;
          case "h6":
            if (!spansOnly) {
              txt = showdown.subParser("makeMarkdown.header")(node2, globals, 6) + "\n\n";
            }
            break;
          case "p":
            if (!spansOnly) {
              txt = showdown.subParser("makeMarkdown.paragraph")(node2, globals) + "\n\n";
            }
            break;
          case "blockquote":
            if (!spansOnly) {
              txt = showdown.subParser("makeMarkdown.blockquote")(node2, globals) + "\n\n";
            }
            break;
          case "hr":
            if (!spansOnly) {
              txt = showdown.subParser("makeMarkdown.hr")(node2, globals) + "\n\n";
            }
            break;
          case "ol":
            if (!spansOnly) {
              txt = showdown.subParser("makeMarkdown.list")(node2, globals, "ol") + "\n\n";
            }
            break;
          case "ul":
            if (!spansOnly) {
              txt = showdown.subParser("makeMarkdown.list")(node2, globals, "ul") + "\n\n";
            }
            break;
          case "precode":
            if (!spansOnly) {
              txt = showdown.subParser("makeMarkdown.codeBlock")(node2, globals) + "\n\n";
            }
            break;
          case "pre":
            if (!spansOnly) {
              txt = showdown.subParser("makeMarkdown.pre")(node2, globals) + "\n\n";
            }
            break;
          case "table":
            if (!spansOnly) {
              txt = showdown.subParser("makeMarkdown.table")(node2, globals) + "\n\n";
            }
            break;
          case "code":
            txt = showdown.subParser("makeMarkdown.codeSpan")(node2, globals);
            break;
          case "em":
          case "i":
            txt = showdown.subParser("makeMarkdown.emphasis")(node2, globals);
            break;
          case "strong":
          case "b":
            txt = showdown.subParser("makeMarkdown.strong")(node2, globals);
            break;
          case "del":
            txt = showdown.subParser("makeMarkdown.strikethrough")(node2, globals);
            break;
          case "a":
            txt = showdown.subParser("makeMarkdown.links")(node2, globals);
            break;
          case "img":
            txt = showdown.subParser("makeMarkdown.image")(node2, globals);
            break;
          default:
            txt = node2.outerHTML + "\n\n";
        }
        return txt;
      });
      showdown.subParser("makeMarkdown.paragraph", function(node2, globals) {
        "use strict";
        var txt = "";
        if (node2.hasChildNodes()) {
          var children = node2.childNodes, childrenLength = children.length;
          for (var i = 0; i < childrenLength; ++i) {
            txt += showdown.subParser("makeMarkdown.node")(children[i], globals);
          }
        }
        txt = txt.trim();
        return txt;
      });
      showdown.subParser("makeMarkdown.pre", function(node2, globals) {
        "use strict";
        var num = node2.getAttribute("prenum");
        return "<pre>" + globals.preList[num] + "</pre>";
      });
      showdown.subParser("makeMarkdown.strikethrough", function(node2, globals) {
        "use strict";
        var txt = "";
        if (node2.hasChildNodes()) {
          txt += "~~";
          var children = node2.childNodes, childrenLength = children.length;
          for (var i = 0; i < childrenLength; ++i) {
            txt += showdown.subParser("makeMarkdown.node")(children[i], globals);
          }
          txt += "~~";
        }
        return txt;
      });
      showdown.subParser("makeMarkdown.strong", function(node2, globals) {
        "use strict";
        var txt = "";
        if (node2.hasChildNodes()) {
          txt += "**";
          var children = node2.childNodes, childrenLength = children.length;
          for (var i = 0; i < childrenLength; ++i) {
            txt += showdown.subParser("makeMarkdown.node")(children[i], globals);
          }
          txt += "**";
        }
        return txt;
      });
      showdown.subParser("makeMarkdown.table", function(node2, globals) {
        "use strict";
        var txt = "", tableArray = [[], []], headings = node2.querySelectorAll("thead>tr>th"), rows = node2.querySelectorAll("tbody>tr"), i, ii;
        for (i = 0; i < headings.length; ++i) {
          var headContent = showdown.subParser("makeMarkdown.tableCell")(headings[i], globals), allign = "---";
          if (headings[i].hasAttribute("style")) {
            var style = headings[i].getAttribute("style").toLowerCase().replace(/\s/g, "");
            switch (style) {
              case "text-align:left;":
                allign = ":---";
                break;
              case "text-align:right;":
                allign = "---:";
                break;
              case "text-align:center;":
                allign = ":---:";
                break;
            }
          }
          tableArray[0][i] = headContent.trim();
          tableArray[1][i] = allign;
        }
        for (i = 0; i < rows.length; ++i) {
          var r = tableArray.push([]) - 1, cols = rows[i].getElementsByTagName("td");
          for (ii = 0; ii < headings.length; ++ii) {
            var cellContent = " ";
            if (typeof cols[ii] !== "undefined") {
              cellContent = showdown.subParser("makeMarkdown.tableCell")(cols[ii], globals);
            }
            tableArray[r].push(cellContent);
          }
        }
        var cellSpacesCount = 3;
        for (i = 0; i < tableArray.length; ++i) {
          for (ii = 0; ii < tableArray[i].length; ++ii) {
            var strLen = tableArray[i][ii].length;
            if (strLen > cellSpacesCount) {
              cellSpacesCount = strLen;
            }
          }
        }
        for (i = 0; i < tableArray.length; ++i) {
          for (ii = 0; ii < tableArray[i].length; ++ii) {
            if (i === 1) {
              if (tableArray[i][ii].slice(-1) === ":") {
                tableArray[i][ii] = showdown.helper.padEnd(tableArray[i][ii].slice(-1), cellSpacesCount - 1, "-") + ":";
              } else {
                tableArray[i][ii] = showdown.helper.padEnd(tableArray[i][ii], cellSpacesCount, "-");
              }
            } else {
              tableArray[i][ii] = showdown.helper.padEnd(tableArray[i][ii], cellSpacesCount);
            }
          }
          txt += "| " + tableArray[i].join(" | ") + " |\n";
        }
        return txt.trim();
      });
      showdown.subParser("makeMarkdown.tableCell", function(node2, globals) {
        "use strict";
        var txt = "";
        if (!node2.hasChildNodes()) {
          return "";
        }
        var children = node2.childNodes, childrenLength = children.length;
        for (var i = 0; i < childrenLength; ++i) {
          txt += showdown.subParser("makeMarkdown.node")(children[i], globals, true);
        }
        return txt.trim();
      });
      showdown.subParser("makeMarkdown.txt", function(node2) {
        "use strict";
        var txt = node2.nodeValue;
        txt = txt.replace(/ +/g, " ");
        txt = txt.replace(/¨NBSP;/g, " ");
        txt = showdown.helper.unescapeHTMLEntities(txt);
        txt = txt.replace(/([*_~|`])/g, "\\$1");
        txt = txt.replace(/^(\s*)>/g, "\\$1>");
        txt = txt.replace(/^#/gm, "\\#");
        txt = txt.replace(/^(\s*)([-=]{3,})(\s*)$/, "$1\\$2$3");
        txt = txt.replace(/^( {0,3}\d+)\./gm, "$1\\.");
        txt = txt.replace(/^( {0,3})([+-])/gm, "$1\\$2");
        txt = txt.replace(/]([\s]*)\(/g, "\\]$1\\(");
        txt = txt.replace(/^ {0,3}\[([\S \t]*?)]:/gm, "\\[$1]:");
        return txt;
      });
      var root = this;
      if (typeof define === "function" && define.amd) {
        define(function() {
          "use strict";
          return showdown;
        });
      } else if (typeof module !== "undefined" && module.exports) {
        module.exports = showdown;
      } else {
        root.showdown = showdown;
      }
    }).call(exports);
  }
});

// node_modules/entities/lib/maps/decode.json
var require_decode = __commonJS({
  "node_modules/entities/lib/maps/decode.json"(exports, module) {
    module.exports = { "0": 65533, "128": 8364, "130": 8218, "131": 402, "132": 8222, "133": 8230, "134": 8224, "135": 8225, "136": 710, "137": 8240, "138": 352, "139": 8249, "140": 338, "142": 381, "145": 8216, "146": 8217, "147": 8220, "148": 8221, "149": 8226, "150": 8211, "151": 8212, "152": 732, "153": 8482, "154": 353, "155": 8250, "156": 339, "158": 382, "159": 376 };
  }
});

// node_modules/entities/lib/decode_codepoint.js
var require_decode_codepoint = __commonJS({
  "node_modules/entities/lib/decode_codepoint.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod2) {
      return mod2 && mod2.__esModule ? mod2 : { "default": mod2 };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var decode_json_1 = __importDefault(require_decode());
    var fromCodePoint = (
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      String.fromCodePoint || function(codePoint) {
        var output = "";
        if (codePoint > 65535) {
          codePoint -= 65536;
          output += String.fromCharCode(codePoint >>> 10 & 1023 | 55296);
          codePoint = 56320 | codePoint & 1023;
        }
        output += String.fromCharCode(codePoint);
        return output;
      }
    );
    function decodeCodePoint(codePoint) {
      if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
        return "\uFFFD";
      }
      if (codePoint in decode_json_1.default) {
        codePoint = decode_json_1.default[codePoint];
      }
      return fromCodePoint(codePoint);
    }
    exports.default = decodeCodePoint;
  }
});

// node_modules/entities/lib/maps/entities.json
var require_entities = __commonJS({
  "node_modules/entities/lib/maps/entities.json"(exports, module) {
    module.exports = { Aacute: "\xC1", aacute: "\xE1", Abreve: "\u0102", abreve: "\u0103", ac: "\u223E", acd: "\u223F", acE: "\u223E\u0333", Acirc: "\xC2", acirc: "\xE2", acute: "\xB4", Acy: "\u0410", acy: "\u0430", AElig: "\xC6", aelig: "\xE6", af: "\u2061", Afr: "\u{1D504}", afr: "\u{1D51E}", Agrave: "\xC0", agrave: "\xE0", alefsym: "\u2135", aleph: "\u2135", Alpha: "\u0391", alpha: "\u03B1", Amacr: "\u0100", amacr: "\u0101", amalg: "\u2A3F", amp: "&", AMP: "&", andand: "\u2A55", And: "\u2A53", and: "\u2227", andd: "\u2A5C", andslope: "\u2A58", andv: "\u2A5A", ang: "\u2220", ange: "\u29A4", angle: "\u2220", angmsdaa: "\u29A8", angmsdab: "\u29A9", angmsdac: "\u29AA", angmsdad: "\u29AB", angmsdae: "\u29AC", angmsdaf: "\u29AD", angmsdag: "\u29AE", angmsdah: "\u29AF", angmsd: "\u2221", angrt: "\u221F", angrtvb: "\u22BE", angrtvbd: "\u299D", angsph: "\u2222", angst: "\xC5", angzarr: "\u237C", Aogon: "\u0104", aogon: "\u0105", Aopf: "\u{1D538}", aopf: "\u{1D552}", apacir: "\u2A6F", ap: "\u2248", apE: "\u2A70", ape: "\u224A", apid: "\u224B", apos: "'", ApplyFunction: "\u2061", approx: "\u2248", approxeq: "\u224A", Aring: "\xC5", aring: "\xE5", Ascr: "\u{1D49C}", ascr: "\u{1D4B6}", Assign: "\u2254", ast: "*", asymp: "\u2248", asympeq: "\u224D", Atilde: "\xC3", atilde: "\xE3", Auml: "\xC4", auml: "\xE4", awconint: "\u2233", awint: "\u2A11", backcong: "\u224C", backepsilon: "\u03F6", backprime: "\u2035", backsim: "\u223D", backsimeq: "\u22CD", Backslash: "\u2216", Barv: "\u2AE7", barvee: "\u22BD", barwed: "\u2305", Barwed: "\u2306", barwedge: "\u2305", bbrk: "\u23B5", bbrktbrk: "\u23B6", bcong: "\u224C", Bcy: "\u0411", bcy: "\u0431", bdquo: "\u201E", becaus: "\u2235", because: "\u2235", Because: "\u2235", bemptyv: "\u29B0", bepsi: "\u03F6", bernou: "\u212C", Bernoullis: "\u212C", Beta: "\u0392", beta: "\u03B2", beth: "\u2136", between: "\u226C", Bfr: "\u{1D505}", bfr: "\u{1D51F}", bigcap: "\u22C2", bigcirc: "\u25EF", bigcup: "\u22C3", bigodot: "\u2A00", bigoplus: "\u2A01", bigotimes: "\u2A02", bigsqcup: "\u2A06", bigstar: "\u2605", bigtriangledown: "\u25BD", bigtriangleup: "\u25B3", biguplus: "\u2A04", bigvee: "\u22C1", bigwedge: "\u22C0", bkarow: "\u290D", blacklozenge: "\u29EB", blacksquare: "\u25AA", blacktriangle: "\u25B4", blacktriangledown: "\u25BE", blacktriangleleft: "\u25C2", blacktriangleright: "\u25B8", blank: "\u2423", blk12: "\u2592", blk14: "\u2591", blk34: "\u2593", block: "\u2588", bne: "=\u20E5", bnequiv: "\u2261\u20E5", bNot: "\u2AED", bnot: "\u2310", Bopf: "\u{1D539}", bopf: "\u{1D553}", bot: "\u22A5", bottom: "\u22A5", bowtie: "\u22C8", boxbox: "\u29C9", boxdl: "\u2510", boxdL: "\u2555", boxDl: "\u2556", boxDL: "\u2557", boxdr: "\u250C", boxdR: "\u2552", boxDr: "\u2553", boxDR: "\u2554", boxh: "\u2500", boxH: "\u2550", boxhd: "\u252C", boxHd: "\u2564", boxhD: "\u2565", boxHD: "\u2566", boxhu: "\u2534", boxHu: "\u2567", boxhU: "\u2568", boxHU: "\u2569", boxminus: "\u229F", boxplus: "\u229E", boxtimes: "\u22A0", boxul: "\u2518", boxuL: "\u255B", boxUl: "\u255C", boxUL: "\u255D", boxur: "\u2514", boxuR: "\u2558", boxUr: "\u2559", boxUR: "\u255A", boxv: "\u2502", boxV: "\u2551", boxvh: "\u253C", boxvH: "\u256A", boxVh: "\u256B", boxVH: "\u256C", boxvl: "\u2524", boxvL: "\u2561", boxVl: "\u2562", boxVL: "\u2563", boxvr: "\u251C", boxvR: "\u255E", boxVr: "\u255F", boxVR: "\u2560", bprime: "\u2035", breve: "\u02D8", Breve: "\u02D8", brvbar: "\xA6", bscr: "\u{1D4B7}", Bscr: "\u212C", bsemi: "\u204F", bsim: "\u223D", bsime: "\u22CD", bsolb: "\u29C5", bsol: "\\", bsolhsub: "\u27C8", bull: "\u2022", bullet: "\u2022", bump: "\u224E", bumpE: "\u2AAE", bumpe: "\u224F", Bumpeq: "\u224E", bumpeq: "\u224F", Cacute: "\u0106", cacute: "\u0107", capand: "\u2A44", capbrcup: "\u2A49", capcap: "\u2A4B", cap: "\u2229", Cap: "\u22D2", capcup: "\u2A47", capdot: "\u2A40", CapitalDifferentialD: "\u2145", caps: "\u2229\uFE00", caret: "\u2041", caron: "\u02C7", Cayleys: "\u212D", ccaps: "\u2A4D", Ccaron: "\u010C", ccaron: "\u010D", Ccedil: "\xC7", ccedil: "\xE7", Ccirc: "\u0108", ccirc: "\u0109", Cconint: "\u2230", ccups: "\u2A4C", ccupssm: "\u2A50", Cdot: "\u010A", cdot: "\u010B", cedil: "\xB8", Cedilla: "\xB8", cemptyv: "\u29B2", cent: "\xA2", centerdot: "\xB7", CenterDot: "\xB7", cfr: "\u{1D520}", Cfr: "\u212D", CHcy: "\u0427", chcy: "\u0447", check: "\u2713", checkmark: "\u2713", Chi: "\u03A7", chi: "\u03C7", circ: "\u02C6", circeq: "\u2257", circlearrowleft: "\u21BA", circlearrowright: "\u21BB", circledast: "\u229B", circledcirc: "\u229A", circleddash: "\u229D", CircleDot: "\u2299", circledR: "\xAE", circledS: "\u24C8", CircleMinus: "\u2296", CirclePlus: "\u2295", CircleTimes: "\u2297", cir: "\u25CB", cirE: "\u29C3", cire: "\u2257", cirfnint: "\u2A10", cirmid: "\u2AEF", cirscir: "\u29C2", ClockwiseContourIntegral: "\u2232", CloseCurlyDoubleQuote: "\u201D", CloseCurlyQuote: "\u2019", clubs: "\u2663", clubsuit: "\u2663", colon: ":", Colon: "\u2237", Colone: "\u2A74", colone: "\u2254", coloneq: "\u2254", comma: ",", commat: "@", comp: "\u2201", compfn: "\u2218", complement: "\u2201", complexes: "\u2102", cong: "\u2245", congdot: "\u2A6D", Congruent: "\u2261", conint: "\u222E", Conint: "\u222F", ContourIntegral: "\u222E", copf: "\u{1D554}", Copf: "\u2102", coprod: "\u2210", Coproduct: "\u2210", copy: "\xA9", COPY: "\xA9", copysr: "\u2117", CounterClockwiseContourIntegral: "\u2233", crarr: "\u21B5", cross: "\u2717", Cross: "\u2A2F", Cscr: "\u{1D49E}", cscr: "\u{1D4B8}", csub: "\u2ACF", csube: "\u2AD1", csup: "\u2AD0", csupe: "\u2AD2", ctdot: "\u22EF", cudarrl: "\u2938", cudarrr: "\u2935", cuepr: "\u22DE", cuesc: "\u22DF", cularr: "\u21B6", cularrp: "\u293D", cupbrcap: "\u2A48", cupcap: "\u2A46", CupCap: "\u224D", cup: "\u222A", Cup: "\u22D3", cupcup: "\u2A4A", cupdot: "\u228D", cupor: "\u2A45", cups: "\u222A\uFE00", curarr: "\u21B7", curarrm: "\u293C", curlyeqprec: "\u22DE", curlyeqsucc: "\u22DF", curlyvee: "\u22CE", curlywedge: "\u22CF", curren: "\xA4", curvearrowleft: "\u21B6", curvearrowright: "\u21B7", cuvee: "\u22CE", cuwed: "\u22CF", cwconint: "\u2232", cwint: "\u2231", cylcty: "\u232D", dagger: "\u2020", Dagger: "\u2021", daleth: "\u2138", darr: "\u2193", Darr: "\u21A1", dArr: "\u21D3", dash: "\u2010", Dashv: "\u2AE4", dashv: "\u22A3", dbkarow: "\u290F", dblac: "\u02DD", Dcaron: "\u010E", dcaron: "\u010F", Dcy: "\u0414", dcy: "\u0434", ddagger: "\u2021", ddarr: "\u21CA", DD: "\u2145", dd: "\u2146", DDotrahd: "\u2911", ddotseq: "\u2A77", deg: "\xB0", Del: "\u2207", Delta: "\u0394", delta: "\u03B4", demptyv: "\u29B1", dfisht: "\u297F", Dfr: "\u{1D507}", dfr: "\u{1D521}", dHar: "\u2965", dharl: "\u21C3", dharr: "\u21C2", DiacriticalAcute: "\xB4", DiacriticalDot: "\u02D9", DiacriticalDoubleAcute: "\u02DD", DiacriticalGrave: "`", DiacriticalTilde: "\u02DC", diam: "\u22C4", diamond: "\u22C4", Diamond: "\u22C4", diamondsuit: "\u2666", diams: "\u2666", die: "\xA8", DifferentialD: "\u2146", digamma: "\u03DD", disin: "\u22F2", div: "\xF7", divide: "\xF7", divideontimes: "\u22C7", divonx: "\u22C7", DJcy: "\u0402", djcy: "\u0452", dlcorn: "\u231E", dlcrop: "\u230D", dollar: "$", Dopf: "\u{1D53B}", dopf: "\u{1D555}", Dot: "\xA8", dot: "\u02D9", DotDot: "\u20DC", doteq: "\u2250", doteqdot: "\u2251", DotEqual: "\u2250", dotminus: "\u2238", dotplus: "\u2214", dotsquare: "\u22A1", doublebarwedge: "\u2306", DoubleContourIntegral: "\u222F", DoubleDot: "\xA8", DoubleDownArrow: "\u21D3", DoubleLeftArrow: "\u21D0", DoubleLeftRightArrow: "\u21D4", DoubleLeftTee: "\u2AE4", DoubleLongLeftArrow: "\u27F8", DoubleLongLeftRightArrow: "\u27FA", DoubleLongRightArrow: "\u27F9", DoubleRightArrow: "\u21D2", DoubleRightTee: "\u22A8", DoubleUpArrow: "\u21D1", DoubleUpDownArrow: "\u21D5", DoubleVerticalBar: "\u2225", DownArrowBar: "\u2913", downarrow: "\u2193", DownArrow: "\u2193", Downarrow: "\u21D3", DownArrowUpArrow: "\u21F5", DownBreve: "\u0311", downdownarrows: "\u21CA", downharpoonleft: "\u21C3", downharpoonright: "\u21C2", DownLeftRightVector: "\u2950", DownLeftTeeVector: "\u295E", DownLeftVectorBar: "\u2956", DownLeftVector: "\u21BD", DownRightTeeVector: "\u295F", DownRightVectorBar: "\u2957", DownRightVector: "\u21C1", DownTeeArrow: "\u21A7", DownTee: "\u22A4", drbkarow: "\u2910", drcorn: "\u231F", drcrop: "\u230C", Dscr: "\u{1D49F}", dscr: "\u{1D4B9}", DScy: "\u0405", dscy: "\u0455", dsol: "\u29F6", Dstrok: "\u0110", dstrok: "\u0111", dtdot: "\u22F1", dtri: "\u25BF", dtrif: "\u25BE", duarr: "\u21F5", duhar: "\u296F", dwangle: "\u29A6", DZcy: "\u040F", dzcy: "\u045F", dzigrarr: "\u27FF", Eacute: "\xC9", eacute: "\xE9", easter: "\u2A6E", Ecaron: "\u011A", ecaron: "\u011B", Ecirc: "\xCA", ecirc: "\xEA", ecir: "\u2256", ecolon: "\u2255", Ecy: "\u042D", ecy: "\u044D", eDDot: "\u2A77", Edot: "\u0116", edot: "\u0117", eDot: "\u2251", ee: "\u2147", efDot: "\u2252", Efr: "\u{1D508}", efr: "\u{1D522}", eg: "\u2A9A", Egrave: "\xC8", egrave: "\xE8", egs: "\u2A96", egsdot: "\u2A98", el: "\u2A99", Element: "\u2208", elinters: "\u23E7", ell: "\u2113", els: "\u2A95", elsdot: "\u2A97", Emacr: "\u0112", emacr: "\u0113", empty: "\u2205", emptyset: "\u2205", EmptySmallSquare: "\u25FB", emptyv: "\u2205", EmptyVerySmallSquare: "\u25AB", emsp13: "\u2004", emsp14: "\u2005", emsp: "\u2003", ENG: "\u014A", eng: "\u014B", ensp: "\u2002", Eogon: "\u0118", eogon: "\u0119", Eopf: "\u{1D53C}", eopf: "\u{1D556}", epar: "\u22D5", eparsl: "\u29E3", eplus: "\u2A71", epsi: "\u03B5", Epsilon: "\u0395", epsilon: "\u03B5", epsiv: "\u03F5", eqcirc: "\u2256", eqcolon: "\u2255", eqsim: "\u2242", eqslantgtr: "\u2A96", eqslantless: "\u2A95", Equal: "\u2A75", equals: "=", EqualTilde: "\u2242", equest: "\u225F", Equilibrium: "\u21CC", equiv: "\u2261", equivDD: "\u2A78", eqvparsl: "\u29E5", erarr: "\u2971", erDot: "\u2253", escr: "\u212F", Escr: "\u2130", esdot: "\u2250", Esim: "\u2A73", esim: "\u2242", Eta: "\u0397", eta: "\u03B7", ETH: "\xD0", eth: "\xF0", Euml: "\xCB", euml: "\xEB", euro: "\u20AC", excl: "!", exist: "\u2203", Exists: "\u2203", expectation: "\u2130", exponentiale: "\u2147", ExponentialE: "\u2147", fallingdotseq: "\u2252", Fcy: "\u0424", fcy: "\u0444", female: "\u2640", ffilig: "\uFB03", fflig: "\uFB00", ffllig: "\uFB04", Ffr: "\u{1D509}", ffr: "\u{1D523}", filig: "\uFB01", FilledSmallSquare: "\u25FC", FilledVerySmallSquare: "\u25AA", fjlig: "fj", flat: "\u266D", fllig: "\uFB02", fltns: "\u25B1", fnof: "\u0192", Fopf: "\u{1D53D}", fopf: "\u{1D557}", forall: "\u2200", ForAll: "\u2200", fork: "\u22D4", forkv: "\u2AD9", Fouriertrf: "\u2131", fpartint: "\u2A0D", frac12: "\xBD", frac13: "\u2153", frac14: "\xBC", frac15: "\u2155", frac16: "\u2159", frac18: "\u215B", frac23: "\u2154", frac25: "\u2156", frac34: "\xBE", frac35: "\u2157", frac38: "\u215C", frac45: "\u2158", frac56: "\u215A", frac58: "\u215D", frac78: "\u215E", frasl: "\u2044", frown: "\u2322", fscr: "\u{1D4BB}", Fscr: "\u2131", gacute: "\u01F5", Gamma: "\u0393", gamma: "\u03B3", Gammad: "\u03DC", gammad: "\u03DD", gap: "\u2A86", Gbreve: "\u011E", gbreve: "\u011F", Gcedil: "\u0122", Gcirc: "\u011C", gcirc: "\u011D", Gcy: "\u0413", gcy: "\u0433", Gdot: "\u0120", gdot: "\u0121", ge: "\u2265", gE: "\u2267", gEl: "\u2A8C", gel: "\u22DB", geq: "\u2265", geqq: "\u2267", geqslant: "\u2A7E", gescc: "\u2AA9", ges: "\u2A7E", gesdot: "\u2A80", gesdoto: "\u2A82", gesdotol: "\u2A84", gesl: "\u22DB\uFE00", gesles: "\u2A94", Gfr: "\u{1D50A}", gfr: "\u{1D524}", gg: "\u226B", Gg: "\u22D9", ggg: "\u22D9", gimel: "\u2137", GJcy: "\u0403", gjcy: "\u0453", gla: "\u2AA5", gl: "\u2277", glE: "\u2A92", glj: "\u2AA4", gnap: "\u2A8A", gnapprox: "\u2A8A", gne: "\u2A88", gnE: "\u2269", gneq: "\u2A88", gneqq: "\u2269", gnsim: "\u22E7", Gopf: "\u{1D53E}", gopf: "\u{1D558}", grave: "`", GreaterEqual: "\u2265", GreaterEqualLess: "\u22DB", GreaterFullEqual: "\u2267", GreaterGreater: "\u2AA2", GreaterLess: "\u2277", GreaterSlantEqual: "\u2A7E", GreaterTilde: "\u2273", Gscr: "\u{1D4A2}", gscr: "\u210A", gsim: "\u2273", gsime: "\u2A8E", gsiml: "\u2A90", gtcc: "\u2AA7", gtcir: "\u2A7A", gt: ">", GT: ">", Gt: "\u226B", gtdot: "\u22D7", gtlPar: "\u2995", gtquest: "\u2A7C", gtrapprox: "\u2A86", gtrarr: "\u2978", gtrdot: "\u22D7", gtreqless: "\u22DB", gtreqqless: "\u2A8C", gtrless: "\u2277", gtrsim: "\u2273", gvertneqq: "\u2269\uFE00", gvnE: "\u2269\uFE00", Hacek: "\u02C7", hairsp: "\u200A", half: "\xBD", hamilt: "\u210B", HARDcy: "\u042A", hardcy: "\u044A", harrcir: "\u2948", harr: "\u2194", hArr: "\u21D4", harrw: "\u21AD", Hat: "^", hbar: "\u210F", Hcirc: "\u0124", hcirc: "\u0125", hearts: "\u2665", heartsuit: "\u2665", hellip: "\u2026", hercon: "\u22B9", hfr: "\u{1D525}", Hfr: "\u210C", HilbertSpace: "\u210B", hksearow: "\u2925", hkswarow: "\u2926", hoarr: "\u21FF", homtht: "\u223B", hookleftarrow: "\u21A9", hookrightarrow: "\u21AA", hopf: "\u{1D559}", Hopf: "\u210D", horbar: "\u2015", HorizontalLine: "\u2500", hscr: "\u{1D4BD}", Hscr: "\u210B", hslash: "\u210F", Hstrok: "\u0126", hstrok: "\u0127", HumpDownHump: "\u224E", HumpEqual: "\u224F", hybull: "\u2043", hyphen: "\u2010", Iacute: "\xCD", iacute: "\xED", ic: "\u2063", Icirc: "\xCE", icirc: "\xEE", Icy: "\u0418", icy: "\u0438", Idot: "\u0130", IEcy: "\u0415", iecy: "\u0435", iexcl: "\xA1", iff: "\u21D4", ifr: "\u{1D526}", Ifr: "\u2111", Igrave: "\xCC", igrave: "\xEC", ii: "\u2148", iiiint: "\u2A0C", iiint: "\u222D", iinfin: "\u29DC", iiota: "\u2129", IJlig: "\u0132", ijlig: "\u0133", Imacr: "\u012A", imacr: "\u012B", image: "\u2111", ImaginaryI: "\u2148", imagline: "\u2110", imagpart: "\u2111", imath: "\u0131", Im: "\u2111", imof: "\u22B7", imped: "\u01B5", Implies: "\u21D2", incare: "\u2105", in: "\u2208", infin: "\u221E", infintie: "\u29DD", inodot: "\u0131", intcal: "\u22BA", int: "\u222B", Int: "\u222C", integers: "\u2124", Integral: "\u222B", intercal: "\u22BA", Intersection: "\u22C2", intlarhk: "\u2A17", intprod: "\u2A3C", InvisibleComma: "\u2063", InvisibleTimes: "\u2062", IOcy: "\u0401", iocy: "\u0451", Iogon: "\u012E", iogon: "\u012F", Iopf: "\u{1D540}", iopf: "\u{1D55A}", Iota: "\u0399", iota: "\u03B9", iprod: "\u2A3C", iquest: "\xBF", iscr: "\u{1D4BE}", Iscr: "\u2110", isin: "\u2208", isindot: "\u22F5", isinE: "\u22F9", isins: "\u22F4", isinsv: "\u22F3", isinv: "\u2208", it: "\u2062", Itilde: "\u0128", itilde: "\u0129", Iukcy: "\u0406", iukcy: "\u0456", Iuml: "\xCF", iuml: "\xEF", Jcirc: "\u0134", jcirc: "\u0135", Jcy: "\u0419", jcy: "\u0439", Jfr: "\u{1D50D}", jfr: "\u{1D527}", jmath: "\u0237", Jopf: "\u{1D541}", jopf: "\u{1D55B}", Jscr: "\u{1D4A5}", jscr: "\u{1D4BF}", Jsercy: "\u0408", jsercy: "\u0458", Jukcy: "\u0404", jukcy: "\u0454", Kappa: "\u039A", kappa: "\u03BA", kappav: "\u03F0", Kcedil: "\u0136", kcedil: "\u0137", Kcy: "\u041A", kcy: "\u043A", Kfr: "\u{1D50E}", kfr: "\u{1D528}", kgreen: "\u0138", KHcy: "\u0425", khcy: "\u0445", KJcy: "\u040C", kjcy: "\u045C", Kopf: "\u{1D542}", kopf: "\u{1D55C}", Kscr: "\u{1D4A6}", kscr: "\u{1D4C0}", lAarr: "\u21DA", Lacute: "\u0139", lacute: "\u013A", laemptyv: "\u29B4", lagran: "\u2112", Lambda: "\u039B", lambda: "\u03BB", lang: "\u27E8", Lang: "\u27EA", langd: "\u2991", langle: "\u27E8", lap: "\u2A85", Laplacetrf: "\u2112", laquo: "\xAB", larrb: "\u21E4", larrbfs: "\u291F", larr: "\u2190", Larr: "\u219E", lArr: "\u21D0", larrfs: "\u291D", larrhk: "\u21A9", larrlp: "\u21AB", larrpl: "\u2939", larrsim: "\u2973", larrtl: "\u21A2", latail: "\u2919", lAtail: "\u291B", lat: "\u2AAB", late: "\u2AAD", lates: "\u2AAD\uFE00", lbarr: "\u290C", lBarr: "\u290E", lbbrk: "\u2772", lbrace: "{", lbrack: "[", lbrke: "\u298B", lbrksld: "\u298F", lbrkslu: "\u298D", Lcaron: "\u013D", lcaron: "\u013E", Lcedil: "\u013B", lcedil: "\u013C", lceil: "\u2308", lcub: "{", Lcy: "\u041B", lcy: "\u043B", ldca: "\u2936", ldquo: "\u201C", ldquor: "\u201E", ldrdhar: "\u2967", ldrushar: "\u294B", ldsh: "\u21B2", le: "\u2264", lE: "\u2266", LeftAngleBracket: "\u27E8", LeftArrowBar: "\u21E4", leftarrow: "\u2190", LeftArrow: "\u2190", Leftarrow: "\u21D0", LeftArrowRightArrow: "\u21C6", leftarrowtail: "\u21A2", LeftCeiling: "\u2308", LeftDoubleBracket: "\u27E6", LeftDownTeeVector: "\u2961", LeftDownVectorBar: "\u2959", LeftDownVector: "\u21C3", LeftFloor: "\u230A", leftharpoondown: "\u21BD", leftharpoonup: "\u21BC", leftleftarrows: "\u21C7", leftrightarrow: "\u2194", LeftRightArrow: "\u2194", Leftrightarrow: "\u21D4", leftrightarrows: "\u21C6", leftrightharpoons: "\u21CB", leftrightsquigarrow: "\u21AD", LeftRightVector: "\u294E", LeftTeeArrow: "\u21A4", LeftTee: "\u22A3", LeftTeeVector: "\u295A", leftthreetimes: "\u22CB", LeftTriangleBar: "\u29CF", LeftTriangle: "\u22B2", LeftTriangleEqual: "\u22B4", LeftUpDownVector: "\u2951", LeftUpTeeVector: "\u2960", LeftUpVectorBar: "\u2958", LeftUpVector: "\u21BF", LeftVectorBar: "\u2952", LeftVector: "\u21BC", lEg: "\u2A8B", leg: "\u22DA", leq: "\u2264", leqq: "\u2266", leqslant: "\u2A7D", lescc: "\u2AA8", les: "\u2A7D", lesdot: "\u2A7F", lesdoto: "\u2A81", lesdotor: "\u2A83", lesg: "\u22DA\uFE00", lesges: "\u2A93", lessapprox: "\u2A85", lessdot: "\u22D6", lesseqgtr: "\u22DA", lesseqqgtr: "\u2A8B", LessEqualGreater: "\u22DA", LessFullEqual: "\u2266", LessGreater: "\u2276", lessgtr: "\u2276", LessLess: "\u2AA1", lesssim: "\u2272", LessSlantEqual: "\u2A7D", LessTilde: "\u2272", lfisht: "\u297C", lfloor: "\u230A", Lfr: "\u{1D50F}", lfr: "\u{1D529}", lg: "\u2276", lgE: "\u2A91", lHar: "\u2962", lhard: "\u21BD", lharu: "\u21BC", lharul: "\u296A", lhblk: "\u2584", LJcy: "\u0409", ljcy: "\u0459", llarr: "\u21C7", ll: "\u226A", Ll: "\u22D8", llcorner: "\u231E", Lleftarrow: "\u21DA", llhard: "\u296B", lltri: "\u25FA", Lmidot: "\u013F", lmidot: "\u0140", lmoustache: "\u23B0", lmoust: "\u23B0", lnap: "\u2A89", lnapprox: "\u2A89", lne: "\u2A87", lnE: "\u2268", lneq: "\u2A87", lneqq: "\u2268", lnsim: "\u22E6", loang: "\u27EC", loarr: "\u21FD", lobrk: "\u27E6", longleftarrow: "\u27F5", LongLeftArrow: "\u27F5", Longleftarrow: "\u27F8", longleftrightarrow: "\u27F7", LongLeftRightArrow: "\u27F7", Longleftrightarrow: "\u27FA", longmapsto: "\u27FC", longrightarrow: "\u27F6", LongRightArrow: "\u27F6", Longrightarrow: "\u27F9", looparrowleft: "\u21AB", looparrowright: "\u21AC", lopar: "\u2985", Lopf: "\u{1D543}", lopf: "\u{1D55D}", loplus: "\u2A2D", lotimes: "\u2A34", lowast: "\u2217", lowbar: "_", LowerLeftArrow: "\u2199", LowerRightArrow: "\u2198", loz: "\u25CA", lozenge: "\u25CA", lozf: "\u29EB", lpar: "(", lparlt: "\u2993", lrarr: "\u21C6", lrcorner: "\u231F", lrhar: "\u21CB", lrhard: "\u296D", lrm: "\u200E", lrtri: "\u22BF", lsaquo: "\u2039", lscr: "\u{1D4C1}", Lscr: "\u2112", lsh: "\u21B0", Lsh: "\u21B0", lsim: "\u2272", lsime: "\u2A8D", lsimg: "\u2A8F", lsqb: "[", lsquo: "\u2018", lsquor: "\u201A", Lstrok: "\u0141", lstrok: "\u0142", ltcc: "\u2AA6", ltcir: "\u2A79", lt: "<", LT: "<", Lt: "\u226A", ltdot: "\u22D6", lthree: "\u22CB", ltimes: "\u22C9", ltlarr: "\u2976", ltquest: "\u2A7B", ltri: "\u25C3", ltrie: "\u22B4", ltrif: "\u25C2", ltrPar: "\u2996", lurdshar: "\u294A", luruhar: "\u2966", lvertneqq: "\u2268\uFE00", lvnE: "\u2268\uFE00", macr: "\xAF", male: "\u2642", malt: "\u2720", maltese: "\u2720", Map: "\u2905", map: "\u21A6", mapsto: "\u21A6", mapstodown: "\u21A7", mapstoleft: "\u21A4", mapstoup: "\u21A5", marker: "\u25AE", mcomma: "\u2A29", Mcy: "\u041C", mcy: "\u043C", mdash: "\u2014", mDDot: "\u223A", measuredangle: "\u2221", MediumSpace: "\u205F", Mellintrf: "\u2133", Mfr: "\u{1D510}", mfr: "\u{1D52A}", mho: "\u2127", micro: "\xB5", midast: "*", midcir: "\u2AF0", mid: "\u2223", middot: "\xB7", minusb: "\u229F", minus: "\u2212", minusd: "\u2238", minusdu: "\u2A2A", MinusPlus: "\u2213", mlcp: "\u2ADB", mldr: "\u2026", mnplus: "\u2213", models: "\u22A7", Mopf: "\u{1D544}", mopf: "\u{1D55E}", mp: "\u2213", mscr: "\u{1D4C2}", Mscr: "\u2133", mstpos: "\u223E", Mu: "\u039C", mu: "\u03BC", multimap: "\u22B8", mumap: "\u22B8", nabla: "\u2207", Nacute: "\u0143", nacute: "\u0144", nang: "\u2220\u20D2", nap: "\u2249", napE: "\u2A70\u0338", napid: "\u224B\u0338", napos: "\u0149", napprox: "\u2249", natural: "\u266E", naturals: "\u2115", natur: "\u266E", nbsp: "\xA0", nbump: "\u224E\u0338", nbumpe: "\u224F\u0338", ncap: "\u2A43", Ncaron: "\u0147", ncaron: "\u0148", Ncedil: "\u0145", ncedil: "\u0146", ncong: "\u2247", ncongdot: "\u2A6D\u0338", ncup: "\u2A42", Ncy: "\u041D", ncy: "\u043D", ndash: "\u2013", nearhk: "\u2924", nearr: "\u2197", neArr: "\u21D7", nearrow: "\u2197", ne: "\u2260", nedot: "\u2250\u0338", NegativeMediumSpace: "\u200B", NegativeThickSpace: "\u200B", NegativeThinSpace: "\u200B", NegativeVeryThinSpace: "\u200B", nequiv: "\u2262", nesear: "\u2928", nesim: "\u2242\u0338", NestedGreaterGreater: "\u226B", NestedLessLess: "\u226A", NewLine: "\n", nexist: "\u2204", nexists: "\u2204", Nfr: "\u{1D511}", nfr: "\u{1D52B}", ngE: "\u2267\u0338", nge: "\u2271", ngeq: "\u2271", ngeqq: "\u2267\u0338", ngeqslant: "\u2A7E\u0338", nges: "\u2A7E\u0338", nGg: "\u22D9\u0338", ngsim: "\u2275", nGt: "\u226B\u20D2", ngt: "\u226F", ngtr: "\u226F", nGtv: "\u226B\u0338", nharr: "\u21AE", nhArr: "\u21CE", nhpar: "\u2AF2", ni: "\u220B", nis: "\u22FC", nisd: "\u22FA", niv: "\u220B", NJcy: "\u040A", njcy: "\u045A", nlarr: "\u219A", nlArr: "\u21CD", nldr: "\u2025", nlE: "\u2266\u0338", nle: "\u2270", nleftarrow: "\u219A", nLeftarrow: "\u21CD", nleftrightarrow: "\u21AE", nLeftrightarrow: "\u21CE", nleq: "\u2270", nleqq: "\u2266\u0338", nleqslant: "\u2A7D\u0338", nles: "\u2A7D\u0338", nless: "\u226E", nLl: "\u22D8\u0338", nlsim: "\u2274", nLt: "\u226A\u20D2", nlt: "\u226E", nltri: "\u22EA", nltrie: "\u22EC", nLtv: "\u226A\u0338", nmid: "\u2224", NoBreak: "\u2060", NonBreakingSpace: "\xA0", nopf: "\u{1D55F}", Nopf: "\u2115", Not: "\u2AEC", not: "\xAC", NotCongruent: "\u2262", NotCupCap: "\u226D", NotDoubleVerticalBar: "\u2226", NotElement: "\u2209", NotEqual: "\u2260", NotEqualTilde: "\u2242\u0338", NotExists: "\u2204", NotGreater: "\u226F", NotGreaterEqual: "\u2271", NotGreaterFullEqual: "\u2267\u0338", NotGreaterGreater: "\u226B\u0338", NotGreaterLess: "\u2279", NotGreaterSlantEqual: "\u2A7E\u0338", NotGreaterTilde: "\u2275", NotHumpDownHump: "\u224E\u0338", NotHumpEqual: "\u224F\u0338", notin: "\u2209", notindot: "\u22F5\u0338", notinE: "\u22F9\u0338", notinva: "\u2209", notinvb: "\u22F7", notinvc: "\u22F6", NotLeftTriangleBar: "\u29CF\u0338", NotLeftTriangle: "\u22EA", NotLeftTriangleEqual: "\u22EC", NotLess: "\u226E", NotLessEqual: "\u2270", NotLessGreater: "\u2278", NotLessLess: "\u226A\u0338", NotLessSlantEqual: "\u2A7D\u0338", NotLessTilde: "\u2274", NotNestedGreaterGreater: "\u2AA2\u0338", NotNestedLessLess: "\u2AA1\u0338", notni: "\u220C", notniva: "\u220C", notnivb: "\u22FE", notnivc: "\u22FD", NotPrecedes: "\u2280", NotPrecedesEqual: "\u2AAF\u0338", NotPrecedesSlantEqual: "\u22E0", NotReverseElement: "\u220C", NotRightTriangleBar: "\u29D0\u0338", NotRightTriangle: "\u22EB", NotRightTriangleEqual: "\u22ED", NotSquareSubset: "\u228F\u0338", NotSquareSubsetEqual: "\u22E2", NotSquareSuperset: "\u2290\u0338", NotSquareSupersetEqual: "\u22E3", NotSubset: "\u2282\u20D2", NotSubsetEqual: "\u2288", NotSucceeds: "\u2281", NotSucceedsEqual: "\u2AB0\u0338", NotSucceedsSlantEqual: "\u22E1", NotSucceedsTilde: "\u227F\u0338", NotSuperset: "\u2283\u20D2", NotSupersetEqual: "\u2289", NotTilde: "\u2241", NotTildeEqual: "\u2244", NotTildeFullEqual: "\u2247", NotTildeTilde: "\u2249", NotVerticalBar: "\u2224", nparallel: "\u2226", npar: "\u2226", nparsl: "\u2AFD\u20E5", npart: "\u2202\u0338", npolint: "\u2A14", npr: "\u2280", nprcue: "\u22E0", nprec: "\u2280", npreceq: "\u2AAF\u0338", npre: "\u2AAF\u0338", nrarrc: "\u2933\u0338", nrarr: "\u219B", nrArr: "\u21CF", nrarrw: "\u219D\u0338", nrightarrow: "\u219B", nRightarrow: "\u21CF", nrtri: "\u22EB", nrtrie: "\u22ED", nsc: "\u2281", nsccue: "\u22E1", nsce: "\u2AB0\u0338", Nscr: "\u{1D4A9}", nscr: "\u{1D4C3}", nshortmid: "\u2224", nshortparallel: "\u2226", nsim: "\u2241", nsime: "\u2244", nsimeq: "\u2244", nsmid: "\u2224", nspar: "\u2226", nsqsube: "\u22E2", nsqsupe: "\u22E3", nsub: "\u2284", nsubE: "\u2AC5\u0338", nsube: "\u2288", nsubset: "\u2282\u20D2", nsubseteq: "\u2288", nsubseteqq: "\u2AC5\u0338", nsucc: "\u2281", nsucceq: "\u2AB0\u0338", nsup: "\u2285", nsupE: "\u2AC6\u0338", nsupe: "\u2289", nsupset: "\u2283\u20D2", nsupseteq: "\u2289", nsupseteqq: "\u2AC6\u0338", ntgl: "\u2279", Ntilde: "\xD1", ntilde: "\xF1", ntlg: "\u2278", ntriangleleft: "\u22EA", ntrianglelefteq: "\u22EC", ntriangleright: "\u22EB", ntrianglerighteq: "\u22ED", Nu: "\u039D", nu: "\u03BD", num: "#", numero: "\u2116", numsp: "\u2007", nvap: "\u224D\u20D2", nvdash: "\u22AC", nvDash: "\u22AD", nVdash: "\u22AE", nVDash: "\u22AF", nvge: "\u2265\u20D2", nvgt: ">\u20D2", nvHarr: "\u2904", nvinfin: "\u29DE", nvlArr: "\u2902", nvle: "\u2264\u20D2", nvlt: "<\u20D2", nvltrie: "\u22B4\u20D2", nvrArr: "\u2903", nvrtrie: "\u22B5\u20D2", nvsim: "\u223C\u20D2", nwarhk: "\u2923", nwarr: "\u2196", nwArr: "\u21D6", nwarrow: "\u2196", nwnear: "\u2927", Oacute: "\xD3", oacute: "\xF3", oast: "\u229B", Ocirc: "\xD4", ocirc: "\xF4", ocir: "\u229A", Ocy: "\u041E", ocy: "\u043E", odash: "\u229D", Odblac: "\u0150", odblac: "\u0151", odiv: "\u2A38", odot: "\u2299", odsold: "\u29BC", OElig: "\u0152", oelig: "\u0153", ofcir: "\u29BF", Ofr: "\u{1D512}", ofr: "\u{1D52C}", ogon: "\u02DB", Ograve: "\xD2", ograve: "\xF2", ogt: "\u29C1", ohbar: "\u29B5", ohm: "\u03A9", oint: "\u222E", olarr: "\u21BA", olcir: "\u29BE", olcross: "\u29BB", oline: "\u203E", olt: "\u29C0", Omacr: "\u014C", omacr: "\u014D", Omega: "\u03A9", omega: "\u03C9", Omicron: "\u039F", omicron: "\u03BF", omid: "\u29B6", ominus: "\u2296", Oopf: "\u{1D546}", oopf: "\u{1D560}", opar: "\u29B7", OpenCurlyDoubleQuote: "\u201C", OpenCurlyQuote: "\u2018", operp: "\u29B9", oplus: "\u2295", orarr: "\u21BB", Or: "\u2A54", or: "\u2228", ord: "\u2A5D", order: "\u2134", orderof: "\u2134", ordf: "\xAA", ordm: "\xBA", origof: "\u22B6", oror: "\u2A56", orslope: "\u2A57", orv: "\u2A5B", oS: "\u24C8", Oscr: "\u{1D4AA}", oscr: "\u2134", Oslash: "\xD8", oslash: "\xF8", osol: "\u2298", Otilde: "\xD5", otilde: "\xF5", otimesas: "\u2A36", Otimes: "\u2A37", otimes: "\u2297", Ouml: "\xD6", ouml: "\xF6", ovbar: "\u233D", OverBar: "\u203E", OverBrace: "\u23DE", OverBracket: "\u23B4", OverParenthesis: "\u23DC", para: "\xB6", parallel: "\u2225", par: "\u2225", parsim: "\u2AF3", parsl: "\u2AFD", part: "\u2202", PartialD: "\u2202", Pcy: "\u041F", pcy: "\u043F", percnt: "%", period: ".", permil: "\u2030", perp: "\u22A5", pertenk: "\u2031", Pfr: "\u{1D513}", pfr: "\u{1D52D}", Phi: "\u03A6", phi: "\u03C6", phiv: "\u03D5", phmmat: "\u2133", phone: "\u260E", Pi: "\u03A0", pi: "\u03C0", pitchfork: "\u22D4", piv: "\u03D6", planck: "\u210F", planckh: "\u210E", plankv: "\u210F", plusacir: "\u2A23", plusb: "\u229E", pluscir: "\u2A22", plus: "+", plusdo: "\u2214", plusdu: "\u2A25", pluse: "\u2A72", PlusMinus: "\xB1", plusmn: "\xB1", plussim: "\u2A26", plustwo: "\u2A27", pm: "\xB1", Poincareplane: "\u210C", pointint: "\u2A15", popf: "\u{1D561}", Popf: "\u2119", pound: "\xA3", prap: "\u2AB7", Pr: "\u2ABB", pr: "\u227A", prcue: "\u227C", precapprox: "\u2AB7", prec: "\u227A", preccurlyeq: "\u227C", Precedes: "\u227A", PrecedesEqual: "\u2AAF", PrecedesSlantEqual: "\u227C", PrecedesTilde: "\u227E", preceq: "\u2AAF", precnapprox: "\u2AB9", precneqq: "\u2AB5", precnsim: "\u22E8", pre: "\u2AAF", prE: "\u2AB3", precsim: "\u227E", prime: "\u2032", Prime: "\u2033", primes: "\u2119", prnap: "\u2AB9", prnE: "\u2AB5", prnsim: "\u22E8", prod: "\u220F", Product: "\u220F", profalar: "\u232E", profline: "\u2312", profsurf: "\u2313", prop: "\u221D", Proportional: "\u221D", Proportion: "\u2237", propto: "\u221D", prsim: "\u227E", prurel: "\u22B0", Pscr: "\u{1D4AB}", pscr: "\u{1D4C5}", Psi: "\u03A8", psi: "\u03C8", puncsp: "\u2008", Qfr: "\u{1D514}", qfr: "\u{1D52E}", qint: "\u2A0C", qopf: "\u{1D562}", Qopf: "\u211A", qprime: "\u2057", Qscr: "\u{1D4AC}", qscr: "\u{1D4C6}", quaternions: "\u210D", quatint: "\u2A16", quest: "?", questeq: "\u225F", quot: '"', QUOT: '"', rAarr: "\u21DB", race: "\u223D\u0331", Racute: "\u0154", racute: "\u0155", radic: "\u221A", raemptyv: "\u29B3", rang: "\u27E9", Rang: "\u27EB", rangd: "\u2992", range: "\u29A5", rangle: "\u27E9", raquo: "\xBB", rarrap: "\u2975", rarrb: "\u21E5", rarrbfs: "\u2920", rarrc: "\u2933", rarr: "\u2192", Rarr: "\u21A0", rArr: "\u21D2", rarrfs: "\u291E", rarrhk: "\u21AA", rarrlp: "\u21AC", rarrpl: "\u2945", rarrsim: "\u2974", Rarrtl: "\u2916", rarrtl: "\u21A3", rarrw: "\u219D", ratail: "\u291A", rAtail: "\u291C", ratio: "\u2236", rationals: "\u211A", rbarr: "\u290D", rBarr: "\u290F", RBarr: "\u2910", rbbrk: "\u2773", rbrace: "}", rbrack: "]", rbrke: "\u298C", rbrksld: "\u298E", rbrkslu: "\u2990", Rcaron: "\u0158", rcaron: "\u0159", Rcedil: "\u0156", rcedil: "\u0157", rceil: "\u2309", rcub: "}", Rcy: "\u0420", rcy: "\u0440", rdca: "\u2937", rdldhar: "\u2969", rdquo: "\u201D", rdquor: "\u201D", rdsh: "\u21B3", real: "\u211C", realine: "\u211B", realpart: "\u211C", reals: "\u211D", Re: "\u211C", rect: "\u25AD", reg: "\xAE", REG: "\xAE", ReverseElement: "\u220B", ReverseEquilibrium: "\u21CB", ReverseUpEquilibrium: "\u296F", rfisht: "\u297D", rfloor: "\u230B", rfr: "\u{1D52F}", Rfr: "\u211C", rHar: "\u2964", rhard: "\u21C1", rharu: "\u21C0", rharul: "\u296C", Rho: "\u03A1", rho: "\u03C1", rhov: "\u03F1", RightAngleBracket: "\u27E9", RightArrowBar: "\u21E5", rightarrow: "\u2192", RightArrow: "\u2192", Rightarrow: "\u21D2", RightArrowLeftArrow: "\u21C4", rightarrowtail: "\u21A3", RightCeiling: "\u2309", RightDoubleBracket: "\u27E7", RightDownTeeVector: "\u295D", RightDownVectorBar: "\u2955", RightDownVector: "\u21C2", RightFloor: "\u230B", rightharpoondown: "\u21C1", rightharpoonup: "\u21C0", rightleftarrows: "\u21C4", rightleftharpoons: "\u21CC", rightrightarrows: "\u21C9", rightsquigarrow: "\u219D", RightTeeArrow: "\u21A6", RightTee: "\u22A2", RightTeeVector: "\u295B", rightthreetimes: "\u22CC", RightTriangleBar: "\u29D0", RightTriangle: "\u22B3", RightTriangleEqual: "\u22B5", RightUpDownVector: "\u294F", RightUpTeeVector: "\u295C", RightUpVectorBar: "\u2954", RightUpVector: "\u21BE", RightVectorBar: "\u2953", RightVector: "\u21C0", ring: "\u02DA", risingdotseq: "\u2253", rlarr: "\u21C4", rlhar: "\u21CC", rlm: "\u200F", rmoustache: "\u23B1", rmoust: "\u23B1", rnmid: "\u2AEE", roang: "\u27ED", roarr: "\u21FE", robrk: "\u27E7", ropar: "\u2986", ropf: "\u{1D563}", Ropf: "\u211D", roplus: "\u2A2E", rotimes: "\u2A35", RoundImplies: "\u2970", rpar: ")", rpargt: "\u2994", rppolint: "\u2A12", rrarr: "\u21C9", Rrightarrow: "\u21DB", rsaquo: "\u203A", rscr: "\u{1D4C7}", Rscr: "\u211B", rsh: "\u21B1", Rsh: "\u21B1", rsqb: "]", rsquo: "\u2019", rsquor: "\u2019", rthree: "\u22CC", rtimes: "\u22CA", rtri: "\u25B9", rtrie: "\u22B5", rtrif: "\u25B8", rtriltri: "\u29CE", RuleDelayed: "\u29F4", ruluhar: "\u2968", rx: "\u211E", Sacute: "\u015A", sacute: "\u015B", sbquo: "\u201A", scap: "\u2AB8", Scaron: "\u0160", scaron: "\u0161", Sc: "\u2ABC", sc: "\u227B", sccue: "\u227D", sce: "\u2AB0", scE: "\u2AB4", Scedil: "\u015E", scedil: "\u015F", Scirc: "\u015C", scirc: "\u015D", scnap: "\u2ABA", scnE: "\u2AB6", scnsim: "\u22E9", scpolint: "\u2A13", scsim: "\u227F", Scy: "\u0421", scy: "\u0441", sdotb: "\u22A1", sdot: "\u22C5", sdote: "\u2A66", searhk: "\u2925", searr: "\u2198", seArr: "\u21D8", searrow: "\u2198", sect: "\xA7", semi: ";", seswar: "\u2929", setminus: "\u2216", setmn: "\u2216", sext: "\u2736", Sfr: "\u{1D516}", sfr: "\u{1D530}", sfrown: "\u2322", sharp: "\u266F", SHCHcy: "\u0429", shchcy: "\u0449", SHcy: "\u0428", shcy: "\u0448", ShortDownArrow: "\u2193", ShortLeftArrow: "\u2190", shortmid: "\u2223", shortparallel: "\u2225", ShortRightArrow: "\u2192", ShortUpArrow: "\u2191", shy: "\xAD", Sigma: "\u03A3", sigma: "\u03C3", sigmaf: "\u03C2", sigmav: "\u03C2", sim: "\u223C", simdot: "\u2A6A", sime: "\u2243", simeq: "\u2243", simg: "\u2A9E", simgE: "\u2AA0", siml: "\u2A9D", simlE: "\u2A9F", simne: "\u2246", simplus: "\u2A24", simrarr: "\u2972", slarr: "\u2190", SmallCircle: "\u2218", smallsetminus: "\u2216", smashp: "\u2A33", smeparsl: "\u29E4", smid: "\u2223", smile: "\u2323", smt: "\u2AAA", smte: "\u2AAC", smtes: "\u2AAC\uFE00", SOFTcy: "\u042C", softcy: "\u044C", solbar: "\u233F", solb: "\u29C4", sol: "/", Sopf: "\u{1D54A}", sopf: "\u{1D564}", spades: "\u2660", spadesuit: "\u2660", spar: "\u2225", sqcap: "\u2293", sqcaps: "\u2293\uFE00", sqcup: "\u2294", sqcups: "\u2294\uFE00", Sqrt: "\u221A", sqsub: "\u228F", sqsube: "\u2291", sqsubset: "\u228F", sqsubseteq: "\u2291", sqsup: "\u2290", sqsupe: "\u2292", sqsupset: "\u2290", sqsupseteq: "\u2292", square: "\u25A1", Square: "\u25A1", SquareIntersection: "\u2293", SquareSubset: "\u228F", SquareSubsetEqual: "\u2291", SquareSuperset: "\u2290", SquareSupersetEqual: "\u2292", SquareUnion: "\u2294", squarf: "\u25AA", squ: "\u25A1", squf: "\u25AA", srarr: "\u2192", Sscr: "\u{1D4AE}", sscr: "\u{1D4C8}", ssetmn: "\u2216", ssmile: "\u2323", sstarf: "\u22C6", Star: "\u22C6", star: "\u2606", starf: "\u2605", straightepsilon: "\u03F5", straightphi: "\u03D5", strns: "\xAF", sub: "\u2282", Sub: "\u22D0", subdot: "\u2ABD", subE: "\u2AC5", sube: "\u2286", subedot: "\u2AC3", submult: "\u2AC1", subnE: "\u2ACB", subne: "\u228A", subplus: "\u2ABF", subrarr: "\u2979", subset: "\u2282", Subset: "\u22D0", subseteq: "\u2286", subseteqq: "\u2AC5", SubsetEqual: "\u2286", subsetneq: "\u228A", subsetneqq: "\u2ACB", subsim: "\u2AC7", subsub: "\u2AD5", subsup: "\u2AD3", succapprox: "\u2AB8", succ: "\u227B", succcurlyeq: "\u227D", Succeeds: "\u227B", SucceedsEqual: "\u2AB0", SucceedsSlantEqual: "\u227D", SucceedsTilde: "\u227F", succeq: "\u2AB0", succnapprox: "\u2ABA", succneqq: "\u2AB6", succnsim: "\u22E9", succsim: "\u227F", SuchThat: "\u220B", sum: "\u2211", Sum: "\u2211", sung: "\u266A", sup1: "\xB9", sup2: "\xB2", sup3: "\xB3", sup: "\u2283", Sup: "\u22D1", supdot: "\u2ABE", supdsub: "\u2AD8", supE: "\u2AC6", supe: "\u2287", supedot: "\u2AC4", Superset: "\u2283", SupersetEqual: "\u2287", suphsol: "\u27C9", suphsub: "\u2AD7", suplarr: "\u297B", supmult: "\u2AC2", supnE: "\u2ACC", supne: "\u228B", supplus: "\u2AC0", supset: "\u2283", Supset: "\u22D1", supseteq: "\u2287", supseteqq: "\u2AC6", supsetneq: "\u228B", supsetneqq: "\u2ACC", supsim: "\u2AC8", supsub: "\u2AD4", supsup: "\u2AD6", swarhk: "\u2926", swarr: "\u2199", swArr: "\u21D9", swarrow: "\u2199", swnwar: "\u292A", szlig: "\xDF", Tab: "	", target: "\u2316", Tau: "\u03A4", tau: "\u03C4", tbrk: "\u23B4", Tcaron: "\u0164", tcaron: "\u0165", Tcedil: "\u0162", tcedil: "\u0163", Tcy: "\u0422", tcy: "\u0442", tdot: "\u20DB", telrec: "\u2315", Tfr: "\u{1D517}", tfr: "\u{1D531}", there4: "\u2234", therefore: "\u2234", Therefore: "\u2234", Theta: "\u0398", theta: "\u03B8", thetasym: "\u03D1", thetav: "\u03D1", thickapprox: "\u2248", thicksim: "\u223C", ThickSpace: "\u205F\u200A", ThinSpace: "\u2009", thinsp: "\u2009", thkap: "\u2248", thksim: "\u223C", THORN: "\xDE", thorn: "\xFE", tilde: "\u02DC", Tilde: "\u223C", TildeEqual: "\u2243", TildeFullEqual: "\u2245", TildeTilde: "\u2248", timesbar: "\u2A31", timesb: "\u22A0", times: "\xD7", timesd: "\u2A30", tint: "\u222D", toea: "\u2928", topbot: "\u2336", topcir: "\u2AF1", top: "\u22A4", Topf: "\u{1D54B}", topf: "\u{1D565}", topfork: "\u2ADA", tosa: "\u2929", tprime: "\u2034", trade: "\u2122", TRADE: "\u2122", triangle: "\u25B5", triangledown: "\u25BF", triangleleft: "\u25C3", trianglelefteq: "\u22B4", triangleq: "\u225C", triangleright: "\u25B9", trianglerighteq: "\u22B5", tridot: "\u25EC", trie: "\u225C", triminus: "\u2A3A", TripleDot: "\u20DB", triplus: "\u2A39", trisb: "\u29CD", tritime: "\u2A3B", trpezium: "\u23E2", Tscr: "\u{1D4AF}", tscr: "\u{1D4C9}", TScy: "\u0426", tscy: "\u0446", TSHcy: "\u040B", tshcy: "\u045B", Tstrok: "\u0166", tstrok: "\u0167", twixt: "\u226C", twoheadleftarrow: "\u219E", twoheadrightarrow: "\u21A0", Uacute: "\xDA", uacute: "\xFA", uarr: "\u2191", Uarr: "\u219F", uArr: "\u21D1", Uarrocir: "\u2949", Ubrcy: "\u040E", ubrcy: "\u045E", Ubreve: "\u016C", ubreve: "\u016D", Ucirc: "\xDB", ucirc: "\xFB", Ucy: "\u0423", ucy: "\u0443", udarr: "\u21C5", Udblac: "\u0170", udblac: "\u0171", udhar: "\u296E", ufisht: "\u297E", Ufr: "\u{1D518}", ufr: "\u{1D532}", Ugrave: "\xD9", ugrave: "\xF9", uHar: "\u2963", uharl: "\u21BF", uharr: "\u21BE", uhblk: "\u2580", ulcorn: "\u231C", ulcorner: "\u231C", ulcrop: "\u230F", ultri: "\u25F8", Umacr: "\u016A", umacr: "\u016B", uml: "\xA8", UnderBar: "_", UnderBrace: "\u23DF", UnderBracket: "\u23B5", UnderParenthesis: "\u23DD", Union: "\u22C3", UnionPlus: "\u228E", Uogon: "\u0172", uogon: "\u0173", Uopf: "\u{1D54C}", uopf: "\u{1D566}", UpArrowBar: "\u2912", uparrow: "\u2191", UpArrow: "\u2191", Uparrow: "\u21D1", UpArrowDownArrow: "\u21C5", updownarrow: "\u2195", UpDownArrow: "\u2195", Updownarrow: "\u21D5", UpEquilibrium: "\u296E", upharpoonleft: "\u21BF", upharpoonright: "\u21BE", uplus: "\u228E", UpperLeftArrow: "\u2196", UpperRightArrow: "\u2197", upsi: "\u03C5", Upsi: "\u03D2", upsih: "\u03D2", Upsilon: "\u03A5", upsilon: "\u03C5", UpTeeArrow: "\u21A5", UpTee: "\u22A5", upuparrows: "\u21C8", urcorn: "\u231D", urcorner: "\u231D", urcrop: "\u230E", Uring: "\u016E", uring: "\u016F", urtri: "\u25F9", Uscr: "\u{1D4B0}", uscr: "\u{1D4CA}", utdot: "\u22F0", Utilde: "\u0168", utilde: "\u0169", utri: "\u25B5", utrif: "\u25B4", uuarr: "\u21C8", Uuml: "\xDC", uuml: "\xFC", uwangle: "\u29A7", vangrt: "\u299C", varepsilon: "\u03F5", varkappa: "\u03F0", varnothing: "\u2205", varphi: "\u03D5", varpi: "\u03D6", varpropto: "\u221D", varr: "\u2195", vArr: "\u21D5", varrho: "\u03F1", varsigma: "\u03C2", varsubsetneq: "\u228A\uFE00", varsubsetneqq: "\u2ACB\uFE00", varsupsetneq: "\u228B\uFE00", varsupsetneqq: "\u2ACC\uFE00", vartheta: "\u03D1", vartriangleleft: "\u22B2", vartriangleright: "\u22B3", vBar: "\u2AE8", Vbar: "\u2AEB", vBarv: "\u2AE9", Vcy: "\u0412", vcy: "\u0432", vdash: "\u22A2", vDash: "\u22A8", Vdash: "\u22A9", VDash: "\u22AB", Vdashl: "\u2AE6", veebar: "\u22BB", vee: "\u2228", Vee: "\u22C1", veeeq: "\u225A", vellip: "\u22EE", verbar: "|", Verbar: "\u2016", vert: "|", Vert: "\u2016", VerticalBar: "\u2223", VerticalLine: "|", VerticalSeparator: "\u2758", VerticalTilde: "\u2240", VeryThinSpace: "\u200A", Vfr: "\u{1D519}", vfr: "\u{1D533}", vltri: "\u22B2", vnsub: "\u2282\u20D2", vnsup: "\u2283\u20D2", Vopf: "\u{1D54D}", vopf: "\u{1D567}", vprop: "\u221D", vrtri: "\u22B3", Vscr: "\u{1D4B1}", vscr: "\u{1D4CB}", vsubnE: "\u2ACB\uFE00", vsubne: "\u228A\uFE00", vsupnE: "\u2ACC\uFE00", vsupne: "\u228B\uFE00", Vvdash: "\u22AA", vzigzag: "\u299A", Wcirc: "\u0174", wcirc: "\u0175", wedbar: "\u2A5F", wedge: "\u2227", Wedge: "\u22C0", wedgeq: "\u2259", weierp: "\u2118", Wfr: "\u{1D51A}", wfr: "\u{1D534}", Wopf: "\u{1D54E}", wopf: "\u{1D568}", wp: "\u2118", wr: "\u2240", wreath: "\u2240", Wscr: "\u{1D4B2}", wscr: "\u{1D4CC}", xcap: "\u22C2", xcirc: "\u25EF", xcup: "\u22C3", xdtri: "\u25BD", Xfr: "\u{1D51B}", xfr: "\u{1D535}", xharr: "\u27F7", xhArr: "\u27FA", Xi: "\u039E", xi: "\u03BE", xlarr: "\u27F5", xlArr: "\u27F8", xmap: "\u27FC", xnis: "\u22FB", xodot: "\u2A00", Xopf: "\u{1D54F}", xopf: "\u{1D569}", xoplus: "\u2A01", xotime: "\u2A02", xrarr: "\u27F6", xrArr: "\u27F9", Xscr: "\u{1D4B3}", xscr: "\u{1D4CD}", xsqcup: "\u2A06", xuplus: "\u2A04", xutri: "\u25B3", xvee: "\u22C1", xwedge: "\u22C0", Yacute: "\xDD", yacute: "\xFD", YAcy: "\u042F", yacy: "\u044F", Ycirc: "\u0176", ycirc: "\u0177", Ycy: "\u042B", ycy: "\u044B", yen: "\xA5", Yfr: "\u{1D51C}", yfr: "\u{1D536}", YIcy: "\u0407", yicy: "\u0457", Yopf: "\u{1D550}", yopf: "\u{1D56A}", Yscr: "\u{1D4B4}", yscr: "\u{1D4CE}", YUcy: "\u042E", yucy: "\u044E", yuml: "\xFF", Yuml: "\u0178", Zacute: "\u0179", zacute: "\u017A", Zcaron: "\u017D", zcaron: "\u017E", Zcy: "\u0417", zcy: "\u0437", Zdot: "\u017B", zdot: "\u017C", zeetrf: "\u2128", ZeroWidthSpace: "\u200B", Zeta: "\u0396", zeta: "\u03B6", zfr: "\u{1D537}", Zfr: "\u2128", ZHcy: "\u0416", zhcy: "\u0436", zigrarr: "\u21DD", zopf: "\u{1D56B}", Zopf: "\u2124", Zscr: "\u{1D4B5}", zscr: "\u{1D4CF}", zwj: "\u200D", zwnj: "\u200C" };
  }
});

// node_modules/entities/lib/maps/legacy.json
var require_legacy = __commonJS({
  "node_modules/entities/lib/maps/legacy.json"(exports, module) {
    module.exports = { Aacute: "\xC1", aacute: "\xE1", Acirc: "\xC2", acirc: "\xE2", acute: "\xB4", AElig: "\xC6", aelig: "\xE6", Agrave: "\xC0", agrave: "\xE0", amp: "&", AMP: "&", Aring: "\xC5", aring: "\xE5", Atilde: "\xC3", atilde: "\xE3", Auml: "\xC4", auml: "\xE4", brvbar: "\xA6", Ccedil: "\xC7", ccedil: "\xE7", cedil: "\xB8", cent: "\xA2", copy: "\xA9", COPY: "\xA9", curren: "\xA4", deg: "\xB0", divide: "\xF7", Eacute: "\xC9", eacute: "\xE9", Ecirc: "\xCA", ecirc: "\xEA", Egrave: "\xC8", egrave: "\xE8", ETH: "\xD0", eth: "\xF0", Euml: "\xCB", euml: "\xEB", frac12: "\xBD", frac14: "\xBC", frac34: "\xBE", gt: ">", GT: ">", Iacute: "\xCD", iacute: "\xED", Icirc: "\xCE", icirc: "\xEE", iexcl: "\xA1", Igrave: "\xCC", igrave: "\xEC", iquest: "\xBF", Iuml: "\xCF", iuml: "\xEF", laquo: "\xAB", lt: "<", LT: "<", macr: "\xAF", micro: "\xB5", middot: "\xB7", nbsp: "\xA0", not: "\xAC", Ntilde: "\xD1", ntilde: "\xF1", Oacute: "\xD3", oacute: "\xF3", Ocirc: "\xD4", ocirc: "\xF4", Ograve: "\xD2", ograve: "\xF2", ordf: "\xAA", ordm: "\xBA", Oslash: "\xD8", oslash: "\xF8", Otilde: "\xD5", otilde: "\xF5", Ouml: "\xD6", ouml: "\xF6", para: "\xB6", plusmn: "\xB1", pound: "\xA3", quot: '"', QUOT: '"', raquo: "\xBB", reg: "\xAE", REG: "\xAE", sect: "\xA7", shy: "\xAD", sup1: "\xB9", sup2: "\xB2", sup3: "\xB3", szlig: "\xDF", THORN: "\xDE", thorn: "\xFE", times: "\xD7", Uacute: "\xDA", uacute: "\xFA", Ucirc: "\xDB", ucirc: "\xFB", Ugrave: "\xD9", ugrave: "\xF9", uml: "\xA8", Uuml: "\xDC", uuml: "\xFC", Yacute: "\xDD", yacute: "\xFD", yen: "\xA5", yuml: "\xFF" };
  }
});

// node_modules/entities/lib/maps/xml.json
var require_xml = __commonJS({
  "node_modules/entities/lib/maps/xml.json"(exports, module) {
    module.exports = { amp: "&", apos: "'", gt: ">", lt: "<", quot: '"' };
  }
});

// node_modules/htmlparser2/lib/Tokenizer.js
var require_Tokenizer = __commonJS({
  "node_modules/htmlparser2/lib/Tokenizer.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod2) {
      return mod2 && mod2.__esModule ? mod2 : { "default": mod2 };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var decode_codepoint_1 = __importDefault(require_decode_codepoint());
    var entities_json_1 = __importDefault(require_entities());
    var legacy_json_1 = __importDefault(require_legacy());
    var xml_json_1 = __importDefault(require_xml());
    function whitespace2(c) {
      return c === " " || c === "\n" || c === "	" || c === "\f" || c === "\r";
    }
    function isASCIIAlpha(c) {
      return c >= "a" && c <= "z" || c >= "A" && c <= "Z";
    }
    function ifElseState(upper, SUCCESS, FAILURE) {
      var lower = upper.toLowerCase();
      if (upper === lower) {
        return function(t, c) {
          if (c === lower) {
            t._state = SUCCESS;
          } else {
            t._state = FAILURE;
            t._index--;
          }
        };
      }
      return function(t, c) {
        if (c === lower || c === upper) {
          t._state = SUCCESS;
        } else {
          t._state = FAILURE;
          t._index--;
        }
      };
    }
    function consumeSpecialNameChar(upper, NEXT_STATE) {
      var lower = upper.toLowerCase();
      return function(t, c) {
        if (c === lower || c === upper) {
          t._state = NEXT_STATE;
        } else {
          t._state = 3;
          t._index--;
        }
      };
    }
    var stateBeforeCdata1 = ifElseState(
      "C",
      24,
      16
      /* InDeclaration */
    );
    var stateBeforeCdata2 = ifElseState(
      "D",
      25,
      16
      /* InDeclaration */
    );
    var stateBeforeCdata3 = ifElseState(
      "A",
      26,
      16
      /* InDeclaration */
    );
    var stateBeforeCdata4 = ifElseState(
      "T",
      27,
      16
      /* InDeclaration */
    );
    var stateBeforeCdata5 = ifElseState(
      "A",
      28,
      16
      /* InDeclaration */
    );
    var stateBeforeScript1 = consumeSpecialNameChar(
      "R",
      35
      /* BeforeScript2 */
    );
    var stateBeforeScript2 = consumeSpecialNameChar(
      "I",
      36
      /* BeforeScript3 */
    );
    var stateBeforeScript3 = consumeSpecialNameChar(
      "P",
      37
      /* BeforeScript4 */
    );
    var stateBeforeScript4 = consumeSpecialNameChar(
      "T",
      38
      /* BeforeScript5 */
    );
    var stateAfterScript1 = ifElseState(
      "R",
      40,
      1
      /* Text */
    );
    var stateAfterScript2 = ifElseState(
      "I",
      41,
      1
      /* Text */
    );
    var stateAfterScript3 = ifElseState(
      "P",
      42,
      1
      /* Text */
    );
    var stateAfterScript4 = ifElseState(
      "T",
      43,
      1
      /* Text */
    );
    var stateBeforeStyle1 = consumeSpecialNameChar(
      "Y",
      45
      /* BeforeStyle2 */
    );
    var stateBeforeStyle2 = consumeSpecialNameChar(
      "L",
      46
      /* BeforeStyle3 */
    );
    var stateBeforeStyle3 = consumeSpecialNameChar(
      "E",
      47
      /* BeforeStyle4 */
    );
    var stateAfterStyle1 = ifElseState(
      "Y",
      49,
      1
      /* Text */
    );
    var stateAfterStyle2 = ifElseState(
      "L",
      50,
      1
      /* Text */
    );
    var stateAfterStyle3 = ifElseState(
      "E",
      51,
      1
      /* Text */
    );
    var stateBeforeSpecialT = consumeSpecialNameChar(
      "I",
      54
      /* BeforeTitle1 */
    );
    var stateBeforeTitle1 = consumeSpecialNameChar(
      "T",
      55
      /* BeforeTitle2 */
    );
    var stateBeforeTitle2 = consumeSpecialNameChar(
      "L",
      56
      /* BeforeTitle3 */
    );
    var stateBeforeTitle3 = consumeSpecialNameChar(
      "E",
      57
      /* BeforeTitle4 */
    );
    var stateAfterSpecialTEnd = ifElseState(
      "I",
      58,
      1
      /* Text */
    );
    var stateAfterTitle1 = ifElseState(
      "T",
      59,
      1
      /* Text */
    );
    var stateAfterTitle2 = ifElseState(
      "L",
      60,
      1
      /* Text */
    );
    var stateAfterTitle3 = ifElseState(
      "E",
      61,
      1
      /* Text */
    );
    var stateBeforeEntity = ifElseState(
      "#",
      63,
      64
      /* InNamedEntity */
    );
    var stateBeforeNumericEntity = ifElseState(
      "X",
      66,
      65
      /* InNumericEntity */
    );
    var Tokenizer = (
      /** @class */
      function() {
        function Tokenizer2(options2, cbs) {
          var _a2;
          this._state = 1;
          this.buffer = "";
          this.sectionStart = 0;
          this._index = 0;
          this.bufferOffset = 0;
          this.baseState = 1;
          this.special = 1;
          this.running = true;
          this.ended = false;
          this.cbs = cbs;
          this.xmlMode = !!(options2 === null || options2 === void 0 ? void 0 : options2.xmlMode);
          this.decodeEntities = (_a2 = options2 === null || options2 === void 0 ? void 0 : options2.decodeEntities) !== null && _a2 !== void 0 ? _a2 : true;
        }
        Tokenizer2.prototype.reset = function() {
          this._state = 1;
          this.buffer = "";
          this.sectionStart = 0;
          this._index = 0;
          this.bufferOffset = 0;
          this.baseState = 1;
          this.special = 1;
          this.running = true;
          this.ended = false;
        };
        Tokenizer2.prototype.write = function(chunk) {
          if (this.ended)
            this.cbs.onerror(Error(".write() after done!"));
          this.buffer += chunk;
          this.parse();
        };
        Tokenizer2.prototype.end = function(chunk) {
          if (this.ended)
            this.cbs.onerror(Error(".end() after done!"));
          if (chunk)
            this.write(chunk);
          this.ended = true;
          if (this.running)
            this.finish();
        };
        Tokenizer2.prototype.pause = function() {
          this.running = false;
        };
        Tokenizer2.prototype.resume = function() {
          this.running = true;
          if (this._index < this.buffer.length) {
            this.parse();
          }
          if (this.ended) {
            this.finish();
          }
        };
        Tokenizer2.prototype.getAbsoluteIndex = function() {
          return this.bufferOffset + this._index;
        };
        Tokenizer2.prototype.stateText = function(c) {
          if (c === "<") {
            if (this._index > this.sectionStart) {
              this.cbs.ontext(this.getSection());
            }
            this._state = 2;
            this.sectionStart = this._index;
          } else if (this.decodeEntities && c === "&" && (this.special === 1 || this.special === 4)) {
            if (this._index > this.sectionStart) {
              this.cbs.ontext(this.getSection());
            }
            this.baseState = 1;
            this._state = 62;
            this.sectionStart = this._index;
          }
        };
        Tokenizer2.prototype.isTagStartChar = function(c) {
          return isASCIIAlpha(c) || this.xmlMode && !whitespace2(c) && c !== "/" && c !== ">";
        };
        Tokenizer2.prototype.stateBeforeTagName = function(c) {
          if (c === "/") {
            this._state = 5;
          } else if (c === "<") {
            this.cbs.ontext(this.getSection());
            this.sectionStart = this._index;
          } else if (c === ">" || this.special !== 1 || whitespace2(c)) {
            this._state = 1;
          } else if (c === "!") {
            this._state = 15;
            this.sectionStart = this._index + 1;
          } else if (c === "?") {
            this._state = 17;
            this.sectionStart = this._index + 1;
          } else if (!this.isTagStartChar(c)) {
            this._state = 1;
          } else {
            this._state = !this.xmlMode && (c === "s" || c === "S") ? 32 : !this.xmlMode && (c === "t" || c === "T") ? 52 : 3;
            this.sectionStart = this._index;
          }
        };
        Tokenizer2.prototype.stateInTagName = function(c) {
          if (c === "/" || c === ">" || whitespace2(c)) {
            this.emitToken("onopentagname");
            this._state = 8;
            this._index--;
          }
        };
        Tokenizer2.prototype.stateBeforeClosingTagName = function(c) {
          if (whitespace2(c)) {
          } else if (c === ">") {
            this._state = 1;
          } else if (this.special !== 1) {
            if (this.special !== 4 && (c === "s" || c === "S")) {
              this._state = 33;
            } else if (this.special === 4 && (c === "t" || c === "T")) {
              this._state = 53;
            } else {
              this._state = 1;
              this._index--;
            }
          } else if (!this.isTagStartChar(c)) {
            this._state = 20;
            this.sectionStart = this._index;
          } else {
            this._state = 6;
            this.sectionStart = this._index;
          }
        };
        Tokenizer2.prototype.stateInClosingTagName = function(c) {
          if (c === ">" || whitespace2(c)) {
            this.emitToken("onclosetag");
            this._state = 7;
            this._index--;
          }
        };
        Tokenizer2.prototype.stateAfterClosingTagName = function(c) {
          if (c === ">") {
            this._state = 1;
            this.sectionStart = this._index + 1;
          }
        };
        Tokenizer2.prototype.stateBeforeAttributeName = function(c) {
          if (c === ">") {
            this.cbs.onopentagend();
            this._state = 1;
            this.sectionStart = this._index + 1;
          } else if (c === "/") {
            this._state = 4;
          } else if (!whitespace2(c)) {
            this._state = 9;
            this.sectionStart = this._index;
          }
        };
        Tokenizer2.prototype.stateInSelfClosingTag = function(c) {
          if (c === ">") {
            this.cbs.onselfclosingtag();
            this._state = 1;
            this.sectionStart = this._index + 1;
            this.special = 1;
          } else if (!whitespace2(c)) {
            this._state = 8;
            this._index--;
          }
        };
        Tokenizer2.prototype.stateInAttributeName = function(c) {
          if (c === "=" || c === "/" || c === ">" || whitespace2(c)) {
            this.cbs.onattribname(this.getSection());
            this.sectionStart = -1;
            this._state = 10;
            this._index--;
          }
        };
        Tokenizer2.prototype.stateAfterAttributeName = function(c) {
          if (c === "=") {
            this._state = 11;
          } else if (c === "/" || c === ">") {
            this.cbs.onattribend(void 0);
            this._state = 8;
            this._index--;
          } else if (!whitespace2(c)) {
            this.cbs.onattribend(void 0);
            this._state = 9;
            this.sectionStart = this._index;
          }
        };
        Tokenizer2.prototype.stateBeforeAttributeValue = function(c) {
          if (c === '"') {
            this._state = 12;
            this.sectionStart = this._index + 1;
          } else if (c === "'") {
            this._state = 13;
            this.sectionStart = this._index + 1;
          } else if (!whitespace2(c)) {
            this._state = 14;
            this.sectionStart = this._index;
            this._index--;
          }
        };
        Tokenizer2.prototype.handleInAttributeValue = function(c, quote) {
          if (c === quote) {
            this.emitToken("onattribdata");
            this.cbs.onattribend(quote);
            this._state = 8;
          } else if (this.decodeEntities && c === "&") {
            this.emitToken("onattribdata");
            this.baseState = this._state;
            this._state = 62;
            this.sectionStart = this._index;
          }
        };
        Tokenizer2.prototype.stateInAttributeValueDoubleQuotes = function(c) {
          this.handleInAttributeValue(c, '"');
        };
        Tokenizer2.prototype.stateInAttributeValueSingleQuotes = function(c) {
          this.handleInAttributeValue(c, "'");
        };
        Tokenizer2.prototype.stateInAttributeValueNoQuotes = function(c) {
          if (whitespace2(c) || c === ">") {
            this.emitToken("onattribdata");
            this.cbs.onattribend(null);
            this._state = 8;
            this._index--;
          } else if (this.decodeEntities && c === "&") {
            this.emitToken("onattribdata");
            this.baseState = this._state;
            this._state = 62;
            this.sectionStart = this._index;
          }
        };
        Tokenizer2.prototype.stateBeforeDeclaration = function(c) {
          this._state = c === "[" ? 23 : c === "-" ? 18 : 16;
        };
        Tokenizer2.prototype.stateInDeclaration = function(c) {
          if (c === ">") {
            this.cbs.ondeclaration(this.getSection());
            this._state = 1;
            this.sectionStart = this._index + 1;
          }
        };
        Tokenizer2.prototype.stateInProcessingInstruction = function(c) {
          if (c === ">") {
            this.cbs.onprocessinginstruction(this.getSection());
            this._state = 1;
            this.sectionStart = this._index + 1;
          }
        };
        Tokenizer2.prototype.stateBeforeComment = function(c) {
          if (c === "-") {
            this._state = 19;
            this.sectionStart = this._index + 1;
          } else {
            this._state = 16;
          }
        };
        Tokenizer2.prototype.stateInComment = function(c) {
          if (c === "-")
            this._state = 21;
        };
        Tokenizer2.prototype.stateInSpecialComment = function(c) {
          if (c === ">") {
            this.cbs.oncomment(this.buffer.substring(this.sectionStart, this._index));
            this._state = 1;
            this.sectionStart = this._index + 1;
          }
        };
        Tokenizer2.prototype.stateAfterComment1 = function(c) {
          if (c === "-") {
            this._state = 22;
          } else {
            this._state = 19;
          }
        };
        Tokenizer2.prototype.stateAfterComment2 = function(c) {
          if (c === ">") {
            this.cbs.oncomment(this.buffer.substring(this.sectionStart, this._index - 2));
            this._state = 1;
            this.sectionStart = this._index + 1;
          } else if (c !== "-") {
            this._state = 19;
          }
        };
        Tokenizer2.prototype.stateBeforeCdata6 = function(c) {
          if (c === "[") {
            this._state = 29;
            this.sectionStart = this._index + 1;
          } else {
            this._state = 16;
            this._index--;
          }
        };
        Tokenizer2.prototype.stateInCdata = function(c) {
          if (c === "]")
            this._state = 30;
        };
        Tokenizer2.prototype.stateAfterCdata1 = function(c) {
          if (c === "]")
            this._state = 31;
          else
            this._state = 29;
        };
        Tokenizer2.prototype.stateAfterCdata2 = function(c) {
          if (c === ">") {
            this.cbs.oncdata(this.buffer.substring(this.sectionStart, this._index - 2));
            this._state = 1;
            this.sectionStart = this._index + 1;
          } else if (c !== "]") {
            this._state = 29;
          }
        };
        Tokenizer2.prototype.stateBeforeSpecialS = function(c) {
          if (c === "c" || c === "C") {
            this._state = 34;
          } else if (c === "t" || c === "T") {
            this._state = 44;
          } else {
            this._state = 3;
            this._index--;
          }
        };
        Tokenizer2.prototype.stateBeforeSpecialSEnd = function(c) {
          if (this.special === 2 && (c === "c" || c === "C")) {
            this._state = 39;
          } else if (this.special === 3 && (c === "t" || c === "T")) {
            this._state = 48;
          } else
            this._state = 1;
        };
        Tokenizer2.prototype.stateBeforeSpecialLast = function(c, special) {
          if (c === "/" || c === ">" || whitespace2(c)) {
            this.special = special;
          }
          this._state = 3;
          this._index--;
        };
        Tokenizer2.prototype.stateAfterSpecialLast = function(c, sectionStartOffset) {
          if (c === ">" || whitespace2(c)) {
            this.special = 1;
            this._state = 6;
            this.sectionStart = this._index - sectionStartOffset;
            this._index--;
          } else
            this._state = 1;
        };
        Tokenizer2.prototype.parseFixedEntity = function(map) {
          if (map === void 0) {
            map = this.xmlMode ? xml_json_1.default : entities_json_1.default;
          }
          if (this.sectionStart + 1 < this._index) {
            var entity = this.buffer.substring(this.sectionStart + 1, this._index);
            if (Object.prototype.hasOwnProperty.call(map, entity)) {
              this.emitPartial(map[entity]);
              this.sectionStart = this._index + 1;
            }
          }
        };
        Tokenizer2.prototype.parseLegacyEntity = function() {
          var start = this.sectionStart + 1;
          var limit = Math.min(this._index - start, 6);
          while (limit >= 2) {
            var entity = this.buffer.substr(start, limit);
            if (Object.prototype.hasOwnProperty.call(legacy_json_1.default, entity)) {
              this.emitPartial(legacy_json_1.default[entity]);
              this.sectionStart += limit + 1;
              return;
            }
            limit--;
          }
        };
        Tokenizer2.prototype.stateInNamedEntity = function(c) {
          if (c === ";") {
            this.parseFixedEntity();
            if (this.baseState === 1 && this.sectionStart + 1 < this._index && !this.xmlMode) {
              this.parseLegacyEntity();
            }
            this._state = this.baseState;
          } else if ((c < "0" || c > "9") && !isASCIIAlpha(c)) {
            if (this.xmlMode || this.sectionStart + 1 === this._index) {
            } else if (this.baseState !== 1) {
              if (c !== "=") {
                this.parseFixedEntity(legacy_json_1.default);
              }
            } else {
              this.parseLegacyEntity();
            }
            this._state = this.baseState;
            this._index--;
          }
        };
        Tokenizer2.prototype.decodeNumericEntity = function(offset, base, strict) {
          var sectionStart = this.sectionStart + offset;
          if (sectionStart !== this._index) {
            var entity = this.buffer.substring(sectionStart, this._index);
            var parsed = parseInt(entity, base);
            this.emitPartial(decode_codepoint_1.default(parsed));
            this.sectionStart = strict ? this._index + 1 : this._index;
          }
          this._state = this.baseState;
        };
        Tokenizer2.prototype.stateInNumericEntity = function(c) {
          if (c === ";") {
            this.decodeNumericEntity(2, 10, true);
          } else if (c < "0" || c > "9") {
            if (!this.xmlMode) {
              this.decodeNumericEntity(2, 10, false);
            } else {
              this._state = this.baseState;
            }
            this._index--;
          }
        };
        Tokenizer2.prototype.stateInHexEntity = function(c) {
          if (c === ";") {
            this.decodeNumericEntity(3, 16, true);
          } else if ((c < "a" || c > "f") && (c < "A" || c > "F") && (c < "0" || c > "9")) {
            if (!this.xmlMode) {
              this.decodeNumericEntity(3, 16, false);
            } else {
              this._state = this.baseState;
            }
            this._index--;
          }
        };
        Tokenizer2.prototype.cleanup = function() {
          if (this.sectionStart < 0) {
            this.buffer = "";
            this.bufferOffset += this._index;
            this._index = 0;
          } else if (this.running) {
            if (this._state === 1) {
              if (this.sectionStart !== this._index) {
                this.cbs.ontext(this.buffer.substr(this.sectionStart));
              }
              this.buffer = "";
              this.bufferOffset += this._index;
              this._index = 0;
            } else if (this.sectionStart === this._index) {
              this.buffer = "";
              this.bufferOffset += this._index;
              this._index = 0;
            } else {
              this.buffer = this.buffer.substr(this.sectionStart);
              this._index -= this.sectionStart;
              this.bufferOffset += this.sectionStart;
            }
            this.sectionStart = 0;
          }
        };
        Tokenizer2.prototype.parse = function() {
          while (this._index < this.buffer.length && this.running) {
            var c = this.buffer.charAt(this._index);
            if (this._state === 1) {
              this.stateText(c);
            } else if (this._state === 12) {
              this.stateInAttributeValueDoubleQuotes(c);
            } else if (this._state === 9) {
              this.stateInAttributeName(c);
            } else if (this._state === 19) {
              this.stateInComment(c);
            } else if (this._state === 20) {
              this.stateInSpecialComment(c);
            } else if (this._state === 8) {
              this.stateBeforeAttributeName(c);
            } else if (this._state === 3) {
              this.stateInTagName(c);
            } else if (this._state === 6) {
              this.stateInClosingTagName(c);
            } else if (this._state === 2) {
              this.stateBeforeTagName(c);
            } else if (this._state === 10) {
              this.stateAfterAttributeName(c);
            } else if (this._state === 13) {
              this.stateInAttributeValueSingleQuotes(c);
            } else if (this._state === 11) {
              this.stateBeforeAttributeValue(c);
            } else if (this._state === 5) {
              this.stateBeforeClosingTagName(c);
            } else if (this._state === 7) {
              this.stateAfterClosingTagName(c);
            } else if (this._state === 32) {
              this.stateBeforeSpecialS(c);
            } else if (this._state === 21) {
              this.stateAfterComment1(c);
            } else if (this._state === 14) {
              this.stateInAttributeValueNoQuotes(c);
            } else if (this._state === 4) {
              this.stateInSelfClosingTag(c);
            } else if (this._state === 16) {
              this.stateInDeclaration(c);
            } else if (this._state === 15) {
              this.stateBeforeDeclaration(c);
            } else if (this._state === 22) {
              this.stateAfterComment2(c);
            } else if (this._state === 18) {
              this.stateBeforeComment(c);
            } else if (this._state === 33) {
              this.stateBeforeSpecialSEnd(c);
            } else if (this._state === 53) {
              stateAfterSpecialTEnd(this, c);
            } else if (this._state === 39) {
              stateAfterScript1(this, c);
            } else if (this._state === 40) {
              stateAfterScript2(this, c);
            } else if (this._state === 41) {
              stateAfterScript3(this, c);
            } else if (this._state === 34) {
              stateBeforeScript1(this, c);
            } else if (this._state === 35) {
              stateBeforeScript2(this, c);
            } else if (this._state === 36) {
              stateBeforeScript3(this, c);
            } else if (this._state === 37) {
              stateBeforeScript4(this, c);
            } else if (this._state === 38) {
              this.stateBeforeSpecialLast(
                c,
                2
                /* Script */
              );
            } else if (this._state === 42) {
              stateAfterScript4(this, c);
            } else if (this._state === 43) {
              this.stateAfterSpecialLast(c, 6);
            } else if (this._state === 44) {
              stateBeforeStyle1(this, c);
            } else if (this._state === 29) {
              this.stateInCdata(c);
            } else if (this._state === 45) {
              stateBeforeStyle2(this, c);
            } else if (this._state === 46) {
              stateBeforeStyle3(this, c);
            } else if (this._state === 47) {
              this.stateBeforeSpecialLast(
                c,
                3
                /* Style */
              );
            } else if (this._state === 48) {
              stateAfterStyle1(this, c);
            } else if (this._state === 49) {
              stateAfterStyle2(this, c);
            } else if (this._state === 50) {
              stateAfterStyle3(this, c);
            } else if (this._state === 51) {
              this.stateAfterSpecialLast(c, 5);
            } else if (this._state === 52) {
              stateBeforeSpecialT(this, c);
            } else if (this._state === 54) {
              stateBeforeTitle1(this, c);
            } else if (this._state === 55) {
              stateBeforeTitle2(this, c);
            } else if (this._state === 56) {
              stateBeforeTitle3(this, c);
            } else if (this._state === 57) {
              this.stateBeforeSpecialLast(
                c,
                4
                /* Title */
              );
            } else if (this._state === 58) {
              stateAfterTitle1(this, c);
            } else if (this._state === 59) {
              stateAfterTitle2(this, c);
            } else if (this._state === 60) {
              stateAfterTitle3(this, c);
            } else if (this._state === 61) {
              this.stateAfterSpecialLast(c, 5);
            } else if (this._state === 17) {
              this.stateInProcessingInstruction(c);
            } else if (this._state === 64) {
              this.stateInNamedEntity(c);
            } else if (this._state === 23) {
              stateBeforeCdata1(this, c);
            } else if (this._state === 62) {
              stateBeforeEntity(this, c);
            } else if (this._state === 24) {
              stateBeforeCdata2(this, c);
            } else if (this._state === 25) {
              stateBeforeCdata3(this, c);
            } else if (this._state === 30) {
              this.stateAfterCdata1(c);
            } else if (this._state === 31) {
              this.stateAfterCdata2(c);
            } else if (this._state === 26) {
              stateBeforeCdata4(this, c);
            } else if (this._state === 27) {
              stateBeforeCdata5(this, c);
            } else if (this._state === 28) {
              this.stateBeforeCdata6(c);
            } else if (this._state === 66) {
              this.stateInHexEntity(c);
            } else if (this._state === 65) {
              this.stateInNumericEntity(c);
            } else if (this._state === 63) {
              stateBeforeNumericEntity(this, c);
            } else {
              this.cbs.onerror(Error("unknown _state"), this._state);
            }
            this._index++;
          }
          this.cleanup();
        };
        Tokenizer2.prototype.finish = function() {
          if (this.sectionStart < this._index) {
            this.handleTrailingData();
          }
          this.cbs.onend();
        };
        Tokenizer2.prototype.handleTrailingData = function() {
          var data = this.buffer.substr(this.sectionStart);
          if (this._state === 29 || this._state === 30 || this._state === 31) {
            this.cbs.oncdata(data);
          } else if (this._state === 19 || this._state === 21 || this._state === 22) {
            this.cbs.oncomment(data);
          } else if (this._state === 64 && !this.xmlMode) {
            this.parseLegacyEntity();
            if (this.sectionStart < this._index) {
              this._state = this.baseState;
              this.handleTrailingData();
            }
          } else if (this._state === 65 && !this.xmlMode) {
            this.decodeNumericEntity(2, 10, false);
            if (this.sectionStart < this._index) {
              this._state = this.baseState;
              this.handleTrailingData();
            }
          } else if (this._state === 66 && !this.xmlMode) {
            this.decodeNumericEntity(3, 16, false);
            if (this.sectionStart < this._index) {
              this._state = this.baseState;
              this.handleTrailingData();
            }
          } else if (this._state !== 3 && this._state !== 8 && this._state !== 11 && this._state !== 10 && this._state !== 9 && this._state !== 13 && this._state !== 12 && this._state !== 14 && this._state !== 6) {
            this.cbs.ontext(data);
          }
        };
        Tokenizer2.prototype.getSection = function() {
          return this.buffer.substring(this.sectionStart, this._index);
        };
        Tokenizer2.prototype.emitToken = function(name) {
          this.cbs[name](this.getSection());
          this.sectionStart = -1;
        };
        Tokenizer2.prototype.emitPartial = function(value) {
          if (this.baseState !== 1) {
            this.cbs.onattribdata(value);
          } else {
            this.cbs.ontext(value);
          }
        };
        return Tokenizer2;
      }()
    );
    exports.default = Tokenizer;
  }
});

// node_modules/htmlparser2/lib/Parser.js
var require_Parser = __commonJS({
  "node_modules/htmlparser2/lib/Parser.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod2) {
      return mod2 && mod2.__esModule ? mod2 : { "default": mod2 };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Parser = void 0;
    var Tokenizer_1 = __importDefault(require_Tokenizer());
    var formTags = /* @__PURE__ */ new Set([
      "input",
      "option",
      "optgroup",
      "select",
      "button",
      "datalist",
      "textarea"
    ]);
    var pTag = /* @__PURE__ */ new Set(["p"]);
    var openImpliesClose = {
      tr: /* @__PURE__ */ new Set(["tr", "th", "td"]),
      th: /* @__PURE__ */ new Set(["th"]),
      td: /* @__PURE__ */ new Set(["thead", "th", "td"]),
      body: /* @__PURE__ */ new Set(["head", "link", "script"]),
      li: /* @__PURE__ */ new Set(["li"]),
      p: pTag,
      h1: pTag,
      h2: pTag,
      h3: pTag,
      h4: pTag,
      h5: pTag,
      h6: pTag,
      select: formTags,
      input: formTags,
      output: formTags,
      button: formTags,
      datalist: formTags,
      textarea: formTags,
      option: /* @__PURE__ */ new Set(["option"]),
      optgroup: /* @__PURE__ */ new Set(["optgroup", "option"]),
      dd: /* @__PURE__ */ new Set(["dt", "dd"]),
      dt: /* @__PURE__ */ new Set(["dt", "dd"]),
      address: pTag,
      article: pTag,
      aside: pTag,
      blockquote: pTag,
      details: pTag,
      div: pTag,
      dl: pTag,
      fieldset: pTag,
      figcaption: pTag,
      figure: pTag,
      footer: pTag,
      form: pTag,
      header: pTag,
      hr: pTag,
      main: pTag,
      nav: pTag,
      ol: pTag,
      pre: pTag,
      section: pTag,
      table: pTag,
      ul: pTag,
      rt: /* @__PURE__ */ new Set(["rt", "rp"]),
      rp: /* @__PURE__ */ new Set(["rt", "rp"]),
      tbody: /* @__PURE__ */ new Set(["thead", "tbody"]),
      tfoot: /* @__PURE__ */ new Set(["thead", "tbody"])
    };
    var voidElements = /* @__PURE__ */ new Set([
      "area",
      "base",
      "basefont",
      "br",
      "col",
      "command",
      "embed",
      "frame",
      "hr",
      "img",
      "input",
      "isindex",
      "keygen",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr"
    ]);
    var foreignContextElements = /* @__PURE__ */ new Set(["math", "svg"]);
    var htmlIntegrationElements = /* @__PURE__ */ new Set([
      "mi",
      "mo",
      "mn",
      "ms",
      "mtext",
      "annotation-xml",
      "foreignObject",
      "desc",
      "title"
    ]);
    var reNameEnd = /\s|\//;
    var Parser = (
      /** @class */
      function() {
        function Parser2(cbs, options2) {
          if (options2 === void 0) {
            options2 = {};
          }
          var _a2, _b2, _c18, _d2, _e;
          this.startIndex = 0;
          this.endIndex = null;
          this.tagname = "";
          this.attribname = "";
          this.attribvalue = "";
          this.attribs = null;
          this.stack = [];
          this.foreignContext = [];
          this.options = options2;
          this.cbs = cbs !== null && cbs !== void 0 ? cbs : {};
          this.lowerCaseTagNames = (_a2 = options2.lowerCaseTags) !== null && _a2 !== void 0 ? _a2 : !options2.xmlMode;
          this.lowerCaseAttributeNames = (_b2 = options2.lowerCaseAttributeNames) !== null && _b2 !== void 0 ? _b2 : !options2.xmlMode;
          this.tokenizer = new ((_c18 = options2.Tokenizer) !== null && _c18 !== void 0 ? _c18 : Tokenizer_1.default)(this.options, this);
          (_e = (_d2 = this.cbs).onparserinit) === null || _e === void 0 ? void 0 : _e.call(_d2, this);
        }
        Parser2.prototype.updatePosition = function(initialOffset) {
          if (this.endIndex === null) {
            if (this.tokenizer.sectionStart <= initialOffset) {
              this.startIndex = 0;
            } else {
              this.startIndex = this.tokenizer.sectionStart - initialOffset;
            }
          } else {
            this.startIndex = this.endIndex + 1;
          }
          this.endIndex = this.tokenizer.getAbsoluteIndex();
        };
        Parser2.prototype.ontext = function(data) {
          var _a2, _b2;
          this.updatePosition(1);
          this.endIndex--;
          (_b2 = (_a2 = this.cbs).ontext) === null || _b2 === void 0 ? void 0 : _b2.call(_a2, data);
        };
        Parser2.prototype.onopentagname = function(name) {
          var _a2, _b2;
          if (this.lowerCaseTagNames) {
            name = name.toLowerCase();
          }
          this.tagname = name;
          if (!this.options.xmlMode && Object.prototype.hasOwnProperty.call(openImpliesClose, name)) {
            var el = void 0;
            while (this.stack.length > 0 && openImpliesClose[name].has(el = this.stack[this.stack.length - 1])) {
              this.onclosetag(el);
            }
          }
          if (this.options.xmlMode || !voidElements.has(name)) {
            this.stack.push(name);
            if (foreignContextElements.has(name)) {
              this.foreignContext.push(true);
            } else if (htmlIntegrationElements.has(name)) {
              this.foreignContext.push(false);
            }
          }
          (_b2 = (_a2 = this.cbs).onopentagname) === null || _b2 === void 0 ? void 0 : _b2.call(_a2, name);
          if (this.cbs.onopentag)
            this.attribs = {};
        };
        Parser2.prototype.onopentagend = function() {
          var _a2, _b2;
          this.updatePosition(1);
          if (this.attribs) {
            (_b2 = (_a2 = this.cbs).onopentag) === null || _b2 === void 0 ? void 0 : _b2.call(_a2, this.tagname, this.attribs);
            this.attribs = null;
          }
          if (!this.options.xmlMode && this.cbs.onclosetag && voidElements.has(this.tagname)) {
            this.cbs.onclosetag(this.tagname);
          }
          this.tagname = "";
        };
        Parser2.prototype.onclosetag = function(name) {
          this.updatePosition(1);
          if (this.lowerCaseTagNames) {
            name = name.toLowerCase();
          }
          if (foreignContextElements.has(name) || htmlIntegrationElements.has(name)) {
            this.foreignContext.pop();
          }
          if (this.stack.length && (this.options.xmlMode || !voidElements.has(name))) {
            var pos = this.stack.lastIndexOf(name);
            if (pos !== -1) {
              if (this.cbs.onclosetag) {
                pos = this.stack.length - pos;
                while (pos--) {
                  this.cbs.onclosetag(this.stack.pop());
                }
              } else
                this.stack.length = pos;
            } else if (name === "p" && !this.options.xmlMode) {
              this.onopentagname(name);
              this.closeCurrentTag();
            }
          } else if (!this.options.xmlMode && (name === "br" || name === "p")) {
            this.onopentagname(name);
            this.closeCurrentTag();
          }
        };
        Parser2.prototype.onselfclosingtag = function() {
          if (this.options.xmlMode || this.options.recognizeSelfClosing || this.foreignContext[this.foreignContext.length - 1]) {
            this.closeCurrentTag();
          } else {
            this.onopentagend();
          }
        };
        Parser2.prototype.closeCurrentTag = function() {
          var _a2, _b2;
          var name = this.tagname;
          this.onopentagend();
          if (this.stack[this.stack.length - 1] === name) {
            (_b2 = (_a2 = this.cbs).onclosetag) === null || _b2 === void 0 ? void 0 : _b2.call(_a2, name);
            this.stack.pop();
          }
        };
        Parser2.prototype.onattribname = function(name) {
          if (this.lowerCaseAttributeNames) {
            name = name.toLowerCase();
          }
          this.attribname = name;
        };
        Parser2.prototype.onattribdata = function(value) {
          this.attribvalue += value;
        };
        Parser2.prototype.onattribend = function(quote) {
          var _a2, _b2;
          (_b2 = (_a2 = this.cbs).onattribute) === null || _b2 === void 0 ? void 0 : _b2.call(_a2, this.attribname, this.attribvalue, quote);
          if (this.attribs && !Object.prototype.hasOwnProperty.call(this.attribs, this.attribname)) {
            this.attribs[this.attribname] = this.attribvalue;
          }
          this.attribname = "";
          this.attribvalue = "";
        };
        Parser2.prototype.getInstructionName = function(value) {
          var idx = value.search(reNameEnd);
          var name = idx < 0 ? value : value.substr(0, idx);
          if (this.lowerCaseTagNames) {
            name = name.toLowerCase();
          }
          return name;
        };
        Parser2.prototype.ondeclaration = function(value) {
          if (this.cbs.onprocessinginstruction) {
            var name_1 = this.getInstructionName(value);
            this.cbs.onprocessinginstruction("!" + name_1, "!" + value);
          }
        };
        Parser2.prototype.onprocessinginstruction = function(value) {
          if (this.cbs.onprocessinginstruction) {
            var name_2 = this.getInstructionName(value);
            this.cbs.onprocessinginstruction("?" + name_2, "?" + value);
          }
        };
        Parser2.prototype.oncomment = function(value) {
          var _a2, _b2, _c18, _d2;
          this.updatePosition(4);
          (_b2 = (_a2 = this.cbs).oncomment) === null || _b2 === void 0 ? void 0 : _b2.call(_a2, value);
          (_d2 = (_c18 = this.cbs).oncommentend) === null || _d2 === void 0 ? void 0 : _d2.call(_c18);
        };
        Parser2.prototype.oncdata = function(value) {
          var _a2, _b2, _c18, _d2, _e, _f;
          this.updatePosition(1);
          if (this.options.xmlMode || this.options.recognizeCDATA) {
            (_b2 = (_a2 = this.cbs).oncdatastart) === null || _b2 === void 0 ? void 0 : _b2.call(_a2);
            (_d2 = (_c18 = this.cbs).ontext) === null || _d2 === void 0 ? void 0 : _d2.call(_c18, value);
            (_f = (_e = this.cbs).oncdataend) === null || _f === void 0 ? void 0 : _f.call(_e);
          } else {
            this.oncomment("[CDATA[" + value + "]]");
          }
        };
        Parser2.prototype.onerror = function(err) {
          var _a2, _b2;
          (_b2 = (_a2 = this.cbs).onerror) === null || _b2 === void 0 ? void 0 : _b2.call(_a2, err);
        };
        Parser2.prototype.onend = function() {
          var _a2, _b2;
          if (this.cbs.onclosetag) {
            for (var i = this.stack.length; i > 0; this.cbs.onclosetag(this.stack[--i]))
              ;
          }
          (_b2 = (_a2 = this.cbs).onend) === null || _b2 === void 0 ? void 0 : _b2.call(_a2);
        };
        Parser2.prototype.reset = function() {
          var _a2, _b2, _c18, _d2;
          (_b2 = (_a2 = this.cbs).onreset) === null || _b2 === void 0 ? void 0 : _b2.call(_a2);
          this.tokenizer.reset();
          this.tagname = "";
          this.attribname = "";
          this.attribs = null;
          this.stack = [];
          (_d2 = (_c18 = this.cbs).onparserinit) === null || _d2 === void 0 ? void 0 : _d2.call(_c18, this);
        };
        Parser2.prototype.parseComplete = function(data) {
          this.reset();
          this.end(data);
        };
        Parser2.prototype.write = function(chunk) {
          this.tokenizer.write(chunk);
        };
        Parser2.prototype.end = function(chunk) {
          this.tokenizer.end(chunk);
        };
        Parser2.prototype.pause = function() {
          this.tokenizer.pause();
        };
        Parser2.prototype.resume = function() {
          this.tokenizer.resume();
        };
        Parser2.prototype.parseChunk = function(chunk) {
          this.write(chunk);
        };
        Parser2.prototype.done = function(chunk) {
          this.end(chunk);
        };
        return Parser2;
      }()
    );
    exports.Parser = Parser;
  }
});

// node_modules/domelementtype/lib/index.js
var require_lib = __commonJS({
  "node_modules/domelementtype/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Doctype = exports.CDATA = exports.Tag = exports.Style = exports.Script = exports.Comment = exports.Directive = exports.Text = exports.Root = exports.isTag = exports.ElementType = void 0;
    var ElementType;
    (function(ElementType2) {
      ElementType2["Root"] = "root";
      ElementType2["Text"] = "text";
      ElementType2["Directive"] = "directive";
      ElementType2["Comment"] = "comment";
      ElementType2["Script"] = "script";
      ElementType2["Style"] = "style";
      ElementType2["Tag"] = "tag";
      ElementType2["CDATA"] = "cdata";
      ElementType2["Doctype"] = "doctype";
    })(ElementType = exports.ElementType || (exports.ElementType = {}));
    function isTag(elem) {
      return elem.type === ElementType.Tag || elem.type === ElementType.Script || elem.type === ElementType.Style;
    }
    exports.isTag = isTag;
    exports.Root = ElementType.Root;
    exports.Text = ElementType.Text;
    exports.Directive = ElementType.Directive;
    exports.Comment = ElementType.Comment;
    exports.Script = ElementType.Script;
    exports.Style = ElementType.Style;
    exports.Tag = ElementType.Tag;
    exports.CDATA = ElementType.CDATA;
    exports.Doctype = ElementType.Doctype;
  }
});

// node_modules/domhandler/lib/node.js
var require_node = __commonJS({
  "node_modules/domhandler/lib/node.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2)
            if (Object.prototype.hasOwnProperty.call(b2, p))
              d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __assign = exports && exports.__assign || function() {
      __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p))
              t[p] = s[p];
        }
        return t;
      };
      return __assign.apply(this, arguments);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cloneNode = exports.hasChildren = exports.isDocument = exports.isDirective = exports.isComment = exports.isText = exports.isCDATA = exports.isTag = exports.Element = exports.Document = exports.NodeWithChildren = exports.ProcessingInstruction = exports.Comment = exports.Text = exports.DataNode = exports.Node = void 0;
    var domelementtype_1 = require_lib();
    var nodeTypes = /* @__PURE__ */ new Map([
      [domelementtype_1.ElementType.Tag, 1],
      [domelementtype_1.ElementType.Script, 1],
      [domelementtype_1.ElementType.Style, 1],
      [domelementtype_1.ElementType.Directive, 1],
      [domelementtype_1.ElementType.Text, 3],
      [domelementtype_1.ElementType.CDATA, 4],
      [domelementtype_1.ElementType.Comment, 8],
      [domelementtype_1.ElementType.Root, 9]
    ]);
    var Node2 = (
      /** @class */
      function() {
        function Node3(type) {
          this.type = type;
          this.parent = null;
          this.prev = null;
          this.next = null;
          this.startIndex = null;
          this.endIndex = null;
        }
        Object.defineProperty(Node3.prototype, "nodeType", {
          // Read-only aliases
          /**
           * [DOM spec](https://dom.spec.whatwg.org/#dom-node-nodetype)-compatible
           * node {@link type}.
           */
          get: function() {
            var _a2;
            return (_a2 = nodeTypes.get(this.type)) !== null && _a2 !== void 0 ? _a2 : 1;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(Node3.prototype, "parentNode", {
          // Read-write aliases for properties
          /**
           * Same as {@link parent}.
           * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
           */
          get: function() {
            return this.parent;
          },
          set: function(parent) {
            this.parent = parent;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(Node3.prototype, "previousSibling", {
          /**
           * Same as {@link prev}.
           * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
           */
          get: function() {
            return this.prev;
          },
          set: function(prev2) {
            this.prev = prev2;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(Node3.prototype, "nextSibling", {
          /**
           * Same as {@link next}.
           * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
           */
          get: function() {
            return this.next;
          },
          set: function(next2) {
            this.next = next2;
          },
          enumerable: false,
          configurable: true
        });
        Node3.prototype.cloneNode = function(recursive) {
          if (recursive === void 0) {
            recursive = false;
          }
          return cloneNode(this, recursive);
        };
        return Node3;
      }()
    );
    exports.Node = Node2;
    var DataNode2 = (
      /** @class */
      function(_super) {
        __extends(DataNode3, _super);
        function DataNode3(type, data) {
          var _this = _super.call(this, type) || this;
          _this.data = data;
          return _this;
        }
        Object.defineProperty(DataNode3.prototype, "nodeValue", {
          /**
           * Same as {@link data}.
           * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
           */
          get: function() {
            return this.data;
          },
          set: function(data) {
            this.data = data;
          },
          enumerable: false,
          configurable: true
        });
        return DataNode3;
      }(Node2)
    );
    exports.DataNode = DataNode2;
    var Text = (
      /** @class */
      function(_super) {
        __extends(Text2, _super);
        function Text2(data) {
          return _super.call(this, domelementtype_1.ElementType.Text, data) || this;
        }
        return Text2;
      }(DataNode2)
    );
    exports.Text = Text;
    var Comment = (
      /** @class */
      function(_super) {
        __extends(Comment2, _super);
        function Comment2(data) {
          return _super.call(this, domelementtype_1.ElementType.Comment, data) || this;
        }
        return Comment2;
      }(DataNode2)
    );
    exports.Comment = Comment;
    var ProcessingInstruction = (
      /** @class */
      function(_super) {
        __extends(ProcessingInstruction2, _super);
        function ProcessingInstruction2(name, data) {
          var _this = _super.call(this, domelementtype_1.ElementType.Directive, data) || this;
          _this.name = name;
          return _this;
        }
        return ProcessingInstruction2;
      }(DataNode2)
    );
    exports.ProcessingInstruction = ProcessingInstruction;
    var NodeWithChildren = (
      /** @class */
      function(_super) {
        __extends(NodeWithChildren2, _super);
        function NodeWithChildren2(type, children) {
          var _this = _super.call(this, type) || this;
          _this.children = children;
          return _this;
        }
        Object.defineProperty(NodeWithChildren2.prototype, "firstChild", {
          // Aliases
          /** First child of the node. */
          get: function() {
            var _a2;
            return (_a2 = this.children[0]) !== null && _a2 !== void 0 ? _a2 : null;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(NodeWithChildren2.prototype, "lastChild", {
          /** Last child of the node. */
          get: function() {
            return this.children.length > 0 ? this.children[this.children.length - 1] : null;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(NodeWithChildren2.prototype, "childNodes", {
          /**
           * Same as {@link children}.
           * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
           */
          get: function() {
            return this.children;
          },
          set: function(children) {
            this.children = children;
          },
          enumerable: false,
          configurable: true
        });
        return NodeWithChildren2;
      }(Node2)
    );
    exports.NodeWithChildren = NodeWithChildren;
    var Document = (
      /** @class */
      function(_super) {
        __extends(Document2, _super);
        function Document2(children) {
          return _super.call(this, domelementtype_1.ElementType.Root, children) || this;
        }
        return Document2;
      }(NodeWithChildren)
    );
    exports.Document = Document;
    var Element3 = (
      /** @class */
      function(_super) {
        __extends(Element4, _super);
        function Element4(name, attribs, children, type) {
          if (children === void 0) {
            children = [];
          }
          if (type === void 0) {
            type = name === "script" ? domelementtype_1.ElementType.Script : name === "style" ? domelementtype_1.ElementType.Style : domelementtype_1.ElementType.Tag;
          }
          var _this = _super.call(this, type, children) || this;
          _this.name = name;
          _this.attribs = attribs;
          return _this;
        }
        Object.defineProperty(Element4.prototype, "tagName", {
          // DOM Level 1 aliases
          /**
           * Same as {@link name}.
           * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
           */
          get: function() {
            return this.name;
          },
          set: function(name) {
            this.name = name;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(Element4.prototype, "attributes", {
          get: function() {
            var _this = this;
            return Object.keys(this.attribs).map(function(name) {
              var _a2, _b2;
              return {
                name,
                value: _this.attribs[name],
                namespace: (_a2 = _this["x-attribsNamespace"]) === null || _a2 === void 0 ? void 0 : _a2[name],
                prefix: (_b2 = _this["x-attribsPrefix"]) === null || _b2 === void 0 ? void 0 : _b2[name]
              };
            });
          },
          enumerable: false,
          configurable: true
        });
        return Element4;
      }(NodeWithChildren)
    );
    exports.Element = Element3;
    function isTag(node2) {
      return (0, domelementtype_1.isTag)(node2);
    }
    exports.isTag = isTag;
    function isCDATA(node2) {
      return node2.type === domelementtype_1.ElementType.CDATA;
    }
    exports.isCDATA = isCDATA;
    function isText(node2) {
      return node2.type === domelementtype_1.ElementType.Text;
    }
    exports.isText = isText;
    function isComment(node2) {
      return node2.type === domelementtype_1.ElementType.Comment;
    }
    exports.isComment = isComment;
    function isDirective(node2) {
      return node2.type === domelementtype_1.ElementType.Directive;
    }
    exports.isDirective = isDirective;
    function isDocument(node2) {
      return node2.type === domelementtype_1.ElementType.Root;
    }
    exports.isDocument = isDocument;
    function hasChildren(node2) {
      return Object.prototype.hasOwnProperty.call(node2, "children");
    }
    exports.hasChildren = hasChildren;
    function cloneNode(node2, recursive) {
      if (recursive === void 0) {
        recursive = false;
      }
      var result;
      if (isText(node2)) {
        result = new Text(node2.data);
      } else if (isComment(node2)) {
        result = new Comment(node2.data);
      } else if (isTag(node2)) {
        var children = recursive ? cloneChildren(node2.children) : [];
        var clone_1 = new Element3(node2.name, __assign({}, node2.attribs), children);
        children.forEach(function(child) {
          return child.parent = clone_1;
        });
        if (node2.namespace != null) {
          clone_1.namespace = node2.namespace;
        }
        if (node2["x-attribsNamespace"]) {
          clone_1["x-attribsNamespace"] = __assign({}, node2["x-attribsNamespace"]);
        }
        if (node2["x-attribsPrefix"]) {
          clone_1["x-attribsPrefix"] = __assign({}, node2["x-attribsPrefix"]);
        }
        result = clone_1;
      } else if (isCDATA(node2)) {
        var children = recursive ? cloneChildren(node2.children) : [];
        var clone_2 = new NodeWithChildren(domelementtype_1.ElementType.CDATA, children);
        children.forEach(function(child) {
          return child.parent = clone_2;
        });
        result = clone_2;
      } else if (isDocument(node2)) {
        var children = recursive ? cloneChildren(node2.children) : [];
        var clone_3 = new Document(children);
        children.forEach(function(child) {
          return child.parent = clone_3;
        });
        if (node2["x-mode"]) {
          clone_3["x-mode"] = node2["x-mode"];
        }
        result = clone_3;
      } else if (isDirective(node2)) {
        var instruction = new ProcessingInstruction(node2.name, node2.data);
        if (node2["x-name"] != null) {
          instruction["x-name"] = node2["x-name"];
          instruction["x-publicId"] = node2["x-publicId"];
          instruction["x-systemId"] = node2["x-systemId"];
        }
        result = instruction;
      } else {
        throw new Error("Not implemented yet: ".concat(node2.type));
      }
      result.startIndex = node2.startIndex;
      result.endIndex = node2.endIndex;
      if (node2.sourceCodeLocation != null) {
        result.sourceCodeLocation = node2.sourceCodeLocation;
      }
      return result;
    }
    exports.cloneNode = cloneNode;
    function cloneChildren(childs) {
      var children = childs.map(function(child) {
        return cloneNode(child, true);
      });
      for (var i = 1; i < children.length; i++) {
        children[i].prev = children[i - 1];
        children[i - 1].next = children[i];
      }
      return children;
    }
  }
});

// node_modules/domhandler/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/domhandler/lib/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DomHandler = void 0;
    var domelementtype_1 = require_lib();
    var node_1 = require_node();
    __exportStar(require_node(), exports);
    var reWhitespace = /\s+/g;
    var defaultOpts = {
      normalizeWhitespace: false,
      withStartIndices: false,
      withEndIndices: false,
      xmlMode: false
    };
    var DomHandler = (
      /** @class */
      function() {
        function DomHandler2(callback, options2, elementCB) {
          this.dom = [];
          this.root = new node_1.Document(this.dom);
          this.done = false;
          this.tagStack = [this.root];
          this.lastNode = null;
          this.parser = null;
          if (typeof options2 === "function") {
            elementCB = options2;
            options2 = defaultOpts;
          }
          if (typeof callback === "object") {
            options2 = callback;
            callback = void 0;
          }
          this.callback = callback !== null && callback !== void 0 ? callback : null;
          this.options = options2 !== null && options2 !== void 0 ? options2 : defaultOpts;
          this.elementCB = elementCB !== null && elementCB !== void 0 ? elementCB : null;
        }
        DomHandler2.prototype.onparserinit = function(parser) {
          this.parser = parser;
        };
        DomHandler2.prototype.onreset = function() {
          this.dom = [];
          this.root = new node_1.Document(this.dom);
          this.done = false;
          this.tagStack = [this.root];
          this.lastNode = null;
          this.parser = null;
        };
        DomHandler2.prototype.onend = function() {
          if (this.done)
            return;
          this.done = true;
          this.parser = null;
          this.handleCallback(null);
        };
        DomHandler2.prototype.onerror = function(error) {
          this.handleCallback(error);
        };
        DomHandler2.prototype.onclosetag = function() {
          this.lastNode = null;
          var elem = this.tagStack.pop();
          if (this.options.withEndIndices) {
            elem.endIndex = this.parser.endIndex;
          }
          if (this.elementCB)
            this.elementCB(elem);
        };
        DomHandler2.prototype.onopentag = function(name, attribs) {
          var type = this.options.xmlMode ? domelementtype_1.ElementType.Tag : void 0;
          var element = new node_1.Element(name, attribs, void 0, type);
          this.addNode(element);
          this.tagStack.push(element);
        };
        DomHandler2.prototype.ontext = function(data) {
          var normalizeWhitespace = this.options.normalizeWhitespace;
          var lastNode = this.lastNode;
          if (lastNode && lastNode.type === domelementtype_1.ElementType.Text) {
            if (normalizeWhitespace) {
              lastNode.data = (lastNode.data + data).replace(reWhitespace, " ");
            } else {
              lastNode.data += data;
            }
            if (this.options.withEndIndices) {
              lastNode.endIndex = this.parser.endIndex;
            }
          } else {
            if (normalizeWhitespace) {
              data = data.replace(reWhitespace, " ");
            }
            var node2 = new node_1.Text(data);
            this.addNode(node2);
            this.lastNode = node2;
          }
        };
        DomHandler2.prototype.oncomment = function(data) {
          if (this.lastNode && this.lastNode.type === domelementtype_1.ElementType.Comment) {
            this.lastNode.data += data;
            return;
          }
          var node2 = new node_1.Comment(data);
          this.addNode(node2);
          this.lastNode = node2;
        };
        DomHandler2.prototype.oncommentend = function() {
          this.lastNode = null;
        };
        DomHandler2.prototype.oncdatastart = function() {
          var text = new node_1.Text("");
          var node2 = new node_1.NodeWithChildren(domelementtype_1.ElementType.CDATA, [text]);
          this.addNode(node2);
          text.parent = node2;
          this.lastNode = text;
        };
        DomHandler2.prototype.oncdataend = function() {
          this.lastNode = null;
        };
        DomHandler2.prototype.onprocessinginstruction = function(name, data) {
          var node2 = new node_1.ProcessingInstruction(name, data);
          this.addNode(node2);
        };
        DomHandler2.prototype.handleCallback = function(error) {
          if (typeof this.callback === "function") {
            this.callback(error, this.dom);
          } else if (error) {
            throw error;
          }
        };
        DomHandler2.prototype.addNode = function(node2) {
          var parent = this.tagStack[this.tagStack.length - 1];
          var previousSibling = parent.children[parent.children.length - 1];
          if (this.options.withStartIndices) {
            node2.startIndex = this.parser.startIndex;
          }
          if (this.options.withEndIndices) {
            node2.endIndex = this.parser.endIndex;
          }
          parent.children.push(node2);
          if (previousSibling) {
            node2.prev = previousSibling;
            previousSibling.next = node2;
          }
          node2.parent = parent;
          this.lastNode = null;
        };
        return DomHandler2;
      }()
    );
    exports.DomHandler = DomHandler;
    exports.default = DomHandler;
  }
});

// node_modules/entities/lib/decode.js
var require_decode2 = __commonJS({
  "node_modules/entities/lib/decode.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod2) {
      return mod2 && mod2.__esModule ? mod2 : { "default": mod2 };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeHTML = exports.decodeHTMLStrict = exports.decodeXML = void 0;
    var entities_json_1 = __importDefault(require_entities());
    var legacy_json_1 = __importDefault(require_legacy());
    var xml_json_1 = __importDefault(require_xml());
    var decode_codepoint_1 = __importDefault(require_decode_codepoint());
    var strictEntityRe = /&(?:[a-zA-Z0-9]+|#[xX][\da-fA-F]+|#\d+);/g;
    exports.decodeXML = getStrictDecoder(xml_json_1.default);
    exports.decodeHTMLStrict = getStrictDecoder(entities_json_1.default);
    function getStrictDecoder(map) {
      var replace2 = getReplacer(map);
      return function(str) {
        return String(str).replace(strictEntityRe, replace2);
      };
    }
    var sorter = function(a, b) {
      return a < b ? 1 : -1;
    };
    exports.decodeHTML = function() {
      var legacy = Object.keys(legacy_json_1.default).sort(sorter);
      var keys = Object.keys(entities_json_1.default).sort(sorter);
      for (var i = 0, j = 0; i < keys.length; i++) {
        if (legacy[j] === keys[i]) {
          keys[i] += ";?";
          j++;
        } else {
          keys[i] += ";";
        }
      }
      var re = new RegExp("&(?:" + keys.join("|") + "|#[xX][\\da-fA-F]+;?|#\\d+;?)", "g");
      var replace2 = getReplacer(entities_json_1.default);
      function replacer(str) {
        if (str.substr(-1) !== ";")
          str += ";";
        return replace2(str);
      }
      return function(str) {
        return String(str).replace(re, replacer);
      };
    }();
    function getReplacer(map) {
      return function replace2(str) {
        if (str.charAt(1) === "#") {
          var secondChar = str.charAt(2);
          if (secondChar === "X" || secondChar === "x") {
            return decode_codepoint_1.default(parseInt(str.substr(3), 16));
          }
          return decode_codepoint_1.default(parseInt(str.substr(2), 10));
        }
        return map[str.slice(1, -1)] || str;
      };
    }
  }
});

// node_modules/entities/lib/encode.js
var require_encode = __commonJS({
  "node_modules/entities/lib/encode.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod2) {
      return mod2 && mod2.__esModule ? mod2 : { "default": mod2 };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.escapeUTF8 = exports.escape = exports.encodeNonAsciiHTML = exports.encodeHTML = exports.encodeXML = void 0;
    var xml_json_1 = __importDefault(require_xml());
    var inverseXML = getInverseObj(xml_json_1.default);
    var xmlReplacer = getInverseReplacer(inverseXML);
    exports.encodeXML = getASCIIEncoder(inverseXML);
    var entities_json_1 = __importDefault(require_entities());
    var inverseHTML = getInverseObj(entities_json_1.default);
    var htmlReplacer = getInverseReplacer(inverseHTML);
    exports.encodeHTML = getInverse(inverseHTML, htmlReplacer);
    exports.encodeNonAsciiHTML = getASCIIEncoder(inverseHTML);
    function getInverseObj(obj) {
      return Object.keys(obj).sort().reduce(function(inverse, name) {
        inverse[obj[name]] = "&" + name + ";";
        return inverse;
      }, {});
    }
    function getInverseReplacer(inverse) {
      var single = [];
      var multiple = [];
      for (var _i = 0, _a2 = Object.keys(inverse); _i < _a2.length; _i++) {
        var k = _a2[_i];
        if (k.length === 1) {
          single.push("\\" + k);
        } else {
          multiple.push(k);
        }
      }
      single.sort();
      for (var start = 0; start < single.length - 1; start++) {
        var end = start;
        while (end < single.length - 1 && single[end].charCodeAt(1) + 1 === single[end + 1].charCodeAt(1)) {
          end += 1;
        }
        var count = 1 + end - start;
        if (count < 3)
          continue;
        single.splice(start, count, single[start] + "-" + single[end]);
      }
      multiple.unshift("[" + single.join("") + "]");
      return new RegExp(multiple.join("|"), "g");
    }
    var reNonASCII = /(?:[\x80-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g;
    var getCodePoint = (
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      String.prototype.codePointAt != null ? (
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        function(str) {
          return str.codePointAt(0);
        }
      ) : (
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        function(c) {
          return (c.charCodeAt(0) - 55296) * 1024 + c.charCodeAt(1) - 56320 + 65536;
        }
      )
    );
    function singleCharReplacer(c) {
      return "&#x" + (c.length > 1 ? getCodePoint(c) : c.charCodeAt(0)).toString(16).toUpperCase() + ";";
    }
    function getInverse(inverse, re) {
      return function(data) {
        return data.replace(re, function(name) {
          return inverse[name];
        }).replace(reNonASCII, singleCharReplacer);
      };
    }
    var reEscapeChars = new RegExp(xmlReplacer.source + "|" + reNonASCII.source, "g");
    function escape(data) {
      return data.replace(reEscapeChars, singleCharReplacer);
    }
    exports.escape = escape;
    function escapeUTF8(data) {
      return data.replace(xmlReplacer, singleCharReplacer);
    }
    exports.escapeUTF8 = escapeUTF8;
    function getASCIIEncoder(obj) {
      return function(data) {
        return data.replace(reEscapeChars, function(c) {
          return obj[c] || singleCharReplacer(c);
        });
      };
    }
  }
});

// node_modules/entities/lib/index.js
var require_lib3 = __commonJS({
  "node_modules/entities/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeXMLStrict = exports.decodeHTML5Strict = exports.decodeHTML4Strict = exports.decodeHTML5 = exports.decodeHTML4 = exports.decodeHTMLStrict = exports.decodeHTML = exports.decodeXML = exports.encodeHTML5 = exports.encodeHTML4 = exports.escapeUTF8 = exports.escape = exports.encodeNonAsciiHTML = exports.encodeHTML = exports.encodeXML = exports.encode = exports.decodeStrict = exports.decode = void 0;
    var decode_1 = require_decode2();
    var encode_1 = require_encode();
    function decode(data, level) {
      return (!level || level <= 0 ? decode_1.decodeXML : decode_1.decodeHTML)(data);
    }
    exports.decode = decode;
    function decodeStrict(data, level) {
      return (!level || level <= 0 ? decode_1.decodeXML : decode_1.decodeHTMLStrict)(data);
    }
    exports.decodeStrict = decodeStrict;
    function encode(data, level) {
      return (!level || level <= 0 ? encode_1.encodeXML : encode_1.encodeHTML)(data);
    }
    exports.encode = encode;
    var encode_2 = require_encode();
    Object.defineProperty(exports, "encodeXML", { enumerable: true, get: function() {
      return encode_2.encodeXML;
    } });
    Object.defineProperty(exports, "encodeHTML", { enumerable: true, get: function() {
      return encode_2.encodeHTML;
    } });
    Object.defineProperty(exports, "encodeNonAsciiHTML", { enumerable: true, get: function() {
      return encode_2.encodeNonAsciiHTML;
    } });
    Object.defineProperty(exports, "escape", { enumerable: true, get: function() {
      return encode_2.escape;
    } });
    Object.defineProperty(exports, "escapeUTF8", { enumerable: true, get: function() {
      return encode_2.escapeUTF8;
    } });
    Object.defineProperty(exports, "encodeHTML4", { enumerable: true, get: function() {
      return encode_2.encodeHTML;
    } });
    Object.defineProperty(exports, "encodeHTML5", { enumerable: true, get: function() {
      return encode_2.encodeHTML;
    } });
    var decode_2 = require_decode2();
    Object.defineProperty(exports, "decodeXML", { enumerable: true, get: function() {
      return decode_2.decodeXML;
    } });
    Object.defineProperty(exports, "decodeHTML", { enumerable: true, get: function() {
      return decode_2.decodeHTML;
    } });
    Object.defineProperty(exports, "decodeHTMLStrict", { enumerable: true, get: function() {
      return decode_2.decodeHTMLStrict;
    } });
    Object.defineProperty(exports, "decodeHTML4", { enumerable: true, get: function() {
      return decode_2.decodeHTML;
    } });
    Object.defineProperty(exports, "decodeHTML5", { enumerable: true, get: function() {
      return decode_2.decodeHTML;
    } });
    Object.defineProperty(exports, "decodeHTML4Strict", { enumerable: true, get: function() {
      return decode_2.decodeHTMLStrict;
    } });
    Object.defineProperty(exports, "decodeHTML5Strict", { enumerable: true, get: function() {
      return decode_2.decodeHTMLStrict;
    } });
    Object.defineProperty(exports, "decodeXMLStrict", { enumerable: true, get: function() {
      return decode_2.decodeXML;
    } });
  }
});

// node_modules/dom-serializer/lib/foreignNames.js
var require_foreignNames = __commonJS({
  "node_modules/dom-serializer/lib/foreignNames.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.attributeNames = exports.elementNames = void 0;
    exports.elementNames = /* @__PURE__ */ new Map([
      ["altglyph", "altGlyph"],
      ["altglyphdef", "altGlyphDef"],
      ["altglyphitem", "altGlyphItem"],
      ["animatecolor", "animateColor"],
      ["animatemotion", "animateMotion"],
      ["animatetransform", "animateTransform"],
      ["clippath", "clipPath"],
      ["feblend", "feBlend"],
      ["fecolormatrix", "feColorMatrix"],
      ["fecomponenttransfer", "feComponentTransfer"],
      ["fecomposite", "feComposite"],
      ["feconvolvematrix", "feConvolveMatrix"],
      ["fediffuselighting", "feDiffuseLighting"],
      ["fedisplacementmap", "feDisplacementMap"],
      ["fedistantlight", "feDistantLight"],
      ["fedropshadow", "feDropShadow"],
      ["feflood", "feFlood"],
      ["fefunca", "feFuncA"],
      ["fefuncb", "feFuncB"],
      ["fefuncg", "feFuncG"],
      ["fefuncr", "feFuncR"],
      ["fegaussianblur", "feGaussianBlur"],
      ["feimage", "feImage"],
      ["femerge", "feMerge"],
      ["femergenode", "feMergeNode"],
      ["femorphology", "feMorphology"],
      ["feoffset", "feOffset"],
      ["fepointlight", "fePointLight"],
      ["fespecularlighting", "feSpecularLighting"],
      ["fespotlight", "feSpotLight"],
      ["fetile", "feTile"],
      ["feturbulence", "feTurbulence"],
      ["foreignobject", "foreignObject"],
      ["glyphref", "glyphRef"],
      ["lineargradient", "linearGradient"],
      ["radialgradient", "radialGradient"],
      ["textpath", "textPath"]
    ]);
    exports.attributeNames = /* @__PURE__ */ new Map([
      ["definitionurl", "definitionURL"],
      ["attributename", "attributeName"],
      ["attributetype", "attributeType"],
      ["basefrequency", "baseFrequency"],
      ["baseprofile", "baseProfile"],
      ["calcmode", "calcMode"],
      ["clippathunits", "clipPathUnits"],
      ["diffuseconstant", "diffuseConstant"],
      ["edgemode", "edgeMode"],
      ["filterunits", "filterUnits"],
      ["glyphref", "glyphRef"],
      ["gradienttransform", "gradientTransform"],
      ["gradientunits", "gradientUnits"],
      ["kernelmatrix", "kernelMatrix"],
      ["kernelunitlength", "kernelUnitLength"],
      ["keypoints", "keyPoints"],
      ["keysplines", "keySplines"],
      ["keytimes", "keyTimes"],
      ["lengthadjust", "lengthAdjust"],
      ["limitingconeangle", "limitingConeAngle"],
      ["markerheight", "markerHeight"],
      ["markerunits", "markerUnits"],
      ["markerwidth", "markerWidth"],
      ["maskcontentunits", "maskContentUnits"],
      ["maskunits", "maskUnits"],
      ["numoctaves", "numOctaves"],
      ["pathlength", "pathLength"],
      ["patterncontentunits", "patternContentUnits"],
      ["patterntransform", "patternTransform"],
      ["patternunits", "patternUnits"],
      ["pointsatx", "pointsAtX"],
      ["pointsaty", "pointsAtY"],
      ["pointsatz", "pointsAtZ"],
      ["preservealpha", "preserveAlpha"],
      ["preserveaspectratio", "preserveAspectRatio"],
      ["primitiveunits", "primitiveUnits"],
      ["refx", "refX"],
      ["refy", "refY"],
      ["repeatcount", "repeatCount"],
      ["repeatdur", "repeatDur"],
      ["requiredextensions", "requiredExtensions"],
      ["requiredfeatures", "requiredFeatures"],
      ["specularconstant", "specularConstant"],
      ["specularexponent", "specularExponent"],
      ["spreadmethod", "spreadMethod"],
      ["startoffset", "startOffset"],
      ["stddeviation", "stdDeviation"],
      ["stitchtiles", "stitchTiles"],
      ["surfacescale", "surfaceScale"],
      ["systemlanguage", "systemLanguage"],
      ["tablevalues", "tableValues"],
      ["targetx", "targetX"],
      ["targety", "targetY"],
      ["textlength", "textLength"],
      ["viewbox", "viewBox"],
      ["viewtarget", "viewTarget"],
      ["xchannelselector", "xChannelSelector"],
      ["ychannelselector", "yChannelSelector"],
      ["zoomandpan", "zoomAndPan"]
    ]);
  }
});

// node_modules/dom-serializer/lib/index.js
var require_lib4 = __commonJS({
  "node_modules/dom-serializer/lib/index.js"(exports) {
    "use strict";
    var __assign = exports && exports.__assign || function() {
      __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p))
              t[p] = s[p];
        }
        return t;
      };
      return __assign.apply(this, arguments);
    };
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod2) {
      if (mod2 && mod2.__esModule)
        return mod2;
      var result = {};
      if (mod2 != null) {
        for (var k in mod2)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod2, k))
            __createBinding(result, mod2, k);
      }
      __setModuleDefault(result, mod2);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var ElementType = __importStar(require_lib());
    var entities_1 = require_lib3();
    var foreignNames_1 = require_foreignNames();
    var unencodedElements = /* @__PURE__ */ new Set([
      "style",
      "script",
      "xmp",
      "iframe",
      "noembed",
      "noframes",
      "plaintext",
      "noscript"
    ]);
    function formatAttributes(attributes, opts) {
      if (!attributes)
        return;
      return Object.keys(attributes).map(function(key) {
        var _a2, _b2;
        var value = (_a2 = attributes[key]) !== null && _a2 !== void 0 ? _a2 : "";
        if (opts.xmlMode === "foreign") {
          key = (_b2 = foreignNames_1.attributeNames.get(key)) !== null && _b2 !== void 0 ? _b2 : key;
        }
        if (!opts.emptyAttrs && !opts.xmlMode && value === "") {
          return key;
        }
        return key + '="' + (opts.decodeEntities !== false ? entities_1.encodeXML(value) : value.replace(/"/g, "&quot;")) + '"';
      }).join(" ");
    }
    var singleTag = /* @__PURE__ */ new Set([
      "area",
      "base",
      "basefont",
      "br",
      "col",
      "command",
      "embed",
      "frame",
      "hr",
      "img",
      "input",
      "isindex",
      "keygen",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr"
    ]);
    function render(node2, options2) {
      if (options2 === void 0) {
        options2 = {};
      }
      var nodes = "length" in node2 ? node2 : [node2];
      var output = "";
      for (var i = 0; i < nodes.length; i++) {
        output += renderNode(nodes[i], options2);
      }
      return output;
    }
    exports.default = render;
    function renderNode(node2, options2) {
      switch (node2.type) {
        case ElementType.Root:
          return render(node2.children, options2);
        case ElementType.Directive:
        case ElementType.Doctype:
          return renderDirective(node2);
        case ElementType.Comment:
          return renderComment(node2);
        case ElementType.CDATA:
          return renderCdata(node2);
        case ElementType.Script:
        case ElementType.Style:
        case ElementType.Tag:
          return renderTag(node2, options2);
        case ElementType.Text:
          return renderText(node2, options2);
      }
    }
    var foreignModeIntegrationPoints = /* @__PURE__ */ new Set([
      "mi",
      "mo",
      "mn",
      "ms",
      "mtext",
      "annotation-xml",
      "foreignObject",
      "desc",
      "title"
    ]);
    var foreignElements = /* @__PURE__ */ new Set(["svg", "math"]);
    function renderTag(elem, opts) {
      var _a2;
      if (opts.xmlMode === "foreign") {
        elem.name = (_a2 = foreignNames_1.elementNames.get(elem.name)) !== null && _a2 !== void 0 ? _a2 : elem.name;
        if (elem.parent && foreignModeIntegrationPoints.has(elem.parent.name)) {
          opts = __assign(__assign({}, opts), { xmlMode: false });
        }
      }
      if (!opts.xmlMode && foreignElements.has(elem.name)) {
        opts = __assign(__assign({}, opts), { xmlMode: "foreign" });
      }
      var tag = "<" + elem.name;
      var attribs = formatAttributes(elem.attribs, opts);
      if (attribs) {
        tag += " " + attribs;
      }
      if (elem.children.length === 0 && (opts.xmlMode ? (
        // In XML mode or foreign mode, and user hasn't explicitly turned off self-closing tags
        opts.selfClosingTags !== false
      ) : (
        // User explicitly asked for self-closing tags, even in HTML mode
        opts.selfClosingTags && singleTag.has(elem.name)
      ))) {
        if (!opts.xmlMode)
          tag += " ";
        tag += "/>";
      } else {
        tag += ">";
        if (elem.children.length > 0) {
          tag += render(elem.children, opts);
        }
        if (opts.xmlMode || !singleTag.has(elem.name)) {
          tag += "</" + elem.name + ">";
        }
      }
      return tag;
    }
    function renderDirective(elem) {
      return "<" + elem.data + ">";
    }
    function renderText(elem, opts) {
      var data = elem.data || "";
      if (opts.decodeEntities !== false && !(!opts.xmlMode && elem.parent && unencodedElements.has(elem.parent.name))) {
        data = entities_1.encodeXML(data);
      }
      return data;
    }
    function renderCdata(elem) {
      return "<![CDATA[" + elem.children[0].data + "]]>";
    }
    function renderComment(elem) {
      return "<!--" + elem.data + "-->";
    }
  }
});

// node_modules/domutils/lib/stringify.js
var require_stringify = __commonJS({
  "node_modules/domutils/lib/stringify.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod2) {
      return mod2 && mod2.__esModule ? mod2 : { "default": mod2 };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.innerText = exports.textContent = exports.getText = exports.getInnerHTML = exports.getOuterHTML = void 0;
    var domhandler_1 = require_lib2();
    var dom_serializer_1 = __importDefault(require_lib4());
    var domelementtype_1 = require_lib();
    function getOuterHTML(node2, options2) {
      return (0, dom_serializer_1.default)(node2, options2);
    }
    exports.getOuterHTML = getOuterHTML;
    function getInnerHTML(node2, options2) {
      return (0, domhandler_1.hasChildren)(node2) ? node2.children.map(function(node3) {
        return getOuterHTML(node3, options2);
      }).join("") : "";
    }
    exports.getInnerHTML = getInnerHTML;
    function getText(node2) {
      if (Array.isArray(node2))
        return node2.map(getText).join("");
      if ((0, domhandler_1.isTag)(node2))
        return node2.name === "br" ? "\n" : getText(node2.children);
      if ((0, domhandler_1.isCDATA)(node2))
        return getText(node2.children);
      if ((0, domhandler_1.isText)(node2))
        return node2.data;
      return "";
    }
    exports.getText = getText;
    function textContent(node2) {
      if (Array.isArray(node2))
        return node2.map(textContent).join("");
      if ((0, domhandler_1.hasChildren)(node2) && !(0, domhandler_1.isComment)(node2)) {
        return textContent(node2.children);
      }
      if ((0, domhandler_1.isText)(node2))
        return node2.data;
      return "";
    }
    exports.textContent = textContent;
    function innerText(node2) {
      if (Array.isArray(node2))
        return node2.map(innerText).join("");
      if ((0, domhandler_1.hasChildren)(node2) && (node2.type === domelementtype_1.ElementType.Tag || (0, domhandler_1.isCDATA)(node2))) {
        return innerText(node2.children);
      }
      if ((0, domhandler_1.isText)(node2))
        return node2.data;
      return "";
    }
    exports.innerText = innerText;
  }
});

// node_modules/domutils/lib/traversal.js
var require_traversal = __commonJS({
  "node_modules/domutils/lib/traversal.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.prevElementSibling = exports.nextElementSibling = exports.getName = exports.hasAttrib = exports.getAttributeValue = exports.getSiblings = exports.getParent = exports.getChildren = void 0;
    var domhandler_1 = require_lib2();
    var emptyArray = [];
    function getChildren(elem) {
      var _a2;
      return (_a2 = elem.children) !== null && _a2 !== void 0 ? _a2 : emptyArray;
    }
    exports.getChildren = getChildren;
    function getParent(elem) {
      return elem.parent || null;
    }
    exports.getParent = getParent;
    function getSiblings(elem) {
      var _a2, _b2;
      var parent = getParent(elem);
      if (parent != null)
        return getChildren(parent);
      var siblings = [elem];
      var prev2 = elem.prev, next2 = elem.next;
      while (prev2 != null) {
        siblings.unshift(prev2);
        _a2 = prev2, prev2 = _a2.prev;
      }
      while (next2 != null) {
        siblings.push(next2);
        _b2 = next2, next2 = _b2.next;
      }
      return siblings;
    }
    exports.getSiblings = getSiblings;
    function getAttributeValue(elem, name) {
      var _a2;
      return (_a2 = elem.attribs) === null || _a2 === void 0 ? void 0 : _a2[name];
    }
    exports.getAttributeValue = getAttributeValue;
    function hasAttrib(elem, name) {
      return elem.attribs != null && Object.prototype.hasOwnProperty.call(elem.attribs, name) && elem.attribs[name] != null;
    }
    exports.hasAttrib = hasAttrib;
    function getName(elem) {
      return elem.name;
    }
    exports.getName = getName;
    function nextElementSibling(elem) {
      var _a2;
      var next2 = elem.next;
      while (next2 !== null && !(0, domhandler_1.isTag)(next2))
        _a2 = next2, next2 = _a2.next;
      return next2;
    }
    exports.nextElementSibling = nextElementSibling;
    function prevElementSibling(elem) {
      var _a2;
      var prev2 = elem.prev;
      while (prev2 !== null && !(0, domhandler_1.isTag)(prev2))
        _a2 = prev2, prev2 = _a2.prev;
      return prev2;
    }
    exports.prevElementSibling = prevElementSibling;
  }
});

// node_modules/domutils/lib/manipulation.js
var require_manipulation = __commonJS({
  "node_modules/domutils/lib/manipulation.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.prepend = exports.prependChild = exports.append = exports.appendChild = exports.replaceElement = exports.removeElement = void 0;
    function removeElement(elem) {
      if (elem.prev)
        elem.prev.next = elem.next;
      if (elem.next)
        elem.next.prev = elem.prev;
      if (elem.parent) {
        var childs = elem.parent.children;
        childs.splice(childs.lastIndexOf(elem), 1);
      }
    }
    exports.removeElement = removeElement;
    function replaceElement(elem, replacement) {
      var prev2 = replacement.prev = elem.prev;
      if (prev2) {
        prev2.next = replacement;
      }
      var next2 = replacement.next = elem.next;
      if (next2) {
        next2.prev = replacement;
      }
      var parent = replacement.parent = elem.parent;
      if (parent) {
        var childs = parent.children;
        childs[childs.lastIndexOf(elem)] = replacement;
      }
    }
    exports.replaceElement = replaceElement;
    function appendChild(elem, child) {
      removeElement(child);
      child.next = null;
      child.parent = elem;
      if (elem.children.push(child) > 1) {
        var sibling = elem.children[elem.children.length - 2];
        sibling.next = child;
        child.prev = sibling;
      } else {
        child.prev = null;
      }
    }
    exports.appendChild = appendChild;
    function append2(elem, next2) {
      removeElement(next2);
      var parent = elem.parent;
      var currNext = elem.next;
      next2.next = currNext;
      next2.prev = elem;
      elem.next = next2;
      next2.parent = parent;
      if (currNext) {
        currNext.prev = next2;
        if (parent) {
          var childs = parent.children;
          childs.splice(childs.lastIndexOf(currNext), 0, next2);
        }
      } else if (parent) {
        parent.children.push(next2);
      }
    }
    exports.append = append2;
    function prependChild(elem, child) {
      removeElement(child);
      child.parent = elem;
      child.prev = null;
      if (elem.children.unshift(child) !== 1) {
        var sibling = elem.children[1];
        sibling.prev = child;
        child.next = sibling;
      } else {
        child.next = null;
      }
    }
    exports.prependChild = prependChild;
    function prepend(elem, prev2) {
      removeElement(prev2);
      var parent = elem.parent;
      if (parent) {
        var childs = parent.children;
        childs.splice(childs.indexOf(elem), 0, prev2);
      }
      if (elem.prev) {
        elem.prev.next = prev2;
      }
      prev2.parent = parent;
      prev2.prev = elem.prev;
      prev2.next = elem;
      elem.prev = prev2;
    }
    exports.prepend = prepend;
  }
});

// node_modules/domutils/lib/querying.js
var require_querying = __commonJS({
  "node_modules/domutils/lib/querying.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.findAll = exports.existsOne = exports.findOne = exports.findOneChild = exports.find = exports.filter = void 0;
    var domhandler_1 = require_lib2();
    function filter(test, node2, recurse, limit) {
      if (recurse === void 0) {
        recurse = true;
      }
      if (limit === void 0) {
        limit = Infinity;
      }
      if (!Array.isArray(node2))
        node2 = [node2];
      return find(test, node2, recurse, limit);
    }
    exports.filter = filter;
    function find(test, nodes, recurse, limit) {
      var result = [];
      for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
        var elem = nodes_1[_i];
        if (test(elem)) {
          result.push(elem);
          if (--limit <= 0)
            break;
        }
        if (recurse && (0, domhandler_1.hasChildren)(elem) && elem.children.length > 0) {
          var children = find(test, elem.children, recurse, limit);
          result.push.apply(result, children);
          limit -= children.length;
          if (limit <= 0)
            break;
        }
      }
      return result;
    }
    exports.find = find;
    function findOneChild(test, nodes) {
      return nodes.find(test);
    }
    exports.findOneChild = findOneChild;
    function findOne(test, nodes, recurse) {
      if (recurse === void 0) {
        recurse = true;
      }
      var elem = null;
      for (var i = 0; i < nodes.length && !elem; i++) {
        var checked = nodes[i];
        if (!(0, domhandler_1.isTag)(checked)) {
          continue;
        } else if (test(checked)) {
          elem = checked;
        } else if (recurse && checked.children.length > 0) {
          elem = findOne(test, checked.children);
        }
      }
      return elem;
    }
    exports.findOne = findOne;
    function existsOne(test, nodes) {
      return nodes.some(function(checked) {
        return (0, domhandler_1.isTag)(checked) && (test(checked) || checked.children.length > 0 && existsOne(test, checked.children));
      });
    }
    exports.existsOne = existsOne;
    function findAll(test, nodes) {
      var _a2;
      var result = [];
      var stack = nodes.filter(domhandler_1.isTag);
      var elem;
      while (elem = stack.shift()) {
        var children = (_a2 = elem.children) === null || _a2 === void 0 ? void 0 : _a2.filter(domhandler_1.isTag);
        if (children && children.length > 0) {
          stack.unshift.apply(stack, children);
        }
        if (test(elem))
          result.push(elem);
      }
      return result;
    }
    exports.findAll = findAll;
  }
});

// node_modules/domutils/lib/legacy.js
var require_legacy2 = __commonJS({
  "node_modules/domutils/lib/legacy.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getElementsByTagType = exports.getElementsByTagName = exports.getElementById = exports.getElements = exports.testElement = void 0;
    var domhandler_1 = require_lib2();
    var querying_1 = require_querying();
    var Checks = {
      tag_name: function(name) {
        if (typeof name === "function") {
          return function(elem) {
            return (0, domhandler_1.isTag)(elem) && name(elem.name);
          };
        } else if (name === "*") {
          return domhandler_1.isTag;
        }
        return function(elem) {
          return (0, domhandler_1.isTag)(elem) && elem.name === name;
        };
      },
      tag_type: function(type) {
        if (typeof type === "function") {
          return function(elem) {
            return type(elem.type);
          };
        }
        return function(elem) {
          return elem.type === type;
        };
      },
      tag_contains: function(data) {
        if (typeof data === "function") {
          return function(elem) {
            return (0, domhandler_1.isText)(elem) && data(elem.data);
          };
        }
        return function(elem) {
          return (0, domhandler_1.isText)(elem) && elem.data === data;
        };
      }
    };
    function getAttribCheck(attrib, value) {
      if (typeof value === "function") {
        return function(elem) {
          return (0, domhandler_1.isTag)(elem) && value(elem.attribs[attrib]);
        };
      }
      return function(elem) {
        return (0, domhandler_1.isTag)(elem) && elem.attribs[attrib] === value;
      };
    }
    function combineFuncs(a, b) {
      return function(elem) {
        return a(elem) || b(elem);
      };
    }
    function compileTest(options2) {
      var funcs = Object.keys(options2).map(function(key) {
        var value = options2[key];
        return Object.prototype.hasOwnProperty.call(Checks, key) ? Checks[key](value) : getAttribCheck(key, value);
      });
      return funcs.length === 0 ? null : funcs.reduce(combineFuncs);
    }
    function testElement(options2, node2) {
      var test = compileTest(options2);
      return test ? test(node2) : true;
    }
    exports.testElement = testElement;
    function getElements(options2, nodes, recurse, limit) {
      if (limit === void 0) {
        limit = Infinity;
      }
      var test = compileTest(options2);
      return test ? (0, querying_1.filter)(test, nodes, recurse, limit) : [];
    }
    exports.getElements = getElements;
    function getElementById(id, nodes, recurse) {
      if (recurse === void 0) {
        recurse = true;
      }
      if (!Array.isArray(nodes))
        nodes = [nodes];
      return (0, querying_1.findOne)(getAttribCheck("id", id), nodes, recurse);
    }
    exports.getElementById = getElementById;
    function getElementsByTagName(tagName, nodes, recurse, limit) {
      if (recurse === void 0) {
        recurse = true;
      }
      if (limit === void 0) {
        limit = Infinity;
      }
      return (0, querying_1.filter)(Checks.tag_name(tagName), nodes, recurse, limit);
    }
    exports.getElementsByTagName = getElementsByTagName;
    function getElementsByTagType(type, nodes, recurse, limit) {
      if (recurse === void 0) {
        recurse = true;
      }
      if (limit === void 0) {
        limit = Infinity;
      }
      return (0, querying_1.filter)(Checks.tag_type(type), nodes, recurse, limit);
    }
    exports.getElementsByTagType = getElementsByTagType;
  }
});

// node_modules/domutils/lib/helpers.js
var require_helpers = __commonJS({
  "node_modules/domutils/lib/helpers.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.uniqueSort = exports.compareDocumentPosition = exports.removeSubsets = void 0;
    var domhandler_1 = require_lib2();
    function removeSubsets(nodes) {
      var idx = nodes.length;
      while (--idx >= 0) {
        var node2 = nodes[idx];
        if (idx > 0 && nodes.lastIndexOf(node2, idx - 1) >= 0) {
          nodes.splice(idx, 1);
          continue;
        }
        for (var ancestor = node2.parent; ancestor; ancestor = ancestor.parent) {
          if (nodes.includes(ancestor)) {
            nodes.splice(idx, 1);
            break;
          }
        }
      }
      return nodes;
    }
    exports.removeSubsets = removeSubsets;
    function compareDocumentPosition(nodeA, nodeB) {
      var aParents = [];
      var bParents = [];
      if (nodeA === nodeB) {
        return 0;
      }
      var current = (0, domhandler_1.hasChildren)(nodeA) ? nodeA : nodeA.parent;
      while (current) {
        aParents.unshift(current);
        current = current.parent;
      }
      current = (0, domhandler_1.hasChildren)(nodeB) ? nodeB : nodeB.parent;
      while (current) {
        bParents.unshift(current);
        current = current.parent;
      }
      var maxIdx = Math.min(aParents.length, bParents.length);
      var idx = 0;
      while (idx < maxIdx && aParents[idx] === bParents[idx]) {
        idx++;
      }
      if (idx === 0) {
        return 1;
      }
      var sharedParent = aParents[idx - 1];
      var siblings = sharedParent.children;
      var aSibling = aParents[idx];
      var bSibling = bParents[idx];
      if (siblings.indexOf(aSibling) > siblings.indexOf(bSibling)) {
        if (sharedParent === nodeB) {
          return 4 | 16;
        }
        return 4;
      }
      if (sharedParent === nodeA) {
        return 2 | 8;
      }
      return 2;
    }
    exports.compareDocumentPosition = compareDocumentPosition;
    function uniqueSort(nodes) {
      nodes = nodes.filter(function(node2, i, arr) {
        return !arr.includes(node2, i + 1);
      });
      nodes.sort(function(a, b) {
        var relative = compareDocumentPosition(a, b);
        if (relative & 2) {
          return -1;
        } else if (relative & 4) {
          return 1;
        }
        return 0;
      });
      return nodes;
    }
    exports.uniqueSort = uniqueSort;
  }
});

// node_modules/domutils/lib/feeds.js
var require_feeds = __commonJS({
  "node_modules/domutils/lib/feeds.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getFeed = void 0;
    var stringify_1 = require_stringify();
    var legacy_1 = require_legacy2();
    function getFeed(doc) {
      var feedRoot = getOneElement(isValidFeed, doc);
      return !feedRoot ? null : feedRoot.name === "feed" ? getAtomFeed(feedRoot) : getRssFeed(feedRoot);
    }
    exports.getFeed = getFeed;
    function getAtomFeed(feedRoot) {
      var _a2;
      var childs = feedRoot.children;
      var feed = {
        type: "atom",
        items: (0, legacy_1.getElementsByTagName)("entry", childs).map(function(item) {
          var _a3;
          var children = item.children;
          var entry = { media: getMediaElements(children) };
          addConditionally(entry, "id", "id", children);
          addConditionally(entry, "title", "title", children);
          var href2 = (_a3 = getOneElement("link", children)) === null || _a3 === void 0 ? void 0 : _a3.attribs.href;
          if (href2) {
            entry.link = href2;
          }
          var description = fetch2("summary", children) || fetch2("content", children);
          if (description) {
            entry.description = description;
          }
          var pubDate = fetch2("updated", children);
          if (pubDate) {
            entry.pubDate = new Date(pubDate);
          }
          return entry;
        })
      };
      addConditionally(feed, "id", "id", childs);
      addConditionally(feed, "title", "title", childs);
      var href = (_a2 = getOneElement("link", childs)) === null || _a2 === void 0 ? void 0 : _a2.attribs.href;
      if (href) {
        feed.link = href;
      }
      addConditionally(feed, "description", "subtitle", childs);
      var updated = fetch2("updated", childs);
      if (updated) {
        feed.updated = new Date(updated);
      }
      addConditionally(feed, "author", "email", childs, true);
      return feed;
    }
    function getRssFeed(feedRoot) {
      var _a2, _b2;
      var childs = (_b2 = (_a2 = getOneElement("channel", feedRoot.children)) === null || _a2 === void 0 ? void 0 : _a2.children) !== null && _b2 !== void 0 ? _b2 : [];
      var feed = {
        type: feedRoot.name.substr(0, 3),
        id: "",
        items: (0, legacy_1.getElementsByTagName)("item", feedRoot.children).map(function(item) {
          var children = item.children;
          var entry = { media: getMediaElements(children) };
          addConditionally(entry, "id", "guid", children);
          addConditionally(entry, "title", "title", children);
          addConditionally(entry, "link", "link", children);
          addConditionally(entry, "description", "description", children);
          var pubDate = fetch2("pubDate", children);
          if (pubDate)
            entry.pubDate = new Date(pubDate);
          return entry;
        })
      };
      addConditionally(feed, "title", "title", childs);
      addConditionally(feed, "link", "link", childs);
      addConditionally(feed, "description", "description", childs);
      var updated = fetch2("lastBuildDate", childs);
      if (updated) {
        feed.updated = new Date(updated);
      }
      addConditionally(feed, "author", "managingEditor", childs, true);
      return feed;
    }
    var MEDIA_KEYS_STRING = ["url", "type", "lang"];
    var MEDIA_KEYS_INT = [
      "fileSize",
      "bitrate",
      "framerate",
      "samplingrate",
      "channels",
      "duration",
      "height",
      "width"
    ];
    function getMediaElements(where) {
      return (0, legacy_1.getElementsByTagName)("media:content", where).map(function(elem) {
        var attribs = elem.attribs;
        var media = {
          medium: attribs.medium,
          isDefault: !!attribs.isDefault
        };
        for (var _i = 0, MEDIA_KEYS_STRING_1 = MEDIA_KEYS_STRING; _i < MEDIA_KEYS_STRING_1.length; _i++) {
          var attrib = MEDIA_KEYS_STRING_1[_i];
          if (attribs[attrib]) {
            media[attrib] = attribs[attrib];
          }
        }
        for (var _a2 = 0, MEDIA_KEYS_INT_1 = MEDIA_KEYS_INT; _a2 < MEDIA_KEYS_INT_1.length; _a2++) {
          var attrib = MEDIA_KEYS_INT_1[_a2];
          if (attribs[attrib]) {
            media[attrib] = parseInt(attribs[attrib], 10);
          }
        }
        if (attribs.expression) {
          media.expression = attribs.expression;
        }
        return media;
      });
    }
    function getOneElement(tagName, node2) {
      return (0, legacy_1.getElementsByTagName)(tagName, node2, true, 1)[0];
    }
    function fetch2(tagName, where, recurse) {
      if (recurse === void 0) {
        recurse = false;
      }
      return (0, stringify_1.textContent)((0, legacy_1.getElementsByTagName)(tagName, where, recurse, 1)).trim();
    }
    function addConditionally(obj, prop, tagName, where, recurse) {
      if (recurse === void 0) {
        recurse = false;
      }
      var val = fetch2(tagName, where, recurse);
      if (val)
        obj[prop] = val;
    }
    function isValidFeed(value) {
      return value === "rss" || value === "feed" || value === "rdf:RDF";
    }
  }
});

// node_modules/domutils/lib/index.js
var require_lib5 = __commonJS({
  "node_modules/domutils/lib/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hasChildren = exports.isDocument = exports.isComment = exports.isText = exports.isCDATA = exports.isTag = void 0;
    __exportStar(require_stringify(), exports);
    __exportStar(require_traversal(), exports);
    __exportStar(require_manipulation(), exports);
    __exportStar(require_querying(), exports);
    __exportStar(require_legacy2(), exports);
    __exportStar(require_helpers(), exports);
    __exportStar(require_feeds(), exports);
    var domhandler_1 = require_lib2();
    Object.defineProperty(exports, "isTag", { enumerable: true, get: function() {
      return domhandler_1.isTag;
    } });
    Object.defineProperty(exports, "isCDATA", { enumerable: true, get: function() {
      return domhandler_1.isCDATA;
    } });
    Object.defineProperty(exports, "isText", { enumerable: true, get: function() {
      return domhandler_1.isText;
    } });
    Object.defineProperty(exports, "isComment", { enumerable: true, get: function() {
      return domhandler_1.isComment;
    } });
    Object.defineProperty(exports, "isDocument", { enumerable: true, get: function() {
      return domhandler_1.isDocument;
    } });
    Object.defineProperty(exports, "hasChildren", { enumerable: true, get: function() {
      return domhandler_1.hasChildren;
    } });
  }
});

// node_modules/htmlparser2/lib/FeedHandler.js
var require_FeedHandler = __commonJS({
  "node_modules/htmlparser2/lib/FeedHandler.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2)
            if (Object.prototype.hasOwnProperty.call(b2, p))
              d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod2) {
      if (mod2 && mod2.__esModule)
        return mod2;
      var result = {};
      if (mod2 != null) {
        for (var k in mod2)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod2, k))
            __createBinding(result, mod2, k);
      }
      __setModuleDefault(result, mod2);
      return result;
    };
    var __importDefault = exports && exports.__importDefault || function(mod2) {
      return mod2 && mod2.__esModule ? mod2 : { "default": mod2 };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseFeed = exports.FeedHandler = void 0;
    var domhandler_1 = __importDefault(require_lib2());
    var DomUtils = __importStar(require_lib5());
    var Parser_1 = require_Parser();
    var FeedItemMediaMedium;
    (function(FeedItemMediaMedium2) {
      FeedItemMediaMedium2[FeedItemMediaMedium2["image"] = 0] = "image";
      FeedItemMediaMedium2[FeedItemMediaMedium2["audio"] = 1] = "audio";
      FeedItemMediaMedium2[FeedItemMediaMedium2["video"] = 2] = "video";
      FeedItemMediaMedium2[FeedItemMediaMedium2["document"] = 3] = "document";
      FeedItemMediaMedium2[FeedItemMediaMedium2["executable"] = 4] = "executable";
    })(FeedItemMediaMedium || (FeedItemMediaMedium = {}));
    var FeedItemMediaExpression;
    (function(FeedItemMediaExpression2) {
      FeedItemMediaExpression2[FeedItemMediaExpression2["sample"] = 0] = "sample";
      FeedItemMediaExpression2[FeedItemMediaExpression2["full"] = 1] = "full";
      FeedItemMediaExpression2[FeedItemMediaExpression2["nonstop"] = 2] = "nonstop";
    })(FeedItemMediaExpression || (FeedItemMediaExpression = {}));
    var FeedHandler = (
      /** @class */
      function(_super) {
        __extends(FeedHandler2, _super);
        function FeedHandler2(callback, options2) {
          var _this = this;
          if (typeof callback === "object") {
            callback = void 0;
            options2 = callback;
          }
          _this = _super.call(this, callback, options2) || this;
          return _this;
        }
        FeedHandler2.prototype.onend = function() {
          var _a2, _b2;
          var feedRoot = getOneElement(isValidFeed, this.dom);
          if (!feedRoot) {
            this.handleCallback(new Error("couldn't find root of feed"));
            return;
          }
          var feed = {};
          if (feedRoot.name === "feed") {
            var childs = feedRoot.children;
            feed.type = "atom";
            addConditionally(feed, "id", "id", childs);
            addConditionally(feed, "title", "title", childs);
            var href = getAttribute("href", getOneElement("link", childs));
            if (href) {
              feed.link = href;
            }
            addConditionally(feed, "description", "subtitle", childs);
            var updated = fetch2("updated", childs);
            if (updated) {
              feed.updated = new Date(updated);
            }
            addConditionally(feed, "author", "email", childs, true);
            feed.items = getElements("entry", childs).map(function(item) {
              var entry = {};
              var children = item.children;
              addConditionally(entry, "id", "id", children);
              addConditionally(entry, "title", "title", children);
              var href2 = getAttribute("href", getOneElement("link", children));
              if (href2) {
                entry.link = href2;
              }
              var description = fetch2("summary", children) || fetch2("content", children);
              if (description) {
                entry.description = description;
              }
              var pubDate = fetch2("updated", children);
              if (pubDate) {
                entry.pubDate = new Date(pubDate);
              }
              entry.media = getMediaElements(children);
              return entry;
            });
          } else {
            var childs = (_b2 = (_a2 = getOneElement("channel", feedRoot.children)) === null || _a2 === void 0 ? void 0 : _a2.children) !== null && _b2 !== void 0 ? _b2 : [];
            feed.type = feedRoot.name.substr(0, 3);
            feed.id = "";
            addConditionally(feed, "title", "title", childs);
            addConditionally(feed, "link", "link", childs);
            addConditionally(feed, "description", "description", childs);
            var updated = fetch2("lastBuildDate", childs);
            if (updated) {
              feed.updated = new Date(updated);
            }
            addConditionally(feed, "author", "managingEditor", childs, true);
            feed.items = getElements("item", feedRoot.children).map(function(item) {
              var entry = {};
              var children = item.children;
              addConditionally(entry, "id", "guid", children);
              addConditionally(entry, "title", "title", children);
              addConditionally(entry, "link", "link", children);
              addConditionally(entry, "description", "description", children);
              var pubDate = fetch2("pubDate", children);
              if (pubDate)
                entry.pubDate = new Date(pubDate);
              entry.media = getMediaElements(children);
              return entry;
            });
          }
          this.feed = feed;
          this.handleCallback(null);
        };
        return FeedHandler2;
      }(domhandler_1.default)
    );
    exports.FeedHandler = FeedHandler;
    function getMediaElements(where) {
      return getElements("media:content", where).map(function(elem) {
        var media = {
          medium: elem.attribs.medium,
          isDefault: !!elem.attribs.isDefault
        };
        if (elem.attribs.url) {
          media.url = elem.attribs.url;
        }
        if (elem.attribs.fileSize) {
          media.fileSize = parseInt(elem.attribs.fileSize, 10);
        }
        if (elem.attribs.type) {
          media.type = elem.attribs.type;
        }
        if (elem.attribs.expression) {
          media.expression = elem.attribs.expression;
        }
        if (elem.attribs.bitrate) {
          media.bitrate = parseInt(elem.attribs.bitrate, 10);
        }
        if (elem.attribs.framerate) {
          media.framerate = parseInt(elem.attribs.framerate, 10);
        }
        if (elem.attribs.samplingrate) {
          media.samplingrate = parseInt(elem.attribs.samplingrate, 10);
        }
        if (elem.attribs.channels) {
          media.channels = parseInt(elem.attribs.channels, 10);
        }
        if (elem.attribs.duration) {
          media.duration = parseInt(elem.attribs.duration, 10);
        }
        if (elem.attribs.height) {
          media.height = parseInt(elem.attribs.height, 10);
        }
        if (elem.attribs.width) {
          media.width = parseInt(elem.attribs.width, 10);
        }
        if (elem.attribs.lang) {
          media.lang = elem.attribs.lang;
        }
        return media;
      });
    }
    function getElements(tagName, where) {
      return DomUtils.getElementsByTagName(tagName, where, true);
    }
    function getOneElement(tagName, node2) {
      return DomUtils.getElementsByTagName(tagName, node2, true, 1)[0];
    }
    function fetch2(tagName, where, recurse) {
      if (recurse === void 0) {
        recurse = false;
      }
      return DomUtils.getText(DomUtils.getElementsByTagName(tagName, where, recurse, 1)).trim();
    }
    function getAttribute(name, elem) {
      if (!elem) {
        return null;
      }
      var attribs = elem.attribs;
      return attribs[name];
    }
    function addConditionally(obj, prop, what, where, recurse) {
      if (recurse === void 0) {
        recurse = false;
      }
      var tmp = fetch2(what, where, recurse);
      if (tmp)
        obj[prop] = tmp;
    }
    function isValidFeed(value) {
      return value === "rss" || value === "feed" || value === "rdf:RDF";
    }
    function parseFeed(feed, options2) {
      if (options2 === void 0) {
        options2 = { xmlMode: true };
      }
      var handler = new FeedHandler(options2);
      new Parser_1.Parser(handler, options2).end(feed);
      return handler.feed;
    }
    exports.parseFeed = parseFeed;
  }
});

// node_modules/htmlparser2/lib/index.js
var require_lib6 = __commonJS({
  "node_modules/htmlparser2/lib/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod2) {
      if (mod2 && mod2.__esModule)
        return mod2;
      var result = {};
      if (mod2 != null) {
        for (var k in mod2)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod2, k))
            __createBinding(result, mod2, k);
      }
      __setModuleDefault(result, mod2);
      return result;
    };
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    var __importDefault = exports && exports.__importDefault || function(mod2) {
      return mod2 && mod2.__esModule ? mod2 : { "default": mod2 };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RssHandler = exports.DefaultHandler = exports.DomUtils = exports.ElementType = exports.Tokenizer = exports.createDomStream = exports.parseDOM = exports.parseDocument = exports.DomHandler = exports.Parser = void 0;
    var Parser_1 = require_Parser();
    Object.defineProperty(exports, "Parser", { enumerable: true, get: function() {
      return Parser_1.Parser;
    } });
    var domhandler_1 = require_lib2();
    Object.defineProperty(exports, "DomHandler", { enumerable: true, get: function() {
      return domhandler_1.DomHandler;
    } });
    Object.defineProperty(exports, "DefaultHandler", { enumerable: true, get: function() {
      return domhandler_1.DomHandler;
    } });
    function parseDocument(data, options2) {
      var handler = new domhandler_1.DomHandler(void 0, options2);
      new Parser_1.Parser(handler, options2).end(data);
      return handler.root;
    }
    exports.parseDocument = parseDocument;
    function parseDOM2(data, options2) {
      return parseDocument(data, options2).children;
    }
    exports.parseDOM = parseDOM2;
    function createDomStream(cb, options2, elementCb) {
      var handler = new domhandler_1.DomHandler(cb, options2, elementCb);
      return new Parser_1.Parser(handler, options2);
    }
    exports.createDomStream = createDomStream;
    var Tokenizer_1 = require_Tokenizer();
    Object.defineProperty(exports, "Tokenizer", { enumerable: true, get: function() {
      return __importDefault(Tokenizer_1).default;
    } });
    var ElementType = __importStar(require_lib());
    exports.ElementType = ElementType;
    __exportStar(require_FeedHandler(), exports);
    exports.DomUtils = __importStar(require_lib5());
    var FeedHandler_1 = require_FeedHandler();
    Object.defineProperty(exports, "RssHandler", { enumerable: true, get: function() {
      return FeedHandler_1.FeedHandler;
    } });
  }
});

// node_modules/object-assign/index.js
var require_object_assign = __commonJS({
  "node_modules/object-assign/index.js"(exports, module) {
    "use strict";
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var hasOwnProperty2 = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;
    function toObject(val) {
      if (val === null || val === void 0) {
        throw new TypeError("Object.assign cannot be called with null or undefined");
      }
      return Object(val);
    }
    function shouldUseNative() {
      try {
        if (!Object.assign) {
          return false;
        }
        var test1 = new String("abc");
        test1[5] = "de";
        if (Object.getOwnPropertyNames(test1)[0] === "5") {
          return false;
        }
        var test2 = {};
        for (var i = 0; i < 10; i++) {
          test2["_" + String.fromCharCode(i)] = i;
        }
        var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
          return test2[n];
        });
        if (order2.join("") !== "0123456789") {
          return false;
        }
        var test3 = {};
        "abcdefghijklmnopqrst".split("").forEach(function(letter) {
          test3[letter] = letter;
        });
        if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
          return false;
        }
        return true;
      } catch (err) {
        return false;
      }
    }
    module.exports = shouldUseNative() ? Object.assign : function(target, source) {
      var from2;
      var to = toObject(target);
      var symbols;
      for (var s = 1; s < arguments.length; s++) {
        from2 = Object(arguments[s]);
        for (var key in from2) {
          if (hasOwnProperty2.call(from2, key)) {
            to[key] = from2[key];
          }
        }
        if (getOwnPropertySymbols) {
          symbols = getOwnPropertySymbols(from2);
          for (var i = 0; i < symbols.length; i++) {
            if (propIsEnumerable.call(from2, symbols[i])) {
              to[symbols[i]] = from2[symbols[i]];
            }
          }
        }
      }
      return to;
    };
  }
});

// node_modules/prop-types/lib/ReactPropTypesSecret.js
var require_ReactPropTypesSecret = __commonJS({
  "node_modules/prop-types/lib/ReactPropTypesSecret.js"(exports, module) {
    "use strict";
    var ReactPropTypesSecret = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
    module.exports = ReactPropTypesSecret;
  }
});

// node_modules/prop-types/lib/has.js
var require_has = __commonJS({
  "node_modules/prop-types/lib/has.js"(exports, module) {
    module.exports = Function.call.bind(Object.prototype.hasOwnProperty);
  }
});

// node_modules/prop-types/checkPropTypes.js
var require_checkPropTypes = __commonJS({
  "node_modules/prop-types/checkPropTypes.js"(exports, module) {
    "use strict";
    var printWarning = function() {
    };
    if (true) {
      ReactPropTypesSecret = require_ReactPropTypesSecret();
      loggedTypeFailures = {};
      has = require_has();
      printWarning = function(text) {
        var message = "Warning: " + text;
        if (typeof console !== "undefined") {
          console.error(message);
        }
        try {
          throw new Error(message);
        } catch (x) {
        }
      };
    }
    var ReactPropTypesSecret;
    var loggedTypeFailures;
    var has;
    function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
      if (true) {
        for (var typeSpecName in typeSpecs) {
          if (has(typeSpecs, typeSpecName)) {
            var error;
            try {
              if (typeof typeSpecs[typeSpecName] !== "function") {
                var err = Error(
                  (componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`."
                );
                err.name = "Invariant Violation";
                throw err;
              }
              error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
            } catch (ex) {
              error = ex;
            }
            if (error && !(error instanceof Error)) {
              printWarning(
                (componentName || "React class") + ": type specification of " + location + " `" + typeSpecName + "` is invalid; the type checker function must return `null` or an `Error` but returned a " + typeof error + ". You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument)."
              );
            }
            if (error instanceof Error && !(error.message in loggedTypeFailures)) {
              loggedTypeFailures[error.message] = true;
              var stack = getStack ? getStack() : "";
              printWarning(
                "Failed " + location + " type: " + error.message + (stack != null ? stack : "")
              );
            }
          }
        }
      }
    }
    checkPropTypes.resetWarningCache = function() {
      if (true) {
        loggedTypeFailures = {};
      }
    };
    module.exports = checkPropTypes;
  }
});

// node_modules/prop-types/factoryWithTypeCheckers.js
var require_factoryWithTypeCheckers = __commonJS({
  "node_modules/prop-types/factoryWithTypeCheckers.js"(exports, module) {
    "use strict";
    var ReactIs = require_react_is();
    var assign2 = require_object_assign();
    var ReactPropTypesSecret = require_ReactPropTypesSecret();
    var has = require_has();
    var checkPropTypes = require_checkPropTypes();
    var printWarning = function() {
    };
    if (true) {
      printWarning = function(text) {
        var message = "Warning: " + text;
        if (typeof console !== "undefined") {
          console.error(message);
        }
        try {
          throw new Error(message);
        } catch (x) {
        }
      };
    }
    function emptyFunctionThatReturnsNull() {
      return null;
    }
    module.exports = function(isValidElement, throwOnDirectAccess) {
      var ITERATOR_SYMBOL = typeof Symbol === "function" && Symbol.iterator;
      var FAUX_ITERATOR_SYMBOL = "@@iterator";
      function getIteratorFn(maybeIterable) {
        var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
        if (typeof iteratorFn === "function") {
          return iteratorFn;
        }
      }
      var ANONYMOUS = "<<anonymous>>";
      var ReactPropTypes = {
        array: createPrimitiveTypeChecker("array"),
        bigint: createPrimitiveTypeChecker("bigint"),
        bool: createPrimitiveTypeChecker("boolean"),
        func: createPrimitiveTypeChecker("function"),
        number: createPrimitiveTypeChecker("number"),
        object: createPrimitiveTypeChecker("object"),
        string: createPrimitiveTypeChecker("string"),
        symbol: createPrimitiveTypeChecker("symbol"),
        any: createAnyTypeChecker(),
        arrayOf: createArrayOfTypeChecker,
        element: createElementTypeChecker(),
        elementType: createElementTypeTypeChecker(),
        instanceOf: createInstanceTypeChecker,
        node: createNodeChecker(),
        objectOf: createObjectOfTypeChecker,
        oneOf: createEnumTypeChecker,
        oneOfType: createUnionTypeChecker,
        shape: createShapeTypeChecker,
        exact: createStrictShapeTypeChecker
      };
      function is(x, y) {
        if (x === y) {
          return x !== 0 || 1 / x === 1 / y;
        } else {
          return x !== x && y !== y;
        }
      }
      function PropTypeError(message, data) {
        this.message = message;
        this.data = data && typeof data === "object" ? data : {};
        this.stack = "";
      }
      PropTypeError.prototype = Error.prototype;
      function createChainableTypeChecker(validate) {
        if (true) {
          var manualPropTypeCallCache = {};
          var manualPropTypeWarningCount = 0;
        }
        function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
          componentName = componentName || ANONYMOUS;
          propFullName = propFullName || propName;
          if (secret !== ReactPropTypesSecret) {
            if (throwOnDirectAccess) {
              var err = new Error(
                "Calling PropTypes validators directly is not supported by the `prop-types` package. Use `PropTypes.checkPropTypes()` to call them. Read more at http://fb.me/use-check-prop-types"
              );
              err.name = "Invariant Violation";
              throw err;
            } else if (typeof console !== "undefined") {
              var cacheKey = componentName + ":" + propName;
              if (!manualPropTypeCallCache[cacheKey] && // Avoid spamming the console because they are often not actionable except for lib authors
              manualPropTypeWarningCount < 3) {
                printWarning(
                  "You are manually calling a React.PropTypes validation function for the `" + propFullName + "` prop on `" + componentName + "`. This is deprecated and will throw in the standalone `prop-types` package. You may be seeing this warning due to a third-party PropTypes library. See https://fb.me/react-warning-dont-call-proptypes for details."
                );
                manualPropTypeCallCache[cacheKey] = true;
                manualPropTypeWarningCount++;
              }
            }
          }
          if (props[propName] == null) {
            if (isRequired) {
              if (props[propName] === null) {
                return new PropTypeError("The " + location + " `" + propFullName + "` is marked as required " + ("in `" + componentName + "`, but its value is `null`."));
              }
              return new PropTypeError("The " + location + " `" + propFullName + "` is marked as required in " + ("`" + componentName + "`, but its value is `undefined`."));
            }
            return null;
          } else {
            return validate(props, propName, componentName, location, propFullName);
          }
        }
        var chainedCheckType = checkType.bind(null, false);
        chainedCheckType.isRequired = checkType.bind(null, true);
        return chainedCheckType;
      }
      function createPrimitiveTypeChecker(expectedType) {
        function validate(props, propName, componentName, location, propFullName, secret) {
          var propValue = props[propName];
          var propType = getPropType(propValue);
          if (propType !== expectedType) {
            var preciseType = getPreciseType(propValue);
            return new PropTypeError(
              "Invalid " + location + " `" + propFullName + "` of type " + ("`" + preciseType + "` supplied to `" + componentName + "`, expected ") + ("`" + expectedType + "`."),
              { expectedType }
            );
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createAnyTypeChecker() {
        return createChainableTypeChecker(emptyFunctionThatReturnsNull);
      }
      function createArrayOfTypeChecker(typeChecker) {
        function validate(props, propName, componentName, location, propFullName) {
          if (typeof typeChecker !== "function") {
            return new PropTypeError("Property `" + propFullName + "` of component `" + componentName + "` has invalid PropType notation inside arrayOf.");
          }
          var propValue = props[propName];
          if (!Array.isArray(propValue)) {
            var propType = getPropType(propValue);
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected an array."));
          }
          for (var i = 0; i < propValue.length; i++) {
            var error = typeChecker(propValue, i, componentName, location, propFullName + "[" + i + "]", ReactPropTypesSecret);
            if (error instanceof Error) {
              return error;
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createElementTypeChecker() {
        function validate(props, propName, componentName, location, propFullName) {
          var propValue = props[propName];
          if (!isValidElement(propValue)) {
            var propType = getPropType(propValue);
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected a single ReactElement."));
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createElementTypeTypeChecker() {
        function validate(props, propName, componentName, location, propFullName) {
          var propValue = props[propName];
          if (!ReactIs.isValidElementType(propValue)) {
            var propType = getPropType(propValue);
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected a single ReactElement type."));
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createInstanceTypeChecker(expectedClass) {
        function validate(props, propName, componentName, location, propFullName) {
          if (!(props[propName] instanceof expectedClass)) {
            var expectedClassName = expectedClass.name || ANONYMOUS;
            var actualClassName = getClassName(props[propName]);
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + actualClassName + "` supplied to `" + componentName + "`, expected ") + ("instance of `" + expectedClassName + "`."));
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createEnumTypeChecker(expectedValues) {
        if (!Array.isArray(expectedValues)) {
          if (true) {
            if (arguments.length > 1) {
              printWarning(
                "Invalid arguments supplied to oneOf, expected an array, got " + arguments.length + " arguments. A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z])."
              );
            } else {
              printWarning("Invalid argument supplied to oneOf, expected an array.");
            }
          }
          return emptyFunctionThatReturnsNull;
        }
        function validate(props, propName, componentName, location, propFullName) {
          var propValue = props[propName];
          for (var i = 0; i < expectedValues.length; i++) {
            if (is(propValue, expectedValues[i])) {
              return null;
            }
          }
          var valuesString = JSON.stringify(expectedValues, function replacer(key, value) {
            var type = getPreciseType(value);
            if (type === "symbol") {
              return String(value);
            }
            return value;
          });
          return new PropTypeError("Invalid " + location + " `" + propFullName + "` of value `" + String(propValue) + "` " + ("supplied to `" + componentName + "`, expected one of " + valuesString + "."));
        }
        return createChainableTypeChecker(validate);
      }
      function createObjectOfTypeChecker(typeChecker) {
        function validate(props, propName, componentName, location, propFullName) {
          if (typeof typeChecker !== "function") {
            return new PropTypeError("Property `" + propFullName + "` of component `" + componentName + "` has invalid PropType notation inside objectOf.");
          }
          var propValue = props[propName];
          var propType = getPropType(propValue);
          if (propType !== "object") {
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected an object."));
          }
          for (var key in propValue) {
            if (has(propValue, key)) {
              var error = typeChecker(propValue, key, componentName, location, propFullName + "." + key, ReactPropTypesSecret);
              if (error instanceof Error) {
                return error;
              }
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createUnionTypeChecker(arrayOfTypeCheckers) {
        if (!Array.isArray(arrayOfTypeCheckers)) {
          true ? printWarning("Invalid argument supplied to oneOfType, expected an instance of array.") : void 0;
          return emptyFunctionThatReturnsNull;
        }
        for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
          var checker = arrayOfTypeCheckers[i];
          if (typeof checker !== "function") {
            printWarning(
              "Invalid argument supplied to oneOfType. Expected an array of check functions, but received " + getPostfixForTypeWarning(checker) + " at index " + i + "."
            );
            return emptyFunctionThatReturnsNull;
          }
        }
        function validate(props, propName, componentName, location, propFullName) {
          var expectedTypes = [];
          for (var i2 = 0; i2 < arrayOfTypeCheckers.length; i2++) {
            var checker2 = arrayOfTypeCheckers[i2];
            var checkerResult = checker2(props, propName, componentName, location, propFullName, ReactPropTypesSecret);
            if (checkerResult == null) {
              return null;
            }
            if (checkerResult.data && has(checkerResult.data, "expectedType")) {
              expectedTypes.push(checkerResult.data.expectedType);
            }
          }
          var expectedTypesMessage = expectedTypes.length > 0 ? ", expected one of type [" + expectedTypes.join(", ") + "]" : "";
          return new PropTypeError("Invalid " + location + " `" + propFullName + "` supplied to " + ("`" + componentName + "`" + expectedTypesMessage + "."));
        }
        return createChainableTypeChecker(validate);
      }
      function createNodeChecker() {
        function validate(props, propName, componentName, location, propFullName) {
          if (!isNode2(props[propName])) {
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` supplied to " + ("`" + componentName + "`, expected a ReactNode."));
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function invalidValidatorError(componentName, location, propFullName, key, type) {
        return new PropTypeError(
          (componentName || "React class") + ": " + location + " type `" + propFullName + "." + key + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + type + "`."
        );
      }
      function createShapeTypeChecker(shapeTypes) {
        function validate(props, propName, componentName, location, propFullName) {
          var propValue = props[propName];
          var propType = getPropType(propValue);
          if (propType !== "object") {
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type `" + propType + "` " + ("supplied to `" + componentName + "`, expected `object`."));
          }
          for (var key in shapeTypes) {
            var checker = shapeTypes[key];
            if (typeof checker !== "function") {
              return invalidValidatorError(componentName, location, propFullName, key, getPreciseType(checker));
            }
            var error = checker(propValue, key, componentName, location, propFullName + "." + key, ReactPropTypesSecret);
            if (error) {
              return error;
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createStrictShapeTypeChecker(shapeTypes) {
        function validate(props, propName, componentName, location, propFullName) {
          var propValue = props[propName];
          var propType = getPropType(propValue);
          if (propType !== "object") {
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type `" + propType + "` " + ("supplied to `" + componentName + "`, expected `object`."));
          }
          var allKeys = assign2({}, props[propName], shapeTypes);
          for (var key in allKeys) {
            var checker = shapeTypes[key];
            if (has(shapeTypes, key) && typeof checker !== "function") {
              return invalidValidatorError(componentName, location, propFullName, key, getPreciseType(checker));
            }
            if (!checker) {
              return new PropTypeError(
                "Invalid " + location + " `" + propFullName + "` key `" + key + "` supplied to `" + componentName + "`.\nBad object: " + JSON.stringify(props[propName], null, "  ") + "\nValid keys: " + JSON.stringify(Object.keys(shapeTypes), null, "  ")
              );
            }
            var error = checker(propValue, key, componentName, location, propFullName + "." + key, ReactPropTypesSecret);
            if (error) {
              return error;
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function isNode2(propValue) {
        switch (typeof propValue) {
          case "number":
          case "string":
          case "undefined":
            return true;
          case "boolean":
            return !propValue;
          case "object":
            if (Array.isArray(propValue)) {
              return propValue.every(isNode2);
            }
            if (propValue === null || isValidElement(propValue)) {
              return true;
            }
            var iteratorFn = getIteratorFn(propValue);
            if (iteratorFn) {
              var iterator = iteratorFn.call(propValue);
              var step;
              if (iteratorFn !== propValue.entries) {
                while (!(step = iterator.next()).done) {
                  if (!isNode2(step.value)) {
                    return false;
                  }
                }
              } else {
                while (!(step = iterator.next()).done) {
                  var entry = step.value;
                  if (entry) {
                    if (!isNode2(entry[1])) {
                      return false;
                    }
                  }
                }
              }
            } else {
              return false;
            }
            return true;
          default:
            return false;
        }
      }
      function isSymbol(propType, propValue) {
        if (propType === "symbol") {
          return true;
        }
        if (!propValue) {
          return false;
        }
        if (propValue["@@toStringTag"] === "Symbol") {
          return true;
        }
        if (typeof Symbol === "function" && propValue instanceof Symbol) {
          return true;
        }
        return false;
      }
      function getPropType(propValue) {
        var propType = typeof propValue;
        if (Array.isArray(propValue)) {
          return "array";
        }
        if (propValue instanceof RegExp) {
          return "object";
        }
        if (isSymbol(propType, propValue)) {
          return "symbol";
        }
        return propType;
      }
      function getPreciseType(propValue) {
        if (typeof propValue === "undefined" || propValue === null) {
          return "" + propValue;
        }
        var propType = getPropType(propValue);
        if (propType === "object") {
          if (propValue instanceof Date) {
            return "date";
          } else if (propValue instanceof RegExp) {
            return "regexp";
          }
        }
        return propType;
      }
      function getPostfixForTypeWarning(value) {
        var type = getPreciseType(value);
        switch (type) {
          case "array":
          case "object":
            return "an " + type;
          case "boolean":
          case "date":
          case "regexp":
            return "a " + type;
          default:
            return type;
        }
      }
      function getClassName(propValue) {
        if (!propValue.constructor || !propValue.constructor.name) {
          return ANONYMOUS;
        }
        return propValue.constructor.name;
      }
      ReactPropTypes.checkPropTypes = checkPropTypes;
      ReactPropTypes.resetWarningCache = checkPropTypes.resetWarningCache;
      ReactPropTypes.PropTypes = ReactPropTypes;
      return ReactPropTypes;
    };
  }
});

// node_modules/prop-types/index.js
var require_prop_types = __commonJS({
  "node_modules/prop-types/index.js"(exports, module) {
    if (true) {
      ReactIs = require_react_is();
      throwOnDirectAccess = true;
      module.exports = require_factoryWithTypeCheckers()(ReactIs.isElement, throwOnDirectAccess);
    } else {
      module.exports = null();
    }
    var ReactIs;
    var throwOnDirectAccess;
  }
});

// node_modules/react-modal/lib/helpers/tabbable.js
var require_tabbable = __commonJS({
  "node_modules/react-modal/lib/helpers/tabbable.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = findTabbableDescendants;
    var DISPLAY_NONE = "none";
    var DISPLAY_CONTENTS = "contents";
    var tabbableNode = /input|select|textarea|button|object|iframe/;
    function isNotOverflowing(element, style) {
      return style.getPropertyValue("overflow") !== "visible" || // if 'overflow: visible' set, check if there is actually any overflow
      element.scrollWidth <= 0 && element.scrollHeight <= 0;
    }
    function hidesContents(element) {
      var zeroSize = element.offsetWidth <= 0 && element.offsetHeight <= 0;
      if (zeroSize && !element.innerHTML)
        return true;
      try {
        var style = window.getComputedStyle(element);
        var displayValue = style.getPropertyValue("display");
        return zeroSize ? displayValue !== DISPLAY_CONTENTS && isNotOverflowing(element, style) : displayValue === DISPLAY_NONE;
      } catch (exception) {
        console.warn("Failed to inspect element style");
        return false;
      }
    }
    function visible(element) {
      var parentElement = element;
      var rootNode = element.getRootNode && element.getRootNode();
      while (parentElement) {
        if (parentElement === document.body)
          break;
        if (rootNode && parentElement === rootNode)
          parentElement = rootNode.host.parentNode;
        if (hidesContents(parentElement))
          return false;
        parentElement = parentElement.parentNode;
      }
      return true;
    }
    function focusable(element, isTabIndexNotNaN) {
      var nodeName = element.nodeName.toLowerCase();
      var res = tabbableNode.test(nodeName) && !element.disabled || (nodeName === "a" ? element.href || isTabIndexNotNaN : isTabIndexNotNaN);
      return res && visible(element);
    }
    function tabbable(element) {
      var tabIndex = element.getAttribute("tabindex");
      if (tabIndex === null)
        tabIndex = void 0;
      var isTabIndexNaN = isNaN(tabIndex);
      return (isTabIndexNaN || tabIndex >= 0) && focusable(element, !isTabIndexNaN);
    }
    function findTabbableDescendants(element) {
      var descendants = [].slice.call(element.querySelectorAll("*"), 0).reduce(function(finished, el) {
        return finished.concat(!el.shadowRoot ? [el] : findTabbableDescendants(el.shadowRoot));
      }, []);
      return descendants.filter(tabbable);
    }
    module.exports = exports["default"];
  }
});

// node_modules/react-modal/lib/helpers/focusManager.js
var require_focusManager = __commonJS({
  "node_modules/react-modal/lib/helpers/focusManager.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.resetState = resetState;
    exports.log = log;
    exports.handleBlur = handleBlur;
    exports.handleFocus = handleFocus;
    exports.markForFocusLater = markForFocusLater;
    exports.returnFocus = returnFocus;
    exports.popWithoutFocus = popWithoutFocus;
    exports.setupScopedFocus = setupScopedFocus;
    exports.teardownScopedFocus = teardownScopedFocus;
    var _tabbable = require_tabbable();
    var _tabbable2 = _interopRequireDefault(_tabbable);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var focusLaterElements = [];
    var modalElement = null;
    var needToFocus = false;
    function resetState() {
      focusLaterElements = [];
    }
    function log() {
      if (true) {
        console.log("focusManager ----------");
        focusLaterElements.forEach(function(f) {
          var check = f || {};
          console.log(check.nodeName, check.className, check.id);
        });
        console.log("end focusManager ----------");
      }
    }
    function handleBlur() {
      needToFocus = true;
    }
    function handleFocus() {
      if (needToFocus) {
        needToFocus = false;
        if (!modalElement) {
          return;
        }
        setTimeout(function() {
          if (modalElement.contains(document.activeElement)) {
            return;
          }
          var el = (0, _tabbable2.default)(modalElement)[0] || modalElement;
          el.focus();
        }, 0);
      }
    }
    function markForFocusLater() {
      focusLaterElements.push(document.activeElement);
    }
    function returnFocus() {
      var preventScroll = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false;
      var toFocus = null;
      try {
        if (focusLaterElements.length !== 0) {
          toFocus = focusLaterElements.pop();
          toFocus.focus({ preventScroll });
        }
        return;
      } catch (e) {
        console.warn(["You tried to return focus to", toFocus, "but it is not in the DOM anymore"].join(" "));
      }
    }
    function popWithoutFocus() {
      focusLaterElements.length > 0 && focusLaterElements.pop();
    }
    function setupScopedFocus(element) {
      modalElement = element;
      if (window.addEventListener) {
        window.addEventListener("blur", handleBlur, false);
        document.addEventListener("focus", handleFocus, true);
      } else {
        window.attachEvent("onBlur", handleBlur);
        document.attachEvent("onFocus", handleFocus);
      }
    }
    function teardownScopedFocus() {
      modalElement = null;
      if (window.addEventListener) {
        window.removeEventListener("blur", handleBlur);
        document.removeEventListener("focus", handleFocus);
      } else {
        window.detachEvent("onBlur", handleBlur);
        document.detachEvent("onFocus", handleFocus);
      }
    }
  }
});

// node_modules/react-modal/lib/helpers/scopeTab.js
var require_scopeTab = __commonJS({
  "node_modules/react-modal/lib/helpers/scopeTab.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = scopeTab;
    var _tabbable = require_tabbable();
    var _tabbable2 = _interopRequireDefault(_tabbable);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function getActiveElement() {
      var el = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : document;
      return el.activeElement.shadowRoot ? getActiveElement(el.activeElement.shadowRoot) : el.activeElement;
    }
    function scopeTab(node2, event) {
      var tabbable = (0, _tabbable2.default)(node2);
      if (!tabbable.length) {
        event.preventDefault();
        return;
      }
      var target = void 0;
      var shiftKey = event.shiftKey;
      var head = tabbable[0];
      var tail = tabbable[tabbable.length - 1];
      var activeElement = getActiveElement();
      if (node2 === activeElement) {
        if (!shiftKey)
          return;
        target = tail;
      }
      if (tail === activeElement && !shiftKey) {
        target = head;
      }
      if (head === activeElement && shiftKey) {
        target = tail;
      }
      if (target) {
        event.preventDefault();
        target.focus();
        return;
      }
      var checkSafari = /(\bChrome\b|\bSafari\b)\//.exec(navigator.userAgent);
      var isSafariDesktop = checkSafari != null && checkSafari[1] != "Chrome" && /\biPod\b|\biPad\b/g.exec(navigator.userAgent) == null;
      if (!isSafariDesktop)
        return;
      var x = tabbable.indexOf(activeElement);
      if (x > -1) {
        x += shiftKey ? -1 : 1;
      }
      target = tabbable[x];
      if (typeof target === "undefined") {
        event.preventDefault();
        target = shiftKey ? tail : head;
        target.focus();
        return;
      }
      event.preventDefault();
      target.focus();
    }
    module.exports = exports["default"];
  }
});

// node_modules/warning/warning.js
var require_warning = __commonJS({
  "node_modules/warning/warning.js"(exports, module) {
    "use strict";
    var __DEV__ = true;
    var warning = function() {
    };
    if (__DEV__) {
      printWarning = function printWarning2(format, args) {
        var len = arguments.length;
        args = new Array(len > 1 ? len - 1 : 0);
        for (var key = 1; key < len; key++) {
          args[key - 1] = arguments[key];
        }
        var argIndex = 0;
        var message = "Warning: " + format.replace(/%s/g, function() {
          return args[argIndex++];
        });
        if (typeof console !== "undefined") {
          console.error(message);
        }
        try {
          throw new Error(message);
        } catch (x) {
        }
      };
      warning = function(condition, format, args) {
        var len = arguments.length;
        args = new Array(len > 2 ? len - 2 : 0);
        for (var key = 2; key < len; key++) {
          args[key - 2] = arguments[key];
        }
        if (format === void 0) {
          throw new Error(
            "`warning(condition, format, ...args)` requires a warning message argument"
          );
        }
        if (!condition) {
          printWarning.apply(null, [format].concat(args));
        }
      };
    }
    var printWarning;
    module.exports = warning;
  }
});

// node_modules/exenv/index.js
var require_exenv = __commonJS({
  "node_modules/exenv/index.js"(exports, module) {
    (function() {
      "use strict";
      var canUseDOM2 = !!(typeof window !== "undefined" && window.document && window.document.createElement);
      var ExecutionEnvironment = {
        canUseDOM: canUseDOM2,
        canUseWorkers: typeof Worker !== "undefined",
        canUseEventListeners: canUseDOM2 && !!(window.addEventListener || window.attachEvent),
        canUseViewport: canUseDOM2 && !!window.screen
      };
      if (typeof define === "function" && typeof define.amd === "object" && define.amd) {
        define(function() {
          return ExecutionEnvironment;
        });
      } else if (typeof module !== "undefined" && module.exports) {
        module.exports = ExecutionEnvironment;
      } else {
        window.ExecutionEnvironment = ExecutionEnvironment;
      }
    })();
  }
});

// node_modules/react-modal/lib/helpers/safeHTMLElement.js
var require_safeHTMLElement = __commonJS({
  "node_modules/react-modal/lib/helpers/safeHTMLElement.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.canUseDOM = exports.SafeNodeList = exports.SafeHTMLCollection = void 0;
    var _exenv = require_exenv();
    var _exenv2 = _interopRequireDefault(_exenv);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var EE = _exenv2.default;
    var SafeHTMLElement = EE.canUseDOM ? window.HTMLElement : {};
    var SafeHTMLCollection = exports.SafeHTMLCollection = EE.canUseDOM ? window.HTMLCollection : {};
    var SafeNodeList = exports.SafeNodeList = EE.canUseDOM ? window.NodeList : {};
    var canUseDOM2 = exports.canUseDOM = EE.canUseDOM;
    exports.default = SafeHTMLElement;
  }
});

// node_modules/react-modal/lib/helpers/ariaAppHider.js
var require_ariaAppHider = __commonJS({
  "node_modules/react-modal/lib/helpers/ariaAppHider.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.resetState = resetState;
    exports.log = log;
    exports.assertNodeList = assertNodeList;
    exports.setElement = setElement;
    exports.validateElement = validateElement;
    exports.hide = hide;
    exports.show = show;
    exports.documentNotReadyOrSSRTesting = documentNotReadyOrSSRTesting;
    var _warning = require_warning();
    var _warning2 = _interopRequireDefault(_warning);
    var _safeHTMLElement = require_safeHTMLElement();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var globalElement = null;
    function resetState() {
      if (globalElement) {
        if (globalElement.removeAttribute) {
          globalElement.removeAttribute("aria-hidden");
        } else if (globalElement.length != null) {
          globalElement.forEach(function(element) {
            return element.removeAttribute("aria-hidden");
          });
        } else {
          document.querySelectorAll(globalElement).forEach(function(element) {
            return element.removeAttribute("aria-hidden");
          });
        }
      }
      globalElement = null;
    }
    function log() {
      if (true) {
        var check = globalElement || {};
        console.log("ariaAppHider ----------");
        console.log(check.nodeName, check.className, check.id);
        console.log("end ariaAppHider ----------");
      }
    }
    function assertNodeList(nodeList, selector) {
      if (!nodeList || !nodeList.length) {
        throw new Error("react-modal: No elements were found for selector " + selector + ".");
      }
    }
    function setElement(element) {
      var useElement = element;
      if (typeof useElement === "string" && _safeHTMLElement.canUseDOM) {
        var el = document.querySelectorAll(useElement);
        assertNodeList(el, useElement);
        useElement = el;
      }
      globalElement = useElement || globalElement;
      return globalElement;
    }
    function validateElement(appElement) {
      var el = appElement || globalElement;
      if (el) {
        return Array.isArray(el) || el instanceof HTMLCollection || el instanceof NodeList ? el : [el];
      } else {
        (0, _warning2.default)(false, ["react-modal: App element is not defined.", "Please use `Modal.setAppElement(el)` or set `appElement={el}`.", "This is needed so screen readers don't see main content", "when modal is opened. It is not recommended, but you can opt-out", "by setting `ariaHideApp={false}`."].join(" "));
        return [];
      }
    }
    function hide(appElement) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = void 0;
      try {
        for (var _iterator = validateElement(appElement)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var el = _step.value;
          el.setAttribute("aria-hidden", "true");
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
    function show(appElement) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = void 0;
      try {
        for (var _iterator2 = validateElement(appElement)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var el = _step2.value;
          el.removeAttribute("aria-hidden");
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
    function documentNotReadyOrSSRTesting() {
      globalElement = null;
    }
  }
});

// node_modules/react-modal/lib/helpers/classList.js
var require_classList = __commonJS({
  "node_modules/react-modal/lib/helpers/classList.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.resetState = resetState;
    exports.log = log;
    var htmlClassList = {};
    var docBodyClassList = {};
    function removeClass(at, cls) {
      at.classList.remove(cls);
    }
    function resetState() {
      var htmlElement = document.getElementsByTagName("html")[0];
      for (var cls in htmlClassList) {
        removeClass(htmlElement, htmlClassList[cls]);
      }
      var body = document.body;
      for (var _cls in docBodyClassList) {
        removeClass(body, docBodyClassList[_cls]);
      }
      htmlClassList = {};
      docBodyClassList = {};
    }
    function log() {
      if (true) {
        var classes = document.getElementsByTagName("html")[0].className;
        var buffer = "Show tracked classes:\n\n";
        buffer += "<html /> (" + classes + "):\n  ";
        for (var x in htmlClassList) {
          buffer += "  " + x + " " + htmlClassList[x] + "\n  ";
        }
        classes = document.body.className;
        buffer += "\n\ndoc.body (" + classes + "):\n  ";
        for (var _x in docBodyClassList) {
          buffer += "  " + _x + " " + docBodyClassList[_x] + "\n  ";
        }
        buffer += "\n";
        console.log(buffer);
      }
    }
    var incrementReference = function incrementReference2(poll, className) {
      if (!poll[className]) {
        poll[className] = 0;
      }
      poll[className] += 1;
      return className;
    };
    var decrementReference = function decrementReference2(poll, className) {
      if (poll[className]) {
        poll[className] -= 1;
      }
      return className;
    };
    var trackClass = function trackClass2(classListRef, poll, classes) {
      classes.forEach(function(className) {
        incrementReference(poll, className);
        classListRef.add(className);
      });
    };
    var untrackClass = function untrackClass2(classListRef, poll, classes) {
      classes.forEach(function(className) {
        decrementReference(poll, className);
        poll[className] === 0 && classListRef.remove(className);
      });
    };
    var add = exports.add = function add2(element, classString) {
      return trackClass(element.classList, element.nodeName.toLowerCase() == "html" ? htmlClassList : docBodyClassList, classString.split(" "));
    };
    var remove = exports.remove = function remove2(element, classString) {
      return untrackClass(element.classList, element.nodeName.toLowerCase() == "html" ? htmlClassList : docBodyClassList, classString.split(" "));
    };
  }
});

// node_modules/react-modal/lib/helpers/portalOpenInstances.js
var require_portalOpenInstances = __commonJS({
  "node_modules/react-modal/lib/helpers/portalOpenInstances.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.log = log;
    exports.resetState = resetState;
    function _classCallCheck2(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var PortalOpenInstances = function PortalOpenInstances2() {
      var _this = this;
      _classCallCheck2(this, PortalOpenInstances2);
      this.register = function(openInstance) {
        if (_this.openInstances.indexOf(openInstance) !== -1) {
          if (true) {
            console.warn("React-Modal: Cannot register modal instance that's already open");
          }
          return;
        }
        _this.openInstances.push(openInstance);
        _this.emit("register");
      };
      this.deregister = function(openInstance) {
        var index2 = _this.openInstances.indexOf(openInstance);
        if (index2 === -1) {
          if (true) {
            console.warn("React-Modal: Unable to deregister " + openInstance + " as it was never registered");
          }
          return;
        }
        _this.openInstances.splice(index2, 1);
        _this.emit("deregister");
      };
      this.subscribe = function(callback) {
        _this.subscribers.push(callback);
      };
      this.emit = function(eventType) {
        _this.subscribers.forEach(function(subscriber) {
          return subscriber(
            eventType,
            // shallow copy to avoid accidental mutation
            _this.openInstances.slice()
          );
        });
      };
      this.openInstances = [];
      this.subscribers = [];
    };
    var portalOpenInstances = new PortalOpenInstances();
    function log() {
      console.log("portalOpenInstances ----------");
      console.log(portalOpenInstances.openInstances.length);
      portalOpenInstances.openInstances.forEach(function(p) {
        return console.log(p);
      });
      console.log("end portalOpenInstances ----------");
    }
    function resetState() {
      portalOpenInstances = new PortalOpenInstances();
    }
    exports.default = portalOpenInstances;
  }
});

// node_modules/react-modal/lib/helpers/bodyTrap.js
var require_bodyTrap = __commonJS({
  "node_modules/react-modal/lib/helpers/bodyTrap.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.resetState = resetState;
    exports.log = log;
    var _portalOpenInstances = require_portalOpenInstances();
    var _portalOpenInstances2 = _interopRequireDefault(_portalOpenInstances);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var before = void 0;
    var after = void 0;
    var instances = [];
    function resetState() {
      var _arr = [before, after];
      for (var _i = 0; _i < _arr.length; _i++) {
        var item = _arr[_i];
        if (!item)
          continue;
        item.parentNode && item.parentNode.removeChild(item);
      }
      before = after = null;
      instances = [];
    }
    function log() {
      console.log("bodyTrap ----------");
      console.log(instances.length);
      var _arr2 = [before, after];
      for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
        var item = _arr2[_i2];
        var check = item || {};
        console.log(check.nodeName, check.className, check.id);
      }
      console.log("edn bodyTrap ----------");
    }
    function focusContent() {
      if (instances.length === 0) {
        if (true) {
          console.warn("React-Modal: Open instances > 0 expected");
        }
        return;
      }
      instances[instances.length - 1].focusContent();
    }
    function bodyTrap(eventType, openInstances) {
      if (!before && !after) {
        before = document.createElement("div");
        before.setAttribute("data-react-modal-body-trap", "");
        before.style.position = "absolute";
        before.style.opacity = "0";
        before.setAttribute("tabindex", "0");
        before.addEventListener("focus", focusContent);
        after = before.cloneNode();
        after.addEventListener("focus", focusContent);
      }
      instances = openInstances;
      if (instances.length > 0) {
        if (document.body.firstChild !== before) {
          document.body.insertBefore(before, document.body.firstChild);
        }
        if (document.body.lastChild !== after) {
          document.body.appendChild(after);
        }
      } else {
        if (before.parentElement) {
          before.parentElement.removeChild(before);
        }
        if (after.parentElement) {
          after.parentElement.removeChild(after);
        }
      }
    }
    _portalOpenInstances2.default.subscribe(bodyTrap);
  }
});

// node_modules/react-modal/lib/components/ModalPortal.js
var require_ModalPortal = __commonJS({
  "node_modules/react-modal/lib/components/ModalPortal.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _extends3 = Object.assign || function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
      return typeof obj;
    } : function(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
    var _createClass2 = function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor)
            descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps)
          defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
          defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();
    var _react = require_react();
    var _propTypes = require_prop_types();
    var _propTypes2 = _interopRequireDefault(_propTypes);
    var _focusManager = require_focusManager();
    var focusManager = _interopRequireWildcard(_focusManager);
    var _scopeTab = require_scopeTab();
    var _scopeTab2 = _interopRequireDefault(_scopeTab);
    var _ariaAppHider = require_ariaAppHider();
    var ariaAppHider = _interopRequireWildcard(_ariaAppHider);
    var _classList = require_classList();
    var classList = _interopRequireWildcard(_classList);
    var _safeHTMLElement = require_safeHTMLElement();
    var _safeHTMLElement2 = _interopRequireDefault(_safeHTMLElement);
    var _portalOpenInstances = require_portalOpenInstances();
    var _portalOpenInstances2 = _interopRequireDefault(_portalOpenInstances);
    require_bodyTrap();
    function _interopRequireWildcard(obj) {
      if (obj && obj.__esModule) {
        return obj;
      } else {
        var newObj = {};
        if (obj != null) {
          for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key))
              newObj[key] = obj[key];
          }
        }
        newObj.default = obj;
        return newObj;
      }
    }
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck2(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn2(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits2(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var CLASS_NAMES = {
      overlay: "ReactModal__Overlay",
      content: "ReactModal__Content"
    };
    var isTabKey = function isTabKey2(event) {
      return event.code === "Tab" || event.keyCode === 9;
    };
    var isEscKey = function isEscKey2(event) {
      return event.code === "Escape" || event.keyCode === 27;
    };
    var ariaHiddenInstances = 0;
    var ModalPortal = function(_Component) {
      _inherits2(ModalPortal2, _Component);
      function ModalPortal2(props) {
        _classCallCheck2(this, ModalPortal2);
        var _this = _possibleConstructorReturn2(this, (ModalPortal2.__proto__ || Object.getPrototypeOf(ModalPortal2)).call(this, props));
        _this.setOverlayRef = function(overlay) {
          _this.overlay = overlay;
          _this.props.overlayRef && _this.props.overlayRef(overlay);
        };
        _this.setContentRef = function(content) {
          _this.content = content;
          _this.props.contentRef && _this.props.contentRef(content);
        };
        _this.afterClose = function() {
          var _this$props = _this.props, appElement = _this$props.appElement, ariaHideApp = _this$props.ariaHideApp, htmlOpenClassName = _this$props.htmlOpenClassName, bodyOpenClassName = _this$props.bodyOpenClassName, parentSelector = _this$props.parentSelector;
          var parentDocument = parentSelector && parentSelector().ownerDocument || document;
          bodyOpenClassName && classList.remove(parentDocument.body, bodyOpenClassName);
          htmlOpenClassName && classList.remove(parentDocument.getElementsByTagName("html")[0], htmlOpenClassName);
          if (ariaHideApp && ariaHiddenInstances > 0) {
            ariaHiddenInstances -= 1;
            if (ariaHiddenInstances === 0) {
              ariaAppHider.show(appElement);
            }
          }
          if (_this.props.shouldFocusAfterRender) {
            if (_this.props.shouldReturnFocusAfterClose) {
              focusManager.returnFocus(_this.props.preventScroll);
              focusManager.teardownScopedFocus();
            } else {
              focusManager.popWithoutFocus();
            }
          }
          if (_this.props.onAfterClose) {
            _this.props.onAfterClose();
          }
          _portalOpenInstances2.default.deregister(_this);
        };
        _this.open = function() {
          _this.beforeOpen();
          if (_this.state.afterOpen && _this.state.beforeClose) {
            clearTimeout(_this.closeTimer);
            _this.setState({ beforeClose: false });
          } else {
            if (_this.props.shouldFocusAfterRender) {
              focusManager.setupScopedFocus(_this.node);
              focusManager.markForFocusLater();
            }
            _this.setState({ isOpen: true }, function() {
              _this.openAnimationFrame = requestAnimationFrame(function() {
                _this.setState({ afterOpen: true });
                if (_this.props.isOpen && _this.props.onAfterOpen) {
                  _this.props.onAfterOpen({
                    overlayEl: _this.overlay,
                    contentEl: _this.content
                  });
                }
              });
            });
          }
        };
        _this.close = function() {
          if (_this.props.closeTimeoutMS > 0) {
            _this.closeWithTimeout();
          } else {
            _this.closeWithoutTimeout();
          }
        };
        _this.focusContent = function() {
          return _this.content && !_this.contentHasFocus() && _this.content.focus({ preventScroll: true });
        };
        _this.closeWithTimeout = function() {
          var closesAt = Date.now() + _this.props.closeTimeoutMS;
          _this.setState({ beforeClose: true, closesAt }, function() {
            _this.closeTimer = setTimeout(_this.closeWithoutTimeout, _this.state.closesAt - Date.now());
          });
        };
        _this.closeWithoutTimeout = function() {
          _this.setState({
            beforeClose: false,
            isOpen: false,
            afterOpen: false,
            closesAt: null
          }, _this.afterClose);
        };
        _this.handleKeyDown = function(event) {
          if (isTabKey(event)) {
            (0, _scopeTab2.default)(_this.content, event);
          }
          if (_this.props.shouldCloseOnEsc && isEscKey(event)) {
            event.stopPropagation();
            _this.requestClose(event);
          }
        };
        _this.handleOverlayOnClick = function(event) {
          if (_this.shouldClose === null) {
            _this.shouldClose = true;
          }
          if (_this.shouldClose && _this.props.shouldCloseOnOverlayClick) {
            if (_this.ownerHandlesClose()) {
              _this.requestClose(event);
            } else {
              _this.focusContent();
            }
          }
          _this.shouldClose = null;
        };
        _this.handleContentOnMouseUp = function() {
          _this.shouldClose = false;
        };
        _this.handleOverlayOnMouseDown = function(event) {
          if (!_this.props.shouldCloseOnOverlayClick && event.target == _this.overlay) {
            event.preventDefault();
          }
        };
        _this.handleContentOnClick = function() {
          _this.shouldClose = false;
        };
        _this.handleContentOnMouseDown = function() {
          _this.shouldClose = false;
        };
        _this.requestClose = function(event) {
          return _this.ownerHandlesClose() && _this.props.onRequestClose(event);
        };
        _this.ownerHandlesClose = function() {
          return _this.props.onRequestClose;
        };
        _this.shouldBeClosed = function() {
          return !_this.state.isOpen && !_this.state.beforeClose;
        };
        _this.contentHasFocus = function() {
          return document.activeElement === _this.content || _this.content.contains(document.activeElement);
        };
        _this.buildClassName = function(which, additional) {
          var classNames2 = (typeof additional === "undefined" ? "undefined" : _typeof2(additional)) === "object" ? additional : {
            base: CLASS_NAMES[which],
            afterOpen: CLASS_NAMES[which] + "--after-open",
            beforeClose: CLASS_NAMES[which] + "--before-close"
          };
          var className = classNames2.base;
          if (_this.state.afterOpen) {
            className = className + " " + classNames2.afterOpen;
          }
          if (_this.state.beforeClose) {
            className = className + " " + classNames2.beforeClose;
          }
          return typeof additional === "string" && additional ? className + " " + additional : className;
        };
        _this.attributesFromObject = function(prefix2, items) {
          return Object.keys(items).reduce(function(acc, name) {
            acc[prefix2 + "-" + name] = items[name];
            return acc;
          }, {});
        };
        _this.state = {
          afterOpen: false,
          beforeClose: false
        };
        _this.shouldClose = null;
        _this.moveFromContentToOverlay = null;
        return _this;
      }
      _createClass2(ModalPortal2, [{
        key: "componentDidMount",
        value: function componentDidMount() {
          if (this.props.isOpen) {
            this.open();
          }
        }
      }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate(prevProps, prevState) {
          if (true) {
            if (prevProps.bodyOpenClassName !== this.props.bodyOpenClassName) {
              console.warn('React-Modal: "bodyOpenClassName" prop has been modified. This may cause unexpected behavior when multiple modals are open.');
            }
            if (prevProps.htmlOpenClassName !== this.props.htmlOpenClassName) {
              console.warn('React-Modal: "htmlOpenClassName" prop has been modified. This may cause unexpected behavior when multiple modals are open.');
            }
          }
          if (this.props.isOpen && !prevProps.isOpen) {
            this.open();
          } else if (!this.props.isOpen && prevProps.isOpen) {
            this.close();
          }
          if (this.props.shouldFocusAfterRender && this.state.isOpen && !prevState.isOpen) {
            this.focusContent();
          }
        }
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          if (this.state.isOpen) {
            this.afterClose();
          }
          clearTimeout(this.closeTimer);
          cancelAnimationFrame(this.openAnimationFrame);
        }
      }, {
        key: "beforeOpen",
        value: function beforeOpen() {
          var _props = this.props, appElement = _props.appElement, ariaHideApp = _props.ariaHideApp, htmlOpenClassName = _props.htmlOpenClassName, bodyOpenClassName = _props.bodyOpenClassName, parentSelector = _props.parentSelector;
          var parentDocument = parentSelector && parentSelector().ownerDocument || document;
          bodyOpenClassName && classList.add(parentDocument.body, bodyOpenClassName);
          htmlOpenClassName && classList.add(parentDocument.getElementsByTagName("html")[0], htmlOpenClassName);
          if (ariaHideApp) {
            ariaHiddenInstances += 1;
            ariaAppHider.hide(appElement);
          }
          _portalOpenInstances2.default.register(this);
        }
        // Don't steal focus from inner elements
      }, {
        key: "render",
        value: function render() {
          var _props2 = this.props, id = _props2.id, className = _props2.className, overlayClassName = _props2.overlayClassName, defaultStyles2 = _props2.defaultStyles, children = _props2.children;
          var contentStyles = className ? {} : defaultStyles2.content;
          var overlayStyles = overlayClassName ? {} : defaultStyles2.overlay;
          if (this.shouldBeClosed()) {
            return null;
          }
          var overlayProps = {
            ref: this.setOverlayRef,
            className: this.buildClassName("overlay", overlayClassName),
            style: _extends3({}, overlayStyles, this.props.style.overlay),
            onClick: this.handleOverlayOnClick,
            onMouseDown: this.handleOverlayOnMouseDown
          };
          var contentProps = _extends3({
            id,
            ref: this.setContentRef,
            style: _extends3({}, contentStyles, this.props.style.content),
            className: this.buildClassName("content", className),
            tabIndex: "-1",
            onKeyDown: this.handleKeyDown,
            onMouseDown: this.handleContentOnMouseDown,
            onMouseUp: this.handleContentOnMouseUp,
            onClick: this.handleContentOnClick,
            role: this.props.role,
            "aria-label": this.props.contentLabel
          }, this.attributesFromObject("aria", _extends3({ modal: true }, this.props.aria)), this.attributesFromObject("data", this.props.data || {}), {
            "data-testid": this.props.testId
          });
          var contentElement = this.props.contentElement(contentProps, children);
          return this.props.overlayElement(overlayProps, contentElement);
        }
      }]);
      return ModalPortal2;
    }(_react.Component);
    ModalPortal.defaultProps = {
      style: {
        overlay: {},
        content: {}
      },
      defaultStyles: {}
    };
    ModalPortal.propTypes = {
      isOpen: _propTypes2.default.bool.isRequired,
      defaultStyles: _propTypes2.default.shape({
        content: _propTypes2.default.object,
        overlay: _propTypes2.default.object
      }),
      style: _propTypes2.default.shape({
        content: _propTypes2.default.object,
        overlay: _propTypes2.default.object
      }),
      className: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.object]),
      overlayClassName: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.object]),
      parentSelector: _propTypes2.default.func,
      bodyOpenClassName: _propTypes2.default.string,
      htmlOpenClassName: _propTypes2.default.string,
      ariaHideApp: _propTypes2.default.bool,
      appElement: _propTypes2.default.oneOfType([_propTypes2.default.instanceOf(_safeHTMLElement2.default), _propTypes2.default.instanceOf(_safeHTMLElement.SafeHTMLCollection), _propTypes2.default.instanceOf(_safeHTMLElement.SafeNodeList), _propTypes2.default.arrayOf(_propTypes2.default.instanceOf(_safeHTMLElement2.default))]),
      onAfterOpen: _propTypes2.default.func,
      onAfterClose: _propTypes2.default.func,
      onRequestClose: _propTypes2.default.func,
      closeTimeoutMS: _propTypes2.default.number,
      shouldFocusAfterRender: _propTypes2.default.bool,
      shouldCloseOnOverlayClick: _propTypes2.default.bool,
      shouldReturnFocusAfterClose: _propTypes2.default.bool,
      preventScroll: _propTypes2.default.bool,
      role: _propTypes2.default.string,
      contentLabel: _propTypes2.default.string,
      aria: _propTypes2.default.object,
      data: _propTypes2.default.object,
      children: _propTypes2.default.node,
      shouldCloseOnEsc: _propTypes2.default.bool,
      overlayRef: _propTypes2.default.func,
      contentRef: _propTypes2.default.func,
      id: _propTypes2.default.string,
      overlayElement: _propTypes2.default.func,
      contentElement: _propTypes2.default.func,
      testId: _propTypes2.default.string
    };
    exports.default = ModalPortal;
    module.exports = exports["default"];
  }
});

// node_modules/react-lifecycles-compat/react-lifecycles-compat.es.js
var react_lifecycles_compat_es_exports = {};
__export(react_lifecycles_compat_es_exports, {
  polyfill: () => polyfill
});
function componentWillMount() {
  var state = this.constructor.getDerivedStateFromProps(this.props, this.state);
  if (state !== null && state !== void 0) {
    this.setState(state);
  }
}
function componentWillReceiveProps(nextProps) {
  function updater(prevState) {
    var state = this.constructor.getDerivedStateFromProps(nextProps, prevState);
    return state !== null && state !== void 0 ? state : null;
  }
  this.setState(updater.bind(this));
}
function componentWillUpdate(nextProps, nextState) {
  try {
    var prevProps = this.props;
    var prevState = this.state;
    this.props = nextProps;
    this.state = nextState;
    this.__reactInternalSnapshotFlag = true;
    this.__reactInternalSnapshot = this.getSnapshotBeforeUpdate(
      prevProps,
      prevState
    );
  } finally {
    this.props = prevProps;
    this.state = prevState;
  }
}
function polyfill(Component2) {
  var prototype = Component2.prototype;
  if (!prototype || !prototype.isReactComponent) {
    throw new Error("Can only polyfill class components");
  }
  if (typeof Component2.getDerivedStateFromProps !== "function" && typeof prototype.getSnapshotBeforeUpdate !== "function") {
    return Component2;
  }
  var foundWillMountName = null;
  var foundWillReceivePropsName = null;
  var foundWillUpdateName = null;
  if (typeof prototype.componentWillMount === "function") {
    foundWillMountName = "componentWillMount";
  } else if (typeof prototype.UNSAFE_componentWillMount === "function") {
    foundWillMountName = "UNSAFE_componentWillMount";
  }
  if (typeof prototype.componentWillReceiveProps === "function") {
    foundWillReceivePropsName = "componentWillReceiveProps";
  } else if (typeof prototype.UNSAFE_componentWillReceiveProps === "function") {
    foundWillReceivePropsName = "UNSAFE_componentWillReceiveProps";
  }
  if (typeof prototype.componentWillUpdate === "function") {
    foundWillUpdateName = "componentWillUpdate";
  } else if (typeof prototype.UNSAFE_componentWillUpdate === "function") {
    foundWillUpdateName = "UNSAFE_componentWillUpdate";
  }
  if (foundWillMountName !== null || foundWillReceivePropsName !== null || foundWillUpdateName !== null) {
    var componentName = Component2.displayName || Component2.name;
    var newApiName = typeof Component2.getDerivedStateFromProps === "function" ? "getDerivedStateFromProps()" : "getSnapshotBeforeUpdate()";
    throw Error(
      "Unsafe legacy lifecycles will not be called for components using new component APIs.\n\n" + componentName + " uses " + newApiName + " but also contains the following legacy lifecycles:" + (foundWillMountName !== null ? "\n  " + foundWillMountName : "") + (foundWillReceivePropsName !== null ? "\n  " + foundWillReceivePropsName : "") + (foundWillUpdateName !== null ? "\n  " + foundWillUpdateName : "") + "\n\nThe above lifecycles should be removed. Learn more about this warning here:\nhttps://fb.me/react-async-component-lifecycle-hooks"
    );
  }
  if (typeof Component2.getDerivedStateFromProps === "function") {
    prototype.componentWillMount = componentWillMount;
    prototype.componentWillReceiveProps = componentWillReceiveProps;
  }
  if (typeof prototype.getSnapshotBeforeUpdate === "function") {
    if (typeof prototype.componentDidUpdate !== "function") {
      throw new Error(
        "Cannot polyfill getSnapshotBeforeUpdate() for components that do not define componentDidUpdate() on the prototype"
      );
    }
    prototype.componentWillUpdate = componentWillUpdate;
    var componentDidUpdate = prototype.componentDidUpdate;
    prototype.componentDidUpdate = function componentDidUpdatePolyfill(prevProps, prevState, maybeSnapshot) {
      var snapshot = this.__reactInternalSnapshotFlag ? this.__reactInternalSnapshot : maybeSnapshot;
      componentDidUpdate.call(this, prevProps, prevState, snapshot);
    };
  }
  return Component2;
}
var init_react_lifecycles_compat_es = __esm({
  "node_modules/react-lifecycles-compat/react-lifecycles-compat.es.js"() {
    componentWillMount.__suppressDeprecationWarning = true;
    componentWillReceiveProps.__suppressDeprecationWarning = true;
    componentWillUpdate.__suppressDeprecationWarning = true;
  }
});

// node_modules/react-modal/lib/components/Modal.js
var require_Modal = __commonJS({
  "node_modules/react-modal/lib/components/Modal.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.bodyOpenClassName = exports.portalClassName = void 0;
    var _extends3 = Object.assign || function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    var _createClass2 = function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor)
            descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps)
          defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
          defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();
    var _react = require_react();
    var _react2 = _interopRequireDefault(_react);
    var _reactDom = require_react_dom();
    var _reactDom2 = _interopRequireDefault(_reactDom);
    var _propTypes = require_prop_types();
    var _propTypes2 = _interopRequireDefault(_propTypes);
    var _ModalPortal = require_ModalPortal();
    var _ModalPortal2 = _interopRequireDefault(_ModalPortal);
    var _ariaAppHider = require_ariaAppHider();
    var ariaAppHider = _interopRequireWildcard(_ariaAppHider);
    var _safeHTMLElement = require_safeHTMLElement();
    var _safeHTMLElement2 = _interopRequireDefault(_safeHTMLElement);
    var _reactLifecyclesCompat = (init_react_lifecycles_compat_es(), __toCommonJS(react_lifecycles_compat_es_exports));
    function _interopRequireWildcard(obj) {
      if (obj && obj.__esModule) {
        return obj;
      } else {
        var newObj = {};
        if (obj != null) {
          for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key))
              newObj[key] = obj[key];
          }
        }
        newObj.default = obj;
        return newObj;
      }
    }
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck2(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn2(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits2(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var portalClassName = exports.portalClassName = "ReactModalPortal";
    var bodyOpenClassName = exports.bodyOpenClassName = "ReactModal__Body--open";
    var isReact16 = _safeHTMLElement.canUseDOM && _reactDom2.default.createPortal !== void 0;
    var createHTMLElement = function createHTMLElement2(name) {
      return document.createElement(name);
    };
    var getCreatePortal = function getCreatePortal2() {
      return isReact16 ? _reactDom2.default.createPortal : _reactDom2.default.unstable_renderSubtreeIntoContainer;
    };
    function getParentElement(parentSelector) {
      return parentSelector();
    }
    var Modal2 = function(_Component) {
      _inherits2(Modal3, _Component);
      function Modal3() {
        var _ref3;
        var _temp, _this, _ret;
        _classCallCheck2(this, Modal3);
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        return _ret = (_temp = (_this = _possibleConstructorReturn2(this, (_ref3 = Modal3.__proto__ || Object.getPrototypeOf(Modal3)).call.apply(_ref3, [this].concat(args))), _this), _this.removePortal = function() {
          !isReact16 && _reactDom2.default.unmountComponentAtNode(_this.node);
          var parent = getParentElement(_this.props.parentSelector);
          if (parent && parent.contains(_this.node)) {
            parent.removeChild(_this.node);
          } else {
            console.warn('React-Modal: "parentSelector" prop did not returned any DOM element. Make sure that the parent element is unmounted to avoid any memory leaks.');
          }
        }, _this.portalRef = function(ref) {
          _this.portal = ref;
        }, _this.renderPortal = function(props) {
          var createPortal2 = getCreatePortal();
          var portal = createPortal2(_this, _react2.default.createElement(_ModalPortal2.default, _extends3({ defaultStyles: Modal3.defaultStyles }, props)), _this.node);
          _this.portalRef(portal);
        }, _temp), _possibleConstructorReturn2(_this, _ret);
      }
      _createClass2(Modal3, [{
        key: "componentDidMount",
        value: function componentDidMount() {
          if (!_safeHTMLElement.canUseDOM)
            return;
          if (!isReact16) {
            this.node = createHTMLElement("div");
          }
          this.node.className = this.props.portalClassName;
          var parent = getParentElement(this.props.parentSelector);
          parent.appendChild(this.node);
          !isReact16 && this.renderPortal(this.props);
        }
      }, {
        key: "getSnapshotBeforeUpdate",
        value: function getSnapshotBeforeUpdate(prevProps) {
          var prevParent = getParentElement(prevProps.parentSelector);
          var nextParent = getParentElement(this.props.parentSelector);
          return { prevParent, nextParent };
        }
      }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate(prevProps, _, snapshot) {
          if (!_safeHTMLElement.canUseDOM)
            return;
          var _props = this.props, isOpen = _props.isOpen, portalClassName2 = _props.portalClassName;
          if (prevProps.portalClassName !== portalClassName2) {
            this.node.className = portalClassName2;
          }
          var prevParent = snapshot.prevParent, nextParent = snapshot.nextParent;
          if (nextParent !== prevParent) {
            prevParent.removeChild(this.node);
            nextParent.appendChild(this.node);
          }
          if (!prevProps.isOpen && !isOpen)
            return;
          !isReact16 && this.renderPortal(this.props);
        }
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          if (!_safeHTMLElement.canUseDOM || !this.node || !this.portal)
            return;
          var state = this.portal.state;
          var now = Date.now();
          var closesAt = state.isOpen && this.props.closeTimeoutMS && (state.closesAt || now + this.props.closeTimeoutMS);
          if (closesAt) {
            if (!state.beforeClose) {
              this.portal.closeWithTimeout();
            }
            setTimeout(this.removePortal, closesAt - now);
          } else {
            this.removePortal();
          }
        }
      }, {
        key: "render",
        value: function render() {
          if (!_safeHTMLElement.canUseDOM || !isReact16) {
            return null;
          }
          if (!this.node && isReact16) {
            this.node = createHTMLElement("div");
          }
          var createPortal2 = getCreatePortal();
          return createPortal2(_react2.default.createElement(_ModalPortal2.default, _extends3({
            ref: this.portalRef,
            defaultStyles: Modal3.defaultStyles
          }, this.props)), this.node);
        }
      }], [{
        key: "setAppElement",
        value: function setAppElement(element) {
          ariaAppHider.setElement(element);
        }
        /* eslint-disable react/no-unused-prop-types */
        /* eslint-enable react/no-unused-prop-types */
      }]);
      return Modal3;
    }(_react.Component);
    Modal2.propTypes = {
      isOpen: _propTypes2.default.bool.isRequired,
      style: _propTypes2.default.shape({
        content: _propTypes2.default.object,
        overlay: _propTypes2.default.object
      }),
      portalClassName: _propTypes2.default.string,
      bodyOpenClassName: _propTypes2.default.string,
      htmlOpenClassName: _propTypes2.default.string,
      className: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.shape({
        base: _propTypes2.default.string.isRequired,
        afterOpen: _propTypes2.default.string.isRequired,
        beforeClose: _propTypes2.default.string.isRequired
      })]),
      overlayClassName: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.shape({
        base: _propTypes2.default.string.isRequired,
        afterOpen: _propTypes2.default.string.isRequired,
        beforeClose: _propTypes2.default.string.isRequired
      })]),
      appElement: _propTypes2.default.oneOfType([_propTypes2.default.instanceOf(_safeHTMLElement2.default), _propTypes2.default.instanceOf(_safeHTMLElement.SafeHTMLCollection), _propTypes2.default.instanceOf(_safeHTMLElement.SafeNodeList), _propTypes2.default.arrayOf(_propTypes2.default.instanceOf(_safeHTMLElement2.default))]),
      onAfterOpen: _propTypes2.default.func,
      onRequestClose: _propTypes2.default.func,
      closeTimeoutMS: _propTypes2.default.number,
      ariaHideApp: _propTypes2.default.bool,
      shouldFocusAfterRender: _propTypes2.default.bool,
      shouldCloseOnOverlayClick: _propTypes2.default.bool,
      shouldReturnFocusAfterClose: _propTypes2.default.bool,
      preventScroll: _propTypes2.default.bool,
      parentSelector: _propTypes2.default.func,
      aria: _propTypes2.default.object,
      data: _propTypes2.default.object,
      role: _propTypes2.default.string,
      contentLabel: _propTypes2.default.string,
      shouldCloseOnEsc: _propTypes2.default.bool,
      overlayRef: _propTypes2.default.func,
      contentRef: _propTypes2.default.func,
      id: _propTypes2.default.string,
      overlayElement: _propTypes2.default.func,
      contentElement: _propTypes2.default.func
    };
    Modal2.defaultProps = {
      isOpen: false,
      portalClassName,
      bodyOpenClassName,
      role: "dialog",
      ariaHideApp: true,
      closeTimeoutMS: 0,
      shouldFocusAfterRender: true,
      shouldCloseOnEsc: true,
      shouldCloseOnOverlayClick: true,
      shouldReturnFocusAfterClose: true,
      preventScroll: false,
      parentSelector: function parentSelector() {
        return document.body;
      },
      overlayElement: function overlayElement(props, contentEl) {
        return _react2.default.createElement(
          "div",
          props,
          contentEl
        );
      },
      contentElement: function contentElement(props, children) {
        return _react2.default.createElement(
          "div",
          props,
          children
        );
      }
    };
    Modal2.defaultStyles = {
      overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.75)"
      },
      content: {
        position: "absolute",
        top: "40px",
        left: "40px",
        right: "40px",
        bottom: "40px",
        border: "1px solid #ccc",
        background: "#fff",
        overflow: "auto",
        WebkitOverflowScrolling: "touch",
        borderRadius: "4px",
        outline: "none",
        padding: "20px"
      }
    };
    (0, _reactLifecyclesCompat.polyfill)(Modal2);
    if (true) {
      Modal2.setCreateHTMLElement = function(fn) {
        return createHTMLElement = fn;
      };
    }
    exports.default = Modal2;
  }
});

// node_modules/react-modal/lib/index.js
var require_lib7 = __commonJS({
  "node_modules/react-modal/lib/index.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _Modal = require_Modal();
    var _Modal2 = _interopRequireDefault(_Modal);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    exports.default = _Modal2.default;
    module.exports = exports["default"];
  }
});

// empty-module:~/session.server
var require_session = __commonJS({
  "empty-module:~/session.server"(exports, module) {
    module.exports = {};
  }
});

// node_modules/discord-api-types/v10.mjs
var import_v10 = __toESM(require_v106(), 1);
var APIApplicationCommandPermissionsConstant = import_v10.default.APIApplicationCommandPermissionsConstant;
var APIVersion = import_v10.default.APIVersion;
var ActivityFlags = import_v10.default.ActivityFlags;
var ActivityPlatform = import_v10.default.ActivityPlatform;
var ActivityType = import_v10.default.ActivityType;
var AllowedMentionsTypes = import_v10.default.AllowedMentionsTypes;
var ApplicationCommandOptionType = import_v10.default.ApplicationCommandOptionType;
var ApplicationCommandPermissionType = import_v10.default.ApplicationCommandPermissionType;
var ApplicationCommandType = import_v10.default.ApplicationCommandType;
var ApplicationFlags = import_v10.default.ApplicationFlags;
var ApplicationRoleConnectionMetadataType = import_v10.default.ApplicationRoleConnectionMetadataType;
var AttachmentFlags = import_v10.default.AttachmentFlags;
var AuditLogEvent = import_v10.default.AuditLogEvent;
var AuditLogOptionsType = import_v10.default.AuditLogOptionsType;
var AutoModerationActionType = import_v10.default.AutoModerationActionType;
var AutoModerationRuleEventType = import_v10.default.AutoModerationRuleEventType;
var AutoModerationRuleKeywordPresetType = import_v10.default.AutoModerationRuleKeywordPresetType;
var AutoModerationRuleTriggerType = import_v10.default.AutoModerationRuleTriggerType;
var ButtonStyle = import_v10.default.ButtonStyle;
var CDNRoutes = import_v10.default.CDNRoutes;
var ChannelFlags = import_v10.default.ChannelFlags;
var ChannelType = import_v10.default.ChannelType;
var ComponentType = import_v10.default.ComponentType;
var ConnectionService = import_v10.default.ConnectionService;
var ConnectionVisibility = import_v10.default.ConnectionVisibility;
var EmbedType = import_v10.default.EmbedType;
var EntitlementOwnerType = import_v10.default.EntitlementOwnerType;
var EntitlementType = import_v10.default.EntitlementType;
var FormattingPatterns = import_v10.default.FormattingPatterns;
var ForumLayoutType = import_v10.default.ForumLayoutType;
var GatewayCloseCodes = import_v10.default.GatewayCloseCodes;
var GatewayDispatchEvents = import_v10.default.GatewayDispatchEvents;
var GatewayIntentBits = import_v10.default.GatewayIntentBits;
var GatewayOpcodes = import_v10.default.GatewayOpcodes;
var GatewayVersion = import_v10.default.GatewayVersion;
var GuildDefaultMessageNotifications = import_v10.default.GuildDefaultMessageNotifications;
var GuildExplicitContentFilter = import_v10.default.GuildExplicitContentFilter;
var GuildFeature = import_v10.default.GuildFeature;
var GuildHubType = import_v10.default.GuildHubType;
var GuildMFALevel = import_v10.default.GuildMFALevel;
var GuildMemberFlags = import_v10.default.GuildMemberFlags;
var GuildNSFWLevel = import_v10.default.GuildNSFWLevel;
var GuildOnboardingMode = import_v10.default.GuildOnboardingMode;
var GuildOnboardingPromptType = import_v10.default.GuildOnboardingPromptType;
var GuildPremiumTier = import_v10.default.GuildPremiumTier;
var GuildScheduledEventEntityType = import_v10.default.GuildScheduledEventEntityType;
var GuildScheduledEventPrivacyLevel = import_v10.default.GuildScheduledEventPrivacyLevel;
var GuildScheduledEventStatus = import_v10.default.GuildScheduledEventStatus;
var GuildSystemChannelFlags = import_v10.default.GuildSystemChannelFlags;
var GuildVerificationLevel = import_v10.default.GuildVerificationLevel;
var GuildWidgetStyle = import_v10.default.GuildWidgetStyle;
var ImageFormat = import_v10.default.ImageFormat;
var IntegrationExpireBehavior = import_v10.default.IntegrationExpireBehavior;
var InteractionResponseType = import_v10.default.InteractionResponseType;
var InteractionType = import_v10.default.InteractionType;
var InviteTargetType = import_v10.default.InviteTargetType;
var Locale = import_v10.default.Locale;
var MembershipScreeningFieldType = import_v10.default.MembershipScreeningFieldType;
var MessageActivityType = import_v10.default.MessageActivityType;
var MessageFlags = import_v10.default.MessageFlags;
var MessageType = import_v10.default.MessageType;
var OAuth2Routes = import_v10.default.OAuth2Routes;
var OAuth2Scopes = import_v10.default.OAuth2Scopes;
var OverwriteType = import_v10.default.OverwriteType;
var PermissionFlagsBits = import_v10.default.PermissionFlagsBits;
var PresenceUpdateStatus = import_v10.default.PresenceUpdateStatus;
var RESTJSONErrorCodes = import_v10.default.RESTJSONErrorCodes;
var RPCCloseEventCodes = import_v10.default.RPCCloseEventCodes;
var RPCErrorCodes = import_v10.default.RPCErrorCodes;
var RoleFlags = import_v10.default.RoleFlags;
var RouteBases = import_v10.default.RouteBases;
var Routes = import_v10.default.Routes;
var SKUFlags = import_v10.default.SKUFlags;
var SKUType = import_v10.default.SKUType;
var SelectMenuDefaultValueType = import_v10.default.SelectMenuDefaultValueType;
var SortOrderType = import_v10.default.SortOrderType;
var StageInstancePrivacyLevel = import_v10.default.StageInstancePrivacyLevel;
var StickerFormatType = import_v10.default.StickerFormatType;
var StickerPackApplicationId = import_v10.default.StickerPackApplicationId;
var StickerType = import_v10.default.StickerType;
var TeamMemberMembershipState = import_v10.default.TeamMemberMembershipState;
var TeamMemberRole = import_v10.default.TeamMemberRole;
var TextInputStyle = import_v10.default.TextInputStyle;
var ThreadAutoArchiveDuration = import_v10.default.ThreadAutoArchiveDuration;
var ThreadMemberFlags = import_v10.default.ThreadMemberFlags;
var UserFlags = import_v10.default.UserFlags;
var UserPremiumType = import_v10.default.UserPremiumType;
var Utils = import_v10.default.Utils;
var VideoQualityMode = import_v10.default.VideoQualityMode;
var WebhookType = import_v10.default.WebhookType;

// app/components/CoolIcon.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\components\\\\CoolIcon.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\components\\CoolIcon.tsx"
  );
  import.meta.hot.lastModified = "1696096520430.0425";
}
var CoolIcon = ({
  icon,
  title,
  className
}) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("i", { title, className: `ci-${icon} ${className ?? ""}`.trim() }, void 0, false, {
  fileName: "app/components/CoolIcon.tsx",
  lineNumber: 25,
  columnNumber: 7
}, this);
_c = CoolIcon;
var _c;
$RefreshReg$(_c, "CoolIcon");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// node_modules/@sapphire/snowflake/dist/esm/index.mjs
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var IncrementSymbol = Symbol("@sapphire/snowflake.increment");
var EpochSymbol = Symbol("@sapphire/snowflake.epoch");
var ProcessIdSymbol = Symbol("@sapphire/snowflake.processId");
var WorkerIdSymbol = Symbol("@sapphire/snowflake.workerId");
var MaximumWorkerId = 0b11111n;
var MaximumProcessId = 0b11111n;
var MaximumIncrement = 0b111111111111n;
var _a;
var _b;
var _c2;
var _d;
var _Snowflake = class _Snowflake2 {
  /**
   * @param epoch the epoch to use
   */
  constructor(epoch) {
    __publicField(this, "decode", this.deconstruct);
    __publicField(this, _a);
    __publicField(this, _b, 0n);
    __publicField(this, _c2, 1n);
    __publicField(this, _d, 0n);
    this[EpochSymbol] = BigInt(epoch instanceof Date ? epoch.getTime() : epoch);
  }
  /**
   * The epoch for this snowflake
   */
  get epoch() {
    return this[EpochSymbol];
  }
  /**
   * Gets the configured process ID
   */
  get processId() {
    return this[ProcessIdSymbol];
  }
  /**
   * Sets the process ID that will be used by default for the {@link generate} method
   * @param value The new value, will be coerced to BigInt and masked with `0b11111n`
   */
  set processId(value) {
    this[ProcessIdSymbol] = BigInt(value) & MaximumProcessId;
  }
  /**
   * Gets the configured worker ID
   */
  get workerId() {
    return this[WorkerIdSymbol];
  }
  /**
   * Sets the worker ID that will be used by default for the {@link generate} method
   * @param value The new value, will be coerced to BigInt and masked with `0b11111n`
   */
  set workerId(value) {
    this[WorkerIdSymbol] = BigInt(value) & MaximumWorkerId;
  }
  /**
   * Generates a snowflake given an epoch and optionally a timestamp
   * @param options options to pass into the generator, see {@link SnowflakeGenerateOptions}
   *
   * **note** when `increment` is not provided it defaults to the private `increment` of the instance
   * @example
   * ```typescript
   * const epoch = new Date('2000-01-01T00:00:00.000Z');
   * const snowflake = new Snowflake(epoch).generate();
   * ```
   * @returns A unique snowflake
   */
  generate({
    increment,
    timestamp = Date.now(),
    workerId = this[WorkerIdSymbol],
    processId = this[ProcessIdSymbol]
  } = {}) {
    if (timestamp instanceof Date)
      timestamp = BigInt(timestamp.getTime());
    else if (typeof timestamp === "number")
      timestamp = BigInt(timestamp);
    else if (typeof timestamp !== "bigint") {
      throw new TypeError(`"timestamp" argument must be a number, bigint, or Date (received ${typeof timestamp})`);
    }
    if (typeof increment !== "bigint") {
      increment = this[IncrementSymbol];
      this[IncrementSymbol] = increment + 1n & MaximumIncrement;
    }
    return timestamp - this[EpochSymbol] << 22n | (workerId & MaximumWorkerId) << 17n | (processId & MaximumProcessId) << 12n | increment & MaximumIncrement;
  }
  /**
   * Deconstructs a snowflake given a snowflake ID
   * @param id the snowflake to deconstruct
   * @returns a deconstructed snowflake
   * @example
   * ```typescript
   * const epoch = new Date('2000-01-01T00:00:00.000Z');
   * const snowflake = new Snowflake(epoch).deconstruct('3971046231244935168');
   * ```
   */
  deconstruct(id) {
    const bigIntId = BigInt(id);
    const epoch = this[EpochSymbol];
    return {
      id: bigIntId,
      timestamp: (bigIntId >> 22n) + epoch,
      workerId: bigIntId >> 17n & MaximumWorkerId,
      processId: bigIntId >> 12n & MaximumProcessId,
      increment: bigIntId & MaximumIncrement,
      epoch
    };
  }
  /**
   * Retrieves the timestamp field's value from a snowflake.
   * @param id The snowflake to get the timestamp value from.
   * @returns The UNIX timestamp that is stored in `id`.
   */
  timestampFrom(id) {
    return Number((BigInt(id) >> 22n) + this[EpochSymbol]);
  }
  /**
   * Returns a number indicating whether a reference snowflake comes before, or after, or is same as the given
   * snowflake in sort order.
   * @param a The first snowflake to compare.
   * @param b The second snowflake to compare.
   * @returns `-1` if `a` is older than `b`, `0` if `a` and `b` are equals, `1` if `a` is newer than `b`.
   * @example Sort snowflakes in ascending order
   * ```typescript
   * const ids = ['737141877803057244', '1056191128120082432', '254360814063058944'];
   * console.log(ids.sort((a, b) => Snowflake.compare(a, b)));
   * // → ['254360814063058944', '737141877803057244', '1056191128120082432'];
   * ```
   * @example Sort snowflakes in descending order
   * ```typescript
   * const ids = ['737141877803057244', '1056191128120082432', '254360814063058944'];
   * console.log(ids.sort((a, b) => -Snowflake.compare(a, b)));
   * // → ['1056191128120082432', '737141877803057244', '254360814063058944'];
   * ```
   */
  static compare(a, b) {
    const typeA = typeof a;
    return typeA === typeof b ? typeA === "string" ? cmpString(a, b) : cmpBigInt(a, b) : cmpBigInt(BigInt(a), BigInt(b));
  }
};
_a = EpochSymbol, _b = IncrementSymbol, _c2 = ProcessIdSymbol, _d = WorkerIdSymbol;
__name(_Snowflake, "Snowflake");
var Snowflake = _Snowflake;
function cmpBigInt(a, b) {
  return a === b ? 0 : a < b ? -1 : 1;
}
__name(cmpBigInt, "cmpBigInt");
function cmpString(a, b) {
  return a === b ? 0 : a.length < b.length ? -1 : a.length > b.length ? 1 : a < b ? -1 : 1;
}
__name(cmpString, "cmpString");
var DiscordSnowflake = new Snowflake(1420070400000n);
var TwitterSnowflake = new Snowflake(1288834974657n);

// app/util/discord.ts
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\util\\discord.ts"
  );
  import.meta.hot.lastModified = "1696086589878.2737";
}
var DISCORD_API = "https://discord.com/api";
var DISCORD_API_V = "10";
var getSnowflakeDate = (snowflake) => new Date(Number(DiscordSnowflake.deconstruct(snowflake).timestamp));
var discordRequest = async (method, route, options2) => {
  const search = options2?.query ? "?" + options2.query.toString() : "";
  const init = options2?.init ?? {};
  return await fetch(`${DISCORD_API}/v${DISCORD_API_V}${route}${search}`, {
    method,
    ...init
  });
};
var getWebhook = async (id, token2) => {
  const data = await discordRequest("GET", `/webhooks/${id}/${token2}`);
  return await data.json();
};
var getWebhookMessage = async (webhookId, webhookToken, messageId, threadId) => {
  const query = threadId ? new URLSearchParams({ thread_id: threadId }) : void 0;
  const data = await discordRequest(
    "GET",
    `/webhooks/${webhookId}/${webhookToken}/messages/${messageId}`,
    { query }
  );
  return await data.json();
};
var executeWebhook = async (webhookId, webhookToken, payload, files, threadId) => {
  const query = new URLSearchParams({ wait: "true" });
  if (threadId) {
    query.set("thread_id", threadId);
  }
  const data = await discordRequest(
    "POST",
    `/webhooks/${webhookId}/${webhookToken}`,
    {
      query,
      init: {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": files && files.length > 0 ? "multipart/form-data" : "application/json"
        }
        // files,
      }
    }
  );
  return await data.json();
};
var updateWebhookMessage = async (webhookId, webhookToken, messageId, payload, files, threadId) => {
  const query = new URLSearchParams();
  if (threadId) {
    query.set("thread_id", threadId);
  }
  const data = await discordRequest(
    "PATCH",
    `/webhooks/${webhookId}/${webhookToken}/messages/${messageId}`,
    {
      query,
      init: {
        body: JSON.stringify(payload),
        // files,
        headers: {
          "Content-Type": files && files.length > 0 ? "multipart/form-data" : "application/json"
        }
      }
    }
  );
  return await data.json();
};
var modifyWebhook = async (webhookId, webhookToken, payload, reason) => {
  const data = await discordRequest(
    "PATCH",
    `/webhooks/${webhookId}/${webhookToken}`,
    {
      init: {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          ...reason ? {
            "X-Audit-Log-Reason": reason
          } : {}
        }
      }
    }
  );
  return await data.json();
};
var CDN = class {
  BASE = "https://cdn.discordapp.com";
  constructor() {
  }
  _withOpts(options2, defaultSize) {
    return `.${options2?.extension ?? "webp"}?size=${options2?.size ?? defaultSize ?? 1024}`;
  }
  avatar(id, avatarHash, options2) {
    return this.BASE + `/avatars/${id}/${avatarHash}` + this._withOpts(options2);
  }
  defaultAvatar(index2) {
    return this.BASE + `/embed/avatars/${index2}.png`;
  }
  emoji(id, extension2) {
    return this.BASE + `/emojis/${id}${extension2 ? `.${extension2}` : ""}`;
  }
};
var cdn = new CDN();

// node_modules/@twemoji/api/dist/twemoji.esm.js
var twemoji = function() {
  "use strict";
  var twemoji2 = { base: "https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.0.3/assets/", ext: ".png", size: "72x72", className: "emoji", convert: { fromCodePoint, toCodePoint }, onerror: function onerror() {
    if (this.parentNode) {
      this.parentNode.replaceChild(createText(this.alt, false), this);
    }
  }, parse: parse2, replace: replace2, test }, escaper = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }, re = /(?:\ud83d\udc68\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83e\uddd1\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c[\udffc-\udfff]|\ud83e\uddd1\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c[\udffb\udffd-\udfff]|\ud83e\uddd1\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c[\udffb\udffc\udffe\udfff]|\ud83e\uddd1\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c[\udffb-\udffd\udfff]|\ud83e\uddd1\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c[\udffb-\udffe]|\ud83d\udc68\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffc-\udfff]|\ud83d\udc68\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffd-\udfff]|\ud83d\udc68\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffc\udffe\udfff]|\ud83d\udc68\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffd\udfff]|\ud83d\udc68\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc68\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffe]|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffc-\udfff]|\ud83d\udc69\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffc-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffd-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb\udffd-\udfff]|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffc\udffe\udfff]|\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb\udffc\udffe\udfff]|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffd\udfff]|\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb-\udffd\udfff]|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c[\udffb-\udfff]|\ud83d\udc69\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffe]|\ud83d\udc69\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb-\udffe]|\ud83e\uddd1\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c[\udffc-\udfff]|\ud83e\uddd1\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udfff]|\ud83e\uddd1\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c[\udffb\udffd-\udfff]|\ud83e\uddd1\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udfff]|\ud83e\uddd1\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c[\udffb\udffc\udffe\udfff]|\ud83e\uddd1\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udfff]|\ud83e\uddd1\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c[\udffb-\udffd\udfff]|\ud83e\uddd1\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udfff]|\ud83e\uddd1\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c[\udffb-\udffe]|\ud83e\uddd1\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udfff]|\ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68|\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d[\udc68\udc69]|\ud83e\udef1\ud83c\udffb\u200d\ud83e\udef2\ud83c[\udffc-\udfff]|\ud83e\udef1\ud83c\udffc\u200d\ud83e\udef2\ud83c[\udffb\udffd-\udfff]|\ud83e\udef1\ud83c\udffd\u200d\ud83e\udef2\ud83c[\udffb\udffc\udffe\udfff]|\ud83e\udef1\ud83c\udffe\u200d\ud83e\udef2\ud83c[\udffb-\udffd\udfff]|\ud83e\udef1\ud83c\udfff\u200d\ud83e\udef2\ud83c[\udffb-\udffe]|\ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc68|\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d[\udc68\udc69]|\ud83e\uddd1\u200d\ud83e\udd1d\u200d\ud83e\uddd1|\ud83d\udc6b\ud83c[\udffb-\udfff]|\ud83d\udc6c\ud83c[\udffb-\udfff]|\ud83d\udc6d\ud83c[\udffb-\udfff]|\ud83d\udc8f\ud83c[\udffb-\udfff]|\ud83d\udc91\ud83c[\udffb-\udfff]|\ud83e\udd1d\ud83c[\udffb-\udfff]|\ud83d[\udc6b-\udc6d\udc8f\udc91]|\ud83e\udd1d)|(?:\ud83d[\udc68\udc69]|\ud83e\uddd1)(?:\ud83c[\udffb-\udfff])?\u200d(?:\u2695\ufe0f|\u2696\ufe0f|\u2708\ufe0f|\ud83c[\udf3e\udf73\udf7c\udf84\udf93\udfa4\udfa8\udfeb\udfed]|\ud83d[\udcbb\udcbc\udd27\udd2c\ude80\ude92]|\ud83e[\uddaf-\uddb3\uddbc\uddbd])|(?:\ud83c[\udfcb\udfcc]|\ud83d[\udd74\udd75]|\u26f9)((?:\ud83c[\udffb-\udfff]|\ufe0f)\u200d[\u2640\u2642]\ufe0f)|(?:\ud83c[\udfc3\udfc4\udfca]|\ud83d[\udc6e\udc70\udc71\udc73\udc77\udc81\udc82\udc86\udc87\ude45-\ude47\ude4b\ude4d\ude4e\udea3\udeb4-\udeb6]|\ud83e[\udd26\udd35\udd37-\udd39\udd3d\udd3e\uddb8\uddb9\uddcd-\uddcf\uddd4\uddd6-\udddd])(?:\ud83c[\udffb-\udfff])?\u200d[\u2640\u2642]\ufe0f|(?:\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83c\udff3\ufe0f\u200d\u26a7\ufe0f|\ud83c\udff3\ufe0f\u200d\ud83c\udf08|\ud83d\ude36\u200d\ud83c\udf2b\ufe0f|\u2764\ufe0f\u200d\ud83d\udd25|\u2764\ufe0f\u200d\ud83e\ude79|\ud83c\udff4\u200d\u2620\ufe0f|\ud83d\udc15\u200d\ud83e\uddba|\ud83d\udc3b\u200d\u2744\ufe0f|\ud83d\udc41\u200d\ud83d\udde8|\ud83d\udc68\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83d\udc6f\u200d\u2640\ufe0f|\ud83d\udc6f\u200d\u2642\ufe0f|\ud83d\ude2e\u200d\ud83d\udca8|\ud83d\ude35\u200d\ud83d\udcab|\ud83e\udd3c\u200d\u2640\ufe0f|\ud83e\udd3c\u200d\u2642\ufe0f|\ud83e\uddde\u200d\u2640\ufe0f|\ud83e\uddde\u200d\u2642\ufe0f|\ud83e\udddf\u200d\u2640\ufe0f|\ud83e\udddf\u200d\u2642\ufe0f|\ud83d\udc08\u200d\u2b1b|\ud83d\udc26\u200d\u2b1b)|[#*0-9]\ufe0f?\u20e3|(?:[©®\u2122\u265f]\ufe0f)|(?:\ud83c[\udc04\udd70\udd71\udd7e\udd7f\ude02\ude1a\ude2f\ude37\udf21\udf24-\udf2c\udf36\udf7d\udf96\udf97\udf99-\udf9b\udf9e\udf9f\udfcd\udfce\udfd4-\udfdf\udff3\udff5\udff7]|\ud83d[\udc3f\udc41\udcfd\udd49\udd4a\udd6f\udd70\udd73\udd76-\udd79\udd87\udd8a-\udd8d\udda5\udda8\uddb1\uddb2\uddbc\uddc2-\uddc4\uddd1-\uddd3\udddc-\uddde\udde1\udde3\udde8\uddef\uddf3\uddfa\udecb\udecd-\udecf\udee0-\udee5\udee9\udef0\udef3]|[\u203c\u2049\u2139\u2194-\u2199\u21a9\u21aa\u231a\u231b\u2328\u23cf\u23ed-\u23ef\u23f1\u23f2\u23f8-\u23fa\u24c2\u25aa\u25ab\u25b6\u25c0\u25fb-\u25fe\u2600-\u2604\u260e\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262a\u262e\u262f\u2638-\u263a\u2640\u2642\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267b\u267f\u2692-\u2697\u2699\u269b\u269c\u26a0\u26a1\u26a7\u26aa\u26ab\u26b0\u26b1\u26bd\u26be\u26c4\u26c5\u26c8\u26cf\u26d1\u26d3\u26d4\u26e9\u26ea\u26f0-\u26f5\u26f8\u26fa\u26fd\u2702\u2708\u2709\u270f\u2712\u2714\u2716\u271d\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u2764\u27a1\u2934\u2935\u2b05-\u2b07\u2b1b\u2b1c\u2b50\u2b55\u3030\u303d\u3297\u3299])(?:\ufe0f|(?!\ufe0e))|(?:(?:\ud83c[\udfcb\udfcc]|\ud83d[\udd74\udd75\udd90]|\ud83e\udef0|[\u261d\u26f7\u26f9\u270c\u270d])(?:\ufe0f|(?!\ufe0e))|(?:\ud83c[\udf85\udfc2-\udfc4\udfc7\udfca]|\ud83d[\udc42\udc43\udc46-\udc50\udc66-\udc69\udc6e\udc70-\udc78\udc7c\udc81-\udc83\udc85-\udc87\udcaa\udd7a\udd95\udd96\ude45-\ude47\ude4b-\ude4f\udea3\udeb4-\udeb6\udec0\udecc]|\ud83e[\udd0c\udd0f\udd18-\udd1c\udd1e\udd1f\udd26\udd30-\udd39\udd3d\udd3e\udd77\uddb5\uddb6\uddb8\uddb9\uddbb\uddcd-\uddcf\uddd1-\udddd\udec3-\udec5\udef1-\udef8]|[\u270a\u270b]))(?:\ud83c[\udffb-\udfff])?|(?:\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f|\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc73\udb40\udc63\udb40\udc74\udb40\udc7f|\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc77\udb40\udc6c\udb40\udc73\udb40\udc7f|\ud83c\udde6\ud83c[\udde8-\uddec\uddee\uddf1\uddf2\uddf4\uddf6-\uddfa\uddfc\uddfd\uddff]|\ud83c\udde7\ud83c[\udde6\udde7\udde9-\uddef\uddf1-\uddf4\uddf6-\uddf9\uddfb\uddfc\uddfe\uddff]|\ud83c\udde8\ud83c[\udde6\udde8\udde9\uddeb-\uddee\uddf0-\uddf5\uddf7\uddfa-\uddff]|\ud83c\udde9\ud83c[\uddea\uddec\uddef\uddf0\uddf2\uddf4\uddff]|\ud83c\uddea\ud83c[\udde6\udde8\uddea\uddec\udded\uddf7-\uddfa]|\ud83c\uddeb\ud83c[\uddee-\uddf0\uddf2\uddf4\uddf7]|\ud83c\uddec\ud83c[\udde6\udde7\udde9-\uddee\uddf1-\uddf3\uddf5-\uddfa\uddfc\uddfe]|\ud83c\udded\ud83c[\uddf0\uddf2\uddf3\uddf7\uddf9\uddfa]|\ud83c\uddee\ud83c[\udde8-\uddea\uddf1-\uddf4\uddf6-\uddf9]|\ud83c\uddef\ud83c[\uddea\uddf2\uddf4\uddf5]|\ud83c\uddf0\ud83c[\uddea\uddec-\uddee\uddf2\uddf3\uddf5\uddf7\uddfc\uddfe\uddff]|\ud83c\uddf1\ud83c[\udde6-\udde8\uddee\uddf0\uddf7-\uddfb\uddfe]|\ud83c\uddf2\ud83c[\udde6\udde8-\udded\uddf0-\uddff]|\ud83c\uddf3\ud83c[\udde6\udde8\uddea-\uddec\uddee\uddf1\uddf4\uddf5\uddf7\uddfa\uddff]|\ud83c\uddf4\ud83c\uddf2|\ud83c\uddf5\ud83c[\udde6\uddea-\udded\uddf0-\uddf3\uddf7-\uddf9\uddfc\uddfe]|\ud83c\uddf6\ud83c\udde6|\ud83c\uddf7\ud83c[\uddea\uddf4\uddf8\uddfa\uddfc]|\ud83c\uddf8\ud83c[\udde6-\uddea\uddec-\uddf4\uddf7-\uddf9\uddfb\uddfd-\uddff]|\ud83c\uddf9\ud83c[\udde6\udde8\udde9\uddeb-\udded\uddef-\uddf4\uddf7\uddf9\uddfb\uddfc\uddff]|\ud83c\uddfa\ud83c[\udde6\uddec\uddf2\uddf3\uddf8\uddfe\uddff]|\ud83c\uddfb\ud83c[\udde6\udde8\uddea\uddec\uddee\uddf3\uddfa]|\ud83c\uddfc\ud83c[\uddeb\uddf8]|\ud83c\uddfd\ud83c\uddf0|\ud83c\uddfe\ud83c[\uddea\uddf9]|\ud83c\uddff\ud83c[\udde6\uddf2\uddfc]|\ud83c[\udccf\udd8e\udd91-\udd9a\udde6-\uddff\ude01\ude32-\ude36\ude38-\ude3a\ude50\ude51\udf00-\udf20\udf2d-\udf35\udf37-\udf7c\udf7e-\udf84\udf86-\udf93\udfa0-\udfc1\udfc5\udfc6\udfc8\udfc9\udfcf-\udfd3\udfe0-\udff0\udff4\udff8-\udfff]|\ud83d[\udc00-\udc3e\udc40\udc44\udc45\udc51-\udc65\udc6a\udc6f\udc79-\udc7b\udc7d-\udc80\udc84\udc88-\udc8e\udc90\udc92-\udca9\udcab-\udcfc\udcff-\udd3d\udd4b-\udd4e\udd50-\udd67\udda4\uddfb-\ude44\ude48-\ude4a\ude80-\udea2\udea4-\udeb3\udeb7-\udebf\udec1-\udec5\uded0-\uded2\uded5-\uded7\udedc-\udedf\udeeb\udeec\udef4-\udefc\udfe0-\udfeb\udff0]|\ud83e[\udd0d\udd0e\udd10-\udd17\udd20-\udd25\udd27-\udd2f\udd3a\udd3c\udd3f-\udd45\udd47-\udd76\udd78-\uddb4\uddb7\uddba\uddbc-\uddcc\uddd0\uddde-\uddff\ude70-\ude7c\ude80-\ude88\ude90-\udebd\udebf-\udec2\udece-\udedb\udee0-\udee8]|[\u23e9-\u23ec\u23f0\u23f3\u267e\u26ce\u2705\u2728\u274c\u274e\u2753-\u2755\u2795-\u2797\u27b0\u27bf\ue50a])|\ufe0f/g, UFE0Fg = /\uFE0F/g, U200D = String.fromCharCode(8205), rescaper = /[&<>'"]/g, shouldntBeParsed = /^(?:iframe|noframes|noscript|script|select|style|textarea)$/, fromCharCode = String.fromCharCode;
  return twemoji2;
  function createText(text, clean) {
    return document.createTextNode(clean ? text.replace(UFE0Fg, "") : text);
  }
  function escapeHTML(s) {
    return s.replace(rescaper, replacer);
  }
  function defaultImageSrcGenerator(icon, options2) {
    return "".concat(options2.base, options2.size, "/", icon, options2.ext);
  }
  function grabAllTextNodes(node2, allText) {
    var childNodes = node2.childNodes, length2 = childNodes.length, subnode, nodeType;
    while (length2--) {
      subnode = childNodes[length2];
      nodeType = subnode.nodeType;
      if (nodeType === 3) {
        allText.push(subnode);
      } else if (nodeType === 1 && !("ownerSVGElement" in subnode) && !shouldntBeParsed.test(subnode.nodeName.toLowerCase())) {
        grabAllTextNodes(subnode, allText);
      }
    }
    return allText;
  }
  function grabTheRightIcon(rawText) {
    return toCodePoint(rawText.indexOf(U200D) < 0 ? rawText.replace(UFE0Fg, "") : rawText);
  }
  function parseNode(node2, options2) {
    var allText = grabAllTextNodes(node2, []), length2 = allText.length, attrib, attrname, modified, fragment, subnode, text, match2, i, index2, img, rawText, iconId, src;
    while (length2--) {
      modified = false;
      fragment = document.createDocumentFragment();
      subnode = allText[length2];
      text = subnode.nodeValue;
      i = 0;
      while (match2 = re.exec(text)) {
        index2 = match2.index;
        if (index2 !== i) {
          fragment.appendChild(createText(text.slice(i, index2), true));
        }
        rawText = match2[0];
        iconId = grabTheRightIcon(rawText);
        i = index2 + rawText.length;
        src = options2.callback(iconId, options2);
        if (iconId && src) {
          img = new Image();
          img.onerror = options2.onerror;
          img.setAttribute("draggable", "false");
          attrib = options2.attributes(rawText, iconId);
          for (attrname in attrib) {
            if (attrib.hasOwnProperty(attrname) && attrname.indexOf("on") !== 0 && !img.hasAttribute(attrname)) {
              img.setAttribute(attrname, attrib[attrname]);
            }
          }
          img.className = options2.className;
          img.alt = rawText;
          img.src = src;
          modified = true;
          fragment.appendChild(img);
        }
        if (!img)
          fragment.appendChild(createText(rawText, false));
        img = null;
      }
      if (modified) {
        if (i < text.length) {
          fragment.appendChild(createText(text.slice(i), true));
        }
        subnode.parentNode.replaceChild(fragment, subnode);
      }
    }
    return node2;
  }
  function parseString(str, options2) {
    return replace2(str, function(rawText) {
      var ret = rawText, iconId = grabTheRightIcon(rawText), src = options2.callback(iconId, options2), attrib, attrname;
      if (iconId && src) {
        ret = "<img ".concat('class="', options2.className, '" ', 'draggable="false" ', 'alt="', rawText, '"', ' src="', src, '"');
        attrib = options2.attributes(rawText, iconId);
        for (attrname in attrib) {
          if (attrib.hasOwnProperty(attrname) && attrname.indexOf("on") !== 0 && ret.indexOf(" " + attrname + "=") === -1) {
            ret = ret.concat(" ", attrname, '="', escapeHTML(attrib[attrname]), '"');
          }
        }
        ret = ret.concat("/>");
      }
      return ret;
    });
  }
  function replacer(m) {
    return escaper[m];
  }
  function returnNull() {
    return null;
  }
  function toSizeSquaredAsset(value) {
    return typeof value === "number" ? value + "x" + value : value;
  }
  function fromCodePoint(codepoint) {
    var code = typeof codepoint === "string" ? parseInt(codepoint, 16) : codepoint;
    if (code < 65536) {
      return fromCharCode(code);
    }
    code -= 65536;
    return fromCharCode(55296 + (code >> 10), 56320 + (code & 1023));
  }
  function parse2(what, how) {
    if (!how || typeof how === "function") {
      how = { callback: how };
    }
    return (typeof what === "string" ? parseString : parseNode)(what, { callback: how.callback || defaultImageSrcGenerator, attributes: typeof how.attributes === "function" ? how.attributes : returnNull, base: typeof how.base === "string" ? how.base : twemoji2.base, ext: how.ext || twemoji2.ext, size: how.folder || toSizeSquaredAsset(how.size || twemoji2.size), className: how.className || twemoji2.className, onerror: how.onerror || twemoji2.onerror });
  }
  function replace2(text, callback) {
    return String(text).replace(re, callback);
  }
  function test(text) {
    re.lastIndex = 0;
    var result = re.test(text);
    re.lastIndex = 0;
    return result;
  }
  function toCodePoint(unicodeSurrogates, sep) {
    var r = [], c = 0, p = 0, i = 0;
    while (i < unicodeSurrogates.length) {
      c = unicodeSurrogates.charCodeAt(i++);
      if (p) {
        r.push((65536 + (p - 55296 << 10) + (c - 56320)).toString(16));
        p = 0;
      } else if (55296 <= c && c <= 56319) {
        p = c;
      } else {
        r.push(c.toString(16));
      }
    }
    return r.join(sep || "-");
  }
}();
var twemoji_esm_default = twemoji;

// app/components/Twemoji.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\components\\\\Twemoji.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\components\\Twemoji.tsx"
  );
  import.meta.hot.lastModified = "1703106958830.4421";
}
var Twemoji_ = ({
  emoji,
  unified,
  className,
  title
}) => /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("span", { title, dangerouslySetInnerHTML: {
  __html: twemoji_esm_default.parse(unified ? unified.split("-").map(twemoji_esm_default.convert.fromCodePoint).join("") : emoji, {
    folder: "svg",
    ext: ".svg",
    className: `inline-block w-auto h-4 align-[-0.125em] ${className ?? ""}`
  })
} }, void 0, false, {
  fileName: "app/components/Twemoji.tsx",
  lineNumber: 30,
  columnNumber: 7
}, this);
_c3 = Twemoji_;
var Twemoji = (0, import_react.memo)(Twemoji_);
_c22 = Twemoji;
var _c3;
var _c22;
$RefreshReg$(_c3, "Twemoji_");
$RefreshReg$(_c22, "Twemoji");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/components/Button.tsx
var import_jsx_dev_runtime3 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\components\\\\Button.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\components\\Button.tsx"
  );
  import.meta.hot.lastModified = "1703039656722.2693";
}
var Button = (props) => {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("button", { ...props, className: `rounded font-medium text-base min-h-[36px] max-h-9 py-0 px-[14px] min-w-[60px] text-white transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex ${!props.discordstyle || props.discordstyle === ButtonStyle.Primary ? "bg-blurple-500 hover:bg-blurple-600 active:bg-blurple-700" : [ButtonStyle.Link, ButtonStyle.Secondary].includes(props.discordstyle) ? "bg-[#6d6f78] hover:bg-[#4e5058] dark:bg-[#4e5058] hover:dark:bg-[#6d6f78]" : props.discordstyle === ButtonStyle.Danger ? "bg-[#da373c] hover:bg-[#a12828]" : props.discordstyle === ButtonStyle.Success ? "bg-[#248046] hover:bg-[#15562b] dark:bg-[#248046] dark:hover:bg-[#1a6334]" : ""} ${props.className ?? ""}`, children: [
    props.emoji && (props.emoji.id ? /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("div", { className: "mr-1 aspect-square my-auto h-7", children: /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("img", { src: cdn.emoji(props.emoji.id, props.emoji.animated ? "gif" : "webp"), alt: props.emoji.name, className: "h-full w-full" }, void 0, false, {
      fileName: "app/components/Button.tsx",
      lineNumber: 28,
      columnNumber: 13
    }, this) }, void 0, false, {
      fileName: "app/components/Button.tsx",
      lineNumber: 27,
      columnNumber: 41
    }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("div", { className: "mr-1 aspect-square my-auto h-7 flex", children: /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("div", { className: "m-auto", children: /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(Twemoji, { emoji: props.emoji.name, className: "h-[22px] !align-bottom" }, void 0, false, {
      fileName: "app/components/Button.tsx",
      lineNumber: 31,
      columnNumber: 15
    }, this) }, void 0, false, {
      fileName: "app/components/Button.tsx",
      lineNumber: 30,
      columnNumber: 13
    }, this) }, void 0, false, {
      fileName: "app/components/Button.tsx",
      lineNumber: 29,
      columnNumber: 20
    }, this)),
    /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("div", { className: props.emoji ? "my-auto" : "m-auto", children: props.children }, void 0, false, {
      fileName: "app/components/Button.tsx",
      lineNumber: 34,
      columnNumber: 7
    }, this),
    props.discordstyle === ButtonStyle.Link && /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(CoolIcon, { icon: "External_Link", className: "ml-1.5 my-auto" }, void 0, false, {
      fileName: "app/components/Button.tsx",
      lineNumber: 35,
      columnNumber: 51
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/Button.tsx",
    lineNumber: 26,
    columnNumber: 10
  }, this);
};
_c4 = Button;
var _c4;
$RefreshReg$(_c4, "Button");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// node_modules/@babel/runtime/helpers/esm/typeof.js
function _typeof(o) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof(o);
}

// node_modules/@babel/runtime/helpers/esm/toPrimitive.js
function toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t)
    return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof(i))
      return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}

// node_modules/@babel/runtime/helpers/esm/toPropertyKey.js
function toPropertyKey(t) {
  var i = toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : String(i);
}

// node_modules/@babel/runtime/helpers/esm/defineProperty.js
function _defineProperty(obj, key, value) {
  key = toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

// node_modules/@babel/runtime/helpers/esm/objectSpread2.js
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
      _defineProperty(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}

// node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js
function _arrayWithHoles(arr) {
  if (Array.isArray(arr))
    return arr;
}

// node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e, n, i, u, a = [], f = true, o = false;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t)
          return;
        f = false;
      } else
        for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true)
          ;
    } catch (r2) {
      o = true, n = r2;
    } finally {
      try {
        if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u))
          return;
      } finally {
        if (o)
          throw n;
      }
    }
    return a;
  }
}

// node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length)
    len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++)
    arr2[i] = arr[i];
  return arr2;
}

// node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js
function _unsupportedIterableToArray(o, minLen) {
  if (!o)
    return;
  if (typeof o === "string")
    return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor)
    n = o.constructor.name;
  if (n === "Map" || n === "Set")
    return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}

// node_modules/@babel/runtime/helpers/esm/nonIterableRest.js
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

// node_modules/@babel/runtime/helpers/esm/slicedToArray.js
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

// node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null)
    return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0)
      continue;
    target[key] = source[key];
  }
  return target;
}

// node_modules/@babel/runtime/helpers/esm/objectWithoutProperties.js
function _objectWithoutProperties(source, excluded) {
  if (source == null)
    return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0)
        continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key))
        continue;
      target[key] = source[key];
    }
  }
  return target;
}

// node_modules/react-select/dist/useStateManager-7e1e8489.esm.js
var import_react2 = __toESM(require_react());
var _excluded = ["defaultInputValue", "defaultMenuIsOpen", "defaultValue", "inputValue", "menuIsOpen", "onChange", "onInputChange", "onMenuClose", "onMenuOpen", "value"];
function useStateManager(_ref3) {
  var _ref$defaultInputValu = _ref3.defaultInputValue, defaultInputValue = _ref$defaultInputValu === void 0 ? "" : _ref$defaultInputValu, _ref$defaultMenuIsOpe = _ref3.defaultMenuIsOpen, defaultMenuIsOpen = _ref$defaultMenuIsOpe === void 0 ? false : _ref$defaultMenuIsOpe, _ref$defaultValue = _ref3.defaultValue, defaultValue = _ref$defaultValue === void 0 ? null : _ref$defaultValue, propsInputValue = _ref3.inputValue, propsMenuIsOpen = _ref3.menuIsOpen, propsOnChange = _ref3.onChange, propsOnInputChange = _ref3.onInputChange, propsOnMenuClose = _ref3.onMenuClose, propsOnMenuOpen = _ref3.onMenuOpen, propsValue = _ref3.value, restSelectProps = _objectWithoutProperties(_ref3, _excluded);
  var _useState = (0, import_react2.useState)(propsInputValue !== void 0 ? propsInputValue : defaultInputValue), _useState2 = _slicedToArray(_useState, 2), stateInputValue = _useState2[0], setStateInputValue = _useState2[1];
  var _useState3 = (0, import_react2.useState)(propsMenuIsOpen !== void 0 ? propsMenuIsOpen : defaultMenuIsOpen), _useState4 = _slicedToArray(_useState3, 2), stateMenuIsOpen = _useState4[0], setStateMenuIsOpen = _useState4[1];
  var _useState5 = (0, import_react2.useState)(propsValue !== void 0 ? propsValue : defaultValue), _useState6 = _slicedToArray(_useState5, 2), stateValue = _useState6[0], setStateValue = _useState6[1];
  var onChange2 = (0, import_react2.useCallback)(function(value2, actionMeta) {
    if (typeof propsOnChange === "function") {
      propsOnChange(value2, actionMeta);
    }
    setStateValue(value2);
  }, [propsOnChange]);
  var onInputChange = (0, import_react2.useCallback)(function(value2, actionMeta) {
    var newValue;
    if (typeof propsOnInputChange === "function") {
      newValue = propsOnInputChange(value2, actionMeta);
    }
    setStateInputValue(newValue !== void 0 ? newValue : value2);
  }, [propsOnInputChange]);
  var onMenuOpen = (0, import_react2.useCallback)(function() {
    if (typeof propsOnMenuOpen === "function") {
      propsOnMenuOpen();
    }
    setStateMenuIsOpen(true);
  }, [propsOnMenuOpen]);
  var onMenuClose = (0, import_react2.useCallback)(function() {
    if (typeof propsOnMenuClose === "function") {
      propsOnMenuClose();
    }
    setStateMenuIsOpen(false);
  }, [propsOnMenuClose]);
  var inputValue = propsInputValue !== void 0 ? propsInputValue : stateInputValue;
  var menuIsOpen = propsMenuIsOpen !== void 0 ? propsMenuIsOpen : stateMenuIsOpen;
  var value = propsValue !== void 0 ? propsValue : stateValue;
  return _objectSpread2(_objectSpread2({}, restSelectProps), {}, {
    inputValue,
    menuIsOpen,
    onChange: onChange2,
    onInputChange,
    onMenuClose,
    onMenuOpen,
    value
  });
}

// node_modules/@babel/runtime/helpers/esm/extends.js
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}

// node_modules/react-select/dist/react-select.esm.js
var React5 = __toESM(require_react());
var import_react9 = __toESM(require_react());

// node_modules/@babel/runtime/helpers/esm/classCallCheck.js
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

// node_modules/@babel/runtime/helpers/esm/createClass.js
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor)
      descriptor.writable = true;
    Object.defineProperty(target, toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps)
    _defineProperties(Constructor.prototype, protoProps);
  if (staticProps)
    _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

// node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
    o2.__proto__ = p2;
    return o2;
  };
  return _setPrototypeOf(o, p);
}

// node_modules/@babel/runtime/helpers/esm/inherits.js
function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass)
    _setPrototypeOf(subClass, superClass);
}

// node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js
function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
    return o2.__proto__ || Object.getPrototypeOf(o2);
  };
  return _getPrototypeOf(o);
}

// node_modules/@babel/runtime/helpers/esm/isNativeReflectConstruct.js
function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct)
    return false;
  if (Reflect.construct.sham)
    return false;
  if (typeof Proxy === "function")
    return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
    return true;
  } catch (e) {
    return false;
  }
}

// node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}

// node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js
function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized(self);
}

// node_modules/@babel/runtime/helpers/esm/createSuper.js
function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();
  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived), result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn(this, result);
  };
}

// node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr))
    return _arrayLikeToArray(arr);
}

// node_modules/@babel/runtime/helpers/esm/iterableToArray.js
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null)
    return Array.from(iter);
}

// node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

// node_modules/@babel/runtime/helpers/esm/toConsumableArray.js
function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

// node_modules/react-select/dist/Select-49a62830.esm.js
var React4 = __toESM(require_react());
var import_react7 = __toESM(require_react());

// node_modules/@emotion/react/dist/emotion-element-c39617d8.browser.esm.js
var React2 = __toESM(require_react());
var import_react3 = __toESM(require_react());

// node_modules/@emotion/sheet/dist/emotion-sheet.browser.esm.js
function sheetForTag(tag) {
  if (tag.sheet) {
    return tag.sheet;
  }
  for (var i = 0; i < document.styleSheets.length; i++) {
    if (document.styleSheets[i].ownerNode === tag) {
      return document.styleSheets[i];
    }
  }
}
function createStyleElement(options2) {
  var tag = document.createElement("style");
  tag.setAttribute("data-emotion", options2.key);
  if (options2.nonce !== void 0) {
    tag.setAttribute("nonce", options2.nonce);
  }
  tag.appendChild(document.createTextNode(""));
  tag.setAttribute("data-s", "");
  return tag;
}
var StyleSheet = /* @__PURE__ */ function() {
  function StyleSheet2(options2) {
    var _this = this;
    this._insertTag = function(tag) {
      var before;
      if (_this.tags.length === 0) {
        if (_this.insertionPoint) {
          before = _this.insertionPoint.nextSibling;
        } else if (_this.prepend) {
          before = _this.container.firstChild;
        } else {
          before = _this.before;
        }
      } else {
        before = _this.tags[_this.tags.length - 1].nextSibling;
      }
      _this.container.insertBefore(tag, before);
      _this.tags.push(tag);
    };
    this.isSpeedy = options2.speedy === void 0 ? false : options2.speedy;
    this.tags = [];
    this.ctr = 0;
    this.nonce = options2.nonce;
    this.key = options2.key;
    this.container = options2.container;
    this.prepend = options2.prepend;
    this.insertionPoint = options2.insertionPoint;
    this.before = null;
  }
  var _proto = StyleSheet2.prototype;
  _proto.hydrate = function hydrate(nodes) {
    nodes.forEach(this._insertTag);
  };
  _proto.insert = function insert(rule) {
    if (this.ctr % (this.isSpeedy ? 65e3 : 1) === 0) {
      this._insertTag(createStyleElement(this));
    }
    var tag = this.tags[this.tags.length - 1];
    if (true) {
      var isImportRule3 = rule.charCodeAt(0) === 64 && rule.charCodeAt(1) === 105;
      if (isImportRule3 && this._alreadyInsertedOrderInsensitiveRule) {
        console.error("You're attempting to insert the following rule:\n" + rule + "\n\n`@import` rules must be before all other types of rules in a stylesheet but other rules have already been inserted. Please ensure that `@import` rules are before all other rules.");
      }
      this._alreadyInsertedOrderInsensitiveRule = this._alreadyInsertedOrderInsensitiveRule || !isImportRule3;
    }
    if (this.isSpeedy) {
      var sheet = sheetForTag(tag);
      try {
        sheet.insertRule(rule, sheet.cssRules.length);
      } catch (e) {
        if (!/:(-moz-placeholder|-moz-focus-inner|-moz-focusring|-ms-input-placeholder|-moz-read-write|-moz-read-only|-ms-clear|-ms-expand|-ms-reveal){/.test(rule)) {
          console.error('There was a problem inserting the following rule: "' + rule + '"', e);
        }
      }
    } else {
      tag.appendChild(document.createTextNode(rule));
    }
    this.ctr++;
  };
  _proto.flush = function flush() {
    this.tags.forEach(function(tag) {
      return tag.parentNode && tag.parentNode.removeChild(tag);
    });
    this.tags = [];
    this.ctr = 0;
    if (true) {
      this._alreadyInsertedOrderInsensitiveRule = false;
    }
  };
  return StyleSheet2;
}();

// node_modules/stylis/src/Enum.js
var MS = "-ms-";
var MOZ = "-moz-";
var WEBKIT = "-webkit-";
var COMMENT = "comm";
var RULESET = "rule";
var DECLARATION = "decl";
var IMPORT = "@import";
var KEYFRAMES = "@keyframes";
var LAYER = "@layer";

// node_modules/stylis/src/Utility.js
var abs = Math.abs;
var from = String.fromCharCode;
var assign = Object.assign;
function hash(value, length2) {
  return charat(value, 0) ^ 45 ? (((length2 << 2 ^ charat(value, 0)) << 2 ^ charat(value, 1)) << 2 ^ charat(value, 2)) << 2 ^ charat(value, 3) : 0;
}
function trim(value) {
  return value.trim();
}
function match(value, pattern) {
  return (value = pattern.exec(value)) ? value[0] : value;
}
function replace(value, pattern, replacement) {
  return value.replace(pattern, replacement);
}
function indexof(value, search) {
  return value.indexOf(search);
}
function charat(value, index2) {
  return value.charCodeAt(index2) | 0;
}
function substr(value, begin, end) {
  return value.slice(begin, end);
}
function strlen(value) {
  return value.length;
}
function sizeof(value) {
  return value.length;
}
function append(value, array) {
  return array.push(value), value;
}
function combine(array, callback) {
  return array.map(callback).join("");
}

// node_modules/stylis/src/Tokenizer.js
var line = 1;
var column = 1;
var length = 0;
var position = 0;
var character = 0;
var characters = "";
function node(value, root, parent, type, props, children, length2) {
  return { value, root, parent, type, props, children, line, column, length: length2, return: "" };
}
function copy(root, props) {
  return assign(node("", null, null, "", null, null, 0), root, { length: -root.length }, props);
}
function char() {
  return character;
}
function prev() {
  character = position > 0 ? charat(characters, --position) : 0;
  if (column--, character === 10)
    column = 1, line--;
  return character;
}
function next() {
  character = position < length ? charat(characters, position++) : 0;
  if (column++, character === 10)
    column = 1, line++;
  return character;
}
function peek() {
  return charat(characters, position);
}
function caret() {
  return position;
}
function slice(begin, end) {
  return substr(characters, begin, end);
}
function token(type) {
  switch (type) {
    case 0:
    case 9:
    case 10:
    case 13:
    case 32:
      return 5;
    case 33:
    case 43:
    case 44:
    case 47:
    case 62:
    case 64:
    case 126:
    case 59:
    case 123:
    case 125:
      return 4;
    case 58:
      return 3;
    case 34:
    case 39:
    case 40:
    case 91:
      return 2;
    case 41:
    case 93:
      return 1;
  }
  return 0;
}
function alloc(value) {
  return line = column = 1, length = strlen(characters = value), position = 0, [];
}
function dealloc(value) {
  return characters = "", value;
}
function delimit(type) {
  return trim(slice(position - 1, delimiter(type === 91 ? type + 2 : type === 40 ? type + 1 : type)));
}
function whitespace(type) {
  while (character = peek())
    if (character < 33)
      next();
    else
      break;
  return token(type) > 2 || token(character) > 3 ? "" : " ";
}
function escaping(index2, count) {
  while (--count && next())
    if (character < 48 || character > 102 || character > 57 && character < 65 || character > 70 && character < 97)
      break;
  return slice(index2, caret() + (count < 6 && peek() == 32 && next() == 32));
}
function delimiter(type) {
  while (next())
    switch (character) {
      case type:
        return position;
      case 34:
      case 39:
        if (type !== 34 && type !== 39)
          delimiter(character);
        break;
      case 40:
        if (type === 41)
          delimiter(type);
        break;
      case 92:
        next();
        break;
    }
  return position;
}
function commenter(type, index2) {
  while (next())
    if (type + character === 47 + 10)
      break;
    else if (type + character === 42 + 42 && peek() === 47)
      break;
  return "/*" + slice(index2, position - 1) + "*" + from(type === 47 ? type : next());
}
function identifier(index2) {
  while (!token(peek()))
    next();
  return slice(index2, position);
}

// node_modules/stylis/src/Parser.js
function compile(value) {
  return dealloc(parse("", null, null, null, [""], value = alloc(value), 0, [0], value));
}
function parse(value, root, parent, rule, rules, rulesets, pseudo, points, declarations) {
  var index2 = 0;
  var offset = 0;
  var length2 = pseudo;
  var atrule = 0;
  var property = 0;
  var previous = 0;
  var variable = 1;
  var scanning = 1;
  var ampersand = 1;
  var character2 = 0;
  var type = "";
  var props = rules;
  var children = rulesets;
  var reference = rule;
  var characters2 = type;
  while (scanning)
    switch (previous = character2, character2 = next()) {
      case 40:
        if (previous != 108 && charat(characters2, length2 - 1) == 58) {
          if (indexof(characters2 += replace(delimit(character2), "&", "&\f"), "&\f") != -1)
            ampersand = -1;
          break;
        }
      case 34:
      case 39:
      case 91:
        characters2 += delimit(character2);
        break;
      case 9:
      case 10:
      case 13:
      case 32:
        characters2 += whitespace(previous);
        break;
      case 92:
        characters2 += escaping(caret() - 1, 7);
        continue;
      case 47:
        switch (peek()) {
          case 42:
          case 47:
            append(comment(commenter(next(), caret()), root, parent), declarations);
            break;
          default:
            characters2 += "/";
        }
        break;
      case 123 * variable:
        points[index2++] = strlen(characters2) * ampersand;
      case 125 * variable:
      case 59:
      case 0:
        switch (character2) {
          case 0:
          case 125:
            scanning = 0;
          case 59 + offset:
            if (ampersand == -1)
              characters2 = replace(characters2, /\f/g, "");
            if (property > 0 && strlen(characters2) - length2)
              append(property > 32 ? declaration(characters2 + ";", rule, parent, length2 - 1) : declaration(replace(characters2, " ", "") + ";", rule, parent, length2 - 2), declarations);
            break;
          case 59:
            characters2 += ";";
          default:
            append(reference = ruleset(characters2, root, parent, index2, offset, rules, points, type, props = [], children = [], length2), rulesets);
            if (character2 === 123)
              if (offset === 0)
                parse(characters2, root, reference, reference, props, rulesets, length2, points, children);
              else
                switch (atrule === 99 && charat(characters2, 3) === 110 ? 100 : atrule) {
                  case 100:
                  case 108:
                  case 109:
                  case 115:
                    parse(value, reference, reference, rule && append(ruleset(value, reference, reference, 0, 0, rules, points, type, rules, props = [], length2), children), rules, children, length2, points, rule ? props : children);
                    break;
                  default:
                    parse(characters2, reference, reference, reference, [""], children, 0, points, children);
                }
        }
        index2 = offset = property = 0, variable = ampersand = 1, type = characters2 = "", length2 = pseudo;
        break;
      case 58:
        length2 = 1 + strlen(characters2), property = previous;
      default:
        if (variable < 1) {
          if (character2 == 123)
            --variable;
          else if (character2 == 125 && variable++ == 0 && prev() == 125)
            continue;
        }
        switch (characters2 += from(character2), character2 * variable) {
          case 38:
            ampersand = offset > 0 ? 1 : (characters2 += "\f", -1);
            break;
          case 44:
            points[index2++] = (strlen(characters2) - 1) * ampersand, ampersand = 1;
            break;
          case 64:
            if (peek() === 45)
              characters2 += delimit(next());
            atrule = peek(), offset = length2 = strlen(type = characters2 += identifier(caret())), character2++;
            break;
          case 45:
            if (previous === 45 && strlen(characters2) == 2)
              variable = 0;
        }
    }
  return rulesets;
}
function ruleset(value, root, parent, index2, offset, rules, points, type, props, children, length2) {
  var post = offset - 1;
  var rule = offset === 0 ? rules : [""];
  var size = sizeof(rule);
  for (var i = 0, j = 0, k = 0; i < index2; ++i)
    for (var x = 0, y = substr(value, post + 1, post = abs(j = points[i])), z = value; x < size; ++x)
      if (z = trim(j > 0 ? rule[x] + " " + y : replace(y, /&\f/g, rule[x])))
        props[k++] = z;
  return node(value, root, parent, offset === 0 ? RULESET : type, props, children, length2);
}
function comment(value, root, parent) {
  return node(value, root, parent, COMMENT, from(char()), substr(value, 2, -2), 0);
}
function declaration(value, root, parent, length2) {
  return node(value, root, parent, DECLARATION, substr(value, 0, length2), substr(value, length2 + 1, -1), length2);
}

// node_modules/stylis/src/Serializer.js
function serialize(children, callback) {
  var output = "";
  var length2 = sizeof(children);
  for (var i = 0; i < length2; i++)
    output += callback(children[i], i, children, callback) || "";
  return output;
}
function stringify(element, index2, children, callback) {
  switch (element.type) {
    case LAYER:
      if (element.children.length)
        break;
    case IMPORT:
    case DECLARATION:
      return element.return = element.return || element.value;
    case COMMENT:
      return "";
    case KEYFRAMES:
      return element.return = element.value + "{" + serialize(element.children, callback) + "}";
    case RULESET:
      element.value = element.props.join(",");
  }
  return strlen(children = serialize(element.children, callback)) ? element.return = element.value + "{" + children + "}" : "";
}

// node_modules/stylis/src/Middleware.js
function middleware(collection) {
  var length2 = sizeof(collection);
  return function(element, index2, children, callback) {
    var output = "";
    for (var i = 0; i < length2; i++)
      output += collection[i](element, index2, children, callback) || "";
    return output;
  };
}

// node_modules/@emotion/memoize/dist/emotion-memoize.esm.js
function memoize(fn) {
  var cache = /* @__PURE__ */ Object.create(null);
  return function(arg) {
    if (cache[arg] === void 0)
      cache[arg] = fn(arg);
    return cache[arg];
  };
}

// node_modules/@emotion/cache/dist/emotion-cache.browser.esm.js
var identifierWithPointTracking = function identifierWithPointTracking2(begin, points, index2) {
  var previous = 0;
  var character2 = 0;
  while (true) {
    previous = character2;
    character2 = peek();
    if (previous === 38 && character2 === 12) {
      points[index2] = 1;
    }
    if (token(character2)) {
      break;
    }
    next();
  }
  return slice(begin, position);
};
var toRules = function toRules2(parsed, points) {
  var index2 = -1;
  var character2 = 44;
  do {
    switch (token(character2)) {
      case 0:
        if (character2 === 38 && peek() === 12) {
          points[index2] = 1;
        }
        parsed[index2] += identifierWithPointTracking(position - 1, points, index2);
        break;
      case 2:
        parsed[index2] += delimit(character2);
        break;
      case 4:
        if (character2 === 44) {
          parsed[++index2] = peek() === 58 ? "&\f" : "";
          points[index2] = parsed[index2].length;
          break;
        }
      default:
        parsed[index2] += from(character2);
    }
  } while (character2 = next());
  return parsed;
};
var getRules = function getRules2(value, points) {
  return dealloc(toRules(alloc(value), points));
};
var fixedElements = /* @__PURE__ */ new WeakMap();
var compat = function compat2(element) {
  if (element.type !== "rule" || !element.parent || // positive .length indicates that this rule contains pseudo
  // negative .length indicates that this rule has been already prefixed
  element.length < 1) {
    return;
  }
  var value = element.value, parent = element.parent;
  var isImplicitRule = element.column === parent.column && element.line === parent.line;
  while (parent.type !== "rule") {
    parent = parent.parent;
    if (!parent)
      return;
  }
  if (element.props.length === 1 && value.charCodeAt(0) !== 58 && !fixedElements.get(parent)) {
    return;
  }
  if (isImplicitRule) {
    return;
  }
  fixedElements.set(element, true);
  var points = [];
  var rules = getRules(value, points);
  var parentRules = parent.props;
  for (var i = 0, k = 0; i < rules.length; i++) {
    for (var j = 0; j < parentRules.length; j++, k++) {
      element.props[k] = points[i] ? rules[i].replace(/&\f/g, parentRules[j]) : parentRules[j] + " " + rules[i];
    }
  }
};
var removeLabel = function removeLabel2(element) {
  if (element.type === "decl") {
    var value = element.value;
    if (
      // charcode for l
      value.charCodeAt(0) === 108 && // charcode for b
      value.charCodeAt(2) === 98
    ) {
      element["return"] = "";
      element.value = "";
    }
  }
};
var ignoreFlag = "emotion-disable-server-rendering-unsafe-selector-warning-please-do-not-use-this-the-warning-exists-for-a-reason";
var isIgnoringComment = function isIgnoringComment2(element) {
  return element.type === "comm" && element.children.indexOf(ignoreFlag) > -1;
};
var createUnsafeSelectorsAlarm = function createUnsafeSelectorsAlarm2(cache) {
  return function(element, index2, children) {
    if (element.type !== "rule" || cache.compat)
      return;
    var unsafePseudoClasses = element.value.match(/(:first|:nth|:nth-last)-child/g);
    if (unsafePseudoClasses) {
      var isNested = !!element.parent;
      var commentContainer = isNested ? element.parent.children : (
        // global rule at the root level
        children
      );
      for (var i = commentContainer.length - 1; i >= 0; i--) {
        var node2 = commentContainer[i];
        if (node2.line < element.line) {
          break;
        }
        if (node2.column < element.column) {
          if (isIgnoringComment(node2)) {
            return;
          }
          break;
        }
      }
      unsafePseudoClasses.forEach(function(unsafePseudoClass) {
        console.error('The pseudo class "' + unsafePseudoClass + '" is potentially unsafe when doing server-side rendering. Try changing it to "' + unsafePseudoClass.split("-child")[0] + '-of-type".');
      });
    }
  };
};
var isImportRule = function isImportRule2(element) {
  return element.type.charCodeAt(1) === 105 && element.type.charCodeAt(0) === 64;
};
var isPrependedWithRegularRules = function isPrependedWithRegularRules2(index2, children) {
  for (var i = index2 - 1; i >= 0; i--) {
    if (!isImportRule(children[i])) {
      return true;
    }
  }
  return false;
};
var nullifyElement = function nullifyElement2(element) {
  element.type = "";
  element.value = "";
  element["return"] = "";
  element.children = "";
  element.props = "";
};
var incorrectImportAlarm = function incorrectImportAlarm2(element, index2, children) {
  if (!isImportRule(element)) {
    return;
  }
  if (element.parent) {
    console.error("`@import` rules can't be nested inside other rules. Please move it to the top level and put it before regular rules. Keep in mind that they can only be used within global styles.");
    nullifyElement(element);
  } else if (isPrependedWithRegularRules(index2, children)) {
    console.error("`@import` rules can't be after other rules. Please put your `@import` rules before your other rules.");
    nullifyElement(element);
  }
};
function prefix(value, length2) {
  switch (hash(value, length2)) {
    case 5103:
      return WEBKIT + "print-" + value + value;
    case 5737:
    case 4201:
    case 3177:
    case 3433:
    case 1641:
    case 4457:
    case 2921:
    case 5572:
    case 6356:
    case 5844:
    case 3191:
    case 6645:
    case 3005:
    case 6391:
    case 5879:
    case 5623:
    case 6135:
    case 4599:
    case 4855:
    case 4215:
    case 6389:
    case 5109:
    case 5365:
    case 5621:
    case 3829:
      return WEBKIT + value + value;
    case 5349:
    case 4246:
    case 4810:
    case 6968:
    case 2756:
      return WEBKIT + value + MOZ + value + MS + value + value;
    case 6828:
    case 4268:
      return WEBKIT + value + MS + value + value;
    case 6165:
      return WEBKIT + value + MS + "flex-" + value + value;
    case 5187:
      return WEBKIT + value + replace(value, /(\w+).+(:[^]+)/, WEBKIT + "box-$1$2" + MS + "flex-$1$2") + value;
    case 5443:
      return WEBKIT + value + MS + "flex-item-" + replace(value, /flex-|-self/, "") + value;
    case 4675:
      return WEBKIT + value + MS + "flex-line-pack" + replace(value, /align-content|flex-|-self/, "") + value;
    case 5548:
      return WEBKIT + value + MS + replace(value, "shrink", "negative") + value;
    case 5292:
      return WEBKIT + value + MS + replace(value, "basis", "preferred-size") + value;
    case 6060:
      return WEBKIT + "box-" + replace(value, "-grow", "") + WEBKIT + value + MS + replace(value, "grow", "positive") + value;
    case 4554:
      return WEBKIT + replace(value, /([^-])(transform)/g, "$1" + WEBKIT + "$2") + value;
    case 6187:
      return replace(replace(replace(value, /(zoom-|grab)/, WEBKIT + "$1"), /(image-set)/, WEBKIT + "$1"), value, "") + value;
    case 5495:
    case 3959:
      return replace(value, /(image-set\([^]*)/, WEBKIT + "$1$`$1");
    case 4968:
      return replace(replace(value, /(.+:)(flex-)?(.*)/, WEBKIT + "box-pack:$3" + MS + "flex-pack:$3"), /s.+-b[^;]+/, "justify") + WEBKIT + value + value;
    case 4095:
    case 3583:
    case 4068:
    case 2532:
      return replace(value, /(.+)-inline(.+)/, WEBKIT + "$1$2") + value;
    case 8116:
    case 7059:
    case 5753:
    case 5535:
    case 5445:
    case 5701:
    case 4933:
    case 4677:
    case 5533:
    case 5789:
    case 5021:
    case 4765:
      if (strlen(value) - 1 - length2 > 6)
        switch (charat(value, length2 + 1)) {
          case 109:
            if (charat(value, length2 + 4) !== 45)
              break;
          case 102:
            return replace(value, /(.+:)(.+)-([^]+)/, "$1" + WEBKIT + "$2-$3$1" + MOZ + (charat(value, length2 + 3) == 108 ? "$3" : "$2-$3")) + value;
          case 115:
            return ~indexof(value, "stretch") ? prefix(replace(value, "stretch", "fill-available"), length2) + value : value;
        }
      break;
    case 4949:
      if (charat(value, length2 + 1) !== 115)
        break;
    case 6444:
      switch (charat(value, strlen(value) - 3 - (~indexof(value, "!important") && 10))) {
        case 107:
          return replace(value, ":", ":" + WEBKIT) + value;
        case 101:
          return replace(value, /(.+:)([^;!]+)(;|!.+)?/, "$1" + WEBKIT + (charat(value, 14) === 45 ? "inline-" : "") + "box$3$1" + WEBKIT + "$2$3$1" + MS + "$2box$3") + value;
      }
      break;
    case 5936:
      switch (charat(value, length2 + 11)) {
        case 114:
          return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, "tb") + value;
        case 108:
          return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, "tb-rl") + value;
        case 45:
          return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, "lr") + value;
      }
      return WEBKIT + value + MS + value + value;
  }
  return value;
}
var prefixer = function prefixer2(element, index2, children, callback) {
  if (element.length > -1) {
    if (!element["return"])
      switch (element.type) {
        case DECLARATION:
          element["return"] = prefix(element.value, element.length);
          break;
        case KEYFRAMES:
          return serialize([copy(element, {
            value: replace(element.value, "@", "@" + WEBKIT)
          })], callback);
        case RULESET:
          if (element.length)
            return combine(element.props, function(value) {
              switch (match(value, /(::plac\w+|:read-\w+)/)) {
                case ":read-only":
                case ":read-write":
                  return serialize([copy(element, {
                    props: [replace(value, /:(read-\w+)/, ":" + MOZ + "$1")]
                  })], callback);
                case "::placeholder":
                  return serialize([copy(element, {
                    props: [replace(value, /:(plac\w+)/, ":" + WEBKIT + "input-$1")]
                  }), copy(element, {
                    props: [replace(value, /:(plac\w+)/, ":" + MOZ + "$1")]
                  }), copy(element, {
                    props: [replace(value, /:(plac\w+)/, MS + "input-$1")]
                  })], callback);
              }
              return "";
            });
      }
  }
};
var defaultStylisPlugins = [prefixer];
var createCache = function createCache2(options2) {
  var key = options2.key;
  if (!key) {
    throw new Error("You have to configure `key` for your cache. Please make sure it's unique (and not equal to 'css') as it's used for linking styles to your cache.\nIf multiple caches share the same key they might \"fight\" for each other's style elements.");
  }
  if (key === "css") {
    var ssrStyles = document.querySelectorAll("style[data-emotion]:not([data-s])");
    Array.prototype.forEach.call(ssrStyles, function(node2) {
      var dataEmotionAttribute = node2.getAttribute("data-emotion");
      if (dataEmotionAttribute.indexOf(" ") === -1) {
        return;
      }
      document.head.appendChild(node2);
      node2.setAttribute("data-s", "");
    });
  }
  var stylisPlugins = options2.stylisPlugins || defaultStylisPlugins;
  if (true) {
    if (/[^a-z-]/.test(key)) {
      throw new Error('Emotion key must only contain lower case alphabetical characters and - but "' + key + '" was passed');
    }
  }
  var inserted = {};
  var container;
  var nodesToHydrate = [];
  {
    container = options2.container || document.head;
    Array.prototype.forEach.call(
      // this means we will ignore elements which don't have a space in them which
      // means that the style elements we're looking at are only Emotion 11 server-rendered style elements
      document.querySelectorAll('style[data-emotion^="' + key + ' "]'),
      function(node2) {
        var attrib = node2.getAttribute("data-emotion").split(" ");
        for (var i = 1; i < attrib.length; i++) {
          inserted[attrib[i]] = true;
        }
        nodesToHydrate.push(node2);
      }
    );
  }
  var _insert;
  var omnipresentPlugins = [compat, removeLabel];
  if (true) {
    omnipresentPlugins.push(createUnsafeSelectorsAlarm({
      get compat() {
        return cache.compat;
      }
    }), incorrectImportAlarm);
  }
  {
    var currentSheet;
    var finalizingPlugins = [stringify, true ? function(element) {
      if (!element.root) {
        if (element["return"]) {
          currentSheet.insert(element["return"]);
        } else if (element.value && element.type !== COMMENT) {
          currentSheet.insert(element.value + "{}");
        }
      }
    } : rulesheet(function(rule) {
      currentSheet.insert(rule);
    })];
    var serializer = middleware(omnipresentPlugins.concat(stylisPlugins, finalizingPlugins));
    var stylis = function stylis2(styles) {
      return serialize(compile(styles), serializer);
    };
    _insert = function insert(selector, serialized, sheet, shouldCache) {
      currentSheet = sheet;
      if (serialized.map !== void 0) {
        currentSheet = {
          insert: function insert2(rule) {
            sheet.insert(rule + serialized.map);
          }
        };
      }
      stylis(selector ? selector + "{" + serialized.styles + "}" : serialized.styles);
      if (shouldCache) {
        cache.inserted[serialized.name] = true;
      }
    };
  }
  var cache = {
    key,
    sheet: new StyleSheet({
      key,
      container,
      nonce: options2.nonce,
      speedy: options2.speedy,
      prepend: options2.prepend,
      insertionPoint: options2.insertionPoint
    }),
    nonce: options2.nonce,
    inserted,
    registered: {},
    insert: _insert
  };
  cache.sheet.hydrate(nodesToHydrate);
  return cache;
};

// node_modules/@emotion/utils/dist/emotion-utils.browser.esm.js
var isBrowser = true;
function getRegisteredStyles(registered, registeredStyles, classNames2) {
  var rawClassName = "";
  classNames2.split(" ").forEach(function(className) {
    if (registered[className] !== void 0) {
      registeredStyles.push(registered[className] + ";");
    } else {
      rawClassName += className + " ";
    }
  });
  return rawClassName;
}
var registerStyles = function registerStyles2(cache, serialized, isStringTag) {
  var className = cache.key + "-" + serialized.name;
  if (
    // we only need to add the styles to the registered cache if the
    // class name could be used further down
    // the tree but if it's a string tag, we know it won't
    // so we don't have to add it to registered cache.
    // this improves memory usage since we can avoid storing the whole style string
    (isStringTag === false || // we need to always store it if we're in compat mode and
    // in node since emotion-server relies on whether a style is in
    // the registered cache to know whether a style is global or not
    // also, note that this check will be dead code eliminated in the browser
    isBrowser === false) && cache.registered[className] === void 0
  ) {
    cache.registered[className] = serialized.styles;
  }
};
var insertStyles = function insertStyles2(cache, serialized, isStringTag) {
  registerStyles(cache, serialized, isStringTag);
  var className = cache.key + "-" + serialized.name;
  if (cache.inserted[serialized.name] === void 0) {
    var current = serialized;
    do {
      cache.insert(serialized === current ? "." + className : "", current, cache.sheet, true);
      current = current.next;
    } while (current !== void 0);
  }
};

// node_modules/@emotion/hash/dist/emotion-hash.esm.js
function murmur2(str) {
  var h = 0;
  var k, i = 0, len = str.length;
  for (; len >= 4; ++i, len -= 4) {
    k = str.charCodeAt(i) & 255 | (str.charCodeAt(++i) & 255) << 8 | (str.charCodeAt(++i) & 255) << 16 | (str.charCodeAt(++i) & 255) << 24;
    k = /* Math.imul(k, m): */
    (k & 65535) * 1540483477 + ((k >>> 16) * 59797 << 16);
    k ^= /* k >>> r: */
    k >>> 24;
    h = /* Math.imul(k, m): */
    (k & 65535) * 1540483477 + ((k >>> 16) * 59797 << 16) ^ /* Math.imul(h, m): */
    (h & 65535) * 1540483477 + ((h >>> 16) * 59797 << 16);
  }
  switch (len) {
    case 3:
      h ^= (str.charCodeAt(i + 2) & 255) << 16;
    case 2:
      h ^= (str.charCodeAt(i + 1) & 255) << 8;
    case 1:
      h ^= str.charCodeAt(i) & 255;
      h = /* Math.imul(h, m): */
      (h & 65535) * 1540483477 + ((h >>> 16) * 59797 << 16);
  }
  h ^= h >>> 13;
  h = /* Math.imul(h, m): */
  (h & 65535) * 1540483477 + ((h >>> 16) * 59797 << 16);
  return ((h ^ h >>> 15) >>> 0).toString(36);
}

// node_modules/@emotion/unitless/dist/emotion-unitless.esm.js
var unitlessKeys = {
  animationIterationCount: 1,
  aspectRatio: 1,
  borderImageOutset: 1,
  borderImageSlice: 1,
  borderImageWidth: 1,
  boxFlex: 1,
  boxFlexGroup: 1,
  boxOrdinalGroup: 1,
  columnCount: 1,
  columns: 1,
  flex: 1,
  flexGrow: 1,
  flexPositive: 1,
  flexShrink: 1,
  flexNegative: 1,
  flexOrder: 1,
  gridRow: 1,
  gridRowEnd: 1,
  gridRowSpan: 1,
  gridRowStart: 1,
  gridColumn: 1,
  gridColumnEnd: 1,
  gridColumnSpan: 1,
  gridColumnStart: 1,
  msGridRow: 1,
  msGridRowSpan: 1,
  msGridColumn: 1,
  msGridColumnSpan: 1,
  fontWeight: 1,
  lineHeight: 1,
  opacity: 1,
  order: 1,
  orphans: 1,
  tabSize: 1,
  widows: 1,
  zIndex: 1,
  zoom: 1,
  WebkitLineClamp: 1,
  // SVG-related properties
  fillOpacity: 1,
  floodOpacity: 1,
  stopOpacity: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1,
  strokeMiterlimit: 1,
  strokeOpacity: 1,
  strokeWidth: 1
};

// node_modules/@emotion/serialize/dist/emotion-serialize.browser.esm.js
var ILLEGAL_ESCAPE_SEQUENCE_ERROR = `You have illegal escape sequence in your template literal, most likely inside content's property value.
Because you write your CSS inside a JavaScript string you actually have to do double escaping, so for example "content: '\\00d7';" should become "content: '\\\\00d7';".
You can read more about this here:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#ES2018_revision_of_illegal_escape_sequences`;
var UNDEFINED_AS_OBJECT_KEY_ERROR = "You have passed in falsy value as style object's key (can happen when in example you pass unexported component as computed key).";
var hyphenateRegex = /[A-Z]|^ms/g;
var animationRegex = /_EMO_([^_]+?)_([^]*?)_EMO_/g;
var isCustomProperty = function isCustomProperty2(property) {
  return property.charCodeAt(1) === 45;
};
var isProcessableValue = function isProcessableValue2(value) {
  return value != null && typeof value !== "boolean";
};
var processStyleName = /* @__PURE__ */ memoize(function(styleName) {
  return isCustomProperty(styleName) ? styleName : styleName.replace(hyphenateRegex, "-$&").toLowerCase();
});
var processStyleValue = function processStyleValue2(key, value) {
  switch (key) {
    case "animation":
    case "animationName": {
      if (typeof value === "string") {
        return value.replace(animationRegex, function(match2, p1, p2) {
          cursor = {
            name: p1,
            styles: p2,
            next: cursor
          };
          return p1;
        });
      }
    }
  }
  if (unitlessKeys[key] !== 1 && !isCustomProperty(key) && typeof value === "number" && value !== 0) {
    return value + "px";
  }
  return value;
};
if (true) {
  contentValuePattern = /(var|attr|counters?|url|element|(((repeating-)?(linear|radial))|conic)-gradient)\(|(no-)?(open|close)-quote/;
  contentValues = ["normal", "none", "initial", "inherit", "unset"];
  oldProcessStyleValue = processStyleValue;
  msPattern = /^-ms-/;
  hyphenPattern = /-(.)/g;
  hyphenatedCache = {};
  processStyleValue = function processStyleValue3(key, value) {
    if (key === "content") {
      if (typeof value !== "string" || contentValues.indexOf(value) === -1 && !contentValuePattern.test(value) && (value.charAt(0) !== value.charAt(value.length - 1) || value.charAt(0) !== '"' && value.charAt(0) !== "'")) {
        throw new Error("You seem to be using a value for 'content' without quotes, try replacing it with `content: '\"" + value + "\"'`");
      }
    }
    var processed = oldProcessStyleValue(key, value);
    if (processed !== "" && !isCustomProperty(key) && key.indexOf("-") !== -1 && hyphenatedCache[key] === void 0) {
      hyphenatedCache[key] = true;
      console.error("Using kebab-case for css properties in objects is not supported. Did you mean " + key.replace(msPattern, "ms-").replace(hyphenPattern, function(str, _char) {
        return _char.toUpperCase();
      }) + "?");
    }
    return processed;
  };
}
var contentValuePattern;
var contentValues;
var oldProcessStyleValue;
var msPattern;
var hyphenPattern;
var hyphenatedCache;
var noComponentSelectorMessage = "Component selectors can only be used in conjunction with @emotion/babel-plugin, the swc Emotion plugin, or another Emotion-aware compiler transform.";
function handleInterpolation(mergedProps, registered, interpolation) {
  if (interpolation == null) {
    return "";
  }
  if (interpolation.__emotion_styles !== void 0) {
    if (interpolation.toString() === "NO_COMPONENT_SELECTOR") {
      throw new Error(noComponentSelectorMessage);
    }
    return interpolation;
  }
  switch (typeof interpolation) {
    case "boolean": {
      return "";
    }
    case "object": {
      if (interpolation.anim === 1) {
        cursor = {
          name: interpolation.name,
          styles: interpolation.styles,
          next: cursor
        };
        return interpolation.name;
      }
      if (interpolation.styles !== void 0) {
        var next2 = interpolation.next;
        if (next2 !== void 0) {
          while (next2 !== void 0) {
            cursor = {
              name: next2.name,
              styles: next2.styles,
              next: cursor
            };
            next2 = next2.next;
          }
        }
        var styles = interpolation.styles + ";";
        if (interpolation.map !== void 0) {
          styles += interpolation.map;
        }
        return styles;
      }
      return createStringFromObject(mergedProps, registered, interpolation);
    }
    case "function": {
      if (mergedProps !== void 0) {
        var previousCursor = cursor;
        var result = interpolation(mergedProps);
        cursor = previousCursor;
        return handleInterpolation(mergedProps, registered, result);
      } else if (true) {
        console.error("Functions that are interpolated in css calls will be stringified.\nIf you want to have a css call based on props, create a function that returns a css call like this\nlet dynamicStyle = (props) => css`color: ${props.color}`\nIt can be called directly with props or interpolated in a styled call like this\nlet SomeComponent = styled('div')`${dynamicStyle}`");
      }
      break;
    }
    case "string":
      if (true) {
        var matched = [];
        var replaced = interpolation.replace(animationRegex, function(match2, p1, p2) {
          var fakeVarName = "animation" + matched.length;
          matched.push("const " + fakeVarName + " = keyframes`" + p2.replace(/^@keyframes animation-\w+/, "") + "`");
          return "${" + fakeVarName + "}";
        });
        if (matched.length) {
          console.error("`keyframes` output got interpolated into plain string, please wrap it with `css`.\n\nInstead of doing this:\n\n" + [].concat(matched, ["`" + replaced + "`"]).join("\n") + "\n\nYou should wrap it with `css` like this:\n\n" + ("css`" + replaced + "`"));
        }
      }
      break;
  }
  if (registered == null) {
    return interpolation;
  }
  var cached = registered[interpolation];
  return cached !== void 0 ? cached : interpolation;
}
function createStringFromObject(mergedProps, registered, obj) {
  var string = "";
  if (Array.isArray(obj)) {
    for (var i = 0; i < obj.length; i++) {
      string += handleInterpolation(mergedProps, registered, obj[i]) + ";";
    }
  } else {
    for (var _key in obj) {
      var value = obj[_key];
      if (typeof value !== "object") {
        if (registered != null && registered[value] !== void 0) {
          string += _key + "{" + registered[value] + "}";
        } else if (isProcessableValue(value)) {
          string += processStyleName(_key) + ":" + processStyleValue(_key, value) + ";";
        }
      } else {
        if (_key === "NO_COMPONENT_SELECTOR" && true) {
          throw new Error(noComponentSelectorMessage);
        }
        if (Array.isArray(value) && typeof value[0] === "string" && (registered == null || registered[value[0]] === void 0)) {
          for (var _i = 0; _i < value.length; _i++) {
            if (isProcessableValue(value[_i])) {
              string += processStyleName(_key) + ":" + processStyleValue(_key, value[_i]) + ";";
            }
          }
        } else {
          var interpolated = handleInterpolation(mergedProps, registered, value);
          switch (_key) {
            case "animation":
            case "animationName": {
              string += processStyleName(_key) + ":" + interpolated + ";";
              break;
            }
            default: {
              if (_key === "undefined") {
                console.error(UNDEFINED_AS_OBJECT_KEY_ERROR);
              }
              string += _key + "{" + interpolated + "}";
            }
          }
        }
      }
    }
  }
  return string;
}
var labelPattern = /label:\s*([^\s;\n{]+)\s*(;|$)/g;
var sourceMapPattern;
if (true) {
  sourceMapPattern = /\/\*#\ssourceMappingURL=data:application\/json;\S+\s+\*\//g;
}
var cursor;
var serializeStyles = function serializeStyles2(args, registered, mergedProps) {
  if (args.length === 1 && typeof args[0] === "object" && args[0] !== null && args[0].styles !== void 0) {
    return args[0];
  }
  var stringMode = true;
  var styles = "";
  cursor = void 0;
  var strings4 = args[0];
  if (strings4 == null || strings4.raw === void 0) {
    stringMode = false;
    styles += handleInterpolation(mergedProps, registered, strings4);
  } else {
    if (strings4[0] === void 0) {
      console.error(ILLEGAL_ESCAPE_SEQUENCE_ERROR);
    }
    styles += strings4[0];
  }
  for (var i = 1; i < args.length; i++) {
    styles += handleInterpolation(mergedProps, registered, args[i]);
    if (stringMode) {
      if (strings4[i] === void 0) {
        console.error(ILLEGAL_ESCAPE_SEQUENCE_ERROR);
      }
      styles += strings4[i];
    }
  }
  var sourceMap;
  if (true) {
    styles = styles.replace(sourceMapPattern, function(match3) {
      sourceMap = match3;
      return "";
    });
  }
  labelPattern.lastIndex = 0;
  var identifierName = "";
  var match2;
  while ((match2 = labelPattern.exec(styles)) !== null) {
    identifierName += "-" + // $FlowFixMe we know it's not null
    match2[1];
  }
  var name = murmur2(styles) + identifierName;
  if (true) {
    return {
      name,
      styles,
      map: sourceMap,
      next: cursor,
      toString: function toString() {
        return "You have tried to stringify object returned from `css` function. It isn't supposed to be used directly (e.g. as value of the `className` prop), but rather handed to emotion so it can handle it (e.g. as value of `css` prop).";
      }
    };
  }
  return {
    name,
    styles,
    next: cursor
  };
};

// node_modules/@emotion/use-insertion-effect-with-fallbacks/dist/emotion-use-insertion-effect-with-fallbacks.browser.esm.js
var React = __toESM(require_react());
var syncFallback = function syncFallback2(create) {
  return create();
};
var useInsertionEffect2 = React["useInsertionEffect"] ? React["useInsertionEffect"] : false;
var useInsertionEffectAlwaysWithSyncFallback = useInsertionEffect2 || syncFallback;
var useInsertionEffectWithLayoutFallback = useInsertionEffect2 || React.useLayoutEffect;

// node_modules/@emotion/react/dist/emotion-element-c39617d8.browser.esm.js
var isBrowser2 = true;
var hasOwnProperty = {}.hasOwnProperty;
var EmotionCacheContext = /* @__PURE__ */ React2.createContext(
  // we're doing this to avoid preconstruct's dead code elimination in this one case
  // because this module is primarily intended for the browser and node
  // but it's also required in react native and similar environments sometimes
  // and we could have a special build just for that
  // but this is much easier and the native packages
  // might use a different theme context in the future anyway
  typeof HTMLElement !== "undefined" ? /* @__PURE__ */ createCache({
    key: "css"
  }) : null
);
if (true) {
  EmotionCacheContext.displayName = "EmotionCacheContext";
}
var CacheProvider = EmotionCacheContext.Provider;
var withEmotionCache = function withEmotionCache2(func) {
  return /* @__PURE__ */ (0, import_react3.forwardRef)(function(props, ref) {
    var cache = (0, import_react3.useContext)(EmotionCacheContext);
    return func(props, cache, ref);
  });
};
if (!isBrowser2) {
  withEmotionCache = function withEmotionCache3(func) {
    return function(props) {
      var cache = (0, import_react3.useContext)(EmotionCacheContext);
      if (cache === null) {
        cache = createCache({
          key: "css"
        });
        return /* @__PURE__ */ React2.createElement(EmotionCacheContext.Provider, {
          value: cache
        }, func(props, cache));
      } else {
        return func(props, cache);
      }
    };
  };
}
var ThemeContext = /* @__PURE__ */ React2.createContext({});
if (true) {
  ThemeContext.displayName = "EmotionThemeContext";
}
var getLastPart = function getLastPart2(functionName) {
  var parts = functionName.split(".");
  return parts[parts.length - 1];
};
var getFunctionNameFromStackTraceLine = function getFunctionNameFromStackTraceLine2(line2) {
  var match2 = /^\s+at\s+([A-Za-z0-9$.]+)\s/.exec(line2);
  if (match2)
    return getLastPart(match2[1]);
  match2 = /^([A-Za-z0-9$.]+)@/.exec(line2);
  if (match2)
    return getLastPart(match2[1]);
  return void 0;
};
var internalReactFunctionNames = /* @__PURE__ */ new Set(["renderWithHooks", "processChild", "finishClassComponent", "renderToString"]);
var sanitizeIdentifier = function sanitizeIdentifier2(identifier2) {
  return identifier2.replace(/\$/g, "-");
};
var getLabelFromStackTrace = function getLabelFromStackTrace2(stackTrace) {
  if (!stackTrace)
    return void 0;
  var lines = stackTrace.split("\n");
  for (var i = 0; i < lines.length; i++) {
    var functionName = getFunctionNameFromStackTraceLine(lines[i]);
    if (!functionName)
      continue;
    if (internalReactFunctionNames.has(functionName))
      break;
    if (/^[A-Z]/.test(functionName))
      return sanitizeIdentifier(functionName);
  }
  return void 0;
};
var typePropName = "__EMOTION_TYPE_PLEASE_DO_NOT_USE__";
var labelPropName = "__EMOTION_LABEL_PLEASE_DO_NOT_USE__";
var createEmotionProps = function createEmotionProps2(type, props) {
  if (typeof props.css === "string" && // check if there is a css declaration
  props.css.indexOf(":") !== -1) {
    throw new Error("Strings are not allowed as css prop values, please wrap it in a css template literal from '@emotion/react' like this: css`" + props.css + "`");
  }
  var newProps = {};
  for (var key in props) {
    if (hasOwnProperty.call(props, key)) {
      newProps[key] = props[key];
    }
  }
  newProps[typePropName] = type;
  if (!!props.css && (typeof props.css !== "object" || typeof props.css.name !== "string" || props.css.name.indexOf("-") === -1)) {
    var label = getLabelFromStackTrace(new Error().stack);
    if (label)
      newProps[labelPropName] = label;
  }
  return newProps;
};
var Insertion = function Insertion2(_ref3) {
  var cache = _ref3.cache, serialized = _ref3.serialized, isStringTag = _ref3.isStringTag;
  registerStyles(cache, serialized, isStringTag);
  useInsertionEffectAlwaysWithSyncFallback(function() {
    return insertStyles(cache, serialized, isStringTag);
  });
  return null;
};
var Emotion = /* @__PURE__ */ withEmotionCache(function(props, cache, ref) {
  var cssProp = props.css;
  if (typeof cssProp === "string" && cache.registered[cssProp] !== void 0) {
    cssProp = cache.registered[cssProp];
  }
  var WrappedComponent = props[typePropName];
  var registeredStyles = [cssProp];
  var className = "";
  if (typeof props.className === "string") {
    className = getRegisteredStyles(cache.registered, registeredStyles, props.className);
  } else if (props.className != null) {
    className = props.className + " ";
  }
  var serialized = serializeStyles(registeredStyles, void 0, React2.useContext(ThemeContext));
  if (serialized.name.indexOf("-") === -1) {
    var labelFromStack = props[labelPropName];
    if (labelFromStack) {
      serialized = serializeStyles([serialized, "label:" + labelFromStack + ";"]);
    }
  }
  className += cache.key + "-" + serialized.name;
  var newProps = {};
  for (var key in props) {
    if (hasOwnProperty.call(props, key) && key !== "css" && key !== typePropName && key !== labelPropName) {
      newProps[key] = props[key];
    }
  }
  newProps.ref = ref;
  newProps.className = className;
  return /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement(Insertion, {
    cache,
    serialized,
    isStringTag: typeof WrappedComponent === "string"
  }), /* @__PURE__ */ React2.createElement(WrappedComponent, newProps));
});
if (true) {
  Emotion.displayName = "EmotionCssPropInternal";
}
var Emotion$1 = Emotion;

// node_modules/@emotion/react/dist/emotion-react.browser.esm.js
var React3 = __toESM(require_react());
var import_hoist_non_react_statics = __toESM(require_hoist_non_react_statics_cjs());
var pkg = {
  name: "@emotion/react",
  version: "11.11.1",
  main: "dist/emotion-react.cjs.js",
  module: "dist/emotion-react.esm.js",
  browser: {
    "./dist/emotion-react.esm.js": "./dist/emotion-react.browser.esm.js"
  },
  exports: {
    ".": {
      module: {
        worker: "./dist/emotion-react.worker.esm.js",
        browser: "./dist/emotion-react.browser.esm.js",
        "default": "./dist/emotion-react.esm.js"
      },
      "import": "./dist/emotion-react.cjs.mjs",
      "default": "./dist/emotion-react.cjs.js"
    },
    "./jsx-runtime": {
      module: {
        worker: "./jsx-runtime/dist/emotion-react-jsx-runtime.worker.esm.js",
        browser: "./jsx-runtime/dist/emotion-react-jsx-runtime.browser.esm.js",
        "default": "./jsx-runtime/dist/emotion-react-jsx-runtime.esm.js"
      },
      "import": "./jsx-runtime/dist/emotion-react-jsx-runtime.cjs.mjs",
      "default": "./jsx-runtime/dist/emotion-react-jsx-runtime.cjs.js"
    },
    "./_isolated-hnrs": {
      module: {
        worker: "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.worker.esm.js",
        browser: "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.browser.esm.js",
        "default": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.esm.js"
      },
      "import": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.cjs.mjs",
      "default": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.cjs.js"
    },
    "./jsx-dev-runtime": {
      module: {
        worker: "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.worker.esm.js",
        browser: "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.browser.esm.js",
        "default": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.esm.js"
      },
      "import": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.cjs.mjs",
      "default": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.cjs.js"
    },
    "./package.json": "./package.json",
    "./types/css-prop": "./types/css-prop.d.ts",
    "./macro": {
      types: {
        "import": "./macro.d.mts",
        "default": "./macro.d.ts"
      },
      "default": "./macro.js"
    }
  },
  types: "types/index.d.ts",
  files: [
    "src",
    "dist",
    "jsx-runtime",
    "jsx-dev-runtime",
    "_isolated-hnrs",
    "types/*.d.ts",
    "macro.*"
  ],
  sideEffects: false,
  author: "Emotion Contributors",
  license: "MIT",
  scripts: {
    "test:typescript": "dtslint types"
  },
  dependencies: {
    "@babel/runtime": "^7.18.3",
    "@emotion/babel-plugin": "^11.11.0",
    "@emotion/cache": "^11.11.0",
    "@emotion/serialize": "^1.1.2",
    "@emotion/use-insertion-effect-with-fallbacks": "^1.0.1",
    "@emotion/utils": "^1.2.1",
    "@emotion/weak-memoize": "^0.3.1",
    "hoist-non-react-statics": "^3.3.1"
  },
  peerDependencies: {
    react: ">=16.8.0"
  },
  peerDependenciesMeta: {
    "@types/react": {
      optional: true
    }
  },
  devDependencies: {
    "@definitelytyped/dtslint": "0.0.112",
    "@emotion/css": "11.11.0",
    "@emotion/css-prettifier": "1.1.3",
    "@emotion/server": "11.11.0",
    "@emotion/styled": "11.11.0",
    "html-tag-names": "^1.1.2",
    react: "16.14.0",
    "svg-tag-names": "^1.1.1",
    typescript: "^4.5.5"
  },
  repository: "https://github.com/emotion-js/emotion/tree/main/packages/react",
  publishConfig: {
    access: "public"
  },
  "umd:main": "dist/emotion-react.umd.min.js",
  preconstruct: {
    entrypoints: [
      "./index.js",
      "./jsx-runtime.js",
      "./jsx-dev-runtime.js",
      "./_isolated-hnrs.js"
    ],
    umdName: "emotionReact",
    exports: {
      envConditions: [
        "browser",
        "worker"
      ],
      extra: {
        "./types/css-prop": "./types/css-prop.d.ts",
        "./macro": {
          types: {
            "import": "./macro.d.mts",
            "default": "./macro.d.ts"
          },
          "default": "./macro.js"
        }
      }
    }
  }
};
var jsx = function jsx2(type, props) {
  var args = arguments;
  if (props == null || !hasOwnProperty.call(props, "css")) {
    return React3.createElement.apply(void 0, args);
  }
  var argsLength = args.length;
  var createElementArgArray = new Array(argsLength);
  createElementArgArray[0] = Emotion$1;
  createElementArgArray[1] = createEmotionProps(type, props);
  for (var i = 2; i < argsLength; i++) {
    createElementArgArray[i] = args[i];
  }
  return React3.createElement.apply(null, createElementArgArray);
};
var warnedAboutCssPropForGlobal = false;
var Global = /* @__PURE__ */ withEmotionCache(function(props, cache) {
  if (!warnedAboutCssPropForGlobal && // check for className as well since the user is
  // probably using the custom createElement which
  // means it will be turned into a className prop
  // $FlowFixMe I don't really want to add it to the type since it shouldn't be used
  (props.className || props.css)) {
    console.error("It looks like you're using the css prop on Global, did you mean to use the styles prop instead?");
    warnedAboutCssPropForGlobal = true;
  }
  var styles = props.styles;
  var serialized = serializeStyles([styles], void 0, React3.useContext(ThemeContext));
  if (!isBrowser2) {
    var _ref3;
    var serializedNames = serialized.name;
    var serializedStyles = serialized.styles;
    var next2 = serialized.next;
    while (next2 !== void 0) {
      serializedNames += " " + next2.name;
      serializedStyles += next2.styles;
      next2 = next2.next;
    }
    var shouldCache = cache.compat === true;
    var rules = cache.insert("", {
      name: serializedNames,
      styles: serializedStyles
    }, cache.sheet, shouldCache);
    if (shouldCache) {
      return null;
    }
    return /* @__PURE__ */ React3.createElement("style", (_ref3 = {}, _ref3["data-emotion"] = cache.key + "-global " + serializedNames, _ref3.dangerouslySetInnerHTML = {
      __html: rules
    }, _ref3.nonce = cache.sheet.nonce, _ref3));
  }
  var sheetRef = React3.useRef();
  useInsertionEffectWithLayoutFallback(function() {
    var key = cache.key + "-global";
    var sheet = new cache.sheet.constructor({
      key,
      nonce: cache.sheet.nonce,
      container: cache.sheet.container,
      speedy: cache.sheet.isSpeedy
    });
    var rehydrating = false;
    var node2 = document.querySelector('style[data-emotion="' + key + " " + serialized.name + '"]');
    if (cache.sheet.tags.length) {
      sheet.before = cache.sheet.tags[0];
    }
    if (node2 !== null) {
      rehydrating = true;
      node2.setAttribute("data-emotion", key);
      sheet.hydrate([node2]);
    }
    sheetRef.current = [sheet, rehydrating];
    return function() {
      sheet.flush();
    };
  }, [cache]);
  useInsertionEffectWithLayoutFallback(function() {
    var sheetRefCurrent = sheetRef.current;
    var sheet = sheetRefCurrent[0], rehydrating = sheetRefCurrent[1];
    if (rehydrating) {
      sheetRefCurrent[1] = false;
      return;
    }
    if (serialized.next !== void 0) {
      insertStyles(cache, serialized.next, true);
    }
    if (sheet.tags.length) {
      var element = sheet.tags[sheet.tags.length - 1].nextElementSibling;
      sheet.before = element;
      sheet.flush();
    }
    cache.insert("", serialized, sheet, false);
  }, [cache, serialized.name]);
  return null;
});
if (true) {
  Global.displayName = "EmotionGlobal";
}
function css() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  return serializeStyles(args);
}
var keyframes = function keyframes2() {
  var insertable = css.apply(void 0, arguments);
  var name = "animation-" + insertable.name;
  return {
    name,
    styles: "@keyframes " + name + "{" + insertable.styles + "}",
    anim: 1,
    toString: function toString() {
      return "_EMO_" + this.name + "_" + this.styles + "_EMO_";
    }
  };
};
var classnames = function classnames2(args) {
  var len = args.length;
  var i = 0;
  var cls = "";
  for (; i < len; i++) {
    var arg = args[i];
    if (arg == null)
      continue;
    var toAdd = void 0;
    switch (typeof arg) {
      case "boolean":
        break;
      case "object": {
        if (Array.isArray(arg)) {
          toAdd = classnames2(arg);
        } else {
          if (arg.styles !== void 0 && arg.name !== void 0) {
            console.error("You have passed styles created with `css` from `@emotion/react` package to the `cx`.\n`cx` is meant to compose class names (strings) so you should convert those styles to a class name by passing them to the `css` received from <ClassNames/> component.");
          }
          toAdd = "";
          for (var k in arg) {
            if (arg[k] && k) {
              toAdd && (toAdd += " ");
              toAdd += k;
            }
          }
        }
        break;
      }
      default: {
        toAdd = arg;
      }
    }
    if (toAdd) {
      cls && (cls += " ");
      cls += toAdd;
    }
  }
  return cls;
};
function merge(registered, css5, className) {
  var registeredStyles = [];
  var rawClassName = getRegisteredStyles(registered, registeredStyles, className);
  if (registeredStyles.length < 2) {
    return className;
  }
  return rawClassName + css5(registeredStyles);
}
var Insertion3 = function Insertion4(_ref3) {
  var cache = _ref3.cache, serializedArr = _ref3.serializedArr;
  useInsertionEffectAlwaysWithSyncFallback(function() {
    for (var i = 0; i < serializedArr.length; i++) {
      insertStyles(cache, serializedArr[i], false);
    }
  });
  return null;
};
var ClassNames = /* @__PURE__ */ withEmotionCache(function(props, cache) {
  var hasRendered = false;
  var serializedArr = [];
  var css5 = function css6() {
    if (hasRendered && true) {
      throw new Error("css can only be used during render");
    }
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var serialized = serializeStyles(args, cache.registered);
    serializedArr.push(serialized);
    registerStyles(cache, serialized, false);
    return cache.key + "-" + serialized.name;
  };
  var cx = function cx2() {
    if (hasRendered && true) {
      throw new Error("cx can only be used during render");
    }
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    return merge(cache.registered, css5, classnames(args));
  };
  var content = {
    css: css5,
    cx,
    theme: React3.useContext(ThemeContext)
  };
  var ele = props.children(content);
  hasRendered = true;
  return /* @__PURE__ */ React3.createElement(React3.Fragment, null, /* @__PURE__ */ React3.createElement(Insertion3, {
    cache,
    serializedArr
  }), ele);
});
if (true) {
  ClassNames.displayName = "EmotionClassNames";
}
if (true) {
  isBrowser3 = true;
  isTestEnv = typeof jest !== "undefined" || typeof vi !== "undefined";
  if (isBrowser3 && !isTestEnv) {
    globalContext = // $FlowIgnore
    typeof globalThis !== "undefined" ? globalThis : isBrowser3 ? window : globalThis;
    globalKey = "__EMOTION_REACT_" + pkg.version.split(".")[0] + "__";
    if (globalContext[globalKey]) {
      console.warn("You are loading @emotion/react when it is already loaded. Running multiple instances may cause problems. This can happen if multiple versions are used, or if multiple builds of the same version are used.");
    }
    globalContext[globalKey] = true;
  }
}
var isBrowser3;
var isTestEnv;
var globalContext;
var globalKey;

// node_modules/@babel/runtime/helpers/esm/taggedTemplateLiteral.js
function _taggedTemplateLiteral(strings4, raw) {
  if (!raw) {
    raw = strings4.slice(0);
  }
  return Object.freeze(Object.defineProperties(strings4, {
    raw: {
      value: Object.freeze(raw)
    }
  }));
}

// node_modules/react-select/dist/index-a301f526.esm.js
var import_react6 = __toESM(require_react());
var import_react_dom = __toESM(require_react_dom());

// node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var min = Math.min;
var max = Math.max;
var round = Math.round;
var floor = Math.floor;
var createCoords = (v) => ({
  x: v,
  y: v
});
function rectToClientRect(rect) {
  return {
    ...rect,
    top: rect.y,
    left: rect.x,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height
  };
}

// node_modules/@floating-ui/utils/dom/dist/floating-ui.utils.dom.mjs
function getNodeName(node2) {
  if (isNode(node2)) {
    return (node2.nodeName || "").toLowerCase();
  }
  return "#document";
}
function getWindow(node2) {
  var _node$ownerDocument;
  return (node2 == null ? void 0 : (_node$ownerDocument = node2.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function getDocumentElement(node2) {
  var _ref3;
  return (_ref3 = (isNode(node2) ? node2.ownerDocument : node2.document) || window.document) == null ? void 0 : _ref3.documentElement;
}
function isNode(value) {
  return value instanceof Node || value instanceof getWindow(value).Node;
}
function isElement(value) {
  return value instanceof Element || value instanceof getWindow(value).Element;
}
function isHTMLElement(value) {
  return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
}
function isShadowRoot(value) {
  if (typeof ShadowRoot === "undefined") {
    return false;
  }
  return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
}
function isOverflowElement(element) {
  const {
    overflow,
    overflowX,
    overflowY,
    display
  } = getComputedStyle2(element);
  return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !["inline", "contents"].includes(display);
}
function isWebKit() {
  if (typeof CSS === "undefined" || !CSS.supports)
    return false;
  return CSS.supports("-webkit-backdrop-filter", "none");
}
function isLastTraversableNode(node2) {
  return ["html", "body", "#document"].includes(getNodeName(node2));
}
function getComputedStyle2(element) {
  return getWindow(element).getComputedStyle(element);
}
function getParentNode(node2) {
  if (getNodeName(node2) === "html") {
    return node2;
  }
  const result = (
    // Step into the shadow DOM of the parent of a slotted node.
    node2.assignedSlot || // DOM Element detected.
    node2.parentNode || // ShadowRoot detected.
    isShadowRoot(node2) && node2.host || // Fallback.
    getDocumentElement(node2)
  );
  return isShadowRoot(result) ? result.host : result;
}
function getNearestOverflowAncestor(node2) {
  const parentNode = getParentNode(node2);
  if (isLastTraversableNode(parentNode)) {
    return node2.ownerDocument ? node2.ownerDocument.body : node2.body;
  }
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
    return parentNode;
  }
  return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(node2, list, traverseIframes) {
  var _node$ownerDocument2;
  if (list === void 0) {
    list = [];
  }
  if (traverseIframes === void 0) {
    traverseIframes = true;
  }
  const scrollableAncestor = getNearestOverflowAncestor(node2);
  const isBody = scrollableAncestor === ((_node$ownerDocument2 = node2.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
  const win = getWindow(scrollableAncestor);
  if (isBody) {
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], win.frameElement && traverseIframes ? getOverflowAncestors(win.frameElement) : []);
  }
  return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
}

// node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function getCssDimensions(element) {
  const css5 = getComputedStyle2(element);
  let width = parseFloat(css5.width) || 0;
  let height = parseFloat(css5.height) || 0;
  const hasOffset = isHTMLElement(element);
  const offsetWidth = hasOffset ? element.offsetWidth : width;
  const offsetHeight = hasOffset ? element.offsetHeight : height;
  const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
  if (shouldFallback) {
    width = offsetWidth;
    height = offsetHeight;
  }
  return {
    width,
    height,
    $: shouldFallback
  };
}
function unwrapElement(element) {
  return !isElement(element) ? element.contextElement : element;
}
function getScale(element) {
  const domElement = unwrapElement(element);
  if (!isHTMLElement(domElement)) {
    return createCoords(1);
  }
  const rect = domElement.getBoundingClientRect();
  const {
    width,
    height,
    $
  } = getCssDimensions(domElement);
  let x = ($ ? round(rect.width) : rect.width) / width;
  let y = ($ ? round(rect.height) : rect.height) / height;
  if (!x || !Number.isFinite(x)) {
    x = 1;
  }
  if (!y || !Number.isFinite(y)) {
    y = 1;
  }
  return {
    x,
    y
  };
}
var noOffsets = /* @__PURE__ */ createCoords(0);
function getVisualOffsets(element) {
  const win = getWindow(element);
  if (!isWebKit() || !win.visualViewport) {
    return noOffsets;
  }
  return {
    x: win.visualViewport.offsetLeft,
    y: win.visualViewport.offsetTop
  };
}
function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
  if (isFixed === void 0) {
    isFixed = false;
  }
  if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) {
    return false;
  }
  return isFixed;
}
function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
  if (includeScale === void 0) {
    includeScale = false;
  }
  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }
  const clientRect = element.getBoundingClientRect();
  const domElement = unwrapElement(element);
  let scale = createCoords(1);
  if (includeScale) {
    if (offsetParent) {
      if (isElement(offsetParent)) {
        scale = getScale(offsetParent);
      }
    } else {
      scale = getScale(element);
    }
  }
  const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
  let x = (clientRect.left + visualOffsets.x) / scale.x;
  let y = (clientRect.top + visualOffsets.y) / scale.y;
  let width = clientRect.width / scale.x;
  let height = clientRect.height / scale.y;
  if (domElement) {
    const win = getWindow(domElement);
    const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
    let currentIFrame = win.frameElement;
    while (currentIFrame && offsetParent && offsetWin !== win) {
      const iframeScale = getScale(currentIFrame);
      const iframeRect = currentIFrame.getBoundingClientRect();
      const css5 = getComputedStyle2(currentIFrame);
      const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css5.paddingLeft)) * iframeScale.x;
      const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css5.paddingTop)) * iframeScale.y;
      x *= iframeScale.x;
      y *= iframeScale.y;
      width *= iframeScale.x;
      height *= iframeScale.y;
      x += left;
      y += top;
      currentIFrame = getWindow(currentIFrame).frameElement;
    }
  }
  return rectToClientRect({
    width,
    height,
    x,
    y
  });
}
function observeMove(element, onMove) {
  let io = null;
  let timeoutId;
  const root = getDocumentElement(element);
  function cleanup() {
    clearTimeout(timeoutId);
    io && io.disconnect();
    io = null;
  }
  function refresh(skip, threshold) {
    if (skip === void 0) {
      skip = false;
    }
    if (threshold === void 0) {
      threshold = 1;
    }
    cleanup();
    const {
      left,
      top,
      width,
      height
    } = element.getBoundingClientRect();
    if (!skip) {
      onMove();
    }
    if (!width || !height) {
      return;
    }
    const insetTop = floor(top);
    const insetRight = floor(root.clientWidth - (left + width));
    const insetBottom = floor(root.clientHeight - (top + height));
    const insetLeft = floor(left);
    const rootMargin = -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px";
    const options2 = {
      rootMargin,
      threshold: max(0, min(1, threshold)) || 1
    };
    let isFirstUpdate = true;
    function handleObserve(entries) {
      const ratio = entries[0].intersectionRatio;
      if (ratio !== threshold) {
        if (!isFirstUpdate) {
          return refresh();
        }
        if (!ratio) {
          timeoutId = setTimeout(() => {
            refresh(false, 1e-7);
          }, 100);
        } else {
          refresh(false, ratio);
        }
      }
      isFirstUpdate = false;
    }
    try {
      io = new IntersectionObserver(handleObserve, {
        ...options2,
        // Handle <iframe>s
        root: root.ownerDocument
      });
    } catch (e) {
      io = new IntersectionObserver(handleObserve, options2);
    }
    io.observe(element);
  }
  refresh(true);
  return cleanup;
}
function autoUpdate(reference, floating, update, options2) {
  if (options2 === void 0) {
    options2 = {};
  }
  const {
    ancestorScroll = true,
    ancestorResize = true,
    elementResize = typeof ResizeObserver === "function",
    layoutShift = typeof IntersectionObserver === "function",
    animationFrame = false
  } = options2;
  const referenceEl = unwrapElement(reference);
  const ancestors = ancestorScroll || ancestorResize ? [...referenceEl ? getOverflowAncestors(referenceEl) : [], ...getOverflowAncestors(floating)] : [];
  ancestors.forEach((ancestor) => {
    ancestorScroll && ancestor.addEventListener("scroll", update, {
      passive: true
    });
    ancestorResize && ancestor.addEventListener("resize", update);
  });
  const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update) : null;
  let reobserveFrame = -1;
  let resizeObserver = null;
  if (elementResize) {
    resizeObserver = new ResizeObserver((_ref3) => {
      let [firstEntry] = _ref3;
      if (firstEntry && firstEntry.target === referenceEl && resizeObserver) {
        resizeObserver.unobserve(floating);
        cancelAnimationFrame(reobserveFrame);
        reobserveFrame = requestAnimationFrame(() => {
          resizeObserver && resizeObserver.observe(floating);
        });
      }
      update();
    });
    if (referenceEl && !animationFrame) {
      resizeObserver.observe(referenceEl);
    }
    resizeObserver.observe(floating);
  }
  let frameId;
  let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
  if (animationFrame) {
    frameLoop();
  }
  function frameLoop() {
    const nextRefRect = getBoundingClientRect(reference);
    if (prevRefRect && (nextRefRect.x !== prevRefRect.x || nextRefRect.y !== prevRefRect.y || nextRefRect.width !== prevRefRect.width || nextRefRect.height !== prevRefRect.height)) {
      update();
    }
    prevRefRect = nextRefRect;
    frameId = requestAnimationFrame(frameLoop);
  }
  update();
  return () => {
    ancestors.forEach((ancestor) => {
      ancestorScroll && ancestor.removeEventListener("scroll", update);
      ancestorResize && ancestor.removeEventListener("resize", update);
    });
    cleanupIo && cleanupIo();
    resizeObserver && resizeObserver.disconnect();
    resizeObserver = null;
    if (animationFrame) {
      cancelAnimationFrame(frameId);
    }
  };
}

// node_modules/use-isomorphic-layout-effect/dist/use-isomorphic-layout-effect.browser.esm.js
var import_react4 = __toESM(require_react());
var index = import_react4.useLayoutEffect;
var use_isomorphic_layout_effect_browser_esm_default = index;

// node_modules/react-select/dist/index-a301f526.esm.js
var _excluded$4 = ["className", "clearValue", "cx", "getStyles", "getClassNames", "getValue", "hasValue", "isMulti", "isRtl", "options", "selectOption", "selectProps", "setValue", "theme"];
var noop = function noop2() {
};
function applyPrefixToName(prefix2, name) {
  if (!name) {
    return prefix2;
  } else if (name[0] === "-") {
    return prefix2 + name;
  } else {
    return prefix2 + "__" + name;
  }
}
function classNames(prefix2, state) {
  for (var _len = arguments.length, classNameList = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    classNameList[_key - 2] = arguments[_key];
  }
  var arr = [].concat(classNameList);
  if (state && prefix2) {
    for (var key in state) {
      if (state.hasOwnProperty(key) && state[key]) {
        arr.push("".concat(applyPrefixToName(prefix2, key)));
      }
    }
  }
  return arr.filter(function(i) {
    return i;
  }).map(function(i) {
    return String(i).trim();
  }).join(" ");
}
var cleanValue = function cleanValue2(value) {
  if (isArray(value))
    return value.filter(Boolean);
  if (_typeof(value) === "object" && value !== null)
    return [value];
  return [];
};
var cleanCommonProps = function cleanCommonProps2(props) {
  props.className;
  props.clearValue;
  props.cx;
  props.getStyles;
  props.getClassNames;
  props.getValue;
  props.hasValue;
  props.isMulti;
  props.isRtl;
  props.options;
  props.selectOption;
  props.selectProps;
  props.setValue;
  props.theme;
  var innerProps = _objectWithoutProperties(props, _excluded$4);
  return _objectSpread2({}, innerProps);
};
var getStyleProps = function getStyleProps2(props, name, classNamesState) {
  var cx = props.cx, getStyles = props.getStyles, getClassNames = props.getClassNames, className = props.className;
  return {
    css: getStyles(name, props),
    className: cx(classNamesState !== null && classNamesState !== void 0 ? classNamesState : {}, getClassNames(name, props), className)
  };
};
function isDocumentElement(el) {
  return [document.documentElement, document.body, window].indexOf(el) > -1;
}
function normalizedHeight(el) {
  if (isDocumentElement(el)) {
    return window.innerHeight;
  }
  return el.clientHeight;
}
function getScrollTop(el) {
  if (isDocumentElement(el)) {
    return window.pageYOffset;
  }
  return el.scrollTop;
}
function scrollTo(el, top) {
  if (isDocumentElement(el)) {
    window.scrollTo(0, top);
    return;
  }
  el.scrollTop = top;
}
function getScrollParent(element) {
  var style = getComputedStyle(element);
  var excludeStaticParent = style.position === "absolute";
  var overflowRx = /(auto|scroll)/;
  if (style.position === "fixed")
    return document.documentElement;
  for (var parent = element; parent = parent.parentElement; ) {
    style = getComputedStyle(parent);
    if (excludeStaticParent && style.position === "static") {
      continue;
    }
    if (overflowRx.test(style.overflow + style.overflowY + style.overflowX)) {
      return parent;
    }
  }
  return document.documentElement;
}
function easeOutCubic(t, b, c, d) {
  return c * ((t = t / d - 1) * t * t + 1) + b;
}
function animatedScrollTo(element, to) {
  var duration = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 200;
  var callback = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : noop;
  var start = getScrollTop(element);
  var change = to - start;
  var increment = 10;
  var currentTime = 0;
  function animateScroll() {
    currentTime += increment;
    var val = easeOutCubic(currentTime, start, change, duration);
    scrollTo(element, val);
    if (currentTime < duration) {
      window.requestAnimationFrame(animateScroll);
    } else {
      callback(element);
    }
  }
  animateScroll();
}
function scrollIntoView(menuEl, focusedEl) {
  var menuRect = menuEl.getBoundingClientRect();
  var focusedRect = focusedEl.getBoundingClientRect();
  var overScroll = focusedEl.offsetHeight / 3;
  if (focusedRect.bottom + overScroll > menuRect.bottom) {
    scrollTo(menuEl, Math.min(focusedEl.offsetTop + focusedEl.clientHeight - menuEl.offsetHeight + overScroll, menuEl.scrollHeight));
  } else if (focusedRect.top - overScroll < menuRect.top) {
    scrollTo(menuEl, Math.max(focusedEl.offsetTop - overScroll, 0));
  }
}
function getBoundingClientObj(element) {
  var rect = element.getBoundingClientRect();
  return {
    bottom: rect.bottom,
    height: rect.height,
    left: rect.left,
    right: rect.right,
    top: rect.top,
    width: rect.width
  };
}
function isTouchCapable() {
  try {
    document.createEvent("TouchEvent");
    return true;
  } catch (e) {
    return false;
  }
}
function isMobileDevice() {
  try {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  } catch (e) {
    return false;
  }
}
var passiveOptionAccessed = false;
var options = {
  get passive() {
    return passiveOptionAccessed = true;
  }
};
var w = typeof window !== "undefined" ? window : {};
if (w.addEventListener && w.removeEventListener) {
  w.addEventListener("p", noop, options);
  w.removeEventListener("p", noop, false);
}
var supportsPassiveEvents = passiveOptionAccessed;
function notNullish(item) {
  return item != null;
}
function isArray(arg) {
  return Array.isArray(arg);
}
function valueTernary(isMulti, multiValue, singleValue) {
  return isMulti ? multiValue : singleValue;
}
function singleValueAsValue(singleValue) {
  return singleValue;
}
function multiValueAsValue(multiValue) {
  return multiValue;
}
var removeProps = function removeProps2(propsObj) {
  for (var _len2 = arguments.length, properties = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    properties[_key2 - 1] = arguments[_key2];
  }
  var propsMap = Object.entries(propsObj).filter(function(_ref3) {
    var _ref23 = _slicedToArray(_ref3, 1), key = _ref23[0];
    return !properties.includes(key);
  });
  return propsMap.reduce(function(newProps, _ref3) {
    var _ref4 = _slicedToArray(_ref3, 2), key = _ref4[0], val = _ref4[1];
    newProps[key] = val;
    return newProps;
  }, {});
};
var _excluded$3 = ["children", "innerProps"];
var _excluded2$1 = ["children", "innerProps"];
function getMenuPlacement(_ref3) {
  var preferredMaxHeight = _ref3.maxHeight, menuEl = _ref3.menuEl, minHeight = _ref3.minHeight, preferredPlacement = _ref3.placement, shouldScroll = _ref3.shouldScroll, isFixedPosition = _ref3.isFixedPosition, controlHeight2 = _ref3.controlHeight;
  var scrollParent = getScrollParent(menuEl);
  var defaultState = {
    placement: "bottom",
    maxHeight: preferredMaxHeight
  };
  if (!menuEl || !menuEl.offsetParent)
    return defaultState;
  var _scrollParent$getBoun = scrollParent.getBoundingClientRect(), scrollHeight = _scrollParent$getBoun.height;
  var _menuEl$getBoundingCl = menuEl.getBoundingClientRect(), menuBottom = _menuEl$getBoundingCl.bottom, menuHeight = _menuEl$getBoundingCl.height, menuTop = _menuEl$getBoundingCl.top;
  var _menuEl$offsetParent$ = menuEl.offsetParent.getBoundingClientRect(), containerTop = _menuEl$offsetParent$.top;
  var viewHeight = isFixedPosition ? window.innerHeight : normalizedHeight(scrollParent);
  var scrollTop = getScrollTop(scrollParent);
  var marginBottom = parseInt(getComputedStyle(menuEl).marginBottom, 10);
  var marginTop = parseInt(getComputedStyle(menuEl).marginTop, 10);
  var viewSpaceAbove = containerTop - marginTop;
  var viewSpaceBelow = viewHeight - menuTop;
  var scrollSpaceAbove = viewSpaceAbove + scrollTop;
  var scrollSpaceBelow = scrollHeight - scrollTop - menuTop;
  var scrollDown = menuBottom - viewHeight + scrollTop + marginBottom;
  var scrollUp = scrollTop + menuTop - marginTop;
  var scrollDuration = 160;
  switch (preferredPlacement) {
    case "auto":
    case "bottom":
      if (viewSpaceBelow >= menuHeight) {
        return {
          placement: "bottom",
          maxHeight: preferredMaxHeight
        };
      }
      if (scrollSpaceBelow >= menuHeight && !isFixedPosition) {
        if (shouldScroll) {
          animatedScrollTo(scrollParent, scrollDown, scrollDuration);
        }
        return {
          placement: "bottom",
          maxHeight: preferredMaxHeight
        };
      }
      if (!isFixedPosition && scrollSpaceBelow >= minHeight || isFixedPosition && viewSpaceBelow >= minHeight) {
        if (shouldScroll) {
          animatedScrollTo(scrollParent, scrollDown, scrollDuration);
        }
        var constrainedHeight = isFixedPosition ? viewSpaceBelow - marginBottom : scrollSpaceBelow - marginBottom;
        return {
          placement: "bottom",
          maxHeight: constrainedHeight
        };
      }
      if (preferredPlacement === "auto" || isFixedPosition) {
        var _constrainedHeight = preferredMaxHeight;
        var spaceAbove = isFixedPosition ? viewSpaceAbove : scrollSpaceAbove;
        if (spaceAbove >= minHeight) {
          _constrainedHeight = Math.min(spaceAbove - marginBottom - controlHeight2, preferredMaxHeight);
        }
        return {
          placement: "top",
          maxHeight: _constrainedHeight
        };
      }
      if (preferredPlacement === "bottom") {
        if (shouldScroll) {
          scrollTo(scrollParent, scrollDown);
        }
        return {
          placement: "bottom",
          maxHeight: preferredMaxHeight
        };
      }
      break;
    case "top":
      if (viewSpaceAbove >= menuHeight) {
        return {
          placement: "top",
          maxHeight: preferredMaxHeight
        };
      }
      if (scrollSpaceAbove >= menuHeight && !isFixedPosition) {
        if (shouldScroll) {
          animatedScrollTo(scrollParent, scrollUp, scrollDuration);
        }
        return {
          placement: "top",
          maxHeight: preferredMaxHeight
        };
      }
      if (!isFixedPosition && scrollSpaceAbove >= minHeight || isFixedPosition && viewSpaceAbove >= minHeight) {
        var _constrainedHeight2 = preferredMaxHeight;
        if (!isFixedPosition && scrollSpaceAbove >= minHeight || isFixedPosition && viewSpaceAbove >= minHeight) {
          _constrainedHeight2 = isFixedPosition ? viewSpaceAbove - marginTop : scrollSpaceAbove - marginTop;
        }
        if (shouldScroll) {
          animatedScrollTo(scrollParent, scrollUp, scrollDuration);
        }
        return {
          placement: "top",
          maxHeight: _constrainedHeight2
        };
      }
      return {
        placement: "bottom",
        maxHeight: preferredMaxHeight
      };
    default:
      throw new Error('Invalid placement provided "'.concat(preferredPlacement, '".'));
  }
  return defaultState;
}
function alignToControl(placement) {
  var placementToCSSProp = {
    bottom: "top",
    top: "bottom"
  };
  return placement ? placementToCSSProp[placement] : "bottom";
}
var coercePlacement = function coercePlacement2(p) {
  return p === "auto" ? "bottom" : p;
};
var menuCSS = function menuCSS2(_ref23, unstyled) {
  var _objectSpread22;
  var placement = _ref23.placement, _ref2$theme = _ref23.theme, borderRadius2 = _ref2$theme.borderRadius, spacing2 = _ref2$theme.spacing, colors2 = _ref2$theme.colors;
  return _objectSpread2((_objectSpread22 = {
    label: "menu"
  }, _defineProperty(_objectSpread22, alignToControl(placement), "100%"), _defineProperty(_objectSpread22, "position", "absolute"), _defineProperty(_objectSpread22, "width", "100%"), _defineProperty(_objectSpread22, "zIndex", 1), _objectSpread22), unstyled ? {} : {
    backgroundColor: colors2.neutral0,
    borderRadius: borderRadius2,
    boxShadow: "0 0 0 1px hsla(0, 0%, 0%, 0.1), 0 4px 11px hsla(0, 0%, 0%, 0.1)",
    marginBottom: spacing2.menuGutter,
    marginTop: spacing2.menuGutter
  });
};
var PortalPlacementContext = /* @__PURE__ */ (0, import_react6.createContext)(null);
var MenuPlacer = function MenuPlacer2(props) {
  var children = props.children, minMenuHeight = props.minMenuHeight, maxMenuHeight = props.maxMenuHeight, menuPlacement = props.menuPlacement, menuPosition = props.menuPosition, menuShouldScrollIntoView = props.menuShouldScrollIntoView, theme = props.theme;
  var _ref3 = (0, import_react6.useContext)(PortalPlacementContext) || {}, setPortalPlacement = _ref3.setPortalPlacement;
  var ref = (0, import_react6.useRef)(null);
  var _useState = (0, import_react6.useState)(maxMenuHeight), _useState2 = _slicedToArray(_useState, 2), maxHeight = _useState2[0], setMaxHeight = _useState2[1];
  var _useState3 = (0, import_react6.useState)(null), _useState4 = _slicedToArray(_useState3, 2), placement = _useState4[0], setPlacement = _useState4[1];
  var controlHeight2 = theme.spacing.controlHeight;
  use_isomorphic_layout_effect_browser_esm_default(function() {
    var menuEl = ref.current;
    if (!menuEl)
      return;
    var isFixedPosition = menuPosition === "fixed";
    var shouldScroll = menuShouldScrollIntoView && !isFixedPosition;
    var state = getMenuPlacement({
      maxHeight: maxMenuHeight,
      menuEl,
      minHeight: minMenuHeight,
      placement: menuPlacement,
      shouldScroll,
      isFixedPosition,
      controlHeight: controlHeight2
    });
    setMaxHeight(state.maxHeight);
    setPlacement(state.placement);
    setPortalPlacement === null || setPortalPlacement === void 0 ? void 0 : setPortalPlacement(state.placement);
  }, [maxMenuHeight, menuPlacement, menuPosition, menuShouldScrollIntoView, minMenuHeight, setPortalPlacement, controlHeight2]);
  return children({
    ref,
    placerProps: _objectSpread2(_objectSpread2({}, props), {}, {
      placement: placement || coercePlacement(menuPlacement),
      maxHeight
    })
  });
};
var Menu = function Menu2(props) {
  var children = props.children, innerRef = props.innerRef, innerProps = props.innerProps;
  return jsx("div", _extends({}, getStyleProps(props, "menu", {
    menu: true
  }), {
    ref: innerRef
  }, innerProps), children);
};
var Menu$1 = Menu;
var menuListCSS = function menuListCSS2(_ref4, unstyled) {
  var maxHeight = _ref4.maxHeight, baseUnit2 = _ref4.theme.spacing.baseUnit;
  return _objectSpread2({
    maxHeight,
    overflowY: "auto",
    position: "relative",
    // required for offset[Height, Top] > keyboard scroll
    WebkitOverflowScrolling: "touch"
  }, unstyled ? {} : {
    paddingBottom: baseUnit2,
    paddingTop: baseUnit2
  });
};
var MenuList = function MenuList2(props) {
  var children = props.children, innerProps = props.innerProps, innerRef = props.innerRef, isMulti = props.isMulti;
  return jsx("div", _extends({}, getStyleProps(props, "menuList", {
    "menu-list": true,
    "menu-list--is-multi": isMulti
  }), {
    ref: innerRef
  }, innerProps), children);
};
var noticeCSS = function noticeCSS2(_ref5, unstyled) {
  var _ref5$theme = _ref5.theme, baseUnit2 = _ref5$theme.spacing.baseUnit, colors2 = _ref5$theme.colors;
  return _objectSpread2({
    textAlign: "center"
  }, unstyled ? {} : {
    color: colors2.neutral40,
    padding: "".concat(baseUnit2 * 2, "px ").concat(baseUnit2 * 3, "px")
  });
};
var noOptionsMessageCSS = noticeCSS;
var loadingMessageCSS = noticeCSS;
var NoOptionsMessage = function NoOptionsMessage2(_ref6) {
  var _ref6$children = _ref6.children, children = _ref6$children === void 0 ? "No options" : _ref6$children, innerProps = _ref6.innerProps, restProps = _objectWithoutProperties(_ref6, _excluded$3);
  return jsx("div", _extends({}, getStyleProps(_objectSpread2(_objectSpread2({}, restProps), {}, {
    children,
    innerProps
  }), "noOptionsMessage", {
    "menu-notice": true,
    "menu-notice--no-options": true
  }), innerProps), children);
};
var LoadingMessage = function LoadingMessage2(_ref7) {
  var _ref7$children = _ref7.children, children = _ref7$children === void 0 ? "Loading..." : _ref7$children, innerProps = _ref7.innerProps, restProps = _objectWithoutProperties(_ref7, _excluded2$1);
  return jsx("div", _extends({}, getStyleProps(_objectSpread2(_objectSpread2({}, restProps), {}, {
    children,
    innerProps
  }), "loadingMessage", {
    "menu-notice": true,
    "menu-notice--loading": true
  }), innerProps), children);
};
var menuPortalCSS = function menuPortalCSS2(_ref8) {
  var rect = _ref8.rect, offset = _ref8.offset, position2 = _ref8.position;
  return {
    left: rect.left,
    position: position2,
    top: offset,
    width: rect.width,
    zIndex: 1
  };
};
var MenuPortal = function MenuPortal2(props) {
  var appendTo = props.appendTo, children = props.children, controlElement = props.controlElement, innerProps = props.innerProps, menuPlacement = props.menuPlacement, menuPosition = props.menuPosition;
  var menuPortalRef = (0, import_react6.useRef)(null);
  var cleanupRef = (0, import_react6.useRef)(null);
  var _useState5 = (0, import_react6.useState)(coercePlacement(menuPlacement)), _useState6 = _slicedToArray(_useState5, 2), placement = _useState6[0], setPortalPlacement = _useState6[1];
  var portalPlacementContext = (0, import_react6.useMemo)(function() {
    return {
      setPortalPlacement
    };
  }, []);
  var _useState7 = (0, import_react6.useState)(null), _useState8 = _slicedToArray(_useState7, 2), computedPosition = _useState8[0], setComputedPosition = _useState8[1];
  var updateComputedPosition = (0, import_react6.useCallback)(function() {
    if (!controlElement)
      return;
    var rect = getBoundingClientObj(controlElement);
    var scrollDistance = menuPosition === "fixed" ? 0 : window.pageYOffset;
    var offset = rect[placement] + scrollDistance;
    if (offset !== (computedPosition === null || computedPosition === void 0 ? void 0 : computedPosition.offset) || rect.left !== (computedPosition === null || computedPosition === void 0 ? void 0 : computedPosition.rect.left) || rect.width !== (computedPosition === null || computedPosition === void 0 ? void 0 : computedPosition.rect.width)) {
      setComputedPosition({
        offset,
        rect
      });
    }
  }, [controlElement, menuPosition, placement, computedPosition === null || computedPosition === void 0 ? void 0 : computedPosition.offset, computedPosition === null || computedPosition === void 0 ? void 0 : computedPosition.rect.left, computedPosition === null || computedPosition === void 0 ? void 0 : computedPosition.rect.width]);
  use_isomorphic_layout_effect_browser_esm_default(function() {
    updateComputedPosition();
  }, [updateComputedPosition]);
  var runAutoUpdate = (0, import_react6.useCallback)(function() {
    if (typeof cleanupRef.current === "function") {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    if (controlElement && menuPortalRef.current) {
      cleanupRef.current = autoUpdate(controlElement, menuPortalRef.current, updateComputedPosition, {
        elementResize: "ResizeObserver" in window
      });
    }
  }, [controlElement, updateComputedPosition]);
  use_isomorphic_layout_effect_browser_esm_default(function() {
    runAutoUpdate();
  }, [runAutoUpdate]);
  var setMenuPortalElement = (0, import_react6.useCallback)(function(menuPortalElement) {
    menuPortalRef.current = menuPortalElement;
    runAutoUpdate();
  }, [runAutoUpdate]);
  if (!appendTo && menuPosition !== "fixed" || !computedPosition)
    return null;
  var menuWrapper = jsx("div", _extends({
    ref: setMenuPortalElement
  }, getStyleProps(_objectSpread2(_objectSpread2({}, props), {}, {
    offset: computedPosition.offset,
    position: menuPosition,
    rect: computedPosition.rect
  }), "menuPortal", {
    "menu-portal": true
  }), innerProps), children);
  return jsx(PortalPlacementContext.Provider, {
    value: portalPlacementContext
  }, appendTo ? /* @__PURE__ */ (0, import_react_dom.createPortal)(menuWrapper, appendTo) : menuWrapper);
};
var containerCSS = function containerCSS2(_ref3) {
  var isDisabled = _ref3.isDisabled, isRtl = _ref3.isRtl;
  return {
    label: "container",
    direction: isRtl ? "rtl" : void 0,
    pointerEvents: isDisabled ? "none" : void 0,
    // cancel mouse events when disabled
    position: "relative"
  };
};
var SelectContainer = function SelectContainer2(props) {
  var children = props.children, innerProps = props.innerProps, isDisabled = props.isDisabled, isRtl = props.isRtl;
  return jsx("div", _extends({}, getStyleProps(props, "container", {
    "--is-disabled": isDisabled,
    "--is-rtl": isRtl
  }), innerProps), children);
};
var valueContainerCSS = function valueContainerCSS2(_ref23, unstyled) {
  var spacing2 = _ref23.theme.spacing, isMulti = _ref23.isMulti, hasValue = _ref23.hasValue, controlShouldRenderValue = _ref23.selectProps.controlShouldRenderValue;
  return _objectSpread2({
    alignItems: "center",
    display: isMulti && hasValue && controlShouldRenderValue ? "flex" : "grid",
    flex: 1,
    flexWrap: "wrap",
    WebkitOverflowScrolling: "touch",
    position: "relative",
    overflow: "hidden"
  }, unstyled ? {} : {
    padding: "".concat(spacing2.baseUnit / 2, "px ").concat(spacing2.baseUnit * 2, "px")
  });
};
var ValueContainer = function ValueContainer2(props) {
  var children = props.children, innerProps = props.innerProps, isMulti = props.isMulti, hasValue = props.hasValue;
  return jsx("div", _extends({}, getStyleProps(props, "valueContainer", {
    "value-container": true,
    "value-container--is-multi": isMulti,
    "value-container--has-value": hasValue
  }), innerProps), children);
};
var indicatorsContainerCSS = function indicatorsContainerCSS2() {
  return {
    alignItems: "center",
    alignSelf: "stretch",
    display: "flex",
    flexShrink: 0
  };
};
var IndicatorsContainer = function IndicatorsContainer2(props) {
  var children = props.children, innerProps = props.innerProps;
  return jsx("div", _extends({}, getStyleProps(props, "indicatorsContainer", {
    indicators: true
  }), innerProps), children);
};
var _templateObject;
var _excluded$2 = ["size"];
var _excluded2 = ["innerProps", "isRtl", "size"];
function _EMOTION_STRINGIFIED_CSS_ERROR__() {
  return "You have tried to stringify object returned from `css` function. It isn't supposed to be used directly (e.g. as value of the `className` prop), but rather handed to emotion so it can handle it (e.g. as value of `css` prop).";
}
var _ref2 = false ? {
  name: "8mmkcg",
  styles: "display:inline-block;fill:currentColor;line-height:1;stroke:currentColor;stroke-width:0"
} : {
  name: "tj5bde-Svg",
  styles: "display:inline-block;fill:currentColor;line-height:1;stroke:currentColor;stroke-width:0;label:Svg;",
  map: "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGljYXRvcnMudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQXlCSSIsImZpbGUiOiJpbmRpY2F0b3JzLnRzeCIsInNvdXJjZXNDb250ZW50IjpbIi8qKiBAanN4IGpzeCAqL1xuaW1wb3J0IHsgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsganN4LCBrZXlmcmFtZXMgfSBmcm9tICdAZW1vdGlvbi9yZWFjdCc7XG5cbmltcG9ydCB7XG4gIENvbW1vblByb3BzQW5kQ2xhc3NOYW1lLFxuICBDU1NPYmplY3RXaXRoTGFiZWwsXG4gIEdyb3VwQmFzZSxcbn0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgZ2V0U3R5bGVQcm9wcyB9IGZyb20gJy4uL3V0aWxzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBEcm9wZG93biAmIENsZWFyIEljb25zXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuY29uc3QgU3ZnID0gKHtcbiAgc2l6ZSxcbiAgLi4ucHJvcHNcbn06IEpTWC5JbnRyaW5zaWNFbGVtZW50c1snc3ZnJ10gJiB7IHNpemU6IG51bWJlciB9KSA9PiAoXG4gIDxzdmdcbiAgICBoZWlnaHQ9e3NpemV9XG4gICAgd2lkdGg9e3NpemV9XG4gICAgdmlld0JveD1cIjAgMCAyMCAyMFwiXG4gICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcbiAgICBmb2N1c2FibGU9XCJmYWxzZVwiXG4gICAgY3NzPXt7XG4gICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcbiAgICAgIGZpbGw6ICdjdXJyZW50Q29sb3InLFxuICAgICAgbGluZUhlaWdodDogMSxcbiAgICAgIHN0cm9rZTogJ2N1cnJlbnRDb2xvcicsXG4gICAgICBzdHJva2VXaWR0aDogMCxcbiAgICB9fVxuICAgIHsuLi5wcm9wc31cbiAgLz5cbik7XG5cbmV4cG9ydCB0eXBlIENyb3NzSWNvblByb3BzID0gSlNYLkludHJpbnNpY0VsZW1lbnRzWydzdmcnXSAmIHsgc2l6ZT86IG51bWJlciB9O1xuZXhwb3J0IGNvbnN0IENyb3NzSWNvbiA9IChwcm9wczogQ3Jvc3NJY29uUHJvcHMpID0+IChcbiAgPFN2ZyBzaXplPXsyMH0gey4uLnByb3BzfT5cbiAgICA8cGF0aCBkPVwiTTE0LjM0OCAxNC44NDljLTAuNDY5IDAuNDY5LTEuMjI5IDAuNDY5LTEuNjk3IDBsLTIuNjUxLTMuMDMwLTIuNjUxIDMuMDI5Yy0wLjQ2OSAwLjQ2OS0xLjIyOSAwLjQ2OS0xLjY5NyAwLTAuNDY5LTAuNDY5LTAuNDY5LTEuMjI5IDAtMS42OTdsMi43NTgtMy4xNS0yLjc1OS0zLjE1MmMtMC40NjktMC40NjktMC40NjktMS4yMjggMC0xLjY5N3MxLjIyOC0wLjQ2OSAxLjY5NyAwbDIuNjUyIDMuMDMxIDIuNjUxLTMuMDMxYzAuNDY5LTAuNDY5IDEuMjI4LTAuNDY5IDEuNjk3IDBzMC40NjkgMS4yMjkgMCAxLjY5N2wtMi43NTggMy4xNTIgMi43NTggMy4xNWMwLjQ2OSAwLjQ2OSAwLjQ2OSAxLjIyOSAwIDEuNjk4elwiIC8+XG4gIDwvU3ZnPlxuKTtcbmV4cG9ydCB0eXBlIERvd25DaGV2cm9uUHJvcHMgPSBKU1guSW50cmluc2ljRWxlbWVudHNbJ3N2ZyddICYgeyBzaXplPzogbnVtYmVyIH07XG5leHBvcnQgY29uc3QgRG93bkNoZXZyb24gPSAocHJvcHM6IERvd25DaGV2cm9uUHJvcHMpID0+IChcbiAgPFN2ZyBzaXplPXsyMH0gey4uLnByb3BzfT5cbiAgICA8cGF0aCBkPVwiTTQuNTE2IDcuNTQ4YzAuNDM2LTAuNDQ2IDEuMDQzLTAuNDgxIDEuNTc2IDBsMy45MDggMy43NDcgMy45MDgtMy43NDdjMC41MzMtMC40ODEgMS4xNDEtMC40NDYgMS41NzQgMCAwLjQzNiAwLjQ0NSAwLjQwOCAxLjE5NyAwIDEuNjE1LTAuNDA2IDAuNDE4LTQuNjk1IDQuNTAyLTQuNjk1IDQuNTAyLTAuMjE3IDAuMjIzLTAuNTAyIDAuMzM1LTAuNzg3IDAuMzM1cy0wLjU3LTAuMTEyLTAuNzg5LTAuMzM1YzAgMC00LjI4Ny00LjA4NC00LjY5NS00LjUwMnMtMC40MzYtMS4xNyAwLTEuNjE1elwiIC8+XG4gIDwvU3ZnPlxuKTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBEcm9wZG93biAmIENsZWFyIEJ1dHRvbnNcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgaW50ZXJmYWNlIERyb3Bkb3duSW5kaWNhdG9yUHJvcHM8XG4gIE9wdGlvbiA9IHVua25vd24sXG4gIElzTXVsdGkgZXh0ZW5kcyBib29sZWFuID0gYm9vbGVhbixcbiAgR3JvdXAgZXh0ZW5kcyBHcm91cEJhc2U8T3B0aW9uPiA9IEdyb3VwQmFzZTxPcHRpb24+XG4+IGV4dGVuZHMgQ29tbW9uUHJvcHNBbmRDbGFzc05hbWU8T3B0aW9uLCBJc011bHRpLCBHcm91cD4ge1xuICAvKiogVGhlIGNoaWxkcmVuIHRvIGJlIHJlbmRlcmVkIGluc2lkZSB0aGUgaW5kaWNhdG9yLiAqL1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbiAgLyoqIFByb3BzIHRoYXQgd2lsbCBiZSBwYXNzZWQgb24gdG8gdGhlIGNoaWxkcmVuLiAqL1xuICBpbm5lclByb3BzOiBKU1guSW50cmluc2ljRWxlbWVudHNbJ2RpdiddO1xuICAvKiogVGhlIGZvY3VzZWQgc3RhdGUgb2YgdGhlIHNlbGVjdC4gKi9cbiAgaXNGb2N1c2VkOiBib29sZWFuO1xuICBpc0Rpc2FibGVkOiBib29sZWFuO1xufVxuXG5jb25zdCBiYXNlQ1NTID0gPFxuICBPcHRpb24sXG4gIElzTXVsdGkgZXh0ZW5kcyBib29sZWFuLFxuICBHcm91cCBleHRlbmRzIEdyb3VwQmFzZTxPcHRpb24+XG4+KFxuICB7XG4gICAgaXNGb2N1c2VkLFxuICAgIHRoZW1lOiB7XG4gICAgICBzcGFjaW5nOiB7IGJhc2VVbml0IH0sXG4gICAgICBjb2xvcnMsXG4gICAgfSxcbiAgfTpcbiAgICB8IERyb3Bkb3duSW5kaWNhdG9yUHJvcHM8T3B0aW9uLCBJc011bHRpLCBHcm91cD5cbiAgICB8IENsZWFySW5kaWNhdG9yUHJvcHM8T3B0aW9uLCBJc011bHRpLCBHcm91cD4sXG4gIHVuc3R5bGVkOiBib29sZWFuXG4pOiBDU1NPYmplY3RXaXRoTGFiZWwgPT4gKHtcbiAgbGFiZWw6ICdpbmRpY2F0b3JDb250YWluZXInLFxuICBkaXNwbGF5OiAnZmxleCcsXG4gIHRyYW5zaXRpb246ICdjb2xvciAxNTBtcycsXG4gIC4uLih1bnN0eWxlZFxuICAgID8ge31cbiAgICA6IHtcbiAgICAgICAgY29sb3I6IGlzRm9jdXNlZCA/IGNvbG9ycy5uZXV0cmFsNjAgOiBjb2xvcnMubmV1dHJhbDIwLFxuICAgICAgICBwYWRkaW5nOiBiYXNlVW5pdCAqIDIsXG4gICAgICAgICc6aG92ZXInOiB7XG4gICAgICAgICAgY29sb3I6IGlzRm9jdXNlZCA/IGNvbG9ycy5uZXV0cmFsODAgOiBjb2xvcnMubmV1dHJhbDQwLFxuICAgICAgICB9LFxuICAgICAgfSksXG59KTtcblxuZXhwb3J0IGNvbnN0IGRyb3Bkb3duSW5kaWNhdG9yQ1NTID0gYmFzZUNTUztcbmV4cG9ydCBjb25zdCBEcm9wZG93bkluZGljYXRvciA9IDxcbiAgT3B0aW9uLFxuICBJc011bHRpIGV4dGVuZHMgYm9vbGVhbixcbiAgR3JvdXAgZXh0ZW5kcyBHcm91cEJhc2U8T3B0aW9uPlxuPihcbiAgcHJvcHM6IERyb3Bkb3duSW5kaWNhdG9yUHJvcHM8T3B0aW9uLCBJc011bHRpLCBHcm91cD5cbikgPT4ge1xuICBjb25zdCB7IGNoaWxkcmVuLCBpbm5lclByb3BzIH0gPSBwcm9wcztcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICB7Li4uZ2V0U3R5bGVQcm9wcyhwcm9wcywgJ2Ryb3Bkb3duSW5kaWNhdG9yJywge1xuICAgICAgICBpbmRpY2F0b3I6IHRydWUsXG4gICAgICAgICdkcm9wZG93bi1pbmRpY2F0b3InOiB0cnVlLFxuICAgICAgfSl9XG4gICAgICB7Li4uaW5uZXJQcm9wc31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW4gfHwgPERvd25DaGV2cm9uIC8+fVxuICAgIDwvZGl2PlxuICApO1xufTtcblxuZXhwb3J0IGludGVyZmFjZSBDbGVhckluZGljYXRvclByb3BzPFxuICBPcHRpb24gPSB1bmtub3duLFxuICBJc011bHRpIGV4dGVuZHMgYm9vbGVhbiA9IGJvb2xlYW4sXG4gIEdyb3VwIGV4dGVuZHMgR3JvdXBCYXNlPE9wdGlvbj4gPSBHcm91cEJhc2U8T3B0aW9uPlxuPiBleHRlbmRzIENvbW1vblByb3BzQW5kQ2xhc3NOYW1lPE9wdGlvbiwgSXNNdWx0aSwgR3JvdXA+IHtcbiAgLyoqIFRoZSBjaGlsZHJlbiB0byBiZSByZW5kZXJlZCBpbnNpZGUgdGhlIGluZGljYXRvci4gKi9cbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG4gIC8qKiBQcm9wcyB0aGF0IHdpbGwgYmUgcGFzc2VkIG9uIHRvIHRoZSBjaGlsZHJlbi4gKi9cbiAgaW5uZXJQcm9wczogSlNYLkludHJpbnNpY0VsZW1lbnRzWydkaXYnXTtcbiAgLyoqIFRoZSBmb2N1c2VkIHN0YXRlIG9mIHRoZSBzZWxlY3QuICovXG4gIGlzRm9jdXNlZDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNvbnN0IGNsZWFySW5kaWNhdG9yQ1NTID0gYmFzZUNTUztcbmV4cG9ydCBjb25zdCBDbGVhckluZGljYXRvciA9IDxcbiAgT3B0aW9uLFxuICBJc011bHRpIGV4dGVuZHMgYm9vbGVhbixcbiAgR3JvdXAgZXh0ZW5kcyBHcm91cEJhc2U8T3B0aW9uPlxuPihcbiAgcHJvcHM6IENsZWFySW5kaWNhdG9yUHJvcHM8T3B0aW9uLCBJc011bHRpLCBHcm91cD5cbikgPT4ge1xuICBjb25zdCB7IGNoaWxkcmVuLCBpbm5lclByb3BzIH0gPSBwcm9wcztcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICB7Li4uZ2V0U3R5bGVQcm9wcyhwcm9wcywgJ2NsZWFySW5kaWNhdG9yJywge1xuICAgICAgICBpbmRpY2F0b3I6IHRydWUsXG4gICAgICAgICdjbGVhci1pbmRpY2F0b3InOiB0cnVlLFxuICAgICAgfSl9XG4gICAgICB7Li4uaW5uZXJQcm9wc31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW4gfHwgPENyb3NzSWNvbiAvPn1cbiAgICA8L2Rpdj5cbiAgKTtcbn07XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gU2VwYXJhdG9yXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGludGVyZmFjZSBJbmRpY2F0b3JTZXBhcmF0b3JQcm9wczxcbiAgT3B0aW9uID0gdW5rbm93bixcbiAgSXNNdWx0aSBleHRlbmRzIGJvb2xlYW4gPSBib29sZWFuLFxuICBHcm91cCBleHRlbmRzIEdyb3VwQmFzZTxPcHRpb24+ID0gR3JvdXBCYXNlPE9wdGlvbj5cbj4gZXh0ZW5kcyBDb21tb25Qcm9wc0FuZENsYXNzTmFtZTxPcHRpb24sIElzTXVsdGksIEdyb3VwPiB7XG4gIGlzRGlzYWJsZWQ6IGJvb2xlYW47XG4gIGlzRm9jdXNlZDogYm9vbGVhbjtcbiAgaW5uZXJQcm9wcz86IEpTWC5JbnRyaW5zaWNFbGVtZW50c1snc3BhbiddO1xufVxuXG5leHBvcnQgY29uc3QgaW5kaWNhdG9yU2VwYXJhdG9yQ1NTID0gPFxuICBPcHRpb24sXG4gIElzTXVsdGkgZXh0ZW5kcyBib29sZWFuLFxuICBHcm91cCBleHRlbmRzIEdyb3VwQmFzZTxPcHRpb24+XG4+KFxuICB7XG4gICAgaXNEaXNhYmxlZCxcbiAgICB0aGVtZToge1xuICAgICAgc3BhY2luZzogeyBiYXNlVW5pdCB9LFxuICAgICAgY29sb3JzLFxuICAgIH0sXG4gIH06IEluZGljYXRvclNlcGFyYXRvclByb3BzPE9wdGlvbiwgSXNNdWx0aSwgR3JvdXA+LFxuICB1bnN0eWxlZDogYm9vbGVhblxuKTogQ1NTT2JqZWN0V2l0aExhYmVsID0+ICh7XG4gIGxhYmVsOiAnaW5kaWNhdG9yU2VwYXJhdG9yJyxcbiAgYWxpZ25TZWxmOiAnc3RyZXRjaCcsXG4gIHdpZHRoOiAxLFxuICAuLi4odW5zdHlsZWRcbiAgICA/IHt9XG4gICAgOiB7XG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogaXNEaXNhYmxlZCA/IGNvbG9ycy5uZXV0cmFsMTAgOiBjb2xvcnMubmV1dHJhbDIwLFxuICAgICAgICBtYXJnaW5Cb3R0b206IGJhc2VVbml0ICogMixcbiAgICAgICAgbWFyZ2luVG9wOiBiYXNlVW5pdCAqIDIsXG4gICAgICB9KSxcbn0pO1xuXG5leHBvcnQgY29uc3QgSW5kaWNhdG9yU2VwYXJhdG9yID0gPFxuICBPcHRpb24sXG4gIElzTXVsdGkgZXh0ZW5kcyBib29sZWFuLFxuICBHcm91cCBleHRlbmRzIEdyb3VwQmFzZTxPcHRpb24+XG4+KFxuICBwcm9wczogSW5kaWNhdG9yU2VwYXJhdG9yUHJvcHM8T3B0aW9uLCBJc011bHRpLCBHcm91cD5cbikgPT4ge1xuICBjb25zdCB7IGlubmVyUHJvcHMgfSA9IHByb3BzO1xuICByZXR1cm4gKFxuICAgIDxzcGFuXG4gICAgICB7Li4uaW5uZXJQcm9wc31cbiAgICAgIHsuLi5nZXRTdHlsZVByb3BzKHByb3BzLCAnaW5kaWNhdG9yU2VwYXJhdG9yJywge1xuICAgICAgICAnaW5kaWNhdG9yLXNlcGFyYXRvcic6IHRydWUsXG4gICAgICB9KX1cbiAgICAvPlxuICApO1xufTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBMb2FkaW5nXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuY29uc3QgbG9hZGluZ0RvdEFuaW1hdGlvbnMgPSBrZXlmcmFtZXNgXG4gIDAlLCA4MCUsIDEwMCUgeyBvcGFjaXR5OiAwOyB9XG4gIDQwJSB7IG9wYWNpdHk6IDE7IH1cbmA7XG5cbmV4cG9ydCBjb25zdCBsb2FkaW5nSW5kaWNhdG9yQ1NTID0gPFxuICBPcHRpb24sXG4gIElzTXVsdGkgZXh0ZW5kcyBib29sZWFuLFxuICBHcm91cCBleHRlbmRzIEdyb3VwQmFzZTxPcHRpb24+XG4+KFxuICB7XG4gICAgaXNGb2N1c2VkLFxuICAgIHNpemUsXG4gICAgdGhlbWU6IHtcbiAgICAgIGNvbG9ycyxcbiAgICAgIHNwYWNpbmc6IHsgYmFzZVVuaXQgfSxcbiAgICB9LFxuICB9OiBMb2FkaW5nSW5kaWNhdG9yUHJvcHM8T3B0aW9uLCBJc011bHRpLCBHcm91cD4sXG4gIHVuc3R5bGVkOiBib29sZWFuXG4pOiBDU1NPYmplY3RXaXRoTGFiZWwgPT4gKHtcbiAgbGFiZWw6ICdsb2FkaW5nSW5kaWNhdG9yJyxcbiAgZGlzcGxheTogJ2ZsZXgnLFxuICB0cmFuc2l0aW9uOiAnY29sb3IgMTUwbXMnLFxuICBhbGlnblNlbGY6ICdjZW50ZXInLFxuICBmb250U2l6ZTogc2l6ZSxcbiAgbGluZUhlaWdodDogMSxcbiAgbWFyZ2luUmlnaHQ6IHNpemUsXG4gIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gIHZlcnRpY2FsQWxpZ246ICdtaWRkbGUnLFxuICAuLi4odW5zdHlsZWRcbiAgICA/IHt9XG4gICAgOiB7XG4gICAgICAgIGNvbG9yOiBpc0ZvY3VzZWQgPyBjb2xvcnMubmV1dHJhbDYwIDogY29sb3JzLm5ldXRyYWwyMCxcbiAgICAgICAgcGFkZGluZzogYmFzZVVuaXQgKiAyLFxuICAgICAgfSksXG59KTtcblxuaW50ZXJmYWNlIExvYWRpbmdEb3RQcm9wcyB7XG4gIGRlbGF5OiBudW1iZXI7XG4gIG9mZnNldDogYm9vbGVhbjtcbn1cbmNvbnN0IExvYWRpbmdEb3QgPSAoeyBkZWxheSwgb2Zmc2V0IH06IExvYWRpbmdEb3RQcm9wcykgPT4gKFxuICA8c3BhblxuICAgIGNzcz17e1xuICAgICAgYW5pbWF0aW9uOiBgJHtsb2FkaW5nRG90QW5pbWF0aW9uc30gMXMgZWFzZS1pbi1vdXQgJHtkZWxheX1tcyBpbmZpbml0ZTtgLFxuICAgICAgYmFja2dyb3VuZENvbG9yOiAnY3VycmVudENvbG9yJyxcbiAgICAgIGJvcmRlclJhZGl1czogJzFlbScsXG4gICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcbiAgICAgIG1hcmdpbkxlZnQ6IG9mZnNldCA/ICcxZW0nIDogdW5kZWZpbmVkLFxuICAgICAgaGVpZ2h0OiAnMWVtJyxcbiAgICAgIHZlcnRpY2FsQWxpZ246ICd0b3AnLFxuICAgICAgd2lkdGg6ICcxZW0nLFxuICAgIH19XG4gIC8+XG4pO1xuXG5leHBvcnQgaW50ZXJmYWNlIExvYWRpbmdJbmRpY2F0b3JQcm9wczxcbiAgT3B0aW9uID0gdW5rbm93bixcbiAgSXNNdWx0aSBleHRlbmRzIGJvb2xlYW4gPSBib29sZWFuLFxuICBHcm91cCBleHRlbmRzIEdyb3VwQmFzZTxPcHRpb24+ID0gR3JvdXBCYXNlPE9wdGlvbj5cbj4gZXh0ZW5kcyBDb21tb25Qcm9wc0FuZENsYXNzTmFtZTxPcHRpb24sIElzTXVsdGksIEdyb3VwPiB7XG4gIC8qKiBQcm9wcyB0aGF0IHdpbGwgYmUgcGFzc2VkIG9uIHRvIHRoZSBjaGlsZHJlbi4gKi9cbiAgaW5uZXJQcm9wczogSlNYLkludHJpbnNpY0VsZW1lbnRzWydkaXYnXTtcbiAgLyoqIFRoZSBmb2N1c2VkIHN0YXRlIG9mIHRoZSBzZWxlY3QuICovXG4gIGlzRm9jdXNlZDogYm9vbGVhbjtcbiAgaXNEaXNhYmxlZDogYm9vbGVhbjtcbiAgLyoqIFNldCBzaXplIG9mIHRoZSBjb250YWluZXIuICovXG4gIHNpemU6IG51bWJlcjtcbn1cbmV4cG9ydCBjb25zdCBMb2FkaW5nSW5kaWNhdG9yID0gPFxuICBPcHRpb24sXG4gIElzTXVsdGkgZXh0ZW5kcyBib29sZWFuLFxuICBHcm91cCBleHRlbmRzIEdyb3VwQmFzZTxPcHRpb24+XG4+KHtcbiAgaW5uZXJQcm9wcyxcbiAgaXNSdGwsXG4gIHNpemUgPSA0LFxuICAuLi5yZXN0UHJvcHNcbn06IExvYWRpbmdJbmRpY2F0b3JQcm9wczxPcHRpb24sIElzTXVsdGksIEdyb3VwPikgPT4ge1xuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIHsuLi5nZXRTdHlsZVByb3BzKFxuICAgICAgICB7IC4uLnJlc3RQcm9wcywgaW5uZXJQcm9wcywgaXNSdGwsIHNpemUgfSxcbiAgICAgICAgJ2xvYWRpbmdJbmRpY2F0b3InLFxuICAgICAgICB7XG4gICAgICAgICAgaW5kaWNhdG9yOiB0cnVlLFxuICAgICAgICAgICdsb2FkaW5nLWluZGljYXRvcic6IHRydWUsXG4gICAgICAgIH1cbiAgICAgICl9XG4gICAgICB7Li4uaW5uZXJQcm9wc31cbiAgICA+XG4gICAgICA8TG9hZGluZ0RvdCBkZWxheT17MH0gb2Zmc2V0PXtpc1J0bH0gLz5cbiAgICAgIDxMb2FkaW5nRG90IGRlbGF5PXsxNjB9IG9mZnNldCAvPlxuICAgICAgPExvYWRpbmdEb3QgZGVsYXk9ezMyMH0gb2Zmc2V0PXshaXNSdGx9IC8+XG4gICAgPC9kaXY+XG4gICk7XG59O1xuIl19 */",
  toString: _EMOTION_STRINGIFIED_CSS_ERROR__
};
var Svg = function Svg2(_ref3) {
  var size = _ref3.size, props = _objectWithoutProperties(_ref3, _excluded$2);
  return jsx("svg", _extends({
    height: size,
    width: size,
    viewBox: "0 0 20 20",
    "aria-hidden": "true",
    focusable: "false",
    css: _ref2
  }, props));
};
var CrossIcon = function CrossIcon2(props) {
  return jsx(Svg, _extends({
    size: 20
  }, props), jsx("path", {
    d: "M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"
  }));
};
var DownChevron = function DownChevron2(props) {
  return jsx(Svg, _extends({
    size: 20
  }, props), jsx("path", {
    d: "M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"
  }));
};
var baseCSS = function baseCSS2(_ref3, unstyled) {
  var isFocused = _ref3.isFocused, _ref3$theme = _ref3.theme, baseUnit2 = _ref3$theme.spacing.baseUnit, colors2 = _ref3$theme.colors;
  return _objectSpread2({
    label: "indicatorContainer",
    display: "flex",
    transition: "color 150ms"
  }, unstyled ? {} : {
    color: isFocused ? colors2.neutral60 : colors2.neutral20,
    padding: baseUnit2 * 2,
    ":hover": {
      color: isFocused ? colors2.neutral80 : colors2.neutral40
    }
  });
};
var dropdownIndicatorCSS = baseCSS;
var DropdownIndicator = function DropdownIndicator2(props) {
  var children = props.children, innerProps = props.innerProps;
  return jsx("div", _extends({}, getStyleProps(props, "dropdownIndicator", {
    indicator: true,
    "dropdown-indicator": true
  }), innerProps), children || jsx(DownChevron, null));
};
var clearIndicatorCSS = baseCSS;
var ClearIndicator = function ClearIndicator2(props) {
  var children = props.children, innerProps = props.innerProps;
  return jsx("div", _extends({}, getStyleProps(props, "clearIndicator", {
    indicator: true,
    "clear-indicator": true
  }), innerProps), children || jsx(CrossIcon, null));
};
var indicatorSeparatorCSS = function indicatorSeparatorCSS2(_ref4, unstyled) {
  var isDisabled = _ref4.isDisabled, _ref4$theme = _ref4.theme, baseUnit2 = _ref4$theme.spacing.baseUnit, colors2 = _ref4$theme.colors;
  return _objectSpread2({
    label: "indicatorSeparator",
    alignSelf: "stretch",
    width: 1
  }, unstyled ? {} : {
    backgroundColor: isDisabled ? colors2.neutral10 : colors2.neutral20,
    marginBottom: baseUnit2 * 2,
    marginTop: baseUnit2 * 2
  });
};
var IndicatorSeparator = function IndicatorSeparator2(props) {
  var innerProps = props.innerProps;
  return jsx("span", _extends({}, innerProps, getStyleProps(props, "indicatorSeparator", {
    "indicator-separator": true
  })));
};
var loadingDotAnimations = keyframes(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n  0%, 80%, 100% { opacity: 0; }\n  40% { opacity: 1; }\n"])));
var loadingIndicatorCSS = function loadingIndicatorCSS2(_ref5, unstyled) {
  var isFocused = _ref5.isFocused, size = _ref5.size, _ref5$theme = _ref5.theme, colors2 = _ref5$theme.colors, baseUnit2 = _ref5$theme.spacing.baseUnit;
  return _objectSpread2({
    label: "loadingIndicator",
    display: "flex",
    transition: "color 150ms",
    alignSelf: "center",
    fontSize: size,
    lineHeight: 1,
    marginRight: size,
    textAlign: "center",
    verticalAlign: "middle"
  }, unstyled ? {} : {
    color: isFocused ? colors2.neutral60 : colors2.neutral20,
    padding: baseUnit2 * 2
  });
};
var LoadingDot = function LoadingDot2(_ref6) {
  var delay = _ref6.delay, offset = _ref6.offset;
  return jsx("span", {
    css: /* @__PURE__ */ css({
      animation: "".concat(loadingDotAnimations, " 1s ease-in-out ").concat(delay, "ms infinite;"),
      backgroundColor: "currentColor",
      borderRadius: "1em",
      display: "inline-block",
      marginLeft: offset ? "1em" : void 0,
      height: "1em",
      verticalAlign: "top",
      width: "1em"
    }, false ? "" : ";label:LoadingDot;", false ? "" : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGljYXRvcnMudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQW1RSSIsImZpbGUiOiJpbmRpY2F0b3JzLnRzeCIsInNvdXJjZXNDb250ZW50IjpbIi8qKiBAanN4IGpzeCAqL1xuaW1wb3J0IHsgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsganN4LCBrZXlmcmFtZXMgfSBmcm9tICdAZW1vdGlvbi9yZWFjdCc7XG5cbmltcG9ydCB7XG4gIENvbW1vblByb3BzQW5kQ2xhc3NOYW1lLFxuICBDU1NPYmplY3RXaXRoTGFiZWwsXG4gIEdyb3VwQmFzZSxcbn0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgZ2V0U3R5bGVQcm9wcyB9IGZyb20gJy4uL3V0aWxzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBEcm9wZG93biAmIENsZWFyIEljb25zXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuY29uc3QgU3ZnID0gKHtcbiAgc2l6ZSxcbiAgLi4ucHJvcHNcbn06IEpTWC5JbnRyaW5zaWNFbGVtZW50c1snc3ZnJ10gJiB7IHNpemU6IG51bWJlciB9KSA9PiAoXG4gIDxzdmdcbiAgICBoZWlnaHQ9e3NpemV9XG4gICAgd2lkdGg9e3NpemV9XG4gICAgdmlld0JveD1cIjAgMCAyMCAyMFwiXG4gICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcbiAgICBmb2N1c2FibGU9XCJmYWxzZVwiXG4gICAgY3NzPXt7XG4gICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcbiAgICAgIGZpbGw6ICdjdXJyZW50Q29sb3InLFxuICAgICAgbGluZUhlaWdodDogMSxcbiAgICAgIHN0cm9rZTogJ2N1cnJlbnRDb2xvcicsXG4gICAgICBzdHJva2VXaWR0aDogMCxcbiAgICB9fVxuICAgIHsuLi5wcm9wc31cbiAgLz5cbik7XG5cbmV4cG9ydCB0eXBlIENyb3NzSWNvblByb3BzID0gSlNYLkludHJpbnNpY0VsZW1lbnRzWydzdmcnXSAmIHsgc2l6ZT86IG51bWJlciB9O1xuZXhwb3J0IGNvbnN0IENyb3NzSWNvbiA9IChwcm9wczogQ3Jvc3NJY29uUHJvcHMpID0+IChcbiAgPFN2ZyBzaXplPXsyMH0gey4uLnByb3BzfT5cbiAgICA8cGF0aCBkPVwiTTE0LjM0OCAxNC44NDljLTAuNDY5IDAuNDY5LTEuMjI5IDAuNDY5LTEuNjk3IDBsLTIuNjUxLTMuMDMwLTIuNjUxIDMuMDI5Yy0wLjQ2OSAwLjQ2OS0xLjIyOSAwLjQ2OS0xLjY5NyAwLTAuNDY5LTAuNDY5LTAuNDY5LTEuMjI5IDAtMS42OTdsMi43NTgtMy4xNS0yLjc1OS0zLjE1MmMtMC40NjktMC40NjktMC40NjktMS4yMjggMC0xLjY5N3MxLjIyOC0wLjQ2OSAxLjY5NyAwbDIuNjUyIDMuMDMxIDIuNjUxLTMuMDMxYzAuNDY5LTAuNDY5IDEuMjI4LTAuNDY5IDEuNjk3IDBzMC40NjkgMS4yMjkgMCAxLjY5N2wtMi43NTggMy4xNTIgMi43NTggMy4xNWMwLjQ2OSAwLjQ2OSAwLjQ2OSAxLjIyOSAwIDEuNjk4elwiIC8+XG4gIDwvU3ZnPlxuKTtcbmV4cG9ydCB0eXBlIERvd25DaGV2cm9uUHJvcHMgPSBKU1guSW50cmluc2ljRWxlbWVudHNbJ3N2ZyddICYgeyBzaXplPzogbnVtYmVyIH07XG5leHBvcnQgY29uc3QgRG93bkNoZXZyb24gPSAocHJvcHM6IERvd25DaGV2cm9uUHJvcHMpID0+IChcbiAgPFN2ZyBzaXplPXsyMH0gey4uLnByb3BzfT5cbiAgICA8cGF0aCBkPVwiTTQuNTE2IDcuNTQ4YzAuNDM2LTAuNDQ2IDEuMDQzLTAuNDgxIDEuNTc2IDBsMy45MDggMy43NDcgMy45MDgtMy43NDdjMC41MzMtMC40ODEgMS4xNDEtMC40NDYgMS41NzQgMCAwLjQzNiAwLjQ0NSAwLjQwOCAxLjE5NyAwIDEuNjE1LTAuNDA2IDAuNDE4LTQuNjk1IDQuNTAyLTQuNjk1IDQuNTAyLTAuMjE3IDAuMjIzLTAuNTAyIDAuMzM1LTAuNzg3IDAuMzM1cy0wLjU3LTAuMTEyLTAuNzg5LTAuMzM1YzAgMC00LjI4Ny00LjA4NC00LjY5NS00LjUwMnMtMC40MzYtMS4xNyAwLTEuNjE1elwiIC8+XG4gIDwvU3ZnPlxuKTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBEcm9wZG93biAmIENsZWFyIEJ1dHRvbnNcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgaW50ZXJmYWNlIERyb3Bkb3duSW5kaWNhdG9yUHJvcHM8XG4gIE9wdGlvbiA9IHVua25vd24sXG4gIElzTXVsdGkgZXh0ZW5kcyBib29sZWFuID0gYm9vbGVhbixcbiAgR3JvdXAgZXh0ZW5kcyBHcm91cEJhc2U8T3B0aW9uPiA9IEdyb3VwQmFzZTxPcHRpb24+XG4+IGV4dGVuZHMgQ29tbW9uUHJvcHNBbmRDbGFzc05hbWU8T3B0aW9uLCBJc011bHRpLCBHcm91cD4ge1xuICAvKiogVGhlIGNoaWxkcmVuIHRvIGJlIHJlbmRlcmVkIGluc2lkZSB0aGUgaW5kaWNhdG9yLiAqL1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbiAgLyoqIFByb3BzIHRoYXQgd2lsbCBiZSBwYXNzZWQgb24gdG8gdGhlIGNoaWxkcmVuLiAqL1xuICBpbm5lclByb3BzOiBKU1guSW50cmluc2ljRWxlbWVudHNbJ2RpdiddO1xuICAvKiogVGhlIGZvY3VzZWQgc3RhdGUgb2YgdGhlIHNlbGVjdC4gKi9cbiAgaXNGb2N1c2VkOiBib29sZWFuO1xuICBpc0Rpc2FibGVkOiBib29sZWFuO1xufVxuXG5jb25zdCBiYXNlQ1NTID0gPFxuICBPcHRpb24sXG4gIElzTXVsdGkgZXh0ZW5kcyBib29sZWFuLFxuICBHcm91cCBleHRlbmRzIEdyb3VwQmFzZTxPcHRpb24+XG4+KFxuICB7XG4gICAgaXNGb2N1c2VkLFxuICAgIHRoZW1lOiB7XG4gICAgICBzcGFjaW5nOiB7IGJhc2VVbml0IH0sXG4gICAgICBjb2xvcnMsXG4gICAgfSxcbiAgfTpcbiAgICB8IERyb3Bkb3duSW5kaWNhdG9yUHJvcHM8T3B0aW9uLCBJc011bHRpLCBHcm91cD5cbiAgICB8IENsZWFySW5kaWNhdG9yUHJvcHM8T3B0aW9uLCBJc011bHRpLCBHcm91cD4sXG4gIHVuc3R5bGVkOiBib29sZWFuXG4pOiBDU1NPYmplY3RXaXRoTGFiZWwgPT4gKHtcbiAgbGFiZWw6ICdpbmRpY2F0b3JDb250YWluZXInLFxuICBkaXNwbGF5OiAnZmxleCcsXG4gIHRyYW5zaXRpb246ICdjb2xvciAxNTBtcycsXG4gIC4uLih1bnN0eWxlZFxuICAgID8ge31cbiAgICA6IHtcbiAgICAgICAgY29sb3I6IGlzRm9jdXNlZCA/IGNvbG9ycy5uZXV0cmFsNjAgOiBjb2xvcnMubmV1dHJhbDIwLFxuICAgICAgICBwYWRkaW5nOiBiYXNlVW5pdCAqIDIsXG4gICAgICAgICc6aG92ZXInOiB7XG4gICAgICAgICAgY29sb3I6IGlzRm9jdXNlZCA/IGNvbG9ycy5uZXV0cmFsODAgOiBjb2xvcnMubmV1dHJhbDQwLFxuICAgICAgICB9LFxuICAgICAgfSksXG59KTtcblxuZXhwb3J0IGNvbnN0IGRyb3Bkb3duSW5kaWNhdG9yQ1NTID0gYmFzZUNTUztcbmV4cG9ydCBjb25zdCBEcm9wZG93bkluZGljYXRvciA9IDxcbiAgT3B0aW9uLFxuICBJc011bHRpIGV4dGVuZHMgYm9vbGVhbixcbiAgR3JvdXAgZXh0ZW5kcyBHcm91cEJhc2U8T3B0aW9uPlxuPihcbiAgcHJvcHM6IERyb3Bkb3duSW5kaWNhdG9yUHJvcHM8T3B0aW9uLCBJc011bHRpLCBHcm91cD5cbikgPT4ge1xuICBjb25zdCB7IGNoaWxkcmVuLCBpbm5lclByb3BzIH0gPSBwcm9wcztcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICB7Li4uZ2V0U3R5bGVQcm9wcyhwcm9wcywgJ2Ryb3Bkb3duSW5kaWNhdG9yJywge1xuICAgICAgICBpbmRpY2F0b3I6IHRydWUsXG4gICAgICAgICdkcm9wZG93bi1pbmRpY2F0b3InOiB0cnVlLFxuICAgICAgfSl9XG4gICAgICB7Li4uaW5uZXJQcm9wc31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW4gfHwgPERvd25DaGV2cm9uIC8+fVxuICAgIDwvZGl2PlxuICApO1xufTtcblxuZXhwb3J0IGludGVyZmFjZSBDbGVhckluZGljYXRvclByb3BzPFxuICBPcHRpb24gPSB1bmtub3duLFxuICBJc011bHRpIGV4dGVuZHMgYm9vbGVhbiA9IGJvb2xlYW4sXG4gIEdyb3VwIGV4dGVuZHMgR3JvdXBCYXNlPE9wdGlvbj4gPSBHcm91cEJhc2U8T3B0aW9uPlxuPiBleHRlbmRzIENvbW1vblByb3BzQW5kQ2xhc3NOYW1lPE9wdGlvbiwgSXNNdWx0aSwgR3JvdXA+IHtcbiAgLyoqIFRoZSBjaGlsZHJlbiB0byBiZSByZW5kZXJlZCBpbnNpZGUgdGhlIGluZGljYXRvci4gKi9cbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG4gIC8qKiBQcm9wcyB0aGF0IHdpbGwgYmUgcGFzc2VkIG9uIHRvIHRoZSBjaGlsZHJlbi4gKi9cbiAgaW5uZXJQcm9wczogSlNYLkludHJpbnNpY0VsZW1lbnRzWydkaXYnXTtcbiAgLyoqIFRoZSBmb2N1c2VkIHN0YXRlIG9mIHRoZSBzZWxlY3QuICovXG4gIGlzRm9jdXNlZDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNvbnN0IGNsZWFySW5kaWNhdG9yQ1NTID0gYmFzZUNTUztcbmV4cG9ydCBjb25zdCBDbGVhckluZGljYXRvciA9IDxcbiAgT3B0aW9uLFxuICBJc011bHRpIGV4dGVuZHMgYm9vbGVhbixcbiAgR3JvdXAgZXh0ZW5kcyBHcm91cEJhc2U8T3B0aW9uPlxuPihcbiAgcHJvcHM6IENsZWFySW5kaWNhdG9yUHJvcHM8T3B0aW9uLCBJc011bHRpLCBHcm91cD5cbikgPT4ge1xuICBjb25zdCB7IGNoaWxkcmVuLCBpbm5lclByb3BzIH0gPSBwcm9wcztcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICB7Li4uZ2V0U3R5bGVQcm9wcyhwcm9wcywgJ2NsZWFySW5kaWNhdG9yJywge1xuICAgICAgICBpbmRpY2F0b3I6IHRydWUsXG4gICAgICAgICdjbGVhci1pbmRpY2F0b3InOiB0cnVlLFxuICAgICAgfSl9XG4gICAgICB7Li4uaW5uZXJQcm9wc31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW4gfHwgPENyb3NzSWNvbiAvPn1cbiAgICA8L2Rpdj5cbiAgKTtcbn07XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gU2VwYXJhdG9yXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGludGVyZmFjZSBJbmRpY2F0b3JTZXBhcmF0b3JQcm9wczxcbiAgT3B0aW9uID0gdW5rbm93bixcbiAgSXNNdWx0aSBleHRlbmRzIGJvb2xlYW4gPSBib29sZWFuLFxuICBHcm91cCBleHRlbmRzIEdyb3VwQmFzZTxPcHRpb24+ID0gR3JvdXBCYXNlPE9wdGlvbj5cbj4gZXh0ZW5kcyBDb21tb25Qcm9wc0FuZENsYXNzTmFtZTxPcHRpb24sIElzTXVsdGksIEdyb3VwPiB7XG4gIGlzRGlzYWJsZWQ6IGJvb2xlYW47XG4gIGlzRm9jdXNlZDogYm9vbGVhbjtcbiAgaW5uZXJQcm9wcz86IEpTWC5JbnRyaW5zaWNFbGVtZW50c1snc3BhbiddO1xufVxuXG5leHBvcnQgY29uc3QgaW5kaWNhdG9yU2VwYXJhdG9yQ1NTID0gPFxuICBPcHRpb24sXG4gIElzTXVsdGkgZXh0ZW5kcyBib29sZWFuLFxuICBHcm91cCBleHRlbmRzIEdyb3VwQmFzZTxPcHRpb24+XG4+KFxuICB7XG4gICAgaXNEaXNhYmxlZCxcbiAgICB0aGVtZToge1xuICAgICAgc3BhY2luZzogeyBiYXNlVW5pdCB9LFxuICAgICAgY29sb3JzLFxuICAgIH0sXG4gIH06IEluZGljYXRvclNlcGFyYXRvclByb3BzPE9wdGlvbiwgSXNNdWx0aSwgR3JvdXA+LFxuICB1bnN0eWxlZDogYm9vbGVhblxuKTogQ1NTT2JqZWN0V2l0aExhYmVsID0+ICh7XG4gIGxhYmVsOiAnaW5kaWNhdG9yU2VwYXJhdG9yJyxcbiAgYWxpZ25TZWxmOiAnc3RyZXRjaCcsXG4gIHdpZHRoOiAxLFxuICAuLi4odW5zdHlsZWRcbiAgICA/IHt9XG4gICAgOiB7XG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogaXNEaXNhYmxlZCA/IGNvbG9ycy5uZXV0cmFsMTAgOiBjb2xvcnMubmV1dHJhbDIwLFxuICAgICAgICBtYXJnaW5Cb3R0b206IGJhc2VVbml0ICogMixcbiAgICAgICAgbWFyZ2luVG9wOiBiYXNlVW5pdCAqIDIsXG4gICAgICB9KSxcbn0pO1xuXG5leHBvcnQgY29uc3QgSW5kaWNhdG9yU2VwYXJhdG9yID0gPFxuICBPcHRpb24sXG4gIElzTXVsdGkgZXh0ZW5kcyBib29sZWFuLFxuICBHcm91cCBleHRlbmRzIEdyb3VwQmFzZTxPcHRpb24+XG4+KFxuICBwcm9wczogSW5kaWNhdG9yU2VwYXJhdG9yUHJvcHM8T3B0aW9uLCBJc011bHRpLCBHcm91cD5cbikgPT4ge1xuICBjb25zdCB7IGlubmVyUHJvcHMgfSA9IHByb3BzO1xuICByZXR1cm4gKFxuICAgIDxzcGFuXG4gICAgICB7Li4uaW5uZXJQcm9wc31cbiAgICAgIHsuLi5nZXRTdHlsZVByb3BzKHByb3BzLCAnaW5kaWNhdG9yU2VwYXJhdG9yJywge1xuICAgICAgICAnaW5kaWNhdG9yLXNlcGFyYXRvcic6IHRydWUsXG4gICAgICB9KX1cbiAgICAvPlxuICApO1xufTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBMb2FkaW5nXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuY29uc3QgbG9hZGluZ0RvdEFuaW1hdGlvbnMgPSBrZXlmcmFtZXNgXG4gIDAlLCA4MCUsIDEwMCUgeyBvcGFjaXR5OiAwOyB9XG4gIDQwJSB7IG9wYWNpdHk6IDE7IH1cbmA7XG5cbmV4cG9ydCBjb25zdCBsb2FkaW5nSW5kaWNhdG9yQ1NTID0gPFxuICBPcHRpb24sXG4gIElzTXVsdGkgZXh0ZW5kcyBib29sZWFuLFxuICBHcm91cCBleHRlbmRzIEdyb3VwQmFzZTxPcHRpb24+XG4+KFxuICB7XG4gICAgaXNGb2N1c2VkLFxuICAgIHNpemUsXG4gICAgdGhlbWU6IHtcbiAgICAgIGNvbG9ycyxcbiAgICAgIHNwYWNpbmc6IHsgYmFzZVVuaXQgfSxcbiAgICB9LFxuICB9OiBMb2FkaW5nSW5kaWNhdG9yUHJvcHM8T3B0aW9uLCBJc011bHRpLCBHcm91cD4sXG4gIHVuc3R5bGVkOiBib29sZWFuXG4pOiBDU1NPYmplY3RXaXRoTGFiZWwgPT4gKHtcbiAgbGFiZWw6ICdsb2FkaW5nSW5kaWNhdG9yJyxcbiAgZGlzcGxheTogJ2ZsZXgnLFxuICB0cmFuc2l0aW9uOiAnY29sb3IgMTUwbXMnLFxuICBhbGlnblNlbGY6ICdjZW50ZXInLFxuICBmb250U2l6ZTogc2l6ZSxcbiAgbGluZUhlaWdodDogMSxcbiAgbWFyZ2luUmlnaHQ6IHNpemUsXG4gIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gIHZlcnRpY2FsQWxpZ246ICdtaWRkbGUnLFxuICAuLi4odW5zdHlsZWRcbiAgICA/IHt9XG4gICAgOiB7XG4gICAgICAgIGNvbG9yOiBpc0ZvY3VzZWQgPyBjb2xvcnMubmV1dHJhbDYwIDogY29sb3JzLm5ldXRyYWwyMCxcbiAgICAgICAgcGFkZGluZzogYmFzZVVuaXQgKiAyLFxuICAgICAgfSksXG59KTtcblxuaW50ZXJmYWNlIExvYWRpbmdEb3RQcm9wcyB7XG4gIGRlbGF5OiBudW1iZXI7XG4gIG9mZnNldDogYm9vbGVhbjtcbn1cbmNvbnN0IExvYWRpbmdEb3QgPSAoeyBkZWxheSwgb2Zmc2V0IH06IExvYWRpbmdEb3RQcm9wcykgPT4gKFxuICA8c3BhblxuICAgIGNzcz17e1xuICAgICAgYW5pbWF0aW9uOiBgJHtsb2FkaW5nRG90QW5pbWF0aW9uc30gMXMgZWFzZS1pbi1vdXQgJHtkZWxheX1tcyBpbmZpbml0ZTtgLFxuICAgICAgYmFja2dyb3VuZENvbG9yOiAnY3VycmVudENvbG9yJyxcbiAgICAgIGJvcmRlclJhZGl1czogJzFlbScsXG4gICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcbiAgICAgIG1hcmdpbkxlZnQ6IG9mZnNldCA/ICcxZW0nIDogdW5kZWZpbmVkLFxuICAgICAgaGVpZ2h0OiAnMWVtJyxcbiAgICAgIHZlcnRpY2FsQWxpZ246ICd0b3AnLFxuICAgICAgd2lkdGg6ICcxZW0nLFxuICAgIH19XG4gIC8+XG4pO1xuXG5leHBvcnQgaW50ZXJmYWNlIExvYWRpbmdJbmRpY2F0b3JQcm9wczxcbiAgT3B0aW9uID0gdW5rbm93bixcbiAgSXNNdWx0aSBleHRlbmRzIGJvb2xlYW4gPSBib29sZWFuLFxuICBHcm91cCBleHRlbmRzIEdyb3VwQmFzZTxPcHRpb24+ID0gR3JvdXBCYXNlPE9wdGlvbj5cbj4gZXh0ZW5kcyBDb21tb25Qcm9wc0FuZENsYXNzTmFtZTxPcHRpb24sIElzTXVsdGksIEdyb3VwPiB7XG4gIC8qKiBQcm9wcyB0aGF0IHdpbGwgYmUgcGFzc2VkIG9uIHRvIHRoZSBjaGlsZHJlbi4gKi9cbiAgaW5uZXJQcm9wczogSlNYLkludHJpbnNpY0VsZW1lbnRzWydkaXYnXTtcbiAgLyoqIFRoZSBmb2N1c2VkIHN0YXRlIG9mIHRoZSBzZWxlY3QuICovXG4gIGlzRm9jdXNlZDogYm9vbGVhbjtcbiAgaXNEaXNhYmxlZDogYm9vbGVhbjtcbiAgLyoqIFNldCBzaXplIG9mIHRoZSBjb250YWluZXIuICovXG4gIHNpemU6IG51bWJlcjtcbn1cbmV4cG9ydCBjb25zdCBMb2FkaW5nSW5kaWNhdG9yID0gPFxuICBPcHRpb24sXG4gIElzTXVsdGkgZXh0ZW5kcyBib29sZWFuLFxuICBHcm91cCBleHRlbmRzIEdyb3VwQmFzZTxPcHRpb24+XG4+KHtcbiAgaW5uZXJQcm9wcyxcbiAgaXNSdGwsXG4gIHNpemUgPSA0LFxuICAuLi5yZXN0UHJvcHNcbn06IExvYWRpbmdJbmRpY2F0b3JQcm9wczxPcHRpb24sIElzTXVsdGksIEdyb3VwPikgPT4ge1xuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIHsuLi5nZXRTdHlsZVByb3BzKFxuICAgICAgICB7IC4uLnJlc3RQcm9wcywgaW5uZXJQcm9wcywgaXNSdGwsIHNpemUgfSxcbiAgICAgICAgJ2xvYWRpbmdJbmRpY2F0b3InLFxuICAgICAgICB7XG4gICAgICAgICAgaW5kaWNhdG9yOiB0cnVlLFxuICAgICAgICAgICdsb2FkaW5nLWluZGljYXRvcic6IHRydWUsXG4gICAgICAgIH1cbiAgICAgICl9XG4gICAgICB7Li4uaW5uZXJQcm9wc31cbiAgICA+XG4gICAgICA8TG9hZGluZ0RvdCBkZWxheT17MH0gb2Zmc2V0PXtpc1J0bH0gLz5cbiAgICAgIDxMb2FkaW5nRG90IGRlbGF5PXsxNjB9IG9mZnNldCAvPlxuICAgICAgPExvYWRpbmdEb3QgZGVsYXk9ezMyMH0gb2Zmc2V0PXshaXNSdGx9IC8+XG4gICAgPC9kaXY+XG4gICk7XG59O1xuIl19 */")
  });
};
var LoadingIndicator = function LoadingIndicator2(_ref7) {
  var innerProps = _ref7.innerProps, isRtl = _ref7.isRtl, _ref7$size = _ref7.size, size = _ref7$size === void 0 ? 4 : _ref7$size, restProps = _objectWithoutProperties(_ref7, _excluded2);
  return jsx("div", _extends({}, getStyleProps(_objectSpread2(_objectSpread2({}, restProps), {}, {
    innerProps,
    isRtl,
    size
  }), "loadingIndicator", {
    indicator: true,
    "loading-indicator": true
  }), innerProps), jsx(LoadingDot, {
    delay: 0,
    offset: isRtl
  }), jsx(LoadingDot, {
    delay: 160,
    offset: true
  }), jsx(LoadingDot, {
    delay: 320,
    offset: !isRtl
  }));
};
var css$1 = function css2(_ref3, unstyled) {
  var isDisabled = _ref3.isDisabled, isFocused = _ref3.isFocused, _ref$theme = _ref3.theme, colors2 = _ref$theme.colors, borderRadius2 = _ref$theme.borderRadius, spacing2 = _ref$theme.spacing;
  return _objectSpread2({
    label: "control",
    alignItems: "center",
    cursor: "default",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    minHeight: spacing2.controlHeight,
    outline: "0 !important",
    position: "relative",
    transition: "all 100ms"
  }, unstyled ? {} : {
    backgroundColor: isDisabled ? colors2.neutral5 : colors2.neutral0,
    borderColor: isDisabled ? colors2.neutral10 : isFocused ? colors2.primary : colors2.neutral20,
    borderRadius: borderRadius2,
    borderStyle: "solid",
    borderWidth: 1,
    boxShadow: isFocused ? "0 0 0 1px ".concat(colors2.primary) : void 0,
    "&:hover": {
      borderColor: isFocused ? colors2.primary : colors2.neutral30
    }
  });
};
var Control = function Control2(props) {
  var children = props.children, isDisabled = props.isDisabled, isFocused = props.isFocused, innerRef = props.innerRef, innerProps = props.innerProps, menuIsOpen = props.menuIsOpen;
  return jsx("div", _extends({
    ref: innerRef
  }, getStyleProps(props, "control", {
    control: true,
    "control--is-disabled": isDisabled,
    "control--is-focused": isFocused,
    "control--menu-is-open": menuIsOpen
  }), innerProps, {
    "aria-disabled": isDisabled || void 0
  }), children);
};
var Control$1 = Control;
var _excluded$1 = ["data"];
var groupCSS = function groupCSS2(_ref3, unstyled) {
  var spacing2 = _ref3.theme.spacing;
  return unstyled ? {} : {
    paddingBottom: spacing2.baseUnit * 2,
    paddingTop: spacing2.baseUnit * 2
  };
};
var Group = function Group2(props) {
  var children = props.children, cx = props.cx, getStyles = props.getStyles, getClassNames = props.getClassNames, Heading = props.Heading, headingProps = props.headingProps, innerProps = props.innerProps, label = props.label, theme = props.theme, selectProps = props.selectProps;
  return jsx("div", _extends({}, getStyleProps(props, "group", {
    group: true
  }), innerProps), jsx(Heading, _extends({}, headingProps, {
    selectProps,
    theme,
    getStyles,
    getClassNames,
    cx
  }), label), jsx("div", null, children));
};
var groupHeadingCSS = function groupHeadingCSS2(_ref23, unstyled) {
  var _ref2$theme = _ref23.theme, colors2 = _ref2$theme.colors, spacing2 = _ref2$theme.spacing;
  return _objectSpread2({
    label: "group",
    cursor: "default",
    display: "block"
  }, unstyled ? {} : {
    color: colors2.neutral40,
    fontSize: "75%",
    fontWeight: 500,
    marginBottom: "0.25em",
    paddingLeft: spacing2.baseUnit * 3,
    paddingRight: spacing2.baseUnit * 3,
    textTransform: "uppercase"
  });
};
var GroupHeading = function GroupHeading2(props) {
  var _cleanCommonProps = cleanCommonProps(props);
  _cleanCommonProps.data;
  var innerProps = _objectWithoutProperties(_cleanCommonProps, _excluded$1);
  return jsx("div", _extends({}, getStyleProps(props, "groupHeading", {
    "group-heading": true
  }), innerProps));
};
var Group$1 = Group;
var _excluded3 = ["innerRef", "isDisabled", "isHidden", "inputClassName"];
var inputCSS = function inputCSS2(_ref3, unstyled) {
  var isDisabled = _ref3.isDisabled, value = _ref3.value, _ref$theme = _ref3.theme, spacing2 = _ref$theme.spacing, colors2 = _ref$theme.colors;
  return _objectSpread2(_objectSpread2({
    visibility: isDisabled ? "hidden" : "visible",
    // force css to recompute when value change due to @emotion bug.
    // We can remove it whenever the bug is fixed.
    transform: value ? "translateZ(0)" : ""
  }, containerStyle), unstyled ? {} : {
    margin: spacing2.baseUnit / 2,
    paddingBottom: spacing2.baseUnit / 2,
    paddingTop: spacing2.baseUnit / 2,
    color: colors2.neutral80
  });
};
var spacingStyle = {
  gridArea: "1 / 2",
  font: "inherit",
  minWidth: "2px",
  border: 0,
  margin: 0,
  outline: 0,
  padding: 0
};
var containerStyle = {
  flex: "1 1 auto",
  display: "inline-grid",
  gridArea: "1 / 1 / 2 / 3",
  gridTemplateColumns: "0 min-content",
  "&:after": _objectSpread2({
    content: 'attr(data-value) " "',
    visibility: "hidden",
    whiteSpace: "pre"
  }, spacingStyle)
};
var inputStyle = function inputStyle2(isHidden) {
  return _objectSpread2({
    label: "input",
    color: "inherit",
    background: 0,
    opacity: isHidden ? 0 : 1,
    width: "100%"
  }, spacingStyle);
};
var Input = function Input2(props) {
  var cx = props.cx, value = props.value;
  var _cleanCommonProps = cleanCommonProps(props), innerRef = _cleanCommonProps.innerRef, isDisabled = _cleanCommonProps.isDisabled, isHidden = _cleanCommonProps.isHidden, inputClassName = _cleanCommonProps.inputClassName, innerProps = _objectWithoutProperties(_cleanCommonProps, _excluded3);
  return jsx("div", _extends({}, getStyleProps(props, "input", {
    "input-container": true
  }), {
    "data-value": value || ""
  }), jsx("input", _extends({
    className: cx({
      input: true
    }, inputClassName),
    ref: innerRef,
    style: inputStyle(isHidden),
    disabled: isDisabled
  }, innerProps)));
};
var Input$1 = Input;
var multiValueCSS = function multiValueCSS2(_ref3, unstyled) {
  var _ref$theme = _ref3.theme, spacing2 = _ref$theme.spacing, borderRadius2 = _ref$theme.borderRadius, colors2 = _ref$theme.colors;
  return _objectSpread2({
    label: "multiValue",
    display: "flex",
    minWidth: 0
  }, unstyled ? {} : {
    backgroundColor: colors2.neutral10,
    borderRadius: borderRadius2 / 2,
    margin: spacing2.baseUnit / 2
  });
};
var multiValueLabelCSS = function multiValueLabelCSS2(_ref23, unstyled) {
  var _ref2$theme = _ref23.theme, borderRadius2 = _ref2$theme.borderRadius, colors2 = _ref2$theme.colors, cropWithEllipsis = _ref23.cropWithEllipsis;
  return _objectSpread2({
    overflow: "hidden",
    textOverflow: cropWithEllipsis || cropWithEllipsis === void 0 ? "ellipsis" : void 0,
    whiteSpace: "nowrap"
  }, unstyled ? {} : {
    borderRadius: borderRadius2 / 2,
    color: colors2.neutral80,
    fontSize: "85%",
    padding: 3,
    paddingLeft: 6
  });
};
var multiValueRemoveCSS = function multiValueRemoveCSS2(_ref3, unstyled) {
  var _ref3$theme = _ref3.theme, spacing2 = _ref3$theme.spacing, borderRadius2 = _ref3$theme.borderRadius, colors2 = _ref3$theme.colors, isFocused = _ref3.isFocused;
  return _objectSpread2({
    alignItems: "center",
    display: "flex"
  }, unstyled ? {} : {
    borderRadius: borderRadius2 / 2,
    backgroundColor: isFocused ? colors2.dangerLight : void 0,
    paddingLeft: spacing2.baseUnit,
    paddingRight: spacing2.baseUnit,
    ":hover": {
      backgroundColor: colors2.dangerLight,
      color: colors2.danger
    }
  });
};
var MultiValueGeneric = function MultiValueGeneric2(_ref4) {
  var children = _ref4.children, innerProps = _ref4.innerProps;
  return jsx("div", innerProps, children);
};
var MultiValueContainer = MultiValueGeneric;
var MultiValueLabel = MultiValueGeneric;
function MultiValueRemove(_ref5) {
  var children = _ref5.children, innerProps = _ref5.innerProps;
  return jsx("div", _extends({
    role: "button"
  }, innerProps), children || jsx(CrossIcon, {
    size: 14
  }));
}
var MultiValue = function MultiValue2(props) {
  var children = props.children, components2 = props.components, data = props.data, innerProps = props.innerProps, isDisabled = props.isDisabled, removeProps3 = props.removeProps, selectProps = props.selectProps;
  var Container = components2.Container, Label = components2.Label, Remove = components2.Remove;
  return jsx(Container, {
    data,
    innerProps: _objectSpread2(_objectSpread2({}, getStyleProps(props, "multiValue", {
      "multi-value": true,
      "multi-value--is-disabled": isDisabled
    })), innerProps),
    selectProps
  }, jsx(Label, {
    data,
    innerProps: _objectSpread2({}, getStyleProps(props, "multiValueLabel", {
      "multi-value__label": true
    })),
    selectProps
  }, children), jsx(Remove, {
    data,
    innerProps: _objectSpread2(_objectSpread2({}, getStyleProps(props, "multiValueRemove", {
      "multi-value__remove": true
    })), {}, {
      "aria-label": "Remove ".concat(children || "option")
    }, removeProps3),
    selectProps
  }));
};
var MultiValue$1 = MultiValue;
var optionCSS = function optionCSS2(_ref3, unstyled) {
  var isDisabled = _ref3.isDisabled, isFocused = _ref3.isFocused, isSelected = _ref3.isSelected, _ref$theme = _ref3.theme, spacing2 = _ref$theme.spacing, colors2 = _ref$theme.colors;
  return _objectSpread2({
    label: "option",
    cursor: "default",
    display: "block",
    fontSize: "inherit",
    width: "100%",
    userSelect: "none",
    WebkitTapHighlightColor: "rgba(0, 0, 0, 0)"
  }, unstyled ? {} : {
    backgroundColor: isSelected ? colors2.primary : isFocused ? colors2.primary25 : "transparent",
    color: isDisabled ? colors2.neutral20 : isSelected ? colors2.neutral0 : "inherit",
    padding: "".concat(spacing2.baseUnit * 2, "px ").concat(spacing2.baseUnit * 3, "px"),
    // provide some affordance on touch devices
    ":active": {
      backgroundColor: !isDisabled ? isSelected ? colors2.primary : colors2.primary50 : void 0
    }
  });
};
var Option = function Option2(props) {
  var children = props.children, isDisabled = props.isDisabled, isFocused = props.isFocused, isSelected = props.isSelected, innerRef = props.innerRef, innerProps = props.innerProps;
  return jsx("div", _extends({}, getStyleProps(props, "option", {
    option: true,
    "option--is-disabled": isDisabled,
    "option--is-focused": isFocused,
    "option--is-selected": isSelected
  }), {
    ref: innerRef,
    "aria-disabled": isDisabled
  }, innerProps), children);
};
var Option$1 = Option;
var placeholderCSS = function placeholderCSS2(_ref3, unstyled) {
  var _ref$theme = _ref3.theme, spacing2 = _ref$theme.spacing, colors2 = _ref$theme.colors;
  return _objectSpread2({
    label: "placeholder",
    gridArea: "1 / 1 / 2 / 3"
  }, unstyled ? {} : {
    color: colors2.neutral50,
    marginLeft: spacing2.baseUnit / 2,
    marginRight: spacing2.baseUnit / 2
  });
};
var Placeholder = function Placeholder2(props) {
  var children = props.children, innerProps = props.innerProps;
  return jsx("div", _extends({}, getStyleProps(props, "placeholder", {
    placeholder: true
  }), innerProps), children);
};
var Placeholder$1 = Placeholder;
var css3 = function css4(_ref3, unstyled) {
  var isDisabled = _ref3.isDisabled, _ref$theme = _ref3.theme, spacing2 = _ref$theme.spacing, colors2 = _ref$theme.colors;
  return _objectSpread2({
    label: "singleValue",
    gridArea: "1 / 1 / 2 / 3",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  }, unstyled ? {} : {
    color: isDisabled ? colors2.neutral40 : colors2.neutral80,
    marginLeft: spacing2.baseUnit / 2,
    marginRight: spacing2.baseUnit / 2
  });
};
var SingleValue = function SingleValue2(props) {
  var children = props.children, isDisabled = props.isDisabled, innerProps = props.innerProps;
  return jsx("div", _extends({}, getStyleProps(props, "singleValue", {
    "single-value": true,
    "single-value--is-disabled": isDisabled
  }), innerProps), children);
};
var SingleValue$1 = SingleValue;
var components = {
  ClearIndicator,
  Control: Control$1,
  DropdownIndicator,
  DownChevron,
  CrossIcon,
  Group: Group$1,
  GroupHeading,
  IndicatorsContainer,
  IndicatorSeparator,
  Input: Input$1,
  LoadingIndicator,
  Menu: Menu$1,
  MenuList,
  MenuPortal,
  LoadingMessage,
  NoOptionsMessage,
  MultiValue: MultiValue$1,
  MultiValueContainer,
  MultiValueLabel,
  MultiValueRemove,
  Option: Option$1,
  Placeholder: Placeholder$1,
  SelectContainer,
  SingleValue: SingleValue$1,
  ValueContainer
};
var defaultComponents = function defaultComponents2(props) {
  return _objectSpread2(_objectSpread2({}, components), props.components);
};

// node_modules/memoize-one/dist/memoize-one.esm.js
var safeIsNaN = Number.isNaN || function ponyfill(value) {
  return typeof value === "number" && value !== value;
};
function isEqual(first, second) {
  if (first === second) {
    return true;
  }
  if (safeIsNaN(first) && safeIsNaN(second)) {
    return true;
  }
  return false;
}
function areInputsEqual(newInputs, lastInputs) {
  if (newInputs.length !== lastInputs.length) {
    return false;
  }
  for (var i = 0; i < newInputs.length; i++) {
    if (!isEqual(newInputs[i], lastInputs[i])) {
      return false;
    }
  }
  return true;
}
function memoizeOne(resultFn, isEqual2) {
  if (isEqual2 === void 0) {
    isEqual2 = areInputsEqual;
  }
  var cache = null;
  function memoized() {
    var newArgs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      newArgs[_i] = arguments[_i];
    }
    if (cache && cache.lastThis === this && isEqual2(newArgs, cache.lastArgs)) {
      return cache.lastResult;
    }
    var lastResult = resultFn.apply(this, newArgs);
    cache = {
      lastResult,
      lastArgs: newArgs,
      lastThis: this
    };
    return lastResult;
  }
  memoized.clear = function clear() {
    cache = null;
  };
  return memoized;
}

// node_modules/react-select/dist/Select-49a62830.esm.js
function _EMOTION_STRINGIFIED_CSS_ERROR__$2() {
  return "You have tried to stringify object returned from `css` function. It isn't supposed to be used directly (e.g. as value of the `className` prop), but rather handed to emotion so it can handle it (e.g. as value of `css` prop).";
}
var _ref = false ? {
  name: "7pg0cj-a11yText",
  styles: "label:a11yText;z-index:9999;border:0;clip:rect(1px, 1px, 1px, 1px);height:1px;width:1px;position:absolute;overflow:hidden;padding:0;white-space:nowrap"
} : {
  name: "1f43avz-a11yText-A11yText",
  styles: "label:a11yText;z-index:9999;border:0;clip:rect(1px, 1px, 1px, 1px);height:1px;width:1px;position:absolute;overflow:hidden;padding:0;white-space:nowrap;label:A11yText;",
  map: "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkExMXlUZXh0LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNSSIsImZpbGUiOiJBMTF5VGV4dC50c3giLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQGpzeCBqc3ggKi9cbmltcG9ydCB7IGpzeCB9IGZyb20gJ0BlbW90aW9uL3JlYWN0JztcblxuLy8gQXNzaXN0aXZlIHRleHQgdG8gZGVzY3JpYmUgdmlzdWFsIGVsZW1lbnRzLiBIaWRkZW4gZm9yIHNpZ2h0ZWQgdXNlcnMuXG5jb25zdCBBMTF5VGV4dCA9IChwcm9wczogSlNYLkludHJpbnNpY0VsZW1lbnRzWydzcGFuJ10pID0+IChcbiAgPHNwYW5cbiAgICBjc3M9e3tcbiAgICAgIGxhYmVsOiAnYTExeVRleHQnLFxuICAgICAgekluZGV4OiA5OTk5LFxuICAgICAgYm9yZGVyOiAwLFxuICAgICAgY2xpcDogJ3JlY3QoMXB4LCAxcHgsIDFweCwgMXB4KScsXG4gICAgICBoZWlnaHQ6IDEsXG4gICAgICB3aWR0aDogMSxcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgcGFkZGluZzogMCxcbiAgICAgIHdoaXRlU3BhY2U6ICdub3dyYXAnLFxuICAgIH19XG4gICAgey4uLnByb3BzfVxuICAvPlxuKTtcblxuZXhwb3J0IGRlZmF1bHQgQTExeVRleHQ7XG4iXX0= */",
  toString: _EMOTION_STRINGIFIED_CSS_ERROR__$2
};
var A11yText = function A11yText2(props) {
  return jsx("span", _extends({
    css: _ref
  }, props));
};
var A11yText$1 = A11yText;
var defaultAriaLiveMessages = {
  guidance: function guidance(props) {
    var isSearchable = props.isSearchable, isMulti = props.isMulti, tabSelectsValue = props.tabSelectsValue, context = props.context, isInitialFocus = props.isInitialFocus;
    switch (context) {
      case "menu":
        return "Use Up and Down to choose options, press Enter to select the currently focused option, press Escape to exit the menu".concat(tabSelectsValue ? ", press Tab to select the option and exit the menu" : "", ".");
      case "input":
        return isInitialFocus ? "".concat(props["aria-label"] || "Select", " is focused ").concat(isSearchable ? ",type to refine list" : "", ", press Down to open the menu, ").concat(isMulti ? " press left to focus selected values" : "") : "";
      case "value":
        return "Use left and right to toggle between focused values, press Backspace to remove the currently focused value";
      default:
        return "";
    }
  },
  onChange: function onChange(props) {
    var action = props.action, _props$label = props.label, label = _props$label === void 0 ? "" : _props$label, labels = props.labels, isDisabled = props.isDisabled;
    switch (action) {
      case "deselect-option":
      case "pop-value":
      case "remove-value":
        return "option ".concat(label, ", deselected.");
      case "clear":
        return "All selected options have been cleared.";
      case "initial-input-focus":
        return "option".concat(labels.length > 1 ? "s" : "", " ").concat(labels.join(","), ", selected.");
      case "select-option":
        return isDisabled ? "option ".concat(label, " is disabled. Select another option.") : "option ".concat(label, ", selected.");
      default:
        return "";
    }
  },
  onFocus: function onFocus(props) {
    var context = props.context, focused = props.focused, options2 = props.options, _props$label2 = props.label, label = _props$label2 === void 0 ? "" : _props$label2, selectValue = props.selectValue, isDisabled = props.isDisabled, isSelected = props.isSelected, isAppleDevice2 = props.isAppleDevice;
    var getArrayIndex = function getArrayIndex2(arr, item) {
      return arr && arr.length ? "".concat(arr.indexOf(item) + 1, " of ").concat(arr.length) : "";
    };
    if (context === "value" && selectValue) {
      return "value ".concat(label, " focused, ").concat(getArrayIndex(selectValue, focused), ".");
    }
    if (context === "menu" && isAppleDevice2) {
      var disabled = isDisabled ? " disabled" : "";
      var status = "".concat(isSelected ? " selected" : "").concat(disabled);
      return "".concat(label).concat(status, ", ").concat(getArrayIndex(options2, focused), ".");
    }
    return "";
  },
  onFilter: function onFilter(props) {
    var inputValue = props.inputValue, resultsMessage = props.resultsMessage;
    return "".concat(resultsMessage).concat(inputValue ? " for search term " + inputValue : "", ".");
  }
};
var LiveRegion = function LiveRegion2(props) {
  var ariaSelection = props.ariaSelection, focusedOption = props.focusedOption, focusedValue = props.focusedValue, focusableOptions = props.focusableOptions, isFocused = props.isFocused, selectValue = props.selectValue, selectProps = props.selectProps, id = props.id, isAppleDevice2 = props.isAppleDevice;
  var ariaLiveMessages = selectProps.ariaLiveMessages, getOptionLabel4 = selectProps.getOptionLabel, inputValue = selectProps.inputValue, isMulti = selectProps.isMulti, isOptionDisabled3 = selectProps.isOptionDisabled, isSearchable = selectProps.isSearchable, menuIsOpen = selectProps.menuIsOpen, options2 = selectProps.options, screenReaderStatus2 = selectProps.screenReaderStatus, tabSelectsValue = selectProps.tabSelectsValue, isLoading = selectProps.isLoading;
  var ariaLabel = selectProps["aria-label"];
  var ariaLive = selectProps["aria-live"];
  var messages = (0, import_react7.useMemo)(function() {
    return _objectSpread2(_objectSpread2({}, defaultAriaLiveMessages), ariaLiveMessages || {});
  }, [ariaLiveMessages]);
  var ariaSelected = (0, import_react7.useMemo)(function() {
    var message = "";
    if (ariaSelection && messages.onChange) {
      var option = ariaSelection.option, selectedOptions = ariaSelection.options, removedValue = ariaSelection.removedValue, removedValues = ariaSelection.removedValues, value = ariaSelection.value;
      var asOption = function asOption2(val) {
        return !Array.isArray(val) ? val : null;
      };
      var selected = removedValue || option || asOption(value);
      var label = selected ? getOptionLabel4(selected) : "";
      var multiSelected = selectedOptions || removedValues || void 0;
      var labels = multiSelected ? multiSelected.map(getOptionLabel4) : [];
      var onChangeProps = _objectSpread2({
        // multiSelected items are usually items that have already been selected
        // or set by the user as a default value so we assume they are not disabled
        isDisabled: selected && isOptionDisabled3(selected, selectValue),
        label,
        labels
      }, ariaSelection);
      message = messages.onChange(onChangeProps);
    }
    return message;
  }, [ariaSelection, messages, isOptionDisabled3, selectValue, getOptionLabel4]);
  var ariaFocused = (0, import_react7.useMemo)(function() {
    var focusMsg = "";
    var focused = focusedOption || focusedValue;
    var isSelected = !!(focusedOption && selectValue && selectValue.includes(focusedOption));
    if (focused && messages.onFocus) {
      var onFocusProps = {
        focused,
        label: getOptionLabel4(focused),
        isDisabled: isOptionDisabled3(focused, selectValue),
        isSelected,
        options: focusableOptions,
        context: focused === focusedOption ? "menu" : "value",
        selectValue,
        isAppleDevice: isAppleDevice2
      };
      focusMsg = messages.onFocus(onFocusProps);
    }
    return focusMsg;
  }, [focusedOption, focusedValue, getOptionLabel4, isOptionDisabled3, messages, focusableOptions, selectValue, isAppleDevice2]);
  var ariaResults = (0, import_react7.useMemo)(function() {
    var resultsMsg = "";
    if (menuIsOpen && options2.length && !isLoading && messages.onFilter) {
      var resultsMessage = screenReaderStatus2({
        count: focusableOptions.length
      });
      resultsMsg = messages.onFilter({
        inputValue,
        resultsMessage
      });
    }
    return resultsMsg;
  }, [focusableOptions, inputValue, menuIsOpen, messages, options2, screenReaderStatus2, isLoading]);
  var isInitialFocus = (ariaSelection === null || ariaSelection === void 0 ? void 0 : ariaSelection.action) === "initial-input-focus";
  var ariaGuidance = (0, import_react7.useMemo)(function() {
    var guidanceMsg = "";
    if (messages.guidance) {
      var context = focusedValue ? "value" : menuIsOpen ? "menu" : "input";
      guidanceMsg = messages.guidance({
        "aria-label": ariaLabel,
        context,
        isDisabled: focusedOption && isOptionDisabled3(focusedOption, selectValue),
        isMulti,
        isSearchable,
        tabSelectsValue,
        isInitialFocus
      });
    }
    return guidanceMsg;
  }, [ariaLabel, focusedOption, focusedValue, isMulti, isOptionDisabled3, isSearchable, menuIsOpen, messages, selectValue, tabSelectsValue, isInitialFocus]);
  var ScreenReaderText = jsx(import_react7.Fragment, null, jsx("span", {
    id: "aria-selection"
  }, ariaSelected), jsx("span", {
    id: "aria-focused"
  }, ariaFocused), jsx("span", {
    id: "aria-results"
  }, ariaResults), jsx("span", {
    id: "aria-guidance"
  }, ariaGuidance));
  return jsx(import_react7.Fragment, null, jsx(A11yText$1, {
    id
  }, isInitialFocus && ScreenReaderText), jsx(A11yText$1, {
    "aria-live": ariaLive,
    "aria-atomic": "false",
    "aria-relevant": "additions text",
    role: "log"
  }, isFocused && !isInitialFocus && ScreenReaderText));
};
var LiveRegion$1 = LiveRegion;
var diacritics = [{
  base: "A",
  letters: "A\u24B6\uFF21\xC0\xC1\xC2\u1EA6\u1EA4\u1EAA\u1EA8\xC3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\xC4\u01DE\u1EA2\xC5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F"
}, {
  base: "AA",
  letters: "\uA732"
}, {
  base: "AE",
  letters: "\xC6\u01FC\u01E2"
}, {
  base: "AO",
  letters: "\uA734"
}, {
  base: "AU",
  letters: "\uA736"
}, {
  base: "AV",
  letters: "\uA738\uA73A"
}, {
  base: "AY",
  letters: "\uA73C"
}, {
  base: "B",
  letters: "B\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181"
}, {
  base: "C",
  letters: "C\u24B8\uFF23\u0106\u0108\u010A\u010C\xC7\u1E08\u0187\u023B\uA73E"
}, {
  base: "D",
  letters: "D\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779"
}, {
  base: "DZ",
  letters: "\u01F1\u01C4"
}, {
  base: "Dz",
  letters: "\u01F2\u01C5"
}, {
  base: "E",
  letters: "E\u24BA\uFF25\xC8\xC9\xCA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\xCB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E"
}, {
  base: "F",
  letters: "F\u24BB\uFF26\u1E1E\u0191\uA77B"
}, {
  base: "G",
  letters: "G\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E"
}, {
  base: "H",
  letters: "H\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D"
}, {
  base: "I",
  letters: "I\u24BE\uFF29\xCC\xCD\xCE\u0128\u012A\u012C\u0130\xCF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197"
}, {
  base: "J",
  letters: "J\u24BF\uFF2A\u0134\u0248"
}, {
  base: "K",
  letters: "K\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2"
}, {
  base: "L",
  letters: "L\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780"
}, {
  base: "LJ",
  letters: "\u01C7"
}, {
  base: "Lj",
  letters: "\u01C8"
}, {
  base: "M",
  letters: "M\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C"
}, {
  base: "N",
  letters: "N\u24C3\uFF2E\u01F8\u0143\xD1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4"
}, {
  base: "NJ",
  letters: "\u01CA"
}, {
  base: "Nj",
  letters: "\u01CB"
}, {
  base: "O",
  letters: "O\u24C4\uFF2F\xD2\xD3\xD4\u1ED2\u1ED0\u1ED6\u1ED4\xD5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\xD6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\xD8\u01FE\u0186\u019F\uA74A\uA74C"
}, {
  base: "OI",
  letters: "\u01A2"
}, {
  base: "OO",
  letters: "\uA74E"
}, {
  base: "OU",
  letters: "\u0222"
}, {
  base: "P",
  letters: "P\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754"
}, {
  base: "Q",
  letters: "Q\u24C6\uFF31\uA756\uA758\u024A"
}, {
  base: "R",
  letters: "R\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782"
}, {
  base: "S",
  letters: "S\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784"
}, {
  base: "T",
  letters: "T\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786"
}, {
  base: "TZ",
  letters: "\uA728"
}, {
  base: "U",
  letters: "U\u24CA\uFF35\xD9\xDA\xDB\u0168\u1E78\u016A\u1E7A\u016C\xDC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244"
}, {
  base: "V",
  letters: "V\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245"
}, {
  base: "VY",
  letters: "\uA760"
}, {
  base: "W",
  letters: "W\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72"
}, {
  base: "X",
  letters: "X\u24CD\uFF38\u1E8A\u1E8C"
}, {
  base: "Y",
  letters: "Y\u24CE\uFF39\u1EF2\xDD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE"
}, {
  base: "Z",
  letters: "Z\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762"
}, {
  base: "a",
  letters: "a\u24D0\uFF41\u1E9A\xE0\xE1\xE2\u1EA7\u1EA5\u1EAB\u1EA9\xE3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\xE4\u01DF\u1EA3\xE5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250"
}, {
  base: "aa",
  letters: "\uA733"
}, {
  base: "ae",
  letters: "\xE6\u01FD\u01E3"
}, {
  base: "ao",
  letters: "\uA735"
}, {
  base: "au",
  letters: "\uA737"
}, {
  base: "av",
  letters: "\uA739\uA73B"
}, {
  base: "ay",
  letters: "\uA73D"
}, {
  base: "b",
  letters: "b\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253"
}, {
  base: "c",
  letters: "c\u24D2\uFF43\u0107\u0109\u010B\u010D\xE7\u1E09\u0188\u023C\uA73F\u2184"
}, {
  base: "d",
  letters: "d\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A"
}, {
  base: "dz",
  letters: "\u01F3\u01C6"
}, {
  base: "e",
  letters: "e\u24D4\uFF45\xE8\xE9\xEA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\xEB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD"
}, {
  base: "f",
  letters: "f\u24D5\uFF46\u1E1F\u0192\uA77C"
}, {
  base: "g",
  letters: "g\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F"
}, {
  base: "h",
  letters: "h\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265"
}, {
  base: "hv",
  letters: "\u0195"
}, {
  base: "i",
  letters: "i\u24D8\uFF49\xEC\xED\xEE\u0129\u012B\u012D\xEF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131"
}, {
  base: "j",
  letters: "j\u24D9\uFF4A\u0135\u01F0\u0249"
}, {
  base: "k",
  letters: "k\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3"
}, {
  base: "l",
  letters: "l\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747"
}, {
  base: "lj",
  letters: "\u01C9"
}, {
  base: "m",
  letters: "m\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F"
}, {
  base: "n",
  letters: "n\u24DD\uFF4E\u01F9\u0144\xF1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5"
}, {
  base: "nj",
  letters: "\u01CC"
}, {
  base: "o",
  letters: "o\u24DE\uFF4F\xF2\xF3\xF4\u1ED3\u1ED1\u1ED7\u1ED5\xF5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\xF6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\xF8\u01FF\u0254\uA74B\uA74D\u0275"
}, {
  base: "oi",
  letters: "\u01A3"
}, {
  base: "ou",
  letters: "\u0223"
}, {
  base: "oo",
  letters: "\uA74F"
}, {
  base: "p",
  letters: "p\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755"
}, {
  base: "q",
  letters: "q\u24E0\uFF51\u024B\uA757\uA759"
}, {
  base: "r",
  letters: "r\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783"
}, {
  base: "s",
  letters: "s\u24E2\uFF53\xDF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B"
}, {
  base: "t",
  letters: "t\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787"
}, {
  base: "tz",
  letters: "\uA729"
}, {
  base: "u",
  letters: "u\u24E4\uFF55\xF9\xFA\xFB\u0169\u1E79\u016B\u1E7B\u016D\xFC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289"
}, {
  base: "v",
  letters: "v\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C"
}, {
  base: "vy",
  letters: "\uA761"
}, {
  base: "w",
  letters: "w\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73"
}, {
  base: "x",
  letters: "x\u24E7\uFF58\u1E8B\u1E8D"
}, {
  base: "y",
  letters: "y\u24E8\uFF59\u1EF3\xFD\u0177\u1EF9\u0233\u1E8F\xFF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF"
}, {
  base: "z",
  letters: "z\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763"
}];
var anyDiacritic = new RegExp("[" + diacritics.map(function(d) {
  return d.letters;
}).join("") + "]", "g");
var diacriticToBase = {};
for (i = 0; i < diacritics.length; i++) {
  diacritic = diacritics[i];
  for (j = 0; j < diacritic.letters.length; j++) {
    diacriticToBase[diacritic.letters[j]] = diacritic.base;
  }
}
var diacritic;
var j;
var i;
var stripDiacritics = function stripDiacritics2(str) {
  return str.replace(anyDiacritic, function(match2) {
    return diacriticToBase[match2];
  });
};
var memoizedStripDiacriticsForInput = memoizeOne(stripDiacritics);
var trimString = function trimString2(str) {
  return str.replace(/^\s+|\s+$/g, "");
};
var defaultStringify = function defaultStringify2(option) {
  return "".concat(option.label, " ").concat(option.value);
};
var createFilter = function createFilter2(config) {
  return function(option, rawInput) {
    if (option.data.__isNew__)
      return true;
    var _ignoreCase$ignoreAcc = _objectSpread2({
      ignoreCase: true,
      ignoreAccents: true,
      stringify: defaultStringify,
      trim: true,
      matchFrom: "any"
    }, config), ignoreCase = _ignoreCase$ignoreAcc.ignoreCase, ignoreAccents = _ignoreCase$ignoreAcc.ignoreAccents, stringify2 = _ignoreCase$ignoreAcc.stringify, trim2 = _ignoreCase$ignoreAcc.trim, matchFrom = _ignoreCase$ignoreAcc.matchFrom;
    var input = trim2 ? trimString(rawInput) : rawInput;
    var candidate = trim2 ? trimString(stringify2(option)) : stringify2(option);
    if (ignoreCase) {
      input = input.toLowerCase();
      candidate = candidate.toLowerCase();
    }
    if (ignoreAccents) {
      input = memoizedStripDiacriticsForInput(input);
      candidate = stripDiacritics(candidate);
    }
    return matchFrom === "start" ? candidate.substr(0, input.length) === input : candidate.indexOf(input) > -1;
  };
};
var _excluded4 = ["innerRef"];
function DummyInput(_ref3) {
  var innerRef = _ref3.innerRef, props = _objectWithoutProperties(_ref3, _excluded4);
  var filteredProps = removeProps(props, "onExited", "in", "enter", "exit", "appear");
  return jsx("input", _extends({
    ref: innerRef
  }, filteredProps, {
    css: /* @__PURE__ */ css({
      label: "dummyInput",
      // get rid of any default styles
      background: 0,
      border: 0,
      // important! this hides the flashing cursor
      caretColor: "transparent",
      fontSize: "inherit",
      gridArea: "1 / 1 / 2 / 3",
      outline: 0,
      padding: 0,
      // important! without `width` browsers won't allow focus
      width: 1,
      // remove cursor on desktop
      color: "transparent",
      // remove cursor on mobile whilst maintaining "scroll into view" behaviour
      left: -100,
      opacity: 0,
      position: "relative",
      transform: "scale(.01)"
    }, false ? "" : ";label:DummyInput;", false ? "" : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkR1bW15SW5wdXQudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQXlCTSIsImZpbGUiOiJEdW1teUlucHV0LnRzeCIsInNvdXJjZXNDb250ZW50IjpbIi8qKiBAanN4IGpzeCAqL1xuaW1wb3J0IHsgUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsganN4IH0gZnJvbSAnQGVtb3Rpb24vcmVhY3QnO1xuaW1wb3J0IHsgcmVtb3ZlUHJvcHMgfSBmcm9tICcuLi91dGlscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIER1bW15SW5wdXQoe1xuICBpbm5lclJlZixcbiAgLi4ucHJvcHNcbn06IEpTWC5JbnRyaW5zaWNFbGVtZW50c1snaW5wdXQnXSAmIHtcbiAgcmVhZG9ubHkgaW5uZXJSZWY6IFJlZjxIVE1MSW5wdXRFbGVtZW50Pjtcbn0pIHtcbiAgLy8gUmVtb3ZlIGFuaW1hdGlvbiBwcm9wcyBub3QgbWVhbnQgZm9yIEhUTUwgZWxlbWVudHNcbiAgY29uc3QgZmlsdGVyZWRQcm9wcyA9IHJlbW92ZVByb3BzKFxuICAgIHByb3BzLFxuICAgICdvbkV4aXRlZCcsXG4gICAgJ2luJyxcbiAgICAnZW50ZXInLFxuICAgICdleGl0JyxcbiAgICAnYXBwZWFyJ1xuICApO1xuXG4gIHJldHVybiAoXG4gICAgPGlucHV0XG4gICAgICByZWY9e2lubmVyUmVmfVxuICAgICAgey4uLmZpbHRlcmVkUHJvcHN9XG4gICAgICBjc3M9e3tcbiAgICAgICAgbGFiZWw6ICdkdW1teUlucHV0JyxcbiAgICAgICAgLy8gZ2V0IHJpZCBvZiBhbnkgZGVmYXVsdCBzdHlsZXNcbiAgICAgICAgYmFja2dyb3VuZDogMCxcbiAgICAgICAgYm9yZGVyOiAwLFxuICAgICAgICAvLyBpbXBvcnRhbnQhIHRoaXMgaGlkZXMgdGhlIGZsYXNoaW5nIGN1cnNvclxuICAgICAgICBjYXJldENvbG9yOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICBmb250U2l6ZTogJ2luaGVyaXQnLFxuICAgICAgICBncmlkQXJlYTogJzEgLyAxIC8gMiAvIDMnLFxuICAgICAgICBvdXRsaW5lOiAwLFxuICAgICAgICBwYWRkaW5nOiAwLFxuICAgICAgICAvLyBpbXBvcnRhbnQhIHdpdGhvdXQgYHdpZHRoYCBicm93c2VycyB3b24ndCBhbGxvdyBmb2N1c1xuICAgICAgICB3aWR0aDogMSxcblxuICAgICAgICAvLyByZW1vdmUgY3Vyc29yIG9uIGRlc2t0b3BcbiAgICAgICAgY29sb3I6ICd0cmFuc3BhcmVudCcsXG5cbiAgICAgICAgLy8gcmVtb3ZlIGN1cnNvciBvbiBtb2JpbGUgd2hpbHN0IG1haW50YWluaW5nIFwic2Nyb2xsIGludG8gdmlld1wiIGJlaGF2aW91clxuICAgICAgICBsZWZ0OiAtMTAwLFxuICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcbiAgICAgICAgdHJhbnNmb3JtOiAnc2NhbGUoLjAxKScsXG4gICAgICB9fVxuICAgIC8+XG4gICk7XG59XG4iXX0= */")
  }));
}
var cancelScroll = function cancelScroll2(event) {
  if (event.cancelable)
    event.preventDefault();
  event.stopPropagation();
};
function useScrollCapture(_ref3) {
  var isEnabled = _ref3.isEnabled, onBottomArrive = _ref3.onBottomArrive, onBottomLeave = _ref3.onBottomLeave, onTopArrive = _ref3.onTopArrive, onTopLeave = _ref3.onTopLeave;
  var isBottom = (0, import_react7.useRef)(false);
  var isTop = (0, import_react7.useRef)(false);
  var touchStart = (0, import_react7.useRef)(0);
  var scrollTarget = (0, import_react7.useRef)(null);
  var handleEventDelta = (0, import_react7.useCallback)(function(event, delta) {
    if (scrollTarget.current === null)
      return;
    var _scrollTarget$current = scrollTarget.current, scrollTop = _scrollTarget$current.scrollTop, scrollHeight = _scrollTarget$current.scrollHeight, clientHeight = _scrollTarget$current.clientHeight;
    var target = scrollTarget.current;
    var isDeltaPositive = delta > 0;
    var availableScroll = scrollHeight - clientHeight - scrollTop;
    var shouldCancelScroll = false;
    if (availableScroll > delta && isBottom.current) {
      if (onBottomLeave)
        onBottomLeave(event);
      isBottom.current = false;
    }
    if (isDeltaPositive && isTop.current) {
      if (onTopLeave)
        onTopLeave(event);
      isTop.current = false;
    }
    if (isDeltaPositive && delta > availableScroll) {
      if (onBottomArrive && !isBottom.current) {
        onBottomArrive(event);
      }
      target.scrollTop = scrollHeight;
      shouldCancelScroll = true;
      isBottom.current = true;
    } else if (!isDeltaPositive && -delta > scrollTop) {
      if (onTopArrive && !isTop.current) {
        onTopArrive(event);
      }
      target.scrollTop = 0;
      shouldCancelScroll = true;
      isTop.current = true;
    }
    if (shouldCancelScroll) {
      cancelScroll(event);
    }
  }, [onBottomArrive, onBottomLeave, onTopArrive, onTopLeave]);
  var onWheel = (0, import_react7.useCallback)(function(event) {
    handleEventDelta(event, event.deltaY);
  }, [handleEventDelta]);
  var onTouchStart = (0, import_react7.useCallback)(function(event) {
    touchStart.current = event.changedTouches[0].clientY;
  }, []);
  var onTouchMove = (0, import_react7.useCallback)(function(event) {
    var deltaY = touchStart.current - event.changedTouches[0].clientY;
    handleEventDelta(event, deltaY);
  }, [handleEventDelta]);
  var startListening = (0, import_react7.useCallback)(function(el) {
    if (!el)
      return;
    var notPassive = supportsPassiveEvents ? {
      passive: false
    } : false;
    el.addEventListener("wheel", onWheel, notPassive);
    el.addEventListener("touchstart", onTouchStart, notPassive);
    el.addEventListener("touchmove", onTouchMove, notPassive);
  }, [onTouchMove, onTouchStart, onWheel]);
  var stopListening = (0, import_react7.useCallback)(function(el) {
    if (!el)
      return;
    el.removeEventListener("wheel", onWheel, false);
    el.removeEventListener("touchstart", onTouchStart, false);
    el.removeEventListener("touchmove", onTouchMove, false);
  }, [onTouchMove, onTouchStart, onWheel]);
  (0, import_react7.useEffect)(function() {
    if (!isEnabled)
      return;
    var element = scrollTarget.current;
    startListening(element);
    return function() {
      stopListening(element);
    };
  }, [isEnabled, startListening, stopListening]);
  return function(element) {
    scrollTarget.current = element;
  };
}
var STYLE_KEYS = ["boxSizing", "height", "overflow", "paddingRight", "position"];
var LOCK_STYLES = {
  boxSizing: "border-box",
  // account for possible declaration `width: 100%;` on body
  overflow: "hidden",
  position: "relative",
  height: "100%"
};
function preventTouchMove(e) {
  e.preventDefault();
}
function allowTouchMove(e) {
  e.stopPropagation();
}
function preventInertiaScroll() {
  var top = this.scrollTop;
  var totalScroll = this.scrollHeight;
  var currentScroll = top + this.offsetHeight;
  if (top === 0) {
    this.scrollTop = 1;
  } else if (currentScroll === totalScroll) {
    this.scrollTop = top - 1;
  }
}
function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints;
}
var canUseDOM = !!(typeof window !== "undefined" && window.document && window.document.createElement);
var activeScrollLocks = 0;
var listenerOptions = {
  capture: false,
  passive: false
};
function useScrollLock(_ref3) {
  var isEnabled = _ref3.isEnabled, _ref$accountForScroll = _ref3.accountForScrollbars, accountForScrollbars = _ref$accountForScroll === void 0 ? true : _ref$accountForScroll;
  var originalStyles = (0, import_react7.useRef)({});
  var scrollTarget = (0, import_react7.useRef)(null);
  var addScrollLock = (0, import_react7.useCallback)(function(touchScrollTarget) {
    if (!canUseDOM)
      return;
    var target = document.body;
    var targetStyle = target && target.style;
    if (accountForScrollbars) {
      STYLE_KEYS.forEach(function(key) {
        var val = targetStyle && targetStyle[key];
        originalStyles.current[key] = val;
      });
    }
    if (accountForScrollbars && activeScrollLocks < 1) {
      var currentPadding = parseInt(originalStyles.current.paddingRight, 10) || 0;
      var clientWidth = document.body ? document.body.clientWidth : 0;
      var adjustedPadding = window.innerWidth - clientWidth + currentPadding || 0;
      Object.keys(LOCK_STYLES).forEach(function(key) {
        var val = LOCK_STYLES[key];
        if (targetStyle) {
          targetStyle[key] = val;
        }
      });
      if (targetStyle) {
        targetStyle.paddingRight = "".concat(adjustedPadding, "px");
      }
    }
    if (target && isTouchDevice()) {
      target.addEventListener("touchmove", preventTouchMove, listenerOptions);
      if (touchScrollTarget) {
        touchScrollTarget.addEventListener("touchstart", preventInertiaScroll, listenerOptions);
        touchScrollTarget.addEventListener("touchmove", allowTouchMove, listenerOptions);
      }
    }
    activeScrollLocks += 1;
  }, [accountForScrollbars]);
  var removeScrollLock = (0, import_react7.useCallback)(function(touchScrollTarget) {
    if (!canUseDOM)
      return;
    var target = document.body;
    var targetStyle = target && target.style;
    activeScrollLocks = Math.max(activeScrollLocks - 1, 0);
    if (accountForScrollbars && activeScrollLocks < 1) {
      STYLE_KEYS.forEach(function(key) {
        var val = originalStyles.current[key];
        if (targetStyle) {
          targetStyle[key] = val;
        }
      });
    }
    if (target && isTouchDevice()) {
      target.removeEventListener("touchmove", preventTouchMove, listenerOptions);
      if (touchScrollTarget) {
        touchScrollTarget.removeEventListener("touchstart", preventInertiaScroll, listenerOptions);
        touchScrollTarget.removeEventListener("touchmove", allowTouchMove, listenerOptions);
      }
    }
  }, [accountForScrollbars]);
  (0, import_react7.useEffect)(function() {
    if (!isEnabled)
      return;
    var element = scrollTarget.current;
    addScrollLock(element);
    return function() {
      removeScrollLock(element);
    };
  }, [isEnabled, addScrollLock, removeScrollLock]);
  return function(element) {
    scrollTarget.current = element;
  };
}
function _EMOTION_STRINGIFIED_CSS_ERROR__$1() {
  return "You have tried to stringify object returned from `css` function. It isn't supposed to be used directly (e.g. as value of the `className` prop), but rather handed to emotion so it can handle it (e.g. as value of `css` prop).";
}
var blurSelectInput = function blurSelectInput2(event) {
  var element = event.target;
  return element.ownerDocument.activeElement && element.ownerDocument.activeElement.blur();
};
var _ref2$1 = false ? {
  name: "1kfdb0e",
  styles: "position:fixed;left:0;bottom:0;right:0;top:0"
} : {
  name: "bp8cua-ScrollManager",
  styles: "position:fixed;left:0;bottom:0;right:0;top:0;label:ScrollManager;",
  map: "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNjcm9sbE1hbmFnZXIudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQW9EVSIsImZpbGUiOiJTY3JvbGxNYW5hZ2VyLnRzeCIsInNvdXJjZXNDb250ZW50IjpbIi8qKiBAanN4IGpzeCAqL1xuaW1wb3J0IHsganN4IH0gZnJvbSAnQGVtb3Rpb24vcmVhY3QnO1xuaW1wb3J0IHsgRnJhZ21lbnQsIFJlYWN0RWxlbWVudCwgUmVmQ2FsbGJhY2ssIE1vdXNlRXZlbnQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgdXNlU2Nyb2xsQ2FwdHVyZSBmcm9tICcuL3VzZVNjcm9sbENhcHR1cmUnO1xuaW1wb3J0IHVzZVNjcm9sbExvY2sgZnJvbSAnLi91c2VTY3JvbGxMb2NrJztcblxuaW50ZXJmYWNlIFByb3BzIHtcbiAgcmVhZG9ubHkgY2hpbGRyZW46IChyZWY6IFJlZkNhbGxiYWNrPEhUTUxFbGVtZW50PikgPT4gUmVhY3RFbGVtZW50O1xuICByZWFkb25seSBsb2NrRW5hYmxlZDogYm9vbGVhbjtcbiAgcmVhZG9ubHkgY2FwdHVyZUVuYWJsZWQ6IGJvb2xlYW47XG4gIHJlYWRvbmx5IG9uQm90dG9tQXJyaXZlPzogKGV2ZW50OiBXaGVlbEV2ZW50IHwgVG91Y2hFdmVudCkgPT4gdm9pZDtcbiAgcmVhZG9ubHkgb25Cb3R0b21MZWF2ZT86IChldmVudDogV2hlZWxFdmVudCB8IFRvdWNoRXZlbnQpID0+IHZvaWQ7XG4gIHJlYWRvbmx5IG9uVG9wQXJyaXZlPzogKGV2ZW50OiBXaGVlbEV2ZW50IHwgVG91Y2hFdmVudCkgPT4gdm9pZDtcbiAgcmVhZG9ubHkgb25Ub3BMZWF2ZT86IChldmVudDogV2hlZWxFdmVudCB8IFRvdWNoRXZlbnQpID0+IHZvaWQ7XG59XG5cbmNvbnN0IGJsdXJTZWxlY3RJbnB1dCA9IChldmVudDogTW91c2VFdmVudDxIVE1MRGl2RWxlbWVudD4pID0+IHtcbiAgY29uc3QgZWxlbWVudCA9IGV2ZW50LnRhcmdldCBhcyBIVE1MRGl2RWxlbWVudDtcbiAgcmV0dXJuIChcbiAgICBlbGVtZW50Lm93bmVyRG9jdW1lbnQuYWN0aXZlRWxlbWVudCAmJlxuICAgIChlbGVtZW50Lm93bmVyRG9jdW1lbnQuYWN0aXZlRWxlbWVudCBhcyBIVE1MRWxlbWVudCkuYmx1cigpXG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBTY3JvbGxNYW5hZ2VyKHtcbiAgY2hpbGRyZW4sXG4gIGxvY2tFbmFibGVkLFxuICBjYXB0dXJlRW5hYmxlZCA9IHRydWUsXG4gIG9uQm90dG9tQXJyaXZlLFxuICBvbkJvdHRvbUxlYXZlLFxuICBvblRvcEFycml2ZSxcbiAgb25Ub3BMZWF2ZSxcbn06IFByb3BzKSB7XG4gIGNvbnN0IHNldFNjcm9sbENhcHR1cmVUYXJnZXQgPSB1c2VTY3JvbGxDYXB0dXJlKHtcbiAgICBpc0VuYWJsZWQ6IGNhcHR1cmVFbmFibGVkLFxuICAgIG9uQm90dG9tQXJyaXZlLFxuICAgIG9uQm90dG9tTGVhdmUsXG4gICAgb25Ub3BBcnJpdmUsXG4gICAgb25Ub3BMZWF2ZSxcbiAgfSk7XG4gIGNvbnN0IHNldFNjcm9sbExvY2tUYXJnZXQgPSB1c2VTY3JvbGxMb2NrKHsgaXNFbmFibGVkOiBsb2NrRW5hYmxlZCB9KTtcblxuICBjb25zdCB0YXJnZXRSZWY6IFJlZkNhbGxiYWNrPEhUTUxFbGVtZW50PiA9IChlbGVtZW50KSA9PiB7XG4gICAgc2V0U2Nyb2xsQ2FwdHVyZVRhcmdldChlbGVtZW50KTtcbiAgICBzZXRTY3JvbGxMb2NrVGFyZ2V0KGVsZW1lbnQpO1xuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPEZyYWdtZW50PlxuICAgICAge2xvY2tFbmFibGVkICYmIChcbiAgICAgICAgPGRpdlxuICAgICAgICAgIG9uQ2xpY2s9e2JsdXJTZWxlY3RJbnB1dH1cbiAgICAgICAgICBjc3M9e3sgcG9zaXRpb246ICdmaXhlZCcsIGxlZnQ6IDAsIGJvdHRvbTogMCwgcmlnaHQ6IDAsIHRvcDogMCB9fVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICAgIHtjaGlsZHJlbih0YXJnZXRSZWYpfVxuICAgIDwvRnJhZ21lbnQ+XG4gICk7XG59XG4iXX0= */",
  toString: _EMOTION_STRINGIFIED_CSS_ERROR__$1
};
function ScrollManager(_ref3) {
  var children = _ref3.children, lockEnabled = _ref3.lockEnabled, _ref$captureEnabled = _ref3.captureEnabled, captureEnabled = _ref$captureEnabled === void 0 ? true : _ref$captureEnabled, onBottomArrive = _ref3.onBottomArrive, onBottomLeave = _ref3.onBottomLeave, onTopArrive = _ref3.onTopArrive, onTopLeave = _ref3.onTopLeave;
  var setScrollCaptureTarget = useScrollCapture({
    isEnabled: captureEnabled,
    onBottomArrive,
    onBottomLeave,
    onTopArrive,
    onTopLeave
  });
  var setScrollLockTarget = useScrollLock({
    isEnabled: lockEnabled
  });
  var targetRef = function targetRef2(element) {
    setScrollCaptureTarget(element);
    setScrollLockTarget(element);
  };
  return jsx(import_react7.Fragment, null, lockEnabled && jsx("div", {
    onClick: blurSelectInput,
    css: _ref2$1
  }), children(targetRef));
}
function _EMOTION_STRINGIFIED_CSS_ERROR__2() {
  return "You have tried to stringify object returned from `css` function. It isn't supposed to be used directly (e.g. as value of the `className` prop), but rather handed to emotion so it can handle it (e.g. as value of `css` prop).";
}
var _ref22 = false ? {
  name: "1a0ro4n-requiredInput",
  styles: "label:requiredInput;opacity:0;pointer-events:none;position:absolute;bottom:0;left:0;right:0;width:100%"
} : {
  name: "5kkxb2-requiredInput-RequiredInput",
  styles: "label:requiredInput;opacity:0;pointer-events:none;position:absolute;bottom:0;left:0;right:0;width:100%;label:RequiredInput;",
  map: "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlcXVpcmVkSW5wdXQudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWNJIiwiZmlsZSI6IlJlcXVpcmVkSW5wdXQudHN4Iiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBqc3gganN4ICovXG5pbXBvcnQgeyBGb2N1c0V2ZW50SGFuZGxlciwgRnVuY3Rpb25Db21wb25lbnQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBqc3ggfSBmcm9tICdAZW1vdGlvbi9yZWFjdCc7XG5cbmNvbnN0IFJlcXVpcmVkSW5wdXQ6IEZ1bmN0aW9uQ29tcG9uZW50PHtcbiAgcmVhZG9ubHkgbmFtZT86IHN0cmluZztcbiAgcmVhZG9ubHkgb25Gb2N1czogRm9jdXNFdmVudEhhbmRsZXI8SFRNTElucHV0RWxlbWVudD47XG59PiA9ICh7IG5hbWUsIG9uRm9jdXMgfSkgPT4gKFxuICA8aW5wdXRcbiAgICByZXF1aXJlZFxuICAgIG5hbWU9e25hbWV9XG4gICAgdGFiSW5kZXg9ey0xfVxuICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgb25Gb2N1cz17b25Gb2N1c31cbiAgICBjc3M9e3tcbiAgICAgIGxhYmVsOiAncmVxdWlyZWRJbnB1dCcsXG4gICAgICBvcGFjaXR5OiAwLFxuICAgICAgcG9pbnRlckV2ZW50czogJ25vbmUnLFxuICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICBib3R0b206IDAsXG4gICAgICBsZWZ0OiAwLFxuICAgICAgcmlnaHQ6IDAsXG4gICAgICB3aWR0aDogJzEwMCUnLFxuICAgIH19XG4gICAgLy8gUHJldmVudCBgU3dpdGNoaW5nIGZyb20gdW5jb250cm9sbGVkIHRvIGNvbnRyb2xsZWRgIGVycm9yXG4gICAgdmFsdWU9XCJcIlxuICAgIG9uQ2hhbmdlPXsoKSA9PiB7fX1cbiAgLz5cbik7XG5cbmV4cG9ydCBkZWZhdWx0IFJlcXVpcmVkSW5wdXQ7XG4iXX0= */",
  toString: _EMOTION_STRINGIFIED_CSS_ERROR__2
};
var RequiredInput = function RequiredInput2(_ref3) {
  var name = _ref3.name, onFocus2 = _ref3.onFocus;
  return jsx("input", {
    required: true,
    name,
    tabIndex: -1,
    "aria-hidden": "true",
    onFocus: onFocus2,
    css: _ref22,
    value: "",
    onChange: function onChange2() {
    }
  });
};
var RequiredInput$1 = RequiredInput;
function testPlatform(re) {
  var _window$navigator$use;
  return typeof window !== "undefined" && window.navigator != null ? re.test(((_window$navigator$use = window.navigator["userAgentData"]) === null || _window$navigator$use === void 0 ? void 0 : _window$navigator$use.platform) || window.navigator.platform) : false;
}
function isIPhone() {
  return testPlatform(/^iPhone/i);
}
function isMac() {
  return testPlatform(/^Mac/i);
}
function isIPad() {
  return testPlatform(/^iPad/i) || // iPadOS 13 lies and says it's a Mac, but we can distinguish by detecting touch support.
  isMac() && navigator.maxTouchPoints > 1;
}
function isIOS() {
  return isIPhone() || isIPad();
}
function isAppleDevice() {
  return isMac() || isIOS();
}
var formatGroupLabel = function formatGroupLabel2(group) {
  return group.label;
};
var getOptionLabel$1 = function getOptionLabel(option) {
  return option.label;
};
var getOptionValue$1 = function getOptionValue(option) {
  return option.value;
};
var isOptionDisabled = function isOptionDisabled2(option) {
  return !!option.isDisabled;
};
var defaultStyles = {
  clearIndicator: clearIndicatorCSS,
  container: containerCSS,
  control: css$1,
  dropdownIndicator: dropdownIndicatorCSS,
  group: groupCSS,
  groupHeading: groupHeadingCSS,
  indicatorsContainer: indicatorsContainerCSS,
  indicatorSeparator: indicatorSeparatorCSS,
  input: inputCSS,
  loadingIndicator: loadingIndicatorCSS,
  loadingMessage: loadingMessageCSS,
  menu: menuCSS,
  menuList: menuListCSS,
  menuPortal: menuPortalCSS,
  multiValue: multiValueCSS,
  multiValueLabel: multiValueLabelCSS,
  multiValueRemove: multiValueRemoveCSS,
  noOptionsMessage: noOptionsMessageCSS,
  option: optionCSS,
  placeholder: placeholderCSS,
  singleValue: css3,
  valueContainer: valueContainerCSS
};
var colors = {
  primary: "#2684FF",
  primary75: "#4C9AFF",
  primary50: "#B2D4FF",
  primary25: "#DEEBFF",
  danger: "#DE350B",
  dangerLight: "#FFBDAD",
  neutral0: "hsl(0, 0%, 100%)",
  neutral5: "hsl(0, 0%, 95%)",
  neutral10: "hsl(0, 0%, 90%)",
  neutral20: "hsl(0, 0%, 80%)",
  neutral30: "hsl(0, 0%, 70%)",
  neutral40: "hsl(0, 0%, 60%)",
  neutral50: "hsl(0, 0%, 50%)",
  neutral60: "hsl(0, 0%, 40%)",
  neutral70: "hsl(0, 0%, 30%)",
  neutral80: "hsl(0, 0%, 20%)",
  neutral90: "hsl(0, 0%, 10%)"
};
var borderRadius = 4;
var baseUnit = 4;
var controlHeight = 38;
var menuGutter = baseUnit * 2;
var spacing = {
  baseUnit,
  controlHeight,
  menuGutter
};
var defaultTheme = {
  borderRadius,
  colors,
  spacing
};
var defaultProps = {
  "aria-live": "polite",
  backspaceRemovesValue: true,
  blurInputOnSelect: isTouchCapable(),
  captureMenuScroll: !isTouchCapable(),
  classNames: {},
  closeMenuOnSelect: true,
  closeMenuOnScroll: false,
  components: {},
  controlShouldRenderValue: true,
  escapeClearsValue: false,
  filterOption: createFilter(),
  formatGroupLabel,
  getOptionLabel: getOptionLabel$1,
  getOptionValue: getOptionValue$1,
  isDisabled: false,
  isLoading: false,
  isMulti: false,
  isRtl: false,
  isSearchable: true,
  isOptionDisabled,
  loadingMessage: function loadingMessage() {
    return "Loading...";
  },
  maxMenuHeight: 300,
  minMenuHeight: 140,
  menuIsOpen: false,
  menuPlacement: "bottom",
  menuPosition: "absolute",
  menuShouldBlockScroll: false,
  menuShouldScrollIntoView: !isMobileDevice(),
  noOptionsMessage: function noOptionsMessage() {
    return "No options";
  },
  openMenuOnFocus: false,
  openMenuOnClick: true,
  options: [],
  pageSize: 5,
  placeholder: "Select...",
  screenReaderStatus: function screenReaderStatus(_ref3) {
    var count = _ref3.count;
    return "".concat(count, " result").concat(count !== 1 ? "s" : "", " available");
  },
  styles: {},
  tabIndex: 0,
  tabSelectsValue: true,
  unstyled: false
};
function toCategorizedOption(props, option, selectValue, index2) {
  var isDisabled = _isOptionDisabled(props, option, selectValue);
  var isSelected = _isOptionSelected(props, option, selectValue);
  var label = getOptionLabel2(props, option);
  var value = getOptionValue2(props, option);
  return {
    type: "option",
    data: option,
    isDisabled,
    isSelected,
    label,
    value,
    index: index2
  };
}
function buildCategorizedOptions(props, selectValue) {
  return props.options.map(function(groupOrOption, groupOrOptionIndex) {
    if ("options" in groupOrOption) {
      var categorizedOptions = groupOrOption.options.map(function(option, optionIndex) {
        return toCategorizedOption(props, option, selectValue, optionIndex);
      }).filter(function(categorizedOption2) {
        return isFocusable(props, categorizedOption2);
      });
      return categorizedOptions.length > 0 ? {
        type: "group",
        data: groupOrOption,
        options: categorizedOptions,
        index: groupOrOptionIndex
      } : void 0;
    }
    var categorizedOption = toCategorizedOption(props, groupOrOption, selectValue, groupOrOptionIndex);
    return isFocusable(props, categorizedOption) ? categorizedOption : void 0;
  }).filter(notNullish);
}
function buildFocusableOptionsFromCategorizedOptions(categorizedOptions) {
  return categorizedOptions.reduce(function(optionsAccumulator, categorizedOption) {
    if (categorizedOption.type === "group") {
      optionsAccumulator.push.apply(optionsAccumulator, _toConsumableArray(categorizedOption.options.map(function(option) {
        return option.data;
      })));
    } else {
      optionsAccumulator.push(categorizedOption.data);
    }
    return optionsAccumulator;
  }, []);
}
function buildFocusableOptionsWithIds(categorizedOptions, optionId) {
  return categorizedOptions.reduce(function(optionsAccumulator, categorizedOption) {
    if (categorizedOption.type === "group") {
      optionsAccumulator.push.apply(optionsAccumulator, _toConsumableArray(categorizedOption.options.map(function(option) {
        return {
          data: option.data,
          id: "".concat(optionId, "-").concat(categorizedOption.index, "-").concat(option.index)
        };
      })));
    } else {
      optionsAccumulator.push({
        data: categorizedOption.data,
        id: "".concat(optionId, "-").concat(categorizedOption.index)
      });
    }
    return optionsAccumulator;
  }, []);
}
function buildFocusableOptions(props, selectValue) {
  return buildFocusableOptionsFromCategorizedOptions(buildCategorizedOptions(props, selectValue));
}
function isFocusable(props, categorizedOption) {
  var _props$inputValue = props.inputValue, inputValue = _props$inputValue === void 0 ? "" : _props$inputValue;
  var data = categorizedOption.data, isSelected = categorizedOption.isSelected, label = categorizedOption.label, value = categorizedOption.value;
  return (!shouldHideSelectedOptions(props) || !isSelected) && _filterOption(props, {
    label,
    value,
    data
  }, inputValue);
}
function getNextFocusedValue(state, nextSelectValue) {
  var focusedValue = state.focusedValue, lastSelectValue = state.selectValue;
  var lastFocusedIndex = lastSelectValue.indexOf(focusedValue);
  if (lastFocusedIndex > -1) {
    var nextFocusedIndex = nextSelectValue.indexOf(focusedValue);
    if (nextFocusedIndex > -1) {
      return focusedValue;
    } else if (lastFocusedIndex < nextSelectValue.length) {
      return nextSelectValue[lastFocusedIndex];
    }
  }
  return null;
}
function getNextFocusedOption(state, options2) {
  var lastFocusedOption = state.focusedOption;
  return lastFocusedOption && options2.indexOf(lastFocusedOption) > -1 ? lastFocusedOption : options2[0];
}
var getFocusedOptionId = function getFocusedOptionId2(focusableOptionsWithIds, focusedOption) {
  var _focusableOptionsWith;
  var focusedOptionId = (_focusableOptionsWith = focusableOptionsWithIds.find(function(option) {
    return option.data === focusedOption;
  })) === null || _focusableOptionsWith === void 0 ? void 0 : _focusableOptionsWith.id;
  return focusedOptionId || null;
};
var getOptionLabel2 = function getOptionLabel3(props, data) {
  return props.getOptionLabel(data);
};
var getOptionValue2 = function getOptionValue3(props, data) {
  return props.getOptionValue(data);
};
function _isOptionDisabled(props, option, selectValue) {
  return typeof props.isOptionDisabled === "function" ? props.isOptionDisabled(option, selectValue) : false;
}
function _isOptionSelected(props, option, selectValue) {
  if (selectValue.indexOf(option) > -1)
    return true;
  if (typeof props.isOptionSelected === "function") {
    return props.isOptionSelected(option, selectValue);
  }
  var candidate = getOptionValue2(props, option);
  return selectValue.some(function(i) {
    return getOptionValue2(props, i) === candidate;
  });
}
function _filterOption(props, option, inputValue) {
  return props.filterOption ? props.filterOption(option, inputValue) : true;
}
var shouldHideSelectedOptions = function shouldHideSelectedOptions2(props) {
  var hideSelectedOptions = props.hideSelectedOptions, isMulti = props.isMulti;
  if (hideSelectedOptions === void 0)
    return isMulti;
  return hideSelectedOptions;
};
var instanceId = 1;
var Select = /* @__PURE__ */ function(_Component) {
  _inherits(Select2, _Component);
  var _super = _createSuper(Select2);
  function Select2(_props) {
    var _this;
    _classCallCheck(this, Select2);
    _this = _super.call(this, _props);
    _this.state = {
      ariaSelection: null,
      focusedOption: null,
      focusedOptionId: null,
      focusableOptionsWithIds: [],
      focusedValue: null,
      inputIsHidden: false,
      isFocused: false,
      selectValue: [],
      clearFocusValueOnUpdate: false,
      prevWasFocused: false,
      inputIsHiddenAfterUpdate: void 0,
      prevProps: void 0,
      instancePrefix: ""
    };
    _this.blockOptionHover = false;
    _this.isComposing = false;
    _this.commonProps = void 0;
    _this.initialTouchX = 0;
    _this.initialTouchY = 0;
    _this.openAfterFocus = false;
    _this.scrollToFocusedOptionOnUpdate = false;
    _this.userIsDragging = void 0;
    _this.isAppleDevice = isAppleDevice();
    _this.controlRef = null;
    _this.getControlRef = function(ref) {
      _this.controlRef = ref;
    };
    _this.focusedOptionRef = null;
    _this.getFocusedOptionRef = function(ref) {
      _this.focusedOptionRef = ref;
    };
    _this.menuListRef = null;
    _this.getMenuListRef = function(ref) {
      _this.menuListRef = ref;
    };
    _this.inputRef = null;
    _this.getInputRef = function(ref) {
      _this.inputRef = ref;
    };
    _this.focus = _this.focusInput;
    _this.blur = _this.blurInput;
    _this.onChange = function(newValue, actionMeta) {
      var _this$props = _this.props, onChange2 = _this$props.onChange, name = _this$props.name;
      actionMeta.name = name;
      _this.ariaOnChange(newValue, actionMeta);
      onChange2(newValue, actionMeta);
    };
    _this.setValue = function(newValue, action, option) {
      var _this$props2 = _this.props, closeMenuOnSelect = _this$props2.closeMenuOnSelect, isMulti = _this$props2.isMulti, inputValue = _this$props2.inputValue;
      _this.onInputChange("", {
        action: "set-value",
        prevInputValue: inputValue
      });
      if (closeMenuOnSelect) {
        _this.setState({
          inputIsHiddenAfterUpdate: !isMulti
        });
        _this.onMenuClose();
      }
      _this.setState({
        clearFocusValueOnUpdate: true
      });
      _this.onChange(newValue, {
        action,
        option
      });
    };
    _this.selectOption = function(newValue) {
      var _this$props3 = _this.props, blurInputOnSelect = _this$props3.blurInputOnSelect, isMulti = _this$props3.isMulti, name = _this$props3.name;
      var selectValue = _this.state.selectValue;
      var deselected = isMulti && _this.isOptionSelected(newValue, selectValue);
      var isDisabled = _this.isOptionDisabled(newValue, selectValue);
      if (deselected) {
        var candidate = _this.getOptionValue(newValue);
        _this.setValue(multiValueAsValue(selectValue.filter(function(i) {
          return _this.getOptionValue(i) !== candidate;
        })), "deselect-option", newValue);
      } else if (!isDisabled) {
        if (isMulti) {
          _this.setValue(multiValueAsValue([].concat(_toConsumableArray(selectValue), [newValue])), "select-option", newValue);
        } else {
          _this.setValue(singleValueAsValue(newValue), "select-option");
        }
      } else {
        _this.ariaOnChange(singleValueAsValue(newValue), {
          action: "select-option",
          option: newValue,
          name
        });
        return;
      }
      if (blurInputOnSelect) {
        _this.blurInput();
      }
    };
    _this.removeValue = function(removedValue) {
      var isMulti = _this.props.isMulti;
      var selectValue = _this.state.selectValue;
      var candidate = _this.getOptionValue(removedValue);
      var newValueArray = selectValue.filter(function(i) {
        return _this.getOptionValue(i) !== candidate;
      });
      var newValue = valueTernary(isMulti, newValueArray, newValueArray[0] || null);
      _this.onChange(newValue, {
        action: "remove-value",
        removedValue
      });
      _this.focusInput();
    };
    _this.clearValue = function() {
      var selectValue = _this.state.selectValue;
      _this.onChange(valueTernary(_this.props.isMulti, [], null), {
        action: "clear",
        removedValues: selectValue
      });
    };
    _this.popValue = function() {
      var isMulti = _this.props.isMulti;
      var selectValue = _this.state.selectValue;
      var lastSelectedValue = selectValue[selectValue.length - 1];
      var newValueArray = selectValue.slice(0, selectValue.length - 1);
      var newValue = valueTernary(isMulti, newValueArray, newValueArray[0] || null);
      _this.onChange(newValue, {
        action: "pop-value",
        removedValue: lastSelectedValue
      });
    };
    _this.getFocusedOptionId = function(focusedOption) {
      return getFocusedOptionId(_this.state.focusableOptionsWithIds, focusedOption);
    };
    _this.getFocusableOptionsWithIds = function() {
      return buildFocusableOptionsWithIds(buildCategorizedOptions(_this.props, _this.state.selectValue), _this.getElementId("option"));
    };
    _this.getValue = function() {
      return _this.state.selectValue;
    };
    _this.cx = function() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return classNames.apply(void 0, [_this.props.classNamePrefix].concat(args));
    };
    _this.getOptionLabel = function(data) {
      return getOptionLabel2(_this.props, data);
    };
    _this.getOptionValue = function(data) {
      return getOptionValue2(_this.props, data);
    };
    _this.getStyles = function(key, props) {
      var unstyled = _this.props.unstyled;
      var base = defaultStyles[key](props, unstyled);
      base.boxSizing = "border-box";
      var custom = _this.props.styles[key];
      return custom ? custom(base, props) : base;
    };
    _this.getClassNames = function(key, props) {
      var _this$props$className, _this$props$className2;
      return (_this$props$className = (_this$props$className2 = _this.props.classNames)[key]) === null || _this$props$className === void 0 ? void 0 : _this$props$className.call(_this$props$className2, props);
    };
    _this.getElementId = function(element) {
      return "".concat(_this.state.instancePrefix, "-").concat(element);
    };
    _this.getComponents = function() {
      return defaultComponents(_this.props);
    };
    _this.buildCategorizedOptions = function() {
      return buildCategorizedOptions(_this.props, _this.state.selectValue);
    };
    _this.getCategorizedOptions = function() {
      return _this.props.menuIsOpen ? _this.buildCategorizedOptions() : [];
    };
    _this.buildFocusableOptions = function() {
      return buildFocusableOptionsFromCategorizedOptions(_this.buildCategorizedOptions());
    };
    _this.getFocusableOptions = function() {
      return _this.props.menuIsOpen ? _this.buildFocusableOptions() : [];
    };
    _this.ariaOnChange = function(value, actionMeta) {
      _this.setState({
        ariaSelection: _objectSpread2({
          value
        }, actionMeta)
      });
    };
    _this.onMenuMouseDown = function(event) {
      if (event.button !== 0) {
        return;
      }
      event.stopPropagation();
      event.preventDefault();
      _this.focusInput();
    };
    _this.onMenuMouseMove = function(event) {
      _this.blockOptionHover = false;
    };
    _this.onControlMouseDown = function(event) {
      if (event.defaultPrevented) {
        return;
      }
      var openMenuOnClick = _this.props.openMenuOnClick;
      if (!_this.state.isFocused) {
        if (openMenuOnClick) {
          _this.openAfterFocus = true;
        }
        _this.focusInput();
      } else if (!_this.props.menuIsOpen) {
        if (openMenuOnClick) {
          _this.openMenu("first");
        }
      } else {
        if (event.target.tagName !== "INPUT" && event.target.tagName !== "TEXTAREA") {
          _this.onMenuClose();
        }
      }
      if (event.target.tagName !== "INPUT" && event.target.tagName !== "TEXTAREA") {
        event.preventDefault();
      }
    };
    _this.onDropdownIndicatorMouseDown = function(event) {
      if (event && event.type === "mousedown" && event.button !== 0) {
        return;
      }
      if (_this.props.isDisabled)
        return;
      var _this$props4 = _this.props, isMulti = _this$props4.isMulti, menuIsOpen = _this$props4.menuIsOpen;
      _this.focusInput();
      if (menuIsOpen) {
        _this.setState({
          inputIsHiddenAfterUpdate: !isMulti
        });
        _this.onMenuClose();
      } else {
        _this.openMenu("first");
      }
      event.preventDefault();
    };
    _this.onClearIndicatorMouseDown = function(event) {
      if (event && event.type === "mousedown" && event.button !== 0) {
        return;
      }
      _this.clearValue();
      event.preventDefault();
      _this.openAfterFocus = false;
      if (event.type === "touchend") {
        _this.focusInput();
      } else {
        setTimeout(function() {
          return _this.focusInput();
        });
      }
    };
    _this.onScroll = function(event) {
      if (typeof _this.props.closeMenuOnScroll === "boolean") {
        if (event.target instanceof HTMLElement && isDocumentElement(event.target)) {
          _this.props.onMenuClose();
        }
      } else if (typeof _this.props.closeMenuOnScroll === "function") {
        if (_this.props.closeMenuOnScroll(event)) {
          _this.props.onMenuClose();
        }
      }
    };
    _this.onCompositionStart = function() {
      _this.isComposing = true;
    };
    _this.onCompositionEnd = function() {
      _this.isComposing = false;
    };
    _this.onTouchStart = function(_ref23) {
      var touches = _ref23.touches;
      var touch = touches && touches.item(0);
      if (!touch) {
        return;
      }
      _this.initialTouchX = touch.clientX;
      _this.initialTouchY = touch.clientY;
      _this.userIsDragging = false;
    };
    _this.onTouchMove = function(_ref3) {
      var touches = _ref3.touches;
      var touch = touches && touches.item(0);
      if (!touch) {
        return;
      }
      var deltaX = Math.abs(touch.clientX - _this.initialTouchX);
      var deltaY = Math.abs(touch.clientY - _this.initialTouchY);
      var moveThreshold = 5;
      _this.userIsDragging = deltaX > moveThreshold || deltaY > moveThreshold;
    };
    _this.onTouchEnd = function(event) {
      if (_this.userIsDragging)
        return;
      if (_this.controlRef && !_this.controlRef.contains(event.target) && _this.menuListRef && !_this.menuListRef.contains(event.target)) {
        _this.blurInput();
      }
      _this.initialTouchX = 0;
      _this.initialTouchY = 0;
    };
    _this.onControlTouchEnd = function(event) {
      if (_this.userIsDragging)
        return;
      _this.onControlMouseDown(event);
    };
    _this.onClearIndicatorTouchEnd = function(event) {
      if (_this.userIsDragging)
        return;
      _this.onClearIndicatorMouseDown(event);
    };
    _this.onDropdownIndicatorTouchEnd = function(event) {
      if (_this.userIsDragging)
        return;
      _this.onDropdownIndicatorMouseDown(event);
    };
    _this.handleInputChange = function(event) {
      var prevInputValue = _this.props.inputValue;
      var inputValue = event.currentTarget.value;
      _this.setState({
        inputIsHiddenAfterUpdate: false
      });
      _this.onInputChange(inputValue, {
        action: "input-change",
        prevInputValue
      });
      if (!_this.props.menuIsOpen) {
        _this.onMenuOpen();
      }
    };
    _this.onInputFocus = function(event) {
      if (_this.props.onFocus) {
        _this.props.onFocus(event);
      }
      _this.setState({
        inputIsHiddenAfterUpdate: false,
        isFocused: true
      });
      if (_this.openAfterFocus || _this.props.openMenuOnFocus) {
        _this.openMenu("first");
      }
      _this.openAfterFocus = false;
    };
    _this.onInputBlur = function(event) {
      var prevInputValue = _this.props.inputValue;
      if (_this.menuListRef && _this.menuListRef.contains(document.activeElement)) {
        _this.inputRef.focus();
        return;
      }
      if (_this.props.onBlur) {
        _this.props.onBlur(event);
      }
      _this.onInputChange("", {
        action: "input-blur",
        prevInputValue
      });
      _this.onMenuClose();
      _this.setState({
        focusedValue: null,
        isFocused: false
      });
    };
    _this.onOptionHover = function(focusedOption) {
      if (_this.blockOptionHover || _this.state.focusedOption === focusedOption) {
        return;
      }
      var options2 = _this.getFocusableOptions();
      var focusedOptionIndex = options2.indexOf(focusedOption);
      _this.setState({
        focusedOption,
        focusedOptionId: focusedOptionIndex > -1 ? _this.getFocusedOptionId(focusedOption) : null
      });
    };
    _this.shouldHideSelectedOptions = function() {
      return shouldHideSelectedOptions(_this.props);
    };
    _this.onValueInputFocus = function(e) {
      e.preventDefault();
      e.stopPropagation();
      _this.focus();
    };
    _this.onKeyDown = function(event) {
      var _this$props5 = _this.props, isMulti = _this$props5.isMulti, backspaceRemovesValue = _this$props5.backspaceRemovesValue, escapeClearsValue = _this$props5.escapeClearsValue, inputValue = _this$props5.inputValue, isClearable = _this$props5.isClearable, isDisabled = _this$props5.isDisabled, menuIsOpen = _this$props5.menuIsOpen, onKeyDown = _this$props5.onKeyDown, tabSelectsValue = _this$props5.tabSelectsValue, openMenuOnFocus = _this$props5.openMenuOnFocus;
      var _this$state = _this.state, focusedOption = _this$state.focusedOption, focusedValue = _this$state.focusedValue, selectValue = _this$state.selectValue;
      if (isDisabled)
        return;
      if (typeof onKeyDown === "function") {
        onKeyDown(event);
        if (event.defaultPrevented) {
          return;
        }
      }
      _this.blockOptionHover = true;
      switch (event.key) {
        case "ArrowLeft":
          if (!isMulti || inputValue)
            return;
          _this.focusValue("previous");
          break;
        case "ArrowRight":
          if (!isMulti || inputValue)
            return;
          _this.focusValue("next");
          break;
        case "Delete":
        case "Backspace":
          if (inputValue)
            return;
          if (focusedValue) {
            _this.removeValue(focusedValue);
          } else {
            if (!backspaceRemovesValue)
              return;
            if (isMulti) {
              _this.popValue();
            } else if (isClearable) {
              _this.clearValue();
            }
          }
          break;
        case "Tab":
          if (_this.isComposing)
            return;
          if (event.shiftKey || !menuIsOpen || !tabSelectsValue || !focusedOption || // don't capture the event if the menu opens on focus and the focused
          // option is already selected; it breaks the flow of navigation
          openMenuOnFocus && _this.isOptionSelected(focusedOption, selectValue)) {
            return;
          }
          _this.selectOption(focusedOption);
          break;
        case "Enter":
          if (event.keyCode === 229) {
            break;
          }
          if (menuIsOpen) {
            if (!focusedOption)
              return;
            if (_this.isComposing)
              return;
            _this.selectOption(focusedOption);
            break;
          }
          return;
        case "Escape":
          if (menuIsOpen) {
            _this.setState({
              inputIsHiddenAfterUpdate: false
            });
            _this.onInputChange("", {
              action: "menu-close",
              prevInputValue: inputValue
            });
            _this.onMenuClose();
          } else if (isClearable && escapeClearsValue) {
            _this.clearValue();
          }
          break;
        case " ":
          if (inputValue) {
            return;
          }
          if (!menuIsOpen) {
            _this.openMenu("first");
            break;
          }
          if (!focusedOption)
            return;
          _this.selectOption(focusedOption);
          break;
        case "ArrowUp":
          if (menuIsOpen) {
            _this.focusOption("up");
          } else {
            _this.openMenu("last");
          }
          break;
        case "ArrowDown":
          if (menuIsOpen) {
            _this.focusOption("down");
          } else {
            _this.openMenu("first");
          }
          break;
        case "PageUp":
          if (!menuIsOpen)
            return;
          _this.focusOption("pageup");
          break;
        case "PageDown":
          if (!menuIsOpen)
            return;
          _this.focusOption("pagedown");
          break;
        case "Home":
          if (!menuIsOpen)
            return;
          _this.focusOption("first");
          break;
        case "End":
          if (!menuIsOpen)
            return;
          _this.focusOption("last");
          break;
        default:
          return;
      }
      event.preventDefault();
    };
    _this.state.instancePrefix = "react-select-" + (_this.props.instanceId || ++instanceId);
    _this.state.selectValue = cleanValue(_props.value);
    if (_props.menuIsOpen && _this.state.selectValue.length) {
      var focusableOptionsWithIds = _this.getFocusableOptionsWithIds();
      var focusableOptions = _this.buildFocusableOptions();
      var optionIndex = focusableOptions.indexOf(_this.state.selectValue[0]);
      _this.state.focusableOptionsWithIds = focusableOptionsWithIds;
      _this.state.focusedOption = focusableOptions[optionIndex];
      _this.state.focusedOptionId = getFocusedOptionId(focusableOptionsWithIds, focusableOptions[optionIndex]);
    }
    return _this;
  }
  _createClass(Select2, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.startListeningComposition();
      this.startListeningToTouch();
      if (this.props.closeMenuOnScroll && document && document.addEventListener) {
        document.addEventListener("scroll", this.onScroll, true);
      }
      if (this.props.autoFocus) {
        this.focusInput();
      }
      if (this.props.menuIsOpen && this.state.focusedOption && this.menuListRef && this.focusedOptionRef) {
        scrollIntoView(this.menuListRef, this.focusedOptionRef);
      }
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      var _this$props6 = this.props, isDisabled = _this$props6.isDisabled, menuIsOpen = _this$props6.menuIsOpen;
      var isFocused = this.state.isFocused;
      if (
        // ensure focus is restored correctly when the control becomes enabled
        isFocused && !isDisabled && prevProps.isDisabled || // ensure focus is on the Input when the menu opens
        isFocused && menuIsOpen && !prevProps.menuIsOpen
      ) {
        this.focusInput();
      }
      if (isFocused && isDisabled && !prevProps.isDisabled) {
        this.setState({
          isFocused: false
        }, this.onMenuClose);
      } else if (!isFocused && !isDisabled && prevProps.isDisabled && this.inputRef === document.activeElement) {
        this.setState({
          isFocused: true
        });
      }
      if (this.menuListRef && this.focusedOptionRef && this.scrollToFocusedOptionOnUpdate) {
        scrollIntoView(this.menuListRef, this.focusedOptionRef);
        this.scrollToFocusedOptionOnUpdate = false;
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.stopListeningComposition();
      this.stopListeningToTouch();
      document.removeEventListener("scroll", this.onScroll, true);
    }
    // ==============================
    // Consumer Handlers
    // ==============================
  }, {
    key: "onMenuOpen",
    value: function onMenuOpen() {
      this.props.onMenuOpen();
    }
  }, {
    key: "onMenuClose",
    value: function onMenuClose() {
      this.onInputChange("", {
        action: "menu-close",
        prevInputValue: this.props.inputValue
      });
      this.props.onMenuClose();
    }
  }, {
    key: "onInputChange",
    value: function onInputChange(newValue, actionMeta) {
      this.props.onInputChange(newValue, actionMeta);
    }
    // ==============================
    // Methods
    // ==============================
  }, {
    key: "focusInput",
    value: function focusInput() {
      if (!this.inputRef)
        return;
      this.inputRef.focus();
    }
  }, {
    key: "blurInput",
    value: function blurInput() {
      if (!this.inputRef)
        return;
      this.inputRef.blur();
    }
    // aliased for consumers
  }, {
    key: "openMenu",
    value: function openMenu(focusOption) {
      var _this2 = this;
      var _this$state2 = this.state, selectValue = _this$state2.selectValue, isFocused = _this$state2.isFocused;
      var focusableOptions = this.buildFocusableOptions();
      var openAtIndex = focusOption === "first" ? 0 : focusableOptions.length - 1;
      if (!this.props.isMulti) {
        var selectedIndex = focusableOptions.indexOf(selectValue[0]);
        if (selectedIndex > -1) {
          openAtIndex = selectedIndex;
        }
      }
      this.scrollToFocusedOptionOnUpdate = !(isFocused && this.menuListRef);
      this.setState({
        inputIsHiddenAfterUpdate: false,
        focusedValue: null,
        focusedOption: focusableOptions[openAtIndex],
        focusedOptionId: this.getFocusedOptionId(focusableOptions[openAtIndex])
      }, function() {
        return _this2.onMenuOpen();
      });
    }
  }, {
    key: "focusValue",
    value: function focusValue(direction) {
      var _this$state3 = this.state, selectValue = _this$state3.selectValue, focusedValue = _this$state3.focusedValue;
      if (!this.props.isMulti)
        return;
      this.setState({
        focusedOption: null
      });
      var focusedIndex = selectValue.indexOf(focusedValue);
      if (!focusedValue) {
        focusedIndex = -1;
      }
      var lastIndex = selectValue.length - 1;
      var nextFocus = -1;
      if (!selectValue.length)
        return;
      switch (direction) {
        case "previous":
          if (focusedIndex === 0) {
            nextFocus = 0;
          } else if (focusedIndex === -1) {
            nextFocus = lastIndex;
          } else {
            nextFocus = focusedIndex - 1;
          }
          break;
        case "next":
          if (focusedIndex > -1 && focusedIndex < lastIndex) {
            nextFocus = focusedIndex + 1;
          }
          break;
      }
      this.setState({
        inputIsHidden: nextFocus !== -1,
        focusedValue: selectValue[nextFocus]
      });
    }
  }, {
    key: "focusOption",
    value: function focusOption() {
      var direction = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "first";
      var pageSize = this.props.pageSize;
      var focusedOption = this.state.focusedOption;
      var options2 = this.getFocusableOptions();
      if (!options2.length)
        return;
      var nextFocus = 0;
      var focusedIndex = options2.indexOf(focusedOption);
      if (!focusedOption) {
        focusedIndex = -1;
      }
      if (direction === "up") {
        nextFocus = focusedIndex > 0 ? focusedIndex - 1 : options2.length - 1;
      } else if (direction === "down") {
        nextFocus = (focusedIndex + 1) % options2.length;
      } else if (direction === "pageup") {
        nextFocus = focusedIndex - pageSize;
        if (nextFocus < 0)
          nextFocus = 0;
      } else if (direction === "pagedown") {
        nextFocus = focusedIndex + pageSize;
        if (nextFocus > options2.length - 1)
          nextFocus = options2.length - 1;
      } else if (direction === "last") {
        nextFocus = options2.length - 1;
      }
      this.scrollToFocusedOptionOnUpdate = true;
      this.setState({
        focusedOption: options2[nextFocus],
        focusedValue: null,
        focusedOptionId: this.getFocusedOptionId(options2[nextFocus])
      });
    }
  }, {
    key: "getTheme",
    value: (
      // ==============================
      // Getters
      // ==============================
      function getTheme() {
        if (!this.props.theme) {
          return defaultTheme;
        }
        if (typeof this.props.theme === "function") {
          return this.props.theme(defaultTheme);
        }
        return _objectSpread2(_objectSpread2({}, defaultTheme), this.props.theme);
      }
    )
  }, {
    key: "getCommonProps",
    value: function getCommonProps() {
      var clearValue = this.clearValue, cx = this.cx, getStyles = this.getStyles, getClassNames = this.getClassNames, getValue = this.getValue, selectOption = this.selectOption, setValue = this.setValue, props = this.props;
      var isMulti = props.isMulti, isRtl = props.isRtl, options2 = props.options;
      var hasValue = this.hasValue();
      return {
        clearValue,
        cx,
        getStyles,
        getClassNames,
        getValue,
        hasValue,
        isMulti,
        isRtl,
        options: options2,
        selectOption,
        selectProps: props,
        setValue,
        theme: this.getTheme()
      };
    }
  }, {
    key: "hasValue",
    value: function hasValue() {
      var selectValue = this.state.selectValue;
      return selectValue.length > 0;
    }
  }, {
    key: "hasOptions",
    value: function hasOptions() {
      return !!this.getFocusableOptions().length;
    }
  }, {
    key: "isClearable",
    value: function isClearable() {
      var _this$props7 = this.props, isClearable2 = _this$props7.isClearable, isMulti = _this$props7.isMulti;
      if (isClearable2 === void 0)
        return isMulti;
      return isClearable2;
    }
  }, {
    key: "isOptionDisabled",
    value: function isOptionDisabled3(option, selectValue) {
      return _isOptionDisabled(this.props, option, selectValue);
    }
  }, {
    key: "isOptionSelected",
    value: function isOptionSelected(option, selectValue) {
      return _isOptionSelected(this.props, option, selectValue);
    }
  }, {
    key: "filterOption",
    value: function filterOption(option, inputValue) {
      return _filterOption(this.props, option, inputValue);
    }
  }, {
    key: "formatOptionLabel",
    value: function formatOptionLabel(data, context) {
      if (typeof this.props.formatOptionLabel === "function") {
        var _inputValue = this.props.inputValue;
        var _selectValue = this.state.selectValue;
        return this.props.formatOptionLabel(data, {
          context,
          inputValue: _inputValue,
          selectValue: _selectValue
        });
      } else {
        return this.getOptionLabel(data);
      }
    }
  }, {
    key: "formatGroupLabel",
    value: function formatGroupLabel3(data) {
      return this.props.formatGroupLabel(data);
    }
    // ==============================
    // Mouse Handlers
    // ==============================
  }, {
    key: "startListeningComposition",
    value: (
      // ==============================
      // Composition Handlers
      // ==============================
      function startListeningComposition() {
        if (document && document.addEventListener) {
          document.addEventListener("compositionstart", this.onCompositionStart, false);
          document.addEventListener("compositionend", this.onCompositionEnd, false);
        }
      }
    )
  }, {
    key: "stopListeningComposition",
    value: function stopListeningComposition() {
      if (document && document.removeEventListener) {
        document.removeEventListener("compositionstart", this.onCompositionStart);
        document.removeEventListener("compositionend", this.onCompositionEnd);
      }
    }
  }, {
    key: "startListeningToTouch",
    value: (
      // ==============================
      // Touch Handlers
      // ==============================
      function startListeningToTouch() {
        if (document && document.addEventListener) {
          document.addEventListener("touchstart", this.onTouchStart, false);
          document.addEventListener("touchmove", this.onTouchMove, false);
          document.addEventListener("touchend", this.onTouchEnd, false);
        }
      }
    )
  }, {
    key: "stopListeningToTouch",
    value: function stopListeningToTouch() {
      if (document && document.removeEventListener) {
        document.removeEventListener("touchstart", this.onTouchStart);
        document.removeEventListener("touchmove", this.onTouchMove);
        document.removeEventListener("touchend", this.onTouchEnd);
      }
    }
  }, {
    key: "renderInput",
    value: (
      // ==============================
      // Renderers
      // ==============================
      function renderInput() {
        var _this$props8 = this.props, isDisabled = _this$props8.isDisabled, isSearchable = _this$props8.isSearchable, inputId = _this$props8.inputId, inputValue = _this$props8.inputValue, tabIndex = _this$props8.tabIndex, form = _this$props8.form, menuIsOpen = _this$props8.menuIsOpen, required = _this$props8.required;
        var _this$getComponents = this.getComponents(), Input3 = _this$getComponents.Input;
        var _this$state4 = this.state, inputIsHidden = _this$state4.inputIsHidden, ariaSelection = _this$state4.ariaSelection;
        var commonProps = this.commonProps;
        var id = inputId || this.getElementId("input");
        var ariaAttributes = _objectSpread2(_objectSpread2(_objectSpread2({
          "aria-autocomplete": "list",
          "aria-expanded": menuIsOpen,
          "aria-haspopup": true,
          "aria-errormessage": this.props["aria-errormessage"],
          "aria-invalid": this.props["aria-invalid"],
          "aria-label": this.props["aria-label"],
          "aria-labelledby": this.props["aria-labelledby"],
          "aria-required": required,
          role: "combobox",
          "aria-activedescendant": this.isAppleDevice ? void 0 : this.state.focusedOptionId || ""
        }, menuIsOpen && {
          "aria-controls": this.getElementId("listbox")
        }), !isSearchable && {
          "aria-readonly": true
        }), this.hasValue() ? (ariaSelection === null || ariaSelection === void 0 ? void 0 : ariaSelection.action) === "initial-input-focus" && {
          "aria-describedby": this.getElementId("live-region")
        } : {
          "aria-describedby": this.getElementId("placeholder")
        });
        if (!isSearchable) {
          return /* @__PURE__ */ React4.createElement(DummyInput, _extends({
            id,
            innerRef: this.getInputRef,
            onBlur: this.onInputBlur,
            onChange: noop,
            onFocus: this.onInputFocus,
            disabled: isDisabled,
            tabIndex,
            inputMode: "none",
            form,
            value: ""
          }, ariaAttributes));
        }
        return /* @__PURE__ */ React4.createElement(Input3, _extends({}, commonProps, {
          autoCapitalize: "none",
          autoComplete: "off",
          autoCorrect: "off",
          id,
          innerRef: this.getInputRef,
          isDisabled,
          isHidden: inputIsHidden,
          onBlur: this.onInputBlur,
          onChange: this.handleInputChange,
          onFocus: this.onInputFocus,
          spellCheck: "false",
          tabIndex,
          form,
          type: "text",
          value: inputValue
        }, ariaAttributes));
      }
    )
  }, {
    key: "renderPlaceholderOrValue",
    value: function renderPlaceholderOrValue() {
      var _this3 = this;
      var _this$getComponents2 = this.getComponents(), MultiValue3 = _this$getComponents2.MultiValue, MultiValueContainer2 = _this$getComponents2.MultiValueContainer, MultiValueLabel2 = _this$getComponents2.MultiValueLabel, MultiValueRemove2 = _this$getComponents2.MultiValueRemove, SingleValue3 = _this$getComponents2.SingleValue, Placeholder3 = _this$getComponents2.Placeholder;
      var commonProps = this.commonProps;
      var _this$props9 = this.props, controlShouldRenderValue = _this$props9.controlShouldRenderValue, isDisabled = _this$props9.isDisabled, isMulti = _this$props9.isMulti, inputValue = _this$props9.inputValue, placeholder = _this$props9.placeholder;
      var _this$state5 = this.state, selectValue = _this$state5.selectValue, focusedValue = _this$state5.focusedValue, isFocused = _this$state5.isFocused;
      if (!this.hasValue() || !controlShouldRenderValue) {
        return inputValue ? null : /* @__PURE__ */ React4.createElement(Placeholder3, _extends({}, commonProps, {
          key: "placeholder",
          isDisabled,
          isFocused,
          innerProps: {
            id: this.getElementId("placeholder")
          }
        }), placeholder);
      }
      if (isMulti) {
        return selectValue.map(function(opt, index2) {
          var isOptionFocused = opt === focusedValue;
          var key = "".concat(_this3.getOptionLabel(opt), "-").concat(_this3.getOptionValue(opt));
          return /* @__PURE__ */ React4.createElement(MultiValue3, _extends({}, commonProps, {
            components: {
              Container: MultiValueContainer2,
              Label: MultiValueLabel2,
              Remove: MultiValueRemove2
            },
            isFocused: isOptionFocused,
            isDisabled,
            key,
            index: index2,
            removeProps: {
              onClick: function onClick() {
                return _this3.removeValue(opt);
              },
              onTouchEnd: function onTouchEnd() {
                return _this3.removeValue(opt);
              },
              onMouseDown: function onMouseDown(e) {
                e.preventDefault();
              }
            },
            data: opt
          }), _this3.formatOptionLabel(opt, "value"));
        });
      }
      if (inputValue) {
        return null;
      }
      var singleValue = selectValue[0];
      return /* @__PURE__ */ React4.createElement(SingleValue3, _extends({}, commonProps, {
        data: singleValue,
        isDisabled
      }), this.formatOptionLabel(singleValue, "value"));
    }
  }, {
    key: "renderClearIndicator",
    value: function renderClearIndicator() {
      var _this$getComponents3 = this.getComponents(), ClearIndicator3 = _this$getComponents3.ClearIndicator;
      var commonProps = this.commonProps;
      var _this$props10 = this.props, isDisabled = _this$props10.isDisabled, isLoading = _this$props10.isLoading;
      var isFocused = this.state.isFocused;
      if (!this.isClearable() || !ClearIndicator3 || isDisabled || !this.hasValue() || isLoading) {
        return null;
      }
      var innerProps = {
        onMouseDown: this.onClearIndicatorMouseDown,
        onTouchEnd: this.onClearIndicatorTouchEnd,
        "aria-hidden": "true"
      };
      return /* @__PURE__ */ React4.createElement(ClearIndicator3, _extends({}, commonProps, {
        innerProps,
        isFocused
      }));
    }
  }, {
    key: "renderLoadingIndicator",
    value: function renderLoadingIndicator() {
      var _this$getComponents4 = this.getComponents(), LoadingIndicator3 = _this$getComponents4.LoadingIndicator;
      var commonProps = this.commonProps;
      var _this$props11 = this.props, isDisabled = _this$props11.isDisabled, isLoading = _this$props11.isLoading;
      var isFocused = this.state.isFocused;
      if (!LoadingIndicator3 || !isLoading)
        return null;
      var innerProps = {
        "aria-hidden": "true"
      };
      return /* @__PURE__ */ React4.createElement(LoadingIndicator3, _extends({}, commonProps, {
        innerProps,
        isDisabled,
        isFocused
      }));
    }
  }, {
    key: "renderIndicatorSeparator",
    value: function renderIndicatorSeparator() {
      var _this$getComponents5 = this.getComponents(), DropdownIndicator3 = _this$getComponents5.DropdownIndicator, IndicatorSeparator3 = _this$getComponents5.IndicatorSeparator;
      if (!DropdownIndicator3 || !IndicatorSeparator3)
        return null;
      var commonProps = this.commonProps;
      var isDisabled = this.props.isDisabled;
      var isFocused = this.state.isFocused;
      return /* @__PURE__ */ React4.createElement(IndicatorSeparator3, _extends({}, commonProps, {
        isDisabled,
        isFocused
      }));
    }
  }, {
    key: "renderDropdownIndicator",
    value: function renderDropdownIndicator() {
      var _this$getComponents6 = this.getComponents(), DropdownIndicator3 = _this$getComponents6.DropdownIndicator;
      if (!DropdownIndicator3)
        return null;
      var commonProps = this.commonProps;
      var isDisabled = this.props.isDisabled;
      var isFocused = this.state.isFocused;
      var innerProps = {
        onMouseDown: this.onDropdownIndicatorMouseDown,
        onTouchEnd: this.onDropdownIndicatorTouchEnd,
        "aria-hidden": "true"
      };
      return /* @__PURE__ */ React4.createElement(DropdownIndicator3, _extends({}, commonProps, {
        innerProps,
        isDisabled,
        isFocused
      }));
    }
  }, {
    key: "renderMenu",
    value: function renderMenu() {
      var _this4 = this;
      var _this$getComponents7 = this.getComponents(), Group3 = _this$getComponents7.Group, GroupHeading3 = _this$getComponents7.GroupHeading, Menu3 = _this$getComponents7.Menu, MenuList3 = _this$getComponents7.MenuList, MenuPortal3 = _this$getComponents7.MenuPortal, LoadingMessage3 = _this$getComponents7.LoadingMessage, NoOptionsMessage3 = _this$getComponents7.NoOptionsMessage, Option3 = _this$getComponents7.Option;
      var commonProps = this.commonProps;
      var focusedOption = this.state.focusedOption;
      var _this$props12 = this.props, captureMenuScroll = _this$props12.captureMenuScroll, inputValue = _this$props12.inputValue, isLoading = _this$props12.isLoading, loadingMessage2 = _this$props12.loadingMessage, minMenuHeight = _this$props12.minMenuHeight, maxMenuHeight = _this$props12.maxMenuHeight, menuIsOpen = _this$props12.menuIsOpen, menuPlacement = _this$props12.menuPlacement, menuPosition = _this$props12.menuPosition, menuPortalTarget = _this$props12.menuPortalTarget, menuShouldBlockScroll = _this$props12.menuShouldBlockScroll, menuShouldScrollIntoView = _this$props12.menuShouldScrollIntoView, noOptionsMessage2 = _this$props12.noOptionsMessage, onMenuScrollToTop = _this$props12.onMenuScrollToTop, onMenuScrollToBottom = _this$props12.onMenuScrollToBottom;
      if (!menuIsOpen)
        return null;
      var render = function render2(props, id) {
        var type = props.type, data = props.data, isDisabled = props.isDisabled, isSelected = props.isSelected, label = props.label, value = props.value;
        var isFocused = focusedOption === data;
        var onHover = isDisabled ? void 0 : function() {
          return _this4.onOptionHover(data);
        };
        var onSelect = isDisabled ? void 0 : function() {
          return _this4.selectOption(data);
        };
        var optionId = "".concat(_this4.getElementId("option"), "-").concat(id);
        var innerProps = {
          id: optionId,
          onClick: onSelect,
          onMouseMove: onHover,
          onMouseOver: onHover,
          tabIndex: -1,
          role: "option",
          "aria-selected": _this4.isAppleDevice ? void 0 : isSelected
          // is not supported on Apple devices
        };
        return /* @__PURE__ */ React4.createElement(Option3, _extends({}, commonProps, {
          innerProps,
          data,
          isDisabled,
          isSelected,
          key: optionId,
          label,
          type,
          value,
          isFocused,
          innerRef: isFocused ? _this4.getFocusedOptionRef : void 0
        }), _this4.formatOptionLabel(props.data, "menu"));
      };
      var menuUI;
      if (this.hasOptions()) {
        menuUI = this.getCategorizedOptions().map(function(item) {
          if (item.type === "group") {
            var _data = item.data, options2 = item.options, groupIndex = item.index;
            var groupId = "".concat(_this4.getElementId("group"), "-").concat(groupIndex);
            var headingId = "".concat(groupId, "-heading");
            return /* @__PURE__ */ React4.createElement(Group3, _extends({}, commonProps, {
              key: groupId,
              data: _data,
              options: options2,
              Heading: GroupHeading3,
              headingProps: {
                id: headingId,
                data: item.data
              },
              label: _this4.formatGroupLabel(item.data)
            }), item.options.map(function(option) {
              return render(option, "".concat(groupIndex, "-").concat(option.index));
            }));
          } else if (item.type === "option") {
            return render(item, "".concat(item.index));
          }
        });
      } else if (isLoading) {
        var message = loadingMessage2({
          inputValue
        });
        if (message === null)
          return null;
        menuUI = /* @__PURE__ */ React4.createElement(LoadingMessage3, commonProps, message);
      } else {
        var _message = noOptionsMessage2({
          inputValue
        });
        if (_message === null)
          return null;
        menuUI = /* @__PURE__ */ React4.createElement(NoOptionsMessage3, commonProps, _message);
      }
      var menuPlacementProps = {
        minMenuHeight,
        maxMenuHeight,
        menuPlacement,
        menuPosition,
        menuShouldScrollIntoView
      };
      var menuElement = /* @__PURE__ */ React4.createElement(MenuPlacer, _extends({}, commonProps, menuPlacementProps), function(_ref4) {
        var ref = _ref4.ref, _ref4$placerProps = _ref4.placerProps, placement = _ref4$placerProps.placement, maxHeight = _ref4$placerProps.maxHeight;
        return /* @__PURE__ */ React4.createElement(Menu3, _extends({}, commonProps, menuPlacementProps, {
          innerRef: ref,
          innerProps: {
            onMouseDown: _this4.onMenuMouseDown,
            onMouseMove: _this4.onMenuMouseMove
          },
          isLoading,
          placement
        }), /* @__PURE__ */ React4.createElement(ScrollManager, {
          captureEnabled: captureMenuScroll,
          onTopArrive: onMenuScrollToTop,
          onBottomArrive: onMenuScrollToBottom,
          lockEnabled: menuShouldBlockScroll
        }, function(scrollTargetRef) {
          return /* @__PURE__ */ React4.createElement(MenuList3, _extends({}, commonProps, {
            innerRef: function innerRef(instance) {
              _this4.getMenuListRef(instance);
              scrollTargetRef(instance);
            },
            innerProps: {
              role: "listbox",
              "aria-multiselectable": commonProps.isMulti,
              id: _this4.getElementId("listbox")
            },
            isLoading,
            maxHeight,
            focusedOption
          }), menuUI);
        }));
      });
      return menuPortalTarget || menuPosition === "fixed" ? /* @__PURE__ */ React4.createElement(MenuPortal3, _extends({}, commonProps, {
        appendTo: menuPortalTarget,
        controlElement: this.controlRef,
        menuPlacement,
        menuPosition
      }), menuElement) : menuElement;
    }
  }, {
    key: "renderFormField",
    value: function renderFormField() {
      var _this5 = this;
      var _this$props13 = this.props, delimiter2 = _this$props13.delimiter, isDisabled = _this$props13.isDisabled, isMulti = _this$props13.isMulti, name = _this$props13.name, required = _this$props13.required;
      var selectValue = this.state.selectValue;
      if (required && !this.hasValue() && !isDisabled) {
        return /* @__PURE__ */ React4.createElement(RequiredInput$1, {
          name,
          onFocus: this.onValueInputFocus
        });
      }
      if (!name || isDisabled)
        return;
      if (isMulti) {
        if (delimiter2) {
          var value = selectValue.map(function(opt) {
            return _this5.getOptionValue(opt);
          }).join(delimiter2);
          return /* @__PURE__ */ React4.createElement("input", {
            name,
            type: "hidden",
            value
          });
        } else {
          var input = selectValue.length > 0 ? selectValue.map(function(opt, i) {
            return /* @__PURE__ */ React4.createElement("input", {
              key: "i-".concat(i),
              name,
              type: "hidden",
              value: _this5.getOptionValue(opt)
            });
          }) : /* @__PURE__ */ React4.createElement("input", {
            name,
            type: "hidden",
            value: ""
          });
          return /* @__PURE__ */ React4.createElement("div", null, input);
        }
      } else {
        var _value = selectValue[0] ? this.getOptionValue(selectValue[0]) : "";
        return /* @__PURE__ */ React4.createElement("input", {
          name,
          type: "hidden",
          value: _value
        });
      }
    }
  }, {
    key: "renderLiveRegion",
    value: function renderLiveRegion() {
      var commonProps = this.commonProps;
      var _this$state6 = this.state, ariaSelection = _this$state6.ariaSelection, focusedOption = _this$state6.focusedOption, focusedValue = _this$state6.focusedValue, isFocused = _this$state6.isFocused, selectValue = _this$state6.selectValue;
      var focusableOptions = this.getFocusableOptions();
      return /* @__PURE__ */ React4.createElement(LiveRegion$1, _extends({}, commonProps, {
        id: this.getElementId("live-region"),
        ariaSelection,
        focusedOption,
        focusedValue,
        isFocused,
        selectValue,
        focusableOptions,
        isAppleDevice: this.isAppleDevice
      }));
    }
  }, {
    key: "render",
    value: function render() {
      var _this$getComponents8 = this.getComponents(), Control3 = _this$getComponents8.Control, IndicatorsContainer3 = _this$getComponents8.IndicatorsContainer, SelectContainer3 = _this$getComponents8.SelectContainer, ValueContainer3 = _this$getComponents8.ValueContainer;
      var _this$props14 = this.props, className = _this$props14.className, id = _this$props14.id, isDisabled = _this$props14.isDisabled, menuIsOpen = _this$props14.menuIsOpen;
      var isFocused = this.state.isFocused;
      var commonProps = this.commonProps = this.getCommonProps();
      return /* @__PURE__ */ React4.createElement(SelectContainer3, _extends({}, commonProps, {
        className,
        innerProps: {
          id,
          onKeyDown: this.onKeyDown
        },
        isDisabled,
        isFocused
      }), this.renderLiveRegion(), /* @__PURE__ */ React4.createElement(Control3, _extends({}, commonProps, {
        innerRef: this.getControlRef,
        innerProps: {
          onMouseDown: this.onControlMouseDown,
          onTouchEnd: this.onControlTouchEnd
        },
        isDisabled,
        isFocused,
        menuIsOpen
      }), /* @__PURE__ */ React4.createElement(ValueContainer3, _extends({}, commonProps, {
        isDisabled
      }), this.renderPlaceholderOrValue(), this.renderInput()), /* @__PURE__ */ React4.createElement(IndicatorsContainer3, _extends({}, commonProps, {
        isDisabled
      }), this.renderClearIndicator(), this.renderLoadingIndicator(), this.renderIndicatorSeparator(), this.renderDropdownIndicator())), this.renderMenu(), this.renderFormField());
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(props, state) {
      var prevProps = state.prevProps, clearFocusValueOnUpdate = state.clearFocusValueOnUpdate, inputIsHiddenAfterUpdate = state.inputIsHiddenAfterUpdate, ariaSelection = state.ariaSelection, isFocused = state.isFocused, prevWasFocused = state.prevWasFocused, instancePrefix = state.instancePrefix;
      var options2 = props.options, value = props.value, menuIsOpen = props.menuIsOpen, inputValue = props.inputValue, isMulti = props.isMulti;
      var selectValue = cleanValue(value);
      var newMenuOptionsState = {};
      if (prevProps && (value !== prevProps.value || options2 !== prevProps.options || menuIsOpen !== prevProps.menuIsOpen || inputValue !== prevProps.inputValue)) {
        var focusableOptions = menuIsOpen ? buildFocusableOptions(props, selectValue) : [];
        var focusableOptionsWithIds = menuIsOpen ? buildFocusableOptionsWithIds(buildCategorizedOptions(props, selectValue), "".concat(instancePrefix, "-option")) : [];
        var focusedValue = clearFocusValueOnUpdate ? getNextFocusedValue(state, selectValue) : null;
        var focusedOption = getNextFocusedOption(state, focusableOptions);
        var focusedOptionId = getFocusedOptionId(focusableOptionsWithIds, focusedOption);
        newMenuOptionsState = {
          selectValue,
          focusedOption,
          focusedOptionId,
          focusableOptionsWithIds,
          focusedValue,
          clearFocusValueOnUpdate: false
        };
      }
      var newInputIsHiddenState = inputIsHiddenAfterUpdate != null && props !== prevProps ? {
        inputIsHidden: inputIsHiddenAfterUpdate,
        inputIsHiddenAfterUpdate: void 0
      } : {};
      var newAriaSelection = ariaSelection;
      var hasKeptFocus = isFocused && prevWasFocused;
      if (isFocused && !hasKeptFocus) {
        newAriaSelection = {
          value: valueTernary(isMulti, selectValue, selectValue[0] || null),
          options: selectValue,
          action: "initial-input-focus"
        };
        hasKeptFocus = !prevWasFocused;
      }
      if ((ariaSelection === null || ariaSelection === void 0 ? void 0 : ariaSelection.action) === "initial-input-focus") {
        newAriaSelection = null;
      }
      return _objectSpread2(_objectSpread2(_objectSpread2({}, newMenuOptionsState), newInputIsHiddenState), {}, {
        prevProps: props,
        ariaSelection: newAriaSelection,
        prevWasFocused: hasKeptFocus
      });
    }
  }]);
  return Select2;
}(import_react7.Component);
Select.defaultProps = defaultProps;

// node_modules/react-select/dist/react-select.esm.js
var import_react_dom2 = __toESM(require_react_dom());
var StateManagedSelect = /* @__PURE__ */ (0, import_react9.forwardRef)(function(props, ref) {
  var baseSelectProps = useStateManager(props);
  return /* @__PURE__ */ React5.createElement(Select, _extends({
    ref
  }, baseSelectProps));
});
var StateManagedSelect$1 = StateManagedSelect;

// app/components/StringSelect.tsx
var import_jsx_dev_runtime4 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\components\\\\StringSelect.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\components\\StringSelect.tsx"
  );
  import.meta.hot.lastModified = "1702944553179.7983";
}
var selectClassNames = {
  control: () => "!rounded !bg-[#ebebeb] dark:!bg-[#1e1f22] !border !border-black/[0.08] dark:!border-transparent hover:!border-[#c4c9ce] dark:hover:!border-[#020202] transition-[border] duration-200 !font-medium",
  multiValueLabel: () => "dark:!text-[#ddd]",
  singleValue: () => "dark:!text-[#ddd]",
  input: () => "dark:!text-[#ddd]",
  menu: () => "!rounded dark:!bg-[#2b2d31]",
  option: () => "!rounded dark:!bg-[#2b2d31] dark:hover:!bg-[#36373d] !font-semibold !text-sm"
};
var selectStrings = {
  defaultPlaceholder: "Make a selection"
};
var StringSelect = (props) => /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("label", { className: "block", children: [
  props.label && /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("p", { className: "text-sm", children: props.label }, void 0, false, {
    fileName: "app/components/StringSelect.tsx",
    lineNumber: 54,
    columnNumber: 21
  }, this),
  /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(StateManagedSelect$1, { ...props, placeholder: props.placeholder ?? selectStrings.defaultPlaceholder, classNames: {
    ...selectClassNames,
    ...props.classNames ?? {}
  } }, void 0, false, {
    fileName: "app/components/StringSelect.tsx",
    lineNumber: 55,
    columnNumber: 5
  }, this)
] }, void 0, true, {
  fileName: "app/components/StringSelect.tsx",
  lineNumber: 53,
  columnNumber: 38
}, this);
_c5 = StringSelect;
var _c5;
$RefreshReg$(_c5, "StringSelect");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/components/preview/Components.tsx
var import_jsx_dev_runtime5 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\components\\\\preview\\\\Components.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\components\\preview\\Components.tsx"
  );
  import.meta.hot.lastModified = "1702846302917.7263";
}
var PreviewButton = ({
  data,
  onClick,
  authorType
}) => {
  const nonSendable = authorType && (data.style === ButtonStyle.Link && authorType < AuthorType.ApplicationWebhook || authorType < AuthorType.ActionableWebhook);
  const button = /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(Button, { discordstyle: data.style, emoji: data.emoji, disabled: data.disabled ?? false, className: `!text-sm ${nonSendable ? "hidden" : ""}`, onClick, children: data.label }, void 0, false, {
    fileName: "app/components/preview/Components.tsx",
    lineNumber: 33,
    columnNumber: 18
  }, this);
  return data.style === ButtonStyle.Link ? /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("a", { href: data.url, target: "_blank", rel: "noreferrer", children: button }, void 0, false, {
    fileName: "app/components/preview/Components.tsx",
    lineNumber: 36,
    columnNumber: 44
  }, this) : button;
};
_c6 = PreviewButton;
var PreviewSelect = ({
  data,
  onClick,
  authorType
}) => {
  const shouldLeftPad = "options" in data && data.options.filter((o) => o.emoji).length !== 0;
  const nonSendable = authorType && authorType < AuthorType.ActionableWebhook;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "w-[90%] max-w-[400px] mr-4 relative", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("button", { "data-custom-id": data.custom_id, "data-type": data.type, "data-open": false, className: `peer/select group/select rounded data-[open=true]:rounded-b-none p-2 text-left bg-[#ebebeb] dark:bg-[#1e1f22] border border-black/[0.08] dark:border-transparent hover:border-[#c4c9ce] dark:hover:border-[#020202] transition-[border,_opacity] duration-200 font-medium cursor-pointer grid grid-cols-[1fr_auto] items-center w-full disabled:opacity-60 disabled:cursor-not-allowed ${nonSendable ? "hidden" : ""}`, disabled: data.disabled, onClick: (e) => {
      e.currentTarget.dataset.open = String(e.currentTarget.dataset.open === "false");
      if (onClick)
        onClick(e);
    }, children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("span", { className: "truncate text-[#5c5e66] dark:text-[#949ba4] leading-none", children: data.placeholder ?? selectStrings.defaultPlaceholder }, void 0, false, {
        fileName: "app/components/preview/Components.tsx",
        lineNumber: 53,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "flex items-center gap-1", children: /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(CoolIcon, { icon: "Chevron_Down", className: "group-data-[open=true]/select:rotate-180" }, void 0, false, {
        fileName: "app/components/preview/Components.tsx",
        lineNumber: 57,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "app/components/preview/Components.tsx",
        lineNumber: 56,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/preview/Components.tsx",
      lineNumber: 49,
      columnNumber: 7
    }, this),
    data.type === ComponentType.StringSelect && /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "hidden peer-data-[open=true]/select:block absolute left-0 w-full bg-[#f2f3f5] dark:bg-[#2b2d31] rounded-b border border-[#e3e5e8] dark:border-[#1e1f22] overflow-y-auto max-h-64", children: data.options.map((option, oi) => /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "flex last:rounded-b hover:bg-[#e0e1e5] hover:dark:bg-[#36373d] w-full p-2 cursor-pointer", children: [
      option.emoji?.id ? /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("img", { src: cdn.emoji(option.emoji.id), className: "w-[22px] h-[22px] mr-2 my-auto shrink-0" }, void 0, false, {
        fileName: "app/components/preview/Components.tsx",
        lineNumber: 62,
        columnNumber: 35
      }, this) : shouldLeftPad && /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "w-[22px] mr-2 shrink-0" }, void 0, false, {
        fileName: "app/components/preview/Components.tsx",
        lineNumber: 62,
        columnNumber: 147
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "truncate text-sm font-medium my-auto", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("p", { className: "truncate leading-[18px]", children: option.label }, void 0, false, {
          fileName: "app/components/preview/Components.tsx",
          lineNumber: 64,
          columnNumber: 17
        }, this),
        option.description && /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("p", { className: "truncate text-[#4e5058] dark:text-[#b5bac1] leading-[18px]", children: option.description }, void 0, false, {
          fileName: "app/components/preview/Components.tsx",
          lineNumber: 65,
          columnNumber: 40
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/preview/Components.tsx",
        lineNumber: 63,
        columnNumber: 15
      }, this)
    ] }, `preview-select-option-${oi}-${option.value}`, true, {
      fileName: "app/components/preview/Components.tsx",
      lineNumber: 61,
      columnNumber: 45
    }, this)) }, void 0, false, {
      fileName: "app/components/preview/Components.tsx",
      lineNumber: 60,
      columnNumber: 52
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/preview/Components.tsx",
    lineNumber: 48,
    columnNumber: 10
  }, this);
};
_c23 = PreviewSelect;
var previewComponentMap = {
  [ComponentType.Button]: PreviewButton,
  [ComponentType.StringSelect]: PreviewSelect,
  [ComponentType.UserSelect]: PreviewSelect,
  [ComponentType.RoleSelect]: PreviewSelect,
  [ComponentType.MentionableSelect]: PreviewSelect,
  [ComponentType.ChannelSelect]: PreviewSelect
};
var MessageComponents = ({
  components: components2,
  authorType
}) => {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "grid gap-1 py-[0.125rem]", children: components2.map((row, i) => /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "flex flex-wrap gap-1", children: row.components.map((component, ci) => {
    const fc = previewComponentMap[component.type];
    if (fc) {
      return /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", {
        className: "contents",
        // @ts-ignore
        children: fc({
          data: component,
          authorType
        })
      }, `action-row-${i}-component-${ci}`, false, {
        fileName: "app/components/preview/Components.tsx",
        lineNumber: 91,
        columnNumber: 18
      }, this);
    }
  }) }, `action-row-${i}`, false, {
    fileName: "app/components/preview/Components.tsx",
    lineNumber: 87,
    columnNumber: 35
  }, this)) }, void 0, false, {
    fileName: "app/components/preview/Components.tsx",
    lineNumber: 86,
    columnNumber: 10
  }, this);
};
_c32 = MessageComponents;
var _c6;
var _c23;
var _c32;
$RefreshReg$(_c6, "PreviewButton");
$RefreshReg$(_c23, "PreviewSelect");
$RefreshReg$(_c32, "MessageComponents");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/components/preview/Gallery.tsx
var import_jsx_dev_runtime6 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\components\\\\preview\\\\Gallery.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\components\\preview\\Gallery.tsx"
  );
  import.meta.hot.lastModified = "1702846302917.7263";
}
var Gallery = ({
  attachments,
  setImageModalData
}) => {
  const sized = galleriesBySize[attachments.length];
  if (!sized)
    return /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("p", { children: "Inappropriate size for gallery." }, void 0, false, {
      fileName: "app/components/preview/Gallery.tsx",
      lineNumber: 27,
      columnNumber: 22
    }, this);
  return sized({
    attachments,
    setImageModalData
  });
};
_c7 = Gallery;
var GalleryItem = ({
  attachments,
  index: index2,
  className,
  itemClassName,
  setImageModalData
}) => {
  const {
    content_type: contentType,
    url
  } = attachments[index2];
  return contentType?.startsWith("video/") ? /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: `relative cursor-pointer ${className}`, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("video", { src: url, className: itemClassName }, void 0, false, {
      fileName: "app/components/preview/Gallery.tsx",
      lineNumber: 46,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "absolute top-auto bottom-auto left-auto right-auto p-1 rounded-full bg-black/10 object-cover", children: /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(CoolIcon, { icon: "Play" }, void 0, false, {
      fileName: "app/components/preview/Gallery.tsx",
      lineNumber: 48,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/components/preview/Gallery.tsx",
      lineNumber: 47,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/preview/Gallery.tsx",
    lineNumber: 45,
    columnNumber: 46
  }, this) : contentType === "image/gif" ? /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("button", { className: `relative group/gallery-item ${className}`, onClick: () => {
    if (setImageModalData) {
      setImageModalData({
        images: attachments.map((a) => ({
          url: a.url,
          alt: a.description
        })),
        startIndex: index2
      });
    }
  }, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("img", { src: url, className: `w-full h-full object-cover ${itemClassName ?? ""}` }, void 0, false, {
      fileName: "app/components/preview/Gallery.tsx",
      lineNumber: 61,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("p", { className: "absolute top-1 left-1 rounded px-1 py-0.5 text-sm text-white bg-black/60 font-semibold group-hover/gallery-item:hidden", children: "GIF" }, void 0, false, {
      fileName: "app/components/preview/Gallery.tsx",
      lineNumber: 62,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/preview/Gallery.tsx",
    lineNumber: 50,
    columnNumber: 44
  }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("button", { className: `block ${className}`, onClick: () => {
    if (setImageModalData) {
      setImageModalData({
        images: attachments.map((a) => ({
          url: a.url,
          alt: a.description
        })),
        startIndex: index2
      });
    }
  }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("img", { src: url, className: `block object-cover ${itemClassName ?? ""}` }, void 0, false, {
    fileName: "app/components/preview/Gallery.tsx",
    lineNumber: 76,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/components/preview/Gallery.tsx",
    lineNumber: 65,
    columnNumber: 17
  }, this);
};
_c24 = GalleryItem;
var galleriesBySize = {
  1: (d) => /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "w-full", children: /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(GalleryItem, { className: "rounded-lg max-w-full max-h-[350px]", itemClassName: "rounded-lg", ...d, index: 0 }, void 0, false, {
    fileName: "app/components/preview/Gallery.tsx",
    lineNumber: 82,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/components/preview/Gallery.tsx",
    lineNumber: 81,
    columnNumber: 11
  }, this),
  2: (d) => /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "w-full grid grid-cols-2 gap-1 max-w-full max-h-[350px]", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(GalleryItem, { className: "rounded-l-lg rounded-r w-full object-center", itemClassName: "rounded-l-lg rounded-r", ...d, index: 0 }, void 0, false, {
      fileName: "app/components/preview/Gallery.tsx",
      lineNumber: 85,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(GalleryItem, { className: "rounded-r-lg rounded-l w-full object-center", itemClassName: "rounded-r-lg rounded-l", ...d, index: 1 }, void 0, false, {
      fileName: "app/components/preview/Gallery.tsx",
      lineNumber: 86,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/preview/Gallery.tsx",
    lineNumber: 84,
    columnNumber: 11
  }, this),
  3: (d) => /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "w-full flex gap-1 max-w-full max-h-[350px]", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(GalleryItem, { className: "rounded-l-lg rounded-r h-[350px] w-2/3", itemClassName: "rounded-l-lg rounded-r", ...d, index: 0 }, void 0, false, {
      fileName: "app/components/preview/Gallery.tsx",
      lineNumber: 89,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "grid grid-rows-2 gap-1 h-[350px] w-1/3", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(GalleryItem, { className: "rounded rounded-tr-lg object-center", itemClassName: "rounded rounded-tr-lg w-full h-full", ...d, index: 1 }, void 0, false, {
        fileName: "app/components/preview/Gallery.tsx",
        lineNumber: 91,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(GalleryItem, { className: "rounded rounded-br-lg object-center", itemClassName: "rounded rounded-br-lg w-full h-full", ...d, index: 2 }, void 0, false, {
        fileName: "app/components/preview/Gallery.tsx",
        lineNumber: 92,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/preview/Gallery.tsx",
      lineNumber: 90,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/preview/Gallery.tsx",
    lineNumber: 88,
    columnNumber: 11
  }, this),
  4: (d) => /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "w-full grid grid-cols-2 grid-rows-2 gap-1 max-w-full max-h-[350px]", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(GalleryItem, { className: "rounded rounded-tl-lg", itemClassName: "rounded rounded-tl-lg w-full h-full", ...d, index: 0 }, void 0, false, {
      fileName: "app/components/preview/Gallery.tsx",
      lineNumber: 96,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(GalleryItem, { className: "rounded rounded-tr-lg", itemClassName: "rounded rounded-tr-lg w-full h-full", ...d, index: 1 }, void 0, false, {
      fileName: "app/components/preview/Gallery.tsx",
      lineNumber: 97,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(GalleryItem, { className: "rounded rounded-bl-lg", itemClassName: "rounded rounded-bl-lg w-full h-full", ...d, index: 2 }, void 0, false, {
      fileName: "app/components/preview/Gallery.tsx",
      lineNumber: 98,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(GalleryItem, { className: "rounded rounded-br-lg", itemClassName: "rounded rounded-br-lg w-full h-full", ...d, index: 3 }, void 0, false, {
      fileName: "app/components/preview/Gallery.tsx",
      lineNumber: 99,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/preview/Gallery.tsx",
    lineNumber: 95,
    columnNumber: 11
  }, this),
  5: (d) => /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "w-full grid gap-1 max-w-full max-h-full", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "w-full grid grid-cols-2 gap-1", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(GalleryItem, { className: "rounded rounded-tl-lg w-full object-contain aspect-square", itemClassName: "rounded rounded-tl-lg", ...d, index: 0 }, void 0, false, {
        fileName: "app/components/preview/Gallery.tsx",
        lineNumber: 103,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(GalleryItem, { className: "rounded rounded-tr-lg w-full object-contain aspect-square", itemClassName: "rounded rounded-tr-lg", ...d, index: 1 }, void 0, false, {
        fileName: "app/components/preview/Gallery.tsx",
        lineNumber: 104,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/preview/Gallery.tsx",
      lineNumber: 102,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "w-full grid grid-cols-3 gap-1", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(GalleryItem, { className: "rounded rounded-bl-lg w-full object-contain aspect-square", itemClassName: "rounded rounded-bl-lg", ...d, index: 2 }, void 0, false, {
        fileName: "app/components/preview/Gallery.tsx",
        lineNumber: 107,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(GalleryItem, { className: "rounded rounded-br-lg w-full object-contain aspect-square", itemClassName: "rounded rounded-br-lg", ...d, index: 3 }, void 0, false, {
        fileName: "app/components/preview/Gallery.tsx",
        lineNumber: 108,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(GalleryItem, { className: "rounded rounded-br-lg w-full object-contain aspect-square", itemClassName: "rounded rounded-br-lg", ...d, index: 4 }, void 0, false, {
        fileName: "app/components/preview/Gallery.tsx",
        lineNumber: 109,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/preview/Gallery.tsx",
      lineNumber: 106,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/preview/Gallery.tsx",
    lineNumber: 101,
    columnNumber: 11
  }, this),
  6: (d) => /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "w-full grid grid-cols-3 grid-rows-2 gap-1 max-w-full", children: d.attachments.map((_, i) => {
    const largeRound = i === 0 ? "rounded-tl-lg" : i === 2 ? "rounded-tr-lg" : i === 3 ? "rounded-bl-lg" : i === 5 ? "rounded-br-lg" : "";
    return /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(GalleryItem, { className: `rounded ${largeRound} h-full object-center aspect-square`, itemClassName: `rounded ${largeRound}`, ...d, index: i }, `gallery-attachment-${i}`, false, {
      fileName: "app/components/preview/Gallery.tsx",
      lineNumber: 115,
      columnNumber: 14
    }, this);
  }) }, void 0, false, {
    fileName: "app/components/preview/Gallery.tsx",
    lineNumber: 112,
    columnNumber: 11
  }, this),
  7: (d) => /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "w-full grid grid-cols-1 grid-rows-1 gap-1 max-w-full", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(GalleryItem, { className: "rounded rounded-t-lg w-full object-center h-[250px]", itemClassName: "rounded rounded-t-lg", ...d, index: 0 }, void 0, false, {
      fileName: "app/components/preview/Gallery.tsx",
      lineNumber: 119,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "w-full grid grid-rows-2 grid-cols-3 gap-1", children: d.attachments.slice(1).map((_, i) => {
      const largeRound = i === 3 ? "rounded-bl-lg" : i === 5 ? "rounded-br-lg" : "";
      return /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(GalleryItem, { className: `rounded ${largeRound} h-full object-center aspect-square`, itemClassName: `rounded ${largeRound}`, ...d, index: i }, `gallery-attachment-${i}`, false, {
        fileName: "app/components/preview/Gallery.tsx",
        lineNumber: 123,
        columnNumber: 16
      }, this);
    }) }, void 0, false, {
      fileName: "app/components/preview/Gallery.tsx",
      lineNumber: 120,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/preview/Gallery.tsx",
    lineNumber: 118,
    columnNumber: 11
  }, this),
  8: (d) => /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "w-full grid grid-cols-1 grid-rows-1 gap-1 max-w-full", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "w-full grid grid-rows-1 grid-cols-2 gap-1", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(GalleryItem, { className: "rounded rounded-tl-lg w-full h-full object-center aspect-square", itemClassName: "rounded rounded-tl-lg", ...d, index: 0 }, void 0, false, {
        fileName: "app/components/preview/Gallery.tsx",
        lineNumber: 129,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(GalleryItem, { className: "rounded rounded-tr-lg w-full h-full object-center aspect-square", itemClassName: "rounded rounded-tr-lg", ...d, index: 1 }, void 0, false, {
        fileName: "app/components/preview/Gallery.tsx",
        lineNumber: 130,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/preview/Gallery.tsx",
      lineNumber: 128,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "w-full grid grid-rows-2 grid-cols-3 gap-1", children: d.attachments.slice(2).map((_, i) => {
      const largeRound = i === 3 ? "rounded-bl-lg" : i === 5 ? "rounded-br-lg" : "";
      return /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(GalleryItem, { className: `rounded ${largeRound} h-full object-center aspect-square`, itemClassName: `rounded ${largeRound}`, ...d, index: i }, `gallery-attachment-${i}`, false, {
        fileName: "app/components/preview/Gallery.tsx",
        lineNumber: 135,
        columnNumber: 16
      }, this);
    }) }, void 0, false, {
      fileName: "app/components/preview/Gallery.tsx",
      lineNumber: 132,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/preview/Gallery.tsx",
    lineNumber: 127,
    columnNumber: 11
  }, this),
  9: (d) => /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "w-full grid grid-cols-3 grid-rows-3 gap-1 max-w-full", children: d.attachments.map((_, i) => {
    const largeRound = i === 0 ? "rounded-tl-lg" : i === 2 ? "rounded-tr-lg" : i === 6 ? "rounded-bl-lg" : i === 8 ? "rounded-br-lg" : "";
    return /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(GalleryItem, { className: `rounded ${largeRound} h-full object-center aspect-square`, itemClassName: `rounded ${largeRound}`, ...d, index: i }, `gallery-attachment-${i}`, false, {
      fileName: "app/components/preview/Gallery.tsx",
      lineNumber: 142,
      columnNumber: 14
    }, this);
  }) }, void 0, false, {
    fileName: "app/components/preview/Gallery.tsx",
    lineNumber: 139,
    columnNumber: 11
  }, this),
  10: (d) => /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "w-full grid grid-cols-1 grid-rows-1 gap-1 max-w-full", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(GalleryItem, { className: "rounded rounded-t-lg w-full object-center h-[250px]", itemClassName: "rounded rounded-t-lg", ...d, index: 0 }, void 0, false, {
      fileName: "app/components/preview/Gallery.tsx",
      lineNumber: 146,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "w-full grid grid-rows-3 grid-cols-3 gap-1", children: d.attachments.slice(1).map((_, i) => {
      const largeRound = i === 6 ? "rounded-bl-lg" : i === 8 ? "rounded-br-lg" : "";
      return /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(GalleryItem, { className: `rounded ${largeRound} h-full object-center aspect-square`, itemClassName: `rounded ${largeRound}`, ...d, index: i }, `gallery-attachment-${i}`, false, {
        fileName: "app/components/preview/Gallery.tsx",
        lineNumber: 150,
        columnNumber: 16
      }, this);
    }) }, void 0, false, {
      fileName: "app/components/preview/Gallery.tsx",
      lineNumber: 147,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/preview/Gallery.tsx",
    lineNumber: 145,
    columnNumber: 12
  }, this)
};
var _c7;
var _c24;
$RefreshReg$(_c7, "Gallery");
$RefreshReg$(_c24, "GalleryItem");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// node_modules/react-showdown/dist/react-showdown.esm.js
var import_showdown = __toESM(require_showdown());
var import_react10 = __toESM(require_react());
var import_htmlparser2 = __toESM(require_lib6());
var import_domhandler = __toESM(require_lib2());
function _extends2() {
  _extends2 = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends2.apply(this, arguments);
}
function _objectWithoutPropertiesLoose2(source, excluded) {
  if (source == null)
    return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0)
      continue;
    target[key] = source[key];
  }
  return target;
}
function _unsupportedIterableToArray2(o, minLen) {
  if (!o)
    return;
  if (typeof o === "string")
    return _arrayLikeToArray2(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor)
    n = o.constructor.name;
  if (n === "Map" || n === "Set")
    return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray2(o, minLen);
}
function _arrayLikeToArray2(arr, len) {
  if (len == null || len > arr.length)
    len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++)
    arr2[i] = arr[i];
  return arr2;
}
function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it;
  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray2(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it)
        o = it;
      var i = 0;
      return function() {
        if (i >= o.length)
          return {
            done: true
          };
        return {
          done: false,
          value: o[i++]
        };
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  it = o[Symbol.iterator]();
  return it.next.bind(it);
}
function MarkdownView(props) {
  var dangerouslySetInnerHTML = props.dangerouslySetInnerHTML, flavor = props.flavor, markdown = props.markdown, markup = props.markup, options2 = props.options, extensions = props.extensions, components2 = props.components, sanitizeHtml = props.sanitizeHtml, otherProps = _objectWithoutPropertiesLoose2(props, ["dangerouslySetInnerHTML", "flavor", "markdown", "markup", "options", "extensions", "components", "sanitizeHtml"]);
  var mapElement = (0, import_react10.useMemo)(function() {
    return function mapElement2(node2, index2) {
      if (node2.type === "tag" && node2 instanceof import_domhandler.Element) {
        var elementType = (components2 === null || components2 === void 0 ? void 0 : components2[node2.name]) || node2.name;
        var _props = _extends2({
          key: index2
        }, node2.attribs);
        if (_props["class"] && !_props.className) {
          _props.className = _props["class"];
          delete _props["class"];
        }
        if (typeof _props.style === "string") {
          var styles = {};
          _props.style.split(";").forEach(function(style) {
            if (style.indexOf(":") !== -1) {
              var _style$split = style.split(":"), key2 = _style$split[0], value = _style$split[1];
              key2 = key2.trim().replace(/-([a-z])/g, function(match2) {
                return match2[1].toUpperCase();
              });
              value = value.trim();
              styles[key2] = value;
            }
          });
          _props.style = styles;
        }
        var children = skipAnyChildrenFor.includes(node2.name) ? null : skipWhitespaceElementsFor.includes(node2.name) ? node2.children.filter(filterWhitespaceElements).map(mapElement2) : node2.children.map(mapElement2);
        return (0, import_react10.createElement)(elementType, _props, children);
      } else if (node2.type === "text" && node2 instanceof import_domhandler.DataNode) {
        return node2.data;
      } else if (node2.type === "comment") {
        return null;
      } else if (node2.type === "style" && node2 instanceof import_domhandler.Element) {
        var _props2 = _extends2({
          key: index2
        }, node2.attribs);
        var _children = node2.children.map(mapElement2);
        return (0, import_react10.createElement)("style", _props2, _children);
      } else {
        console.warn('Warning: Could not map element with type "' + node2.type + '".', node2);
        return null;
      }
    };
  }, [components2]);
  if (dangerouslySetInnerHTML && components2) {
    console.warn("MarkdownView could not render custom components when dangerouslySetInnerHTML is enabled.");
  }
  var converter = new import_showdown.Converter();
  if (flavor) {
    converter.setFlavor(flavor);
  }
  if (options2) {
    for (var key in options2) {
      if (key === "extensions" && options2.extensions) {
        for (var _iterator = _createForOfIteratorHelperLoose(options2.extensions), _step; !(_step = _iterator()).done; ) {
          var extension2 = _step.value;
          if (typeof extension2 === "string") {
            converter.useExtension(extension2);
          } else {
            converter.addExtension(extension2);
          }
        }
      }
      converter.setOption(key, options2[key]);
    }
  }
  if (extensions) {
    converter.addExtension(extensions);
  }
  var html = converter.makeHtml(markdown !== null && markdown !== void 0 ? markdown : markup);
  if (sanitizeHtml) {
    html = sanitizeHtml(html);
  }
  if (dangerouslySetInnerHTML) {
    return import_react10.default.createElement("div", {
      dangerouslySetInnerHTML: {
        __html: html
      }
    });
  }
  var root = (0, import_htmlparser2.parseDOM)(html, {
    // Don't change the case of parsed html tags to match inline components.
    lowerCaseTags: false,
    // Don't change the attribute names so that stuff like `className` works correctly.
    lowerCaseAttributeNames: false,
    // Encode entities automatically, so that &copy; and &uuml; works correctly.
    decodeEntities: true,
    // Fix issue with content after a self closing tag.
    recognizeSelfClosing: true
  });
  return (0, import_react10.createElement)("div", otherProps, root.map(mapElement));
}
var skipAnyChildrenFor = ["area", "br", "col", "embed", "hr", "img", "input", "keygen", "param", "source", "track", "wbr"];
var skipWhitespaceElementsFor = ["table", "thead", "tbody", "tr"];
function filterWhitespaceElements(node2) {
  if (node2.type === "text" && node2 instanceof import_domhandler.DataNode) {
    return node2.data.trim().length > 0;
  } else {
    return true;
  }
}
var react_showdown_esm_default = MarkdownView;

// app/util/time.ts
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\util\\time.ts"
  );
  import.meta.hot.lastModified = "1694834790217.286";
}
var unitValues = [
  { unit: "second", shortUnit: "s", divValue: 1e3 },
  { unit: "minute", shortUnit: "m", divValue: 60 },
  { unit: "hour", shortUnit: "h", divValue: 60 },
  { unit: "day", shortUnit: "d", divValue: 24 },
  { unit: "week", shortUnit: "w", divValue: 7 },
  { unit: "month", shortUnit: "mo", divValue: 4 },
  { unit: "year", shortUnit: "y", divValue: 12 }
];
var timeDiff = (earlier, later, short = false) => {
  let diff = Math.abs(later.getTime() - earlier.getTime());
  let interval = short ? "ms" : "millisecond";
  const processDiffInterval = (index2) => {
    const { unit, shortUnit, divValue } = unitValues[index2];
    if (diff >= divValue) {
      diff = diff / divValue;
      interval = short ? shortUnit : unit;
      if (unitValues[index2 + 1]) {
        processDiffInterval(index2 + 1);
      }
    }
  };
  processDiffInterval(0);
  diff = Math.round(diff);
  const plural = diff === 1 || short ? "" : "s";
  const diffText = `${diff.toLocaleString()}${short ? "" : " "}${interval}${plural}`;
  return { text: diffText, future: later.getTime() < earlier.getTime() };
};
var relativeTime = (date, short = false) => {
  const { text, future } = timeDiff(date, /* @__PURE__ */ new Date(), short);
  return future ? `in ${text}` : `${text} ago`;
};

// app/components/preview/Markdown.tsx
var import_jsx_dev_runtime7 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\components\\\\preview\\\\Markdown.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\components\\preview\\Markdown.tsx"
  );
  import.meta.hot.lastModified = "1702846302917.7263";
}
var CARET_RE = /(?:^\^)|(?:([^(\\^)])\^)/g;
var TIMESTAMP_RE = /^(?:<|&lt;)t:(\d+)(?::(t|T|d|D|f|F|R))?>/;
var CUSTOM_EMOJI_RE = /^(?:<|&lt;)(a)?:(\w+):(\d+)>/;
var MENTION_RE = /^(?:<|&lt;)(@!?|@&|#)(\d+)>|^(?:<|&lt;)(\/(?! )[\w -]*[\w-]):(\d+)>|^(@(?:everyone|here))/;
var MESSAGE_LINK_RE = /^https:\/\/(?:www\.|ptb\.|canary\.)?discord(?:app)?\.com\/channels\/(\d+|@me)\/(\d+)\/(\d+)/;
var Markdown = ({
  text,
  features
}) => {
  const f = (search) => features === "all" ? true : features.includes(search);
  const replaceIf = (feature, text2) => f(feature) ? text2 : (t) => t;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(
    react_showdown_esm_default,
    {
      flavor: "vanilla",
      markdown: text.replace(/(<)([^<]+)/g, "&lt;$2").split("\n").join(" <br/>"),
      options: {
        tables: false,
        emoji: f("emojis"),
        ellipsis: false,
        strikethrough: f("basic"),
        simpleLineBreaks: true,
        openLinksInNewWindow: true,
        disableForced4SpacesIndentedSublists: true,
        noHeaderId: true,
        simplifiedAutoLink: true,
        ghCodeBlocks: true,
        smoothLivePreview: true
      },
      className: "contents whitespace-pre-wrap break-words break-all",
      components: {
        Mention: ({
          token: token2,
          id,
          commandName,
          commandId,
          everyoneHere
        }) => {
          let type, content;
          switch (token2) {
            case "@!":
            case "@":
              content = "@user";
              type = "user";
              break;
            case "@&":
              content = "@role";
              type = "role";
              break;
            case "#":
              content = "#channel";
              type = "channel";
              break;
            default:
              if (commandName) {
                content = commandName;
                type = "command";
              } else if (everyoneHere) {
                content = everyoneHere;
                type = "everyone-here";
              } else {
                content = `${token2}unknown`;
                type = "unknown";
              }
              break;
          }
          return /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("span", { className: "rounded px-0.5 font-medium cursor-pointer bg-blurple/[0.15] dark:bg-blurple/30 text-blurple dark:text-gray-100 hover:bg-blurple hover:text-white transition", "data-mention-type": type, "data-mention-id": id ?? commandId, children: content }, void 0, false, {
            fileName: "app/components/preview/Markdown.tsx",
            lineNumber: 95,
            columnNumber: 14
          }, this);
        },
        MessageLink: ({
          guildId,
          channelId,
          messageId
        }) => /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(
          "a",
          {
            className: "rounded px-0.5 font-medium cursor-pointer bg-blurple/[0.15] dark:bg-blurple/30 text-blurple dark:text-gray-100 hover:bg-blurple hover:text-white transition inline-flex",
            href: `https://discord.com/channels/${guildId}/${channelId}/${messageId}`,
            target: "_blank",
            rel: "noreferrer",
            children: [
              "#channel ",
              /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(CoolIcon, { icon: "Chevron_Right_MD", className: "my-auto" }, void 0, false, {
                fileName: "app/components/preview/Markdown.tsx",
                lineNumber: 107,
                columnNumber: 22
              }, this),
              " ",
              /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(CoolIcon, { icon: "Chat", className: "my-auto" }, void 0, false, {
                fileName: "app/components/preview/Markdown.tsx",
                lineNumber: 108,
                columnNumber: 13
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "app/components/preview/Markdown.tsx",
            lineNumber: 103,
            columnNumber: 11
          },
          this
        ),
        Emoji: ({
          id,
          name,
          flag
        }) => /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("img", { src: cdn.emoji(id, flag === "a" ? "gif" : "webp"), className: "inline-flex h-5 align-text-bottom", alt: name, title: `:${name}:`, draggable: false }, void 0, false, {
          fileName: "app/components/preview/Markdown.tsx",
          lineNumber: 114,
          columnNumber: 11
        }, this),
        Timestamp: ({
          source
        }) => {
          const match2 = source.match(TIMESTAMP_RE);
          const timestamp = new Date(Number(match2[1]) * 1e3);
          let text2;
          switch (match2[2]) {
            case "t":
              text2 = timestamp.toLocaleTimeString(void 0, {
                hour: "numeric",
                minute: "2-digit"
              });
              break;
            case "T":
              text2 = timestamp.toLocaleTimeString(void 0, {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit"
              });
              break;
            case "d":
              text2 = timestamp.toLocaleDateString();
              break;
            case "D":
              text2 = timestamp.toLocaleDateString(void 0, {
                day: "numeric",
                month: "long",
                year: "numeric"
              });
              break;
            case "F":
              text2 = timestamp.toLocaleString(void 0, {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                weekday: "long"
              });
              break;
            case "R":
              text2 = relativeTime(timestamp);
              break;
            default:
              text2 = timestamp.toLocaleString(void 0, {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit"
              });
              break;
          }
          return /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("time", { className: "bg-black/5 rounded", dateTime: timestamp.toISOString(), "data-timestamp-style": match2[2], children: text2 }, void 0, false, {
            fileName: "app/components/preview/Markdown.tsx",
            lineNumber: 170,
            columnNumber: 14
          }, this);
        },
        Quote: ({
          children
        }) => {
          return /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("div", { className: "flex", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("div", { className: "w-1 rounded bg-[#c4c9ce] dark:bg-[#4e5058] shrink-0" }, void 0, false, {
              fileName: "app/components/preview/Markdown.tsx",
              lineNumber: 178,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("blockquote", { className: "grow pr-2 pl-3", children }, void 0, false, {
              fileName: "app/components/preview/Markdown.tsx",
              lineNumber: 179,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "app/components/preview/Markdown.tsx",
            lineNumber: 177,
            columnNumber: 14
          }, this);
        },
        p: (props) => /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("span", { ...props }, void 0, false, {
          fileName: "app/components/preview/Markdown.tsx",
          lineNumber: 182,
          columnNumber: 17
        }, this),
        strong: (props) => f("basic") ? /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("span", { className: "font-bold", children: props.children }, void 0, false, {
          fileName: "app/components/preview/Markdown.tsx",
          lineNumber: 183,
          columnNumber: 35
        }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("span", { children: [
          "**",
          props.children,
          "**"
        ] }, void 0, true, {
          fileName: "app/components/preview/Markdown.tsx",
          lineNumber: 183,
          columnNumber: 89
        }, this),
        em: (props) => f("basic") ? /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("span", { className: "italic", children: props.children }, void 0, false, {
          fileName: "app/components/preview/Markdown.tsx",
          lineNumber: 184,
          columnNumber: 31
        }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("span", { children: [
          "*",
          props.children,
          "*"
        ] }, void 0, true, {
          fileName: "app/components/preview/Markdown.tsx",
          lineNumber: 184,
          columnNumber: 82
        }, this),
        h1: (props) => /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("span", { className: f("headers") ? "font-bold text-2xl leading-[33px] my-2" : void 0, children: props.children }, void 0, false, {
          fileName: "app/components/preview/Markdown.tsx",
          lineNumber: 185,
          columnNumber: 18
        }, this),
        h2: (props) => /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("span", { className: f("headers") ? "font-bold text-xl leading-[27.5px] mb-2 mt-4" : void 0, children: props.children }, void 0, false, {
          fileName: "app/components/preview/Markdown.tsx",
          lineNumber: 188,
          columnNumber: 18
        }, this),
        h3: (props) => /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("span", { className: f("headers") ? "font-bold text-base leading-[22px] mb-2 mt-4" : void 0, children: props.children }, void 0, false, {
          fileName: "app/components/preview/Markdown.tsx",
          lineNumber: 191,
          columnNumber: 18
        }, this),
        h4: (props) => /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("span", { children: [
          "#### ",
          props.children
        ] }, void 0, true, {
          fileName: "app/components/preview/Markdown.tsx",
          lineNumber: 194,
          columnNumber: 18
        }, this),
        h5: (props) => /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("span", { children: [
          "##### ",
          props.children
        ] }, void 0, true, {
          fileName: "app/components/preview/Markdown.tsx",
          lineNumber: 195,
          columnNumber: 18
        }, this),
        h6: (props) => /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("span", { children: [
          "###### ",
          props.children
        ] }, void 0, true, {
          fileName: "app/components/preview/Markdown.tsx",
          lineNumber: 196,
          columnNumber: 18
        }, this),
        a: (props) => f("hyperlinks") ? /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("a", { className: "text-[#006ce7] dark:text-[#00a8fc] hover:underline underline-offset-1", title: `${props.title ?? props.children}

(${props.href})`, ...props }, void 0, false, {
          fileName: "app/components/preview/Markdown.tsx",
          lineNumber: 197,
          columnNumber: 35
        }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("span", { children: [
          "[",
          props.children,
          props.title && ` "${props.title}"`,
          "](",
          props.href,
          ")"
        ] }, void 0, true, {
          fileName: "app/components/preview/Markdown.tsx",
          lineNumber: 197,
          columnNumber: 198
        }, this),
        ul: (props) => f("lists") ? /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("ul", { className: "list-disc", ...props }, void 0, false, {
          fileName: "app/components/preview/Markdown.tsx",
          lineNumber: 201,
          columnNumber: 31
        }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("span", { children: [
          "- ",
          props.children
        ] }, void 0, true, {
          fileName: "app/components/preview/Markdown.tsx",
          lineNumber: 201,
          columnNumber: 73
        }, this),
        ol: (props) => f("lists") ? /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("ul", { className: "list-decimal", ...props }, void 0, false, {
          fileName: "app/components/preview/Markdown.tsx",
          lineNumber: 202,
          columnNumber: 31
        }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("span", { children: [
          "- ",
          props.children
        ] }, void 0, true, {
          fileName: "app/components/preview/Markdown.tsx",
          lineNumber: 202,
          columnNumber: 76
        }, this),
        li: (props) => /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("li", { className: "ml-4", ...props }, void 0, false, {
          fileName: "app/components/preview/Markdown.tsx",
          lineNumber: 203,
          columnNumber: 18
        }, this),
        code: (props) => f("inline-code") ? /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("code", { className: "bg-gray-300 text-[0.85em] leading-[1.125rem] whitespace-pre-wrap p-[0.2em] -my-[0.2em] rounded", ...props }, void 0, false, {
          fileName: "app/components/preview/Markdown.tsx",
          lineNumber: 204,
          columnNumber: 39
        }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("span", { children: [
          "`",
          props.children,
          "`"
        ] }, void 0, true, {
          fileName: "app/components/preview/Markdown.tsx",
          lineNumber: 204,
          columnNumber: 168
        }, this)
      },
      extensions: [
        {
          type: "lang",
          regex: new RegExp(CUSTOM_EMOJI_RE.source.replace(/^\^/, ""), "g"),
          replace: replaceIf("emojis", '<Emoji id="$3" name="$2" flag="$1" />')
        },
        {
          type: "lang",
          regex: new RegExp(MENTION_RE.source.replace(CARET_RE, "$1"), "g"),
          replace: replaceIf("mentions", '<Mention token="$1" id="$2" commandName="$3" commandId="$4" everyoneHere="$5" />')
        },
        {
          type: "lang",
          regex: new RegExp(TIMESTAMP_RE.source.replace(/^\^/, ""), "g"),
          replace: (t) => {
            if (!f("mentions"))
              return t;
            return `<Timestamp source="${t}" />`;
          }
        },
        {
          type: "lang",
          regex: /\|\|([^||]+)\|\|/g,
          replace: replaceIf("basic", '<span class="bg-black/10 rounded">$1</span>')
        },
        // I'm aware of the `underline` option, but it disables underscore italics,
        // which means I would need an extension anyway.
        {
          type: "lang",
          regex: /__([^__]+)__/g,
          replace: replaceIf("basic", '<span class="underline">$1</span>')
        },
        {
          type: "lang",
          regex: new RegExp(MESSAGE_LINK_RE.source.replace(/^\^/, ""), "g"),
          replace: replaceIf("basic", '<MessageLink guildId="$1" channelId="$2" messageId="$3" />')
        },
        {
          type: "lang",
          filter: (text2) => {
            return text2.replace(/^>( )?(.+)$/gm, (found) => {
              const match2 = found.match(/^>( )?(.+)$/);
              if (!match2[1]) {
                return `>${match2[2]}`;
              } else {
                return `<Quote>${match2[2]}</Quote>`;
              }
            });
          }
        }
      ]
    },
    void 0,
    false,
    {
      fileName: "app/components/preview/Markdown.tsx",
      lineNumber: 45,
      columnNumber: 10
    },
    this
  );
};
_c8 = Markdown;
var _c8;
$RefreshReg$(_c8, "Markdown");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/components/preview/Embed.tsx
var import_jsx_dev_runtime8 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\components\\\\preview\\\\Embed.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\components\\preview\\Embed.tsx"
  );
  import.meta.hot.lastModified = "1695939256966.3762";
}
var Embed = ({
  embed,
  extraImages,
  resolved,
  setImageModalData
}) => {
  const fieldLines = [];
  for (const field of embed.fields ?? []) {
    const currentLine = fieldLines[fieldLines.length - 1];
    if (!currentLine) {
      fieldLines.push([field]);
    } else {
      const lastField = currentLine[currentLine.length - 1];
      if (!lastField) {
        continue;
      }
      if (field.inline && lastField.inline && currentLine.length < 3) {
        currentLine.push(field);
      } else {
        fieldLines.push([field]);
      }
    }
  }
  const images = [];
  if (embed.image?.url) {
    images.push(embed.image);
  }
  if (extraImages) {
    images.push(...extraImages);
  }
  return /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "rounded bg-gray-100 border-l-4 border-l-gray-300 dark:bg-[#2B2D31] dark:border-l-[#1E1F22] dark:text-gray-100 inline-grid max-w-[520px] pt-2 pr-4 pb-4 pl-3", style: embed.color ? {
    borderColor: `#${embed.color.toString(16)}`
  } : void 0, children: [
    embed.author && embed.author.name && /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "min-w-0 flex mt-2", children: [
      embed.author.icon_url && /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("img", { className: "h-6 w-6 mr-2 object-contain rounded-full", src: embed.author.icon_url, alt: "Author" }, void 0, false, {
        fileName: "app/components/preview/Embed.tsx",
        lineNumber: 59,
        columnNumber: 39
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("p", { className: "font-medium text-sm whitespace-pre-wrap inline-block my-auto", children: embed.author.url ? /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("a", { className: "hover:underline", href: embed.author.url, target: "_blank", rel: "noreferrer nofollow ugc", children: embed.author.name }, void 0, false, {
        fileName: "app/components/preview/Embed.tsx",
        lineNumber: 61,
        columnNumber: 35
      }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("span", { children: embed.author.name }, void 0, false, {
        fileName: "app/components/preview/Embed.tsx",
        lineNumber: 63,
        columnNumber: 24
      }, this) }, void 0, false, {
        fileName: "app/components/preview/Embed.tsx",
        lineNumber: 60,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/preview/Embed.tsx",
      lineNumber: 58,
      columnNumber: 47
    }, this),
    embed.title && /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "text-base leading-[1.375] font-semibold mt-2 inline-block", children: embed.url ? /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("a", { href: embed.url, className: "text-[#006ce7] dark:text-[#00a8fc] hover:underline underline-offset-1", target: "_blank", rel: "noreferrer nofollow ugc", children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(Markdown, { text: embed.title, features: ["basic", "inline-code", "emojis"], resolved }, void 0, false, {
      fileName: "app/components/preview/Embed.tsx",
      lineNumber: 68,
      columnNumber: 17
    }, this) }, void 0, false, {
      fileName: "app/components/preview/Embed.tsx",
      lineNumber: 67,
      columnNumber: 26
    }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(Markdown, { text: embed.title, features: ["basic", "inline-code", "emojis"], resolved }, void 0, false, {
      fileName: "app/components/preview/Embed.tsx",
      lineNumber: 69,
      columnNumber: 22
    }, this) }, void 0, false, {
      fileName: "app/components/preview/Embed.tsx",
      lineNumber: 66,
      columnNumber: 25
    }, this),
    embed.description && /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "text-sm font-medium dark:font-normal mt-2 inline-block whitespace-pre-line", children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(Markdown, { text: embed.description, features: "all", resolved }, void 0, false, {
      fileName: "app/components/preview/Embed.tsx",
      lineNumber: 72,
      columnNumber: 13
    }, this) }, void 0, false, {
      fileName: "app/components/preview/Embed.tsx",
      lineNumber: 71,
      columnNumber: 31
    }, this),
    fieldLines.length > 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "text-sm leading-[1.125rem] grid col-start-1 col-end-2 gap-2 mt-2 min-w-0", children: fieldLines.map((line2, i) => /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "contents", "data-field-row-index": i, children: line2.map((field, colIndex) => {
      let inlineBound = [1, 13];
      if (field.inline) {
        if (line2.length === 3) {
          if (colIndex === 2) {
            inlineBound = [9, 13];
          } else if (colIndex === 1) {
            inlineBound = [5, 9];
          } else {
            inlineBound = [1, 5];
          }
        } else if (line2.length === 2) {
          if (colIndex === 1) {
            inlineBound = [7, 13];
          } else {
            inlineBound = [1, 7];
          }
        }
      }
      return /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { "data-field-subrow-index": i, style: {
        gridColumn: `${inlineBound[0]} / ${inlineBound[1]}`
      }, children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "font-semibold mb-px", children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(Markdown, { text: field.name, features: ["basic", "emojis"], resolved }, void 0, false, {
          fileName: "app/components/preview/Embed.tsx",
          lineNumber: 99,
          columnNumber: 25
        }, this) }, void 0, false, {
          fileName: "app/components/preview/Embed.tsx",
          lineNumber: 98,
          columnNumber: 23
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(Markdown, { text: field.value, features: "all", resolved }, void 0, false, {
          fileName: "app/components/preview/Embed.tsx",
          lineNumber: 102,
          columnNumber: 25
        }, this) }, void 0, false, {
          fileName: "app/components/preview/Embed.tsx",
          lineNumber: 101,
          columnNumber: 23
        }, this)
      ] }, `message-preview-embed-fields-row-${i}-field-${colIndex}`, true, {
        fileName: "app/components/preview/Embed.tsx",
        lineNumber: 95,
        columnNumber: 20
      }, this);
    }) }, `message-preview-embed-fields-row-${i}`, false, {
      fileName: "app/components/preview/Embed.tsx",
      lineNumber: 75,
      columnNumber: 42
    }, this)) }, void 0, false, {
      fileName: "app/components/preview/Embed.tsx",
      lineNumber: 74,
      columnNumber: 35
    }, this),
    images.length > 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "mt-2", children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(Gallery, { attachments: images.map((image) => ({
      // It doesn't actually matter, we only need to know it's an image
      content_type: image.url.endsWith(".gif") ? "image/gif" : "image/png",
      url: image.url
    })), setImageModalData }, void 0, false, {
      fileName: "app/components/preview/Embed.tsx",
      lineNumber: 109,
      columnNumber: 13
    }, this) }, void 0, false, {
      fileName: "app/components/preview/Embed.tsx",
      lineNumber: 108,
      columnNumber: 31
    }, this),
    embed.thumbnail?.url && /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("button", { className: "flex mt-2 ml-4 justify-self-end h-fit", style: {
      gridArea: "1 / 2 / 8 / 3"
    }, onClick: () => {
      if (setImageModalData) {
        setImageModalData({
          images: [{
            url: embed.thumbnail.url
          }],
          startIndex: 0
        });
      }
    }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("img", { src: embed.thumbnail.url, className: "rounded max-w-[80px] max-h-20", alt: "Thumbnail" }, void 0, false, {
      fileName: "app/components/preview/Embed.tsx",
      lineNumber: 127,
      columnNumber: 13
    }, this) }, void 0, false, {
      fileName: "app/components/preview/Embed.tsx",
      lineNumber: 115,
      columnNumber: 34
    }, this),
    embed.footer && embed.footer.text && /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: "min-w-0 flex mt-2", children: [
      embed.footer.icon_url && /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("img", { className: "h-5 w-5 mr-2 object-contain rounded-full", src: embed.footer.icon_url, alt: "Footer" }, void 0, false, {
        fileName: "app/components/preview/Embed.tsx",
        lineNumber: 130,
        columnNumber: 39
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("p", { className: "font-medium text-xs text-[#313338] dark:text-[#dbdee1] whitespace-pre-wrap inline-block my-auto", children: embed.footer.text }, void 0, false, {
        fileName: "app/components/preview/Embed.tsx",
        lineNumber: 131,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/preview/Embed.tsx",
      lineNumber: 129,
      columnNumber: 47
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/preview/Embed.tsx",
    lineNumber: 55,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/components/preview/Embed.tsx",
    lineNumber: 54,
    columnNumber: 10
  }, this);
};
_c9 = Embed;
var _c9;
$RefreshReg$(_c9, "Embed");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/components/preview/FileAttachment.tsx
var import_jsx_dev_runtime9 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\components\\\\preview\\\\FileAttachment.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\components\\preview\\FileAttachment.tsx"
  );
  import.meta.hot.lastModified = "1695913027537.0093";
}
var FileAttachment = ({
  attachment
}) => {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "rounded-lg p-2 bg-gray-300 flex", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(CoolIcon, { icon: "File_Blank", className: "shrink-0 mr-1 my-auto text-5xl text-gray-500" }, void 0, false, {
      fileName: "app/components/preview/FileAttachment.tsx",
      lineNumber: 26,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "my-auto", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("a", { className: "block hover:underline text-base underline-offset-1 font-normal text-blurple-400 leading-none", href: attachment.url, children: attachment.filename }, void 0, false, {
        fileName: "app/components/preview/FileAttachment.tsx",
        lineNumber: 28,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("p", { className: "text-xs text-gray-500 font-normal leading-none", children: [
        attachment.size,
        " bytes"
      ] }, void 0, true, {
        fileName: "app/components/preview/FileAttachment.tsx",
        lineNumber: 31,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/preview/FileAttachment.tsx",
      lineNumber: 27,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/preview/FileAttachment.tsx",
    lineNumber: 25,
    columnNumber: 10
  }, this);
};
_c10 = FileAttachment;
var _c10;
$RefreshReg$(_c10, "FileAttachment");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/components/preview/Message.tsx
var import_jsx_dev_runtime10 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\components\\\\preview\\\\Message.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\components\\preview\\Message.tsx"
  );
  import.meta.hot.lastModified = "1702866350186.5278";
}
var AuthorType = /* @__PURE__ */ function(AuthorType2) {
  AuthorType2[AuthorType2["User"] = 0] = "User";
  AuthorType2[AuthorType2["Webhook"] = 1] = "Webhook";
  AuthorType2[AuthorType2["Bot"] = 2] = "Bot";
  AuthorType2[AuthorType2["ActionableBot"] = 3] = "ActionableBot";
  AuthorType2[AuthorType2["ApplicationWebhook"] = 4] = "ApplicationWebhook";
  AuthorType2[AuthorType2["ActionableWebhook"] = 5] = "ActionableWebhook";
  return AuthorType2;
}({});
var getAuthorType = (discordApplicationId, webhook) => {
  if (webhook) {
    if (discordApplicationId && webhook.application_id === discordApplicationId) {
      return AuthorType.ActionableWebhook;
    } else if (webhook.application_id) {
      return AuthorType.ApplicationWebhook;
    }
  }
  return AuthorType.Webhook;
};
var strings = {
  todayAt: "Today at {0}"
};
var Message = ({
  message,
  discordApplicationId,
  index: index2,
  data,
  webhooks,
  messageDisplay,
  compactAvatars,
  date,
  resolved,
  setImageModalData
}) => {
  const webhook = webhooks ? webhooks[0] : void 0;
  const username = message.author?.name ?? webhook?.name ?? "Boogiehook", avatarUrl = message.author?.icon_url ?? (webhook ? webhook.avatar ? cdn.avatar(webhook.id, webhook.avatar, {
    size: 64
  }) : cdn.defaultAvatar(5) : "/logos/boogiehook.svg"), badge = "BOT";
  const lastMessage = data && index2 !== void 0 ? data.messages[index2 - 1] : void 0;
  const showProfile = lastMessage ? lastMessage.data.author?.name !== message.author?.name || lastMessage.data.author?.icon_url !== message.author?.icon_url : true;
  const authorType = webhook ? getAuthorType(discordApplicationId, webhook) : AuthorType.ActionableWebhook;
  const embeds = [];
  for (const embed of message.embeds ?? []) {
    const galleryChildren = message.embeds.filter((e) => embed.url && e.url === embed.url).slice(1);
    if (galleryChildren.includes(embed))
      continue;
    embeds.push({
      embed,
      extraImages: galleryChildren.filter((e) => e.image?.url).map((e) => e.image)
    });
  }
  const fileAttachments = (message.attachments ?? []).filter((a) => a.content_type && !["video", "image"].includes(a.content_type.split("/")[0]));
  const mediaAttachments = (message.attachments ?? []).filter((a) => a.content_type && ["video", "image"].includes(a.content_type.split("/")[0]));
  return /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("div", { className: `flex dark:text-[#dbdee1] ${showProfile && lastMessage ? "mt-4" : ""}`, children: [
    messageDisplay !== "compact" && /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("div", { className: "hidden sm:block w-fit shrink-0", children: showProfile ? /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("img", { className: "rounded-full mr-3 h-10 w-10 cursor-pointer hover:shadow-lg active:translate-y-px", src: avatarUrl, alt: username }, void 0, false, {
      fileName: "app/components/preview/Message.tsx",
      lineNumber: 96,
      columnNumber: 26
    }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("div", { className: "w-10 mr-3" }, void 0, false, {
      fileName: "app/components/preview/Message.tsx",
      lineNumber: 96,
      columnNumber: 160
    }, this) }, void 0, false, {
      fileName: "app/components/preview/Message.tsx",
      lineNumber: 95,
      columnNumber: 40
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("div", { className: "grow", children: [
      showProfile && messageDisplay !== "compact" && /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("p", { className: "leading-none h-4", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("span", { className: "hover:underline cursor-pointer underline-offset-1 decoration-1 font-semibold dark:font-medium dark:text-[#f2f3f5]", children: username }, void 0, false, {
          fileName: "app/components/preview/Message.tsx",
          lineNumber: 100,
          columnNumber: 13
        }, this),
        badge && /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("span", { className: "font-medium ml-1 mt-[0.75px] text-[10px] rounded px-1.5 py-px bg-blurple text-white items-center inline-flex h-4", children: badge }, void 0, false, {
          fileName: "app/components/preview/Message.tsx",
          lineNumber: 103,
          columnNumber: 23
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("span", { className: "font-medium ml-1 cursor-default text-xs align-baseline text-[#5C5E66] dark:text-[#949BA4]", children: strings.todayAt }, void 0, false, {
          fileName: "app/components/preview/Message.tsx",
          lineNumber: 106,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/preview/Message.tsx",
        lineNumber: 99,
        columnNumber: 57
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("div", { className: messageDisplay === "compact" ? "relative pl-20 -indent-16" : "", children: [
        messageDisplay === "compact" && /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("h3", { className: "inline text-base", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("span", { className: "font-medium mr-1 h-5 text-[11px] leading-[22px] break-words cursor-default align-baseline text-[#5C5E66] dark:text-[#949BA4]", children: (date ?? /* @__PURE__ */ new Date()).toLocaleTimeString(void 0, {
            hour: "numeric",
            minute: "2-digit"
          }) }, void 0, false, {
            fileName: "app/components/preview/Message.tsx",
            lineNumber: 119,
            columnNumber: 15
          }, this),
          compactAvatars && /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("img", { className: "inline-block rounded-full -mt-1 ml-[0.1em] mr-1 h-4 w-4 cursor-pointer active:translate-y-px", src: avatarUrl, alt: username }, void 0, false, {
            fileName: "app/components/preview/Message.tsx",
            lineNumber: 125,
            columnNumber: 34
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("span", { className: "mr-1", children: [
            badge && /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("span", { className: "font-medium mr-1 text-[10px] rounded mt-px px-1.5 py-px bg-blurple text-white items-center inline-flex h-4 indent-0", children: badge }, void 0, false, {
              fileName: "app/components/preview/Message.tsx",
              lineNumber: 127,
              columnNumber: 27
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("span", { className: "hover:underline cursor-pointer underline-offset-1 decoration-1 font-semibold dark:font-medium dark:text-[#f2f3f5]", children: username }, void 0, false, {
              fileName: "app/components/preview/Message.tsx",
              lineNumber: 130,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "app/components/preview/Message.tsx",
            lineNumber: 126,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "app/components/preview/Message.tsx",
          lineNumber: 118,
          columnNumber: 44
        }, this),
        message.content && /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("div", { className: "contents font-medium text-[#313338] dark:text-[#dbdee1] dark:font-normal text-base leading-[1.375]", children: /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(Markdown, { text: message.content, features: "all", resolved }, void 0, false, {
          fileName: "app/components/preview/Message.tsx",
          lineNumber: 136,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "app/components/preview/Message.tsx",
          lineNumber: 135,
          columnNumber: 31
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/preview/Message.tsx",
        lineNumber: 117,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("div", { className: messageDisplay === "compact" ? "pl-20" : "", children: [
        message.attachments && /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("div", { className: "max-w-[550px] mt-1 space-y-1", children: [
          fileAttachments.map((attachment) => /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(FileAttachment, { attachment }, `attachment-${attachment.id}`, false, {
            fileName: "app/components/preview/Message.tsx",
            lineNumber: 141,
            columnNumber: 50
          }, this)),
          mediaAttachments.length > 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(Gallery, { attachments: mediaAttachments, setImageModalData }, void 0, false, {
            fileName: "app/components/preview/Message.tsx",
            lineNumber: 142,
            columnNumber: 47
          }, this)
        ] }, void 0, true, {
          fileName: "app/components/preview/Message.tsx",
          lineNumber: 140,
          columnNumber: 35
        }, this),
        embeds.length > 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("div", { className: "space-y-1 mt-1", children: embeds.map((embedData, i) => /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(Embed, { ...embedData, resolved, setImageModalData }, `message-preview-embed-${i}`, false, {
          fileName: "app/components/preview/Message.tsx",
          lineNumber: 145,
          columnNumber: 45
        }, this)) }, void 0, false, {
          fileName: "app/components/preview/Message.tsx",
          lineNumber: 144,
          columnNumber: 33
        }, this),
        message.components && message.components.length > 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("div", { className: "mt-1", children: /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(MessageComponents, { components: message.components, authorType }, void 0, false, {
          fileName: "app/components/preview/Message.tsx",
          lineNumber: 148,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "app/components/preview/Message.tsx",
          lineNumber: 147,
          columnNumber: 67
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/preview/Message.tsx",
        lineNumber: 139,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/preview/Message.tsx",
      lineNumber: 98,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/preview/Message.tsx",
    lineNumber: 94,
    columnNumber: 10
  }, this);
};
_c11 = Message;
var _c11;
$RefreshReg$(_c11, "Message");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/util/localstorage.ts
var import_react11 = __toESM(require_react(), 1);
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\util\\localstorage.ts"
  );
  import.meta.hot.lastModified = "1702952856820.799";
}
var useLocalStorage = () => {
  try {
    localStorage;
  } catch {
    return [{}, (data) => {
    }];
  }
  const settings = JSON.parse(
    localStorage.getItem("boogiehook_settings") ?? "{}"
  );
  const [state, setState] = (0, import_react11.useState)(settings);
  (0, import_react11.useEffect)(() => {
    const listenStorageChange = () => {
      setState(JSON.parse(localStorage.getItem("boogiehook_settings") ?? "{}"));
    };
    window.addEventListener("storage", listenStorageChange);
    return () => window.removeEventListener("storage", listenStorageChange);
  }, []);
  const update = (data) => {
    const newData = { ...settings, ...data };
    localStorage.setItem("boogiehook_settings", JSON.stringify(newData));
    window.dispatchEvent(new Event("storage"));
  };
  return [state, update];
};

// app/util/users.ts
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\util\\users.ts"
  );
  import.meta.hot.lastModified = "1702925727771.874";
}
var getUserTag = (user) => user.discordUser ? user.discordUser.discriminator === "0" ? user.discordUser.name : `${user.discordUser.name}#${user.discordUser.discriminator}` : user.name;
var getUserAvatar = (user, options2) => user.discordUser ? user.discordUser.avatar ? cdn.avatar(
  String(user.discordUser.id),
  user.discordUser.avatar,
  options2
) : cdn.defaultAvatar(
  user.discordUser.discriminator === "0" ? Number((BigInt(user.discordUser.id) >> BigInt(22)) % BigInt(6)) : Number(user.discordUser.discriminator) % 5
) : cdn.defaultAvatar(0);

// app/components/Header.tsx
var import_react13 = __toESM(require_react(), 1);

// app/modals/Modal.tsx
var import_react_modal = __toESM(require_lib7(), 1);
var import_jsx_dev_runtime11 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\modals\\\\Modal.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\modals\\Modal.tsx"
  );
  import.meta.hot.lastModified = "1696539685155.49";
}
var Modal = ({
  open,
  setOpen,
  title,
  children
}) => {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)(import_react_modal.default, { isOpen: open, onRequestClose: () => setOpen(false), ariaHideApp: false, closeTimeoutMS: 100, style: {
    overlay: {
      zIndex: 11,
      backgroundColor: "rgb(0 0 0 / 0.5)"
    },
    content: {
      zIndex: 11,
      padding: 0,
      inset: "1rem",
      background: "none",
      border: "none",
      borderRadius: "0.5rem",
      maxWidth: "38rem",
      height: "fit-content",
      maxHeight: "calc(100% - 4rem)",
      margin: "auto",
      overflow: "visible",
      overflowY: "auto"
    }
  }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("div", { className: "rounded-lg bg-gray-50 text-black dark:bg-gray-800 dark:text-gray-50", children: [
    title && /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("div", { className: "px-5 py-3 bg-gray-200 dark:bg-gray-900 flex rounded-t-lg", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("p", { className: "text-xl font-black my-auto", children: title }, void 0, false, {
        fileName: "app/modals/Modal.tsx",
        lineNumber: 51,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)(ModalCloseButton, { setOpen }, void 0, false, {
        fileName: "app/modals/Modal.tsx",
        lineNumber: 52,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "app/modals/Modal.tsx",
      lineNumber: 50,
      columnNumber: 19
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("div", { className: "p-5", children }, void 0, false, {
      fileName: "app/modals/Modal.tsx",
      lineNumber: 54,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "app/modals/Modal.tsx",
    lineNumber: 49,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/modals/Modal.tsx",
    lineNumber: 29,
    columnNumber: 10
  }, this);
};
_c12 = Modal;
var ModalCloseButton = ({
  setOpen
}) => /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("button", { className: "ml-auto mb-auto", onClick: () => setOpen(false), children: /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)(CoolIcon, { icon: "Close_MD", className: "text-2xl text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-gray-300 transition" }, void 0, false, {
  fileName: "app/modals/Modal.tsx",
  lineNumber: 62,
  columnNumber: 5
}, this) }, void 0, false, {
  fileName: "app/modals/Modal.tsx",
  lineNumber: 61,
  columnNumber: 7
}, this);
_c25 = ModalCloseButton;
var _c12;
var _c25;
$RefreshReg$(_c12, "Modal");
$RefreshReg$(_c25, "ModalCloseButton");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/modals/HelpModal.tsx
var import_jsx_dev_runtime12 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\modals\\\\HelpModal.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\modals\\HelpModal.tsx"
  );
  import.meta.hot.lastModified = "1703084819912.808";
}
var HelpModal = (props) => {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)(Modal, { title: "Help", ...props, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("p", { children: "Searchable box of all the help tags" }, void 0, false, {
      fileName: "app/modals/HelpModal.tsx",
      lineNumber: 27,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("div", { className: "flex w-full mt-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("div", { className: "flex gap-2 mx-auto", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)(Button, { onClick: () => props.setOpen(false), children: "OK" }, void 0, false, {
        fileName: "app/modals/HelpModal.tsx",
        lineNumber: 30,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)(PreviewButton, { data: {
        type: ComponentType.Button,
        style: ButtonStyle.Link,
        url: "/discord",
        label: "Support Server"
      } }, void 0, false, {
        fileName: "app/modals/HelpModal.tsx",
        lineNumber: 31,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "app/modals/HelpModal.tsx",
      lineNumber: 29,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/modals/HelpModal.tsx",
      lineNumber: 28,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/modals/HelpModal.tsx",
    lineNumber: 26,
    columnNumber: 10
  }, this);
};
_c13 = HelpModal;
var _c13;
$RefreshReg$(_c13, "HelpModal");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/components/Checkbox.tsx
var import_jsx_dev_runtime13 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\components\\\\Checkbox.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\components\\Checkbox.tsx"
  );
  import.meta.hot.lastModified = "1696010896531.368";
}
var Checkbox = (props) => {
  const {
    label,
    description
  } = props;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)("label", { className: "flex group/checkbox select-none", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)("input", { type: "checkbox", ...props, className: "hidden peer" }, void 0, false, {
        fileName: "app/components/Checkbox.tsx",
        lineNumber: 29,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)(ConditionalBox, { className: props.className, check: true }, void 0, false, {
        fileName: "app/components/Checkbox.tsx",
        lineNumber: 30,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)(ConditionalBox, { className: props.className }, void 0, false, {
        fileName: "app/components/Checkbox.tsx",
        lineNumber: 31,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)("p", { className: "text-sm font-medium flex", children: label }, void 0, false, {
        fileName: "app/components/Checkbox.tsx",
        lineNumber: 32,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/Checkbox.tsx",
      lineNumber: 28,
      columnNumber: 7
    }, this),
    description && /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)("div", { children: description }, void 0, false, {
      fileName: "app/components/Checkbox.tsx",
      lineNumber: 34,
      columnNumber: 23
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/Checkbox.tsx",
    lineNumber: 27,
    columnNumber: 10
  }, this);
};
_c14 = Checkbox;
var ConditionalBox = ({
  check,
  className
}) => /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)("div", { className: `rounded border h-5 w-5 bg-gray-300 border-gray-200 group-hover/checkbox:bg-gray-400 peer-focus:border-blurple-500 dark:border-gray-600 dark:group-hover/checkbox:bg-gray-600 dark:bg-gray-700 transition-all mr-1 ${check ? "hidden peer-checked:inline-flex" : "inline-flex peer-checked:hidden"} ${className ?? ""}`, children: check && /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)(CoolIcon, { icon: "Check", className: "m-auto mr-[2px] transition" }, void 0, false, {
  fileName: "app/components/Checkbox.tsx",
  lineNumber: 42,
  columnNumber: 15
}, this) }, void 0, false, {
  fileName: "app/components/Checkbox.tsx",
  lineNumber: 41,
  columnNumber: 7
}, this);
_c26 = ConditionalBox;
var _c14;
var _c26;
$RefreshReg$(_c14, "Checkbox");
$RefreshReg$(_c26, "ConditionalBox");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/components/Radio.tsx
var import_jsx_dev_runtime14 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\components\\\\Radio.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\components\\Radio.tsx"
  );
  import.meta.hot.lastModified = "1696005148877.919";
}
var Radio = (props) => {
  const {
    label,
    description
  } = props;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)("label", { className: "flex group/radio select-none rounded py-2 px-3 bg-gray-200 dark:bg-gray-700 cursor-pointer", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)("input", { type: "radio", ...props, className: "hidden peer" }, void 0, false, {
      fileName: "app/components/Radio.tsx",
      lineNumber: 28,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(ConditionalBox2, { className: props.className }, void 0, false, {
      fileName: "app/components/Radio.tsx",
      lineNumber: 29,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(ConditionalBox2, { className: props.className, check: true }, void 0, false, {
      fileName: "app/components/Radio.tsx",
      lineNumber: 30,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)("div", { className: "my-auto", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)("p", { className: "text-base font-medium", children: label }, void 0, false, {
        fileName: "app/components/Radio.tsx",
        lineNumber: 32,
        columnNumber: 9
      }, this),
      description && /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)("p", { className: "text-sm", children: description }, void 0, false, {
        fileName: "app/components/Radio.tsx",
        lineNumber: 33,
        columnNumber: 25
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/Radio.tsx",
      lineNumber: 31,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/Radio.tsx",
    lineNumber: 27,
    columnNumber: 10
  }, this);
};
_c15 = Radio;
var ConditionalBox2 = ({
  check,
  className
}) => /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(CoolIcon, { icon: check ? "Radio_Fill" : "Radio_Unchecked", className: `text-2xl my-auto mr-2 ${check ? "hidden peer-checked:inline-flex" : "inline-flex peer-checked:hidden"} ${className ?? ""}` }, void 0, false, {
  fileName: "app/components/Radio.tsx",
  lineNumber: 41,
  columnNumber: 7
}, this);
_c27 = ConditionalBox2;
var _c15;
var _c27;
$RefreshReg$(_c15, "Radio");
$RefreshReg$(_c27, "ConditionalBox");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/modals/SettingsModal.tsx
var import_jsx_dev_runtime15 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\modals\\\\SettingsModal.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\modals\\SettingsModal.tsx"
  );
  import.meta.hot.lastModified = "1702866516499.5583";
}
var strings2 = {
  title: "Settings",
  theme: "Theme",
  messageDisplay: "Message Display"
};
var SettingsModal = (props) => {
  _s();
  const [settings, updateSettings] = useLocalStorage();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(Modal, { title: strings2.title, ...props, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)("p", { className: "text-sm font-black uppercase dark:text-gray-400", children: strings2.theme }, void 0, false, {
        fileName: "app/modals/SettingsModal.tsx",
        lineNumber: 38,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)("div", { className: "flex space-x-6 mt-2 overflow-x-auto", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(ThemeRadio, { bg: "bg-white", checked: settings.theme === "light", onChange: (e) => {
          if (e.currentTarget.checked) {
            updateSettings({
              theme: "light"
            });
            document.documentElement.classList.remove("dark");
          }
        } }, void 0, false, {
          fileName: "app/modals/SettingsModal.tsx",
          lineNumber: 42,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(ThemeRadio, { bg: "bg-gray-800", checked: settings.theme === "dark", onChange: (e) => {
          if (e.currentTarget.checked) {
            updateSettings({
              theme: "dark"
            });
            document.documentElement.classList.add("dark");
          }
        } }, void 0, false, {
          fileName: "app/modals/SettingsModal.tsx",
          lineNumber: 50,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(ThemeRadio, { bg: "bg-gray-800", checked: !settings.theme, onChange: (e) => {
          if (e.currentTarget.checked) {
            updateSettings({
              theme: void 0
            });
            if (window.matchMedia("(prefers-color-scheme: light)").matches) {
              document.documentElement.classList.remove("dark");
            } else {
              document.documentElement.classList.add("dark");
            }
          }
        }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(CoolIcon, { icon: "Redo", className: "m-auto text-xl text-gray-50" }, void 0, false, {
          fileName: "app/modals/SettingsModal.tsx",
          lineNumber: 71,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/modals/SettingsModal.tsx",
          lineNumber: 59,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/modals/SettingsModal.tsx",
        lineNumber: 41,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/modals/SettingsModal.tsx",
      lineNumber: 37,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)("div", { className: "mt-8", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)("p", { className: "text-sm font-black uppercase dark:text-gray-400", children: strings2.messageDisplay }, void 0, false, {
        fileName: "app/modals/SettingsModal.tsx",
        lineNumber: 76,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)("div", { className: "space-y-2 mt-2", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(Radio, { name: "display", label: "Cozy", checked: !settings.messageDisplay || settings.messageDisplay === "cozy", onChange: (e) => {
          if (e.currentTarget.checked) {
            updateSettings({
              messageDisplay: "cozy"
            });
          }
        } }, void 0, false, {
          fileName: "app/modals/SettingsModal.tsx",
          lineNumber: 80,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(Radio, { name: "display", label: "Compact", checked: settings.messageDisplay === "compact", onChange: (e) => {
          if (e.currentTarget.checked) {
            updateSettings({
              messageDisplay: "compact"
            });
          }
        } }, void 0, false, {
          fileName: "app/modals/SettingsModal.tsx",
          lineNumber: 87,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)(Checkbox, { label: "Show avatars in Compact mode", checked: settings.compactAvatars === true, onChange: (e) => updateSettings({
          compactAvatars: e.currentTarget.checked
        }) }, void 0, false, {
          fileName: "app/modals/SettingsModal.tsx",
          lineNumber: 94,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/modals/SettingsModal.tsx",
        lineNumber: 79,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/modals/SettingsModal.tsx",
      lineNumber: 75,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/modals/SettingsModal.tsx",
    lineNumber: 36,
    columnNumber: 10
  }, this);
};
_s(SettingsModal, "SQTiuRC+6kt5h8Ym2VNj4SoeruA=", false, function() {
  return [useLocalStorage];
});
_c16 = SettingsModal;
var ThemeRadio = ({
  bg,
  checked,
  onChange: onChange2,
  children
}) => /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)("label", { children: [
  /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)("input", { name: "theme", type: "radio", className: "peer", checked, onChange: onChange2, hidden: true }, void 0, false, {
    fileName: "app/modals/SettingsModal.tsx",
    lineNumber: 111,
    columnNumber: 5
  }, this),
  /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)("div", { className: `rounded-full flex ${bg} h-[60px] w-[60px] cursor-pointer peer-checked:cursor-default border border-black/50 dark:border-gray-50/50 peer-checked:border-2 peer-checked:border-blurple`, children }, void 0, false, {
    fileName: "app/modals/SettingsModal.tsx",
    lineNumber: 112,
    columnNumber: 5
  }, this)
] }, void 0, true, {
  fileName: "app/modals/SettingsModal.tsx",
  lineNumber: 110,
  columnNumber: 7
}, this);
_c28 = ThemeRadio;
var _c16;
var _c28;
$RefreshReg$(_c16, "SettingsModal");
$RefreshReg$(_c28, "ThemeRadio");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/components/Header.tsx
var import_jsx_dev_runtime16 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\components\\\\Header.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s2 = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\components\\Header.tsx"
  );
  import.meta.hot.lastModified = "1702942993161.7573";
}
var strings3 = {
  settings: "Settings",
  help: "Help",
  logIn: "Log In"
};
var Header = ({
  user
}) => {
  _s2();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dm = searchParams.get("m");
  const [helpOpen, setHelpOpen] = (0, import_react13.useState)(dm === "help");
  const [settingsOpen, setSettingsOpen] = (0, import_react13.useState)(dm === "settings");
  const logo = /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)("div", { className: "h-9 w-9 my-auto mr-4 bg-[url('/logos/boogiehook.svg')] hover:bg-[url('/logos/boogiehook_star.svg')] bg-cover bg-center" }, void 0, false, {
    fileName: "app/components/Header.tsx",
    lineNumber: 50,
    columnNumber: 16
  }, this);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)("div", { className: "sticky top-0 left-0 z-10 bg-slate-50 dark:bg-[#1E1F22] shadow-md w-full px-4 h-12 flex", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)(HelpModal, { open: helpOpen, setOpen: setHelpOpen }, void 0, false, {
      fileName: "app/components/Header.tsx",
      lineNumber: 52,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)(SettingsModal, { open: settingsOpen, setOpen: setSettingsOpen, user }, void 0, false, {
      fileName: "app/components/Header.tsx",
      lineNumber: 53,
      columnNumber: 7
    }, this),
    location.pathname === "/" ? logo : /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)(Link, { to: "/", className: "my-auto", children: logo }, void 0, false, {
      fileName: "app/components/Header.tsx",
      lineNumber: 54,
      columnNumber: 43
    }, this),
    user ? /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)(Link, { to: "/me", className: "flex my-auto -mx-2 py-1 px-2 rounded hover:bg-gray-200 hover:dark:bg-gray-700 transition", target: location.pathname === "/" ? "_blank" : void 0, children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)("img", { className: "rounded-full h-7 w-7", src: getUserAvatar(user, {
        size: 64
      }), alt: user.name }, void 0, false, {
        fileName: "app/components/Header.tsx",
        lineNumber: 58,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)("p", { className: "ml-1.5 text-base font-medium hidden sm:block my-auto", children: user.discordUser?.globalName ?? getUserTag(user) }, void 0, false, {
        fileName: "app/components/Header.tsx",
        lineNumber: 61,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/Header.tsx",
      lineNumber: 57,
      columnNumber: 15
    }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)(Link, { to: "/auth/discord", className: "flex my-auto -mx-2 py-1 px-2 rounded hover:bg-gray-200 hover:dark:bg-gray-700 transition", target: location.pathname === "/" ? "_blank" : void 0, children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)(CoolIcon, { icon: "Log_Out", className: "text-[28px] text-blurple dark:text-blurple-400 rotate-180", title: strings3.logIn }, void 0, false, {
        fileName: "app/components/Header.tsx",
        lineNumber: 65,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)("p", { className: "ml-1.5 text-base font-medium hidden sm:block my-auto", children: strings3.logIn }, void 0, false, {
        fileName: "app/components/Header.tsx",
        lineNumber: 66,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/Header.tsx",
      lineNumber: 64,
      columnNumber: 19
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)("div", { className: "grow flex overflow-x-auto ml-6", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)(Button, { className: "my-auto mr-2 shrink-0", discordstyle: ButtonStyle.Secondary, onClick: () => setSettingsOpen(true), children: strings3.settings }, void 0, false, {
        fileName: "app/components/Header.tsx",
        lineNumber: 71,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime16.jsxDEV)(Button, { className: "my-auto ml-auto shrink-0", discordstyle: ButtonStyle.Secondary, onClick: () => setHelpOpen(true), children: strings3.help }, void 0, false, {
        fileName: "app/components/Header.tsx",
        lineNumber: 74,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/Header.tsx",
      lineNumber: 70,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/Header.tsx",
    lineNumber: 51,
    columnNumber: 10
  }, this);
};
_s2(Header, "bHQY5ea6av4LBF8dJ56f0sRYrfU=", false, function() {
  return [useLocation, useSearchParams];
});
_c17 = Header;
var _c17;
$RefreshReg$(_c17, "Header");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

export {
  ButtonStyle,
  ComponentType,
  CoolIcon,
  getSnowflakeDate,
  getWebhook,
  getWebhookMessage,
  executeWebhook,
  updateWebhookMessage,
  modifyWebhook,
  cdn,
  Twemoji,
  Button,
  selectClassNames,
  selectStrings,
  StringSelect,
  CUSTOM_EMOJI_RE,
  AuthorType,
  getAuthorType,
  Message,
  MessageComponents,
  require_lib7 as require_lib,
  Modal,
  Checkbox,
  useLocalStorage,
  getUserTag,
  getUserAvatar,
  Header,
  require_session
};
/*! Bundled license information:

react-is/cjs/react-is.development.js:
  (** @license React v16.13.1
   * react-is.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

showdown/dist/showdown.js:
  (*! showdown v 1.9.1 - 02-11-2019 *)

object-assign/index.js:
  (*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  *)

react-modal/lib/helpers/tabbable.js:
  (*!
   * Adapted from jQuery UI core
   *
   * http://jqueryui.com
   *
   * Copyright 2014 jQuery Foundation and other contributors
   * Released under the MIT license.
   * http://jquery.org/license
   *
   * http://api.jqueryui.com/category/ui-core/
   *)

exenv/index.js:
  (*!
    Copyright (c) 2015 Jed Watson.
    Based on code that is Copyright 2013-2015, Facebook, Inc.
    All rights reserved.
  *)

@twemoji/api/dist/twemoji.esm.js:
  (*! Copyright Twitter Inc. and other contributors. Licensed under MIT *)
*/
//# sourceMappingURL=/build/_shared/chunk-CENY6B5C.js.map
