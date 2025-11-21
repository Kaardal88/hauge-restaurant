import { Router } from "express";
import { pool } from "../database.js";
import { PostWithUser } from "../interfaces.js";

const router = Router();

//Her får vi alle poster fra alle brukere. Brukes f.eks i en feed.
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT posts.id, posts.title, posts.content, posts.user_id, posts.created_at, users.username, users.email FROM posts INNER JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC`
    );

    const posts = rows as PostWithUser[];
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

export default router;
