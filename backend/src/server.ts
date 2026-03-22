import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './lib/db.js';
import { ENV } from './lib/env.js';
import { app, server } from './lib/socket.js';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');

const PORT: number = parseInt(ENV.PORT || '3000', 10);

const allowedOrigins = (ENV.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (allowedOrigins.length === 0 && ENV.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173');
}

// Render runs behind a reverse proxy; trust forwarded headers for correct client IP.
app.set('trust proxy', 1);

app.use(express.json({ limit: '5mb' })); // req.body
app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.length === 0) return callback(null, true);
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('CORS origin not allowed'));
    },
    credentials: true,
  })
);
app.use(cookieParser());

app.get('/api/health', (_, res: Response) => {
  res.status(200).json({ ok: true, service: 'chatify-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// make ready for deployment
if (ENV.NODE_ENV === 'production') {
  app.use(express.static(frontendDistPath));

  // Avoid sending index.html for missing static assets; browsers expect CSS/JS MIME types here.
  app.get('/assets/*', (_, res: Response) => {
    res.status(404).end();
  });

  app.get('*', (_, res: Response) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log('Server running on port: ' + PORT);
  connectDB();
});
