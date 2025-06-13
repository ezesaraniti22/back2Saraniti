import mongoose from 'mongoose';
import { MONGODB_URI } from '../config/config.js';
import Product from '../models/Product.js';

const products = [
    {
        title: 'Smartphone XYZ',
        description: 'Último modelo con cámara de alta resolución',
        price: 699.99,
        thumbnail: 'https://via.placeholder.com/300x200',
        code: 'SM001',
        stock: 50,
        category: 'Electrónicos',
        status: true
    },
    {
        title: 'Laptop Pro',
        description: 'Potente laptop para profesionales',
        price: 1299.99,
        thumbnail: 'https://via.placeholder.com/300x200',
        code: 'LT001',
        stock: 30,
        category: 'Electrónicos',
        status: true
    },
    {
        title: 'Auriculares Bluetooth',
        description: 'Sonido premium con cancelación de ruido',
        price: 199.99,
        thumbnail: 'https://via.placeholder.com/300x200',
        code: 'AU001',
        stock: 100,
        category: 'Accesorios',
        status: true
    },
    {
        title: 'Smartwatch',
        description: 'Monitor de actividad física y notificaciones',
        price: 299.99,
        thumbnail: 'https://via.placeholder.com/300x200',
        code: 'SW001',
        stock: 75,
        category: 'Wearables',
        status: true
    },
    {
        title: 'Tablet Ultra',
        description: 'Tablet de alta gama con pantalla retina',
        price: 499.99,
        thumbnail: 'https://via.placeholder.com/300x200',
        code: 'TB001',
        stock: 40,
        category: 'Electrónicos',
        status: true
    }
];

async function initDb() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Limpiar productos existentes
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Insertar nuevos productos
        await Product.insertMany(products);
        console.log('Added sample products');

        console.log('Database initialized successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initDb(); 