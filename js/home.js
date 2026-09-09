$('#logoutBtn').click(function(e) {
     if (!localStorage.getItem("JWT")) {
        window.location.href = "/html/login.html"; 
        return;
    }
    e.preventDefault();
    localStorage.removeItem("JWT");
    localStorage.removeItem("role");
    window.location.href = "/login.html";
});