import { Router } from "express";
import { StockInController } from "../controllers/stockIn.controller";

const router = Router();
const stockInController = new StockInController();

// Routes for stock-in and stock-in-items
router.post("/invoice/:supplier_id", (req, res) => stockInController.createStockInInvoice(req, res));
router.post("/item/:invoice_stockIn_id/:product_id", (req, res) => stockInController.createStockInItem(req, res));

export default router;
