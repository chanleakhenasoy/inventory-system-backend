import { Request, Response } from "express";
import { InvoiceStockInModel } from "../models/stockInInvoice.model";
import { StockInItemModel } from "../models/stockInItem.model";

import { v4 as uuidv4 } from "uuid";

export class StockInController {
  // Create Stock In
  async createStockInInvoice(req: Request, res: Response) {
    try {
      const { purchase_date, reference_number, due_date } = req.body;
      const id = uuidv4();
      const { supplier_id } = req.params;
      console.log("supplier_id", supplier_id);
      const stockInInvoiceModel = new InvoiceStockInModel({
        id,
        supplier_id,
        purchase_date,
        reference_number,
        due_date,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const invoice = await stockInInvoiceModel.create();
      res
        .status(201)
        .json({ message: "Invoice created successfully.", invoice });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  }

  // Create Stock In Item
  async createStockInItem(req: Request, res: Response) {
    try {
      const { quantity, unit_price, expire_date } = req.body;
      const id = uuidv4();
      const { invoice_stockIn_id } = req.params;
      const { product_id } = req.params;
      const stockInItemModel = new StockInItemModel({
        id,
        invoice_stockIn_id,
        product_id,
        quantity,
        unit_price,
        expire_date,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const stockInItem = await stockInItemModel.create();
      res
        .status(201)
        .json({ message: "stockInItem created successfully.", stockInItem });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  }

  async getTotalStockIn(req: Request, res: Response) {
    try {
      const stockInModel = new StockInItemModel();
      const total = await stockInModel.countTotalProducts();
      res
        .status(200)
        .json({ message: "Get stock in total successfully", data: total });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
      return;
    }
  }
}
