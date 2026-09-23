$(document).ready(function() {
    const $mobileMenu = $('#mobile-menu');
    const $navRightContainer = $('#nav-right-container');
    const $icon = $mobileMenu.find('i');

    $mobileMenu.click(function() {
        $navRightContainer.toggleClass('active');
        
        if ($navRightContainer.hasClass('active')) {
            $icon.removeClass('fa-bars').addClass('fa-xmark');
        } else {
            $icon.removeClass('fa-xmark').addClass('fa-bars');
        }
    });

    $('.nav-menu a, .nav-auth a').click(function() {
        if ($navRightContainer.hasClass('active')) {
            $navRightContainer.removeClass('active');
            $icon.removeClass('fa-xmark').addClass('fa-bars');
        }
    });
});