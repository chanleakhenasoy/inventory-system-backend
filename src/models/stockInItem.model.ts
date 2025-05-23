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
  async findById(invoiceId: string, itemId: string): Promise<StockInItem | null> {
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
      WHERE sii.id = $1 AND sii.invoice_stockin_id = $2
      ORDER BY sii.created_at DESC
    `;
    const result = await pool.query(query, [itemId, invoiceId]);
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
    updateData: {
      invoiceUpdate: {
        purchase_date: string;
        due_date: string;
        reference_number: string;
        supplier_id?: string;
      };
      itemUpdate: {
        product_id?: string;
        quantity: number;
        unit_price: number;
        total_price: number;
        expire_date: string;
      };
    }
  ): Promise<{ invoice: StockInItem; item: StockInItem }> {
    const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Validate updateData
    if (!updateData.invoiceUpdate || !updateData.itemUpdate) {
      throw { status: 400, message: 'invoiceUpdate and itemUpdate are required' };
    }

    const { invoiceUpdate, itemUpdate } = updateData;

    // Validate invoice update fields
    if (!invoiceUpdate.purchase_date) {
      throw { status: 400, message: 'purchase_date is required' };
    }
    if (!invoiceUpdate.due_date) {
      throw { status: 400, message: 'due_date is required' };
    }
    if (!invoiceUpdate.reference_number) {
      throw { status: 400, message: 'reference_number is required' };
    }

    // Get supplier_id if not provided
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

    // Update invoice_stock_in
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

    // Get product_id if not provided
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

    // Ensure type consistency
    const quantity = Math.floor(Number(itemUpdate.quantity || 0)); // Cast to integer
    const unit_price = Number(Number(itemUpdate.unit_price || 0).toFixed(2)); // Numeric with 2 decimals
    const total_price = Number(Number(itemUpdate.total_price || quantity * unit_price).toFixed(2)); // Numeric with 2 decimals

    // Validate and handle expire_date
    console.log('Received expire_date:', itemUpdate.expire_date);
    let expire_date = itemUpdate.expire_date;
    if (!expire_date) {
      // Fetch existing expire_date as fallback
      const existingItemRes = await client.query(
        'SELECT expire_date FROM stock_in_items WHERE id = $1 AND invoice_stockin_id = $2',
        [itemId, invoiceId]
      );
      if (existingItemRes.rowCount === 0) {
        throw { status: 404, message: 'Item not found for expire_date fallback' };
      }
      expire_date = existingItemRes.rows[0].expire_date;
      if (!expire_date) {
        // Use default date (one year from today) if no existing expire_date
        expire_date = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          .toISOString()
          .split('T')[0];
      }
    }

    // Validate item update fields
    if (quantity < 0 || unit_price < 0) {
      throw { status: 400, message: 'Quantity and unit price must be non-negative' };
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expire_date)) {
      throw { status: 400, message: 'expire_date must be a valid date in YYYY-MM-DD format' };
    }

    // Update stock_in_items
    const updatedItemRes = await client.query(
      `
        UPDATE stock_in_items
        SET quantity = $1,
            unit_price = $2,
            total_price = $3,
            expire_date = $4,
            product_id = $5,
            updated_at = NOW()
        WHERE id = $6 AND invoice_stockin_id = $7
        RETURNING *;
      `,
      [
        quantity,
        unit_price,
        total_price,
        expire_date,
        productId,
        itemId,
        invoiceId,
      ]
    );

    if (updatedItemRes.rowCount === 0) {
      throw { status: 404, message: 'Item not found or update failed' };
    }

    await client.query('COMMIT');

    // Fetch updated invoice and item
    const invoice = await this.findStockInByInvoiceId(invoiceId);
    const item = await this.findById(invoiceId,itemId);

    return {
      invoice: invoice[0] || updatedInvoiceRes.rows[0],
      item: item || updatedItemRes.rows[0],
    };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update error:', err);
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

  async deleteItemById(invoiceId: string, itemId: string): Promise<void> {
    const client = await pool.connect();
  
    try {
      await client.query('BEGIN');
  
      const res = await client.query(
        `
          DELETE FROM stock_in_items
          WHERE invoice_stockin_id = $1 AND id = $2
          RETURNING *;
        `,
        [invoiceId, itemId]
      );
  
      if (res.rowCount === 0) {
        throw { status: 404, message: "Item not found or does not belong to the invoice" };
      }
  
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Delete failed:", error);
      throw error;
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
 


async getTotalUnitAvgCost(): Promise<{
  id: string;
  product_id: string;
  total_price: number;
  unit_price: number;
  calculated_quantity: number;
}[]> {
  const query = `
    SELECT 
      id,
      product_id,
      total_price,
      unit_price,
      ROUND(total_price / NULLIF(unit_price, 0), 2) AS calculated_quantity
    FROM 
      stock_in_items
    WHERE 
      total_price IS NOT NULL AND unit_price IS NOT NULL
    ORDER BY 
      created_at DESC;
  `;

  const result = await pool.query(query);
  return result.rows;
}
}
export default StockInItemModel;