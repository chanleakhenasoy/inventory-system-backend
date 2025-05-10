import { Router } from "express";
import {  validateProduct } from "../midleware/validation.middleware";
import protectRoute from "../midleware/auth.middleware";
import { RoleEnum } from "../utils/enum";
import { createProduct, deleteProduct, getAllProduct, getProductById, updateProduct } from "../controllers/product.controller";


const router = Router();

router.post("/create", validateProduct, protectRoute([RoleEnum.ADMIN,]), createProduct);
router.get("/getAll",protectRoute([RoleEnum.ADMIN,]), getAllProduct);
router.get("/:id",protectRoute([RoleEnum.ADMIN,]), getProductById);
router.put("/:id",protectRoute([RoleEnum.ADMIN,]), updateProduct); 
router.delete("/:id",protectRoute([RoleEnum.ADMIN,]), deleteProduct);// Assuming you want to use the same create function for update


 export default router;