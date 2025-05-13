import { Router } from "express";
import {  validateProduct } from "../midleware/validation.middleware";
import protectRoute from "../midleware/auth.middleware";
import { RoleEnum } from "../utils/enum";
import { createProduct, deleteProduct, getAllProduct, getProductById, getTotalProduct, updateProduct } from "../controllers/product.controller";


const router = Router();

router.post("/create/:category_id", validateProduct, protectRoute([RoleEnum.ADMIN,]), createProduct);
router.get("/getAll",protectRoute([RoleEnum.ADMIN,]), getAllProduct);
router.get("/total",protectRoute([RoleEnum.ADMIN,]), getTotalProduct);
router.get("/:id",protectRoute([RoleEnum.ADMIN,]), getProductById);
router.put("/:id",protectRoute([RoleEnum.ADMIN,]), updateProduct); 
router.delete("/:id",protectRoute([RoleEnum.ADMIN,]), deleteProduct);


 export default router;