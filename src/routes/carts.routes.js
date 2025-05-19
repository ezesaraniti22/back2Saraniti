const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const router = express.Router();

// 1️⃣ POST /api/carts — crear un carrito vacío
router.post("/", async (req, res) => {
  try {
    const newCart = await Cart.create({ products: [] });
    res.status(201).json({ status: "success", cart: newCart });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// 2️⃣ GET /api/carts/:cid — obtener carrito con populate
router.get("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate("products.product").lean();
    if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    res.json({ status: "success", cart });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// 3️⃣ PUT /api/carts/:cid — reemplazar todo el array de productos
router.put("/:cid", async (req, res) => {
  try {
    const { products } = req.body;

    // Validar que cada producto exista
    for (const item of products) {
      const exists = await Product.findById(item.product);
      if (!exists) {
        return res.status(400).json({ status: "error", message: `Producto ${item.product} no existe` });
      }
    }

    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.cid,
      { products },
      { new: true }
    );

    res.json({ status: "success", cart: updatedCart });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// 4️⃣ PUT /api/carts/:cid/products/:pid — actualizar cantidad de un producto
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

    const productIndex = cart.products.findIndex(p => p.product.toString() === req.params.pid);

    if (productIndex !== -1) {
      cart.products[productIndex].quantity = quantity;
    } else {
      cart.products.push({ product: req.params.pid, quantity });
    }

    await cart.save();
    res.json({ status: "success", cart });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// 5️⃣ DELETE /api/carts/:cid/products/:pid — eliminar producto específico
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

    cart.products = cart.products.filter(p => p.product.toString() !== req.params.pid);
    await cart.save();
    res.json({ status: "success", cart });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// 6️⃣ DELETE /api/carts/:cid — vaciar el carrito
router.delete("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

    cart.products = [];
    await cart.save();
    res.json({ status: "success", message: "Carrito vaciado" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

module.exports = router;
