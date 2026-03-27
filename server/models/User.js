import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  uid: {
    type: String, // Firebase UID
    required: true,
    unique: true
  },
  name: String,
  email: String
}, { timestamps: true });

export default mongoose.model("User", userSchema);