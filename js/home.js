$('#logoutBtn').click(function(e) {
<<<<<<< HEAD
     if (!localStorage.getItem("JWT")) {
        window.location.href = "/html/login.html"; 
        return;
    }
    e.preventDefault();
    localStorage.removeItem("JWT");
    localStorage.removeItem("role");
    window.location.href = "/login.html";
});
=======
    e.preventDefault(); 

    localStorage.clear(); 
  
    window.location.href = "/html/login.html";
});
>>>>>>> c3c1b74 (Update files)
