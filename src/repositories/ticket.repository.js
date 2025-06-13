import Ticket from '../models/Ticket.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/mailer.js';

class TicketRepository {
    async create(ticketData) {
        try {
            if ('code' in ticketData) delete ticketData.code;
            // Generar el código único manualmente
            const code = await Ticket.generateUniqueCode();
            const ticket = new Ticket({ ...ticketData, code });
            console.log('Antes de guardar ticket:', ticket);
            await ticket.save();
            return ticket;
        } catch (error) {
            throw new Error(`Error creating ticket: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const ticket = await Ticket.findById(id)
                .populate('purchaser', 'email firstName lastName')
                .populate('products.product');
            return ticket;
        } catch (error) {
            throw new Error(`Error finding ticket: ${error.message}`);
        }
    }

    async findByUser(userId) {
        try {
            const tickets = await Ticket.find({ purchaser: userId })
                .populate('products.product')
                .sort({ purchase_datetime: -1 });
            return tickets;
        } catch (error) {
            throw new Error(`Error finding user tickets: ${error.message}`);
        }
    }

    async processPurchase(cartId, userId) {
        try {
            const cart = await Cart.findById(cartId).populate('products.product');
            if (!cart) {
                throw new Error('Cart not found');
            }

            const productsToPurchase = [];
            const productsNotPurchased = [];
            let totalAmount = 0;

            // Verificar stock y calcular total
            for (const item of cart.products) {
                const product = item.product;
                if (product.stock >= item.quantity) {
                    productsToPurchase.push({
                        product: product._id,
                        quantity: item.quantity,
                        price: product.price
                    });
                    totalAmount += product.price * item.quantity;
                    
                    // Actualizar stock
                    product.stock -= item.quantity;
                    await product.save();
                } else {
                    productsNotPurchased.push({
                        product: product._id,
                        quantity: item.quantity,
                        reason: 'Insufficient stock'
                    });
                }
            }

            // Crear ticket si hay productos para comprar
            let ticket = null;
            if (productsToPurchase.length > 0) {
                ticket = await this.create({
                    amount: totalAmount,
                    purchaser: userId,
                    products: productsToPurchase,
                    status: 'completed'
                });

                // Enviar email de confirmación
                const user = await User.findById(userId);
                await sendEmail({
                    to: user.email,
                    subject: 'Confirmación de compra',
                    html: `
                        <h1>¡Gracias por tu compra!</h1>
                        <p>Tu ticket de compra: ${ticket.code}</p>
                        <p>Total: $${ticket.amount}</p>
                        <p>Fecha: ${ticket.purchase_datetime}</p>
                    `
                });
            }

            // Limpiar carrito
            cart.products = productsNotPurchased.map(item => ({
                product: item.product,
                quantity: item.quantity
            }));
            await cart.save();

            return {
                ticket,
                productsNotPurchased
            };
        } catch (error) {
            throw new Error(`Error processing purchase: ${error.message}`);
        }
    }

    async cancelTicket(ticketId, userId) {
        try {
            const ticket = await Ticket.findOne({
                _id: ticketId,
                purchaser: userId,
                status: 'completed'
            });

            if (!ticket) {
                throw new Error('Ticket not found or cannot be cancelled');
            }

            // Restaurar stock de productos
            for (const item of ticket.products) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock += item.quantity;
                    await product.save();
                }
            }

            ticket.status = 'cancelled';
            await ticket.save();

            return ticket;
        } catch (error) {
            throw new Error(`Error cancelling ticket: ${error.message}`);
        }
    }
}

export default new TicketRepository(); 