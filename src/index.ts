require('dotenv').config()
import { Client, Intents, Guild } from 'discord.js'
import initCommand from './command'
import mongoose from 'mongoose'

const serverId = process.env.MAIN_SERVER_ID

if (!serverId) {
  throw new Error('Missing the MAIN_SERVER_ID env variable!')
}

const getGuild = async (bot: Client): Promise<Guild> => {
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

  const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
  bot.login(process.env.BOT_TOKEN as string);
  initCommand(bot, await getGuild(bot))
}

initApp()