import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/user.model.js';
import { JWT_SECRET } from './config.js';

// Middleware para la estrategia local
const localStrategy = new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: 'Usuario no encontrado' });
            }
            
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return done(null, false, { message: 'Contraseña incorrecta' });
            }
            
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
);

// Middleware para la estrategia JWT
const jwtStrategy = new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: JWT_SECRET
    },
    async (jwtPayload, done) => {
        try {
            const user = await User.findById(jwtPayload.id);
            if (!user) {
                return done(null, false);
            }
            return done(null, user);
        } catch (error) {
            return done(error, false);
        }
    }
);

// Middleware para verificar rol de administrador
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado. Se requieren privilegios de administrador.' });
    }
};

// Middleware para verificar autenticación
export const isAuthenticated = passport.authenticate('jwt', { session: false });

// Configurar estrategias
passport.use(localStrategy);
passport.use(jwtStrategy);

export default passport; 