import { Router } from "express";
import { StockInController } from "../controllers/stockIn.controller";
import protectRoute from "../midleware/auth.middleware";
import { RoleEnum } from "../utils/enum";

const router = Router();
const stockInController = new StockInController();

// Routes for stock-in and stock-in-items
router.post("/invoice/:supplier_id", protectRoute([RoleEnum.ADMIN]),(req, res) => stockInController.createStockInInvoice(req, res),protectRoute([RoleEnum.ADMIN,]));
router.post("/item/:invoice_stockIn_id/:product_id", protectRoute([RoleEnum.ADMIN]),(req, res) => stockInController.createStockInItem(req, res));

export default router;
