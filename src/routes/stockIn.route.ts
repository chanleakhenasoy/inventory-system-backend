import { Router } from "express";
import { StockInController } from "../controllers/stockIn.controller";
import protectRoute from "../midleware/auth.middleware";
import { RoleEnum } from "../utils/enum";

const router = Router();
const stockInController = new StockInController();

// Routes for stock-in and stock-in-items
router.post("/create/:supplier_id", protectRoute([RoleEnum.ADMIN]), stockInController.createStockIn);
router.get("/getAll", stockInController.getAllStockIn);
router.get("/:invoiceId", stockInController.getStockInByInvoiceId)
router.get("/getAll-items", stockInController.getAllItems);
router.put("/:itemId", stockInController.updateStockIn);
router.get("/:itemId", stockInController.getItemById);
router.get("/total", protectRoute([RoleEnum.ADMIN]), stockInController.getTotalStockIn);
router.delete("/delete/:itemId", stockInController.deleteItem);

export default router;
