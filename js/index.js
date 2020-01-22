$(document).ready(function () {
    // LOAD BACKGROUND IMAGE
    $('<img/>').attr('src', '/img/plane-taking-off--blur--stretched.png').on('load', function () {
        $(this).remove();
        $('.land-section').css('background-image', 'url(/img/plane-taking-off--blur--stretched.png)');
        $('.land-section').animate({opacity: 1}, 200);

        //slide in animation for booking bar
        $("#book-flight-bar").animate({top: 0, opacity: 1}, 1000);
        setTimeout(function () {
            $("#welcome-message").animate({top: 135, opacity: 1}, 1000);
        }, 250);
        setTimeout(function () {
            $("#tag-line").animate({top: 215, opacity: 1}, 1000);
        }, 400);
    });

    $("body").niceScroll({
        cursorcolor: "#7e7d81",
        cursorborder: "0", // css definition for cursor border
        cursorwidth: "8px",
        zindex: 9999
    });

    window.onscroll = function () {
        windowScrolled()
    };
    let navBarDown = false;

    var navbar = document.getElementsByClassName("navbar")[0];
    var sticky = navbar.offsetTop;

    function windowScrolled() {
        navBarVisibility();
    }

    let menuScroll = $('.scrolling.menu').niceScroll({
        cursorcolor: "#7e7d81",
        cursorborder: "0", // css definition for cursor border
        cursorwidth: "8px",
        zindex: 9999
    });

    $('.ui.dropdown').dropdown({
        fullTextSearch: "exact",
        onChange: function (value, text, el) {
            airportSelected(value, text, el)
        },
        onShow: function (e) {
            setTimeout(function () {
                menuScroll.show().resize();
            }, 201);
        },
        onHide: function (e) {
            menuScroll.hide();
        },
    });

    $('.ui.dropdown').on('keyup', 'input:text', function() {
        menuScroll.show().resize();
    });

    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
        $('[data-toggle="tooltip"]').on('shown.bs.tooltip', function () {
            $('.tooltip').addClass('animated slideInUp');
        })
    });

    function airportSelected(value, text, el) {
        console.info(value);
        console.info(text);
        console.info(el);
    }

    function navBarVisibility() {
        if (window.pageYOffset >= sticky + 2 * $(window).height() / 5) {
            if (navBarDown) return;
            navBarDown = true;
            let navHeight = $(navbar).outerHeight();


            $('#navbar-space-holder').css('min-height', navHeight).css('display', 'block');
            navbar.classList.add("sticky");

            navbar.classList.remove("bg-transparent");
            navbar.classList.add("bg-dark");

            setTimeout(function () {
                if (!navbar.classList.contains('slideDown')) {
                    navbar.classList.add('slideDown');
                }
            }, 10);
        } else {
            if (navBarDown && window.pageYOffset > sticky) {
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