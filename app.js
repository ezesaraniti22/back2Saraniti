const express = require("express");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const handlebars = require("express-handlebars");
const path = require("path");
const passport = require('passport');
const cookieParser = require('cookie-parser');
require('dotenv').config();
require('./src/config/passport.config');

// Rutas
const productRoutes = require("./src/routes/products.routes");
const cartRoutes = require("./src/routes/carts.routes");
const viewsRoutes = require("./src/routes/views.routes");
const authRoutes = require("./src/routes/auth.routes");

// Modelos
const Product = require("./src/models/Product");

const app = express();
const PORT = process.env.PORT || 8080;

// Configurar Handlebars
const hbs = handlebars.create({
  helpers: {
    ifEquals: (a, b) => a === b
  }
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "/src/views"));

// Archivos estáticos
app.use(express.static(path.join(__dirname, "/src/public")));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Rutas principales
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/", viewsRoutes);
app.use("/api/sessions", authRoutes);

// Conectar a Mongo y levantar servidor
mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://ecommerceUser:ecommercePass123@ecommerceuser.aw1dlcm.mongodb.net/?retryWrites=true&w=majority&appName=ecommerceUser", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ Conectado a MongoDB");

  const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
  });

  // WebSocket con productos en tiempo real
  const io = new Server(server);

  io.on("connection", async (socket) => {
    console.log("🧩 Cliente conectado vía WebSocket");
  
    const products = await Product.find();
    socket.emit("updateProducts", products);
  
    socket.on("addProduct", async (data) => {
      await Product.create(data);
      const updated = await Product.find();
      io.emit("updateProducts", updated);
    });
  
    socket.on("deleteProduct", async (id) => {
      await Product.findByIdAndDelete(id);
      const updated = await Product.find();
      io.emit("updateProducts", updated);
    });
  });
  
})
.catch(err => console.error("Error al conectar Mongo:", err));
