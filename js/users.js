$(document).ready(function () {
    let token = localStorage.getItem("JWT");
    let role = localStorage.getItem("role");

    if (!token || role !== "ADMIN") {
        alert("Access Denied! Admins only.");
        window.location.href = "/html/login.html";
        return;
    }

    loadAllUsers();

    $('#logoutBtn').on('click', function (e) {
        e.preventDefault();
        localStorage.clear();
        window.location.href = "/html/login.html";
    });

    $('#userForm').on('submit', function (e) {
        e.preventDefault();

        let userId = $('#userId').val();
        let userName = $('#userName').val().trim();
        let password = $('#password').val();
        let userRoles = $('#userRoles').val();

        let userDTO = {
            userId: userId ? parseInt(userId) : null,
            userName: userName,
            password: password,
            userRoles: userRoles
        };

        let isUpdate = userId !== "";
        let url = "http://localhost:8080/v1/user" + (isUpdate ? "/update-user" : "/save"); 
        let method = isUpdate ? "PUT" : "POST";

        $.ajax({
            url: url,
            type: method,
            contentType: "application/json",
            headers: { 'Authorization': 'Bearer ' + token },
            data: JSON.stringify(userDTO),
            success: function (response) {
                alert(isUpdate ? "User updated successfully!" : "User saved successfully!");
                resetForm();
                loadAllUsers();
            },
            error: function (xhr) {
                console.error("Error saving user:", xhr);
                alert("Operation failed! Check console for details.");
            }
        });
    });

    $('#searchUserBox').on('keyup', function () {
        let query = $(this).val().trim();
        if (query === "") {
            loadAllUsers();
        } else {
            filterUsers(query);
        }
    });

    $('#btnClearForm').on('click', function () {
        resetForm();
    });
});

function loadAllUsers() {
    $.ajax({
        url: "http://localhost:8080/v1/user/users",
        type: 'GET',
        contentType: "application/json",
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem("JWT") },
        success: function (response) {
            let users = response.body || response;
            let tableBody = $('#userTableBody');
            tableBody.empty();

            if (Array.isArray(users) && users.length > 0) {
                users.forEach(user => {
                    tableBody.append(`
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 12px; color: #fff;">${user.userId || ''}</td>
                            <td style="padding: 12px; color: #fff;">${user.userName || ''}</td>
                            <td style="padding: 12px;">
                                <span style="background: rgba(236, 72, 153, 0.15); color: #f472b6; border: 1px solid rgba(244, 114, 182, 0.2); padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;">
                                    ${user.userRoles || ''}
                                </span>
                            </td>
                            <td style="padding: 12px; text-align: center;">
                                <button onclick="editUser('${user.userId}', '${user.userName}', '${user.userRoles}')" style="background: #3b82f6; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; margin-right: 5px;"><i class="fa-solid fa-pen"></i></button>
                                <button onclick="deleteUser('${user.userId}')" style="background: #ef4444; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
                            </td>
                        </tr>
                    `);
                });
            } else {
                tableBody.append(`<tr><td colspan="4" style="text-align: center; color: #9ca3af; padding: 20px;">No users found.</td></tr>`);
            }
        }
    });
}

function filterUsers(query) {
    $.ajax({
        url: "http://localhost:8080/v1/user/filter-users?userName=" + encodeURIComponent(query),
        type: 'GET',
        contentType: "application/json",
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem("JWT") },
        success: function (response) {
            let users = response.body || response;
            let tableBody = $('#userTableBody');
            tableBody.empty();

            if (Array.isArray(users) && users.length > 0) {
                users.forEach(user => {
                    tableBody.append(`
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 12px; color: #fff;">${user.userId || ''}</td>
                            <td style="padding: 12px; color: #fff;">${user.userName || ''}</td>
                            <td style="padding: 12px;">
                                <span style="background: rgba(236, 72, 153, 0.15); color: #f472b6; border: 1px solid rgba(244, 114, 182, 0.2); padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;">
                                    ${user.userRoles || ''}
                                </span>
                            </td>
                            <td style="padding: 12px; text-align: center;">
                                <button onclick="editUser('${user.userId}', '${user.userName}', '${user.userRoles}')" style="background: #3b82f6; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; margin-right: 5px;"><i class="fa-solid fa-pen"></i></button>
                                <button onclick="deleteUser('${user.userId}')" style="background: #ef4444; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
                            </td>
                        </tr>
                    `);
                });
            } else {
                tableBody.append(`<tr><td colspan="4" style="text-align: center; color: #9ca3af; padding: 20px;">No matching users found.</td></tr>`);
            }
        }
    });
}

function editUser(id, name, role) {
    $('#userId').val(id);
    $('#userName').val(name);
    $('#password').val(''); 
    $('#userRoles').val(role);
    $('#btnSaveUser').html('<i class="fa-solid fa-sync"></i> Update User');
}

function deleteUser(id) {
    if (confirm("Are you sure you want to delete this user?")) {
        $.ajax({
            url: "http://localhost:8080/v1/user/" + id,
            type: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem("JWT") },
            success: function () {
                alert("User deleted successfully!");
                loadAllUsers();
            },
            error: function (xhr) {
                console.error("Error deleting user:", xhr);
                alert("Failed to delete user. Make sure delete endpoint is implemented in UserController.");
            }
        });
    }
}

function resetForm() {
    $('#userId').val('');
    $('#userName').val('');
    $('#password').val('');
    $('#userRoles').val('');
    $('#btnSaveUser').html('<i class="fa-solid fa-save"></i> Save User');
}