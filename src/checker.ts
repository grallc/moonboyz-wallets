import { Guild } from "discord.js";
import User from './models/user.model'

const debugUser = process.env.DEBUG_USER

if (!debugUser) {
  throw new Error('Missing the DEBUG_USER env variable!')
}

const checkSavedUsers = async (guild: Guild) => {
  const requiredRole = process.env.REQUIRED_ROLE || ''
  await guild.members.fetch(debugUser)
  const role = await guild.roles.fetch(requiredRole)
  if (role === null) return
  const members = role.members.map(member => member.user.id)
  await User.deleteMany({ userId: { $nin: members }})
}

export default checkSavedUsers