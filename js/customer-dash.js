let cart = JSON.parse(localStorage.getItem("cart")) || [];
const DELIVERY_FEE = 400.00; 

$(document).ready(function () {   
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    if ($('#current-date').length) {
        $('#current-date').text(new Date().toLocaleDateString('en-US', options));
    }
    updateCartCount();

    let customerName = localStorage.getItem("username");
    let customerId = localStorage.getItem("userId") || 1;
    
    let storedRole = localStorage.getItem("role") || "CUSTOMER";
    let cleanRole = storedRole.replace("ROLE_", "").toUpperCase();

    $("#customerRoleBadge").text(cleanRole);

    if (customerName && customerName !== "undefined" && customerName !== "null") {
        $("#customerWelcomeMsg").text("Welcome, " + customerName + "!");
        $("#customerNavbarName").text(customerName);
    } else {
        $.ajax({
            url: "http://localhost:8080/v1/customers/" + customerId,
            type: "GET",
            contentType: "application/json",
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("JWT")
            },
            success: function(response) {
                let resBody = response.body;
                if (resBody && resBody.name) {
                    let fetchedName = resBody.name;
                    localStorage.setItem("username", fetchedName); 
                    $("#customerWelcomeMsg").text("Welcome, " + fetchedName + "!");
                    $("#customerNavbarName").text(fetchedName);
                } else {
                    $("#customerWelcomeMsg").text("Welcome, Customer!");
                    $("#customerNavbarName").text("Customer");
                }
            },
            error: function(xhr) {
                console.error("Failed to fetch customer name", xhr);
                $("#customerWelcomeMsg").text("Welcome, Customer!");
                $("#customerNavbarName").text("Customer");
            }
        });
    }

    $('#logoutBtn').on('click', function (e) {
        e.preventDefault();
        logout();
    });
});



function showSection(sectionId) {
    $('.main-dashboard-view').hide();
    $('.content-view').hide();
    $('#' + sectionId).fadeIn();
}

function showDashboard() {
    $('.content-view').hide();
    $('.main-dashboard-view').fadeIn();
}



function openProfileSection() {
    showSection('profile-section');
    let customerId = localStorage.getItem("userId") || 1;
    loadCustomerProfile(customerId);
}

function loadCustomerProfile(customerId) {
    $.ajax({
        url: "http://localhost:8080/v1/customers/" + customerId,
        type: "GET",
        contentType: "application/json",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function(response) {
            console.log("Profile Response:", response);
            let resBody = response.body;
            if (resBody) {
                $('#customer-id').val(resBody.id || resBody.customerId);
                $('#name').val(resBody.name);
                $('#email').val(resBody.email);
                $('#phone').val(resBody.phone);
                $('#address').val(resBody.address);
            }
        },
        error: function(xhr) {
            console.error("Failed to load profile data", xhr);
        }
    });
}

function updateCustomerProfile() {
    const customerData = {
        id: parseInt($('#customer-id').val()),
        name: $('#name').val(),
        email: $('#email').val(),
        phone: $('#phone').val(),
        address: $('#address').val()
    };

    $.ajax({
        url: "http://localhost:8080/v1/customers",
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify(customerData),
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function(response) {
            console.log("Update Response:", response);
            let resBody = response.body;
            let msg = (typeof resBody === 'string') ? resBody : (response.message || (resBody && resBody.message) || "Profile Updated Successfully!");
            
            alert(msg);
            
            localStorage.setItem("username", customerData.name);
            
            $("#customerWelcomeMsg").text("Welcome, " + customerData.name + "!");
            $("#customerNavbarName").text(customerData.name);
        },
        error: function(xhr) {
            console.error("Error updating profile:", xhr);
            let errMsg = "Failed to update profile!";
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errMsg = xhr.responseJSON.message;
            }
            alert(errMsg);
        }
    });
}



function openOrdersSection() {
    showSection('orders-section');
    let customerId = localStorage.getItem("userId") || 1;
    loadCustomerOrders(customerId);
}

function loadCustomerOrders(customerId) {
    $.ajax({
        url: "http://localhost:8080/v1/orders/customer/" + customerId,
        type: "GET",
        contentType: "application/json",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function(response) {
            console.log("Orders Response:", response);
            let orders = response.body;
            let tbody = $('#ordersTableBody');
            tbody.empty();

            if (orders && orders.length > 0) {
                orders.forEach(order => {
                    let formattedDate = order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A';
                    let row = `<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 12px;">#${order.id || order.orderId}</td>
                        <td style="padding: 12px; color: #94a3b8;">${formattedDate}</td>
                        <td style="padding: 12px;">Rs. ${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</td>
                        <td style="padding: 12px;">
                            <span style="padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; background: rgba(214, 51, 132, 0.15); color: #d63384;">
                                ${order.status || 'PLACED'}
                            </span>
                        </td>
                    </tr>`;
                    tbody.append(row);
                });
            } else {
                tbody.append(`<tr><td colspan="4" style="padding: 20px; text-align: center; color: #94a3b8;">No order history found.</td></tr>`);
            }
        },
        error: function(xhr) {
            console.error("Failed to load customer orders", xhr);
            $('#ordersTableBody').html(`<tr><td colspan="4" style="padding: 20px; text-align: center; color: #ef4444;">Failed to load orders.</td></tr>`);
        }
    });
}




