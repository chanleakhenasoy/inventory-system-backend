import express from 'express';
import  authRouter  from './src/routes/auth.route';
import supplierRouter from './src/routes/supplier.route';


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/supplier",supplierRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
