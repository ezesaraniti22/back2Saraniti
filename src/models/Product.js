import mongoose from 'mongoose';

// Esquema del producto
const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  code: {
    type: String,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    required: true
  },
  thumbnails: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Método estático para paginación
productSchema.statics.paginate = async function(query, options) {
  const { page = 1, limit = 10, sort } = options;
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limit);
  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;

  return {
    docs,
    totalPages,
    page: Number(page),
    hasPrevPage,
    hasNextPage,
    prevPage: hasPrevPage ? page - 1 : null,
    nextPage: hasNextPage ? page + 1 : null,
    total
  };
};

const Product = mongoose.model("Product", productSchema);

export default Product;
