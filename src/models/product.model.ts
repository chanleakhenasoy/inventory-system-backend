import { pool } from "../config/db";

export interface Product {
  id: string;
  category_id: string;
  product_code: string;
  name_en: string;
  name_kh: string;
  beginning_quantity: number;
  minimum_stock: number;
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
      INSERT INTO products (id, category_id, product_code, name_en, name_kh, beginning_quantity, created_at, updated_at, minimum_stock)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      this.Product.id,
      this.Product.category_id,
      this.Product.product_code,
      this.Product.name_en,
      this.Product.name_kh,
      this.Product.beginning_quantity,
      this.Product.created_at,
      this.Product.updated_at,
      this.Product.minimum_stock,
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

 async findAll(limit: number, offset: number, search: string): Promise<Product[]> {
  let query = `
    SELECT 
      p.id,
      p.category_id,
      c.category_name AS category_name,
      p.product_code,
      p.name_en,
      p.name_kh,
      p.beginning_quantity,
      p.minimum_stock,
      p.created_at,
      p.updated_at
    FROM 
      products p
    JOIN 
      categories c 
    ON 
      p.category_id = c.id
  `;
  const queryParams: any[] = [limit, offset];

  // Add search condition if search term is provided
  if (search) {
    query += `
      WHERE 
        p.name_en ILIKE $3
        OR p.name_kh ILIKE $3
        OR p.product_code ILIKE $3
    `;
    queryParams.push(`%${search}%`);
  }

  query += `
    ORDER BY 
      p.created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const result = await pool.query(query, queryParams);
  return result.rows;
}

async findById(id: string): Promise<Product | null> {
  const query = `
    SELECT 
      p.id,
      p.name_en,
      p.name_kh,
      p.product_code,
      p.beginning_quantity,
      p.minimum_stock,
      p.category_id,
      c.category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = $1
    LIMIT 1
  `;
    
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}


  async update(id: string, data: Partial<Product>): Promise<Product | null> {
    if (!data || Object.keys(data).length === 0) {
      throw new Error("Product data is required to update a product.");
    }
  
    // Automatically add updated_at field
    data.updated_at = new Date();
  
    const keys = Object.keys(data);
    const values = Object.values(data);
  
    const setClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(", ");
  
    const query = `
      UPDATE products
      SET ${setClause}
      WHERE id = $${keys.length + 1}
      RETURNING *
    `;
  
    const result = await pool.query(query, [...values, id]);
    return result.rows[0] || null;
  }
  
  async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM products WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0] > 0;
  }

  async countTotalProducts(): Promise<number> {
    const query = `SELECT COUNT(*) FROM products`;
    const result = await pool.query(query);
    return parseInt(result.rows[0].count, 10);
  }
}


