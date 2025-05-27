import express from 'express';
import  authRouter  from './routes/auth.route';
import supplierRouter from './routes/supplier.route';
import categoryRouter from './routes/category.route';
import productRouter from './routes/product.route';
import stockInRouter from './routes/stockIn.route';
import stockoutRouter from './routes/stockout.route';
import paginationRoutes from './routes/pagination.route';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true })) // for form data
var corsOptions = {
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  origin: "*", // your frontend URL
  credentials: true, // if you use cookies, auth, etc.
};

app.use(cors(corsOptions));

app.use("/api/auth", authRouter);
app.use("/api/supplier",supplierRouter);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api/stockIn", stockInRouter);
app.use("/api/stockout", stockoutRouter);
app.use('/api/items', paginationRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
