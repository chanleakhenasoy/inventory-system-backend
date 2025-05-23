import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { StockoutModel } from "../models/stockout.model";
import { ProductModel } from "../models/product.model";

export const createStockout = async (req: Request, res: Response) => {
const { quantity} = req.body;
const { product_id, user_id } = req.params;
const id = uuidv4();

try {
const productModel = new ProductModel();
const product = await productModel.findById(product_id);

if (!product) {
res.status(404).json({ message: "Product not found." });
return;
}

const newStockout = new StockoutModel({
id, 
product_id,
quantity,
employee: user_id,
created_at: new Date(),
updated_at: new Date(),
});

const data = await newStockout.create();

res.status(201).json({ message: "Stockout created successfully.", data });
} catch (error) {
console.error(error);
res.status(500).json({ message: "Internal server error." });
}
};

export const getAllStockouts = async (req: Request, res: Response) => {
  try {
    const stockoutModel = new StockoutModel();

    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const offset = (pageNumber - 1) * limitNumber;

    const stockouts = await stockoutModel.findAll(limitNumber, offset);
    res
      .status(200)
      .json({ message: "Get supplier successfully", data: stockouts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getTotalStockOut = async (req: Request, res: Response) => {
    try {
      const stockOutModel = new StockoutModel();
      const total = await stockOutModel.countTotalProducts();
      res
        .status(200)
        .json({ message: "Get stock out total successfully", data: total });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
      return;
    }
  };

