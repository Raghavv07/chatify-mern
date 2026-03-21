import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Response } from 'express';
import path from 'path';

import { connectDB } from './lib/db';
import { ENV } from './lib/env';
import { app, server } from './lib/socket';
import authRoutes from './routes/auth.route';
import messageRoutes from './routes/message.route';

const __dirname = path.resolve();

const PORT: number = parseInt(ENV.PORT || '3000', 10);

app.use(express.json({ limit: '5mb' })); // req.body
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// make ready for deployment
if (ENV.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (_, res: Response) => {
    res.sendFile(path.join(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log('Server running on port: ' + PORT);
  connectDB();
});
