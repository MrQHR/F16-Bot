const {
  Client,
  GatewayIntentBits,
  Partials,
  PermissionsBitField,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder
} = require("discord.js");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState
} = require("@discordjs/voice");

const play = require("play-dl");
const fs = require("fs");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN || !CLIENT_ID) {
  console.error("❌ TOKEN و CLIENT_ID مطلوبان");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

/* =========================
   قاعدة البيانات
========================= */

const dbFile = "./data.json";

let db = {};

if (fs.existsSync(dbFile)) {
  try {
    db = JSON.parse(fs.readFileSync(dbFile, "utf8"));
  } catch {
    db = {};
  }
}

function save() {
  fs.writeFileSync(
    dbFile,
    JSON.stringify(db, null, 2)
  );
}

function getUser(guildId, userId) {
  db[guildId] ??= {};

  db[guildId][userId] ??= {
    coins: 0,
    xp: 0,
    warnings: 0,
    lastDaily: 0
  };

  return db[guildId][userId];
}

/* =========================
   الأوامر
========================= */

const commands = [

  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("فحص سرعة البوت"),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("عرض جميع أوامر البوت"),

  new SlashCommandBuilder()
    .setName("server")
    .setDescription("معلومات السيرفر"),

  new SlashCommandBuilder()
    .setName("user")
    .setDescription("معلومات عضو")
    .addUserOption(option =>
      option
        .setName("member")
        .setDescription("العضو")
        .setRequired(false)
    ),

  /* الألعاب */

  new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("رمي عملة"),

  new SlashCommandBuilder()
    .setName("dice")
    .setDescription("رمي النرد"),

  new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("الكرة السحرية")
    .addStringOption(option =>
      option
        .setName("question")
        .setDescription("سؤالك")
        .setRequired(true)
    ),

  /* الاقتصاد */

  new SlashCommandBuilder()
    .setName("balance")
    .setDescription("عرض الرصيد")
    .addUserOption(option =>
      option
        .setName("member")
        .setDescription("عضو")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("daily")
    .setDescription("المكافأة اليومية"),

  new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("المتصدرين"),

  /* الإدارة */

  new SlashCommandBuilder()
    .setName("warn")
    .setDescription("تحذير عضو")
    .setDefaultMemberPermissions(
      PermissionsBitField.Flags.ModerateMembers
    )
    .addUserOption(option =>
      option
        .setName("member")
        .setDescription("العضو")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("سبب التحذير")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("حذف رسائل")
    .setDefaultMemberPermissions(
      PermissionsBitField.Flags.ManageMessages
    )
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription("عدد الرسائل")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("طرد عضو")
    .setDefaultMemberPermissions(
      PermissionsBitField.Flags.KickMembers
    )
    .addUserOption(option =>
      option
        .setName("member")
        .setDescription("العضو")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("السبب")
    ),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("حظر عضو")
    .setDefaultMemberPermissions(
      PermissionsBitField.Flags.BanMembers
    )
    .addUserOption(option =>
      option
        .setName("member")
        .setDescription("العضو")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("السبب")
    ),

  new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("إسكات عضو")
    .setDefaultMemberPermissions(
      PermissionsBitField.Flags.ModerateMembers
    )
    .addUserOption(option =>
      option
        .setName("member")
        .setDescription("العضو")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("minutes")
        .setDescription("المدة بالدقائق")
        .setMinValue(1)
        .setMaxValue(10080)
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("السبب")
    ),

  /* الموسيقى */

  new SlashCommandBuilder()
    .setName("play")
    .setDescription("تشغيل أغنية")
    .addStringOption(option =>
      option
        .setName("query")
        .setDescription("اسم الأغنية أو الرابط")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("skip")
    .setDescription("تخطي الأغنية"),

  new SlashCommandBuilder()
    .setName("stop")
    .setDescription("إيقاف الموسيقى"),

  new SlashCommandBuilder()
    .setName("queue")
    .setDescription("قائمة الأغاني"),

  new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("الأغنية الحالية"),

  new SlashCommandBuilder()
    .setName("volume")
    .setDescription("تغيير الصوت")
    .addIntegerOption(option =>
      option
        .setName("level")
        .setDescription("الصوت من 1 إلى 100")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )

].map(command => command.toJSON());

/* =========================
   تسجيل الأوامر
========================= */

const rest = new REST({
  version: "10"
}).setToken(TOKEN);

async function registerCommands() {

  if (GUILD_ID) {

    await rest.put(
      Routes.applicationGuildCommands(
        CLIENT_ID,
        GUILD_ID
      ),
      {
        body: commands
      }
    );

    console.log("✅ تم تسجيل أوامر Slash للسيرفر");

  } else {

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      {
        body: commands
      }
    );

    console.log("✅ تم تسجيل الأوامر عالميًا");
  }
}

/* =========================
   نظام الموسيقى
========================= */

const music = new Map();

function getMusic(guildId) {

  if (!music.has(guildId)) {

    const player = createAudioPlayer();

    const state = {
      queue: [],
      current: null,
      player,
      connection: null,
      volume: 70
    };

    player.on(
      AudioPlayerStatus.Idle,
      () => playNext(guildId)
    );

    player.on(
      "error",
      error => {

        console.error(
          "Music Error:",
          error.message
        );

        playNext(guildId);
      }
    );

    music.set(
      guildId,
      state
    );
  }

  return music.get(guildId);
}

async function connectToVoice(member) {

  const channel = member.voice.channel;

  if (!channel) {
    throw new Error(
      "ادخل روم صوتي أولًا."
    );
  }

  const connection =
    joinVoiceChannel({

      channelId: channel.id,

      guildId: channel.guild.id,

      adapterCreator:
        channel.guild.voiceAdapterCreator,

      selfDeaf: true

    });

  await entersState(
    connection,
    VoiceConnectionStatus.Ready,
    20000
  );

  return connection;
}

async function playNext(guildId) {

  const state =
    music.get(guildId);

  if (!state) return;

  const song =
    state.queue.shift();

  if (!song) {

    state.current = null;

    return;
  }

  try {

    state.current = song;

    const stream =
      await play.stream(
        song.url,
        {
          discordPlayerCompatibility: true
        }
      );

    const resource =
      createAudioResource(
        stream.stream,
        {
          inputType: stream.type,
          inlineVolume: true
        }
      );

    if (resource.volume) {

      resource.volume.setVolume(
        state.volume / 100
      );
    }

    state.player.play(resource);

    state.connection.subscribe(
      state.player
    );

  } catch (error) {

    console.error(error);

    state.current = null;

    playNext(guildId);
  }
}

/* =========================
   تشغيل البوت
========================= */

client.once(
  "ready",
  async () => {

    console.log(
      `✅ تم تشغيل F16-Bot: ${client.user.tag}`
    );

    try {

      await registerCommands();

    } catch (error) {

      console.error(
        "❌ خطأ تسجيل الأوامر:",
        error
      );
    }

    client.user.setActivity(
      "مع العائلة ❤️",
      {
        type: 3
      }
    );
  }
);

/* =========================
   الترحيب
========================= */

client.on(
  "guildMemberAdd",
  member => {

    const channel =
      member.guild.systemChannel;

    if (!channel) return;

    channel.send(
      `👋 أهلًا وسهلًا ${member} في **${member.guild.name}** ❤️`
    );
  }
);

/* =========================
   XP
========================= */

client.on(
  "messageCreate",
  async message => {

    if (message.author.bot) return;

    if (!message.guild) return;

    const user =
      getUser(
        message.guild.id,
        message.author.id
      );

    user.xp += 5;

    save();

    /* الأمر القديم */

    if (
      message.content.toLowerCase()
      === "!ping"
    ) {

      message.reply(
        `🏓 Pong! | ${client.ws.ping}ms`
      );
    }
  }
);

/* =========================
   الأوامر
========================= */

client.on(
  "interactionCreate",
  async interaction => {

    if (!interaction.isChatInputCommand())
      return;

    try {

      const command =
        interaction.commandName;

      /* PING */

      if (command === "ping") {

        return interaction.reply(
          `🏓 Pong! | ${client.ws.ping}ms`
        );
      }

      /* HELP */

      if (command === "help") {

        const embed =
          new EmbedBuilder()

            .setTitle(
              "🤖 بوت العائلة"
            )

            .setDescription(
              "كل شيء تحتاجه في سيرفرك ❤️"
            )

            .addFields(

              {
                name: "🎵 الموسيقى",
                value:
                  "`/play` `/skip` `/stop` `/queue` `/nowplaying` `/volume`"
              },

              {
                name: "💰 الاقتصاد",
                value:
                  "`/balance` `/daily` `/leaderboard`"
              },

              {
                name: "🎮 الترفيه",
                value:
                  "`/coinflip` `/dice` `/8ball`"
              },

              {
                name: "🛡️ الإدارة",
                value:
                  "`/warn` `/clear` `/kick` `/ban` `/timeout`"
              },

              {
                name: "ℹ️ المعلومات",
                value:
                  "`/server` `/user` `/ping`"
              }

            )

            .setColor(0x5865F2);

        return interaction.reply({
          embeds: [embed]
        });
      }

      /* SERVER */

      if (command === "server") {

        const guild =
          interaction.guild;

        return interaction.reply({

          embeds: [

            new EmbedBuilder()

              .setTitle(
                `📊 ${guild.name}`
              )

              .addFields(

                {
                  name: "👥 الأعضاء",
                  value:
                    String(guild.memberCount),
                  inline: true
                },

                {
                  name: "🆔 ID",
                  value: guild.id,
                  inline: true
                },

                {
                  name: "📅 الإنشاء",
                  value:
                    `<t:${Math.floor(
                      guild.createdTimestamp / 1000
                    )}:D>`,
                  inline: true
                }

              )

              .setColor(0x57F287)

          ]

        });
      }

      /* USER */

      if (command === "user") {

        const member =
          interaction.options.getMember(
            "member"
          ) ||
          interaction.member;

        return interaction.reply({

          embeds: [

            new EmbedBuilder()

              .setTitle(
                `👤 ${member.user.username}`
              )

              .setDescription(
                `🆔 ${member.id}\n` +
                `📅 دخل السيرفر: <t:${Math.floor(
                  member.joinedTimestamp / 1000
                )}:R>`
              )

              .setColor(0x5865F2)

          ]

        });
      }

      /* COIN FLIP */

      if (command === "coinflip") {

        const result =
          Math.random() < 0.5
            ? "وجه 🪙"
            : "كتابة 🪙";

        return interaction.reply(
          `🪙 النتيجة: **${result}**`
        );
      }

      /* DICE */

      if (command === "dice") {

        const result =
          Math.floor(
            Math.random() * 6
          ) + 1;

        return interaction.reply(
          `🎲 النتيجة: **${result}**`
        );
      }

      /* 8 BALL */

      if (command === "8ball") {

        const answers = [

          "نعم ✅",
          "لا ❌",
          "ممكن 🤔",
          "أكيد 🔥",
          "لا أعتقد ❌",
          "اسألني لاحقًا ⏳",
          "أكيد نعم ❤️"

        ];

        const answer =
          answers[
            Math.floor(
              Math.random() *
              answers.length
            )
          ];

        return interaction.reply(
          `🎱 **${answer}**`
        );
      }

      /* BALANCE */

      if (command === "balance") {

        const member =
          interaction.options.getUser(
            "member"
          ) ||
          interaction.user;

        const user =
          getUser(
            interaction.guild.id,
            member.id
          );

        return interaction.reply(
          `💰 رصيد **${member.username}**: **${user.coins}** 🪙`
        );
      }

      /* DAILY */

      if (command === "daily") {

        const user =
          getUser(
            interaction.guild.id,
            interaction.user.id
          );

        const now =
          Date.now();

        if (
          now - user.lastDaily
          < 86400000
        ) {

          const remaining =
            86400000 -
            (now - user.lastDaily);

          const hours =
            Math.ceil(
              remaining /
              3600000
            );

          return interaction.reply(
            `⏳ أخذت مكافأتك اليوم. ارجع بعد **${hours} ساعة**.`
          );
        }

        const amount =
          500 +
          Math.floor(
            Math.random() * 501
          );

        user.coins += amount;

        user.lastDaily =
          now;

        save();

        return interaction.reply(
          `🎁 استلمت مكافأتك اليومية: **${amount}** 🪙`
        );
      }

      /* LEADERBOARD */

      if (
        command ===
        "leaderboard"
      ) {

        const guildData =
          db[
            interaction.guild.id
          ] || {};

        const users =
          Object.entries(
            guildData
          )

            .sort(
              (a, b) =>
                (b[1].coins || 0) -
                (a[1].coins || 0)
            )

            .slice(0, 10);

        if (!users.length) {

          return interaction.reply(
            "📭 لا توجد بيانات بعد."
          );
        }

        const list =
          users.map(
            ([id, data], index) =>
              `**${index + 1}.** <@${id}> — ${data.coins} 🪙`
          );

        return interaction.reply(
          `🏆 **المتصدرين**\n\n${list.join("\n")}`
        );
      }

      /* WARN */

      if (command === "warn") {

        const member =
          interaction.options.getMember(
            "member"
          );

        const reason =
          interaction.options.getString(
            "reason"
          );

        const user =
          getUser(
            interaction.guild.id,
            member.id
          );

        user.warnings++;

        save();

        return interaction.reply(
          `⚠️ تم تحذير ${member}\n` +
          `📝 السبب: **${reason}**\n` +
          `⚠️ التحذيرات: **${user.warnings}**`
        );
      }

      /* CLEAR */

      if (command === "clear") {

        const amount =
          interaction.options.getInteger(
            "amount"
          );

        await interaction.deferReply({
          ephemeral: true
        });

        const deleted =
          await interaction.channel.bulkDelete(
            amount,
            true
          );

        return interaction.editReply(
          `🧹 تم حذف **${deleted.size}** رسالة.`
        );
      }

      /* KICK / BAN / TIMEOUT */

      if (
        [
          "kick",
          "ban",
          "timeout"
        ].includes(command)
      ) {

        const member =
          interaction.options.getMember(
            "member"
          );

        const reason =
          interaction.options.getString(
            "reason"
          ) ||
          "بدون سبب";

        if (!member) {

          return interaction.reply(
            "❌ لم أجد العضو."
          );
        }

        if (command === "kick") {

          await member.kick(
            reason
          );
        }

        if (command === "ban") {

          await member.ban({
            reason
          });
        }

        if (
          command ===
          "timeout"
        ) {

          const minutes =
            interaction.options.getInteger(
              "minutes"
            );

          await member.timeout(
            minutes * 60000,
            reason
          );
        }

        return interaction.reply(
          `✅ تم تنفيذ **${command}** على ${member}\n` +
          `📝 السبب: ${reason}`
        );
      }

      /* PLAY */

      if (command === "play") {

        const member =
          interaction.member;

        if (!member.voice.channel) {

          return interaction.reply(
            "🎧 ادخل روم صوتي أولًا."
          );
        }

        await interaction.deferReply();

        const query =
          interaction.options.getString(
            "query"
          );

        const state =
          getMusic(
            interaction.guild.id
          );

        if (!state.connection) {

          state.connection =
            await connectToVoice(
              member
            );
        }

        let song;

        if (
          play.yt_validate(
            query
          ) === "video"
        ) {

          const info =
            await play.video_basic_info(
              query
            );

          song = {

            title:
              info.video_details.title,

            url:
              info.video_details.url

          };

        } else {

          const results =
            await play.search(
              query,
              {
                limit: 1,
                source: {
                  youtube: "video"
                }
              }
            );

          if (!results.length) {

            return interaction.editReply(
              "❌ ما لقيت الأغنية."
            );
          }

          song = {

            title:
              results[0].title,

            url:
              results[0].url

          };
        }

        state.queue.push(
          song
        );

        if (!state.current) {

          await playNext(
            interaction.guild.id
          );
        }

        return interaction.editReply(
          `🎵 تمت إضافة: **${song.title}**`
        );
      }

      /* SKIP */

      if (command === "skip") {

        const state =
          music.get(
            interaction.guild.id
          );

        if (
          !state ||
          !state.current
        ) {

          return interaction.reply(
            "❌ ما فيه أغنية شغالة."
          );
        }

        state.player.stop();

        return interaction.reply(
          "⏭️ تم التخطي."
        );
      }

      /* STOP */

      if (command === "stop") {

        const state =
          music.get(
            interaction.guild.id
          );

        if (!state) {

          return interaction.reply(
            "❌ ما فيه موسيقى."
          );
        }

        state.queue = [];

        state.current = null;

        state.player.stop();

        if (state.connection) {

          state.connection.destroy();

          state.connection = null;
        }

        return interaction.reply(
          "⏹️ تم إيقاف الموسيقى."
        );
      }

      /* QUEUE */

      if (command === "queue") {

        const state =
          music.get(
            interaction.guild.id
          );

        if (
          !state ||
          (
            !state.current &&
            !state.queue.length
          )
        ) {

          return interaction.reply(
            "📭 القائمة فارغة."
          );
        }

        const list = [];

        if (state.current) {

          list.push(
            `🎵 الآن: **${state.current.title}**`
          );
        }

        state.queue
          .slice(0, 10)
          .forEach(
            (song, index) => {

              list.push(
                `${index + 1}. ${song.title}`
              );
            }
          );

        return interaction.reply(
          `📜 **قائمة التشغيل**\n${list.join("\n")}`
        );
      }

      /* NOW PLAYING */

      if (
        command ===
        "nowplaying"
      ) {

        const state =
          music.get(
            interaction.guild.id
          );

        if (
          !state ||
          !state.current
        ) {

          return interaction.reply(
            "📭 ما فيه أغنية شغالة."
          );
        }

        return interaction.reply(
          `🎵 الآن: **${state.current.title}**`
        );
      }

      /* VOLUME */

      if (
        command ===
        "volume"
      ) {

        const state =
          getMusic(
            interaction.guild.id
          );

        const level =
          interaction.options.getInteger(
            "level"
          );

        state.volume =
          level;

        return interaction.reply(
          `🔊 تم ضبط الصوت على **${level}%**.`
        );
      }

    } catch (error) {

      console.error(
        "Command Error:",
        error
      );

      const message =
        "❌ حدث خطأ أثناء تنفيذ الأمر.";

      if (
        interaction.deferred ||
        interaction.replied
      ) {

        await interaction
          .editReply(message)
          .catch(() => {});

      } else {

        await interaction
          .reply({
            content: message,
            ephemeral: true
          })
          .catch(() => {});
      }
    }
  }
);

/* =========================
   تسجيل الدخول
========================= */

client.login(TOKEN);
