import express from "express";
import User from "../models/User.js"; 
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// routes/users.js — add this alongside your existing POST /profile

router.get('/me', verifyFirebaseToken, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});
router.post("/profile", verifyFirebaseToken, async (req, res) => {
  try {
    const { name, college, branch } = req.body;

    const uid = req.user.uid;
    const email = req.user.email;

     const updateFields = { uid, email, name };
    if (college) updateFields.college = college;
    if (branch)  updateFields.branch  = branch;


    const updatedUser = await User.findOneAndUpdate(
  { uid },
  updateFields,
  {
    upsert: true,
    new: true
  }
);

    res.json({ message: "User saved", user: updatedUser });

  } catch (error) {
    console.error("USER SAVE ERROR:", error);
    res.status(500).json({ message: "Error saving user" });
  }
});

export default router;