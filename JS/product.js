
// DOM Elements
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const productContainer = document.getElementById("product-container");
const cartModal = document.getElementById("cart-modal");
const cartCount = document.getElementById("cart-count");
const buyFormPopup = document.getElementById("buyFormPopup");
const profileName = document.getElementById("profile-name");

// State Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', () => {
    const orderForm = document.getElementById("orderForm");
    if (orderForm) orderForm.addEventListener("submit", submitOrder);

    if (window.location.hash === '#buyFormPopup') {
        openBuyForm();
    }
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
    if (!form) return;
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
        const name = document.getElementById("signup-name").value.trim();
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value;
        
        if (!name || !email || !password) {
            throw new Error('Please fill in all fields');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }

        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName: name });
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

function renderProductCard(data) {
    const imgUrl = Array.isArray(data.image) ? data.image[0] : data.image;
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
        <a href="product.html?id=${data.id}" class="product-link">
            <img src="${imgUrl}" alt="${data.name}">
            <h3>${data.name}</h3>
            <p class="price">₹${data.price}</p>
        </a>
        <button onclick='addToCart(${JSON.stringify(data)})' class="add-to-cart-btn">
            <i class="fa-solid fa-cart-plus"></i> Add to Cart
        </button>
    `;
    productContainer.appendChild(card);
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
    const imgUrl = Array.isArray(data.image) ? data.image[0] : data.image;
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
        <a href="product.html?id=${data.id}" class="product-link">
            <img src="${imgUrl}" alt="${data.name}">
            <h3>${data.name}</h3>
            <p class="price">₹${data.price}</p>
        </a>
        <button onclick='addToCart(${JSON.stringify(data)})'>
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
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    window.updateCartCount();
    showToast("Added to cart!", "success");
}

function openBuyForm() {
    document.getElementById("buyFormPopup").classList.remove("hidden");
}

function closeBuyForm() {
    document.getElementById("buyFormPopup").classList.add("hidden");
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

// Auth state observer
auth.onAuthStateChanged(user => {
    const authSection = document.getElementById('auth-section');
    const productsSection = document.getElementById('products-section');
    if (user) {
        authSection.classList.add("hidden");
        productsSection.classList.remove("hidden");
        loadProducts();
        // Show user name in navbar
        profileName.textContent = user.displayName ? `Hi, ${user.displayName}` : '';
        profileName.style.display = "inline-block";
    } else {
        authSection.classList.remove("hidden");
        productsSection.classList.add("hidden");
        cart = [];
        localStorage.removeItem('cart');
        updateCartCount();
        profileName.textContent = '';
        profileName.style.display = "none";
    }
});

function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(result => {
            showToast("Logged in with Google!", "success");
        })
        .catch(error => {
            showToast(error.message, "error");
        });
}


