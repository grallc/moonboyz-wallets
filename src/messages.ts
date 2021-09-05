import { User as DiscordUser, MessageEmbed } from "discord.js"
import User, { IUser } from './models/user.model'

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

export { sendInfosEmbed, sendMessage }