$(document).ready(function () {   
     
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    $('#current-date').text(new Date().toLocaleDateString('en-US', options));

    loadAuditLogs();
    loadAllUsers();

    $('#logoutBtn').on('click', function (e) {
        e.preventDefault();
        localStorage.clear();
        window.location.href = "/html/login.html"; 
    });
});

function loadAuditLogs() {
    $.ajax({
        url: "http://localhost:8080/v1/logs",
        type: 'GET',
        contentType: "application/json",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT") 
        },
        success: function (response) {
            console.log("Audit Logs Response:", response);
            
            let logs = response.body;
            let tableBody = $('#logs-table-body');
            tableBody.empty();

            if (logs && logs.length > 0) {
                logs.forEach(log => {
                    let row = `<tr>
                                <td>${log.id || log.logId || ''}</td>
                                <td>${log.action || ''}</td>
                                <td>${log.userId || ''}</td>
                                <td>${log.timestamp || log.date || ''}</td>
                              </tr>`;
                    tableBody.append(row);
                });
            } else {
                tableBody.append(`<tr><td colspan="4" style="text-align: center; color: #94a3b8;">No activity logs found.</td></tr>`);
            }
        },
        error: function (xhr) {
            console.log("Error loading audit logs:", xhr);
            $('#logs-table-body').append(`<tr><td colspan="4" style="text-align: center; color: #f87171;">Failed to load logs.</td></tr>`);
        }
    });
}

function loadAllUsers() {
    $.ajax({
        url: "http://localhost:8080/v1/user/users",
        type: 'GET',
        contentType: "application/json",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function (response) {
            console.log("Users Response:", response);
            let users = response.body;
            let tableBody = $('#user-table-body');
            tableBody.empty();

            if (users && users.length > 0) {
                users.forEach(user => {
                    let row = `<tr>
                                <td>${user.userId || ''}</td>
                                <td>${user.userName || ''}</td>
                                <td><span style="background: rgba(214, 51, 132, 0.2); color: #ff758c; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;">${user.userRoles || ''}</span></td>
                                <td>
                                    <button class="btn btn-sm" style="background:#3b82f6; color:white; padding:5px 10px; border-radius:6px; border:none; cursor:pointer;" onclick="selectUser(${user.userId})"><i class="fa-solid fa-pen"></i></button>
                                </td>
                              </tr>`;
                    tableBody.append(row);
                });
            } else {
                tableBody.append(`<tr><td colspan="4" style="text-align: center; color: #94a3b8;">No users found.</td></tr>`);
            }
        },
        error: function (xhr) {
            console.log("Error loading users:", xhr);
            $('#user-table-body').append(`<tr><td colspan="4" style="text-align: center; color: #f87171;">Failed to load users.</td></tr>`);
        }
    });
}

function filterUsers() {
    let query = $('#search-user').val().trim();

    let url = "http://localhost:8080/v1/user/users";
    if (query !== "") {
        url = "http://localhost:8080/v1/user/filter-users?userName=" + encodeURIComponent(query);
    }

    $.ajax({
        url: url,
        type: 'GET',
        contentType: "application/json",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function (response) {
            let users = response.body;
            let tableBody = $('#user-table-body');
            tableBody.empty();

            if (users && users.length > 0) {
                users.forEach(user => {
                    let row = `<tr>
                                <td>${user.userId || ''}</td>
                                <td>${user.userName || ''}</td>
                                <td><span style="background: rgba(214, 51, 132, 0.2); color: #ff758c; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;">${user.userRoles || ''}</span></td>
                                <td>
                                    <button class="btn btn-sm" style="background:#3b82f6; color:white; padding:5px 10px; border-radius:6px; border:none; cursor:pointer;" onclick="selectUser(${user.userId})"><i class="fa-solid fa-pen"></i></button>
                                </td>
                              </tr>`;
                    tableBody.append(row);
                });
            } else {
                tableBody.append(`<tr><td colspan="4" style="text-align: center; color: #94a3b8;">No matching users found.</td></tr>`);
            }
        },
        error: function (xhr) {
            console.log("Error filtering users:", xhr);
        }
    });
}

function selectUser(userId) {
    console.log("Selected User ID:", userId);
}
