document.addEventListener('DOMContentLoaded', () => {
    const profileName = document.getElementById("profile-name");
    const logoutBtn = document.getElementById("logout-btn");
    const userIcon = document.getElementById("user-icon");
    const userLi = document.getElementById("user-li");


    auth.onAuthStateChanged(user => {
        if (user) {
            if(profileName){
                profileName.textContent = user.displayName ? `Hi, ${user.displayName}` : 'Hi, User';
                profileName.style.display = 'inline-block';
            }
            if(logoutBtn) logoutBtn.style.display = 'inline-block';
            if(userIcon) userIcon.style.display = 'none';
            if(userLi) userLi.style.display = 'none';

        } else {
            if(profileName) profileName.style.display = 'none';
            if(logoutBtn) logoutBtn.style.display = 'none';
            if(userIcon) userIcon.style.display = 'inline-block';
            if(userLi) userLi.style.display = 'inline-block';
        }
    });

    if(logoutBtn){
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                window.location.href = "index.html";
            }).catch((error) => {
                console.error("Sign out error", error);
            });
        });
    }
});
