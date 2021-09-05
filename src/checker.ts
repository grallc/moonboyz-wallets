import { Guild, GuildMember } from "discord.js";
import User from './models/user.model'
import { sendInfosEmbed } from './messages'

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

  const shouldDeleteUsers = process.env.DELETE_USERS
  if (shouldDeleteUsers == undefined) {
    throw new Error('Missing the DELETE_USERS env variable!')
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

  if (shouldDeleteUsers === 'true') {
    await User.deleteMany({ userId: { $nin: membersId } })
  }

  if (shouldDmUsers === 'true') {
    messageMissingUsers(Array.from(members.values()))
  }
}

const messageMissingUsers = async (users: GuildMember[]) => {
  const usersReady = (await User.find({ $and: [{ wallet: { $ne: "" } }, { email: { $ne: "" } } ]}, { _id: 0, userId: 1 }) as { userId: string}[]).map(user => user.userId)
  const filteredUsers = users.filter(user => !usersReady.includes(user.id))
  filteredUsers.forEach((user) => {
    sendInfosEmbed(user.user)
  })
}

export { checkSavedUsers, hasPermissions }