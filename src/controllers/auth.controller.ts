import { Request, Response } from "express";
import { UserModel } from "../models/user.model";
import { generateToken } from "../utils/encrypt";
import { TokenPayload } from "../common/types";
import { RoleEnum } from "../utils/enum";
import { v4 as uuidv4 } from "uuid";

export const register = async (req: Request, res: Response) => {
  const { user_name, email, role, password } = req.body;
  const id = uuidv4(); // Generate UUID if not provided
  const userModel = new UserModel({
    id,
    user_name,
    email,
    role,
    password,
    created_at: new Date(),
    updated_at: new Date(),
  });
  console.log(userModel);

  try {
    // Check if the user already exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    // Register the user
    await userModel.register();
    console.log(userModel)

    res.status(201).json({ message: "User registered successfully" ,userModel});
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
    return;
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const userModel = new UserModel();

  try {
    // Validate login credentials
    const { isValid, user } = await userModel.validateLogin(email, password);

    if (!isValid || !user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Generate a JWT token
    const tokenPayload: TokenPayload = {
      id: user.id || "",
      role: user.role as RoleEnum,
    };
    const token = generateToken(tokenPayload);

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
    return;
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const userModel = new UserModel();
    const users = await userModel.findAll();
    res
      .status(200)
      .json({ message: "Get all user successfully", data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userModel = new UserModel();

    await userModel.delete(id);

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};