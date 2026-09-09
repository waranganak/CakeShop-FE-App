    $(document).ready(function () {

    
    loadNextId();
    loadAllCategories();

    $('#btnSave').on('click', function () {
        let categoryData = {
            categoryName: $('#categoryName').val().trim(),
            description: $('#categoryDesc').val().trim()
        };

        $.ajax({
            url: "http://localhost:8080/v1/category",
            type: 'POST',
            contentType: "application/json",
            data: JSON.stringify(categoryData),
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("JWT")
            },
            success: function (response) {
                alert("Category Saved Successfully!");
                clearForm();
                loadNextId();
                loadAllCategories();
            },
            error: function (xhr) {
                let errorMsg = xhr.responseJSON ? xhr.responseJSON.message : "Failed to save category.";
                alert("Error: " + errorMsg);
            }
        });
    });

    $('#btnUpdate').on('click', function () {
        let categoryData = {
            id: $('#categoryId').val(),
            categoryName: $('#categoryName').val().trim(),
            description: $('#categoryDesc').val().trim()
        };

        $.ajax({
            url: "http://localhost:8080/v1/category",
            type: 'PUT',
            contentType: "application/json",
            data: JSON.stringify(categoryData),
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("JWT")
            },
            success: function (response) {
                alert("Category Updated Successfully!");
                clearForm();
                loadNextId();
                loadAllCategories();
            },
            error: function (xhr) {
                let errorMsg = xhr.responseJSON ? xhr.responseJSON.message : "Failed to update category.";
                alert("Error: " + errorMsg);
            }
        });
    });

    $('#btnClear').on('click', function () {
        clearForm();
        loadNextId();
    });
      $('#logoutBtn').on('click', function (e) {
        e.preventDefault();
        localStorage.clear();
        window.location.href = "login.html";
    });

    $('#searchBox').on('keyup', function () {
        let value = $(this).val().toLowerCase();
        $('#categoryTableBody tr').filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });
});

function loadNextId() {
    $.ajax({
        url: "http://localhost:8080/v1/category/next-id",
        type: 'GET',
        contentType: "application/json",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function (response) {
            $('#categoryId').val(response.body);
        },
        error: function (xhr) {
            console.log("Error loading next ID:", xhr);
        }
    });
}

function loadAllCategories() {
    $.ajax({
        url: "http://localhost:8080/v1/category",
        type: 'GET',
        contentType: "application/json",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function (response) {
            let categories = response.body;
            let tableBody = $('#categoryTableBody');
            tableBody.empty();

            if (categories && categories.length > 0) {
                categories.forEach(cat => {
                    let row = `<tr>
                                <td>${cat.id}</td>
                                <td>${cat.categoryName}</td>
                                <td>${cat.description}</td>
                                <td>
                                    <button class="btn btn-sm" style="background:#3b82f6; color:white; padding:5px 10px; border-radius:6px; border:none; cursor:pointer;" onclick="editCategory(${cat.id}, '${cat.categoryName}', '${cat.description}')"><i class="fa-solid fa-pen"></i></button>
                                    <button class="btn btn-sm" style="background:#ef4444; color:white; padding:5px 10px; border-radius:6px; border:none; cursor:pointer; margin-left:5px;" onclick="deleteCategory(${cat.id})"><i class="fa-solid fa-trash"></i></button>
                                </td>
                              </tr>`;
                    tableBody.append(row);
                });
            } else {
                tableBody.append(`<tr><td colspan="4" style="text-align: center; color: #94a3b8;">No categories found.</td></tr>`);
            }
        },
        error: function (xhr) {
            console.log("Error loading categories:", xhr);
        }
    });
}

function editCategory(id, name, desc) {
    $('#categoryId').val(id);
    $('#categoryName').val(name);
    $('#categoryDesc').val(desc);
}

function deleteCategory(id) {
    if (confirm("Are you sure you want to delete this category?")) {
        $.ajax({
            url: "http://localhost:8080/v1/category/" + id,
            type: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("JWT")
            },
            success: function (response) {
                alert("Category Deleted Successfully!");
                loadNextId();
                loadAllCategories();
                clearForm();
            },
            error: function (xhr) {
                alert("Failed to delete category.");
            }
        });
    }
}

function clearForm() {
    $('#categoryName').val('');
    $('#categoryDesc').val('');
}