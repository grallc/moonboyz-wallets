import { Guild, GuildMember } from "discord.js";
import User from './models/user.model'

const hasPermissions = async (guild: Guild, userId: string) => {
  try {
    const requiredRole = process.env.REQUIRED_ROLE || ''
    const user = await guild.members.fetch(userId)
    return user.roles.cache.find(role => role.id === requiredRole)
  } catch {
    return false
  }
}

const checkSavedUsers = async (guild: Guild) => {
  const debugUser = process.env.DEBUG_USER

if (!debugUser) {
  throw new Error('Missing the DEBUG_USER env variable!')
}

const shouldDmUsers = process.env.DM_USERS

if (shouldDmUsers == undefined) {
  throw new Error('Missing the DM_USERS env variable!')
}

  const requiredRole = process.env.REQUIRED_ROLE || ''
  await guild.members.fetch(debugUser)
  const role = await guild.roles.fetch(requiredRole)
  if (role === null) return
  const members = role.members
  const membersId = members.map(member => member.user.id)
  await User.deleteMany({ userId: { $nin: membersId }})

  if (shouldDmUsers === 'true') {
    messageMissingUsers(Array.from(members.values()))
  }
}

const messageMissingUsers = async (users: GuildMember[]) => {
  users.forEach((user) => {
    user.send(`Hey, you're in the Moonboys Presale but you still haven't sent us your ETH Wallet Adress!\nPlease reply here with your ETH Adress to be sure to be added to the Whitelist.`)
  })
}

export { checkSavedUsers, hasPermissions }