import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import ticketRepository from '../repositories/ticket.repository.js';
import { TicketDTO } from '../dto/ticket.dto.js';

const router = Router();

// Obtener todos los tickets del usuario
router.get('/', authMiddleware, async (req, res) => {
    try {
        const tickets = await ticketRepository.findByUser(req.user.id);
        res.json(TicketDTO.toDTOList(tickets));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Obtener un ticket específico
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const ticket = await ticketRepository.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        // Verificar que el ticket pertenece al usuario
        if (ticket.purchaser.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to view this ticket' });
        }
        
        res.json(TicketDTO.toDTO(ticket));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Cancelar un ticket
router.post('/:id/cancel', authMiddleware, async (req, res) => {
    try {
        const ticket = await ticketRepository.cancelTicket(req.params.id, req.user.id);
        res.json(TicketDTO.toDTO(ticket));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router; 