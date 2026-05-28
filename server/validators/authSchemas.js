import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80, "Name is too long."),
  email: z.string().trim().email("Use a valid email address.").max(160),
  password: z.string().min(8, "Password must be at least 8 characters.").max(120)
});

export const loginSchema = z.object({
  email: z.string().trim().email("Use a valid email address."),
  password: z.string().min(1, "Password is required.")
});
