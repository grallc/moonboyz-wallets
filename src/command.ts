import { Client, Guild } from "discord.js"
import User from './models/user.model'
import { hasPermissions } from './checker'

const isValidWallet = (adress: string) => new RegExp(/^0x[a-fA-F0-9]{40}$/).test(adress)

const requiredRole = process.env.REQUIRED_ROLE

if (!requiredRole) {
  throw new Error('Missing the REQUIRED_ROLE env variable!')
}

const initCommands = (bot: Client, guild: Guild) => {
  bot.on('messageCreate', async message => {
    if(message.author.bot) return;

    if(message.channel.type === 'DM') {
      if (!await hasPermissions(guild, message.author.id)) {
        message.author.send(`:negative_squared_cross_mark: You must be in the Presale to do this!`)
        return
      }
      const adress = message.content
      const user = message.author
  
      if (!isValidWallet(adress || '')) {
        user.send(':negative_squared_cross_mark: Invalid ETH wallet adress')
        return
      }
  
      const matchingUser = await User.findOne({ userId: user.id })
      if (matchingUser === null) {
        await new User({
          userId: user.id,
          wallet: adress
        }).save()
      } else {
        matchingUser.wallet = adress
        await matchingUser.save()
      }
      user.send(':white_check_mark: Your ETH wallet adress has been successfully saved, be ready for the launch! :rocket: (send another adress here to update it)')
    } else if (message.content.toLowerCase() === "!wallet") {
      message.delete()
      if (await hasPermissions(guild, message.author.id)) {
        message.author.send('Hi :wave: You can safely send me your ETH Adress here. Please remember we will never ask you for money on Discord!')
        return
      }
    }
  })
}

export default initCommands