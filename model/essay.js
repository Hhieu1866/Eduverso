import mongoose from "mongoose";

const essaySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    documents: [
      {
        name: String,
        fileUrl: String,
        fileType: String,
        fileSize: Number,
        uploadedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Essay || mongoose.model("Essay", essaySchema);
