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
  entersState,
  NoSubscriberBehavior
} = require("@discordjs/voice");

const play = require("play-dl");
const fs = require("fs");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN || !CLIENT_ID) {
  console.error("❌ TOKEN أو CLIENT_ID غير موجود");
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
   DATABASE
========================= */

const dbFile = "./data.json";

let db = {};

if (fs.existsSync(dbFile)) {
  try {
    db = JSON.parse(
      fs.readFileSync(dbFile, "utf8")
    );
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
   SLASH COMMANDS
========================= */

const commands = [

  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("فحص سرعة البوت"),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("قائمة أوامر البوت"),

  new SlashCommandBuilder()
    .setName("server")
    .setDescription("معلومات السيرفر"),

  new SlashCommandBuilder()
    .setName("user")
    .setDescription("معلومات عضو")
    .addUserOption(o =>
      o
        .setName("member")
        .setDescription("العضو")
        .setRequired(false)
    ),

  /* Games */

  new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("رمي العملة"),

  new SlashCommandBuilder()
    .setName("dice")
    .setDescription("رمي النرد"),

  new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("الكرة السحرية")
    .addStringOption(o =>
      o
        .setName("question")
        .setDescription("السؤال")
        .setRequired(true)
    ),

  /* Economy */

  new SlashCommandBuilder()
    .setName("balance")
    .setDescription("عرض الرصيد")
    .addUserOption(o =>
      o
        .setName("member")
        .setDescription("العضو")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("daily")
    .setDescription("المكافأة اليومية"),

  new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("المتصدرين"),

  /* Moderation */

  new SlashCommandBuilder()
    .setName("warn")
    .setDescription("تحذير عضو")
    .setDefaultMemberPermissions(
      PermissionsBitField.Flags.ModerateMembers
    )
    .addUserOption(o =>
      o
        .setName("member")
        .setDescription("العضو")
        .setRequired(true)
    )
    .addStringOption(o =>
      o
        .setName("reason")
        .setDescription("السبب")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("حذف رسائل")
    .setDefaultMemberPermissions(
      PermissionsBitField.Flags.ManageMessages
    )
    .addIntegerOption(o =>
      o
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
    .addUserOption(o =>
      o
        .setName("member")
        .setDescription("العضو")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("حظر عضو")
    .setDefaultMemberPermissions(
      PermissionsBitField.Flags.BanMembers
    )
    .addUserOption(o =>
      o
        .setName("member")
        .setDescription("العضو")
        .setRequired(true)
    ),

  /* MUSIC */

  new SlashCommandBuilder()
    .setName("play")
    .setDescription("تشغيل أغنية")
    .addStringOption(o =>
      o
        .setName("query")
        .setDescription("اسم الأغنية أو رابط YouTube")
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
    .setDescription("عرض قائمة الانتظار"),

  new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("الأغنية الحالية"),

  new SlashCommandBuilder()
    .setName("volume")
    .setDescription("تغيير الصوت")
    .addIntegerOption(o =>
      o
        .setName("level")
        .setDescription("من 1 إلى 100")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )

].map(x => x.toJSON());

/* =========================
   REGISTER COMMANDS
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

    console.log(
      "✅ تم تسجيل أوامر السيرفر"
    );

  } else {

    await rest.put(
      Routes.applicationCommands(
        CLIENT_ID
      ),
      {
        body: commands
      }
    );

    console.log(
      "✅ تم تسجيل الأوامر عالميًا"
    );
  }
}

/* =========================
   MUSIC SYSTEM
========================= */

const music = new Map();

function getMusic(guildId) {

  if (!music.has(guildId)) {

    const player =
      createAudioPlayer({

        behaviors: {
          noSubscriber:
            NoSubscriberBehavior.Play
        }

      });

    const state = {

      queue: [],

      current: null,

      connection: null,

      player,

      volume: 80

    };

    player.on(
      AudioPlayerStatus.Idle,
      async () => {

        await playNext(
          guildId
        );

      }
    );

    player.on(
      "error",
      error => {

        console.error(
          "❌ Music Error:",
          error.message
        );

        state.current = null;

        playNext(
          guildId
        );
      }
    );

    music.set(
      guildId,
      state
    );
  }

  return music.get(guildId);
}

/* =========================
   VOICE CONNECTION
========================= */

async function connectVoice(member) {

  const channel =
    member.voice.channel;

  if (!channel) {

    throw new Error(
      "ادخل روم صوتي أولًا."
    );
  }

  const connection =
    joinVoiceChannel({

      channelId:
        channel.id,

      guildId:
        channel.guild.id,

      adapterCreator:
        channel.guild
          .voiceAdapterCreator,

      selfDeaf: true

    });

  connection.on(
    "stateChange",
    (oldState, newState) => {

      console.log(
        `🔊 Voice: ${oldState.status} → ${newState.status}`
      );

    }
  );

  await entersState(
    connection,
    VoiceConnectionStatus.Ready,
    30000
  );

  return connection;
}

/* =========================
   PLAY NEXT
========================= */

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

    console.log(
      `🎵 تشغيل: ${song.title}`
    );

    state.current =
      song;

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
          inputType:
            stream.type,

          inlineVolume:
            true
        }
      );

    if (resource.volume) {

      resource.volume.setVolume(
        state.volume / 100
      );
    }

    state.player.play(
      resource
    );

    state.connection.subscribe(
      state.player
    );

  } catch (error) {

    console.error(
      "❌ فشل تشغيل الأغنية:",
      error
    );

    state.current = null;

    if (state.queue.length) {

      await playNext(
        guildId
      );
    }
  }
}

/* =========================
   READY
========================= */

client.once(
  "ready",
  async () => {

    console.log(
      `✅ البوت شغال: ${client.user.tag}`
    );

    try {

      await registerCommands();

    } catch (error) {

      console.error(
        "❌ فشل تسجيل الأوامر:",
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
   WELCOME
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
   XP + !PING
========================= */

client.on(
  "messageCreate",
  message => {

    if (message.author.bot)
      return;

    if (!message.guild)
      return;

    const user =
      getUser(
        message.guild.id,
        message.author.id
      );

    user.xp += 5;

    save();

    if (
      message.content
        .toLowerCase() === "!ping"
    ) {

      message.reply(
        `🏓 Pong! | ${client.ws.ping}ms`
      );
    }
  }
);

/* =========================
   INTERACTIONS
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
              "🎵 موسيقى • 🎮 ألعاب • 💰 اقتصاد • 🛡️ إدارة"
            )

            .addFields(

              {
                name: "🎵 الموسيقى",
                value:
                  "`/play` `/skip` `/stop` `/queue` `/nowplaying` `/volume`"
              },

              {
                name: "🎮 الترفيه",
                value:
                  "`/dice` `/coinflip` `/8ball`"
              },

              {
                name: "💰 الاقتصاد",
                value:
                  "`/balance` `/daily` `/leaderboard`"
              },

              {
                name: "🛡️ الإدارة",
                value:
                  "`/warn` `/clear` `/kick` `/ban`"
              }

            )

            .setColor(
              0x5865F2
            );

        return interaction.reply({
          embeds: [embed]
        });
      }

      /* SERVER */

      if (command === "server") {

        const guild =
          interaction.guild;

        return interaction.reply(
          `📊 **${guild.name}**\n` +
          `👥 الأعضاء: **${guild.memberCount}**\n` +
          `🆔 ID: \`${guild.id}\``
        );
      }

      /* USER */

      if (command === "user") {

        const member =
          interaction.options.getMember(
            "member"
          ) ||
          interaction.member;

        return interaction.reply(
          `👤 **${member.user.username}**\n` +
          `🆔 ${member.id}`
        );
      }

      /* COIN */

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
          `🎲 النرد: **${result}**`
        );
      }

      /* 8 BALL */

      if (command === "8ball") {

        const answers = [

          "نعم ✅",
          "لا ❌",
          "أكيد 🔥",
          "ممكن 🤔",
          "غالبًا نعم ❤️",
          "غالبًا لا ❌",
          "اسألني لاحقًا ⏳"

        ];

        return interaction.reply(
          `🎱 ${
            answers[
              Math.floor(
                Math.random() *
                answers.length
              )
            ]
          }`
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
          `💰 **${member.username}** لديه **${user.coins}** 🪙`
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
          now - user.lastDaily <
          86400000
        ) {

          return interaction.reply(
            "⏳ أخذت مكافأتك اليومية، ارجع بكرة."
          );
        }

        const reward =
          500 +
          Math.floor(
            Math.random() * 501
          );

        user.coins +=
          reward;

        user.lastDaily =
          now;

        save();

        return interaction.reply(
          `🎁 حصلت على **${reward}** 🪙`
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
            "📭 لا توجد بيانات."
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
          `📝 السبب: ${reason}\n` +
          `📊 التحذيرات: ${user.warnings}`
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
          `🧹 تم حذف ${deleted.size} رسالة.`
        );
      }

      /* KICK */

      if (command === "kick") {

        const member =
          interaction.options.getMember(
            "member"
          );

        if (!member)
          return interaction.reply(
            "❌ العضو غير موجود."
          );

        await member.kick();

        return interaction.reply(
          `👢 تم طرد ${member}.`
        );
      }

      /* BAN */

      if (command === "ban") {

        const member =
          interaction.options.getMember(
            "member"
          );

        if (!member)
          return interaction.reply(
            "❌ العضو غير موجود."
          );

        await member.ban();

        return interaction.reply(
          `🔨 تم حظر ${member}.`
        );
      }

      /* =====================
         PLAY
      ===================== */

      if (command === "play") {

        const member =
          interaction.member;

        if (!member.voice.channel) {

          return interaction.reply(
            "🎧 لازم تدخل روم صوتي أولًا."
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

        try {

          if (!state.connection) {

            state.connection =
              await connectVoice(
                member
              );
          }

        } catch (error) {

          console.error(
            "❌ Voice Error:",
            error
          );

          return interaction.editReply(
            "❌ ما قدرت أدخل الروم الصوتي. تأكد أن البوت عنده Connect و Speak."
          );
        }

        let song;

        try {

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

        } catch (error) {

          console.error(
            "❌ YouTube Error:",
            error
          );

          return interaction.editReply(
            "❌ حصلت مشكلة في جلب الأغنية من YouTube."
          );
        }

        state.queue.push(
          song
        );

        const wasPlaying =
          state.current !== null;

        if (!wasPlaying) {

          await playNext(
            interaction.guild.id
          );
        }

        return interaction.editReply(
          `🎵 **تمت إضافة الأغنية**\n\n` +
          `🎶 ${song.title}`
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
          "⏭️ تم تخطي الأغنية."
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

          state.connection =
            null;
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
            "📭 قائمة التشغيل فارغة."
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
          `📜 **قائمة التشغيل**\n\n${list.join("\n")}`
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
            "📭 لا توجد أغنية الآن."
          );
        }

        return interaction.reply(
          `🎵 الآن يتم تشغيل:\n**${state.current.title}**`
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
          `🔊 مستوى الصوت: **${level}%**`
        );
      }

    } catch (error) {

      console.error(
        "❌ Command Error:",
        error
      );

      if (
        interaction.deferred ||
        interaction.replied
      ) {

        await interaction
          .editReply(
            "❌ حدث خطأ أثناء تنفيذ الأمر."
          )
          .catch(() => {});

      } else {

        await interaction
          .reply({
            content:
              "❌ حدث خطأ أثناء تنفيذ الأمر.",
            ephemeral: true
          })
          .catch(() => {});
      }
    }
  }
);

/* =========================
   LOGIN
========================= */

client.login(TOKEN);
