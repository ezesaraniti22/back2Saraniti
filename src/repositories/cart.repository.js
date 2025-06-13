import Cart from '../models/Cart.js';
import productRepository from './product.repository.js';

class CartRepository {
    async create(userId) {
        try {
            const cart = await Cart.create({ user: userId });
            return cart;
        } catch (error) {
            throw new Error(`Error creating cart: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const cart = await Cart.findById(id)
                .populate('products.product');
            return cart;
        } catch (error) {
            throw new Error(`Error finding cart: ${error.message}`);
        }
    }

    async findByUser(userId) {
        try {
            console.log('Buscando carrito para userId:', userId);
            const cart = await Cart.findOne({ user: userId })
                .populate('products.product');
            console.log('Carrito encontrado:', cart);
            return cart;
        } catch (error) {
            throw new Error(`Error finding user cart: ${error.message}`);
        }
    }

    async addProduct(cartId, productId, quantity = 1) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Cart not found');
            }

            const product = await productRepository.findById(productId);
            if (!product) {
                throw new Error('Product not found');
            }

            if (product.stock < quantity) {
                throw new Error('Insufficient stock');
            }

            const existingProduct = cart.products.find(
                item => item.product.toString() === productId
            );

            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                cart.products.push({
                    product: productId,
                    quantity
                });
            }

            await cart.save();
            return this.findById(cartId);
        } catch (error) {
            throw new Error(`Error adding product to cart: ${error.message}`);
        }
    }

    async updateProductQuantity(cartId, productId, quantity) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Cart not found');
            }

            const product = await productRepository.findById(productId);
            if (!product) {
                throw new Error('Product not found');
            }

            if (product.stock < quantity) {
                throw new Error('Insufficient stock');
            }

            const productIndex = cart.products.findIndex(
                item => item.product.toString() === productId
            );

            if (productIndex === -1) {
                throw new Error('Product not in cart');
            }

            if (quantity <= 0) {
                cart.products.splice(productIndex, 1);
            } else {
                cart.products[productIndex].quantity = quantity;
            }

            await cart.save();
            return this.findById(cartId);
        } catch (error) {
            throw new Error(`Error updating product quantity: ${error.message}`);
        }
    }

    async removeProduct(cartId, productId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Cart not found');
            }

            cart.products = cart.products.filter(
                item => item.product.toString() !== productId
            );

            await cart.save();
            return this.findById(cartId);
        } catch (error) {
            throw new Error(`Error removing product from cart: ${error.message}`);
        }
    }

    async clearCart(cartId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Cart not found');
            }

            cart.products = [];
            await cart.save();
            return this.findById(cartId);
        } catch (error) {
            throw new Error(`Error clearing cart: ${error.message}`);
        }
    }
}

export default new CartRepository(); 