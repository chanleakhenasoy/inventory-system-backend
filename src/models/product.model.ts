import { pool } from "../config/db";

export interface Product {
  id: string;
  category_id: string;
  product_code: string;
  name_en: string;
  name_kh: string;
  beginning_quantity: number;
  created_at: Date;
  updated_at: Date;
}

export class ProductModel {
  private Product?: Product;

  constructor(product?: Product) {
    this.Product = product;
  }

  async create(): Promise<Product> {
    if (!this.Product) {
      throw new Error("Product data is required to create a new product.");
    }

    const query = `
      INSERT INTO products (id, category_id, product_code, name_en, name_kh, beginning_quantity, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      this.Product.id,
      this.Product.category_id,
      this.Product.product_code,
      this.Product.name_en,
      this.Product.name_kh,
      this.Product.created_at,
      this.Product.updated_at,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findOne(
    product_code: any,
    name_en: any,
    name_kh: string
  ): Promise<Product | null> {
    const query = `
      SELECT * FROM products
      WHERE product_code = $1
      AND name_en = $2
      AND name_kh = $3
      LIMIT 1
    `;
    const values = [product_code, name_en, name_kh];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async findAll(): Promise<Product[]> {
    const query = `SELECT * FROM products ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return result.rows;
  }

  // Get supplier by ID
  async findById(id: string): Promise<Product | null> {
    const query = `
      SELECT * FROM products
      WHERE id = $1 
      LIMIT 1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Update supplier by ID
  async update(id: string, data: Partial<Product>): Promise<Product | null> {
    if (!data || Object.keys(data).length === 0) {
      throw new Error("Product data is required to update a product.");
    }

    const fields = Object.keys(data)
      .map((field, index) => `${field} = $${index + 1}`)
      .join(", ");
    const values = [...Object.values(data), id];

    const query = `
      UPDATE products
      SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${values.length}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM products WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0] > 0;
  }
}
