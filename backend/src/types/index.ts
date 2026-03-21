import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Document, Types } from 'mongoose';
import { Socket } from 'socket.io';

// User Document Interface
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  fullName: string;
  password: string;
  profilePic: string;
  createdAt: Date;
  updatedAt: Date;
}

// Message Document Interface
export interface IMessage extends Document {
  _id: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  text?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Extended Request with User
export interface AuthenticatedRequest extends Request {
  user: IUser;
}

// JWT Decoded Payload
export interface DecodedToken extends JwtPayload {
  userId: string;
}

// Authenticated Socket
export interface AuthenticatedSocket extends Socket {
  user: IUser;
  userId: string;
}

// Environment Variables Interface
export interface EnvironmentVariables {
  PORT?: string;
  MONGO_URI?: string;
  JWT_SECRET?: string;
  NODE_ENV?: string;
  CLIENT_URL?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  EMAIL_FROM_NAME?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  ARCJET_KEY?: string;
  ARCJET_ENV?: string;
}

// Email Sender Interface
export interface EmailSender {
  email: string | undefined;
  name: string | undefined;
}

// Controller Handler Types
export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<void | Response>;

export type AuthenticatedRequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next?: NextFunction
) => Promise<void | Response>;

// Message Request Body
export interface SendMessageBody {
  text?: string;
  image?: string;
}

// Signup Request Body
export interface SignupBody {
  fullName: string;
  email: string;
  password: string;
}

// Login Request Body
export interface LoginBody {
  email: string;
  password: string;
}

// Update Profile Body
export interface UpdateProfileBody {
  profilePic: string;
}

// User Socket Map
export type UserSocketMap = Record<string, string>;

// Cloudinary Upload Response
export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  [key: string]: unknown;
}
