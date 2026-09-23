$(document).ready(function () {
    let token = localStorage.getItem("JWT");
    let role = localStorage.getItem("role");

    if (!token || role !== "ADMIN") {
      alert("Access Denied! Admins only.");
      window.location.href = "login.html";
    }
    loadAllOrders();

    $('#logoutBtn').on('click', function (e) {
        e.preventDefault();
        localStorage.clear();
        window.location.href = "login.html";
    });
});
function loadAllOrders() {
    $.ajax({
        url: "http://localhost:8080/v1/orders",
        type: 'GET',
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("JWT")
        },
        success: function (response) {
            let orders = Array.isArray(response) ? response : (response.body || response.data || []);
            let tableBody = $('#orders-table-body');
            tableBody.empty();

            if (orders && orders.length > 0) {
                orders.forEach(order => {
                    let orderId = order.orderId || order.id || '';
                    let formattedDate = order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A';
                    let customerInfo = order.customerName || order.customerId || 'N/A';
                    let totalAmount = order.totalAmount ? order.totalAmount.toFixed(2) : '0.00';

                    let rowId = `order-row-${orderId}`;
                    let row = `<tr id="${rowId}">
                        <td>${orderId}</td>
                        <td>${customerInfo}</td>
                        <td>${formattedDate}</td>
                        <td>Rs. ${totalAmount}</td>
                        <td><span class="badge bg-secondary delivery-badge">Loading...</span></td>
                        <td><span class="badge bg-secondary payment-badge">Loading...</span></td>
                        <td>
                            <button class="btn btn-sm btn-info text-white" onclick="viewOrderDetails(${orderId})">
                                <i class="fa-solid fa-eye"></i> View
                            </button>
                        </td>
                    </tr>`;
                    tableBody.append(row);

                    if (orderId) {
                        fetchDeliveryStatus(orderId, rowId);
                    }
                });
            } else {
                tableBody.append(`<tr><td colspan="7" class="text-center text-muted py-3">No orders found.</td></tr>`);
            }
        },
        error: function (xhr) {
            console.log("Error loading orders:", xhr);
            $('#orders-table-body').html(`<tr><td colspan="7" class="text-center text-danger py-3">Failed to load orders.</td></tr>`);
        }
    });
}

function fetchDeliveryStatus(orderId, rowId) {
    $.ajax({
        url: "http://localhost:8080/v1/delivery/order/" + orderId,
        type: 'GET',
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("JWT")
        },
        success: function (response) {
            let deliveryData = response.body || response.data || response;
            let status = deliveryData ? (deliveryData.deliveryStatus || deliveryData.status) : 'PENDING';

            let badgeClass = 'bg-warning text-dark';
            if (status === 'DELIVERED') badgeClass = 'bg-success';
            else if (status === 'OUT_FOR_DELIVERY') badgeClass = 'bg-info text-dark';
            else if (status === 'CANCELLED') badgeClass = 'bg-danger';
            else if (status === 'PROCESSING') badgeClass = 'bg-primary';

            $(`#${rowId} td:nth-child(5)`).html(`<span class="badge ${badgeClass}">${status}</span>`);
        },
        error: function () {
            $(`#${rowId} td:nth-child(5)`).html(`<span class="badge bg-secondary">PENDING</span>`);
        }
    });
}
function viewOrderDetails(orderId) {
    console.log("Fetching payment details for Order ID:", orderId);

    $.ajax({
        url: "http://localhost:8080/v1/payments/order/" + orderId, 
        type: 'GET',
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("JWT")
        },
        success: function (response) {
            console.log("API Response:", response); 
            let paymentData = response.body || response.data || response;

            if (paymentData) {
                $('#modalOrderId').text(orderId);
                $('#modalPaymentId').text(paymentData.id || 'N/A');
                $('#modalAmount').text('Rs. ' + (paymentData.amount ? paymentData.amount.toFixed(2) : '0.00'));
                $('#modalPaymentMethod').text(paymentData.paymentMethod || 'N/A');

                let status = paymentData.paymentStatus || 'PENDING';
                let statusBadge = status === 'PAID' ? 
                    '<span class="badge bg-success">PAID</span>' : 
                    '<span class="badge bg-warning text-dark">PENDING</span>';
                
                $('#modalPaymentStatus').html(statusBadge);

                let paymentModal = new bootstrap.Modal(document.getElementById('paymentDetailsModal'));
                paymentModal.show();
            } else {
                alert("Payment details not found for this order!");
            }
        },
        error: function (xhr) {
            console.log("Error fetching payment details:", xhr);
            alert("Failed to load payment details!");
        }
    });
}