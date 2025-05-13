import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { StockoutModel } from "../models/stockout.model";
import { ProductModel } from "../models/product.model";

export const createStockout = async (req: Request, res: Response) => {
const { quantity} = req.body;
const { product_id } = req.params;
const { user_id } = req.params;
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