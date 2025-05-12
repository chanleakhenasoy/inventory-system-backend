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
INSERT INTO stockouts (id, product_name, quantity, employee, created_at, updated_at)
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
}