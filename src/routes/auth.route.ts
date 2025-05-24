// import { Router } from "express";
// import { deleteUser, getAllUsers, login, register } from "../controllers/auth.controller";
// import { validateLogin, validateUser } from "../midleware/validation.middleware";
// import protectRoute from "../midleware/auth.middleware";
// import { RoleEnum } from "../utils/enum";
// // import { validateRegister, validateLogin } from "../midleware/validation.middleware";

// const router = Router();

// router.post("/register",protectRoute([RoleEnum.ADMIN,]), validateUser, register);
// router.post("/login", validateLogin, login);
// router.get("/getAll", getAllUsers)
// router.delete("/:id", deleteUser)

//  export default router;

import { Router } from "express";
import { deleteUser, getAllUsers, login, register } from "../controllers/auth.controller";
import { validateLogin, validateUser } from "../midleware/validation.middleware";
import protectRoute from "../midleware/auth.middleware";
import { RoleEnum } from "../utils/enum";

const router = Router();

router.post("/register", protectRoute([RoleEnum.ADMIN]), validateUser, register);
router.post("/login", validateLogin, login);
router.get("/getAll", protectRoute([RoleEnum.ADMIN]), getAllUsers);
router.delete("/:id", protectRoute([RoleEnum.ADMIN]), deleteUser);
// router.get("/search", getAllUsers); 


export default router;