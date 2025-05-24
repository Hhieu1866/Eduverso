import mongoose from "mongoose";

const essaySubmissionSchema = new mongoose.Schema(
  {
    essayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Essay",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    submittedFiles: [
      {
        name: String,
        fileUrl: String,
        fileType: String,
        fileSize: Number,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    content: {
      type: String,
    },
    grade: {
      type: Number,
    },
    feedback: {
      type: String,
    },
    feedbackFromInstructor: {
      type: String,
    },
    gradedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "graded", "returned", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

essaySubmissionSchema.pre("save", function (next) {
  if (this.fileUrl) {
    this.fileUrl = undefined;
  }
  next();
});

export default mongoose.models.EssaySubmission ||
  mongoose.model("EssaySubmission", essaySubmissionSchema);
