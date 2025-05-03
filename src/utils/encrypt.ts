import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import { TokenPayload } from "../common/types/user";

dotenv.config();
const { JWT_SECRET } = process.env;

export const encryptPassword = (password: string) => {
  return bcrypt.hashSync(password, 12);
};

export const comparePassword = (hashPassword: string, password: string) => {
  return bcrypt.compareSync(password, hashPassword);
};

export const generateToken = (payload: TokenPayload) => {
  return jwt.sign(payload, JWT_SECRET || "", { expiresIn: 60 * 60 * 24 * 30  }); // 30 days in seconds
};
