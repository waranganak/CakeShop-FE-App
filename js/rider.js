const baseUrl = "http://localhost:8080/v1/riders";

$(document).ready(function () {
    let token = localStorage.getItem("JWT");
    if (!token) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    loadAllRiders();
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
                $("#riderId").val(nextId);
            }
        },
        error: function (xhr) {
            console.log("Error loading next ID:", xhr);
        }
    });
}

function loadAllRiders() {
    $.ajax({
        url: baseUrl,
        method: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("JWT")
        },
        success: function (res) {
            let rowHtml = "";
            $("#riderTableBody").empty();
            
            let list = res.body !== undefined ? res.body : (res.data !== undefined ? res.data : res); 
            
            if (list && list.length > 0) {
                for (let i = 0; i < list.length; i++) {
                    let rider = list[i];
                    let badgeClass = rider.status === "AVAILABLE" ? "bg-success" : "bg-secondary";
                    
                    rowHtml += `<tr>
                        <td>${rider.id}</td>
                        <td>${rider.name}</td>
                        <td>${rider.email ? rider.email : 'N/A'}</td>
                        <td>${rider.phone}</td>
                        <td>${rider.vehicleNumber}</td>
                        <td><span class="badge ${badgeClass}">${rider.status}</span></td>
                    </tr>`;
                }
                $("#riderTableBody").html(rowHtml);
            } else {
                $("#riderTableBody").html(`<tr><td colspan="6" class="text-center text-muted py-3">No riders found.</td></tr>`);
            }
        },
        error: function (xhr) {
            console.log("Error loading riders:", xhr);
        }
    });
}

$("#btnSave").click(function () {
    let data = {
        id: parseInt($("#riderId").val()),
        name: $("#name").val(),
        email: $("#email").val(), // 🚀 ඊමේල් එක එකතු කළා
        phone: $("#phone").val(),
        vehicleNumber: $("#vehicleNumber").val()
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
            alert("Rider Saved Successfully! Login credentials sent to email.");
            loadAllRiders();
            clearForm(); 
        },
        error: function (xhr) {
            let errorMessage = "Error saving rider!";
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
            } else if (xhr.responseJSON && xhr.responseJSON.body) {
                errorMessage = xhr.responseJSON.body;
            }
            alert(errorMessage);
        }
    });
});

$("#riderTableBody").on("click", "tr", function () {
    let id = $(this).find("td:eq(0)").text();
    let name = $(this).find("td:eq(1)").text();
    let email = $(this).find("td:eq(2)").text();
    let phone = $(this).find("td:eq(3)").text();
    let vehicleNumber = $(this).find("td:eq(4)").text();

    $("#riderId").val(id);
    $("#name").val(name);
    $("#email").val(email === 'N/A' ? '' : email);
    $("#phone").val(phone);
    $("#vehicleNumber").val(vehicleNumber);
});

$("#btnUpdate").click(function () {
    let riderId = $("#riderId").val();
    
    if (!riderId) {
        alert("Please select a rider from the table first to update!");
        return;
    }

    let data = {
        id: parseInt($("#riderId").val()), 
        name: $("#name").val(),
        email: $("#email").val(), // 🚀 ඊමේල් එක එකතු කළා
        phone: $("#phone").val(),
        vehicleNumber: $("#vehicleNumber").val()
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
            alert("Rider Updated Successfully!");
            loadAllRiders();
            clearForm(); 
        },
        error: function (xhr) {
            let errorMessage = "Error updating rider!";
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
    let id = $("#riderId").val();
    if (!id) {
        alert("Please select a rider to delete!");
        return;
    }

    if (confirm("Are you sure you want to delete this rider?")) {
        $.ajax({
            url: baseUrl + "/" + id,
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("JWT")
            },
            success: function (res) {
                alert("Rider Deleted Successfully!");
                loadAllRiders();
                clearForm();
            },
            error: function (xhr) {
                alert("Error deleting rider!");
            }
        });
    }
});

$("#btnClear").click(function () {
    clearForm();
});

function clearForm() {
    $("#riderId").val("");
    $("#name").val("");
    $("#email").val("");
    $("#phone").val("");
    $("#vehicleNumber").val("");
    generateNextId(); 
}