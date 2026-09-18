$(document).ready(function () {
    loadAllOrders();

    $('#logoutBtn').on('click', function (e) {
        e.preventDefault();
        localStorage.clear();
        window.location.href = "login.html";
    });
});

function loadAllOrders() {
    let jwtToken = localStorage.getItem("JWT");

    $.ajax({
        url: "http://localhost:8080/v1/orders",
        type: 'GET',
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + jwtToken
        },
        success: function (response) {
            console.log("Orders Response:", response);
            let orders = response.body || response;
            let tableBody = $('#orders-table-body');
            tableBody.empty();

            if (orders && orders.length > 0) {
                orders.forEach(order => {
                    let formattedDate = order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A';
                    
                    let row = `<tr>
                                <td>${order.id || ''}</td>
                                <td>Customer ID: ${order.customerId || 'N/A'}</td>
                                <td>${formattedDate}</td>
                                <td>Rs. ${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</td>
                                <td><span class="badge bg-warning text-dark">${order.status || 'PENDING'}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-info text-white" onclick="viewOrderDetails(${order.id})">
                                        <i class="fa-solid fa-eye"></i> View
                                    </button>
                                </td>
                              </tr>`;
                    tableBody.append(row);
                });
            } else {
                tableBody.append(`<tr><td colspan="6" style="text-align: center; color: #94a3b8;">No orders found.</td></tr>`);
            }
        },
        error: function (xhr) {
            console.log("Error loading orders:", xhr);
            $('#orders-table-body').append(`<tr><td colspan="6" style="text-align: center; color: #f87171;">Failed to load orders.</td></tr>`);
        }
    });
}

function viewOrderDetails(orderId) {
    console.log("View details for Order ID:", orderId);
    alert("Viewing details for Order ID: " + orderId);
}