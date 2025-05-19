const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

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

productSchema.plugin(mongoosePaginate);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
