document.addEventListener('DOMContentLoaded', () => {
    const orderHistoryContainer = document.getElementById('order-history-container');

    auth.onAuthStateChanged(user => {
        if (user) {
            // Fetch orders for the current user
            db.collection('orders')
              .where('uid', '==', user.uid)
              .orderBy('timestamp', 'desc')
              .get()
              .then(snapshot => {
                  if (snapshot.empty) {
                      orderHistoryContainer.innerHTML = '<p>You have no past orders.</p>';
                      return;
                  }

                  let ordersHtml = '';
                  snapshot.forEach(doc => {
                      const order = doc.data();
                      const orderDate = order.timestamp.toDate().toLocaleDateString();
                      let itemsHtml = '<ul class="order-items-list">';
                      order.items.forEach(item => {
                          itemsHtml += `<li>${item.name} - ₹${item.price.toFixed(2)}</li>`;
                      });
                      itemsHtml += '</ul>';

                      ordersHtml += `
                          <div class="order-card">
                              <div class="order-header">
                                  <span>Order Date: ${orderDate}</span>
                                  <span>Total: ₹${order.total.toFixed(2)}</span>
                              </div>
                              <div class="order-body">
                                  <p><strong>Items:</strong></p>
                                  ${itemsHtml}
                                  <p><strong>Status:</strong> ${order.status}</p>
                              </div>
                          </div>
                      `;
                  });
                  orderHistoryContainer.innerHTML = ordersHtml;
              })
              .catch(error => {
                  console.error("Error fetching orders:", error);
                  orderHistoryContainer.innerHTML = '<p>Could not load your order history.</p>';
              });
        } else {
            // If no user is logged in, redirect to the login page
            window.location.href = 'products.html';
        }
    });
});
