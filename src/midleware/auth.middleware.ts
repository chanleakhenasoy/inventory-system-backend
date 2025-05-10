import { TokenPayload } from './../common/types/user';
import * as jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { RoleEnum } from "../utils/enum";


// Middleware to protect routes and check roles
const protectRoute = (roles: RoleEnum[] = [RoleEnum.USER]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and starts with "Bearer"
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Access denied, no token provided or invalid format",
      });
      return;
    }

    const token = authHeader.split(" ")[1]; // Extract the token after "Bearer"

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as TokenPayload;
      req.user = decoded;

      if (!roles.includes(decoded.role)) {
          res
          .status(403)
          .json({ message: "Forbidden: You do not have the right role" });
          return;
      }

      next(); // Move to the next middleware or the route handler
    } catch (err) {
      console.log("error: ", err)
      res.status(401).json({ message: "Invalid token" });
      return;
    }
  };
};

export default protectRoute;
