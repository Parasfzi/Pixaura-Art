
// Get product id from URL
const params = new URLSearchParams(window.location.search);
const productId = params.get('id');
let productData = null;

// Toast function
function showToast(msg, type="success") {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.background = type === "error" ? "#e53935" : "#4CAF50";
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// Add to cart
function addToCart() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(productData);
    localStorage.setItem('cart', JSON.stringify(cart));
    showToast("Added to cart!");
}

// Buy now
function buyNow() {
    addToCart();
    window.location.href = "products.html#buyFormPopup";
    // Or: window.location.href = "products.html?buynow=1";
}

// Image slider logic
function setMainImage(url) {
    document.getElementById('main-product-img').src = url;
    document.querySelectorAll('.product-thumbnails img').forEach(img => {
        img.classList.toggle('active', img.src === url);
    });
}

// Fetch and show product
db.collection("products").doc(productId).get().then(doc => {
    if (!doc.exists) {
        document.getElementById('product-detail').innerHTML = "Product not found!";
        return;
    }
    const data = doc.data();
    productData = { ...data, id: productId }; // for cart

    // Images array support
    let images = [];
    if (Array.isArray(data.image)) images = data.image;
    else if (Array.isArray(data.images)) images = data.images;
    else if (typeof data.image === "string") images = [data.image];

    let thumbnails = images.map((url, i) =>
        `<img src="${url}" class="${i===0?'active':''}" onclick="setMainImage('${url.replace(/'/g,"\\'")}')">`
    ).join('');

    document.getElementById('product-detail').innerHTML = `
        <div class="product-detail-container">
            <div class="product-images-main">
                <img id="main-product-img" src="${images[0] || ''}" alt="${data.name}">
            </div>
            <div class="product-thumbnails">${thumbnails}</div>
            <div class="product-detail-title">${data.name}</div>
            <div class="product-detail-price">₹${data.price}</div>
            <div class="product-detail-desc">${data.description || ""}</div>
            <div class="product-detail-actions">
                <button class="add-to-cart-btn" onclick="addToCart()">Add to Cart</button>
                <button class="buy-now-btn" onclick="buyNow()">Buy Now</button>
            </div>
        </div>
    `;
    // Expose setMainImage to global for inline onclick
    window.setMainImage = setMainImage;
}).catch(() => {
    document.getElementById('product-detail').innerHTML = "Error loading product!";
});
