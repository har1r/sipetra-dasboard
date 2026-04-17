import mongoose, { Schema, model, models, Document } from "mongoose";

type Role =
  | "penginput"
  | "peneliti"
  | "pengarsip"
  | "pengirim"
  | "pemeriksa"
  | "admin";

type Stage =
  | "penginputan"
  | "penelitian"
  | "pengarsipan"
  | "pengiriman"
  | "pemeriksaan";

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
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: [
        "admin",
        "penginput",
        "peneliti",
        "pengarsip",
        "pengirim",
        "pemeriksa",
      ],
      default: "penginput",
      required: true,
    },
    stages: {
      type: [String],
      enum: [
        "penginputan",
        "penelitian",
        "pengarsipan",
        "pengiriman",
        "pemeriksaan",
      ],
      default: ["penginputan"],
    },
  },
  {
    timestamps: true,
  },
);

export const User = models.User || model<IUser>("User", userSchema);
