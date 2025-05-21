import { pool } from "../config/db";

// Extended interface to include all fields returned by queries
export interface StockInItem {
  id: string;
  invoice_stockin_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  expire_date: Date;
  created_at: Date;
  updated_at: Date;
  reference_number?: string; // Optional fields from invoice_stock_in
  purchase_date?: Date;
  due_date?: Date;
  supplier_id?: string;
  supplier_name?: string;
  name_en?: string; // Product name
  name_kh?: string; // Khmer name
}

export class StockInItemModel {
  private stockInItem?: StockInItem;

  constructor(stockInItem?: StockInItem) {
    this.stockInItem = stockInItem;
  }

  // Create a new stock-in item
  async create(): Promise<StockInItem> {
    if (!this.stockInItem) {
      throw new Error("StockInItem data is required.");
    }

    const query = `
      INSERT INTO stock_in_items (id, invoice_stockin_id, product_id, quantity, unit_price, expire_date, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      this.stockInItem.id,
      this.stockInItem.invoice_stockin_id,
      this.stockInItem.product_id,
      this.stockInItem.quantity,
      this.stockInItem.unit_price,
      this.stockInItem.expire_date,
      this.stockInItem.created_at || new Date(),
      this.stockInItem.updated_at || new Date(),
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find all stock-in items with joined data
  async findAll(): Promise<StockInItem[]> {
    const query = `
      SELECT 
        sii.*, 
        i.reference_number, 
        i.purchase_date, 
        i.due_date, 
        i.supplier_id, 
        s.supplier_name,
        p.name_en,
        p.name_kh
      FROM stock_in_items AS sii
      JOIN invoice_stock_in AS i ON sii.invoice_stockin_id = i.id
      JOIN suppliers AS s ON i.supplier_id = s.id
      JOIN products AS p ON sii.product_id = p.id
      ORDER BY sii.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows as StockInItem[];
  }

  // Find a stock-in item by ID with joined data
  async findById(id: string): Promise<StockInItem | null> {
    const query = `
      SELECT 
        sii.*, 
        i.reference_number, 
        i.purchase_date, 
        i.due_date, 
        i.supplier_id, 
        s.supplier_name,
        p.name_en,
        p.name_kh
      FROM stock_in_items AS sii
      JOIN invoice_stock_in AS i ON sii.invoice_stockin_id = i.id
      JOIN suppliers AS s ON i.supplier_id = s.id
      JOIN products AS p ON sii.product_id = p.id
      WHERE sii.id = $1
      ORDER BY sii.created_at DESC
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Find stock-in items by invoice ID with joined data
  async findStockInByInvoiceId(invoiceId: string): Promise<StockInItem[]> {
    const query = `
      SELECT 
        sii.*, 
        i.reference_number, 
        i.purchase_date, 
        i.due_date, 
        i.supplier_id, 
        s.supplier_name,
        p.name_en,
        p.name_kh
      FROM stock_in_items AS sii
      JOIN invoice_stock_in AS i ON sii.invoice_stockin_id = i.id
      JOIN suppliers AS s ON i.supplier_id = s.id
      JOIN products AS p ON sii.product_id = p.id
      WHERE sii.invoice_stockin_id = $1
      ORDER BY sii.created_at DESC
    `;
    const result = await pool.query(query, [invoiceId]);
    return result.rows as StockInItem[];
  }

  async updateInvoiceAndItem(
    invoiceId: string,
    itemId: string,
    invoiceUpdate: {
      purchase_date: string;
      due_date: string;
      reference_number: string;
      supplier_id?: string;
    },
    itemUpdate: {
      quantity: number;
      unit_price: number;
      expire_date: string;
      product_id?: string;
    }
  ): Promise<{ invoice: StockInItem; item: StockInItem }> {
    const client = await pool.connect();
  
    try {
      await client.query('BEGIN');
  
      // Get current supplier_id if not provided
      let supplierId = invoiceUpdate.supplier_id;
      if (!supplierId) {
        const supplierRes = await client.query(
          'SELECT supplier_id FROM invoice_stock_in WHERE id = $1',
          [invoiceId]
        );
        if (supplierRes.rowCount === 0) {
          throw { status: 404, message: 'Invoice not found' };
        }
        supplierId = supplierRes.rows[0].supplier_id;
      }
  
      // Update invoice
      const updatedInvoiceRes = await client.query(
        `
          UPDATE invoice_stock_in
          SET purchase_date = $1,
              due_date = $2,
              supplier_id = $3,
              reference_number = $4,
              updated_at = NOW()
          WHERE id = $5
          RETURNING *;
        `,
        [
          invoiceUpdate.purchase_date,
          invoiceUpdate.due_date,
          supplierId,
          invoiceUpdate.reference_number,
          invoiceId,
        ]
      );
  
      if (updatedInvoiceRes.rowCount === 0) {
        throw { status: 404, message: 'Invoice not found or update failed' };
      }
  
      // Get current product_id if not provided
      let productId = itemUpdate.product_id;
      if (!productId) {
        const productRes = await client.query(
          `
            SELECT product_id FROM stock_in_items
            WHERE id = $1 AND invoice_stockin_id = $2
          `,
          [itemId, invoiceId]
        );
        if (productRes.rowCount === 0) {
          throw { status: 404, message: 'Item not found for the given invoice' };
        }
        productId = productRes.rows[0].product_id;
      }
  
      // Update item
      const updatedItemRes = await client.query(
        `
          UPDATE stock_in_items
          SET quantity = $1,
              unit_price = $2,
              expire_date = $3,
              product_id = $4,
              updated_at = NOW()
          WHERE id = $5 AND invoice_stockin_id = $6
          RETURNING *;
        `,
        [
          itemUpdate.quantity,
          itemUpdate.unit_price,
          itemUpdate.expire_date,
          productId,
          itemId,
          invoiceId,
        ]
      );
  
      if (updatedItemRes.rowCount === 0) {
        throw { status: 404, message: 'Item not found or update failed' };
      }
  
      await client.query('COMMIT');
  
      // Optional: load full joined data
      const invoice = await this.findStockInByInvoiceId(invoiceId);
      const item = await this.findById(itemId);
  
      return {
        invoice: invoice[0] || updatedInvoiceRes.rows[0],
        item: item || updatedItemRes.rows[0],
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
  
  // Count total quantity of products in stock
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

export default StockInItemModel;