import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    purchase_datetime: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true
    },
    purchaser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    }
});

// Método para generar código único
ticketSchema.statics.generateUniqueCode = async function() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const code = `TICKET-${timestamp}-${random}`;
    
    // Verificar si el código ya existe
    const existingTicket = await this.findOne({ code });
    if (existingTicket) {
        return this.generateUniqueCode();
    }
    
    return code;
};

// Middleware pre-save para generar código único
ticketSchema.pre('save', async function(next) {
    if (!this.code || this.code === '') {
        this.code = await this.constructor.generateUniqueCode();
        console.log('Generando código para ticket:', this.code);
    }
    next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket; 