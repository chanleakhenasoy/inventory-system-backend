import express from 'express';
import  authRouter  from './src/routes/auth.route';
import supplierRouter from './src/routes/supplier.route';
import categoryRouter from './src/routes/category.route';


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/supplier",supplierRouter);
app.use("/api/category", categoryRouter);
// app.use("/api/product", productRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
