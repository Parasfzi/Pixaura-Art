document.addEventListener('DOMContentLoaded', () => {
    // Active link highlighting
    const navLinks = document.querySelectorAll('.nav a');
    const currentPath = window.location.pathname.split('/').pop();
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop();
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });

    const userLi = document.getElementById("user-li");
    const profileMenuContainer = document.querySelector(".profile-menu-container");
    const profileMenuTrigger = document.getElementById("profile-menu-trigger");
    const profileDropdown = document.getElementById("profile-dropdown");
    const logoutBtn = document.getElementById("logout-btn");

    auth.onAuthStateChanged(user => {
        if (user) {
            userLi.style.display = 'none';
            profileMenuContainer.style.display = 'inline-block';
            profileMenuTrigger.textContent = user.displayName ? `Hi, ${user.displayName}` : 'Hi, User';
        } else {
            userLi.style.display = 'inline-block';
            profileMenuContainer.style.display = 'none';
        }
    });

    profileMenuTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        profileDropdown.classList.toggle('show');
    });

    window.addEventListener('click', (e) => {
        if (!profileMenuContainer.contains(e.target)) {
            profileDropdown.classList.remove('show');
        }
    });

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut().then(() => {
            window.location.href = "index.html";
        }).catch((error) => {
            console.error("Sign out error", error);
        });
    });
});
