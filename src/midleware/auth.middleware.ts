import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { RoleEnum } from "../utils/enum";
import { TokenPayload } from "../common/types/user";

// Extend Express Request type to include user
declare module "express-serve-static-core" {
  interface Request {
    user?: TokenPayload;
  }
}

// Middleware to protect routes and check roles
const protectRoute = (roles: RoleEnum[] = [RoleEnum.USER]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;

      // Validate the Authorization header
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          message: "Access denied: Missing or invalid Authorization header",
        });
        return 
      }

      // Extract the token
      const token = authHeader.split(" ")[1];
      const secret = process.env.JWT_SECRET;

      // Ensure the JWT secret is available
      if (!secret) {
        console.error("JWT secret is not configured");
        res.status(500).json({ message: "Internal server error" });
        return 
      }

      // Verify the token
      const decoded = jwt.verify(token, secret) as TokenPayload;

      // Attach the decoded user data to the request object
      req.user = decoded;

      // Check if the user role is allowed
      if (!roles.includes(decoded.role)) {
        res.status(403).json({
          message: `Forbidden: Insufficient role. Required roles: ${roles.join(", ")}`,
        });
        return 
      }

      // Proceed to the next middleware or route handler
      next();
    } catch (err) {
      console.error("Token validation error:", err);
      res.status(401).json({ message: "Invalid or expired token" });
      return 
    }
  };
};

export default protectRoute;
