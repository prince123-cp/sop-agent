import express from 'express';
import cors from 'cors';
import logger from './utils/logger.js';
import './config/env.js';
import sopRoutes from './routes/sopRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/sop', sopRoutes);
app.use('/api/chat', chatRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

// Central error handler (e.g., multer errors)
app.use((err, req, res, next) => {
  console.error('API ERROR:', err);
  const status =
    err.status ||
    (err.name === 'MulterError' ? 400 : 500);
  res.status(status).json({ message: err.message || 'Internal server error' });
});

export default app;
