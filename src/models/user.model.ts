import mongoose, { Document, Types, Schema } from 'mongoose'

delete mongoose.connection.models.User

const UserSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  wallet: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  email: {
    type: String,
    default: ''
  }
})

export interface IUser extends Document {
  _id: Types.ObjectId;
  userId: string;
  wallet: string;
  email: string;
}

const User = mongoose.model<IUser>('User', UserSchema)

export default (mongoose.models.User || User)
