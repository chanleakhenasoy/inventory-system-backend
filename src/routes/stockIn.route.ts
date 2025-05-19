import { Router } from "express";
import { StockInController } from "../controllers/stockIn.controller";
import protectRoute from "../midleware/auth.middleware";
import { RoleEnum } from "../utils/enum";

const router = Router();
const stockInController = new StockInController();

// Routes for stock-in and stock-in-items
router.post( "/create/:supplier_id/:product_id",protectRoute([RoleEnum.ADMIN]),(req, res) => stockInController.createStockIn(req, res));
router.get("/getAll", (req, res) => stockInController.getAllStockIn(req, res));
router.get("/total", protectRoute([RoleEnum.ADMIN]), (req, res) =>
  stockInController.getTotalStockIn(req, res)
);

export default router;
