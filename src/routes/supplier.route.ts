import { Router } from "express";
import { createSupplier, deleteSupplier, getAllSuppliers, getSupplierById, updateSupplier } from "../controllers/supplier.controller";
import { validateSupplier } from "../midleware/validation.middleware";
import { RoleEnum } from "../utils/enum";
import protectRoute from "../midleware/auth.middleware";


const router = Router();

router.post("/create",validateSupplier,protectRoute([RoleEnum.ADMIN]), createSupplier);
router.get("/getAll",protectRoute([RoleEnum.ADMIN]),getAllSuppliers);
router.get("/:id", protectRoute([RoleEnum.ADMIN]),getSupplierById);
router.put("/:id", protectRoute([RoleEnum.ADMIN]),updateSupplier); 
router.delete("/:id",protectRoute([RoleEnum.ADMIN]),deleteSupplier);// Assuming you want to use the same create function for update


 export default router;