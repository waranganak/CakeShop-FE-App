$(document).ready(function () {   
    let token = localStorage.getItem("JWT");
    let role = localStorage.getItem("role");

    if (!token || role !== "ADMIN") {
        alert("Access Denied! Admins only.");
        window.location.href = "/html/login.html";
        return;
    }

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    $('#current-date').text(new Date().toLocaleDateString('en-US', options));

    loadAllUsers();
    loadDashboardChart(); 
    loadRidersDropdown(); 
    loadOrdersDropdown(); 

    setInterval(function() {
        loadDashboardChart();
    }, 10000);

    $('#logoutBtn').on('click', function (e) {
        e.preventDefault();
        localStorage.clear();
        window.location.href = "/html/login.html"; 
    });

    $('#search-user').on('keyup', function () {
        filterUsers();
    });

    $('#btnAssignDelivery').on('click', function () {
        assignDeliveryToRider();
    });
});

function loadDashboardChart() {
    $.ajax({
        url: "http://localhost:8080/v1/orders",
        type: 'GET',
        contentType: "application/json",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function (response) {
            let orders = response.body || response; 

            let todayStr = new Date().toISOString().split('T')[0];
            let productCounts = {};

            if (Array.isArray(orders) && orders.length > 0) {
                orders.forEach(order => {
                    if (order.orderDate) {
                        let formattedDateStr = order.orderDate.replace(' ', 'T');
                        let orderDateStr = formattedDateStr.split('T')[0];

                        if (orderDateStr === todayStr) {
                            if (order.orderDetails && Array.isArray(order.orderDetails)) {
                                order.orderDetails.forEach(detail => {
                                    let productName = detail.productName || detail.name || ("Product ID: " + detail.productId) || "Unknown Product";
                                    let qty = detail.quantity || detail.qty || 1;

                                    if (productCounts[productName]) {
                                        productCounts[productName] += qty;
                                    } else {
                                        productCounts[productName] = qty;
                                    }
                                });
                            }
                        }
                    }
                });
            }

            let labelsData = [];
            let valuesData = [];

            for (let product in productCounts) {
                labelsData.push(product);
                valuesData.push(productCounts[product]);
            }

            if (labelsData.length === 0) {
                labelsData = ['No Orders Today'];
                valuesData = [0];
            }

            renderChart(labelsData, valuesData);
        },
        error: function (xhr) {
            console.log("Error loading orders for chart:", xhr);
            renderChart(['No Data'], [0]);
        }
    });
}

function renderChart(labelsData, valuesData) {
    const ctx = document.getElementById('dashboardChart').getContext('2d');
    
    let gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, '#ec4899'); 
    gradient.addColorStop(1, '#db2777'); 

    if (window.myDashboardChart instanceof Chart) {
        window.myDashboardChart.destroy();
    }

    window.myDashboardChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labelsData,
            datasets: [{
                label: 'Today Ordered Quantity',
                data: valuesData,
                backgroundColor: gradient,
                borderColor: '#f472b6',
                borderWidth: 1,
                borderRadius: 6,
                barPercentage: 0.3,      
                categoryPercentage: 0.4,
                maxBarThickness: 50      
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Dream\'s Cake - Today\'s Most Ordered Products',
                    color: '#ffffff',
                    font: { size: 16 }
                }
            },
            scales: {
                x: { 
                    ticks: { color: '#9ca3af' }, 
                    grid: { color: 'rgba(244, 114, 182, 0.08)' } 
                },
                y: { 
                    ticks: { 
                        color: '#9ca3af',
                        stepSize: 1,
                        precision: 0 
                    }, 
                    grid: { color: 'rgba(244, 114, 182, 0.08)' },
                    beginAtZero: true,
                    suggestedMax: 5 
                }
            }
        }
    });
}

function loadRidersDropdown() {
    $.ajax({
        url: "http://localhost:8080/v1/riders", 
        type: 'GET',
        contentType: "application/json",
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem("JWT") },
        success: function (response) {
            let riders = response.body || response.data || response;
            let riderSelect = $('#riderSelect');
            riderSelect.empty();
            riderSelect.append('<option value="">-- Select Rider --</option>');

            if (Array.isArray(riders) && riders.length > 0) {
                riders.forEach(rider => {
                    let riderId = rider.riderId || rider.id;
                    let riderName = rider.riderName || rider.name || rider.fullName || 'Rider';
                    
                    riderSelect.append(`<option value="${riderId}">${riderName} (ID: ${riderId})</option>`);
                });
            } else {
                riderSelect.append('<option value="">No Riders Found</option>');
            }
        },
        error: function(xhr) {
            console.error("Error loading riders:", xhr);
            $('#riderSelect').html('<option value="">Failed to load riders</option>');
        }
    });
}

