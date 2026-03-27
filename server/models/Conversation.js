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

}, { timestamps: true });

export default mongoose.model("Conversation", conversationSchema);