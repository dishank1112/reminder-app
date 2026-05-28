import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { createToken, hashPassword, publicUser, verifyPassword } from "../utils/auth.js";
import { loginSchema, registerSchema } from "../validators/authSchemas.js";

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const email = data.email.toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email,
        passwordHash: await hashPassword(data.password)
      }
    });

    res.status(201).json({
      user: publicUser(user),
      token: createToken(user)
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.json({
      user: publicUser(user),
      token: createToken(user)
    });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});
