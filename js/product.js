let globalIngredientsList = [];

function addIngredientRow(selectedIngredientId = "", requiredQty = "") {
    let $row = $('<div>').addClass('ingredient-row').css({
        'display': 'flex',
        'gap': '10px',
        'margin-bottom': '8px',
        'align-items': 'center'
    });

    let $select = $('<select>').addClass('form-control ingredient-select').css('flex', '2').prop('required', true);
    $select.append('<option value="">Select Ingredient</option>');
    
    globalIngredientsList.forEach(ing => {
        let ingName = ing.name || ing.ingredientName || '';
        let ingUnit = ing.unit || '';
        let $option = $('<option>').val(ing.id).text(`${ingName} (${ingUnit})`);
        if (ing.id == selectedIngredientId) {
            $option.prop('selected', true);
        }
        $select.append($option);
    });

    let $input = $('<input>').attr({
        'type': 'number',
        'step': '0.01',
        'placeholder': 'Required Qty'
    }).addClass('form-control required-qty').css('flex', '1').val(requiredQty).prop('required', true);

    let $btn = $('<button>').attr('type', 'button').addClass('btn btn-danger btn-sm remove-row').css({
        'background': '#ff758c',
        'border': 'none',
        'padding': '6px 10px',
        'color': 'white',
        'cursor': 'pointer'
    }).html('<i class="fa-solid fa-xmark"></i>');

    $row.append($select, $input, $btn);
    $("#ingredientRows").append($row);
}
$(document).ready(function () {
    loadNextProductId(); 
    loadAllProducts();
    loadCategoriesToDropdown();
    loadAllIngredientsForDropdown();

    $("#btnAddIngredient").click(function () {
        addIngredientRow();
    });

    $("#btnSave").click(function () {
        let ingredientsArr = [];

        $("#ingredientRows .ingredient-row").each(function () {
            let ingId = $(this).find(".ingredient-select").val();
            let reqQty = $(this).find(".required-qty").val();

            if (ingId && reqQty) {
                ingredientsArr.push({
                    ingredientId: parseInt(ingId),
                    requiredQuantity: parseFloat(reqQty)
                });
            }
        });

        let productObj = {
            name: $("#productName").val(),
            description: $("#description").val(),
            price: parseFloat($("#price").val()),
            qty: parseInt($("#qty").val()),
            categoryId: parseInt($("#categorySelect").val()),
            ingredients: ingredientsArr
        };

        $.ajax({
            url: "http://localhost:8080/v1/product/save-with-recipe",
            type: "POST",
            contentType: "application/json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("JWT")
            },
            data: JSON.stringify(productObj),
            success: function (res) {
                alert("Product & Recipe Saved Successfully!");
                loadAllProducts();
                clearForm();
            },
            error: function (err) {
                alert("Error: " + (err.responseJSON ? err.responseJSON.message : "Failed to save product"));
            }
        });
    });

    $("#btnUpdate").click(function () {
        let ingredientsArr = [];

        $("#ingredientRows .ingredient-row").each(function () {
            let ingId = $(this).find(".ingredient-select").val();
            let reqQty = $(this).find(".required-qty").val();

            if (ingId && reqQty) {
                ingredientsArr.push({
                    ingredientId: parseInt(ingId),
                    requiredQuantity: parseFloat(reqQty)
                });
            }
        });

        let productObj = {
            id: parseInt($("#productId").val()),
            name: $("#productName").val(),
            description: $("#description").val(),
            price: parseFloat($("#price").val()),
            qty: parseInt($("#qty").val()),
            categoryId: parseInt($("#categorySelect").val()),
            ingredients: ingredientsArr
        };

        $.ajax({
            url: "http://localhost:8080/v1/product",
            type: "PUT",
            contentType: "application/json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("JWT")
            },
            data: JSON.stringify(productObj),
            success: function (res) {
                alert("Product Updated Successfully!");
                loadAllProducts();
                clearForm();
            },
            error: function (err) {
                alert("Error: " + (err.responseJSON ? err.responseJSON.message : "Failed to update product"));
            }
        });
    });

    $("#btnClear").click(function () {
        clearForm();
    });

    $(document).on("click", "#productTableBody tr", function () {
        let id = $(this).find(".td-id").text();
        if(!id) return;
        
        $.ajax({
            url: "http://localhost:8080/v1/product/" + id,
            type: "GET",
            contentType: "application/json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("JWT")
            },
            success: function (res) {
                let p = res.body || res.data || res;
                if (p) {
                    $("#productId").val(p.id);
                    $("#productName").val(p.name);
                    $("#description").val(p.description);
                    $("#price").val(p.price);
                    $("#qty").val(p.qty);
                    $("#categorySelect").val(p.categoryId);

                    $("#ingredientRows").empty();
                    if (p.ingredients && p.ingredients.length > 0) {
                        p.ingredients.forEach(item => {
                            addIngredientRow(item.ingredientId, item.requiredQuantity);
                        });
                    } else {
                        addIngredientRow();
                    }
                }
            }
        });
    });

    $("#searchBox").on("keyup", function () {
        let value = $(this).val().toLowerCase();
        $("#productTableBody tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });
});
  $('#logoutBtn').on('click', function (e) {
        e.preventDefault();
        localStorage.clear();
        window.location.href = "login.html";
    });

function loadNextProductId() {
    $.ajax({
        url: "http://localhost:8080/v1/product/next-id",
        type: "GET",
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("JWT")
        },
        success: function (res) {
            let nextId = res.body || res.data || res;
            $("#productId").val(nextId);
        },
        error: function (err) {
            console.log("Error loading next product ID", err);
        }
    });
}

