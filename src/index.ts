require('dotenv').config()
import { Client, Intents, Guild } from 'discord.js'
import initCommand from './command'
import mongoose from 'mongoose'
import { checkSavedUsers, hasPermissions } from './checker'

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

  const bot = new Client({ 
    partials: ['CHANNEL'],
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_TYPING],
   })
  bot.login(process.env.BOT_TOKEN as string)
  const guild = await getGuild(bot)
  initCommand(bot, guild)
  await new Promise(resolve => setTimeout(resolve, 3000))
  checkSavedUsers(guild)

}

initApp()