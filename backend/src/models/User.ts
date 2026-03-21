import mongoose, { Model, Schema } from 'mongoose';
import { IUser } from '../types/index';

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: '',
    },
  },
  { timestamps: true } // createdAt & updatedAt
);

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
