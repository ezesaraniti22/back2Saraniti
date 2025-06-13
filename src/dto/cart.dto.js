import { ProductDTO } from './product.dto.js';

export class CartDTO {
    constructor(cart) {
        this.id = cart._id;
        this.products = (cart.products || []).map(item => ({
            product: ProductDTO.toDTO(item.product),
            quantity: item.quantity
        }));
        this.createdAt = cart.createdAt;
        this.updatedAt = cart.updatedAt;
    }

    static toDTO(cart) {
        return new CartDTO(cart);
    }

    static toDTOList(carts) {
        return carts.map(cart => new CartDTO(cart));
    }
} 