import { pool } from "../config/db";

export interface StockInItem {
    id: string;
    invoice_stockIn_id: string;
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
        INSERT INTO stock_in_items (id, invoice_stockIn_id, product_id, quantity, unit_price, expire_date, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      const values = [
        this.StockInItem.id,
        this.StockInItem.invoice_stockIn_id,
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
  
    // async findByStockInId(stock_in_id: string): Promise<StockInItem[]> {
    //   const query = `
    //     SELECT * FROM stock_in_items
    //     WHERE stock_in_id = $1
    //     ORDER BY expire_date
    //   `;
    //   const result = await pool.query(query, [stock_in_id]);
    //   return result.rows;
    // }
  }