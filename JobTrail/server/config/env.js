import 'dotenv/config';

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  JWT_SECRET: process.env.JWT_SECRET,
  MONGODB_URI: process.env.MONGODB_URI ,
  DB_TYPE: process.env.DB_TYPE || 'memory',
};
