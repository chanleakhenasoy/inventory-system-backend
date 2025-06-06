import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { CategoryModel } from "../models/category.model";
import { ProductModel } from "../models/product.model";
import { StockInItemModel } from "../models/stockInItem.model";

export const createProduct = async (req: Request, res: Response) => {
  const { category_id } = req.params; 
  const { product_code, name_en, name_kh, beginning_quantity, minimum_stock } = req.body;
  const id = uuidv4();

  try {
    const productModel = new ProductModel();
    const categoryModel = new CategoryModel();

    // Check if product already exists
    const existingProduct = await productModel.findOne(product_code, name_en, name_kh);
    if (existingProduct) {
       res.status(400).json({ message: "Product already exists." });
       return;
    }

    // Validate category by ID from param
    const category = await categoryModel.findById(category_id);
    if (!category) {
       res.status(404).json({ message: "Category not found." });
       return;
    }

    // Create new product
    const newProduct = new ProductModel({
      id,
      category_id,
      product_code,
      name_en,
      name_kh,
      beginning_quantity,
      minimum_stock,
      created_at: new Date(),
      updated_at: new Date()
    });
    console.log(newProduct)

    const data = await newProduct.create();

    res.status(201).json({ message: "Product created successfully.", data });
  } catch (error: any) {
    if (error.code === "23505") {
     res.status(400).json({
        message: "Product name already exist.",
      });
      return; 
    }
  
  
     res.status(500).json({
      message: "Internal server error.",
    });
    return;
  }
};

export const getAllProduct = async (req: Request, res: Response) => {
  try {
    const productModel = new ProductModel();

    const { page = 1, limit = 10, search = '' } = req.query; // Default values for pagination
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const offset = (pageNumber - 1) * limitNumber;

    const product = await productModel.findAll(limitNumber, offset, search as string);
    
    console.log(page, limit)
    
    res
      .status(200)
      .json({ message: "Get all product successfully", data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productModel = new ProductModel();
    const product = await productModel.findById(id);

    if (!product) {
      res.status(404).json({ message: "product not found." });
      return;
    }

    res
      .status(200)
      .json({ message: "Get product by id successfully", data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { product_code, name_en, name_kh, beginning_quantity, minimum_stock, category_id} = req.body;
    const productModel = new ProductModel();

    const existingProduct = await productModel.findById(id);
    if (!existingProduct) {
      res.status(404).json({ message: "Product not found." });
      return;
    }

    // Update supplier data
    const updatedProduct = await productModel.update(id, {
        product_code,
        name_en,
        name_kh,
        beginning_quantity,
        minimum_stock,
        category_id,
        created_at: new Date(),
        updated_at: new Date(),
    });

    res.status(200).json({
      message: "Product updated successfully.",
      data: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productModel = new ProductModel();

    await productModel.delete(id);

    res.status(200).json({ message: "product deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};

export const getTotalProduct = async (req: Request, res: Response) => {
  try {
    const productModel = new ProductModel();
    const total = await productModel.countTotalProducts();
    res
      .status(200)
      .json({ message: "Get product total successfully", data: total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};
export const getProductdatabase = async (req: Request, res: Response) => {
  try {
    const productModel = new ProductModel();

    const { page = 1, limit = 10, search = '' } = req.query; 
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const offset = (pageNumber - 1) * limitNumber;

    const total = await productModel.getStockSummary(limitNumber, offset, search as string);
    
    res.json({ success: true, data: total });
  } catch (error) {
    console.error("Error in getStockSummaryController:", error);
    res.status(500).json({ success: false, message: "Failed to fetch stock summary" });
  }
};
