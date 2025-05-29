import mongoose, { Schema } from "mongoose";

const courseSchema = new Schema({
  title: {
    required: true,
    type: String,
  },
  subtitle: {
    type: String,
    default: "subtitle",
  },
  description: {
    required: true,
    type: String,
  },
  thumbnail: {
    type: String,
  },
  thumbnailUrl: {
    type: String,
  },
  modules: [{ type: Schema.ObjectId, ref: "Module" }],

  price: {
    required: true,
    default: 0,
    type: Number,
  },
  active: {
    required: true,
    default: false,
    type: Boolean,
  },
  status: {
    type: String,
    enum: ["draft", "pending", "approved", "rejected"],
    default: "draft",
  },
  rejectionReason: {
    type: String,
    default: "",
  },
  category: { type: Schema.ObjectId, ref: "Category" },

  instructor: { type: Schema.ObjectId, ref: "User" },

  testimonials: [{ type: Schema.ObjectId, ref: "Testimonial" }],

  quizSet: {
    type: Schema.ObjectId,
  },
  essayIds: [{ type: Schema.ObjectId, ref: "Essay" }],
  learning: {
    type: [String],
  },
  createdOn: {
    required: true,
    default: Date.now(),
    type: Date,
  },
  modifiedOn: {
    required: true,
    default: Date.now(),
    type: Date,
  },
});

export const Course =
  mongoose.models?.Course || mongoose.model("Course", courseSchema);
