const baseUrl = "http://localhost:8080/v1/supplier"; 
let orderItemsArray = [];

$(document).ready(function () {
    let token = localStorage.getItem("JWT");
    if (!token) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    loadAllSuppliers();
    loadAllIngredientsForDropdown(); 
    generateNextId();
});

function generateNextId() {
    $.ajax({
        url: baseUrl + "/next-id",
        method: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("JWT")
        },
        success: function (res) {
            let nextId = res.body !== undefined ? res.body : (res.data !== undefined ? res.data : res);
            if (nextId !== undefined && nextId !== null) {
                $("#supplierId").val(nextId);
            }
        },
        error: function (xhr) {
            console.log("Error loading next ID:", xhr);
        }
    });
}

function loadAllSuppliers() {
    $.ajax({
        url: baseUrl,
        method: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("JWT")
        },
        success: function (res) {
            let rowHtml = "";
            let dropdownHtml = '<option value="">-- Select Supplier --</option>'; 
            $("#supplierTableBody").empty();
            
            let list = res.body !== undefined ? res.body : (res.data !== undefined ? res.data : res); 
            
            if (list && list.length > 0) {
                for (let i = 0; i < list.length; i++) {
                    let sup = list[i];
                    rowHtml += `<tr>
                        <td>${sup.id}</td>
                        <td>${sup.name}</td>
                        <td>${sup.contact}</td>
                        <td>${sup.address ? sup.address : ''}</td>
                    </tr>`;

                    dropdownHtml += `<option value="${sup.id}" data-contact="${sup.contact}">${sup.name}</option>`;
                }
                $("#supplierTableBody").html(rowHtml);
                $("#smsSupplierSelect").html(dropdownHtml); 
            } else {
                $("#supplierTableBody").html(`<tr><td colspan="4" class="text-center text-muted py-3">No suppliers found.</td></tr>`);
                $("#smsSupplierSelect").html('<option value="">No suppliers available</option>');
            }
        },
        error: function (xhr) {
            console.log("Error loading suppliers:", xhr);
        }
    });
}

function loadAllIngredientsForDropdown() {
    $.ajax({
        url: "http://localhost:8080/v1/ingredient", 
        method: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("JWT")
        },
        success: function (res) {
            let list = res.body !== undefined ? res.body : (res.data !== undefined ? res.data : res);
            let dropdownHtml = '<option value="">-- Select Ingredient --</option>';
            if (list && list.length > 0) {
                for (let i = 0; i < list.length; i++) {
                    let ing = list[i];
                    dropdownHtml += `<option value="${ing.id}">${ing.name}</option>`;
                }
                $("#smsIngredientSelect").html(dropdownHtml);
            }
        },
        error: function (xhr) {
            console.log("Error loading ingredients:", xhr);
        }
    });
}

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
        html = `<tr><td colspan="3" class="text-center text-muted">No items added yet.</td></tr>`;
    } else {
        for (let i = 0; i < orderItemsArray.length; i++) {
            let item = orderItemsArray[i];
            html += `<tr>
                <td>${item.ingredientName}</td>
                <td>${item.quantity}</td>
                <td><button type="button" class="btn btn-danger btn-sm" onclick="removeOrderItem(${i})"><i class="fa-solid fa-trash"></i></button></td>
            </tr>`;
        }
    }
    $("#orderItemListBody").html(html);
}

function removeOrderItem(index) {
    orderItemsArray.splice(index, 1);
    renderOrderItemsTable();
}

$("#btnSave").click(function () {
    let data = {
        id: parseInt($("#supplierId").val()),
        name: $("#supplierName").val(),
        contact: $("#supplierContact").val(),
        address: $("#supplierAddress").val()
    };

    $.ajax({
        url: baseUrl,
        method: "POST",
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("JWT")
        },
        data: JSON.stringify(data),
        success: function (res) {
            alert("Supplier Saved Successfully!");
            loadAllSuppliers();
            clearFormForSave(); 
        },
        error: function (xhr) {
            let errorMessage = "Error saving supplier!";
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
            } else if (xhr.responseJSON && xhr.responseJSON.body) {
                errorMessage = xhr.responseJSON.body;
            }
            alert(errorMessage);
        }
    });
});

