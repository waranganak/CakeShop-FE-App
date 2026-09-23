let orderItemsArray = [];
const supplierBaseUrl = "http://localhost:8080/v1/supplier";
const ingredientBaseUrl = "http://localhost:8080/v1/ingredient";
const supplierOrderBaseUrl = "http://localhost:8080/v1/supplier-orders";
const ITEM_BASE_URL = "http://localhost:8080/v1/product"; 
const ORDER_BASE_URL = "http://localhost:8080/v1/orders"; 


$(document).ready(function () {
    let token = localStorage.getItem("JWT");
    if (!token) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    $("#btnViewSupplierOrders").click(function () {
        $('.main-dashboard-view').hide();
        $('.content-view').hide();$('#supplier-orders-section').fadeIn();
        
        loadSuppliersForUser();
        loadIngredientsForUser();
    });

    $("#btnViewMenu").click(function () {
        $('.main-dashboard-view').hide();
        $('.content-view').hide();$('#menu-section').fadeIn();
        
        loadCakeMenu(); 
    });

    $("#btnViewOrders").click(function () {
        $('.main-dashboard-view').hide();
        $('.content-view').hide();$('#orders-section').fadeIn();
        
        loadAllOrders(); 
    });
});

function showDashboard() {
    $('.content-view').hide();$('.main-dashboard-view').fadeIn();
}

function loadSuppliersForUser() {
    $.ajax({
        url: supplierBaseUrl,
        method: "GET",
        headers: { "Authorization": "Bearer " + localStorage.getItem("JWT") },
        success: function (res) {
            let dropdownHtml = '<option value="">-- Select Supplier --</option>';
            let list = res.body !== undefined ? res.body : (res.data !== undefined ? res.data : res);
            if (list && list.length > 0) {
                list.forEach(sup => {
                    dropdownHtml += `<option value="${sup.id}" data-contact="${sup.contact}">${sup.name}</option>`;
                });
                $("#smsSupplierSelect").html(dropdownHtml);
            }
        },
        error: function(xhr) {
            console.log("Error loading suppliers:", xhr);
        }
    });
}

function loadIngredientsForUser() {
    $.ajax({
        url: ingredientBaseUrl,
        method: "GET",
        headers: { "Authorization": "Bearer " + localStorage.getItem("JWT") },
        success: function (res) {
            let list = res.body !== undefined ? res.body : (res.data !== undefined ? res.data : res);
            let dropdownHtml = '<option value="">-- Select Ingredient --</option>';
            if (list && list.length > 0) {
                list.forEach(ing => {
                    dropdownHtml += `<option value="${ing.id}">${ing.name}</option>`;
                });
                $("#smsIngredientSelect").html(dropdownHtml);
            }
        },
        error: function(xhr) {
            console.log("Error loading ingredients:", xhr);
        }
    });
}

$("#smsSupplierSelect").change(function () {
    let selectedOption = $(this).find(":selected");
    let supplierId = selectedOption.val();
    let contact = selectedOption.attr("data-contact");

    if (supplierId) {
        $("#selectedSupplierId").val(supplierId);
        $("#txtSmsContact").val(contact);
    } else {
        $("#selectedSupplierId").val("");
        $("#txtSmsContact").val("");
    }
});

$("#btnAddToList").click(function () {
    let ingredientId = $("#smsIngredientSelect").val();
    let ingredientName = $("#smsIngredientSelect option:selected").text();
    let quantity = parseFloat($("#txtSmsQuantity").val());

    if (!ingredientId) {
        alert("Please select an ingredient!");
        return;
    }
    if (!quantity || quantity <= 0) {
        alert("Please enter a valid quantity!");
        return;
    }

    orderItemsArray.push({
        ingredientId: parseInt(ingredientId),
        ingredientName: ingredientName,
        quantity: quantity,
    });

    renderOrderItemsTable();
    $("#smsIngredientSelect").val("");
    $("#txtSmsQuantity").val("1");
});

function renderOrderItemsTable() {
    let html = "";
    if (orderItemsArray.length === 0) {
        html = `<tr><td colspan="3" style="text-align: center; padding: 20px; color: #94a3b8;">No items added yet.</td></tr>`;
    } else {
        for (let i = 0; i < orderItemsArray.length; i++) {
            let item = orderItemsArray[i];
            html += `<tr>
                <td style="padding: 12px;">${item.ingredientName}</td>
                <td style="padding: 12px;">${item.quantity}</td>
                <td style="padding: 12px;"><button type="button" class="btn btn-danger btn-sm" onclick="removeOrderItem(${i})" style="background: #dc3545; border: none; padding: 5px 10px; color: #fff; border-radius: 4px; cursor: pointer;"><i class="fa-solid fa-trash"></i></button></td>
            </tr>`;
        }
    }
    $("#orderItemListBody").html(html);
}

