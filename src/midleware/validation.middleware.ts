import { Request, Response, NextFunction } from "express";
import { describe } from "node:test";
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


const supplierSchema = z.object({          
  supplier_name: z.string().min(1), 
  phone_number: z.string().optional(), 
  address: z.string().min(8),      
  company_name: z.string().min(3),           
});
const categorySchema = z.object({          
  category_name: z.string().min(1), 
  description:  z.string().min(1),
           
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

export const validateSupplier = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    supplierSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.errors[0].message });
      return;
    }
    next(error);
  }
};

export const validateCategory = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    categorySchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.errors[0].message });
      return;
    }
    next(error);
  }
};