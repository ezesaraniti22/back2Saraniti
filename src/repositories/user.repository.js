import User from '../models/User.js';
import { UserDTO } from '../dto/user.dto.js';
import { createHash, isValidPassword } from '../utils/bcrypt.js';
import { generateToken } from '../utils/jwt.js';
import { sendEmail } from '../utils/mailer.js';
import crypto from 'crypto';
import cartRepository from './cart.repository.js';

class UserRepository {
    async create(userData) {
        try {
            // Crear el usuario sin el carrito primero
            const user = await User.create(userData);
            // Crear el carrito y asociarlo al usuario
            const cart = await cartRepository.create(user._id);
            user.cart = cart._id;
            await user.save();
            return UserDTO.toDTO(user);
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    async findByEmail(email) {
        try {
            const user = await User.findOne({ email });
            return user ? UserDTO.toDTO(user) : null;
        } catch (error) {
            throw new Error(`Error finding user by email: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const user = await User.findById(id);
            return user ? UserDTO.toDTO(user) : null;
        } catch (error) {
            throw new Error(`Error finding user by id: ${error.message}`);
        }
    }

    async update(id, userData) {
        try {
            const user = await User.findByIdAndUpdate(id, userData, { new: true });
            return user ? UserDTO.toDTO(user) : null;
        } catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            const user = await User.findByIdAndDelete(id);
            return user ? UserDTO.toDTO(user) : null;
        } catch (error) {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }

    async login(email, password) {
        try {
            const user = await User.findOne({ email });
            if (!user || !isValidPassword(user, password)) {
                throw new Error('Invalid credentials');
            }
            user.lastConnection = new Date();
            await user.save();
            return {
                user: UserDTO.toDTO(user),
                token: generateToken(user)
            };
        } catch (error) {
            throw new Error(`Error in login: ${error.message}`);
        }
    }

    async requestPasswordReset(email) {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('User not found');
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpiry = Date.now() + 3600000; // 1 hora

            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = resetTokenExpiry;
            await user.save();

            const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
            await sendEmail({
                to: user.email,
                subject: 'Recuperación de contraseña',
                html: `
                    <h1>Recuperación de contraseña</h1>
                    <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                    <a href="${resetUrl}">Restablecer contraseña</a>
                    <p>Este enlace expirará en 1 hora.</p>
                `
            });

            return true;
        } catch (error) {
            throw new Error(`Error requesting password reset: ${error.message}`);
        }
    }

    async resetPassword(token, newPassword) {
        try {
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                throw new Error('Token inválido o expirado');
            }

            // Verificar que la nueva contraseña no sea igual a la anterior
            if (isValidPassword(user, newPassword)) {
                throw new Error('La nueva contraseña no puede ser igual a la anterior');
            }

            user.password = newPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            return UserDTO.toDTO(user);
        } catch (error) {
            throw new Error(`Error resetting password: ${error.message}`);
        }
    }
}

export default new UserRepository(); 