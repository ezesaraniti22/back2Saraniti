import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: `${__dirname}/../../.env` });

export const PORT = process.env.PORT || 8080;
export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'token';
export const JWT_COOKIE_EXPIRES = process.env.JWT_COOKIE_EXPIRES || '24h';
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
export const NODE_ENV = process.env.NODE_ENV || 'development'; 