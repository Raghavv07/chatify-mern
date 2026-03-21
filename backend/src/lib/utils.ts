import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { ENV } from './env.js';

export const generateToken = (userId: Types.ObjectId, res: Response): string => {
  const { JWT_SECRET } = ENV;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  const isProduction = ENV.NODE_ENV === 'production';

  const token = jwt.sign({ userId: userId.toString() }, JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('jwt', token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks: cross-site scripting
    // Render me frontend/backend alag domains ho sakte hain; production me None required hota hai.
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
  });

  return token;
};
