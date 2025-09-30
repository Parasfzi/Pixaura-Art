// product.js - Pixaura (final)
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const productContainer = document.getElementById("product-container");
const cartModal = document.getElementById("cart-modal");
const buyFormPopup = document.getElementById("buyFormPopup");
const profileName = document.getElementById("profile-name");

let allProducts = [];

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
        const nameMatch = product.name && product.name.toLowerCase().includes(searchTerm);
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

function clearFormInputs(form) {
    if (!form) return;
    form.querySelectorAll('input').forEach(input => input.value = '');
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

function renderProductCard(product) {
    // Safe image & price logic - same as saved to cart
    const imgUrl = (Array.isArray(product.image) && product.image[0]) ||
                   (typeof product.image === 'string' && product.image.trim()) ||
                   'assets/fallback.png';

    const priceVal = (typeof product.price === 'number') ? product.price :
                     (!isNaN(parseFloat(product.price)) ? parseFloat(product.price) : 0);

    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
        <a href="product.html?id=${product.id}" class="product-link">
            <img src="${imgUrl}" alt="${product.name || 'Product'}" loading="lazy"
                 onerror="this.onerror=null; this.src='assets/fallback.png';">
            <h3>${product.name || 'Unnamed Product'}</h3>
            <p class="price">₹${priceVal.toFixed(2)}</p>
        </a>
        <button data-product-id="${product.id}" class="add-to-cart-btn">
            <i class="fa-solid fa-cart-plus"></i> Add to Cart
        </button>
    `;
    if (productContainer) productContainer.appendChild(card);

    // attach click listener (avoids inline onclick issues/overrides)
    const btn = card.querySelector('.add-to-cart-btn');
    if (btn) btn.addEventListener('click', () => addToCartFromCard(product.id));
}

// Called when a product card's Add to Cart is clicked
function addToCartFromCard(productId) {
    const productToAdd = allProducts.find(p => p.id === productId);
    if (!productToAdd) {
        window.showToast("Could not add item to cart.", "error");
        return;
    }

    // Normalize image
    let imgUrl = 'assets/fallback.png';
    if (Array.isArray(productToAdd.image) && productToAdd.image.length > 0 && productToAdd.image[0]) {
        imgUrl = productToAdd.image[0];
    } else if (typeof productToAdd.image === "string" && productToAdd.image.trim() !== "") {
        imgUrl = productToAdd.image.trim();
    }

    // Normalize price
    let priceVal = 0;
    if (typeof productToAdd.price === "number") priceVal = productToAdd.price;
    else if (productToAdd.price !== undefined && productToAdd.price !== null) {
        const p = parseFloat(productToAdd.price);
        priceVal = isNaN(p) ? 0 : p;
    }

    const safeProduct = {
        id: productToAdd.id,
        name: (productToAdd.name || "Unnamed Product").toString(),
        price: priceVal,
        image: [imgUrl]
    };

    console.log("✅ Adding to cart (safeProduct):", safeProduct);
    // directly add to cart storage (single source of truth)
    addProductObjectToCart(safeProduct);
}

// For product.html (single product page) you already have productData; call this:
function addToCartFromDetail(productObj) {
    if (!productObj) {
        window.showToast("Product not loaded yet", "error");
        return;
    }
    // prepare same normalization
    let imgUrl = 'assets/fallback.png';
    if (Array.isArray(productObj.image) && productObj.image.length > 0 && productObj.image[0]) {
        imgUrl = productObj.image[0];
    } else if (typeof productObj.image === "string" && productObj.image.trim() !== "") {
        imgUrl = productObj.image.trim();
    }
    let priceVal = (typeof productObj.price === 'number') ? productObj.price :
                   (!isNaN(parseFloat(productObj.price)) ? parseFloat(productObj.price) : 0);

    const safeProduct = {
        id: productObj.id,
        name: (productObj.name || 'Unnamed Product').toString(),
        price: priceVal,
        image: [imgUrl]
    };

    console.log("✅ Adding to cart from detail:", safeProduct);
    addProductObjectToCart(safeProduct);
}

// single canonical function that writes to localStorage & updates UI
function addProductObjectToCart(product) {
    if (!product || typeof product !== 'object') {
        console.warn("addProductObjectToCart called with invalid product:", product);
        window.showToast("Could not add item to cart.", "error");
        return;
    }

    // normalize final product (guarantee fields)
    const normalized = {
        id: product.id || `unknown-${Date.now()}`,
        name: String(product.name || "Unnamed Product"),
        price: (typeof product.price === 'number') ? product.price : ( !isNaN(parseFloat(product.price)) ? parseFloat(product.price) : 0 ),
        image: Array.isArray(product.image) ? product.image : ( product.image ? [String(product.image)] : ['assets/fallback.png'] )
    };

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(normalized);
    localStorage.setItem('cart', JSON.stringify(cart));

    window.updateCartCount && window.updateCartCount();
    window.showToast(`${normalized.name} has been added to your cart!`, "success");
    window.showCart && window.showCart();

    console.log("🛒 Cart updated:", cart);
}

// Replace the previous addToCart implementation with a safe delegating alias
// that never calls itself. It delegates to addProductObjectToCart which is the
// single writer for the cart.
function addToCart(product) {
    // Delegate to canonical writer. This prevents any accidental recursion
    // if some template or inline script calls window.addToCart(...)
    if (typeof addProductObjectToCart === 'function') {
        return addProductObjectToCart(product);
    }
    console.warn("addProductObjectToCart not available — cannot add to cart.");
    return;
}

/* --- remaining functions (order, auth handlers etc.) --- */
/* keep your existing submitOrder, openBuyForm, closeBuyForm, login/signup, loadProducts etc. */
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
            total: cart.reduce((sum, item) => sum + (item?.price || 0), 0),
            status: 'pending',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection("orders").add(orderData);
        window.showToast("Order placed successfully!", "success");
        localStorage.removeItem('cart');
        window.updateCartCount();
        if (document.getElementById("buyFormPopup")) document.getElementById("buyFormPopup").classList.add('hidden');
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

function login() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (!email || !password) {
        window.showToast("Please enter both email and password.", "error");
        return;
    }
    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            window.showToast("Login successful!", "success");
            // Optionally hide login form and show products
            document.getElementById('auth-section').style.display = 'none';
            document.getElementById('filter-section').style.display = '';
            document.getElementById('products-section').classList.remove('hidden');
        })
        .catch(error => {
            window.showToast(error.message, "error");
        });
}

function signup() {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    if (!name || !email || !password) {
        window.showToast("Please fill all fields.", "error");
        return;
    }
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            // Optionally save name to Firestore
            window.showToast("Signup successful! Please login.", "success");
            showLogin();
        })
        .catch(error => {
            window.showToast(error.message, "error");
        });
}

function showSignup() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.remove('hidden');
}

function showLogin() {
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
}

function openBuyForm() {
    const buyFormPopup = document.getElementById("buyFormPopup");
    if (buyFormPopup) {
        buyFormPopup.classList.remove("hidden");
    }
}
