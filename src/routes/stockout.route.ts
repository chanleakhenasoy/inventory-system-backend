import { Router } from "express";
import { validateStockout } from "../midleware/validation.middleware";
import { createStockout, getAllStockouts, getTotalStockOut } from "../controllers/stockout.controller";
import { RoleEnum } from "../utils/enum";
import protectRoute from "../midleware/auth.middleware";

const router = Router();

router.post("/create/:product_id/:user_id",validateStockout,protectRoute([RoleEnum.ADMIN]), createStockout);
router.get("/item/total" ,protectRoute([RoleEnum.ADMIN]),getTotalStockOut);
router.get("/getAll",protectRoute([RoleEnum.ADMIN]),getAllStockouts,)

export default router;