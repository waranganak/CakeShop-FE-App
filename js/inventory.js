$(document).ready(function () {
     
    loadAllIngredients();
    loadLowStockAlerts(); 

    $('#btnSaveIngredient').click(function () {
        let id = $('#ingredientId').val();
        let ingredientName = $('#ingredientName').val();
        let unit = $('#unit').val();
        let quantityInStock = $('#quantityInStock').val();
        let reorderLevel = $('#reorderLevel').val();

        let ingredientObj = {
            id: id ? parseInt(id) : null,
            name: ingredientName,                    
            unit: unit,
            stockQty: parseFloat(quantityInStock),   
            reorderLevel: parseFloat(reorderLevel)   
        };
        let method = id ? "PUT" : "POST";

        $.ajax({
            url: "http://localhost:8080/v1/ingredient",
            type: method,
            contentType: "application/json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("JWT")
            },
            data: JSON.stringify(ingredientObj),
            success: function (res) {
                console.log("Save/Update Response:", res);
                let resBody = res.body;
                let msg = (typeof resBody === 'string') ? resBody : (res.message || (resBody && resBody.message) || "Ingredient Saved Successfully!");
                
                alert(msg);
                loadAllIngredients();
                loadLowStockAlerts(); 
                clearForm();
            },
            error: function (err) {
                console.log("Error saving ingredient:", err);
                let errMsg = "Failed to save ingredient.";
                if (err.responseJSON && err.responseJSON.message) {
                    errMsg = err.responseJSON.message;
                } else if (err.responseText) {
                    errMsg = err.responseText;
                }
                alert("Error: " + errMsg);
            }
        });
    });

    $('#btnClearForm').click(function () {
        clearForm();
    });

    $('#logoutBtn').on('click', function (e) {
        e.preventDefault();
        localStorage.clear();
        window.location.href = "login.html";
    });
});

function loadAllIngredients() {
    let jwtToken = localStorage.getItem("JWT");

    $.ajax({
        url: "http://localhost:8080/v1/ingredient",
        type: 'GET',
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + jwtToken
        },
        success: function (response) {
            let ingredients = response.body;
            let tableBody = $('#ingredient-table-body');
            tableBody.empty();

            if (ingredients && ingredients.length > 0) {
                ingredients.forEach(ing => {
                    let isLow = ing.stockQty <= ing.reorderLevel;

                    let row = `<tr>
                                <td>${ing.id}</td>
                                <td>${ing.name} ${isLow ? '<i class="fa-solid fa-triangle-exclamation text-danger ms-1" title="Low Stock!"></i>' : ''}</td>
                                <td>${ing.unit}</td>
                                <td><span class="badge ${isLow ? 'bg-danger' : 'bg-success'}">${ing.stockQty}</span></td>
                                <td><span class="badge bg-warning text-dark">${ing.reorderLevel}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-info text-white" onclick="editIngredient(${ing.id}, '${ing.name}', '${ing.unit}', ${ing.stockQty}, ${ing.reorderLevel})">Edit</button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteIngredient(${ing.id})">Delete</button>
                                </td>
                              </tr>`;
                    tableBody.append(row);
                });
            } else {
                tableBody.append(`<tr><td colspan="6" style="text-align: center; color: #94a3b8;">No ingredients found.</td></tr>`);
            }
        },
        error: function (xhr) {
            console.log("Error loading ingredients:", xhr);
            $('#ingredient-table-body').append(`<tr><td colspan="6" style="text-align: center; color: #f87171;">Failed to load data.</td></tr>`);
        }
    });
}

function loadLowStockAlerts() {
    $.ajax({
        url: "http://localhost:8080/v1/ingredient/low-stock",
        type: 'GET',
        contentType: "application/json",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function (response) {
            let lowStockItems = response.body || response;
            let container = $('#lowStockAlertContainer');
            container.empty();

            if (lowStockItems && lowStockItems.length > 0) {
                lowStockItems.forEach(item => {
                    let itemName = item.ingredientName || item.name || 'Unknown Item';
                    let stockQty = item.quantityInStock !== undefined ? item.quantityInStock : (item.stockQty !== undefined ? item.stockQty : 0);
                    let reorderLevel = item.reorderLevel !== undefined ? item.reorderLevel : 0;
                    let unit = item.unit || '';
                    
                    let alertCard = `
                        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 12px 16px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; color: #dc3545;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <i class="fa-solid fa-triangle-exclamation" style="font-size: 18px;"></i>
                                <div>
                                    <strong style="color: #f9f2f2;">${itemName}</strong> is running low on stock! 
                                    <span style="font-size: 13px; color: #6c757d; margin-left: 10px;">(Current: ${stockQty} ${unit}, Reorder Level: ${reorderLevel})</span>
                                </div>
                            </div>
                        </div>
                    `;
                    container.append(alertCard);
                });
            }
        },
        error: function (xhr) {
            console.log("Error loading low stock items:", xhr);
        }
    });
}

function editIngredient(id, name, unit, qty, reorder) {
    $('#ingredientId').val(id);
    $('#ingredientName').val(name);
    $('#unit').val(unit);
    $('#quantityInStock').val(qty);
    $('#reorderLevel').val(reorder);
    $('#btnSaveIngredient').text("Update Ingredient");
}

function deleteIngredient(id) {
    if (confirm("Are you sure you want to delete this ingredient?")) {
        let jwtToken = localStorage.getItem("JWT");
        $.ajax({
            url: "http://localhost:8080/v1/ingredient/" + id,
            type: 'DELETE',
            contentType: "application/json",
            headers: {
                "Authorization": "Bearer " + jwtToken
            },
            success: function (res) {
                console.log("Delete Response:", res);
                let resBody = res.body;
                let msg = (typeof resBody === 'string') ? resBody : (res.message || (resBody && resBody.message) || "Ingredient deleted successfully!");
                
                alert(msg);
                loadAllIngredients();
                loadLowStockAlerts(); 
            },
            error: function (err) {
                console.log("Error deleting ingredient:", err);
                let errMsg = "Cannot delete this ingredient because it is linked to recipes or orders!";
                if (err.responseJSON && err.responseJSON.message) {
                    errMsg = err.responseJSON.message;
                }
                alert(errMsg);
            }
        });
    }
}

function clearForm() {
    $('#ingredientId').val('');
    $('#ingredientName').val('');
    $('#unit').val('GRAMS');
    $('#quantityInStock').val('');
    $('#reorderLevel').val('');
    $('#btnSaveIngredient').text("Save Ingredient");
}
