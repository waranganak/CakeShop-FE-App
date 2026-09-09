$('#togglePassword').on('click', function () {
    let passwordInput = $('#password');
    let type = passwordInput.attr('type') === 'password' ? 'text' : 'password';
    passwordInput.attr('type', type);
    $(this).toggleClass('fa-eye fa-eye-slash');
});

function showError(message) {
    let errorDiv = $('#error-msg');
    let successDiv = $('#success-msg');
    successDiv.hide();
    errorDiv.text(message).fadeIn();
    setTimeout(() => { errorDiv.fadeOut(); }, 4000);
}

function showSuccess(message) {
    let successDiv = $('#success-msg');
    let errorDiv = $('#error-msg');
    errorDiv.hide();
    successDiv.text(message).fadeIn();
    setTimeout(() => { successDiv.fadeOut(); }, 4000);
}

function setButtonLoading(isLoading) {
    if (isLoading) {
        $('#btnSpinner').show();
        $('.btn-text').text('Creating Account...');
        $('#signupBtn').prop('disabled', true).css('opacity', '0.7');
    } else {
        $('#btnSpinner').hide();
        $('.btn-text').text('Sign Up');
        $('#signupBtn').prop('disabled', false).css('opacity', '1');
    }
}

function handleCustomerSignUp() {
    let username = $('#username').val().trim();
    let email = $('#email').val().trim();
    let phone = $('#phone').val().trim();
    let address = $('#address').val().trim(); 
    let password = $('#password').val().trim();

    if (username === "" || email === "" || phone === "" || address === "" || password === "") {
        showError("Please fill in all required fields.");
        return;
    }

    if (password.length < 6) {
        showError("Password must be at least 6 characters long.");
        return;
    }

   let signUpDTO = {
        name: username,       
        email: email,       
        phone: phone,       
        address: address,      
        password: password,
        userRoles: "CUSTOMER" 
    };
    setButtonLoading(true);

   $.ajax({
        url: "http://localhost:8080/v1/user/signup", 
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(signUpDTO),
        success: function (response) {
            console.log("Full Server Response:", response);
            setButtonLoading(false);

            let resBody = response.body;

            let isSuccess = false;
            if (response) {
                if (response.status === 200 || response.status === 0 || response.success === true) {
                    isSuccess = true;
                } else if (response.status === undefined && response.error === undefined) {
                    isSuccess = true;
                }
            }

            if (isSuccess) {
                let successMessage = "Account created successfully!";
                
                if (resBody && typeof resBody === 'string') {
                    successMessage = resBody;
                } else if (response.message) {
                    successMessage = response.message;
                }

                showSuccess(successMessage + " Redirecting to login...");
                
                setTimeout(() => {
                    window.location.href = "login.html"; 
                }, 2000);
            } else {
                let errorMsg = (response && response.message) ? response.message : "Registration failed.";
                showError(errorMsg);
            }
        },
        error: function (xhr) {
            setButtonLoading(false);
            console.log("Error Response:", xhr);
            
            let errorMessage = "Sign up failed. Please check your connection.";
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
            } else if (xhr.responseText) {
                errorMessage = xhr.responseText;
            }
            showError(errorMessage);
        }
    });
}

$(document).keypress(function (event) {
    if (event.which === 13) {
        handleCustomerSignUp();
    }
});