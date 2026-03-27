import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/* get directory path */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* read service account json */
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, "firebaseServiceAccount.json"), "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export default admin;