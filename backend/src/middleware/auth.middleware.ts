import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../lib/env';
import User from '../models/User';
import { AuthenticatedRequest, DecodedToken } from '../types/index';

export const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const token = req.cookies.jwt as string | undefined;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET!) as DecodedToken;
    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    console.log('Error in protectRoute middleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
