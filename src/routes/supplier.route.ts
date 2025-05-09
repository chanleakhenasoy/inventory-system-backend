import { Router } from "express";
import { createSupplier, deleteSupplier, getAllSuppliers, getSupplierById, updateSupplier } from "../controllers/supplier.controller";
import { validateSupplier } from "../midleware/validation.middleware";


const router = Router();

router.post("/create",validateSupplier, createSupplier);
router.get("/getAll", getAllSuppliers);
router.get("/:id", getSupplierById);
router.put("/:id", updateSupplier); 
router.delete("/:id", deleteSupplier);// Assuming you want to use the same create function for update


 export default router;