import { Router } from "express";
import { StockInController } from "../controllers/stockIn.controller";
import protectRoute from "../midleware/auth.middleware";
import { RoleEnum } from "../utils/enum";

const router = Router();
const stockInController = new StockInController();

// Routes for stock-in and stock-in-items
router.post("/create/:supplier_id", protectRoute([RoleEnum.ADMIN]), stockInController.createStockIn);
router.get("/getAll", stockInController.getAllStockIn);
router.get("/:invoiceId", stockInController.getStockInByInvoiceId);
// router.get("/:invoiceId/:itemId", stockInController.getStockInById);
router.put("/:invoiceId/:itemId", stockInController.updateItems);
router.get("/total", protectRoute([RoleEnum.ADMIN]), stockInController.getTotalStockIn);


export default router;
