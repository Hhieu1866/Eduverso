import mongoose, { Schema } from "mongoose";

const assessmentSchema = new Schema({
  quizSet: {
    type: Schema.ObjectId,
    ref: "QuizSet",
    required: true,
  },
  user: {
    type: Schema.ObjectId,
    ref: "User",
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  details: {
    type: Array,
    required: true,
  },
  isPassed: {
    type: Boolean,
    default: false,
  },
  percentage: {
    type: Number,
    required: true,
  },
  attemptedAt: {
    type: Date,
    default: Date.now,
  },
  nextAttemptAllowed: {
    type: Date,
    default: null,
  },
});

export const Assessment =
  mongoose.models?.Assessment || mongoose.model("Assessment", assessmentSchema);