function loadOrdersDropdown() {
    $.ajax({
        url: "http://localhost:8080/v1/customers", 
        contentType: "application/json",
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem("JWT") },
        success: function (response) {
            let customers = response.body || response.data || response;
            if (!Array.isArray(customers) && response.content) {
                customers = response.content;
            }

            let orderSelect = $('#assignOrderId'); 
            orderSelect.empty();
            orderSelect.append('<option value="">-- Select Customer --</option>');

            if (Array.isArray(customers) && customers.length > 0) {
                customers.forEach(customer => {
                    let cId = customer.id || customer.customerId;
                    let cName = customer.name || customer.userName || customer.fullName;

                    if (cId && cName) {
                        orderSelect.append(`<option value="${cId}">${cName} (ID: ${cId})</option>`);
                    }
                });
            } else {
                orderSelect.append('<option value="">No Customers Found</option>');
            }
        },
        error: function(xhr) {
            console.error("Error loading customers for dropdown:", xhr);
            $('#assignOrderId').html('<option value="">Failed to load customers</option>');
        }
    });
}

function assignDeliveryToRider() {
    let customerId = $('#assignOrderId').val(); 
    let riderId = $('#riderSelect').val();
    let riderName = $('#riderSelect option:selected').text().split(' (ID:')[0] || '';
    let status = $('#deliveryStatusSelect').val() || 'PENDING';

    if (!customerId || !riderId) {
        alert("Please select a Customer and a Rider!");
        return;
    }

    $.ajax({
        url: "http://localhost:8080/v1/orders/customer/" + customerId,
        type: 'GET',
        contentType: "application/json",
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem("JWT") },
        success: function (orders) {
            if (!Array.isArray(orders) || orders.length === 0) {
                alert("No orders found for this customer!");
                return;
            }

            let todayStr = new Date().toISOString().split('T')[0];
            let todayOrders = [];

            orders.forEach(order => {
                if (order.orderDate) {
                    let orderDateStr = order.orderDate.replace(' ', 'T').split('T')[0];
                    if (orderDateStr === todayStr) {
                        todayOrders.push(order.orderId || order.id);
                    }
                }
            });

            if (todayOrders.length === 0) {
                alert("No orders found for today for this customer!");
                return;
            }

            let successCount = 0;
            let hasError = false;

            todayOrders.forEach(currentOrderId => {
                let deliveryDTO = {
                    id: null,
                    orderId: parseInt(currentOrderId),
                    riderId: parseInt(riderId),
                    riderName: riderName,
                    deliveryStatus: status
                };

                $.ajax({
                    url: "http://localhost:8080/v1/delivery/assign",
                    type: "POST",
                    contentType: "application/json",
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem("JWT") },
                    data: JSON.stringify(deliveryDTO),
                    success: function () {
                        successCount++;
                        if (successCount === todayOrders.length && !hasError) {
                            alert("Delivery successfully assigned to all today's orders of this customer!");
                            
                            $('#assignOrderId').val('');
                            $('#riderSelect').val('');
                            $('#deliveryStatusSelect').val('PLACED');

                            loadDashboardChart(); 
                        }
                    },
                    error: function (xhr) {
                        hasError = true;
                        console.error("Failed for Order ID: " + currentOrderId, xhr);
                    }
                });
            });
        },
        error: function (xhr) {
            console.error("Error fetching customer orders:", xhr);
            alert("Failed to fetch customer orders.");
        }
    });
}

function loadAllUsers() {
    $.ajax({
        url: "http://localhost:8080/v1/user/users",
        type: 'GET',
        contentType: "application/json",
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem("JWT") },
        success: function (response) {
            let users = response.body;
            let tableBody = $('#user-table-body');
            tableBody.empty();
            if (users && users.length > 0) {
                users.forEach(user => {
                    tableBody.append(`<tr><td>${user.userId || ''}</td><td>${user.userName || ''}</td><td><span style="background: rgba(236, 72, 153, 0.15); color: #f472b6; border: 1px solid rgba(244, 114, 182, 0.2); padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;">${user.userRoles || ''}</span></td></tr>`);
                });
            } else {
                tableBody.append(`<tr><td colspan="3" style="text-align: center; color: #9ca3af;">No users found.</td></tr>`);
            }
        }
    });
}

function filterUsers() {
    let query = $('#search-user').val().trim();
    let url = query === "" ? "http://localhost:8080/v1/user/users" : "http://localhost:8080/v1/user/filter-users?userName=" + encodeURIComponent(query);

    $.ajax({
        url: url,
        type: 'GET',
        contentType: "application/json",
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem("JWT") },
        success: function (response) {
            let users = response.body;
            let tableBody = $('#user-table-body');
            tableBody.empty();
            if (users && users.length > 0) {
                users.forEach(user => {
                    tableBody.append(`<tr><td>${user.userId || ''}</td><td>${user.userName || ''}</td><td><span style="background: rgba(236, 72, 153, 0.15); color: #f472b6; border: 1px solid rgba(244, 114, 182, 0.2); padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;">${user.userRoles || ''}</span></td></tr>`);
                });
            } else {
                tableBody.append(`<tr><td colspan="3" style="text-align: center; color: #9ca3af;">No matching users found.</td></tr>`);
            }
        }
    });
}

$(document).ready(function() {
    $('#menuToggleBtn').on('click', function() {
        $('#sidebar').toggleClass('active');
        $('#sidebarOverlay').fadeToggle(300);
    });

    $('#sidebarOverlay').on('click', function() {
        $('#sidebar').removeClass('active');
        $(this).fadeOut(300);
    });

    $('.sidebar-menu a').on('click', function() {
        if ($(window).width() <= 992) {
            $('#sidebar').removeClass('active');
            $('#sidebarOverlay').fadeOut(300);
        }
    });
});