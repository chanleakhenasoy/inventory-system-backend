import { Router } from "express";
import { validateStockout } from "../midleware/validation.middleware";
import { createStockout, getTotalStockOut } from "../controllers/stockout.controller";
import { RoleEnum } from "../utils/enum";
import protectRoute from "../midleware/auth.middleware";

const router = Router();

router.post("/create/:product_id/:user_id",validateStockout,protectRoute([RoleEnum.ADMIN]), createStockout);
router.get("/total" ,protectRoute([RoleEnum.ADMIN]),getTotalStockOut);

export default router;