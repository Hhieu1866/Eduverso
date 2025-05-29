import mongoose, { Schema } from "mongoose";

const assignmentSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  instructions: {
    type: String,
    default: "",
  },
  course: {
    type: Schema.ObjectId,
    ref: "Course",
    required: true,
  },
  lesson: {
    type: Schema.ObjectId,
    ref: "Lesson",
    required: false,
  },
  dueDate: {
    type: Date,
    required: false,
  },
  maxFileSize: {
    type: Number,
    default: 10485760, // 10MB
  },
  allowedFileTypes: [
    {
      type: String,
      enum: ["pdf", "doc", "docx", "txt", "jpg", "jpeg", "png"],
    },
  ],
  maxScore: {
    type: Number,
    default: 100,
  },
  isRequired: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft",
  },
  createdBy: {
    type: Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Cập nhật updatedAt trước khi save
assignmentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const Assignment =
  mongoose.models?.Assignment || mongoose.model("Assignment", assignmentSchema);
