import { encryptPassword, comparePassword } from "../utils/encrypt";
import { pool} from "../config/db";

export interface User {
  id: string;
  user_name: string;
  password: string;
  email: string;
  role: string
  created_at?: Date;
  updated_at?: Date;
}

export class UserModel {
  private user?: User

  constructor(user?: User) {
    this.user = user
  }


  // Register a new user
  async register(): Promise<void> {
    if (!this.user) {
      throw new Error("User data is required to create a new user.");
    }
    const hashPassword = encryptPassword(this.user.password);
    const query = `
      INSERT INTO users (id, user_name, email, role, password, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `;
    const values = [this.user.id, this.user.user_name, this.user.email, this.user.role, hashPassword,
      this.user.created_at, this.user.updated_at];

    await pool.query(query, values);
  }

  // Check if a user exists by email
  async findByEmail(email: string): Promise<User | null> {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await pool.query(query, [email]);
    const rows = result.rows;
    return rows.length > 0 ? rows[0] : null;
  }

  // Validate user login credentials
  async validateLogin(email: string, password: string): Promise<{ isValid: boolean; user?: User }> {
    const user = await this.findByEmail(email);

    if (!user) return { isValid: false };

    const isPasswordValid = comparePassword(user.password, password);
    return { isValid: isPasswordValid, user: isPasswordValid ? user : undefined };
  }

  // Find a user by ID
  async findByid(id: string): Promise<User | null> {
      const query = `SELECT * FROM users WHERE id = $1`;
      const [rows]: any = await pool.query(query, [id]);
  
      return rows.length > 0 ? rows[0] : null;
    }

    async findAll(limit: number, offset: number, search?: string): Promise<User[]> {
        let query = `SELECT * FROM users`;
        const values: any[] = [];
      
        // Add search condition if search term is provided
        if (search) {
          query += ` WHERE user_name ILIKE $1`;
          values.push(`%${search}%`);
        }
      
        // Add pagination and ordering
        query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
        values.push(limit, offset);
      
        const result = await pool.query(query, values);
        return result.rows;
      }
  //   async findAll(limit: number, offset: number): Promise<User[]> {
  //     const query = `SELECT * FROM users LIMIT $1 OFFSET $2`;
  //     const result = await pool.query(query, [limit, offset]);
  //     return result.rows;
  // }

  async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM users WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0] > 0;
  }
  
}

