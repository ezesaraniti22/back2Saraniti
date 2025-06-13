import mongoose from 'mongoose';
import { createHash } from '../utils/bcrypt.js';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'premium'],
        default: 'user'
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    },
    lastConnection: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    documents: [{
        name: String,
        reference: String,
        docType: {
            type: String,
            enum: ['identification', 'address', 'account']
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'verified'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Middleware para hashear la contraseña antes de guardar
userSchema.pre('save', function(next) {
    if (this.isModified('password')) {
        this.password = createHash(this.password);
    }
    next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        const bcrypt = await import('bcrypt');
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

const User = mongoose.model('User', userSchema);

export default User; 