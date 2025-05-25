import { Router } from "express";
import {  validateProduct } from "../midleware/validation.middleware";
import protectRoute from "../midleware/auth.middleware";
import { RoleEnum } from "../utils/enum";
import { createProduct, deleteProduct, getAllProduct, getProductById, getTotalProduct, updateProduct } from "../controllers/product.controller";

const router = Router();

router.post("/create/:category_id", validateProduct, protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), createProduct);
router.get("/getAll",protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), getAllProduct);
router.get("/total",protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), getTotalProduct);
router.get("/:id",protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), getProductById);
router.put("/:id",protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), updateProduct); 
router.delete("/:id",protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), deleteProduct);

 export default router;