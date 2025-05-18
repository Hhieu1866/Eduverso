import mongoose, { Schema } from "mongoose";

const quizzesSchema = new Schema({
  title: {
    required: true,
    type: String,
  },
  description: {
    type: String,
  },
  slug: {
    type: String,
  },
  explanations: {
    type: String,
  },
  options: {
    type: Array,
  },
  mark: {
    required: true,
    default: 5,
    type: Number,
  },
  active: {
    type: Boolean,
    default: true,
  },
});
export const Quiz =
  mongoose.models.Quiz ?? mongoose.model("Quiz", quizzesSchema);
