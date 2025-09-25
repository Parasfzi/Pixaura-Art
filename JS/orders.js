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
                          // Safely parse item price
                          let itemPrice = 0;
                          if (typeof item.price === "number") {
                              itemPrice = item.price;
                          } else if (!isNaN(parseFloat(item.price))) {
                              itemPrice = parseFloat(item.price);
                          }
                          itemsHtml += `<li>${item.name} - ₹${itemPrice.toFixed(2)}</li>`;
                      });
                      itemsHtml += '</ul>';

                      // Safely parse total
                      let total = 0;
                      if (typeof order.total === "number") {
                          total = order.total;
                      } else if (!isNaN(parseFloat(order.total))) {
                          total = parseFloat(order.total);
                      }
                      const totalDisplay = total ? total.toFixed(2) : "0.00";

                      ordersHtml += `
                          <div class="order-card">
                              <div class="order-header">
                                  <span>Order Date: ${orderDate}</span>
                                  <span>Total: ₹${totalDisplay}</span>
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
