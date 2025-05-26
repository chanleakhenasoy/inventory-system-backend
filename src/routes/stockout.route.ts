import { Router } from "express";
import { validateStockout } from "../midleware/validation.middleware";
import { createStockout, getAllStockouts, getSumOfStockout } from "../controllers/stockout.controller";
import { RoleEnum } from "../utils/enum";
import protectRoute from "../midleware/auth.middleware";

const router = Router();

router.post("/create/:product_id/:user_id",validateStockout, protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), createStockout);
// router.get("/item/total" ,protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]),getTotalStockOut);
router.get("/getAll",protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]),getAllStockouts,)
router.get("/sum-all",protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]),getSumOfStockout);
  
export default router;