// DOM Elements
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const productContainer = document.getElementById("product-container");
const cartModal = document.getElementById("cart-modal");
const buyFormPopup = document.getElementById("buyFormPopup");
const profileName = document.getElementById("profile-name");

// State Management
let allProducts = [];

// DOM Elements for filtering
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');

function populateCategoryFilter() {
    if (!categoryFilter) return;
    const categories = [...new Set(allProducts.map(p => p.category))];
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(category => {
        if (category) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        }
    });
}

function renderFilteredProducts() {
    if (!productContainer || !searchInput || !categoryFilter) return;

    productContainer.innerHTML = "";
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filteredProducts = allProducts.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(searchTerm);
        const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
        return nameMatch && categoryMatch;
    });

    if (filteredProducts.length === 0) {
        productContainer.innerHTML = '<div class="no-products">No products match your criteria.</div>';
        return;
    }

    filteredProducts.forEach(product => renderProductCard(product));
}

document.addEventListener('DOMContentLoaded', () => {
    const orderForm = document.getElementById("orderForm");
    if (orderForm) orderForm.addEventListener("submit", submitOrder);

    if (window.location.hash === '#buyFormPopup') {
        openBuyForm();
        history.replaceState(null, null, ' ');
    }

    if (searchInput) searchInput.addEventListener('input', renderFilteredProducts);
    if (categoryFilter) categoryFilter.addEventListener('change', renderFilteredProducts);
});

function showLogin() {
    if (!loginForm || !signupForm) return;
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    clearFormInputs(signupForm);
}

function showSignup() {
    if (!loginForm || !signupForm) return;
    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");
    clearFormInputs(loginForm);
}

function clearFormInputs(form) {
    if (!form) return;
    form.querySelectorAll('input').forEach(input => input.value = '');
}

async function login() {
    try {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        if (!email || !password) throw new Error('Please fill in all fields');

        await auth.signInWithEmailAndPassword(email, password);
        window.showToast("Logged in successfully!", "success");
        clearFormInputs(loginForm);
    } catch (err) {
        window.showToast(err.message, "error");
    }
}

async function signup() {
    try {
        const name = document.getElementById("signup-name").value.trim();
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value;
        if (!name || !email || !password) throw new Error('Please fill in all fields');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');

        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName: name });
        window.showToast("Account created successfully!", "success");
        showLogin();
    } catch (err) {
        window.showToast(err.message, "error");
    }
}

async function loadProducts() {
    if (!productContainer) return;
    try {
        productContainer.innerHTML = '<div class="loading">Loading products...</div>';
        const snapshot = await db.collection("products").get();
        allProducts = [];
        if (snapshot.empty) {
            productContainer.innerHTML = '<div class="no-products">No products available</div>';
            return;
        }
        snapshot.forEach(doc => {
            allProducts.push({ id: doc.id, ...doc.data() });
        });
        populateCategoryFilter();
        renderFilteredProducts();
    } catch (error) {
        console.error("Error loading products:", error);
        productContainer.innerHTML = '<div class="error">Failed to load products</div>';
    }
}

function renderProductCard(data) {
    const imgUrl = (Array.isArray(data.image) ? data.image[0] : data.image) || 'assets/fallback.png';
    const price = (typeof data.price === "number") ? data.price : parseFloat(data.price) || 0;

    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
        <a href="product.html?id=${data.id}" class="product-link">
            <img src="${imgUrl}" alt="${data.name}" loading="lazy"
                 onerror="this.onerror=null; this.src='assets/fallback.png';">
            <h3>${data.name}</h3>
            <p class="price">₹${price.toFixed(2)}</p>
        </a>
        <button data-product-id="${data.id}" onclick='addToCart(this)'>
            <i class="fa-solid fa-cart-plus"></i> Add to Cart
        </button>
    `;
    if (productContainer) productContainer.appendChild(card);
}

function addToCart(button) {
    const productId = button.getAttribute('data-product-id');
    const productToAdd = allProducts.find(p => p.id === productId);

    if (productToAdd) {
        // 🟢 Safe values force kar rahe hai
        const imgUrl = (Array.isArray(productToAdd.image) && productToAdd.image.length > 0)
            ? productToAdd.image[0]
            : (typeof productToAdd.image === "string" && productToAdd.image.trim() !== "")
                ? productToAdd.image
                : "assets/fallback.png";

        const safeProduct = {
            id: productToAdd.id,
            name: productToAdd.name || "Unnamed Product",
            price: (typeof productToAdd.price === "number")
                    ? productToAdd.price
                    : (!isNaN(parseFloat(productToAdd.price)) ? parseFloat(productToAdd.price) : 0),
            image: [imgUrl] // always array for consistency
        };

        console.log("✅ Adding to cart:", safeProduct); // debugging
        window.addToCart(safeProduct);
    } else {
        window.showToast("Could not add item to cart.", "error");
    }
}


function openBuyForm() {
    if (buyFormPopup) buyFormPopup.classList.remove("hidden");
    if (cartModal) cartModal.classList.add("hidden");
}

function closeBuyForm() {
    if (buyFormPopup) buyFormPopup.classList.add("hidden");
}

async function submitOrder(e) {
    e.preventDefault();
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (!auth.currentUser) {
        return window.showToast("Please login to place an order", "error");
    }
    if (cart.length === 0) {
        return window.showToast("Your cart is empty!", "error");
    }
    const form = document.getElementById("orderForm");
    if (!form.checkValidity()) {
        return window.showToast("Please fill in all required fields", "error");
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
            total: cart.reduce((sum, item) => item ? sum + item.price : sum, 0),
            status: 'pending',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection("orders").add(orderData);
        window.showToast("Order placed successfully!", "success");
        localStorage.removeItem('cart');
        window.updateCartCount();
        closeBuyForm();
        if (cartModal) cartModal.classList.add("hidden");
        clearFormInputs(form);
    } catch (error) {
        window.showToast("Error placing order: " + error.message, "error");
    }
}

auth.onAuthStateChanged(user => {
    const authSection = document.getElementById('auth-section');
    const productsSection = document.getElementById('products-section');
    if (user) {
        if (authSection) authSection.classList.add("hidden");
        if (productsSection) productsSection.classList.remove("hidden");
        loadProducts();
    } else {
        if (authSection) authSection.classList.remove("hidden");
        if (productsSection) productsSection.classList.add("hidden");
    }
});

function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(() => {
            window.showToast("Logged in with Google!", "success");
        })
        .catch(error => {
            window.showToast(error.message, "error");
        });
}
