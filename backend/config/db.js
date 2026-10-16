import mongoose from "mongoose";

const comparisonSchema = new mongoose.Schema(
  {
    fileName: String,
    jobDescription: String,
    score: Number,
    present: [String],
    missing: [String],
  },
  { timestamps: true }
);

export const Comparison = mongoose.model("Comparison", comparisonSchema);

export async function connectMongo() {
  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI is not set. Skipping MongoDB connection.");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
}
