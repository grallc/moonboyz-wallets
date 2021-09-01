require('dotenv').config()
import { Client, Intents } from 'discord.js'
import initCommand from './command'

(async () => {
  const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
  bot.login(process.env.BOT_TOKEN as string);
  initCommand(bot)
})();