function loadCategoriesToDropdown() {
    $.ajax({
        url: "http://localhost:8080/v1/category",
        type: "GET",
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("JWT")
        },
        success: function (res) {
            let categorySelect = $("#categorySelect");
            categorySelect.empty().append('<option value="">Select Category</option>');
            
            let categories = res.body || []; 
            
            if (categories && categories.length > 0) {
                categories.forEach(c => {
                    let catName = c.categoryName || c.name;
                    categorySelect.append(`<option value="${c.id}">${catName}</option>`);
                });
            }
        }
    });
}

function loadAllIngredientsForDropdown() {
    $.ajax({
        url: "http://localhost:8080/v1/ingredient",
        type: "GET",
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("JWT")
        },
        success: function (res) {
            globalIngredientsList = res.body || [];
            
            if ($("#ingredientRows").children().length === 0) {
                addIngredientRow();
            }
        }
    });
}

$(document).on("click", ".remove-row", function () {
    if ($("#ingredientRows .ingredient-row").length > 1) {
        $(this).closest(".ingredient-row").remove();
    } else {
        alert("At least one ingredient is required!");
    }
});

function loadAllProducts() {
    $.ajax({
        url: "http://localhost:8080/v1/product",
        type: "GET",
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("JWT")
        },
        success: function (res) {
            let tableBody = $("#productTableBody");
            tableBody.empty();
            let products = Array.isArray(res) ? res : (res.body || res.data || res.list || []);
            if (products && products.length > 0) {
                products.forEach(p => {
                    let row = `<tr>
                        <td class="td-id">${p.id}</td>
                        <td class="td-name">${p.name}</td>
                        <td class="td-desc">${p.description || ''}</td>
                        <td class="td-price">${p.price}</td>
                        <td class="td-qty">${p.qty}</td>
                        <td>${p.categoryName || p.categoryId}</td>
                        <td>
                            <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>`;
                    tableBody.append(row);
                });
            } else {
                tableBody.append(`<tr><td colspan="7" style="text-align: center;">No products found</td></tr>`);
            }
        }
    });
}

function deleteProduct(id) {
    if (confirm("Are you sure you want to delete this product?")) {
        $.ajax({
            url: "http://localhost:8080/v1/product/" + id,
            type: "DELETE",
            contentType: "application/json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("JWT")
            },
            success: function (res) {
                alert("Product Deleted Successfully!");
                loadAllProducts();
                clearForm();
            }
        });
    }
}

function clearForm() {
    loadNextProductId(); 
    $("#productName").val("");
    $("#description").val("");
    $("#price").val("");
    $("#qty").val("");
    $("#categorySelect").val("");
    $("#ingredientRows").empty();
    addIngredientRow(); 
}
