import { Request, Response } from "express";
import { InvoiceStockInModel } from "../models/stockInInvoice.model";
import { StockInItemModel } from "../models/stockInItem.model";

import { v4 as uuidv4 } from "uuid";
import { pool } from "../config/db";

export class StockInController {
  async createStockIn(req: Request, res: Response) {
    try {
      const { purchase_date, reference_number, due_date, items } = req.body;
      const { supplier_id } = req.params;
  
      if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json({ message: "Items array is required and cannot be empty." });
        return;
      }
  
      // Generate invoice id
      const invoiceId = uuidv4();
  
      // Create invoice
      const stockInInvoiceModel = new InvoiceStockInModel({
        id: invoiceId,
        supplier_id,
        purchase_date,
        reference_number,
        due_date,
        created_at: new Date(),
        updated_at: new Date(),
      });
  
      const invoice = await stockInInvoiceModel.create();
  
      // Store each item in the StockInItem table
      const createdItems = await Promise.all(
        items.map(async (item) => {
          const stockInItemModel = new StockInItemModel({
            id: uuidv4(),
            invoice_stockin_id: invoiceId, 
            product_id: item.product_id,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
            expire_date: item.expire_date,
            created_at: new Date(),
            updated_at: new Date(),
          });
  
          return await stockInItemModel.create(); // Store in database
        })
      );
  
      // Response with invoice and all items
      res.status(201).json({
        message: "Invoice and stock-in items created successfully.",
        invoice,
        items: createdItems,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
  
  async getAllStockIn(req: Request, res: Response) {
    try {
      const stockInModel = new InvoiceStockInModel();
      const total = await stockInModel.findAllStockIn();
      res
        .status(200)
        .json({ message: "Get stock in all successfully", data: total });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
      return;
    }
  }

  async getStockInById(req: Request, res: Response) {
    try {
      const { invoice_id, item_id } = req.params; 
      const stockInModel = new InvoiceStockInModel();
  
      const stockIn = await stockInModel.findStockInInvoiceWithOneItem(invoice_id, item_id);
  
      if (!stockIn) {
         res.status(404).json({ message: "Stock-in record not found." });
         return;
      }
  
        res.status(200).json({
        message: "Get stock-in by id successfully",
        data: stockIn,
      });
    } catch (error) {
      console.error("Error fetching stock-in by id and item:", error);
     res.status(500).json({ message: "Internal server error." });
     return;
    }
  }

  async getItemByInvoiceId(req: Request, res: Response) {
    const { invoiceId } = req.params;
    try {
      const stockInModel = new StockInItemModel();
      const total = await stockInModel.findByInvoiceId(invoiceId);
      res
        .status(200)
        .json({ message: "Get items by invoice id successfully", data: total });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
      return;
    }
  }
  
  async getTotalStockIn(req: Request, res: Response) {
    try {
      const stockInModel = new StockInItemModel();
      const total = await stockInModel.countProductsInStock();
      res
        .status(200)
        .json({ message: "Get stock in total successfully", data: total });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
      return;
    }
  }

  async updateItems(req: Request, res: Response) {
    const { invoiceId, itemId } = req.params;
    const { quantity, unit_price, expire_date } = req.body;
  
    try {
      const stockInModel = new StockInItemModel();
  
      const updatedItem = await stockInModel.updateStockInItem(
        invoiceId,
        itemId,
        quantity,
        unit_price,
        expire_date
      );
  
      if (!updatedItem) {
        res.status(404).json({ message: "Item not found or does not belong to invoice" });
        return;
      }
  
      res.status(200).json({ message: "Item updated successfully", data: updatedItem });
    } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  
  
  
}
