import mongoose, { Schema } from "mongoose";

const quizesetSchema = new Schema({
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
  quizIds: [{ type: Schema.ObjectId, ref: "Quiz" }],
  active: {
    required: true,
    default: false,
    type: Boolean,
  },
});
let Quizset;
try {
  Quizset = mongoose.model("Quizset");
} catch (error) {
  Quizset = mongoose.model("Quizset", quizesetSchema);
}
export { Quizset };
