import { Router } from "express";
import { validateCategory } from "../midleware/validation.middleware";
import { createCategory, deleteCategory, getAllcategory, getCategoryById, getTotalCategory, updateCategory } from "../controllers/category.controller";
import protectRoute from "../midleware/auth.middleware";
import { RoleEnum } from "../utils/enum";


const router = Router();

router.post("/create", validateCategory, protectRoute([RoleEnum.ADMIN,]), createCategory);
router.get("/getAll",protectRoute([RoleEnum.ADMIN,]), getAllcategory);
router.get("/total", protectRoute([RoleEnum.ADMIN,]), getTotalCategory);
router.get("/:id",protectRoute([RoleEnum.ADMIN,]), getCategoryById);
router.put("/:id",protectRoute([RoleEnum.ADMIN,]), updateCategory); 
router.delete("/:id",protectRoute([RoleEnum.ADMIN,]), deleteCategory);
 // Assuming you want to use the same getAllcategory function for total
// router.put("/:id",protectRoute([RoleEnum.ADMIN,]), updateCategory);
// Assuming you want to use the same create function for update


 export default router;