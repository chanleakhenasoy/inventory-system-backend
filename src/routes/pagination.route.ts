import express, { Request, Response } from 'express';
import { pool } from '../config/db'; // Adjust the path to your db config
const router = express.Router();

// router.get('/', async (req: Request, res: Response) => {
//   try {
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 10;
//     const offset = (page - 1) * limit;

//     const result = await pool.query(
//       'SELECT * FROM items ORDER BY created_at DESC LIMIT $1 OFFSET $2',
//       [limit, offset]
//     );

//     res.json({
//       currentPage: page,
//       data: result.rows,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

export default router;
