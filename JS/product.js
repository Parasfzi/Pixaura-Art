const firebaseConfig = {
    apiKey: "AIzaSyDvuETPdTeZsDasgOw7MW59IrsmeOQP7kk",
    authDomain: "chat-web-23e9c.firebaseapp.com",
    projectId: "chat-web-23e9c",
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const loginForm = document.getElementById("login-form");
const productContainer = document.getElementById("product-container");
const cartModal = document.getElementById("cart-modal");
const cartCount = document.getElementById("cart-count");

let cart = [];

auth.onAuthStateChanged(user => {
    if (user) {
        loginForm.classList.add("hidden");
        loadProducts();
    } else {
        loginForm.classList.remove("hidden");
        productContainer.classList.add("hidden");
    }
});

function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {})
        .catch(err => alert(err.message));
}

function logout() {
    auth.signOut();
}

function loadProducts() {
    productContainer.innerHTML = "";
    productContainer.classList.remove("hidden");
    db.collection("products").get().then(snapshot => {
        snapshot.forEach(doc => {
            const data = doc.data();
            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <img src="${data.image}" alt="${data.name}">
                <h3>${data.name}</h3>
                <p>₹${data.price}</p>
                <button onclick='addToCart(${JSON.stringify(data)})'>Add to Cart</button>
            `;
            productContainer.appendChild(card);
        });
    });
}

function addToCart(product) {
    cart.push(product);
    updateCartCount();
}

function updateCartCount() {
    cartCount.innerText = "Cart (" + cart.length + ")";
}

cartCount.addEventListener("click", () => {
    showCart();
});

function showCart() {
    cartModal.classList.remove("hidden");
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    cartItems.innerHTML = "";
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        const div = document.createElement("div");
        div.innerHTML = `
            <p>${item.name} - ₹${item.price} <button onclick="removeFromCart(${index})">Remove</button></p>
        `;
        cartItems.appendChild(div);
    });
    cartTotal.innerText = "Total: ₹" + total;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    showCart();
}

function closeCart() {
    cartModal.classList.add("hidden");
}

function buyNow() {
    alert("Purchase successful! (Dummy)");
    cart = [];
    updateCartCount();
    closeCart();
}




function openBuyForm() {
  document.getElementById("buyFormPopup").style.display = "block";
}

function closeBuyForm() {
  document.getElementById("buyFormPopup").style.display = "none";
}

document.getElementById("buyForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const address = document.getElementById("address").value;
  const phone = document.getElementById("phone").value;
  
  // You can send this to Firestore or console.log
  console.log({ name, address, phone, cart });

  alert("Order placed successfully!");
  closeBuyForm();
});



function submitOrder() {
  const name = document.getElementById("fullName").value;
  const address = document.getElementById("address").value;
  const city = document.getElementById("city").value;
  const state = document.getElementById("state").value;
  const pincode = document.getElementById("pincode").value;
  const phone = document.getElementById("phone").value;

  const user = auth.currentUser;

  if (!user) {
    alert("Please log in first!");
    return;
  }

  const orderData = {
    uid: user.uid,
    name,
    address,
    city,
    state,
    pincode,
    phone,
    timestamp: new Date()
  };

  db.collection("orders").add(orderData)
    .then(() => {
      alert("Order placed successfully!");
      cart = [];
      updateCartCount();
      closeBuyForm();
    })
    .catch((error) => {
      console.error("Error placing order: ", error);
    });
}


