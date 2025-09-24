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
