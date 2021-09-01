import mongoose, { Document, Types, Schema } from 'mongoose'

delete mongoose.connection.models.User

const UserSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  wallet: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export interface IUser extends Document {
  _id: Types.ObjectId;
  userId: string;
  wallet: string;
}

const User = mongoose.model<IUser>('User', UserSchema)

export default (mongoose.models.User || User)
