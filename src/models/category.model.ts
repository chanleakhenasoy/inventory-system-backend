import { pool } from "../config/db";

// Supplier Interface (TypeScript type definition)
export interface Category {
  id: string;
  category_name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export class CategoryModel {
  private Category?: Category;

  constructor(category?: Category) {
    this.Category = category;
  }

  async create(): Promise<Category> {
    if (!this.Category) {
      throw new Error("category data is required to create a new category.");
    }

    const query = `
      INSERT INTO categories (id, category_name, description, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      this.Category.id,
      this.Category.category_name,
      this.Category.description,
      this.Category.created_at,
      this.Category.updated_at,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findOne(category_name: string): Promise<Category | null> {
    const query = `
      SELECT * FROM categories
      WHERE category_name = $1 
      LIMIT 1
    `;
    const values = [category_name];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async findAll(): Promise<Category[]> {
    const query = `SELECT * FROM categories ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return result.rows;
  }

  // Get supplier by ID
  async findById(id: string): Promise<Category | null> {
    const query = `
      SELECT * FROM categories
      WHERE id = $1 
      LIMIT 1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Update supplier by ID
  async update(id: string, data: Partial<Category>): Promise<Category | null> {
    if (!data || Object.keys(data).length === 0) {
      throw new Error("Category data is required to update a category.");
    }

    const fields = Object.keys(data)
      .map((field, index) => `${field} = $${index + 1}`)
      .join(", ");
    const values = [...Object.values(data), id];

    const query = `
      UPDATE categories
      SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${values.length}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM categories WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0] > 0;
  } 
  
  async countTotalCategory(): Promise<number> {
    const query = `SELECT COUNT(*) FROM categories`;
    const result = await pool.query(query);
    return parseInt(result.rows[0].count, 10);
  }


}
