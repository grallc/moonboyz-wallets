require('dotenv').config()
import { Client, Intents, Guild} from 'discord.js'

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

(async () => {
  const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
  bot.login(process.env.BOT_TOKEN as string);

  bot.on('ready', async () => {
    const guild = await getGuild(bot)
    if (guild) {
      guild.commands.create({
        description: 'Whitelists your ETH adress for the Presale',
        name: 'wallet',
        options: [{
          name: "adress",
          required: true,
          type: 'STRING',
          description: 'Your ETH Wallet adress'
        }]
      })
    }
  })
  
  bot.on('interactionCreate', interaction => {
    if (interaction.isCommand()) {
      if (interaction.commandName === 'wallet') {
        interaction.reply('received ping')
      }
    }
  })
})();