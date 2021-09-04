import { Client, Guild, User as DiscordUser, MessageEmbed } from "discord.js"
import User, { IUser } from './models/user.model'
import { hasPermissions } from './checker'

const isValidWallet = (adress: string) => new RegExp(/^0x[a-fA-F0-9]{40}$/).test(adress)
const isValidEmail = (email: string) => new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(email)

const requiredRole = process.env.REQUIRED_ROLE

if (!requiredRole) {
  throw new Error('Missing the REQUIRED_ROLE env variable!')
}

const sendInfosEmbed = async (user: DiscordUser) => {
  const matchingUser = await User.findOne({ userId: user.id }) as IUser | null
  const emailValue = matchingUser !== null && matchingUser.email !== '' ? ':white_check_mark: ' + matchingUser.email : ':no_entry_sign: Not Provided'
  const walletValue = matchingUser !== null && matchingUser.wallet !== '' ? ':white_check_mark: ' + matchingUser.wallet : ':no_entry_sign: Not Provided'

  const infosEmbed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Presale Details')
    .addFields(
      { name: ':rotating_light: We will never ask for your personal information or private adresses (only your email and public ETH Wallet adress)', value: '\u200b' },
      { name: 'Use `!wallet [adress]` (example: `!wallet 0x2Cc52bA898826Efb5ba86dB1E008e80b597b303b`)\n\nthen `!email [email]` (example: `!email yourmail@gmail.com`)\n to provide us your data.', value: '\u200b' },
      { name: 'ETH Wallet Adress (Required)', value: walletValue },
      { name: 'Email Adress (Required)', value: emailValue }
    )
    .setFooter('https://moon-boyz.com', 'https://pbs.twimg.com/profile_images/1431618530915635200/vvvET7nR_400x400.jpg');
  user.send({ embeds: [infosEmbed] })
}

const sendMessage = (user: DiscordUser, message: string) => {
  const infosEmbed = new MessageEmbed()
  .setColor('#0099ff')
  .setTitle('Presale Details')
  .setDescription(message)
  .setFooter('https://moon-boyz.com', 'https://pbs.twimg.com/profile_images/1431618530915635200/vvvET7nR_400x400.jpg');
  user.send({ embeds: [infosEmbed] })
}

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
        message.author.send(`:negative_squared_cross_mark: You must be in the Presale to do this!`)
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