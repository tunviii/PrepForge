import admin from "../config/firebase.js";

export async function verifyFirebaseToken(req, res, next) {

  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {

    const decoded = await admin.auth().verifyIdToken(token);

    req.user = decoded;

    next();

  } catch (error) {

    res.status(401).json({ message: "Invalid token" });

  }

}
