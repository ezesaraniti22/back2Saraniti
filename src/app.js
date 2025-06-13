import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { PORT, MONGODB_URI, NODE_ENV } from './config/config.js';
import handlebars from 'express-handlebars';
import viewsRouter from './routes/views.routes.js';
import './config/passport.config.js';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import ticketRoutes from './routes/ticket.routes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuración de CORS
app.use(cors({
    origin: NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:8080',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configuración de Handlebars
app.engine('handlebars', handlebars.engine({
  helpers: {
    ifEquals: function (a, b, options) {
      return a === b ? options.fn(this) : options.inverse(this);
    },
    multiply: function(a, b) {
      return (a * b).toFixed(2);
    },
    cartTotal: function(products) {
      if (!products || !products.length) return '0.00';
      let total = 0;
      for (const item of products) {
        total += (item.product.price || 0) * (item.quantity || 0);
      }
      return total.toFixed(2);
    }
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/tickets', ticketRoutes);

// Rutas del frontend (vistas dinámicas)
app.use('/', viewsRouter);

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Conectar a MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    });

export default app; 