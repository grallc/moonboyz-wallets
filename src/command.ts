import { Client, Guild } from "discord.js"
import User from './models/user.model'
import { hasPermissions } from './checker'

const isValidWallet = (adress: string) => new RegExp(/^0x[a-fA-F0-9]{40}$/).test(adress)

const requiredRole = process.env.REQUIRED_ROLE

if (!requiredRole) {
  throw new Error('Missing the REQUIRED_ROLE env variable!')
}

const channelId = process.env.CHANNEL

if (!channelId) {
  throw new Error('Missing the CHANNEL env variable!')
}

const initCommand = (bot: Client, guild: Guild) => {
  bot.on('messageCreate', async message => {
    if(message.author.bot) return;
    if(message.channel.type !== 'DM') return;
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
    user.send(':white_check_mark: Your ETH wallet adress has been successfully saved, be ready for the launch! :rocket:')
  })
}

export default initCommand