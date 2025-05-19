const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

/**
 * GET /api/products — Listar productos con paginación, filtro y ordenamiento
 */
router.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    // Filtro por categoría o disponibilidad
    let filter = {};
    if (query) {
      if (query === "true" || query === "false") {
        filter.status = query === "true";
      } else {
        filter.category = query;
      }
    }

    // Orden por precio
    let sortOptions = {};
    if (sort === "asc") sortOptions.price = 1;
    if (sort === "desc") sortOptions.price = -1;

    const result = await Product.paginate(filter, {
      page,
      limit,
      sort: sortOptions,
      lean: true,
    });

    res.json({
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.hasPrevPage ? result.prevPage : null,
      nextPage: result.hasNextPage ? result.nextPage : null,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}` : null,
      nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}` : null,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

/**
 * GET /api/products/:pid — Obtener producto por ID
 */
router.get("/:pid", async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product)
      return res.status(404).json({ status: "error", message: "Producto no encontrado" });

    res.json({ status: "success", product });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

/**
 * POST /api/products — Crear nuevo producto con validaciones
 */
router.post("/", async (req, res) => {
  try {
    const { title, code, price, stock, category } = req.body;

    // Validación de campos requeridos
    if (!title || !code || !price || !stock || !category) {
      return res.status(400).json({
        status: "error",
        message: "Faltan campos obligatorios: title, code, price, stock, category",
      });
    }

    // Verificar que el código sea único
    const exists = await Product.findOne({ code });
    if (exists) {
      return res.status(400).json({
        status: "error",
        message: "Ya existe un producto con ese código",
      });
    }

    // Crear producto
    const product = await Product.create({
      ...req.body,
      status: req.body.status !== undefined ? req.body.status : true,
      thumbnails: req.body.thumbnails || [],
    });

    res.status(201).json({ status: "success", product });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

/**
 * PUT /api/products/:pid — Actualizar producto por ID
 */
router.put("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;

    // Evitar actualización del ID
    if (req.body._id) delete req.body._id;

    const updated = await Product.findByIdAndUpdate(pid, req.body, {
      new: true,
    });

    if (!updated)
      return res.status(404).json({ status: "error", message: "Producto no encontrado" });

    res.json({ status: "success", product: updated });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

/**
 * DELETE /api/products/:pid — Eliminar producto por ID
 */
router.delete("/:pid", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.pid);
    if (!deleted)
      return res.status(404).json({ status: "error", message: "Producto no encontrado" });

    res.json({ status: "success", product: deleted });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

module.exports = router;
