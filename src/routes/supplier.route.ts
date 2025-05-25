import { Router } from "express";
import { createSupplier, deleteSupplier, getAllSuppliers, getSupplierById, updateSupplier } from "../controllers/supplier.controller";
import { validateSupplier } from "../midleware/validation.middleware";
import { RoleEnum } from "../utils/enum";
import protectRoute from "../midleware/auth.middleware";

const router = Router();

router.post("/create",validateSupplier, protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), createSupplier);
router.get("/getAll",protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]),getAllSuppliers);
router.get("/:id", protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]),getSupplierById);
router.put("/:id", protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]),updateSupplier); 
router.delete("/:id",protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]),deleteSupplier);

 export default router;