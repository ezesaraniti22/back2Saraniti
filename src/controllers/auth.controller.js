import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import { JWT_SECRET } from '../config/config.js';
import { createHash } from '../utils/bcrypt.js';

export const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('register', { 
                error: 'El correo electrónico ya está registrado' 
            });
        }

        // Crear un carrito vacío
        const newCart = new Cart({ products: [] });
        await newCart.save();

        // Crear nuevo usuario con el ID del carrito
        const user = new User({
            firstName,
            lastName,
            email,
            password, // <-- Solo la contraseña en texto plano
            cart: newCart._id
        });

        await user.save();

        // Redirigir al login con mensaje de éxito
        res.redirect('/login?success=Usuario registrado exitosamente');
    } catch (error) {
        res.render('register', { 
            error: 'Error al registrar usuario' 
        });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }
        // Generar JWT
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ user: { email: user.email, firstName: user.firstName, lastName: user.lastName } });
    } catch (error) {
        res.status(500).json({ error: 'Error en el login' });
    }
};

export const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Sesión cerrada correctamente' });
};

export const current = (req, res) => {
    if (res.locals.user) {
        res.json({ user: res.locals.user });
    } else {
        res.status(401).json({ error: 'No autenticado' });
    }
}; 