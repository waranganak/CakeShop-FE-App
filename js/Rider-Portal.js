$(document).ready(function () {
    let loggedInRiderId = localStorage.getItem("riderId"); 
    
 

    if(loggedInRiderId) {
        console.log("Loading deliveries for Rider ID:", loggedInRiderId);
        loadRiderDeliveries(loggedInRiderId); 
    }
});

function onScanSuccess(decodedText, decodedResult) {
    console.log(`Scanned Raw Text: ${decodedText}`);
    
    let cleanText = decodedText.trim();
    let orderId = cleanText.includes('/') ? cleanText.split('/').pop() : cleanText;
    
    console.log(`Extracted Order ID: ${orderId}`);
    
    if (orderId) {
        $('#manualOrderId').val(orderId);
        fetchOrderDetails(orderId);
    } else {
        alert("Invalid QR Code! Could not extract Order ID.");
    }
}

if (document.getElementById("reader")) {
    let html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 220 }, false);
    html5QrcodeScanner.render(onScanSuccess);
}

function searchByManualId() {
    let orderId = $('#manualOrderId').val().trim();
    if (orderId) {
        fetchOrderDetails(orderId);
    } else {
        alert("Please enter a valid Order ID!");
    }
}

function fetchOrderDetails(orderId) {
    $.ajax({
        url: `http://localhost:8080/v1/delivery/details/${orderId}`,
        type: 'GET',
        headers: {
            "ngrok-skip-browser-warning": "true"
        },
        success: function (response) {
            console.log("API Response:", response);

            let delivery = response.body ? response.body : response; 
            
            if (!delivery || !delivery.orderId) {
                alert("Order details not found!");
                $('#riderOrderResult').show().html('<div class="alert alert-warning">Order not found for ID: #' + orderId + '</div>');
                return;
            }

            let itemsHtml = '';
            if (delivery.orderDetails && delivery.orderDetails.length > 0) {
                delivery.orderDetails.forEach(item => {
                    itemsHtml += `
                        <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent text-white border-secondary">
                            <div>
                                <h6 class="mb-0 text-white">${item.productName}</h6>
                                <small class="text-muted">Qty: ${item.quantity}</small>
                            </div>
                            <span class="fw-bold text-pink">Rs. ${item.price}</span>
                        </li>
                    `;
                });
            } else {
                itemsHtml = '<li class="list-group-item text-muted bg-transparent">No items found</li>';
            }

            $('#riderOrderResult').show().html(`
                <div class="alert alert-custom p-4 border-pink shadow-lg">
                    <h5 class="text-pink fw-bold mb-3"><i class="fas fa-box-open me-2"></i> Order ID: #${delivery.orderId}</h5>
                    <hr class="my-2 border-secondary">
                    <p class="mb-1 text-white"><b>Customer:</b> ${delivery.customerName} (${delivery.customerPhone || 'N/A'})</p>
                    <p class="mb-1 text-white"><b>Address:</b> ${delivery.customerAddress}</p>
                    <p class="mb-1 text-white"><b>Payment:</b> ${delivery.paymentMethod}</p>
                    <p class="mb-1 text-white"><b>Total Amount:</b> <span class="text-success fw-bold">Rs. ${delivery.totalAmount}</span></p>
                    <p class="mb-3 text-white"><b>Delivery Status:</b> <span class="badge bg-warning text-dark">${delivery.deliveryStatus}</span></p>
                    
                    <div class="mb-3">
                        <label class="fw-bold text-pink mb-1" style="font-size: 13px;">Order Items:</label>
                        <ul class="list-group shadow-sm bg-transparent">
                            ${itemsHtml}
                        </ul>
                    </div>

                    <div class="d-grid gap-2 mt-3">
                        <button class="btn btn-sweet-primary py-3 fw-bold" onclick="completeDelivery(${delivery.orderId})">
                            <i class="fas fa-check-circle me-1"></i> Mark as Delivered
                        </button>
                    </div>
                </div>
            `);
        },
        error: function (xhr) {
            console.error("API Error:", xhr.responseText);
            alert("Order not found or invalid ID!");
            $('#riderOrderResult').show().html('<div class="alert alert-danger">Error fetching order details from server.</div>');
        }
    });
}

async function loadRiderDeliveries(riderId) {
    try {
        const response = await fetch(`http://localhost:8080/v1/delivery/rider/list/${riderId}`, {
            headers: {
                "ngrok-skip-browser-warning": "true"
            }
        });
        const result = await response.json();
        
        console.log("Rider Deliveries Response:", result);
        
        if (result.status === 0 || result.code === 200 || result.code === 2000) {
            const deliveries = result.body ? result.body : (result.data ? result.data : []);
            
            let tableBodyHtml = '';
            
            if (deliveries && deliveries.length > 0) {
                deliveries.forEach(delivery => {
                    tableBodyHtml += `
                        <tr>
                            <td class="fw-bold text-pink">#${delivery.orderId}</td>
                            <td>${delivery.customerName}</td>
                            <td class="text-muted">${delivery.customerAddress || 'N/A'}</td>
                            <td>Rs. ${delivery.totalAmount}</td>
                            <td class="text-end pe-3">
                                <button class="btn btn-sm btn-sweet-primary py-1 px-3" style="font-size: 12px;" onclick="fetchOrderDetails(${delivery.orderId})">
                                    <i class="fas fa-eye me-1"></i> View
                                </button>
                            </td>
                        </tr>
                    `;
                });
            } else {
                tableBodyHtml = `<tr><td colspan="5" class="text-center text-muted py-4">No assigned deliveries found</td></tr>`;
            }

            $('#assignedDeliveriesTableBody').html(tableBodyHtml);
            
            return deliveries;
        } else {
            console.warn("Failed to load rider deliveries");
            $('#assignedDeliveriesTableBody').html(`<tr><td colspan="5" class="text-center text-warning py-4">Failed to load deliveries</td></tr>`);
        }
    } catch (error) {
        console.error("Error fetching deliveries:", error);
        $('#assignedDeliveriesTableBody').html(`<tr><td colspan="5" class="text-center text-danger py-4">Error connecting to server</td></tr>`);
    }
}

function completeDelivery(orderId) {
    if (confirm("Are you sure you want to mark this order as Delivered?")) {
        $.ajax({
            url: `http://localhost:8080/v1/delivery/complete/${orderId}`,
            type: 'PUT',
            headers: {
                "ngrok-skip-browser-warning": "true"
            },
            success: function (response) {
                alert("🎉 Order marked as Delivered successfully!");
                location.reload(); 
            },
            error: function (xhr) {
                console.error("API Error:", xhr.responseText);
                alert("Failed to update delivery status.");
            }
        });
    }
}