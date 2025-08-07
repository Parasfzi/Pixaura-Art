const firebaseConfig = {
    apiKey: "AIzaSyDvuETPdTeZsDasgOw7MW59IrsmeOQP7kk",
    authDomain: "chat-web-23e9c.firebaseapp.com",
    projectId: "chat-web-23e9c",
    storageBucket: "chat-web-23e9c.appspot.com",
    messagingSenderId: "90729782128",
    appId: "1:90729782128:web:b051229c6c45866a87cdb5"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const productContainer = document.getElementById("product-container");
const cartModal = document.getElementById("cart-modal");
const cartCount = document.getElementById("cart-count");
const buyFormPopup = document.getElementById("buyFormPopup");

// State Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});

// Form Visibility Functions
function showLogin() {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    clearFormInputs(signupForm);
}

function showSignup() {
    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");
    clearFormInputs(loginForm);
}

function clearFormInputs(form) {
    form.querySelectorAll('input').forEach(input => input.value = '');
}

// Authentication Functions
async function login() {
    try {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        
        if (!email || !password) {
            throw new Error('Please fill in all fields');
        }

        await auth.signInWithEmailAndPassword(email, password);
        showToast("Logged in successfully!", "success");
        clearFormInputs(loginForm);
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function signup() {
    try {
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value;
        
        if (!email || !password) {
            throw new Error('Please fill in all fields');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }

        await auth.createUserWithEmailAndPassword(email, password);
        showToast("Account created successfully!", "success");
        showLogin();
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function logout() {
    try {
        await auth.signOut();
        showToast("Logged out successfully!", "success");
        cart = [];
        localStorage.removeItem('cart');
        updateCartCount();
    } catch (err) {
        showToast("Error logging out: " + err.message, "error");
    }
}

// Product Functions
async function loadProducts() {
    try {
        productContainer.innerHTML = '<div class="loading">Loading products...</div>';
        
        const snapshot = await db.collection("products").get();
        products = [];
        productContainer.innerHTML = "";
        
        if (snapshot.empty) {
            productContainer.innerHTML = '<div class="no-products">No products available</div>';
            return;
        }

        snapshot.forEach(doc => {
            const data = { id: doc.id, ...doc.data() };
            products.push(data);
            renderProductCard(data);
        });
    } catch (error) {
        showToast("Error loading products: " + error.message, "error");
        productContainer.innerHTML = '<div class="error">Failed to load products</div>';
    }
}

function renderProductCard(data) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
        <img src="${data.image}" alt="${data.name}" onerror="this.src='assets/placeholder.png'">
        <h3>${data.name}</h3>
        <p class="price">₹${data.price.toFixed(2)}</p>
        <button onclick='addToCart(${JSON.stringify(data)})' class="add-to-cart-btn">
            <i class="fa-solid fa-cart-plus"></i> Add to Cart
        </button>
    `;
    productContainer.appendChild(card);
}

// Cart Functions
function addToCart(product) {
    if (!auth.currentUser) {
        showToast("Please login to add items to cart", "error");
        return;
    }
    
    cart.push(product);
    updateCartCount();
    saveCartToLocalStorage();
    showToast("Added to cart!", "success");
}

function updateCartCount() {
    const badge = cartCount.querySelector(".cart-badge");
    badge.textContent = cart.length;
    badge.style.display = cart.length ? 'block' : 'none';
}

function showCart() {
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const cartModal = document.getElementById("cart-modal");
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        cartTotal.innerHTML = '';
        cartModal.classList.remove("hidden");
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/placeholder.png'">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>₹${item.price.toFixed(2)}</p>
            </div>
            <button onclick="removeFromCart(${index})" class="remove-btn">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    cartTotal.innerHTML = `
        <h3>Total: ₹${total.toFixed(2)}</h3>
        <p class="item-count">${cart.length} item${cart.length !== 1 ? 's' : ''}</p>
    `;
    
    cartModal.classList.remove("hidden");
}

function closeCart() {
    document.getElementById("cart-modal").classList.add("hidden");
}

function openBuyForm() {
    document.getElementById("buyFormPopup").classList.remove("hidden");
}

function closeBuyForm() {
    document.getElementById("buyFormPopup").classList.add("hidden");
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    saveCartToLocalStorage();
    showCart();
    showToast("Item removed from cart!", "success");
}

function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Order Functions
async function submitOrder(e) {
    e.preventDefault();
    
    if (!auth.currentUser) {
        showToast("Please login to place an order", "error");
        return;
    }
    
    if (cart.length === 0) {
        showToast("Your cart is empty!", "error");
        return;
    }

    const form = document.getElementById("orderForm");
    if (!form.checkValidity()) {
        showToast("Please fill in all required fields", "error");
        return;
    }

    try {
        const orderData = {
            uid: auth.currentUser.uid,
            name: document.getElementById("fullName").value.trim(),
            address: document.getElementById("address").value.trim(),
            city: document.getElementById("city").value.trim(),
            state: document.getElementById("state").value.trim(),
            pincode: document.getElementById("pincode").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            items: cart,
            total: cart.reduce((sum, item) => sum + item.price, 0),
            status: 'pending',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection("orders").add(orderData);
        showToast("Order placed successfully!", "success");
        cart = [];
        localStorage.removeItem('cart');
        updateCartCount();
        closeBuyForm();
        closeCart();
        clearFormInputs(document.getElementById("orderForm"));
    } catch (error) {
        showToast("Error placing order: " + error.message, "error");
    }
}

// Toast Notification
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
}

// Event Listeners
document.getElementById("orderForm").addEventListener("submit", submitOrder);
cartCount.addEventListener("click", showCart);

// Auth state observer
auth.onAuthStateChanged(user => {
    if (user) {
        loginForm.classList.add("hidden");
        signupForm.classList.add("hidden");
        productContainer.classList.remove("hidden");
        loadProducts();
    } else {
        loginForm.classList.remove("hidden");
        productContainer.classList.add("hidden");
        cart = [];
        localStorage.removeItem('cart');
        updateCartCount();
    }
});


