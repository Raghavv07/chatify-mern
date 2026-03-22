import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { ENV } from '../lib/env.js';
import User from '../models/User.js';
import { AuthenticatedSocket, DecodedToken } from '../types/index.js';

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> => {
  try {
    // extract token from http-only cookies
    const token = socket.handshake.headers.cookie
      ?.split('; ')
      .find((row: string) => row.startsWith('jwt='))
      ?.split('=')[1];

    if (!token) {
      console.log('Socket connection rejected: No token provided');
      return next(new Error('Unauthorized - No Token Provided'));
    }

    // verify the token
    const decoded = jwt.verify(token, ENV.JWT_SECRET!) as DecodedToken;
    if (!decoded) {
      console.log('Socket connection rejected: Invalid token');
      return next(new Error('Unauthorized - Invalid Token'));
    }

    // find the user from db
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      console.log('Socket connection rejected: User not found');
      return next(new Error('User not found'));
    }

    // attach user info to socket
    const authSocket = socket as AuthenticatedSocket;
    authSocket.user = user;
    authSocket.userId = user._id.toString();

    console.log(`Socket authenticated for user: ${user.fullName} (${user._id})`);

    next();
  } catch (error) {
    console.log('Error in socket authentication:', (error as Error).message);
    next(new Error('Unauthorized - Authentication failed'));
  }
};

