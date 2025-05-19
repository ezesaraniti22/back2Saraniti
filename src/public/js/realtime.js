const socket = io();

// Actualizar lista cuando recibimos productos del servidor
socket.on("updateProducts", (products) => {
  const list = document.getElementById("productList");
  list.innerHTML = "";

  products.forEach((p) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${p.title}</strong> - $${p.price} 
      <button onclick="deleteProduct('${p._id}')">Eliminar</button>
    `;
    list.appendChild(li);
  });
});

// Formulario para agregar producto
const form = document.getElementById("productForm");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  data.status = true;
  data.thumbnails = [];

  socket.emit("addProduct", data);
  form.reset();
});

// Función para eliminar producto
function deleteProduct(id) {
  socket.emit("deleteProduct", id);
}
