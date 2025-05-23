import { Request, Response } from "express";
import { SupplierModel } from "../models/supplier.model";
import { v4 as uuidv4 } from "uuid";
import { CategoryModel } from "../models/category.model";

export const createCategory = async (req: Request, res: Response) => {
  const { category_name, description } = req.body;
  const id = uuidv4();

  try {
    const categoryModel = new CategoryModel();
    const existingCategory = await categoryModel.findOne(category_name);

    if (existingCategory) {
      res.status(409).json({ message: "category has already exists." });
    }

    const newCategory = new CategoryModel({
      id,
      category_name,
      description,
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log(newCategory);

    const data = await newCategory.create();

    res.status(201).json({ message: "Category create successfully.", data });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};


export const getAllcategory = async (req: Request, res: Response) => {
  try {
    const categoryModel = new CategoryModel();

    const { page = 1, limit = 10 } = req.query; // Default values for pagination
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const offset = (pageNumber - 1) * limitNumber;

    const category = await categoryModel.findAll(limitNumber, offset);
    console.log(page, limit)

    res
      .status(200)
      .json({ message: "Get all category successfully", data: category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const categoryModel = new CategoryModel();
    const category = await categoryModel.findById(id);

    if (!category) {
      res.status(404).json({ message: "Category not found." });
      return;
    }

    res.status(200).json({message:"Get category by id successfully", data: category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { category_name, description } = req.body;
    const categoryModel = new CategoryModel();

    // Check if supplier exists
    const existingCategory = await categoryModel.findById(id);
    if (!existingCategory) {
      res.status(404).json({ message: "Supplier not found." });
      return;
    }

    // Update supplier data
    const updatedCategory = await categoryModel.update(id, {
      category_name,
      description,
   
    });

    res.status(200).json({
      message: "Category updated successfully.",
      data: updatedCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const categoryModel = new CategoryModel();

    await categoryModel.delete(id);

    res.status(200).json({ message: "Category deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};

export const getTotalCategory = async (req: Request, res: Response) => {
  try {
    const productModel = new CategoryModel();
    const total = await productModel.countTotalCategory();
    res
      .status(200)
      .json({ message: "Get category total successfully", data: total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};
