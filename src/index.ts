require('dotenv').config()
import { Client, Intents, Guild } from 'discord.js'
import initCommands from './command'
import mongoose from 'mongoose'
import cron from 'node-cron'
import { checkSavedUsers } from './checker'

const getGuild = async (bot: Client): Promise<Guild> => {
  const serverId = process.env.MAIN_SERVER_ID

  if (!serverId) {
    throw new Error('Missing the MAIN_SERVER_ID env variable!')
  }
  const guilds = await bot.guilds.fetch()
  const guild = guilds.get(serverId)
  if (!guild) {
    throw new Error('Cannot find the main server!')
  }
  return await guild.fetch()
}

const initApp = async () => {
  const dbURI = process.env.DATABASE_URI || ''
  if (!dbURI) {
    throw new Error('Missing DATABASE_URI environement variable !')
  }
  mongoose.connect(dbURI)

  const bot = new Client({
    partials: ['CHANNEL'],
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_TYPING],
  })
  bot.login(process.env.BOT_TOKEN as string)
  const guild = await getGuild(bot)
  initCommands(bot, guild)
  await new Promise(resolve => setTimeout(resolve, 3000))

  checkSavedUsers(guild)
  cron.schedule('0 */2 * * *', () => {
    checkSavedUsers(guild)
  });
}

initApp()