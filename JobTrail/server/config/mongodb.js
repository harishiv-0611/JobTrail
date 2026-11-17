import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectMongoDB() {
  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured in server/.env');
  }

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log('MongoDB connected successfully');
}

export async function disconnectMongoDB() {
  await mongoose.disconnect();
}