function removeOrderItem(index) {
    orderItemsArray.splice(index, 1);
    renderOrderItemsTable();
}

$("#btnSendWhatsApp").click(function () {
    let supplierId = $("#selectedSupplierId").val();
    let phone = $("#txtSmsContact").val().trim();
    let message = $("#txtSmsMessage").val().trim();

    if (!supplierId || !phone) {
        alert("Please select a supplier from the dropdown first!");
        return;
    }
    if (orderItemsArray.length === 0) {
        alert("Please add at least one item to the order list!");
        return;
    }

    let orderData = {
        supplierId: parseInt(supplierId),
        status: "PENDING",
        orderDate: new Date().toISOString().split('T')[0], 
        orderDetails: orderItemsArray
    };

    $.ajax({
        url: supplierOrderBaseUrl, 
        method: "POST",
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("JWT")
        },
        data: JSON.stringify(orderData),
        success: function (res) {
            console.log("Order saved to database successfully!");

            if (phone.startsWith("0")) {
                phone = "94" + phone.substring(1); 
            }
            
            let fullMessage = "Hello from *Dream's Cake*! Here is our order:\n\n";
            for (let item of orderItemsArray) {
                fullMessage += `- ${item.ingredientName} : ${item.quantity}\n`;
            }
            if (message) {
                fullMessage += `\nNote: ${message}`;
            }

            let encodedMessage = encodeURIComponent(fullMessage);
            let whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
            
            window.open(whatsappUrl, '_blank');
            alert("Order saved and WhatsApp opened successfully!");
            
            orderItemsArray = [];
            renderOrderItemsTable();
            $("#txtSmsMessage").val("");
            $("#selectedSupplierId").val("");
            $("#smsSupplierSelect").val("");
            $("#txtSmsContact").val("");
            $("#smsIngredientSelect").val("");
            $("#txtSmsQuantity").val("1");
        },
        error: function (xhr) {
            console.log("Order Save Error:", xhr);
            let errorMessage = "Failed to save order to database!";
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
            }
            alert(errorMessage);
        }
    });
});

function loadCakeMenu() {
    let token = localStorage.getItem("JWT");

    $.ajax({
        url: ITEM_BASE_URL,
        type: "GET",
        headers: { "Authorization": "Bearer " + token },
        success: function(response) {
            console.log("Full API Response:", response);
            
            let tbody = $('#menuTableBody');
            tbody.empty();
            
            let items = response.body || response.data || response;
            
            if (items && Array.isArray(items) && items.length > 0) {
                items.forEach(item => {
                    let itemId = item.id !== undefined ? item.id : (item.productId || '');
                    let itemName = item.name !== undefined ? item.name : (item.productName || '');
                    let itemPrice = item.price !== undefined ? item.price : (item.unitPrice || 0);

                    let row = `<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 12px;">#${itemId}</td>
                        <td style="padding: 12px;">${itemName}</td>
                        <td style="padding: 12px;">Rs. ${Number(itemPrice).toFixed(2)}</td>
                    </tr>`;
                    tbody.append(row);
                });
            } else {
                tbody.append(`<tr><td colspan="3" style="padding: 20px; text-align: center; color: #94a3b8;">No menu items available.</td></tr>`);
            }
        },
        error: function(err) {
            console.error("Failed to load products:", err);
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
            console.log("Full Orders API Response:", response);
            let tbody = $('#ordersTableBody');
            tbody.empty();
            
            let orders = response.body || response.data || response;

            if (orders && Array.isArray(orders) && orders.length > 0) {
                orders.forEach(order => {
                    let orderId = order.id !== undefined ? order.id : (order.orderId || '');
                    
                    let customerId = order.customerId !== undefined ? order.customerId : 
                                     (order.cust_id !== undefined ? order.cust_id : 'N/A');

                    let totalAmount = order.totalAmount !== undefined ? order.totalAmount : (order.amount || 0);
                    let status = order.status || 'Pending';

                    let row = `<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 12px;">#${orderId}</td>
                        <td style="padding: 12px; color: #fff;">ID: ${customerId}</td>
                        <td style="padding: 12px;">Rs. ${Number(totalAmount).toFixed(2)}</td>
                        <td style="padding: 12px;"><span style="color: #ff758c; font-weight: 600;">${status}</span></td>
                    </tr>`;
                    tbody.append(row);
                });
            } else {
                tbody.append(`<tr><td colspan="4" style="padding: 20px; text-align: center; color: #94a3b8;">No orders found.</td></tr>`);
            }
        },
        error: function(err) {
            console.error("Failed to load orders:", err);
            $('#ordersTableBody').html(`<tr><td colspan="4" style="padding: 20px; text-align: center; color: #ef4444;">Failed to load orders.</td></tr>`);
        }
    });
}

function logout() {
    localStorage.removeItem("JWT");
    window.location.href = "login.html";
}