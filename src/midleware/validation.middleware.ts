import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const userSchema = z.object({
  user_name: z.string().min(3),
  email: z.string()
    .email()
    .regex(/^[\w.-]+@([\w-]+\.)*pse\.ngo$/, {
      message: "Email must belong to pse.ngo",
    }),
  password: z.string().min(8),
  role: z.enum(["user", "admin"]),
});


const loginSchema = z.object({
  email: z.string()
    .email()
    .regex(/^[\w.-]+@([\w-]+\.)*pse\.ngo$/, {
      message: "Email must belong to pse.ngo",
    }),
  password: z.string().min(8),
});


export const validateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    userSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.errors[0].message });
      return;
    }
    next(error);
  }
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.errors[0].message });
      return;
    }
    next(error);
  }
};