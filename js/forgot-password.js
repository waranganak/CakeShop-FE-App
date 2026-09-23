

function handlePasswordReset() {
    const email = $('#resetEmail').val().trim();
    
    if(!email) {
        $('#error-msg').text('Please enter your email address.').fadeIn();
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)) {
        $('#error-msg').text('Please enter a valid email address.').fadeIn();
        return;
    }

    $('#error-msg').hide();
    $('#btnSpinner').show();
    $('.btn-text').text('Sending...');
    
    setTimeout(() => {
        alert('Password reset link has been sent to your email!');
        $('#btnSpinner').hide();
        $('.btn-text').text('Send Reset Link');
        $('#resetEmail').val('');
    }, 1500);
}