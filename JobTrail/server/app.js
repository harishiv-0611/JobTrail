import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes.js';
import applicationRouter from './routes/application.routes.js';
import { AppError } from './utils/AppError.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/applications', applicationRouter);

app.use((req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.url} not found` } }));
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;

  if (!isAppError) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: {
      code: isAppError ? err.code : 'INTERNAL_SERVER_ERROR',
      message: isAppError ? err.message : 'Internal server error',
      ...(isAppError && err.details ? { details: err.details } : {}),
    },
  });
});

export default app;
