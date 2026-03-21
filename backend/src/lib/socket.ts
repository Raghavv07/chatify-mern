import express, { Application } from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { socketAuthMiddleware } from '../middleware/socket.auth.middleware.js';
import { AuthenticatedSocket, UserSocketMap } from '../types/index.js';
import { ENV } from './env.js';

const app: Application = express();
const server: http.Server = http.createServer(app);

const allowedOrigins = (ENV.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (allowedOrigins.length === 0 && ENV.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173');
}

const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  },
});

// apply authentication middleware to all socket connections
io.use((socket: Socket, next) => socketAuthMiddleware(socket, next));

// we will use this function to check if the user is online or not
export function getReceiverSocketId(userId: string): string | undefined {
  return userSocketMap[userId];
}

// this is for storing online users
const userSocketMap: UserSocketMap = {}; // {userId:socketId}

io.on('connection', (socket: Socket) => {
  const authSocket = socket as AuthenticatedSocket;
  console.log('A user connected', authSocket.user.fullName);

  const userId = authSocket.userId;
  userSocketMap[userId] = authSocket.id;

  // io.emit() is used to send events to all connected clients
  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  // with socket.on we listen for events from clients
  authSocket.on('disconnect', () => {
    console.log('A user disconnected', authSocket.user.fullName);
    delete userSocketMap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

export { app, io, server };
