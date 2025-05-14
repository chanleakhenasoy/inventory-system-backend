import { Router } from "express";
import { login, register } from "../controllers/auth.controller";
import { validateLogin, validateUser } from "../midleware/validation.middleware";
import protectRoute from "../midleware/auth.middleware";
import { RoleEnum } from "../utils/enum";
// import { validateRegister, validateLogin } from "../midleware/validation.middleware";

const router = Router();

router.post("/register",validateUser, register);
router.post("/login", validateLogin, login);

 export default router;