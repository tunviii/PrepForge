import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  uid: {
    type: String, // Firebase UID
    required: true,
    unique: true
  },
  firebaseUid: String,
  name: String,
  email: String,
  college: String,
  branch: String
}, { timestamps: true });

export default mongoose.model("User", userSchema);