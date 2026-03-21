import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { ENV } from './env';

export const generateToken = (userId: Types.ObjectId, res: Response): string => {
  const { JWT_SECRET } = ENV;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  const token = jwt.sign({ userId: userId.toString() }, JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('jwt', token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks: cross-site scripting
    sameSite: 'strict', // CSRF attacks
    secure: ENV.NODE_ENV === 'development' ? false : true,
  });

  return token;
};
