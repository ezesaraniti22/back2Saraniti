export class TicketDTO {
    constructor(ticket) {
        this.id = ticket._id;
        this.code = ticket.code;
        this.amount = ticket.amount;
        this.purchaser = ticket.purchaser;
        this.products = ticket.products;
        this.createdAt = ticket.createdAt;
    }

    static toDTO(ticket) {
        return new TicketDTO(ticket);
    }

    static toDTOList(tickets) {
        return tickets.map(ticket => new TicketDTO(ticket));
    }
} 