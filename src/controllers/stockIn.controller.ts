import { Request, Response } from "express";
import { InvoiceStockInModel } from "../models/stockInInvoice.model";
import { StockInItemModel } from "../models/stockInItem.model";

import { v4 as uuidv4 } from "uuid";
import { pool } from "../config/db";

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

  // async getAllStockIn(req: Request, res: Response) {
  //   try {
  //     const query = `
  //       SELECT 
  //         isi.id,
  //         isi.supplier_id,
  //         s.supplier_name,
  //         isi.purchase_date,
  //         isi.reference_number,
  //         isi.due_date,
  //         isi.created_at,
  //         isi.updated_at,
  //         json_agg(
  //           json_build_object(
  //             'id', sii.id,
  //             'invoice_stockin_id', sii.invoice_stockIn_id,
  //             'product_id', sii.product_id,
  //             'quantity', sii.quantity,
  //             'unit_price', sii.unit_price,
  //             'expire_date', sii.expire_date,
  //             'created_at', sii.created_at,
  //             'updated_at', sii.updated_at,
  //             'product_name', p.name_en
  //           )
  //         ) AS items
  //       FROM invoice_stock_in isi
  //       LEFT JOIN suppliers s ON isi.supplier_id = s.id
  //       LEFT JOIN stock_in_items sii ON isi.id = sii.invoice_stockIn_id
  //       LEFT JOIN products p ON sii.product_id = p.id
  //       GROUP BY isi.id, s.supplier_name
  //       ORDER BY isi.created_at DESC;
  //     `;
      
  //     const result = await pool.query(query);
  //     res.status(200).json({
  //       message: "Invoices with Stock Items fetched successfully.",
  //       invoices: result.rows,
  //     });
  //   } catch (error) {
  //     console.error("Error fetching stock-in invoices:", error);
  //     res.status(500).json({ message: "Internal server error." });
  //   }
  // }

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
  
}
