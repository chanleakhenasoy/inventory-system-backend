import { Router } from "express";
import { validateStockout } from "../midleware/validation.middleware";
import { createStockout } from "../controllers/stockout.controller";

const router = Router();

router.post("/create",validateStockout, createStockout);

export default router;