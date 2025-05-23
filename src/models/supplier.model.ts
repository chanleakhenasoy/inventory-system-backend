import { pool } from "../config/db";

// Supplier Interface (TypeScript type definition)
export interface Supplier {
  id: string;
  supplier_name: string;
  phone_number?: string;
  address?: string;
  company_name?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class SupplierModel {
  private supplier?: Supplier;

  constructor(supplier?: Supplier) {
    this.supplier = supplier;
  }

  // Create a new supplier
  async create(): Promise<Supplier> {
    if (!this.supplier) {
      throw new Error("Supplier data is required to create a new supplier.");
    }

    const query = `
      INSERT INTO suppliers (id, supplier_name, phone_number, address, company_name, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    const values = [
      this.supplier.id,
      this.supplier.supplier_name,
      this.supplier.phone_number,
      this.supplier.address,
      this.supplier.company_name
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find supplier by name
  async findOne(supplier_name: string): Promise<Supplier | null> {
    const query = `
      SELECT * FROM suppliers 
      WHERE supplier_name = $1 
      LIMIT 1
    `;
    const values = [supplier_name];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Get all suppliers
  async findAll(limit: number, offset: number): Promise<Supplier[]> {
    const query = `SELECT * FROM suppliers ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  // Get supplier by ID
  async findById(id: string): Promise<Supplier | null> {
    const query = `
      SELECT * FROM suppliers 
      WHERE id = $1 
      LIMIT 1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Update supplier by ID
  async update(id: string, data: Partial<Supplier>): Promise<Supplier | null> {
    if (!data || Object.keys(data).length === 0) {
      throw new Error("Supplier data is required to update a supplier.");
    }

    const fields = Object.keys(data)
      .map((field, index) => `${field} = $${index + 1}`)
      .join(", ");
    const values = [...Object.values(data), id];

    const query = `
      UPDATE suppliers 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${values.length}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM suppliers WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0] > 0;
  }

}
