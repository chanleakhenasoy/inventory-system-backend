import { pool } from "../config/db";

export interface InvoiceStockIn {
  id: string;
  supplier_id: string;
  purchase_date: Date;
  reference_number: string;
  due_date: Date;
  created_at: Date;
  updated_at: Date;
}


export class InvoiceStockInModel {
  private InvoiceStockIn?: InvoiceStockIn;

  constructor(invoiceStockIn?: InvoiceStockIn) {
    this.InvoiceStockIn = invoiceStockIn;
  }

  async create(): Promise<InvoiceStockIn> {
    if (!this.InvoiceStockIn) {
      throw new Error("Invoice data is required to create a new stock.");
    }

    const query = `
      INSERT INTO  invoice_stock_in  (id, supplier_id, purchase_date, reference_number, due_date, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      this.InvoiceStockIn.id,
      this.InvoiceStockIn.supplier_id,
      this.InvoiceStockIn.purchase_date,
      this.InvoiceStockIn.reference_number,
      this.InvoiceStockIn.due_date,
      this.InvoiceStockIn.created_at,
      this.InvoiceStockIn.updated_at,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }
  async findAll(limit: number, offset: number): Promise<InvoiceStockIn[]> {
    const query = `SELECT * FROM invoice_stock_in ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
    const result = await pool.query(query, [limit, offset]);
    return result.rows as InvoiceStockIn[];
  }

  async findAllStockIn(): Promise<InvoiceStockIn[]> {
    const query = `
      SELECT 
        isi.id,
        isi.supplier_id,
        s.supplier_name,
        isi.purchase_date,
        isi.reference_number,
        isi.due_date,
        isi.created_at,
        isi.updated_at,
        json_agg(
          json_build_object(
            'id', sii.id,
            'invoice_stockin_id', sii.invoice_stockIn_id,
            'product_id', sii.product_id,
            'quantity', sii.quantity,
            'unit_price', sii.unit_price,
            'expire_date', sii.expire_date,
            'created_at', sii.created_at,
            'updated_at', sii.updated_at,
            'name_en', p.name_en,
            'name_kh', p.name_kh
          )
        ) AS items
      FROM invoice_stock_in isi
      LEFT JOIN suppliers s ON isi.supplier_id = s.id
      LEFT JOIN stock_in_items sii ON isi.id = sii.invoice_stockIn_id
      LEFT JOIN products p ON sii.product_id = p.id
      GROUP BY isi.id, s.supplier_name
      ORDER BY isi.created_at DESC;
    `;
  
    const result = await pool.query(query);
    return result.rows as InvoiceStockIn[];
  }


async findStockInByInvoiceId(invoiceId: string): Promise<any | null> {
  const query = `
    SELECT 
      isi.id AS invoice_id,
      isi.supplier_id,
      isi.purchase_date,
      isi.reference_number,
      isi.due_date,
      sii.id AS item_id,
      sii.product_id,
      sii.quantity,
      sii.unit_price,
      sii.expire_date
    FROM invoice_stock_in isi
    LEFT JOIN stock_in_items sii ON isi.id = sii.invoice_stockin_id
    WHERE isi.id = $1;
  `;

  const result = await pool.query(query, [invoiceId]);

  if (result.rows.length === 0) return null;

  const firstRow = result.rows[0];

  const response = {
    invoice_id: firstRow.invoice_id,
    supplier_id: firstRow.supplier_id,
    purchase_date: firstRow.purchase_date?.toISOString().slice(0, 10),
    reference_number: firstRow.reference_number,
    due_date: firstRow.due_date?.toISOString().slice(0, 10),
    items: result.rows.map(row => ({
      item_id: row.item_id,
      product_id: row.product_id,
      quantity: row.quantity,
      unit_price: row.unit_price,
      expire_date: row.expire_date?.toISOString().slice(0, 10),
    }))
  };

  return response;
}



  // async findStockInInvoiceWithOneItem(invoiceId: string, itemId: string): Promise<any | null> {
  //   const query = `
  //     SELECT 
  //       isi.id AS invoice_id,
  //       isi.supplier_id,
  //       isi.purchase_date,
  //       isi.reference_number,
  //       isi.due_date,
  //       sii.id AS item_id,
  //       sii.product_id,
  //       sii.quantity,
  //       sii.unit_price,
  //       sii.expire_date
  //     FROM invoice_stock_in isi
  //     LEFT JOIN stock_in_items sii ON isi.id = sii.invoice_stockin_id
  //     WHERE isi.id = $1 AND sii.id = $2;
  //   `;
  
  //   const result = await pool.query(query, [invoiceId, itemId]);
  
  //   if (result.rows.length === 0) return null;
  
  //   const row = result.rows[0];
  
  //   const response = {
  //     invoice_id: row.invoice_id,
  //     supplier_id: row.supplier_id,
  //     purchase_date: row.purchase_date?.toISOString().slice(0, 10),
  //     reference_number: row.reference_number,
  //     due_date: row.due_date?.toISOString().slice(0, 10),
  //     items: [
  //       {
  //         item_id: row.item_id,
  //         product_id: row.product_id,
  //         quantity: row.quantity,
  //         unit_price: row.unit_price,
  //         expire_date: row.expire_date?.toISOString().slice(0, 10),
  //       }
  //     ]
  //   };
  
  //   return response;
  // }
  
  async findOne(id: string): Promise<InvoiceStockIn | null> {
    const query = `
      SELECT * FROM stock_in
      WHERE id = $1
      LIMIT 1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

}