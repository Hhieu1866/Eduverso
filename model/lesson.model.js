import mongoose, { Schema } from "mongoose";

const lessonSchema = new Schema({
  title: {
    required: true,
    type: String,
  },
  description: {
    required: false,
    type: String,
  },
  duration: {
    required: true,
    default: 0,
    type: Number,
  },
  content_type: {
    required: true,
    default: "video",
    type: String, // "video" hoặc "text"
    enum: ["video", "text"],
  },
  video_url: {
    required: false,
    type: String,
  },
  text_content: {
    required: false,
    type: String,
  },
  active: {
    required: true,
    default: false,
    type: Boolean,
  },
  slug: {
    required: true,
    type: String,
  },
  access: {
    required: true,
    default: "private",
    type: String,
  },
  order: {
    required: true,
    type: Number,
  },
  documents: [
    {
      name: { type: String, required: false },
      fileUrl: { type: String, required: false },
      fileType: { type: String, required: false },
      fileSize: { type: Number, required: false },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
});

export const Lesson =
  mongoose.models?.Lesson || mongoose.model("Lesson", lessonSchema);
