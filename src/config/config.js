import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_por_defecto';
export const PORT = process.env.PORT || 8080;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ecommerceUser:ecommercePass123@ecommerceuser.aw1dlcm.mongodb.net/?retryWrites=true&w=majority&appName=ecommerceUser';
export const NODE_ENV = process.env.NODE_ENV || 'development'; 