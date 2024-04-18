import { Resource } from "i18next";

export const resources = {
  en: {
    translation: {
      // Menu
      settings: "Settings",
      help: "Help",
      logIn: "Log In",
      logOut: "Log Out",
      name: "Name",
      save: "Save",
      edit: "Edit",
      delete: "Delete",
      editBackupTitle: "Edit Backup Details",
      editBackupMessages:
        "To edit the messages in a backup, click the <0/> button.",
      saveMessageTitle: "Save Message",
      temporaryShareUrl: "Temporary Share URL",
      shareExpired: "Invalid Share Link",
      generate: "Generate",
      copy: "Copy",
      copyLink: "Copy Link",
      clickGenerate: 'Press "Generate" to generate a share link',
      includeWebhookUrls: "Include webhook URLs",
      linkExpiresAt: "This link expires at {{time}} ({{relativeTime}}).",
      options: "Options",
      manageBackups: "Visit your user page to manage backups.",
      logInToSaveBackups: "Log in to save permanent backups.",
      savedAutomatically: "Saved automatically",
      saveBackup: "Save Backup",
      send: "Send",
      sendToAll: "Send to All",
      sendAll: "Send All",
      sendNoMessages: "You have no messages to send.",
      willBeEdited: "This message has a reference set, so it will be edited.",
      skippedEdit: "Skipped edit due to mismatched webhook ID.",
      submitResultTitle: "Submit Result",
      success: "Success",
      error: "Error",
      fullError: "Full Error:",
      messageDetails: "Message Details",
      messageId: "Message ID: <0/>",
      channelId: "Channel ID: <0/>",
      guildId: "Server ID: <0/>",
      createdAt: "Created at: {{createdAt}}",
      successResultTroubleshoot:
        "If you cannot see the message, make sure it wasn't deleted by another bot. Some moderation bots consider all webhook messages to be spam by default.",
      theme: "Theme",
      messageDisplay: "Message Display",
      editorPanes: "Editor Panes",
      webhookUrl: "Webhook URL",
      invalidWebhookUrl:
        "Invalid webhook URL. They start with https://discord.com/api/webhooks/...",
      createdAtBy: "Created {{createdAt}} by {{username}}",
      someone: "someone",
      addWebhook: "Add Webhook",
      createWebhook: "Create Webhook",
      editWebhook: "Edit Webhook",
      createdByDiscohook: "This webhook is owned by Discohook",
      selectWebhookGuildNote:
        "Select a server that Discohook Utils is in to view its webhooks, or create a new webhook in any of your servers by clicking the button below.",
      selectWebhookGuildNoWebhooks:
        "The server you selected has no webhooks that Discohook Utils could access. Try creating a new one with the button below.",
      selectWebhookGuildMissing:
        "Not seeing a server you have permissions in? <0>Try logging in again</0>",
      selectWebhookGuildManual:
        "You may also <0>input a webhook URL manually</0> (advanced)",
      editor: "Editor",
      preview: "Preview",
      previewAll: "Preview All",
      saveMessage: "Save Message",
      addMessage: "Add Message",
      editResource: "Edit {{0}}",
      removeResource: "Remove {{0}}",
      use: "Use",
      embedExample: "Example",
      previewInfo: "Preview Info",
      editingBackupNote:
        'You\'re editing a backup, so your work is saved periodically while you edit. In order to share this message with others, use the "Save Message" button.',
      editingLinkBackupNote:
        "You're editing a backup, so your work is saved periodically while you edit.",
      channel: "Channel",
      webhookChannelMentionAndThreads: "<#{{0}}> (and its threads)",
      cannotChangeChannel: "Webhook channel must be set inside Discord.",
      requestedBy: "Requested on Discohook by {{username}}",
      resetAvatar: "Remove",
      webhookCreated: "Webhook Created",
      webhookCreateFailed: "Failed to create webhook",
      webhookCreateSubtitle: "You should be returned to the editor shortly.",
      profile: "Profile",
      linkEmbeds: "Link Embeds",
      backups: "Backups",
      noBackups: "You haven't created any backups.",
      import: "Import",
      importBackups: "Import Backups",
      export: "Export",
      exportBackups: "Export Backups",
      exportBackupsNote:
        "This menu is for exporting backup files to your computer. This is not really necessary, but it's a great way to copy your messages offline or for use with other bots. Your schedule setup, if any, will only be exported for repeating schedules.",
      version: "Version: {{version}}",
      shareLinks: "Share Links",
      noLinks: "You haven't created any share links.",
      id: "ID: {{id}}",
      noShareLinkData:
        "Share link data is not kept after expiration. If you need to permanently store a message, use <backups>Backups</backups> instead.",
      subscribedSince: "Subscribed Since",
      notSubscribed: "Not subscribed",
      firstSubscribed: "First Subscribed",
      never: "Never",
      joinedDiscohook: "Joined Discohook",
      linkEmbedsPremiumNote:
        "You've uncovered a Deluxe feature! <0>Read more about link embeds here.</0>",
      donate: "Donate",
      deluxe: "Deluxe",
      lifetime: "Lifetime",
      graceRemaining_one: "{{count}} day remaining",
      graceRemaining_other: "{{count}} days remaining",
      server_one: "Server",
      server_other: "Servers",
      noServers: "You don't appear to share any servers with Discohook Utils.",
      inviteBot: "Invite Bot",
      schedule: "Schedule",
      scheduleSendAll: "Schedule All",
      scheduleBackup: "Schedule this backup",
      repeating: "Repeating",
      day: "Day",
      time: "Time ({{timezone}})",
      month: "Month",
      everyMonth: "Every month",
      dayOfMonth: "Day of Month",
      everyDayOfMonth: "Any day of the month",
      weekday: "Weekday",
      everyWeekday: "Any weekday",
      hourTime: "Hour ({{timezone}})",
      minute: "Minute",
      scheduleFrequencyNote: [
        "Scheduled backups can be no sooner than 2 hours apart from each",
        'other. To reset a field to "Every month/day/weekday," remove all',
        "chosen options.",
      ].join(" "),
      havingTrouble: "Having Trouble?",
      troubleshootMessage: [
        "If you press the send button and nothing happens, it may be because",
        "your browser is blocking connections to Discord, which is not",
        "uncommon for privacy-focused extensions like Privacy Badger. Try",
        "disabling privacy extensions or entering incognito/private mode.",
      ].join(" "),
      // Editor
      rowEmpty: "Must contain at least one component (button/select)",
      labelEmpty: "Must have a label or emoji, or both",
      urlEmpty: "Link button must have a URL",
      optionsEmpty: "Must contain at least one select option",
      embedEmpty: "Must contain text or an image",
      embedsTooLarge:
        "Embeds must contain at most 6000 characters total (currently {{count}} too many)",
      history: "History",
      noHistory: "This editor session has no history recorded.",
      historyDescription:
        'This is cleared whenever the editor is loaded. If you need to store messages persistently, use the "Save Message" button.',
      resetEditor: "Reset Editor",
      resetEditorWarning: "Click to confirm",
      resetFinished: "Reset Finished",
      nMessage_one: "{{count}} message",
      nMessage_other: "{{count}} messages",
      nEmbed_one: "{{count}} embed",
      nEmbed_other: "{{count}} embeds",
      historyRestore: "Restore to this point",
      historyRemove: "Remove from history",
      // Preview
      defaultPlaceholder: "Make a selection",
      todayAt: "Today at {{time}}",
      timestamp: {
        time: "{{ date, h:mm a }}",
        time_verbose: "{{ date, h:mm:ss A }}",
        full: "{{ date, MMMM D, YYYY h:mm A }}",
        full_verbose: "{{ date, dddd, MMMM D, YYYY h:mm:ss A }}",
        date: "{{ date, MM/DD/YYYY }}",
        date_verbose: "{{ date, MMMM D, YYYY }}",
        relative: {
          seconds_future: "in {{count}} seconds",
          seconds_past: "{{count}} seconds ago",
          minutes_future_one: "in a minute",
          minutes_future_other: "in {{count}} minutes",
          minutes_past_one: "a minute ago",
          minutes_past_other: "{{count}} minutes ago",
          hours_future_one: "in an hour",
          hours_future_other: "in {{count}} hours",
          hours_past_one: "an hour ago",
          hours_past_other: "{{count}} hours ago",
          days_future_one: "in a day",
          days_future_other: "in {{count}} days",
          days_past_one: "a day ago",
          days_past_other: "{{count}} days ago",
          months_future_one: "in a month",
          months_future_other: "in {{count}} months",
          months_past_one: "a month ago",
          months_past_other: "{{count}} months ago",
          years_future_one: "in a year",
          years_future_other: "in {{count}} years",
          years_past_one: "a year ago",
          years_past_other: "{{count}} years ago",
        },
        footer: {
          yesterday: "Yesterday at {{ date, h:mm A }}",
          today: "Today at {{ date, h:mm A }}",
          tomorrow: "Tomorrow at {{ date, h:mm A }}",
          other: "{{ date, MM/DD/YYYY h:mm A }}",
        },
      },
    },
  },
  "en-GB": {
    translation: {
      timestamp: {
        time: "{{ date, H:mm }}",
        time_verbose: "{{ date, H:mm:ss }}",
        full: "{{ date, D MMMM YYYY H:mm }}",
        full_verbose: "{{ date, dddd, D MMMM YYYY H:mm:ss }}",
        date: "{{ date, DD/MM/YYYY }}",
        date_verbose: "{{ date, D MMMM YYYY }}",
      },
    },
  },
  zh: {
    translation: {
      settings: "设置",
      help: "帮助",
      logIn: "登入",
      logOut: "登出",
      name: "名称",
      save: "保存",
      edit: "编辑",
      delete: "删除",
      editBackupTitle: "编辑备份详情",
      editBackupMessages: "编辑备份中的信息，请点击 <0/> 按钮。",
      saveMessageTitle: "保存信息",
      temporaryShareUrl: "临时共享链接",
      generate: "生成",
      copy: "复制",
      copyLink: "复制链接",
      clickGenerate: "点击 ”生成“ 以生成共享链接",
      includeWebhookUrls: "包含 Webhook 链接",
      linkExpiresAt: "此链接将在 {{time}} ({{relativeTime}}) 到期。",
      options: "选项",
      manageBackups: "访问您的用户页面以管理备份。",
      logInToSaveBackups: "登录以保存永久备份",
      saveBackup: "保存新的备份",
      send: "发送",
      sendToAll: "发送消息至多个 Webhook。",
      sendAll: "发送多个消息至任意数量的 Webhook",
      sendNoMessages: "您没有要发送的消息。",
      willBeEdited: "此消息已设置引用，将进行编辑。",
      skippedEdit: "编辑跳过，因为 Webhook ID 不匹配。.",
      submitResultTitle: "发送结果",
      success: "成功",
      error: "Error",
      fullError: "Full Error:",
      messageDetails: "消息详情",
      messageId: "消息 ID: <0/>",
      channelId: "频道 ID: <0/>",
      guildId: "服务器 ID: <0/>",
      createdAt: "创建于: {{createdAt}}",
      successResultTroubleshoot:
        "如果您无法看到消息，请确保它未被其他机器人删除。某些管理型机器人默认将所有 Webhook 消息视为垃圾邮件。",
      theme: "主题",
      messageDisplay: "消息显示",
      webhookUrl: "Webhook 链接",
      invalidWebhookUrl:
        "无效的 Webhook 链接。它们以 https://discord.com/api/webhooks/... 开头。",
      createdAtBy: "创建于 {{createdAt}} 由 {{username}}   ",
      someone: "某人",
      addWebhook: "添加 Webhook",
      editor: "编辑器",
      preview: "预览",
      channel: "频道",
      profile: "Webhook 资料",
      backups: "备份",
      noBackups: "您尚未创建任何备份。",
      import: "导入",
      importBackups: "导入备份",
      exportBackups: "导出备份",
      version: "版本号: {{version}}",
      shareLinks: "分享链接",
      noLinks: "您尚未创建任何分享链接。",
      id: "ID: {{id}}",
      noShareLinkData:
        "分享链接数据在过期后不会被保留。 如果您需要永久存储消息，请改用<backups>备份</backups>",
      donate: "捐赠",
      server_one: "服务器",
      server_other: "多个服务器",
      inviteBot: "添加机器人",
      embedEmpty: "必须包含文本或图像",
      embedsTooLarge: "内容共不能超过6000个字符 (当前多了 {{count}} 个)",
      resetEditor: "重置编辑器",
      resetEditorWarning: "点击以确认",
      resetFinished: "重置完成",
      todayAt: "今天 {{time}}",
    },
  },
  ar: {
    translation: {
      settings: "الإعدادات",
      help: "المساعدة",
      logIn: "تسجيل الدخول",
      logOut: "تسجيل الخروج",
      name: "الإسم",
      save: "حفظ",
      edit: "تعديل",
      delete: "مسح",
      editBackupTitle: "تعديل تفاصيل النسخة الاحتياطية",
      editBackupMessages: "<0/> لتعديل الرسالة داخل النسخة الاحتياطية, اضغط زر",
      saveMessageTitle: "حفظ الرسالة",
      temporaryShareUrl: "لينك المشاركة المؤقت",
      generate: "انتاج",
      copy: "نسخ",
      copyLink: "نسخ اللينك",
      clickGenerate: 'اضغط "انتاج" لإنشاء لينك مشاركة جديد',
      includeWebhookUrls: "شمل لينكات الويبهوك",
      linkExpiresAt: "({{relativeTime}}) {{time}} هذا اللينك ينتهي في",
      options: "الإختيارات",
      manageBackups: "قم بزيارة صفحنك الشخصية لإدارة النسخ الاحتياطية",
      logInToSaveBackups: "قم بتسجيل الدخول لحفظ نسخ احتياطية دائمة",
      saveBackup: "حفظ نسخة احتياطية جديدة",
      send: "ارسال",
      sendToAll: "ارسال الرسالة لكل  لينكات الويبهوك",
      sendAll: "ارسال جميع الرسائل",
      sendNoMessages: "لا يوجد لديك رسائل لإرسالها",
      willBeEdited: "سيتم تعديل هذه الرسالة بسبب وجود مقابل لها",
      skippedEdit: "لم يتم التعديل بسبب لينك ويبهوك خطأ",
      submitResultTitle: "نتيجة الإرسال",
      success: "نجاح",
      error: "فشل",
      fullError: "خطأ كامل",
      messageDetails: "تفاصيل الرسالة",
      messageId: "<0/> :اي دي الرسالة",
      channelId: "<0/> :اي دي التشانل",
      guildId: "<0/> :اي دي السيرفر",
      createdAt: "{{createdAt}} :تم الإنشاء في",
      successResultTroubleshoot:
        "اذا لم يمكنك رؤية الرسالة, تأكد انها لم تمسح من قبل بوت آخر. بعض البوتات الإدارية تعتبر كل رسائل الويبهوك ضارة",
      theme: "السمة",
      messageDisplay: "وضع ظهور الرسائل",
      addTargetModalTitle: "اضافة ويبهوك",
      webhookUrl: "لينك الويبهوك",
      invalidWebhookUrl:
        "https://discord.com/api/webhooks/... :لينك الويبهوك خطأ, يجب ان يبدأ ب ",
      createdAtBy: "{{username}} :بواسطة {{createdAt}} :تم الإنشاء في ",
      someone: "شخص مجهول",
      addWebhook: "اضافة ويبهوك",
      editor: "المحرر",
      preview: "عرض مسبق",
      channel: "التشانل",
      profile: "الصفحة الشخصية",
      backups: "النسخ الإحتياطية",
      noBackups: "لم يتم انشاء اي نسخ احتياطية",
      import: "استيراد",
      importBackups: "استيراد نسخ احتياطية",
      exportBackups: "تصدير نسخ احتياطية",
      version: "{{version}} :رقم النسخة",
      shareLinks: "لينكات المشاركة",
      noLinks: "لم يتم انشاء اي لينكات مشاركة",
      id: "{{id}} :اي دي",
      noShareLinkData:
        "<backups> النسخ الإحتياطية </backups>سيتم مسح الرسالة في حالة انتهاء وقت لينك المشاركة هذا, لحفظ رسالة للأبد استخدم ",
      donate: "تبرع",
      server_one: "سيرفر",
      server_other: "سيرفرات",
      inviteBot: "اضافة البوت",
      embedEmpty: "لا يمكن ترك الرسالة فارغة",
      embedsTooLarge:
        "حروف اكثر من اللازم {{count}} لا يمكن ان تحتوي الرسالة على اكثر من 6000 حرف, حاليا لديك",
      resetEditor: "أعادة ضبط المحرر",
      resetEditorWarning: "اضغط للتأكيد",
      resetFinished: "تم إعادة الضبط",
      todayAt: "{{time}} اليوم في",
      timestamp: {
        time: "{{ date, h:mm a }}",
        time_verbose: "{{ date, h:mm:ss A }}",
        full: "{{ date, MMMM D, YYYY h:mm A }}",
        full_verbose: "{{ date, dddd, MMMM D, YYYY h:mm:ss A }}",
        date: "{{ date, DD/MM/YYYY }}",
        date_verbose: "{{ date, MMMM D, YYYY }}",
        relative: {
          seconds_future: "بعد {{count}} ثواني ",
          seconds_past: "منذ {{count}} ثواني",
          minutes_future_one: "بعد دقيقة واحدة",
          minutes_future_other: "بعد {{count}} دقائق",
          minutes_past_one: "منذ دقيقة واحدة",
          minutes_past_other: "منذ {{count}} دقائق",
          hours_future_one: "بعد ساعة واحدة",
          hours_future_other: "بعد {{count}} ساعات",
          hours_past_one: "منذ ساعة واحدة",
          hours_past_other: "منذ {{count}} ساعات",
          days_future_one: "بعد يوم واحد",
          days_future_other: "بعد {{count}} ايام",
          days_past_one: "منذ يوم واحد",
          days_past_other: "منذ {{count}} ايام",
          months_future_one: "بعد شهر واحد",
          months_future_other: "بعد {{count}} شهور",
          months_past_one: "منذ شهر واحد",
          months_past_other: "منذ {{count}} شهور",
          years_future_one: "بعد سنة واحدة",
          years_future_other: "بعد {{count}} سنوات",
          years_past_one: "منذ سنة واحدة",
          years_past_other: "منذ {{count}} سنوات",
        },
        footer: {
          yesterday: " أمس في {{ date, h:mm A }}",
          today: "اليوم في {{ date, h:mm A }}",
          tomorrow: "غدا في {{ date, h:mm A }}",
          other: "{{ date, DD/MM/YYYY h:mm A }}",
        },
      },
    },
  },
  de: {
    translation: {
      defaultPlaceholder: "Triff eine Auswahl",
      donate: "Spenden",
      todayAt: "heute um {{time}} Uhr",
    },
  },
  it: {
    translation: {
      defaultPlaceholder: "Seleziona",
    },
  },
  es: {
    translation: {
      defaultPlaceholder: "Haz una selección",
      todayAt: "hoy a las {{time}}",
    },
  },
  se: {
    translation: {
      defaultPlaceholder: "Gör ett val",
    },
  },
  ne: {
    translation: {
      defaultPlaceholder: "Maak een selectie",
    },
  },
  fr: {
    translation: {
      settings: "Paramètres",
      help: "Aide",
      name: "Nom",
      save: "Enregistrer",
      embedExample: "Exemple",
      editBackupTitle: "Modifier les détails de la sauvegarde",
      editBackupMessages:
        "Pour modifier les messages d'une sauvegarde, cliquez sur le bouton <0/>.",
      resetAvatar: "Supprimer",
      donate: "Faire un don",
      defaultPlaceholder: "Fais un choix",
      todayAt: "Aujourd’hui à {{time}}",
    },
  },
} satisfies Resource;

export type i18nResources = typeof resources;
