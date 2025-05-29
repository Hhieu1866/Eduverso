import mongoose, { Schema } from "mongoose";
import { dbConnect } from "@/service/mongo";

const userSchema = new Schema({
  firstName: {
    required: true,
    type: String,
  },
  lastName: {
    required: true,
    type: String,
  },
  password: {
    required: true,
    type: String,
  },
  email: {
    required: true,
    type: String,
  },
  role: {
    required: true,
    type: String,
  },
  phone: {
    required: false,
    type: String,
  },
  bio: {
    required: false,
    type: String,
    default: "",
  },
  socialMedia: {
    required: false,
    type: Object,
  },

  profilePicture: {
    required: false,
    type: String,
  },
  designation: {
    required: false,
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.models?.User || mongoose.model("User", userSchema);
