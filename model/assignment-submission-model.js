import mongoose, { Schema } from "mongoose";

const assignmentSubmissionSchema = new Schema({
  assignment: {
    type: Schema.ObjectId,
    ref: "Assignment",
    required: true,
  },
  student: {
    type: Schema.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: Schema.ObjectId,
    ref: "Course",
    required: true,
  },
  submittedFiles: [
    {
      fileName: String,
      fileUrl: String,
      fileType: String,
      fileSize: Number,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  submissionText: {
    type: String,
    default: "",
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["submitted", "graded", "returned"],
    default: "submitted",
  },
  score: {
    type: Number,
    default: 0,
  },
  feedback: {
    type: String,
    default: "",
  },
  gradedBy: {
    type: Schema.ObjectId,
    ref: "User",
  },
  gradedAt: {
    type: Date,
  },
  isLate: {
    type: Boolean,
    default: false,
  },
});

let AssignmentSubmission;
try {
  AssignmentSubmission =
    mongoose.models.AssignmentSubmission ||
    mongoose.model("AssignmentSubmission", assignmentSubmissionSchema);
} catch (error) {
  AssignmentSubmission = mongoose.model(
    "AssignmentSubmission",
    assignmentSubmissionSchema,
  );
}

export { AssignmentSubmission };
