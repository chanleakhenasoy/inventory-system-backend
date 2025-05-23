import { Router } from "express";
import { StockInController } from "../controllers/stockIn.controller";
import protectRoute from "../midleware/auth.middleware";
import { RoleEnum } from "../utils/enum";

const router = Router();
const stockInController = new StockInController();

router.post("/create/:supplier_id", protectRoute([RoleEnum.ADMIN]), stockInController.createStockIn);
router.get("/available-stock-amount", stockInController.getAvailableStockAmount);
router.get("/unit-avg-cost", stockInController.getUnitAvgCost);
router.get('/quantity-in-hand', stockInController.getTotalQuantityInhand);
router.get("/item/total", protectRoute([RoleEnum.ADMIN]), stockInController.getTotalStockIn);
router.get("/getAll", stockInController.getAllStockIn);
router.get("/:invoiceId", stockInController.getStockInByInvoiceId)
router.get("/getAll/items", stockInController.getAllItems);
router.put("/:invoiceId/:itemId", stockInController.updateStockIn);
router.get("/:itemId", stockInController.getItemById);
router.delete("/:invoiceId/:itemId", stockInController.deleteItem);



export default router;
