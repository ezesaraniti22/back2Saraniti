import { Router } from 'express';
import { register, login, logout, current } from '../controllers/auth.controller.js';
import userRepository from '../repositories/user.repository.js';

const router = Router();

// Rutas de autenticación
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/current', current);

// Solicitar recuperación de contraseña
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        await userRepository.requestPasswordReset(email);
        res.json({ message: 'Se ha enviado un correo con las instrucciones para recuperar tu contraseña' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Resetear contraseña
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        await userRepository.resetPassword(token, newPassword);
        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router; 