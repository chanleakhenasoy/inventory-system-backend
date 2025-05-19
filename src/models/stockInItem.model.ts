import { pool } from "../config/db";

export interface StockInItem {
    id: string;
    invoice_stockin_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    expire_date: Date;
    created_at: Date;
    updated_at: Date;
  }

export class StockInItemModel {
  private StockInItem?: StockInItem;

  constructor(stockInItem?: StockInItem) {
    this.StockInItem = stockInItem;
  }
  
    async create(): Promise<StockInItem> {
      if (!this.StockInItem) {
        throw new Error("StockInItem data is required.");
      }
  
      const query = `
        INSERT INTO stock_in_items (id, invoice_stockin_id, product_id, quantity, unit_price, expire_date, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      const values = [
        this.StockInItem.id,
        this.StockInItem.invoice_stockin_id,
        this.StockInItem.product_id,
        this.StockInItem.quantity,
        this.StockInItem.unit_price,
        this.StockInItem.expire_date,
        this.StockInItem.created_at,
        this.StockInItem.updated_at,
      ];
  
      const result = await pool.query(query, values);
      return result.rows[0];
    }

     async findAll(): Promise<StockInItem[]> {
        const query = `SELECT * FROM stock_in_items ORDER BY created_at DESC`;
        const result = await pool.query(query);
        return result.rows as StockInItem[];
    }

    async countProductsInStock(): Promise<{ name_en: string; total_quantity: number }[]> {
      const query = `
        SELECT 
          p.name_en, 
          COALESCE(SUM(sii.quantity), 0) AS total_quantity
        FROM 
          products p
        LEFT JOIN 
          stock_in_items sii ON p.id = sii.product_id
        GROUP BY 
          p.name_en
        ORDER BY 
          p.name_en;
      `;
      const result = await pool.query(query);
      return result.rows;
    }
    
    
  }