import mongoose, { Schema, model, models, Document } from "mongoose";

export const ROLES = [
  "admin",
  "penginput",
  "peneliti",
  "pengarsip",
  "pengirim",
  "pemeriksa",
] as const;

export const STAGES = [
  "penginputan",
  "penelitian",
  "pengarsipan",
  "pengiriman",
  "pemeriksaan",
] as const;

export type Role = (typeof ROLES)[number];
export type Stage = (typeof STAGES)[number];

export interface IUser extends Document {
  clerkId: string;
  name: string;
  email: string;
  role: Role;
  stages: Stage[];
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
      unique: true,
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
    stages: {
      type: [String],
      enum: STAGES,
    },
  },
  {
    timestamps: true,
  },
);

export const User = models.User || model<IUser>("User", userSchema);
