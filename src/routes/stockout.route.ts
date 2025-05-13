import { Router } from "express";
import { validateStockout } from "../midleware/validation.middleware";
import { createStockout } from "../controllers/stockout.controller";
import { RoleEnum } from "../utils/enum";
import protectRoute from "../midleware/auth.middleware";

const router = Router();

router.post("/create/:product_id/:user_id",validateStockout,protectRoute([RoleEnum.ADMIN]), createStockout);

export default router;