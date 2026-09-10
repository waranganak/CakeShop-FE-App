$(document).ready(function () {
     
    loadAllIngredients();

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
                    let row = `<tr>
                                <td>${ing.id}</td>
                                <td>${ing.name}</td>
                                <td>${ing.unit}</td>
                                <td><span class="badge bg-success">${ing.stockQty}</span></td>
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
