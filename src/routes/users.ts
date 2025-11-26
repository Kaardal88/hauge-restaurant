import { Router } from "express";
import { pool } from "../database";
import { ResultSetHeader } from "mysql2";
import { User, Post, PostWithUser } from "../interfaces";
import {
  validateUserId,
  validateRequiredUserData,
  validatePartialUserData,
} from "../middleware/user-validation";
import { authenticateToken } from "../middleware/auth-validation";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 *         email:
 *           type: string
 *       required:
 *         - id
 *         - username
 *         - email
 *     UserInput:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *       required:
 *         - username
 *         - email
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         user_id:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *     PostWithUser:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         user_id:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         username:
 *           type: string
 *         email:
 *           type: string
 */

/**
 * @openapi
 * /users:
 *   post:
 *     tags:
 *       - Users
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       "500":
 *         description: Internal server error
 */
router.post("/", validateRequiredUserData, async (req, res) => {
  try {
    const { username, email } = req.body;

    const [result]: [ResultSetHeader, any] = await pool.execute(
      "INSERT INTO users (username, email) VALUES (?, ?)",
      [username, email]
    );

    const user: User = { id: result.insertId, username, email };
    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @openapi
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     responses:
 *       "200":
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       "500":
 *         description: Internal server error
 */
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM users");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get a user by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       "200":
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       "404":
 *         description: User not found
 *       "500":
 *         description: Internal server error
 */
router.get("/:id", validateUserId, async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    const users = rows as User[];
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(users[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Replace a user by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       "200":
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       "404":
 *         description: User not found
 *       "500":
 *         description: Internal server error
 */
router.put(
  "/:id",
  authenticateToken,
  validateUserId,
  validateRequiredUserData,
  async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const { username, email } = req.body;

      if (req.user!.id !== userId) {
        return res.status(403).json({
          error: "Users can only update their own account",
        });
      }

      const [result]: [ResultSetHeader, any] = await pool.execute(
        "UPDATE users SET username = ?, email = ? WHERE id = ?",
        [username, email, userId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      const user: User = { id: userId, username, email };
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Partially update a user by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       "200":
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       "404":
 *         description: User not found
 *       "500":
 *         description: Internal server error
 */
router.patch(
  "/:id",
  authenticateToken,
  validateUserId,
  validatePartialUserData,
  async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const { username, email } = req.body;

      if (req.user!.id !== userId) {
        return res.status(403).json({
          error: "Users can only update their own account",
        });
      }
      const fieldsToUpdate = [];
      const values = [];
      if (username) {
        fieldsToUpdate.push("username = ?");
        values.push(username);
      }
      if (email) {
        fieldsToUpdate.push("email = ?");
        values.push(email);
      }
      values.push(userId);

      const query = `UPDATE users SET ${fieldsToUpdate.join(
        ", "
      )} WHERE id = ?`;
      const [result]: [ResultSetHeader, any] = await pool.execute(
        query,
        values
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [
        userId,
      ]);
      const users = rows as User[];
      res.json(users[0]);
    } catch (error) {
      console.error("Error partially updating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete a user by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       "204":
 *         description: No content (deleted)
 *       "404":
 *         description: User not found
 *       "500":
 *         description: Internal server error
 */
router.delete("/:id", authenticateToken, validateUserId, async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (req.user!.id !== userId) {
      return res.status(403).json({
        error: "Users can only update their own account",
      });
    }

    const [result]: [ResultSetHeader, any] = await pool.execute(
      "DELETE FROM users WHERE id = ?",
      [userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @openapi
 * /users/{id}/posts:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get posts for a user
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       "200":
 *         description: A list of posts for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       "400":
 *         description: Invalid user ID
 *       "500":
 *         description: Internal server error
 */
router.get("/:id/posts", async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const [rows] = await pool.execute(
      `SELECT posts.id, posts.title, posts.content, posts.user_id, posts.created_at FROM posts WHERE posts.user_id = ? ORDER BY posts.created_at DESC`,
      [userId]
    );

    const posts = rows as Post[];
    res.json(posts);
  } catch (error) {
    console.error("Error fetching user posts", error);
    return res.status(500).json({ error: "Failed to fetch user posts" });
  }
});

/**
 * @openapi
 * /users/{id}/posts-with-user:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get posts for a user with author info
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       "200":
 *         description: A list of posts including user info
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PostWithUser'
 *       "500":
 *         description: Internal server error
 */
router.get("/:id/posts-with-user", async (req, res) => {
  const userId = Number(req.params.id);

  const [rows] = await pool.execute(
    `
    SELECT posts.id, posts.title, posts.content, posts.user_id, posts.created_at,
           users.username, users.email
    FROM posts
    INNER JOIN users ON posts.user_id = users.id
    WHERE users.id = ?
  `,
    [userId]
  );

  const posts = rows as PostWithUser[];
  res.json(posts);
});

export default router;
