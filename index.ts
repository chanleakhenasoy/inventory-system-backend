import express from 'express';
import  authRouter  from './src/routes/auth.route';
import supplierRouter from './src/routes/supplier.route';
import categoryRouter from './src/routes/category.route';
import productRouter from './src/routes/product.route';
import stockInRouter from './src/routes/stockIn.route';
import stockoutRouter from './src/routes/stockout.route';
import paginationRoutes from './src/routes/pagination.route';
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