$("#supplierTableBody").on("click", "tr", function () {
    let id = $(this).find("td:eq(0)").text();
    let name = $(this).find("td:eq(1)").text();
    let contact = $(this).find("td:eq(2)").text();
    let address = $(this).find("td:eq(3)").text();

    $("#supplierId").val(id);
    $("#supplierName").val(name);
    $("#supplierContact").val(contact);
    $("#supplierAddress").val(address);

    $("#selectedSupplierId").val(id);
    $("#smsSupplierSelect").val(id); 
    $("#txtSmsContact").val(contact);
});

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

$("#btnUpdate").click(function () {
    let supplierId = $("#supplierId").val();
    
    if (!supplierId) {
        alert("Please select a supplier from the table first to update!");
        return;
    }
    let data = {
        id: parseInt($("#supplierId").val()), 
        name: $("#supplierName").val(),
        contact: $("#supplierContact").val(),
        address: $("#supplierAddress").val()
    };

    $.ajax({
        url: baseUrl,
        method: "PUT",
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("JWT")
        },
        data: JSON.stringify(data),
        success: function (res) {
            alert("Supplier Updated Successfully!");
            loadAllSuppliers();
            clearFormForSave(); 
        },
        error: function (xhr) {
            let errorMessage = "Error updating supplier!";
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
            } else if (xhr.responseJSON && xhr.responseJSON.body) {
                errorMessage = xhr.responseJSON.body;
            }
            alert(errorMessage);
        }
    });
});

$("#btnDelete").click(function () {
    let id = $("#supplierId").val();
    if (!id) {
        alert("Please select a supplier to delete!");
        return;
    }

    $.ajax({
        url: baseUrl + "/" + id,
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("JWT")
        },
        success: function (res) {
            alert("Supplier Deleted Successfully!");
            loadAllSuppliers();
            clearFormForSave();
        },
        error: function (xhr) {
            alert("Error deleting supplier!");
        }
    });
});

function clearFormForSave() {
    $("#supplierId").val("");
    $("#supplierName").val("");
    $("#supplierContact").val("");
    $("#supplierAddress").val("");
    
    $("#selectedSupplierId").val("");
    $("#smsSupplierSelect").val(""); 
    $("#txtSmsContact").val("");
    $("#smsIngredientSelect").val("");
    $("#txtSmsQuantity").val("1");
    $("#txtSmsMessage").val("");
    orderItemsArray = [];
    renderOrderItemsTable();
    
    generateNextId();
}

$("#txtSearch").on("input", function () {
    let name = $(this).val();
    if (name.trim() === "") {
        loadAllSuppliers();
        return;
    }
    $.ajax({
        url: baseUrl + "/filter?name=" + name,
        method: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("JWT")
        },
        success: function (res) {
            let rowHtml = "";
            let dropdownHtml = '<option value="">-- Select Supplier --</option>';
            $("#supplierTableBody").empty();
            
            let list = res.body !== undefined ? res.body : (res.data !== undefined ? res.data : res);
            
            if (list && list.length > 0) {
                for (let i = 0; i < list.length; i++) {
                    let sup = list[i];
                    rowHtml += `<tr>
                        <td>${sup.id}</td>
                        <td>${sup.name}</td>
                        <td>${sup.contact}</td>
                        <td>${sup.address ? sup.address : ''}</td>
                    </tr>`;
                    dropdownHtml += `<option value="${sup.id}" data-contact="${sup.contact}">${sup.name}</option>`;
                }
                $("#supplierTableBody").html(rowHtml);
                $("#smsSupplierSelect").html(dropdownHtml);
            } else {
                $("#supplierTableBody").html(`<tr><td colspan="4" class="text-center text-muted py-3">No matching suppliers found.</td></tr>`);
                $("#smsSupplierSelect").html('<option value="">No suppliers available</option>');
            }
        }
    });
});

$("#btnSendWhatsApp").click(function () {
    let supplierId = $("#selectedSupplierId").val();
    let phone = $("#txtSmsContact").val().trim();
    let message = $("#txtSmsMessage").val().trim();

    if (!supplierId || !phone) {
        alert("Please select a supplier from the dropdown or table first!");
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
        url: "http://localhost:8080/v1/supplier-orders", 
        method: "POST",
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("JWT")
        },
        data: JSON.stringify(orderData),
        success: function (res) {
            console.log("Multiple items saved to database successfully!");

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
            alert("Order with multiple items saved and WhatsApp opened successfully!");
            
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
            } else if (xhr.responseJSON && xhr.responseJSON.body) {
                errorMessage = xhr.responseJSON.body;
            }
            alert(errorMessage);
        }
    });
});