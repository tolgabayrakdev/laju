import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import productRoutes from './routes/product.routes.js';
import authRoutes from './routes/auth.routes.js';
import { env } from './config/env.js';
import { HttpException } from './exceptions/http.exception.js';
import { apiLimiter } from './middlewares/rate-limit.middleware.js';

const app = express();

app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use('/api', apiLimiter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.use((err, req, res, next) => {
  const isHttp = err instanceof HttpException;
  const status = isHttp ? err.status : 500;
  const message = isHttp ? err.message : 'Internal Server Error';
  res.status(status).json({ error: message });
});

export default app;
