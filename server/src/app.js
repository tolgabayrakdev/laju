import express from 'express';
import cors from 'cors';
import productRoutes from './routes/product.routes.js';
import authRoutes from './routes/auth.routes.js';
import { HttpException } from './exceptions/http.exception.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.use((err, req, res, next) => {
  const isHttp = err instanceof HttpException;
  const status = isHttp ? err.status : 500;
  const message = isHttp ? err.message : 'Internal Server Error';
  res.status(status).json({ error: message });
});

export default app;
