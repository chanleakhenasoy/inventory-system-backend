import { Request, Response } from "express";
import { SupplierModel } from "../models/supplier.model";
import { v4 as uuidv4 } from "uuid";

export const createSupplier = async (req: Request, res: Response) => {
  const { supplier_name, phone_number, address, company_name } = req.body;
  const id = uuidv4();
  try {
    const supplierModel = new SupplierModel();
    const existingSupplier = await supplierModel.findOne(supplier_name);

    if (existingSupplier) {
      res.status(409).json({ message: "Supplier has already exists." });
    }

    const newSupplier = new SupplierModel({
      id,
      supplier_name,
      phone_number,
      address,
      company_name,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const data = await newSupplier.create();

    res.status(201).json({ message: "Supplier created successfully.", data });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};

// Controller to get all suppliers
export const getAllSuppliers = async (req: Request, res: Response) => {
  try {
    const supplierModel = new SupplierModel();

    const { page = 1, limit = 10, search = '' } = req.query; // Default values for pagination
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const offset = (pageNumber - 1) * limitNumber;

    const suppliers = await supplierModel.findAll(limitNumber, offset, search as string);

    console.log(page, limit);

    res
      .status(200)
      .json({ message: "Get supplier successfully", data: suppliers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getSupplierById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supplierModel = new SupplierModel();
    const supplier = await supplierModel.findById(id);

    if (!supplier) {
      res.status(404).json({ message: "Supplier not found." });
      return;
    }

    res.status(200).json({ data: supplier });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { supplier_name, phone_number, address, company_name } = req.body;
    const supplierModel = new SupplierModel();

    // Check if supplier exists
    const existingSupplier = await supplierModel.findById(id);
    if (!existingSupplier) {
      res.status(404).json({ message: "Supplier not found." });
      return;
    }

    // Update supplier data
    const updatedSupplier = await supplierModel.update(id, {
      supplier_name,
      phone_number,
      address,
      company_name,
    });

    res.status(200).json({
      message: "Supplier updated successfully.",
      data: updatedSupplier,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supplierModel = new SupplierModel();

    await supplierModel.delete(id);

    res.status(200).json({ message: "Supplier deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};
