window.showToast = function(message, type = "success") {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    } else {
        alert(message); // fallback
    }
};

window.showCart = function() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartModal = document.getElementById("cart-modal");
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");

    if (!cartModal || !cartItems || !cartTotal) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        cartTotal.innerHTML = '';
    } else {
        // ✅ Safe total calculation
        const total = cart.reduce((sum, item) => {
            let price = 0;
            if (item) {
                if (typeof item.price === 'number') {
                    price = item.price;
                } else if (!isNaN(parseFloat(item.price))) {
                    price = parseFloat(item.price);
                }
            }
            return sum + price;
        }, 0);

        cartItems.innerHTML = cart.map((item, index) => {
            if (!item) return '';

            // ✅ Force safe price
            let priceDisplay = "0.00";
            if (typeof item.price === "number") {
                priceDisplay = item.price.toFixed(2);
            } else if (!isNaN(parseFloat(item.price))) {
                priceDisplay = parseFloat(item.price).toFixed(2);
            }

            // ✅ Force safe image
            let imgSrc = "assets/fallback.png"; // default
            if (item.image) {
                if (Array.isArray(item.image) && item.image.length > 0 && item.image[0]) {
                    imgSrc = item.image[0];
                } else if (typeof item.image === "string" && item.image.trim() !== "") {
                    imgSrc = item.image;
                }
            }

            return `
                <div class="cart-item">
                    <img src="${imgSrc}" alt="${item.name || "Product"}" 
                         onerror="this.onerror=null; this.src='assets/fallback.png';">
                    <div class="item-details">
                        <h4>${item.name || "Unnamed Product"}</h4>
                        <p>₹${priceDisplay}</p>
                    </div>
                    <button onclick="window.removeFromCart(${index})" class="remove-btn">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');
        
        cartTotal.innerHTML = `
            <h3>Total: ₹${total.toFixed(2)}</h3>
            <p class="item-count">${cart.length} item${cart.length !== 1 ? 's' : ''}</p>
        `;
    }
    cartModal.classList.remove("hidden");
};

window.closeCart = function() {
    const cartModal = document.getElementById("cart-modal");
    if(cartModal) cartModal.classList.add("hidden");
};
