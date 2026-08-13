const {
  Client,
  GatewayIntentBits,
  Events
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once(Events.ClientReady, (bot) => {
  console.log(`✅ تم تشغيل F16-Bot بنجاح`);
  console.log(`🤖 البوت: ${bot.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === "!ping") {
    await message.reply(`🏓 Pong! | سرعة البوت: ${client.ws.ping}ms`);
  }
});

client.login(process.env.TOKEN);
