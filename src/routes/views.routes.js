const express = require("express");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const router = express.Router();

// Middleware para verificar autenticación
const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.redirect('/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.redirect('/login');
        }

        req.user = user;
        res.locals.user = user.toObject();
        next();
    } catch (error) {
        console.error('Error de autenticación:', error);
        res.redirect('/login');
    }
};

// Middleware para pasar el usuario a todas las vistas
const setUserLocals = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (user) {
                res.locals.user = user.toObject();
            }
        }
        next();
    } catch (error) {
        next();
    }
};

// Aplicar el middleware de usuario a todas las rutas
router.use(setUserLocals);

// Rutas públicas
router.get("/login", (req, res) => {
    if (res.locals.user) {
        return res.redirect('/');
    }
    res.render("login");
});

router.get("/register", (req, res) => {
    if (res.locals.user) {
        return res.redirect('/');
    }
    res.render("register");
});

// Página principal con los botones
router.get("/", (req, res) => {
    res.render("home", { user: res.locals.user });
});

// Rutas protegidas
router.get("/products", isAuthenticated, async (req, res) => {
    const { page = 1, limit = 10, sort, query } = req.query;

    let filter = {};
    if (query) {
        if (query === "true" || query === "false") {
            filter.status = query === "true";
        } else {
            filter.category = query;
        }
    }

    let sortOptions = {};
    if (sort === "asc") sortOptions.price = 1;
    if (sort === "desc") sortOptions.price = -1;

    const result = await Product.paginate(filter, {
        page,
        limit,
        sort: sortOptions,
        lean: true,
    });

    // Obtener lista de categorías únicas
    const allProducts = await Product.find().lean();
    const categories = [...new Set(allProducts.map(p => p.category))];

    res.render("products", {
        products: result.docs,
        totalPages: result.totalPages,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        categories,
        currentQuery: query || "",
        currentSort: sort || "",
        user: res.locals.user
    });
});

router.get("/products/:pid", isAuthenticated, async (req, res) => {
    const product = await Product.findById(req.params.pid).lean();
    if (!product) return res.status(404).send("Producto no encontrado");
    res.render("product", { product, user: res.locals.user });
});

router.get("/carts/:cid", isAuthenticated, async (req, res) => {
    const cart = await Cart.findById(req.params.cid).populate("products.product").lean();
    if (!cart) return res.status(404).send("Carrito no encontrado");
    res.render("cart", { products: cart.products, user: res.locals.user });
});

router.get("/realtimeproducts", isAuthenticated, async (req, res) => {
    res.render("realtimeProducts", { user: res.locals.user });
});

module.exports = router;
