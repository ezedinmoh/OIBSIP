const express = require("express");
const session = require("express-session");
const path = require("path");

const authRouter = require("./server/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "development-only-secret-change-before-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

app.use("/api/auth", authRouter);

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
