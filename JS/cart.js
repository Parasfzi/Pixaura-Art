// cart.js (final) - only cart UI actions and count
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
    };

    window.removeFromCart = (index) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        window.updateCartCount();
        window.showCart();
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

    // initial
    window.updateCartCount();
});
