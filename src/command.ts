import { Client, Guild } from "discord.js"
import User from './models/user.model'
import { hasPermissions } from './checker'
import { sendMessage, sendInfosEmbed } from './messages'

const isValidWallet = (adress: string) => new RegExp(/^0x[a-fA-F0-9]{40}$/).test(adress)
const isValidEmail = (email: string) => new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(email)

const updateData = async (userId: string, field: 'email' | 'wallet', value: string) => {
  const matchingUser = await User.findOne({ userId })
  if (matchingUser === null) {
    await new User({
      userId,
      [field]: value
    }).save()
  } else {
    matchingUser[field] = value
    await matchingUser.save()
  }
}

const initCommands = (bot: Client, guild: Guild) => {
  bot.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.channel.type === 'DM') {
      if (!await hasPermissions(guild, message.author.id)) {
        message.author.send(`:negative_squared_cross_mark: You must be in the Presale to do this!`).catch(e => {
          console.log(`Failed to send a message to ${message.author.id}/${message.author.username}#${message.author.discriminator} (3)`)
        })
        return
      }
      const user = message.author
      const splittedMessage = message.content.split(' ')
      const command = splittedMessage[0].toLowerCase()

      if (command === '!wallet') {
        const adress = splittedMessage[1]
        if (!isValidWallet(adress || '')) {
          sendMessage(user ,':negative_squared_cross_mark: Invalid ETH wallet adress')
          return
        }
        await updateData(user.id, 'wallet', adress)
      } else if (command === '!email') {
        const email = splittedMessage[1]
        if (!isValidEmail(email || '')) {
          sendMessage(user, ':negative_squared_cross_mark: Invalid email adress')
          return
        }
        await updateData(user.id, 'email', email)
      }
      sendInfosEmbed(user)
    } else if (message.content.toLowerCase() === "!wallet") {
      message.delete()
      if (await hasPermissions(guild, message.author.id)) {
        sendMessage(message.author, 'Hi :wave: You can safely send me your ETH Adress here. Please remember we will never ask you for money on Discord!\n\nUse `!wallet [adress]` (example: `!wallet 0x2Cc52bA898826Efb5ba86dB1E008e80b597b303b`)\n\nthen `!email [email]` (example: `!email yourmail@gmail.com`)\n to provide us your data.')
        return
      }
    }
  })
}

export default initCommands