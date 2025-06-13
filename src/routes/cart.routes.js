import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import cartRepository from '../repositories/cart.repository.js';
import ticketRepository from '../repositories/ticket.repository.js';
import { CartDTO } from '../dto/cart.dto.js';

const router = Router();

// Obtener carrito del usuario
router.get('/', authMiddleware, async (req, res) => {
    console.log('GET /api/cart llamado por usuario:', req.user?.email || req.user?.id);
    try {
        const cart = await cartRepository.findById(req.user.cart);
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        res.json(CartDTO.toDTO(cart));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Agregar producto al carrito
router.post('/products/:productId', authMiddleware, async (req, res) => {
    try {
        const { quantity = 1 } = req.body;
        const cart = await cartRepository.addProduct(req.user.cart, req.params.productId, quantity);
        res.json(CartDTO.toDTO(cart));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Actualizar cantidad de producto en el carrito
router.put('/products/:productId', authMiddleware, async (req, res) => {
    try {
        const { quantity } = req.body;
        const cart = await cartRepository.updateProductQuantity(
            req.user.cart,
            req.params.productId,
            quantity
        );
        res.json(CartDTO.toDTO(cart));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Eliminar producto del carrito
router.delete('/products/:productId', authMiddleware, async (req, res) => {
    try {
        const cart = await cartRepository.removeProduct(req.user.cart, req.params.productId);
        res.json(CartDTO.toDTO(cart));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Vaciar carrito
router.delete('/', authMiddleware, async (req, res) => {
    try {
        const cart = await cartRepository.clearCart(req.user.cart);
        res.json(CartDTO.toDTO(cart));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Finalizar compra
router.post('/purchase', authMiddleware, async (req, res) => {
    try {
        const result = await ticketRepository.processPurchase(req.user.cart, req.user.id);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router; 