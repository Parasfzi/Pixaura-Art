document.addEventListener('DOMContentLoaded', () => {
    const cartCountEl = document.getElementById("cart-count");
    const cartModal = document.getElementById("cart-modal");

    window.updateCartCount = function() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if(cartCountEl){
            const badge = cartCountEl.querySelector(".cart-badge");
            if(badge){
                badge.textContent = cart.length;
                badge.style.display = cart.length ? 'block' : 'none';
            }
        }
    }

    function showCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartItems = document.getElementById("cart-items");
        const cartTotal = document.getElementById("cart-total");

        if (!cartModal || !cartItems || !cartTotal) return;

        if (cart.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            cartTotal.innerHTML = '';
        } else {
            const total = cart.reduce((sum, item) => sum + item.price, 0);
            cartItems.innerHTML = cart.map((item, index) => `
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
            `).join('');
            cartTotal.innerHTML = `
                <h3>Total: ₹${total.toFixed(2)}</h3>
                <p class="item-count">${cart.length} item${cart.length !== 1 ? 's' : ''}</p>
            `;
        }
        cartModal.classList.remove("hidden");
    }

    window.removeFromCart = (index) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showCart(); // Re-render the cart
    };

    function closeCart() {
        if(cartModal) cartModal.classList.add("hidden");
    }

    if (cartCountEl) {
        cartCountEl.addEventListener("click", (e) => {
            e.preventDefault();
            showCart();
        });
    }

    // Add event listener for close button inside the cart modal
    const closeBtn = document.querySelector("#cart-modal .close-btn");
    if(closeBtn) closeBtn.addEventListener('click', closeCart);

    window.addToCart = (product) => {
        if (!auth.currentUser) {
            window.showToast("Please login to add items to cart", "error");
            return;
        }
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.push(product);
        localStorage.setItem('cart', JSON.stringify(cart));
        window.updateCartCount();
        window.showToast(`${product.name} has been added to your cart!`, "success");
    };

    // Initial cart count update
    window.updateCartCount();
});
