import { prisma } from "../db.js";
import { verifyToken } from "../utils/auth.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const payload = token ? verifyToken(token) : null;

    if (!payload) {
      return res.status(401).json({ message: "Please sign in to continue." });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user) {
      return res.status(401).json({ message: "Please sign in to continue." });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Please sign in to continue." });
  }
}
