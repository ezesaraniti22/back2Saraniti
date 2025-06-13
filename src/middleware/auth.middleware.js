import { verifyToken } from '../utils/jwt.js';
import userRepository from '../repositories/user.repository.js';

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = verifyToken(token);
        const user = await userRepository.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

export const authorizeRoles = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: `Access denied. Required role(s): ${roles.join(', ')}` });
    }
    next();
};

export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

export const isUser = (req, res, next) => {
    if (req.user.role !== 'user') {
        return res.status(403).json({ error: 'User access required' });
    }
    next();
};

export const isPremium = (req, res, next) => {
    if (req.user.role !== 'premium') {
        return res.status(403).json({ error: 'Premium access required' });
    }
    next();
};

export const isAdminOrPremium = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'premium') {
        return res.status(403).json({ error: 'Admin or Premium access required' });
    }
    next();
}; 