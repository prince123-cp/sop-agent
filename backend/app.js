import express from 'express';
import cors from 'cors';
import logger from './utils/logger.js';
import './config/env.js';
import sopRoutes from './routes/sopRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// Routes
app.use('/api/sop', sopRoutes);
app.use('/api/chat', chatRoutes);

// Serve index.html for all non-API routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
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
