import { pool } from "../config/db";

// Stockout Interface (TypeScript type definition)
export interface StockOut {
id: string;
product_id: string;
quantity: number;
employee: string;
created_at?: Date;
updated_at?: Date;
}

export class StockoutModel {
private stockout?: StockOut;

constructor(stockout?: StockOut) {
this.stockout = stockout;
}

// Create a new stockout
async create(): Promise<StockOut> {
if (!this.stockout) {
throw new Error("Stockout data is required to create a new stockout.");
}

const query = `
INSERT INTO stock_out (id, product_id, quantity, employee, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *
`;
const values = [
this.stockout.id,
this.stockout.product_id,
this.stockout.quantity,
this.stockout.employee,
this.stockout.created_at,
this.stockout.updated_at
];

const result = await pool.query(query, values);
return result.rows[0];
}

async findAll(limit: number, offset: number): Promise<StockOut[]> {
  const query = `
    SELECT 
      stock_out.*, 
      products.name_en, 
      products.name_kh, 
      users.user_name 
    FROM 
      stock_out 
    JOIN 
      products ON stock_out.product_id::uuid = products.id 
    JOIN 
      users ON stock_out.employee::uuid = users.id 
    ORDER BY 
      stock_out.created_at DESC LIMIT $1 OFFSET $2;
  `;
  const result = await pool.query(query, [limit, offset]);
  return result.rows;
}





async countTotalProducts(): Promise<number> {
    const query = `SELECT COUNT(*) FROM stock_out`;
    const result = await pool.query(query);
    return parseInt(result.rows[0].count, 10);
  }
}