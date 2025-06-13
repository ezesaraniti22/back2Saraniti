import Product from '../models/Product.js';

class ProductRepository {
    async create(productData) {
        try {
            const product = await Product.create(productData);
            return product;
        } catch (error) {
            throw new Error(`Error creating product: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const product = await Product.findById(id);
            return product;
        } catch (error) {
            throw new Error(`Error finding product: ${error.message}`);
        }
    }

    async findAll(query = {}, options = {}) {
        try {
            const {
                limit = 10,
                page = 1,
                sort = { createdAt: -1 },
                category,
                status
            } = options;

            const filter = { ...query };
            if (category) filter.category = category;
            filter.status = true;

            const products = await Product.find(filter)
                .sort(sort)
                .limit(limit)
                .skip((page - 1) * limit);


            const total = await Product.countDocuments(filter);
            const totalPages = Math.ceil(total / limit);

            return {
                products,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages
                }
            };
        } catch (error) {
            throw new Error(`Error finding products: ${error.message}`);
        }
    }

    async update(id, productData) {
        try {
            const product = await Product.findByIdAndUpdate(
                id,
                productData,
                { new: true }
            );
            return product;
        } catch (error) {
            throw new Error(`Error updating product: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            const product = await Product.findByIdAndDelete(id);
            return product;
        } catch (error) {
            throw new Error(`Error deleting product: ${error.message}`);
        }
    }

    async updateStock(id, quantity) {
        try {
            const product = await Product.findById(id);
            if (!product) {
                throw new Error('Product not found');
            }

            product.stock += quantity;
            if (product.stock < 0) {
                throw new Error('Insufficient stock');
            }

            await product.save();
            return product;
        } catch (error) {
            throw new Error(`Error updating stock: ${error.message}`);
        }
    }

    async findByIds(ids) {
        try {
            const products = await Product.find({ _id: { $in: ids } });
            return products;
        } catch (error) {
            throw new Error(`Error finding products by ids: ${error.message}`);
        }
    }
}

export default new ProductRepository(); 