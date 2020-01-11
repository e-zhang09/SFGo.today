$(document).ready(function(){
    window.onscroll = function() {windowScrolled()};
    let navBarDown = false;

    var navbar = document.getElementsByClassName("navbar")[0];
    var sticky = navbar.offsetTop;

    function windowScrolled() {
        navBarVisibility();

    }

    function navBarVisibility(){
        if (window.pageYOffset >= sticky + $(window).height()/3) {
            if(navBarDown) return;
            navBarDown = true;
            let navHeight = $(navbar).outerHeight();
            $('#navbar-space-holder').css('min-height', navHeight).css('display', 'block');
            navbar.classList.add("sticky");
            setTimeout(function(){
                if(!navbar.classList.contains('slideDown'))
                {
                    navbar.classList.add('slideDown');
                }
            },10);
        } else {
            if(navBarDown && window.pageYOffset >= sticky){
                return;
            }
            $('#navbar-space-holder').css('min-height', 0).css('display', 'block');
            navBarDown = false;
            navbar.classList.remove("sticky");
            navbar.classList.remove("slide", "slideDown");
        }
    }
});