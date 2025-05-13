import { Router } from "express";
import { validateStockout } from "../midleware/validation.middleware";
import { createStockout } from "../controllers/stockout.controller";

const router = Router();

router.post("/create/:product_id/:user_id",validateStockout, createStockout);

export default router;