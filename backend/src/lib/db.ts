import mongoose from 'mongoose';
import { ENV } from './env.js';

export const connectDB = async (): Promise<void> => {
  try {
    const { MONGO_URI } = ENV;
    if (!MONGO_URI) throw new Error('MONGO_URI is not set');

    const conn = await mongoose.connect(MONGO_URI);
    console.log('MONGODB CONNECTED:', conn.connection.host);
  } catch (error) {
    console.error('Error connection to MONGODB:', error);
    // Keep server alive in cloud environments and retry until DB becomes reachable.
    setTimeout(() => {
      void connectDB();
    }, 5000);
  }
};
