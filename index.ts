import express from 'express';
import  authRouter  from './src/routes/auth.route';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/auth", authRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
