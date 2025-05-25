import { Router } from "express";
import { validateCategory } from "../midleware/validation.middleware";
import { createCategory, deleteCategory, getAllcategory, getCategoryById, getTotalCategory, updateCategory } from "../controllers/category.controller";
import protectRoute from "../midleware/auth.middleware";
import { RoleEnum } from "../utils/enum";

const router = Router();

router.post("/create", validateCategory, protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), createCategory);
router.get("/getAll",protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), getAllcategory);
router.get("/total", protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), getTotalCategory);
router.get("/:id",protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), getCategoryById);
router.put("/:id", protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), updateCategory); 
router.delete("/:id",protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), deleteCategory);

 export default router;