import { Client, Guild } from "discord.js"

const serverId = process.env.MAIN_SERVER_ID

if (!serverId) {
  throw new Error('Missing the MAIN_SERVER_ID env variable!')
}

const isValidWallet = (adress: string) => new RegExp(/^0x[a-fA-F0-9]{40}$/).test(adress)

const getGuild = async (bot: Client): Promise<Guild> => {
  const guilds = await bot.guilds.fetch()
  const guild = guilds.get(serverId)
  if (!guild) {
    throw new Error('Cannot find the main server!')
  }
  return await guild.fetch()
}

const initCommand = (bot: Client) => {
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
        const adress = interaction.options.get('adress')?.value as string
        if (!isValidWallet(adress || '')) {
          return interaction.reply('Invalid ETH wallet adress')
        }

        interaction.reply('Your ETH wallet adress has successfully been saved!')
      }
    }
  })
}

export default initCommand