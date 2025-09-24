document.addEventListener('DOMContentLoaded', () => {
    const cartCountEl = document.getElementById("cart-count");
    const cartModal = document.getElementById("cart-modal");

    window.updateCartCount = function() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cartCountEl) {
            const badge = cartCountEl.querySelector(".cart-badge");
            if (badge) {
                badge.textContent = cart.length;
                badge.style.display = cart.length ? 'block' : 'none';
            }
        }
    }

    window.removeFromCart = (index) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        window.updateCartCount();
        window.showCart(); // Re-render the cart
    };

    const cartLink = document.querySelector('#cart-count a');
    if (cartLink) {
        cartLink.addEventListener("click", (e) => {
            e.preventDefault();
            window.showCart();
        });
    }

    const closeBtn = document.querySelector("#cart-modal .close-btn");
    if (closeBtn) closeBtn.addEventListener('click', window.closeCart);

    window.addToCart = (product) => {
        // --- START OF FIX ---
        // Check if the product object is valid before proceeding
        if (!product || typeof product.name === 'undefined') {
            console.error("addToCart was called with an invalid product object.", product);
            window.showToast("Could not add item to cart.", "error");
            return;
        }
        // --- END OF FIX ---

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