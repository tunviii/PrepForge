import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["system", "user", "assistant"],
    required: true
  },
  content: {
    type: String,
    required: true
  }
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  userId: {
    type: String, 
    required: true
  },
  messages: [messageSchema],
  status: {
    type: String,
    enum: ["in_progress", "completed"],
    default: "in_progress"
  },
  score: {
    type: Number,
    default: null
  },
  verdict: {
    type: String,
    enum: ["Strong Hire", "Hire", "Borderline", "Reject", null],
    default: null
  },
  hire: {
    type: Boolean,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }


}, { timestamps: true });


conversationSchema.index({ userId: 1, status: 1 });
conversationSchema.index({ userId: 1, completedAt: 1 });

export default mongoose.model("Conversation", conversationSchema);