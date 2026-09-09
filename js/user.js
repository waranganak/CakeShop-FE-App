const ORDER_BASE_URL = "http://localhost:8080/v1/orders"; 
const ITEM_BASE_URL = "http://localhost:8080/v1/items";   

$(document).ready(function() {
     
    let username = localStorage.getItem("username") || "Staff Member";

    $("#userWelcomeMsg").text("Welcome Back, " + username + "!");

    $("#btnViewMenu").click(function() {
        $('.main-dashboard-view').hide();
        $('#menu-section').fadeIn();
        loadCakeMenu();
    });

    $("#btnViewOrders").click(function() {
        $('.main-dashboard-view').hide();
        $('#orders-section').fadeIn();
        loadAllOrders();
    });
});

function loadCakeMenu() {
    let token = localStorage.getItem("JWT");

    $.ajax({
        url: ITEM_BASE_URL,
        type: "GET",
        headers: { "Authorization": "Bearer " + token },
        success: function(response) {
            let tbody = $('#menuTableBody');
            tbody.empty();
            let items = response.data || response;
            
            if (items && items.length > 0) {
                items.forEach(item => {
                    let row = `<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 12px;">#${item.id || item.itemId}</td>
                        <td style="padding: 12px;">${item.name || item.itemName}</td>
                        <td style="padding: 12px;">Rs. ${item.price ? item.price.toFixed(2) : '0.00'}</td>
                    </tr>`;
                    tbody.append(row);
                });
            } else {
                tbody.append(`<tr><td colspan="3" style="padding: 20px; text-align: center; color: #94a3b8;">No menu items available.</td></tr>`);
            }
        },
        error: function(err) {
            $('#menuTableBody').html(`<tr><td colspan="3" style="padding: 20px; text-align: center; color: #ef4444;">Failed to load menu items.</td></tr>`);
        }
    });
}

function loadAllOrders() {
    let token = localStorage.getItem("JWT");

    $.ajax({
        url: ORDER_BASE_URL,
        type: "GET",
        headers: { "Authorization": "Bearer " + token },
        success: function(response) {
            let tbody = $('#ordersTableBody');
            tbody.empty();
            let orders = response.data || response;

            if (orders && orders.length > 0) {
                orders.forEach(order => {
                    let row = `<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 12px;">#${order.id || order.orderId}</td>
                        <td style="padding: 12px;">${order.customerName || 'Customer'}</td>
                        <td style="padding: 12px;">Rs. ${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</td>
                        <td style="padding: 12px;"><span style="color: #ff758c; font-weight: 600;">${order.status || 'Pending'}</span></td>
                    </tr>`;
                    tbody.append(row);
                });
            } else {
                tbody.append(`<tr><td colspan="4" style="padding: 20px; text-align: center; color: #94a3b8;">No orders found.</td></tr>`);
            }
        },
        error: function(err) {
            $('#ordersTableBody').html(`<tr><td colspan="4" style="padding: 20px; text-align: center; color: #ef4444;">Failed to load orders.</td></tr>`);
        }
    });
}

function showDashboard() {
    $('.content-view').hide();
    $('.main-dashboard-view').fadeIn();
}

function logout() {
    localStorage.removeItem("JWT");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");

    window.location.href = "/html/login.html";
}