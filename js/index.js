$(document).ready(function(){
    $("body").niceScroll({
        cursorcolor:"#7e7d81",
        cursorborder: "0", // css definition for cursor border
        cursorwidth:"8px"
    });

    //slide in animation for booking bar
    $("#book-flight-bar").animate({top: 0, opacity:1}, 1000);

    window.onscroll = function() {windowScrolled()};
    let navBarDown = false;

    var navbar = document.getElementsByClassName("navbar")[0];
    var sticky = navbar.offsetTop;

    function windowScrolled() {
        navBarVisibility();

    }

    function navBarVisibility(){
        if (window.pageYOffset >= sticky + 2*$(window).height()/5) {
            if(navBarDown) return;
            navBarDown = true;
            let navHeight = $(navbar).outerHeight();


            $('#navbar-space-holder').css('min-height', navHeight).css('display', 'block');
            navbar.classList.add("sticky");

            navbar.classList.remove("bg-transparent");
            navbar.classList.add("bg-dark");

            setTimeout(function(){
                if(!navbar.classList.contains('slideDown'))
                {
                    navbar.classList.add('slideDown');
                }
            },10);
        } else {
            if(navBarDown && window.pageYOffset > sticky){
                return;
            }
            $('#navbar-space-holder').css('min-height', 0).css('display', 'block');
            navBarDown = false;
            navbar.classList.remove("sticky");
            navbar.classList.remove("slide", "slideDown");

            navbar.classList.remove("bg-dark");
            navbar.classList.add("bg-transparent");
        }
    }
});