import express from "express";
import User from "../models/User.js"; 
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/profile", verifyFirebaseToken, async (req, res) => {
  try {
    const { name, college, branch } = req.body;

    const uid = req.user.uid;
    const email = req.user.email;

    const updatedUser = await User.findOneAndUpdate(
      { uid },
      {
        uid,
        email,
        name,
        college,
        branch
      },
      {
        upsert: true,   // create if not exists
        new: true       // return updated doc
      }
    );

    res.json({ message: "User saved", user: updatedUser });

  } catch (error) {
    console.error("USER SAVE ERROR:", error);
    res.status(500).json({ message: "Error saving user" });
  }
});

export default router;