function openCartSection() {
    showSection('cart-section');
    loadCartTable();
}

function addToCart(cakeName, price, productId = 1) {
    let existingItem = cart.find(item => item.cakeName === cakeName);
    if (existingItem) {
        existingItem.quantity += 1;
        existingItem.subTotal = existingItem.quantity * price;
    } else {
        cart.push({
            productId: productId,
            cakeName: cakeName,
            price: price,
            quantity: 1,
            subTotal: price
        });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    alert(cakeName + " added to cart successfully!");
}

function updateCartCount() {
    let totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    $('#cartCountBadge').text(totalCount);
}

function togglePaymentMethod() {
    let selectedMethod = $('input[name="paymentMethod"]:checked').val();
    if (selectedMethod === "CARD") {
        $('#cardDetailsContainer').slideDown();
    } else {
        $('#cardDetailsContainer').slideUp();
    }
}

function loadCartTable() {
    let tbody = $('#cartTableBody');
    tbody.empty();
    let subtotal = 0;

    if (cart.length > 0) {
        cart.forEach((item, index) => {
            subtotal += item.subTotal;
            let row = `<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 12px; color: #fff;">${item.cakeName}</td>
                <td style="padding: 12px;">Rs. ${item.price.toFixed(2)}</td>
                <td style="padding: 12px;">${item.quantity}</td>
                <td style="padding: 12px; color: #ff758c;">Rs. ${item.subTotal.toFixed(2)}</td>
                <td style="padding: 12px;"><button onclick="removeFromCart(${index})" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer;"><i class="fa-solid fa-trash"></i></button></td>
            </tr>`;
            tbody.append(row);
        });
    } else {
        tbody.append(`<tr><td colspan="5" style="padding: 20px; text-align: center; color: #94a3b8;">Your cart is empty.</td></tr>`);
    }

    let grandTotal = subtotal > 0 ? subtotal + DELIVERY_FEE : 0;

    $('#cartSubTotal').text("Rs. " + subtotal.toFixed(2));
    $('#deliveryFee').text(subtotal > 0 ? "Rs. " + DELIVERY_FEE.toFixed(2) : "Rs. 0.00");
    $('#cartGrandTotal').text("Rs. " + grandTotal.toFixed(2));
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    loadCartTable();
}

function checkoutOrder() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    let selectedPaymentMethod = $('input[name="paymentMethod"]:checked').val() || "COD";

    if (selectedPaymentMethod === "CARD") {
        let cardNumber = $('#cardNumber').val().trim();
        let cardExpiry = $('#cardExpiry').val().trim();
        let cardCvv = $('#cardCvv').val().trim();

        if (!cardNumber || !cardExpiry || !cardCvv) {
            alert("Please fill in all card details!");
            return;
        }

        if (cardNumber.length < 15) {
            alert("Please enter a valid card number!");
            return;
        }
    }

    let customerId = localStorage.getItem("userId") || 1;
    let subtotal = cart.reduce((sum, item) => sum + item.subTotal, 0);
    let grandTotal = subtotal + DELIVERY_FEE;

    let orderDTO = {
        customerId: parseInt(customerId),
        totalAmount: grandTotal,
        paymentMethod: selectedPaymentMethod,
        status: "PLACED",
        orderDetails: cart.map(item => ({
            productId: item.productId || 1,
            productName: item.cakeName,
            quantity: item.quantity,
            price: item.price,
            subTotal: item.subTotal
        }))
    };

    $.ajax({
        url: "http://localhost:8080/v1/orders",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(orderDTO),
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function(response) {
            console.log("Checkout Response:", response);
            let resBody = response.body;
            let msg = (typeof resBody === 'string') ? resBody : (response.message || (resBody && resBody.message) || "Order placed successfully!");
            
            if (selectedPaymentMethod === "CARD") {
                alert("Payment Successful via Card! " + msg);
            } else {
                alert(msg + " (Payment: Cash on Delivery)");
            }
            
            cart = [];
            localStorage.removeItem("cart");
            updateCartCount();
            showDashboard();
        },
        error: function(xhr) {
            console.error("Failed to place order", xhr);
            let errMsg = "Failed to place order. Please try again.";
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errMsg = xhr.responseJSON.message;
            }
            alert(errMsg);
        }
    });
}



function logout() {
    localStorage.clear();
    window.location.href = "/html/login.html"; 
}
