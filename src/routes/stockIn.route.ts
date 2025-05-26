import { Router } from "express";
import { StockInController } from "../controllers/stockIn.controller";
import protectRoute from "../midleware/auth.middleware";
import { RoleEnum } from "../utils/enum";

const router = Router();
const stockInController = new StockInController();

router.post("/create/:supplier_id", protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), stockInController.createStockIn);
router.get("/item/total/quantity", protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), stockInController.getTotalQuanttityItem);
// router.get("/available-stock-amount", protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), stockInController.getAvailableStockAmount);
// router.get("/unit-avg-cost", protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), stockInController.getUnitAvgCost);
// router.get('/quantity-in-hand', protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]),stockInController.getTotalQuantityInhand);
// router.get("/item/total", protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), stockInController.getTotalStockIn);
router.get("/getAll", protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), stockInController.getAllStockIn);
router.get("/:invoiceId", protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), stockInController.getStockInByInvoiceId)
router.get("/getAll/items", protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), stockInController.getAllItems);
router.put("/:invoiceId/:itemId", protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), stockInController.updateStockIn);
router.get("/:itemId", protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), stockInController.getItemById);
router.delete("/:invoiceId/:itemId", protectRoute([RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICER]), stockInController.deleteItem);

export default router;
