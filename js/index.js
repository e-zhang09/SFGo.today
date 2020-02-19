$(document).ready(function () {

    let loca = window.location.pathname;
    loca = loca.replace(/\//g, "");
    if (loca.length === 0) loca = "home";
    loadContent(loca);

    $(".active-underline").removeClass('active-underline');
    let loc = window.location.pathname;
    loc = loc.replace(/\//g, "");
    if (loc.length === 0) loc = "home";
    $("[data-nav-item*=" + loc + "]").addClass('active-underline');

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

    $('.ui.dropdown').on('keyup', 'input:text', function () {
        menuScroll.show().resize();
    });

    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
        $('[data-toggle="tooltip"]').on('shown.bs.tooltip', function () {
            $('.tooltip').addClass('animated slideInUp');
        })
    });

    //when user clicks back
    $(window).on("popstate", function (evt) {
        $('html, body').animate({
            scrollTop: 0
        }, 800);
        $(".active-underline").removeClass('active-underline');
        let loc = window.location.pathname;
        loc = loc.replace(/\//g, "");
        if (loc.length === 0) loc = "home";
        $("[data-nav-item*=" + loc + "]").addClass('active-underline');
        loadContent(loc);
    });

    //set up nav buttons
    $(".nav-button").on('click', function (event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        let targetLoc = $(this).data("nav-target");
        navAction(targetLoc);
    });

    function navAction(targetLoc) {
        if (targetLoc === '/') {
            window.location = './';
        }
        let loc = window.location.pathname;
        loc = loc.replace(/\//g, "");
        if (loc.length === 0) loc = "home";
        let sDest;
        if (['frequent', 'rapid'].includes(targetLoc)) {
            sDest = targetLoc;
            targetLoc = 'programs';
        }
        if (loc !== targetLoc) {
            window.history.pushState({urlPath: '/' + targetLoc}, capitalizeFirstLetter(targetLoc) + ' - SFGo', '/' + targetLoc);
            $(".active-underline").removeClass('active-underline');
            loadContent(targetLoc + (['programs'].includes(targetLoc) ? '|' + sDest : ''));
        }

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        $(".dropdown-menu").removeClass('show');

        $("[data-nav-item*=" + targetLoc + "]").addClass('active-underline');

        $('html, body').animate({
            scrollTop: 0
        }, 800);
    }

    function loadContent(loc) {
        loadNewSplash(loc.split('|')[0]);
        $(".page-content").load('./public/views/' + loc.split('|')[0] + '.html');
        if (loc.split('|')[1]) {
            //todo scroll to new spot
        }
    }

    function loadNewSplash(loc) {
        let src = '/img/';
        let bigHeader = 'Book Your Next Flight';

        if (loc === 'careers') {
            src += 'ground-crew.jpg';
            bigHeader = 'Work With Us';
        } else if (loc === 'contact') {
            src += 'support-lady.jpg';
            bigHeader = 'Contact Us';
        } else if (loc === 'programs') {
            src += 'programs.jpg';
            bigHeader = 'Join Our Programs'
        } else if (loc === 'home') {
            src += 'plane-taking-off-xl.png';
            bigHeader = 'Book Your Next Flight';
        } else {
            src += 'airport-xl.jpg';
            bigHeader = 'Get Our Schedules'
        }

        $('#welcome-message').fadeOut(500, function () {
            $(this).text(bigHeader).fadeIn(250);
        });

        $('#tag-line').fadeOut(500, function () {
            $(this).text('Travel Seamlessly').fadeIn(250);
        });

        // LOAD BACKGROUND IMAGE
        $('<img/>').attr('src', src).on('load', function () {
            $(this).remove();
            // $('.land-section').css('background-image', 'url(' + src + ')');
            $('.land-section').css({
                backgroundImage: 'url(' + src + ')',
                WebkitTransition: 'background-image 1s ease-in-out, height 1s ease-in-out',
                MozTransition: 'background-image 1s ease-in-out, height 1s ease-in-out',
                MsTransition: 'background-image 1s ease-in-out, height 1s ease-in-out',
                OTransition: 'background-image 1s ease-in-out, height 1s ease-in-out',
                transition: 'background-image 1s ease-in-out, height 1s ease-in-out',
            });

            //calculate landing-splash size
            let image = new Image();
            image.src = src;
            let width = image.width, height = image.height;
            $('.land-section').css('height', 'calc(100vw * ' + height + ' / ' + width + ' - 1px)');
            $('.land-section').animate({opacity: 1}, 200);

            if ($("#book-flight-bar").scrollTop !== 20) {
                //slide in animation for booking bar
                $("#book-flight-bar").animate({top: 5, opacity: 1}, 1000);
                setTimeout(function () {
                    $("#welcome-message").animate({top: 137, opacity: 1}, 1000);
                }, 250);
                setTimeout(function () {
                    $("#tag-line").animate({top: 217, opacity: 1}, 1000);
                }, 400);
            }
        });
    }

    function airportSelected(value, text, el) {
        console.info(value);
        console.info(text);
        console.info(el);
    }

    function navBarVisibility() {
        if (window.pageYOffset >= sticky + 4 * $(window).height() / 5) {
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
