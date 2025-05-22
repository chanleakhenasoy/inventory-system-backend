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
  reference_number?: string; 
  purchase_date?: Date;
  due_date?: Date;
  supplier_id?: string;
  supplier_name?: string;
  name_en?: string; 
  name_kh?: string; 
  total_price: number;
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
      INSERT INTO stock_in_items (id, invoice_stockin_id, product_id, quantity, unit_price, expire_date, created_at, updated_at, total_price)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
      this.stockInItem.total_price

    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find all stock-in items with joined data
  async findAll(): Promise<StockInItem[]> {
    const query = `
      SELECT 
        sii.*, 
        (sii.quantity * sii.unit_price) AS total_price,
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
    total_price: number;
    expire_date: string;
    product_id?: string;
  }
): Promise<{ invoice: StockInItem; item: StockInItem }> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    
    if (!invoiceUpdate.purchase_date) {
      throw { status: 400, message: 'purchase_date is required' };
    }
    if (!invoiceUpdate.due_date) {
      throw { status: 400, message: 'due_date is required' };
    }
    if (!invoiceUpdate.reference_number) {
      throw { status: 400, message: 'reference_number is required' };
    }

   
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

    
    const updatedItemRes = await client.query(
      `
        UPDATE stock_in_items
        SET quantity = $1,
            unit_price = $2,
            total_price = CAST($1 AS numeric) * CAST($2 AS numeric),
            expire_date = $3,
            product_id = $4,
            updated_at = NOW()
        WHERE id = $5 AND invoice_stockin_id = $6
        RETURNING *;
      `,
      [
        itemUpdate.quantity,
        itemUpdate.unit_price,
        itemUpdate.total_price,
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

async deleteItemById(itemId: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM stock_in_items WHERE id = $1", [itemId]);
  } finally {
    client.release();
  }
}


async getTotalQuantityInhand(): Promise<{
  id: string;
  name_en: string;
  name_kh: string;
  beginning_quantity: number;
  total_stockin: number;
  total_stockout: number;
  quantity_in_hand: number;
  minimum_stock: number;
}[]> {
  const query = `
    SELECT 
      p.id,
      p.name_en,
      p.name_kh,
      p.beginning_quantity,
      COALESCE(s.total_stockin, 0) AS total_stockin,
      COALESCE(o.total_stockout, 0) AS total_stockout,
      (p.beginning_quantity + COALESCE(s.total_stockin, 0) - COALESCE(o.total_stockout, 0)) AS quantity_in_hand,
      p.minimum_stock
    FROM 
      products p
    LEFT JOIN (
      SELECT product_id, SUM(quantity) AS total_stockin
      FROM stock_in_items
      GROUP BY product_id
    ) s ON p.id = s.product_id
    LEFT JOIN (
      SELECT product_id, SUM(quantity) AS total_stockout
      FROM stock_out
      GROUP BY product_id
    ) o ON p.id = o.product_id
    ORDER BY 
      p.name_en;
  `;
  const result = await pool.query(query);
  return result.rows;
}



  
}


export default StockInItemModel;