$(document).ready(function () {
    loadAllCustomers();
});

function loadAllCustomers() {
    $.ajax({
        url: "http://localhost:8080/v1/customers",
        type: 'GET',
        contentType: "application/json",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function (response) {
            console.log("All Customers Response:", response);
            let customers = response.body;
            let tableBody = $('#customer-table-body');
            tableBody.empty();

            if (customers && customers.length > 0) {
                customers.forEach(cust => {
                    let row = `<tr>
                                <td>${cust.id || cust.customerId || ''}</td>
                                <td>${cust.name || ''}</td>
                                <td>${cust.email || ''}</td>
                                <td>${cust.phone || ''}</td>
                                <td>${cust.address || ''}</td>
                              </tr>`;
                    tableBody.append(row);
                });
            } else {
                tableBody.append(`<tr><td colspan="5" style="text-align: center; color: #94a3b8;">No customers found.</td></tr>`);
            }
        },
        error: function (xhr) {
            console.log("Error loading customers:", xhr);
            $('#customer-table-body').append(`<tr><td colspan="5" style="text-align: center; color: #f87171;">Failed to load data.</td></tr>`);
        }
    });
}
  $('#logoutBtn').on('click', function (e) {
        e.preventDefault();
        localStorage.clear();
        window.location.href = "login.html";
    });

function searchCustomers() {
    let query = $('#search-box').val().trim();

    if (query === "") {
        loadAllCustomers();
        return;
    }

    $.ajax({
        url: "http://localhost:8080/v1/customers/search/" + encodeURIComponent(query),
        type: 'GET',
        contentType: "application/json",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function (response) {
            let customers = response.body;
            let tableBody = $('#customer-table-body');
            tableBody.empty();

            if (customers && customers.length > 0) {
                customers.forEach(cust => {
                    let row = `<tr>
                                <td>${cust.id || cust.customerId || ''}</td>
                                <td>${cust.name || ''}</td>
                                <td>${cust.email || ''}</td>
                                <td>${cust.phone || ''}</td>
                                <td>${cust.address || ''}</td>
                              </tr>`;
                    tableBody.append(row);
                });
            } else {
                tableBody.append(`<tr><td colspan="5" style="text-align: center; color: #94a3b8;">No matching customers found.</td></tr>`);
            }
        },
        error: function (xhr) {
            console.log("Error searching:", xhr);
        }
    });
}
