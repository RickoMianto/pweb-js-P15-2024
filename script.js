// Constants
const API_URL = 'https://dummyjson.com/products';
const productsContainer = document.getElementById('products');
const cartItemsContainer = document.getElementById('cart-items');
const totalItemsElement = document.getElementById('total-items');
const totalPriceElement = document.getElementById('total-price');
const checkoutBtn = document.getElementById('checkout-btn');
const categoryFilterContainer = document.getElementById('category-filter');
const itemCountSelect = document.getElementById('item-count');

// State
let products = [];
let cart = [];
let categories = [];

// Fetch products from API
async function fetchProducts() {
    console.log('Fetching products...');
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const data = await response.json();
        products = data.products;
        categories = [...new Set(products.map(product => product.category))];
        console.log('Products fetched:', products.length);
        renderProducts();
        renderCategoryFilters();
    } catch (error) {
        console.error('Error:', error);
        productsContainer.innerHTML = '<p>Failed to load products. Please try again later.</p>';
    }
}

function redirectToProducts() {
    window.location.href = "#products";
}

// Render products
function renderProducts(filteredProducts = products) {
    console.log('Rendering products:', filteredProducts.length);
    if (!productsContainer) {
        console.error('Products container not found');
        return;
    }
    productsContainer.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <img src="${product.thumbnail}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>$${product.price}</p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
    `).join('');
    console.log('Products rendered');
}

// Render category filters
function renderCategoryFilters() {
    if (!categoryFilterContainer) {
        console.error('Category filter container not found');
        return;
    }
    categoryFilterContainer.innerHTML = categories.map(category => `
        <button onclick="filterByCategory('${category}')">${category}</button>
    `).join('');
}

// Filter products by category
function filterByCategory(category) {
    console.log('Filtering by category:', category);
    const filteredProducts = products.filter(product => product.category === category);
    renderProducts(filteredProducts);
}

// Add item to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCart();
        saveCartToLocalStorage();
    }
}

// Update cart
function updateCart() {
    if (!cartItemsContainer) {
        console.error('Cart items container not found');
        return;
    }
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.title}</h4>
                <p>Price: $${item.price}</p>
                <p>Quantity: ${item.quantity}</p>
            </div>
            <div class="cart-item-actions">
                <button onclick="removeFromCart(${item.id})">Remove</button>
                <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
            </div>
        </div>
    `).join('');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (totalItemsElement) totalItemsElement.textContent = totalItems;
    if (totalPriceElement) totalPriceElement.textContent = totalPrice.toFixed(2);
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    saveCartToLocalStorage();
}

// Update item quantity in cart
function updateQuantity(productId, newQuantity) {
    if (newQuantity > 0) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            updateCart();
            saveCartToLocalStorage();
        }
    } else {
        removeFromCart(productId);
    }
}

// Save cart to local storage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from local storage
function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
}

// Checkout button logic
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("Your cart is empty. Add items before checkout.");
        } else {
            alert(`Checkout successful! You have ${cart.length} item(s) worth $${totalPriceElement.textContent}.`);
            cart = []; // Clear the cart
            updateCart(); // Update the cart display
            saveCartToLocalStorage(); // Clear the local storage
        }
    });
}

// Change number of items per page
if (itemCountSelect) {
    itemCountSelect.addEventListener('change', (e) => {
        const itemCount = parseInt(e.target.value);
        renderProducts(products.slice(0, itemCount));
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    fetchProducts();
    loadCartFromLocalStorage();
});

// Log initial state
console.log('Script loaded');