import { Client, Guild } from "discord.js"
import { ApplicationCommandPermissionTypes } from "discord.js/typings/enums"
import User from './models/user.model'
const isValidWallet = (adress: string) => new RegExp(/^0x[a-fA-F0-9]{40}$/).test(adress)

const requiredRole = process.env.REQUIRED_ROLE

if (!requiredRole) {
  throw new Error('Missing the REQUIRED_ROLE env variable!')
}

const initCommand = (bot: Client, guild: Guild) => {
  bot.on('ready', async () => {
    if (guild) {
      await guild.commands.create({
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
  
  bot.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
      if (interaction.commandName === 'wallet') {
        const adress = interaction.options.get('adress')?.value as string
        if (!isValidWallet(adress || '')) {
          return interaction.reply('Invalid ETH wallet adress')
        }

        const user = await guild.members.fetch(interaction.user.id)
        if (!user || !user.roles.cache.get(requiredRole)) {
          return interaction.reply('You must be in the presale to do this!')
        }
        
        const matchingUser = await User.findOne({ userId: interaction.user.id })
        if (matchingUser === null) {
          await new User({
            userId: interaction.user.id,
            wallet: adress
          }).save()
        } else {
          matchingUser.wallet = adress
          await matchingUser.save()
        }
        interaction.reply('Your ETH wallet adress has been successfully saved!')
      }
    }
  })
}

export default initCommand