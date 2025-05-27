import { Request, Response } from "express";
import { InvoiceStockInModel } from "../models/stockInInvoice.model";
import { StockInItemModel } from "../models/stockInItem.model";
import { v4 as uuidv4 } from "uuid";
import { date } from "zod";

export class StockInController {
  
  async createStockIn(req: Request, res: Response) {
    try {
      const { purchase_date, reference_number, due_date, items } = req.body;
      const { supplier_id } = req.params;

      if (!Array.isArray(items) || items.length === 0) {
         res.status(400).json({ message: "Items array is required and cannot be empty." });
         return;
      }

      const invoiceId = uuidv4();

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
            total_price: item.total_price,
          });
          return await stockInItemModel.create();
        })
      );

      res.status(201).json({
        message: "Invoice and stock-in items created successfully.",
        invoice,
        items: createdItems,
      });
    } catch (error: any) {
      if (error.code === "23505") {
         res.status(400).json({
          message: "Product name or reference number already exist.",
        });
        return;
      }
    
      // default for other errors
      res.status(500).json({
        message: "Internal server error.",
      });
      return; 
    }
  }

  async getAllStockIn(req: Request, res: Response) {
    try {
      const stockInModel = new InvoiceStockInModel();
      const { page = 1, limit = 10, search = "" } = req.query;
      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);
      const offset = (pageNumber - 1) * limitNumber;

      const total = await stockInModel.findAllStockIn(limitNumber, offset, search as string);

      res.status(200).json({ message: "Get stock in all successfully", data: total });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  }

  async getAllItems(req: Request, res: Response) {
    try {
      const stockInModel = new StockInItemModel();
      const { page = 1, limit = 10 } = req.query;
      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);
      const offset = (pageNumber - 1) * limitNumber;

      const total = await stockInModel.findAll(limitNumber, offset);

      res.status(200).json({ message: "Get all items successfully", data: total });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  }

  async getItemById(req: Request, res: Response) {
    const { invoiceId, itemId } = req.params;
    try {
      const stockInModel = new StockInItemModel();
      const total = await stockInModel.findItemById(invoiceId, itemId);
      res.status(200).json({ message: "Get items by id successfully", data: total });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  }

  async getStockInByInvoiceId(req: Request, res: Response) {
    const { invoiceId } = req.params;
    try {
      const stockInModel = new InvoiceStockInModel();
      const total = await stockInModel.findStockInByInvoiceId(invoiceId);
      res.status(200).json({ message: "Get invoice id successfully", data: total });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  }

  // async getTotalStockIn(req: Request, res: Response) {
  //   try {
  //     const stockInModel = new StockInItemModel();
  //     const total = await stockInModel.countProductsInStock();
  //     res.status(200).json({ message: "Get stock in total successfully", data: total });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ message: "Internal server error." });
  //   }
  // }

  async updateStockIn(req: Request, res: Response) {
    const { invoiceId, itemId } = req.params;
    const {
      purchase_date,
      due_date,
      supplier_id,
      quantity,
      unit_price,
      total_price,
      expire_date,
      reference_number,
      product_id,
    } = req.body;

    try {
      const stockInModel = new StockInItemModel();
      const item = await stockInModel.findItemById(invoiceId, itemId);

      if (!item) {
        res.status(404).json({ message: "Item not found" });
        return;
      }

      const invoiceUpdate = {
        purchase_date,
        due_date,
        reference_number,
        ...(supplier_id && { supplier_id }),
      };

      const itemUpdate = {
        quantity,
        unit_price,
        total_price,
        expire_date,
        ...(product_id && { product_id }),
      };

      const updatedData = await stockInModel.updateInvoiceAndItem(invoiceId, itemId, {
        invoiceUpdate,
        itemUpdate,
      });

      res.status(200).json({ message: "Updated successfully", data: updatedData });
    } catch (error) {
      console.error("Update failed:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteItem(req: Request, res: Response) {
    const { invoiceId, itemId } = req.params;
    try {
      const stockInModel = new StockInItemModel();
      await stockInModel.deleteItemById(invoiceId, itemId);
      res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to delete item" });
    }
  }

  async deleteInvoice(req: Request, res: Response) {
    const { invoiceId } = req.params;
    try {
      const stockInModel = new InvoiceStockInModel();
      const data = await stockInModel.deleteInvoiceStockInById(invoiceId);
      res.status(200).json({ message: "Invoice deleted successfully", data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  }

//   async getTotalQuantityInhand(req: Request, res: Response) {
//     try {
//       const stockInModel = new StockInItemModel();
//       const total = await stockInModel.getTotalQuantityInhand();
//       res.status(200).json({ message: "Get total quantity in hand successfully", data: total });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Internal server error." });
//     }
//   }

//   async getUnitAvgCost(req: Request, res: Response) {
//     try {
//       const stockInModel = new StockInItemModel();
//       const result = await stockInModel.getTotalUnitAvgCost();
//       res.status(200).json({
//         message: "Get unit average cost successfully",
//         data: result,
//       });
//     } catch (error) {
//       console.error("Error in getUnitAvgCost:", error);
//       res.status(500).json({ message: "Internal server error." });
//     }
//   }


async getTotalQuanttityItem(req: Request, res: Response) {
  try {
    const stockInModel = new StockInItemModel();
    const total = await stockInModel.countTotalStockInQuantity();
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


