import express from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/api/auth/check-username", async (req, res) => {
  const { username } = req.query;

  // Example: replace this with your DB query
  const user = await User.findOne({ username });

  if (user) {
    return res.json({ available: false });
  }

  return res.json({ available: true });
});

export default router;
