const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Middleware para verificar el token JWT
const authenticateJWT = passport.authenticate('jwt', { session: false });

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;
        
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        // Crear nuevo usuario
        const user = new User({
            first_name,
            last_name,
            email,
            age,
            password
        });

        await user.save();

        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
    }
});

// Login de usuario
router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
    const token = jwt.sign(
        { id: req.user._id, email: req.user.email, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    // Establecer la cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

    res.json({
        token,
        user: {
            id: req.user._id,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            role: req.user.role
        }
    });
});

// Ruta para obtener el usuario actual
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
        user: {
            id: req.user._id,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            role: req.user.role
        }
    });
});

// Ruta para cerrar sesión
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Sesión cerrada exitosamente' });
});

module.exports = router; 