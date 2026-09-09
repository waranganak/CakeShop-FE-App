$('#togglePassword').on('click', function () {
    let passwordInput = $('#password');
    let type = passwordInput.attr('type') === 'password' ? 'text' : 'password';
    passwordInput.attr('type', type);
    $(this).toggleClass('fa-eye fa-eye-slash');
});

function showError(message) {
    let errorDiv = $('#error-msg');
    errorDiv.text(message).fadeIn();
    setTimeout(() => { errorDiv.fadeOut(); }, 4000);
}

function setButtonLoading(isLoading) {
    if (isLoading) {
        $('#btnSpinner').show();
        $('.btn-text').text('Signing In...');
        $('#loginBtn').prop('disabled', true).css('opacity', '0.7');
    } else {
        $('#btnSpinner').hide();
        $('.btn-text').text('Sign In');
        $('#loginBtn').prop('disabled', false).css('opacity', '1');
    }
}

function handleLogin() {
    let username = $('#username').val().trim();
    let password = $('#password').val().trim();

    if (username === "" || password === "") {
        showError("Please fill in all required fields.");
        return;
    }

    let authData = {
        userName: username,
        password: password
    };

    setButtonLoading(true);

    $.ajax({
        url: "http://localhost:8080/v1/user/login",
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(authData),
        success: function (response) {
            console.log("Full Server Response:", response);
            setButtonLoading(false);

            let resBody = response.body;

            if (resBody) {
                let token = resBody.token;
                let role = resBody.role;
                let customerId = resBody.id || resBody.customerId || resBody.userId;

                console.log("Extracted Token:", token);
                console.log("Extracted Role from Server:", role);
                console.log("Extracted Customer ID:", customerId);

                if (token) {
                    localStorage.setItem("JWT", token);
                    
                    if (customerId) {
                        localStorage.setItem("customerId", customerId);
                        localStorage.setItem("userId", customerId);
                    }
                    
                    let formattedRole = role ? role.toString().trim().toUpperCase() : "CUSTOMER";
                    localStorage.setItem("role", formattedRole);

                    let cleanRole = formattedRole.replace("ROLE_", "");
                    console.log("Cleaned Role for Routing:", cleanRole);

                    setTimeout(() => {
                        if (cleanRole === "ADMIN") {
                            window.location.href = "home.html";
                        } else if (cleanRole === "USER") {
                            window.location.href = "user_dashboard.html";
                        } else if (cleanRole === "CUSTOMER") {
                            window.location.href = "customer_dashboard.html";
                        } else {
                            window.location.href = "customer_dashboard.html";
                        }
                    }, 200);
                    return;
                }
            }

            let errorMsg = (response && response.message) ? response.message : "Authentication failed: Token not received.";
            showError(errorMsg);
        },
        error: function (xhr) {
            setButtonLoading(false);
            console.log("Error Response:", xhr);
            
            if (xhr.status === 401 || xhr.status === 403) {
                showError("Invalid username or password.");
            } else {
                let errorMessage = "Login failed. Please check your connection.";
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                } else if (xhr.responseText) {
                    errorMessage = xhr.responseText;
                }
                showError(errorMessage);
            }
        }
    });
}

$(document).keypress(function (event) {
    if (event.which === 13) {
        handleLogin();
    }
});