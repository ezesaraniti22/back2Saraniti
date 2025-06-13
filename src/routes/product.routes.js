import { Router } from 'express';
import { authMiddleware, authorizeRoles } from '../middleware/auth.middleware.js';
import productRepository from '../repositories/product.repository.js';
import { ProductDTO } from '../dto/product.dto.js';

const router = Router();

// Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const { limit, page, sort, category, status } = req.query;
        const result = await productRepository.findAll({}, {
            limit: parseInt(limit),
            page: parseInt(page),
            sort: sort ? JSON.parse(sort) : undefined,
            category,
            status: status === 'true'
        });
        result.products = ProductDTO.toDTOList(result.products);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
    try {
        const product = await productRepository.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(ProductDTO.toDTO(product));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Crear un nuevo producto (solo admin o premium)
router.post('/', authMiddleware, authorizeRoles('admin', 'premium'), async (req, res) => {
    try {
        const product = await productRepository.create(req.body);
        res.status(201).json(ProductDTO.toDTO(product));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Actualizar un producto (solo admin o premium)
router.put('/:id', authMiddleware, authorizeRoles('admin', 'premium'), async (req, res) => {
    try {
        const product = await productRepository.update(req.params.id, req.body);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(ProductDTO.toDTO(product));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Eliminar un producto (solo admin o premium)
router.delete('/:id', authMiddleware, authorizeRoles('admin', 'premium'), async (req, res) => {
    try {
        const product = await productRepository.delete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router; 