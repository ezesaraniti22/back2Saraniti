// Función para manejar el inicio de sesión
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            window.location.href = '/';
        } else {
            showToast(data.error || 'Error al iniciar sesión', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al iniciar sesión', 'error');
    }
}

// Función para cargar productos
async function loadProducts() {
    try {
        const response = await fetch('/api/products', {
            credentials: 'include'
        });
        const data = await response.json();
        
        const productsContainer = document.getElementById('products');
        const loginMessage = document.getElementById('login-message');
        
        if (response.ok) {
            if (productsContainer) {
                if (data.products && data.products.length > 0) {
                    productsContainer.innerHTML = data.products.map(product => `
                        <div class="col-md-4 mb-4">
                            <div class="card product-card">
                                <img src="${product.thumbnail || 'https://via.placeholder.com/300x200'}" class="card-img-top" alt="${product.title}">
                                <div class="card-body">
                                    <h5 class="card-title">${product.title}</h5>
                                    <p class="card-text">${product.description}</p>
                                    <p class="card-text"><strong>Precio: $${product.price}</strong></p>
                                    <p class="card-text"><small class="text-muted">Stock: ${product.stock}</small></p>
                                    <button class="btn btn-primary" onclick="addToCart('${product._id}')">
                                        Agregar al carrito
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('');
                } else {
                    productsContainer.innerHTML = '<div class="col-12"><p class="text-center">No hay productos disponibles</p></div>';
                }
            }
            if (loginMessage) {
                loginMessage.style.display = 'none';
            }
        } else {
            if (productsContainer) {
                productsContainer.innerHTML = '';
            }
            if (loginMessage) {
                loginMessage.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error:', error);
        if (productsContainer) {
            productsContainer.innerHTML = '';
        }
        if (loginMessage) {
            loginMessage.style.display = 'block';
        }
    }
}

// Función para agregar al carrito
async function addToCart(productId) {
    try {
        const response = await fetch(`/api/cart/products/${productId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ quantity: 1 })
        });

        const data = await response.json();
        if (response.ok) {
            showToast('Producto agregado al carrito', 'success');
        } else {
            if (response.status === 401) {
                window.location.href = '/login';
            } else {
                showToast(data.error || 'Error al agregar al carrito', 'error');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al agregar al carrito', 'error');
    }
}

// Función para eliminar producto del carrito
async function removeFromCart(productId) {
    try {
        const response = await fetch(`/api/cart/products/${productId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (response.ok) {
            showToast('Producto eliminado del carrito', 'success');
            setTimeout(() => location.reload(), 800);
        } else {
            showToast('Error al eliminar producto', 'error');
        }
    } catch (error) {
        showToast('Error al eliminar producto', 'error');
    }
}

// Función para vaciar el carrito
async function clearCart() {
    showConfirm('¿Seguro que quieres vaciar el carrito?', async () => {
        try {
            const response = await fetch('/api/cart', {
                method: 'DELETE',
                credentials: 'include'
            });
            if (response.ok) {
                showToast('Carrito vaciado', 'success');
                setTimeout(() => location.reload(), 800);
            } else {
                showToast('Error al vaciar el carrito', 'error');
            }
        } catch (error) {
            showToast('Error al vaciar el carrito', 'error');
        }
    });
}

// Función para finalizar compra
async function purchaseCart() {
    try {
        const response = await fetch('/api/cart/purchase', {
            method: 'POST',
            credentials: 'include'
        });
        if (response.ok) {
            showToast('¡Compra realizada con éxito!', 'success');
            setTimeout(() => location.reload(), 1200);
        } else {
            const data = await response.json();
            showToast(data.error || 'Error al finalizar la compra', 'error');
        }
    } catch (error) {
        showToast('Error al finalizar la compra', 'error');
    }
}

// Función para cerrar sesión
async function handleLogout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        localStorage.clear(); // Limpiar cualquier dato del usuario
        if (response.ok) {
            window.location.href = '/login';
        } else {
            showToast('Error al cerrar sesión', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al cerrar sesión', 'error');
    }
}

// Función para verificar el estado de la sesión
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/current', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (response.ok) {
            // Usuario autenticado
            const authLinks = document.querySelectorAll('.auth-links');
            authLinks.forEach(link => {
                link.style.display = 'none';
            });
            
            const userLinks = document.querySelectorAll('.user-links');
            userLinks.forEach(link => {
                link.style.display = 'block';
            });

            // Cargar productos si estamos en la página principal o de productos
            if (window.location.pathname === '/' || window.location.pathname === '/products') {
                loadProducts();
            }
        } else {
            // Usuario no autenticado
            const authLinks = document.querySelectorAll('.auth-links');
            authLinks.forEach(link => {
                link.style.display = 'block';
            });
            
            const userLinks = document.querySelectorAll('.user-links');
            userLinks.forEach(link => {
                link.style.display = 'none';
            });

            // Mostrar mensaje de login si estamos en la página principal o de productos
            if (window.location.pathname === '/' || window.location.pathname === '/products') {
                const loginMessage = document.getElementById('login-message');
                if (loginMessage) {
                    loginMessage.style.display = 'block';
                }
                const productsContainer = document.getElementById('products');
                if (productsContainer) {
                    productsContainer.innerHTML = '';
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Función para cargar el carrito
async function loadCart() {
    const cartContainer = document.getElementById('cart-container');
    const productsContainer = document.getElementById('products');
    const loginMessage = document.getElementById('login-message');
    if (window.location.pathname !== '/cart' || !cartContainer) return;

    // Ocultar otros contenedores
    if (productsContainer) productsContainer.style.display = 'none';
    if (loginMessage) loginMessage.style.display = 'none';
    cartContainer.style.display = 'block';

    try {
        const response = await fetch('/api/cart', { credentials: 'include' });
        if (!response.ok) {
            cartContainer.innerHTML = '';
            showToast('Debes iniciar sesión para ver tu carrito.', 'info');
            return;
        }
        const cart = await response.json();
        if (!cart.products || cart.products.length === 0) {
            cartContainer.innerHTML = '';
            showToast('Tu carrito está vacío.', 'warning');
            return;
        }
        let total = 0;
        const rows = cart.products.map(item => {
            const product = item.product;
            const subtotal = product.price * item.quantity;
            total += subtotal;
            return `
                <tr>
                    <td><img src="${product.thumbnail || (product.thumbnails && product.thumbnails[0]) || 'https://via.placeholder.com/80x60'}" width="80" height="60"/></td>
                    <td>${product.title}</td>
                    <td>$${product.price.toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td>$${subtotal.toFixed(2)}</td>
                </tr>
            `;
        }).join('');
        cartContainer.innerHTML = `
            <h2 class="mb-4">Mi Carrito</h2>
            <div class="table-responsive">
                <table class="table table-bordered align-middle">
                    <thead class="table-dark">
                        <tr>
                            <th>Imagen</th>
                            <th>Producto</th>
                            <th>Precio</th>
                            <th>Cantidad</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="4" class="text-end"><strong>Total</strong></td>
                            <td><strong>$${total.toFixed(2)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-danger" onclick="clearCart()">Vaciar Carrito</button>
                <button class="btn btn-success" onclick="purchaseCart()">Finalizar Compra</button>
            </div>
        `;
    } catch (error) {
        cartContainer.innerHTML = '';
        showToast('Error al cargar el carrito.', 'error');
    }
}

function showToast(message, type = 'info') {
    const toastId = `toast-${Date.now()}`;
    const colors = {
        success: 'bg-success text-white',
        error: 'bg-danger text-white',
        info: 'bg-info text-dark',
        warning: 'bg-warning text-dark'
    };
    const colorClass = colors[type] || colors.info;
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center ${colorClass}" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    const container = document.getElementById('toast-container');
    container.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

function showConfirm(message, onAccept) {
    const modalBody = document.getElementById('confirmModalBody');
    modalBody.textContent = message;
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    const acceptBtn = document.getElementById('confirmModalAccept');
    // Remover listeners previos
    const newAcceptBtn = acceptBtn.cloneNode(true);
    acceptBtn.parentNode.replaceChild(newAcceptBtn, acceptBtn);
    newAcceptBtn.addEventListener('click', () => {
        modal.hide();
        if (typeof onAccept === 'function') onAccept();
    });
    modal.show();
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Verificar estado de autenticación
    checkAuthStatus();

    // Configurar manejadores de eventos para formularios
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Botón de logout global
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    if (window.location.pathname === '/cart') {
        loadCart();
    }
}); 