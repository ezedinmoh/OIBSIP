const express = require("express");
const bcrypt = require("bcryptjs");

const db = require("./database");

const router = express.Router();

const MIN_PASSWORD_LENGTH = 8;
const SALT_ROUNDS = 12;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return "Password must be at least 8 characters.";
  }

  if (!/\d/.test(password)) {
    return "Password must contain at least one number.";
  }

  return null;
}

router.get("/health", (req, res) => {
  res.json({
    message: "Authentication service is running",
  });
});

router.post("/register", async (req, res) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";

    const email =
      typeof req.body.email === "string" ? normalizeEmail(req.body.email) : "";

    const password =
      typeof req.body.password === "string" ? req.body.password : "";

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please complete all required fields.",
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        message: "Name must contain at least 2 characters.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      return res.status(400).json({
        message: passwordError,
      });
    }

    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = db
      .prepare(
        `
        INSERT INTO users (
          name,
          email,
          password_hash
        )
        VALUES (?, ?, ?)
      `,
      )
      .run(name, email, passwordHash);

    return res.status(201).json({
      message: "Account created successfully.",
      user: {
        id: result.lastInsertRowid,
        name,
        email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Unable to create your account. Please try again.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email =
      typeof req.body.email === "string" ? normalizeEmail(req.body.email) : "";

    const password =
      typeof req.body.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter your email and password.",
      });
    }

    const user = db
      .prepare(
        `
        SELECT
          id,
          name,
          email,
          password_hash
        FROM users
        WHERE email = ?
      `,
      )
      .get(email);

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    req.session.userId = user.id;

    return res.json({
      message: "Login successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Unable to log in. Please try again.",
    });
  }
});

router.get("/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  const user = db
    .prepare(
      `
      SELECT
        id,
        name,
        email,
        created_at
      FROM users
      WHERE id = ?
    `,
    )
    .get(req.session.userId);

  if (!user) {
    req.session.destroy(() => {});

    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  return res.json({
    user,
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        message: "Unable to log out. Please try again.",
      });
    }

    res.clearCookie("connect.sid");

    return res.json({
      message: "Logged out successfully.",
    });
  });
});

module.exports = router;
