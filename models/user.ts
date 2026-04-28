import { Schema, Model, model, models, Document } from "mongoose";
import { ROLES, Role } from "@/lib/constants/constant-user";

export interface IUser extends Document {
  clerkId: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    role: {
      type: String,
      enum: ROLES,
      default: "penginput",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const User: Model<IUser> =
  models.User || model<IUser>("User", userSchema);
