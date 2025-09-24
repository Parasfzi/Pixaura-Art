window.showToast = function(message, type = "success") {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    } else {
        // Fallback to alert if toast element doesn't exist
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
        // FIX #3: Make the reduce function safer
        const total = cart.reduce((sum, item) => {
            // Only add the price if the item and its price exist
            if (item && typeof item.price === 'number') {
                return sum + item.price;
            }
            return sum; // Otherwise, just return the current sum
        }, 0);

        cartItems.innerHTML = cart.map((item, index) => {
            // Add a check for null items before trying to render them
            if (!item) return ''; 

            return `
                <div class="cart-item">
                    <img src="${Array.isArray(item.image) ? item.image[0] : item.image}" alt="${item.name}" onerror="this.src='assets/placeholder.png'">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <p>₹${item.price.toFixed(2)}</p>
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