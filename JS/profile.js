document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profile-form');
    const profileNameInput = document.getElementById('profile-name-input');
    const profileEmail = document.getElementById('profile-email');
    const profilePhone = document.getElementById('profile-phone');
    const profileAddress = document.getElementById('profile-address');

    let currentUser = null;

    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            // Populate user's email (cannot be changed)
            profileEmail.value = user.email;

            // Populate user's name from Firebase Auth profile
            profileNameInput.value = user.displayName || '';

            // Fetch additional user data from Firestore
            const userDocRef = db.collection('users').doc(user.uid);
            userDocRef.get().then(doc => {
                if (doc.exists) {
                    const userData = doc.data();
                    profilePhone.value = userData.phone || '';
                    profileAddress.value = userData.address || '';
                }
            }).catch(error => {
                console.error("Error fetching user data:", error);
            });
        } else {
            // If no user is logged in, redirect to the login page
            window.location.href = 'products.html';
        }
    });

    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newName = profileNameInput.value.trim();
        const newPhone = profilePhone.value.trim();
        const newAddress = profileAddress.value.trim();

        // Update Firebase Auth display name
        currentUser.updateProfile({
            displayName: newName
        }).then(() => {
            // Update additional info in Firestore
            const userDocRef = db.collection('users').doc(currentUser.uid);
            return userDocRef.set({
                phone: newPhone,
                address: newAddress
            }, { merge: true });
        }).then(() => {
            showToast("Profile updated successfully!", "success");
        }).catch(error => {
            console.error("Error updating profile:", error);
            showToast("Error updating profile.", "error");
        });
    });
});

function showToast(message, type = "success") {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
