window.showToast = function(message, type = "success") {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    } else {
        alert(message);
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
        const total = cart.reduce((sum, item) => sum + (item?.price || 0), 0);

        cartItems.innerHTML = cart.map((item, index) => {
            if (!item) return '';

            const priceDisplay = (typeof item.price === "number")
                ? item.price.toFixed(2)
                : (!isNaN(parseFloat(item.price)) ? parseFloat(item.price).toFixed(2) : "0.00");

            const imgSrc = (item.image && Array.isArray(item.image) && item.image.length > 0)
                ? item.image[0]
                : (item.image && typeof item.image === "string")
                    ? item.image
                    : "assets/fallback.png";

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
