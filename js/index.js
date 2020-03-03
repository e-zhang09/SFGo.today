let isMobile = false;
let tripType = 'one';
let srcAirport = 'San Jose, CA (SJC)';
let destAirport = 'San Francisco, CA (SFO)';
let numPassenger = 1;
let date = {};
let curLoc = '';
let isStorage = storageAvailable('localStorage');
let isLoggedIn = false;
let nextAct = null;
let userName = null;
let email = localStorage.getItem('email');
let selectedFlights = 0;

if (isStorage) {
    let status = localStorage.getItem('user');
    if (status) {
        isLoggedIn = true;
        userName = status;
    } else {
        isLoggedIn = false;
    }
}

$(document).ready(function () {
    $(window).resize(update_windowResized);
    update_windowResized();

    let loca = window.location.pathname;
    loca = loca.replace(/\//g, "");
    curLoc = loca;
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

    if (isMobile) {
        $('.ui.fluid.dropdown').dropdown();
        $('.ui.single.dropdown').dropdown({
            onChange: function (value) {
                update_dateSelectType(value)
            }
        });
    } else {
        $('.labeled.button').on('click', function (e) {
            if (e.target.classList.contains('clickable')) {
                $("#" + $(e.target).data('btn-target')).toggleClass('visible');
                $("#" + $(e.target).data('btn-target') + " > div.menu-container > div").dropdown("show");
                $("#" + $(e.target).data('btn-target') + " > div.menu-container > div > input").focus();
            }
        });

        $('.labeled.button').on("focusout", function (event) {
            let targElem = "#" + $(event.target.parentElement).data('btn-target');
            if ($(targElem).hasClass('visible')) {
                $(event.target.parentElement.parentElement).animate({
                    opacity: 0
                }, 500, function () {
                    $(targElem).removeClass('visible');
                    $(event.target.parentElement.parentElement).css('opacity', 1);
                });
            }
        });

        $('.dropdown.dir').dropdown({
            onChange: function (value, text, el) {
                $("#dir-display").text(text);
                update_dateSelectType(value);

            }
        });

        $('.dropdown.dest').dropdown({
            fullTextSearch: "fuzzy",
            ignoreCase: "true",
            apiSettings: {
                url: '/api/airports/{query}'
            },
            minCharacters: 0,
            onChange: function (value, text, el) {
                // closeTop();
                airportSelected(value, text, el, 'dest')
            }
        });

        $('.dropdown.src').dropdown({
            fullTextSearch: "fuzzy",
            ignoreCase: "true",
            apiSettings: {
                url: '/api/airports/{query}'
            },
            minCharacters: 0,
            onChange: function (value, text, el) {
                // closeTop();
                airportSelected(value, text, el, 'src')
            }
        });

        $("input[type='text']").on("focus", function () {
            $(this).select();
        });

        $('.date-container .form-control').on("focusout", function (event) {
            if (!this.value) {
                this.value = 'Departure Date'
            }
        });

        $('.dropdown.num').dropdown({
            onChange: function (value, text, el) {
                numPassenger = +value;
                $('.dropdown.num .drop-num').text(text);
            }
        });
    }

    // close opened tabs one by one
    $(document).keyup(function (event) {
        if (event.which === 13) {
            event.preventDefault();
        }
        if (event.originalEvent.key === 'Tab') {
            setTimeout(function () {
                closeTop()
            }, 500)
        }
        if (event.originalEvent.key === 'Escape') {
            closeTop();
        }
    });

    $(document).on("click", function (event) {
        // close other tabs if this isn't one
        if ($(event.target).closest("[data-importance]").length === 0) {
            closeTop();
        }
    });

    function closeTop() {
        let mostImportant = null;
        let val = 1000;
        $("[data-importance]").each(function (i) {
            if (i < val && this.classList.contains('visible')) {
                mostImportant = this;
            }
        });

        if (mostImportant) {
            mostImportant.classList.remove("visible");
        }
    }


    // Add slideDown animation to Bootstrap dropdown when expanding.
    $('body > header > nav').on('show.bs.dropdown', function () {
        $(this).find('.dropdown-menu').first().stop(true, true).slideDown(250);
    });

    // Add slideUp animation to Bootstrap dropdown when collapsing.
    $('body > header > nav').on('hide.bs.dropdown', function () {
        $(this).find('.dropdown-menu').first().stop(true, true).slideUp(175);
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

    update_dateSelectType();

    function update_dateSelectType(val) {
        //enable date pickers
        if (val) {
            tripType = val;
        }
        if (isMobile) {
            if (tripType === 'one' || tripType === 'rapid') {
                $('.single-date.form-control.mobile-d').show().datepicker({
                    autoclose: true
                });
                $('.range-date.input-group.mobile-d').hide();
            } else {
                $('.range-date.input-group.mobile-d').show().datepicker({
                    autoclose: true
                });
                $('.single-date.form-control.mobile-d').hide();
            }
        } else {
            if (tripType === 'one' || tripType === 'rapid') {
                $('#direction-indicator').removeClass('back-forth').addClass('to-right');
            } else {
                $('#direction-indicator').addClass('back-forth').removeClass('to-right');
            }
            if (tripType === 'one' || tripType === 'rapid') {
                $('.single-date.form-control:not(mobile-d)').show().datepicker({
                    autoclose: true
                });
                $('.range-date.input-group:not(mobile-d)').hide();
            } else {
                $('.range-date.input-group:not(mobile-d)').show().datepicker({
                    autoclose: true,
                    format: "mm/dd"
                });
                $('.single-date.form-control:not(mobile-d)').hide();
            }
        }
    }

    function navAction(targetLoc) {
        if (targetLoc === '/') {
            window.location = './';
        }

        $(".dropdown-menu").removeClass('show');
        if (isMobile) {
            $('.collapse').collapse("hide");
        }

        $('.land').click();

        let loc = window.location.pathname;
        loc = loc.replace(/\//g, "");
        curLoc = loc;
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
            src += 'ground-crew-sm.jpg';
            bigHeader = 'Work With Us';
        } else if (loc === 'contact') {
            src += 'support-lady-sm.jpg';
            bigHeader = 'Contact Us';
        } else if (loc === 'programs') {
            src += 'programs.jpg';
            bigHeader = 'Join Our Programs'
        } else if (loc === 'home') {
            src += 'plane-taking-off-' + (isMobile ? 'm-' : '') + 'xl.jpg';
            bigHeader = 'Book Your Next Flight';
        } else {
            src += 'airport-xl.jpg';
            bigHeader = isMobile ? 'Check Out Our Schedules' : 'Get Our Schedules'
        }

        $('#welcome-message').fadeOut(500, function () {
            if (isMobile && loc === 'schedules') {
                $(this).css('width', '78vw');
            } else if (isMobile) {
                $(this).css('width', '67.5vw');
            } else {
                $(this).css('width', 'unset');
            }
            $(this).text(bigHeader).fadeIn(250);
        });

        $('#tag-line').fadeOut(500, function () {
            $(this).text('Travel Seamlessly').fadeIn(250);
        });

        let fullSrc = 'https://pixboost.com/api/2/img/https://sfgo.today' + src + '/resize?size=' + (isMobile ? '576' : Math.ceil($(window).width() / 256) * 256) + '&auth=MTc5MzczMTIxMA__';

        // LOAD BACKGROUND IMAGE
        $('<img/>').attr('src', fullSrc).on('load', function () {
            $(this).remove();
            // $('.land-section').css('background-image', 'url(' + src + ')');
            $('.land-section').css({
                backgroundImage: 'url(' + fullSrc + ')'
            });

            //calculate landing-splash size
            let image = new Image();
            image.src = fullSrc;
            let width = image.width, height = image.height;
            $('.land-section').css('height', isMobile ? 'calc(100vw * 4464 / 5370 - 1px)' : 'calc(100vw * ' + height + ' / ' + width + ' - 1px)');
            if (isMobile) {
                $('.land-section').css('background-size', 'cover');
            }
            $('.land-section').animate({opacity: 1}, 500);

            if ($("#book-flight-bar").scrollTop !== 20) {
                //slide in animation for booking bar
                $("#book-flight-bar").animate({top: 5, opacity: 1}, 1000);
                setTimeout(function () {
                    $("#welcome-message").animate({top: (isMobile ? 15 : 137), opacity: 1}, 1000);
                }, 250);
                setTimeout(function () {
                    let ratio = screen.width / screen.height;
                    $("#tag-line").animate({top: 217 + (isMobile ? 10 + 30 * (1 - ratio) : 0), opacity: 1}, 1000);
                }, 400);
            }
        });
    }

    function airportSelected(value, text, el, loc) {
        let iata = value.substr(-4, 3);
        let location = value.substring(0, value.length - 5).trim();
        $("#selectable-" + loc).text(iata);
        $("#desc-" + loc).text(location);
        if (loc === 'src') {
            srcAirport = value;
        } else {
            destAirport = value;
        }
    }

    function navBarVisibility() {
        if (window.pageYOffset >= sticky + 4 * $(window).height() / 5) {
            if (navBarDown) return;
            navBarDown = true;
            let navHeight = $(navbar).outerHeight();


            $('#navbar-space-holder').css('min-height', navHeight).css('display', 'block');
            navbar.classList.add("sticky");

            // navbar.classList.remove("bg-transparent");
            // navbar.classList.add("bg-dark");

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

            // navbar.classList.remove("bg-dark");
            // navbar.classList.add("bg-transparent");
        }
    }

    $('.return-to-top').click(function () {
        $("html, body").animate({scrollTop: 0}, 600);
        return false;
    });

    $('body').on('hidden.bs.modal', function () {
        if ($('.modal.show').length > 0) {
            $('body').addClass('modal-open');
        }
    });

    function update_windowResized() {
        isMobile = $(window).width() < 576;
        if ($(window).width() < 576) {
            //mobile
            $('.return-to-top').css('margin-bottom', $('.book-flight-m').outerHeight() - 6);
            if (curLoc === 'schedules') {
                $('#welcome-message').text('Check Out Our Schedules');
                $('#welcome-message').css('width', '78vw');
                reanim_welcomeMsg();
            }
            $('.logo-img').attr('width', "105");
        } else {
            //tablet/desktop
            $('.return-to-top').css('margin-bottom', 0);
            if (curLoc === 'schedules') {
                $('#welcome-message').text('Get Our Schedules');
                $('#welcome-message').css('width', 'unset');
                reanim_welcomeMsg();
            }
            if ($(window).width() < 1024) {
                $('.logo-img').attr('width', "70");
            } else {
                $('.logo-img').attr('width', "140");
            }
        }

        function reanim_welcomeMsg() {
            $("#welcome-message").stop(true);
            $("#tag-line").stop(true);
            $("#welcome-message").animate({top: (isMobile ? 15 : 137), opacity: 1}, 1000);
            let ratio = screen.width / screen.height;
            $("#tag-line").animate({top: 217 + (isMobile ? 10 + 30 * (1 - ratio) : 0), opacity: 1}, 1000);
        }
    }


    $('#passwordInput, #passwordIn').on("keyup", function () {
        if ($(this).val()) {
            $(this).addClass('hasvalue')
        } else {
            $(this).removeClass('hasvalue')
        }
    });

    let forms = document.getElementsByClassName('needs-validation');
    // Loop over them and prevent submission
    let validation = Array.prototype.filter.call(forms, function (form) {
        form.addEventListener('submit', function (event) {
            if (form.checkValidity() === false) {
                event.preventDefault();
                event.stopPropagation();
            } else {
                event.preventDefault();
            }
            form.classList.add('was-validated');
        }, false);
    });

    $('#loginModal').on('hidden.bs.modal', function () {
        if (!$('.reset-container').hasClass('is-hide')) {
            $('.modal-content .display-6').text("Register for SFGo");
            $('.lead .btn-dark').text("Register Now");
            $('.modal-footer .btn-primary').text("Log In");
            $('#loginModalLabel').text("Log In Now");

            $('.reset-container [required]').removeAttr('required');
            $('.register-container [required]').removeAttr('required');
            $('.login-container input').attr("required");

            $('.register-container').css({
                'top': '250',
                'opacity': '0',
                'display': 'none'
            });

            $('.login-container').css({'top': '0', 'opacity': '1', 'display': 'block'});
            $('.reset-container').addClass('is-hide');
        }
        nextAct = null;
    });

    $('.register-container').addClass('is-hide');
    $('.reset-container').addClass('is-hide');
    update_userImg();

    $('.signout-drop').on("click", function () {
        $('.signout-drop').animate({opacity: 0}, 500);
        setTimeout(function () {
            $('.signout-drop').removeClass('visible');
        }, 500);
        isLoggedIn = false;
        userName = null;
        email = null;
        localStorage.clear();
        update_userImg();
    });

    $('.book-trip-container button.btn-primary').on("click", function (evt) {
        let $chck = $('#checkOutBtn');
        if (selectedFlights === 0) {
            $chck.prop("disabled", false);
        }
        selectedFlights++;
        $chck.text('Check Out (' + selectedFlights + ')');

        if ($(this).hasClass('flight-booked')) return;
        $(this).css('width', $(this).outerWidth());
        $(this).prop("disabled", true);
        $(this).addClass('flight-booked');
        $(this).html('<span class="spinner-border spinner-border-sm"></span>');
        setTimeout(function () {
            $(evt.target).html('<i class="fas fa-check">');
        }, rndInt(500,4500));
        console.info($(this).data('book-id'));
    });
});

function bookFlight() {
    nextAct = 'book';
    if (!isLoggedIn) {
        signIn('book');
    } else {
        nextStep();
    }
}

function signIn(isBook) {
    if (!isBook && nextAct === 'book') {
        nextAct = null;
    }
    if (!isLoggedIn) {
        $('#loginModal').modal('show');
        if ($('#passwordInput').val()) {
            $('#passwordInput').addClass('hasvalue')
        }
        if ($('#passwordIn').val()) {
            $('#passwordIn').addClass('hasvalue')
        }
    }
}

function registerClick(isReset) {
    if (isReset) {
        let isRegVis = $('.register-container').is(':visible');
        let isLogVis = $('.login-container').is(':visible');

        $('.modal-content .display-6').fadeOut(function () {
            $(this).text("Log in to SFGo").fadeIn();
        });
        $('.lead .btn-dark').fadeOut(function () {
            $(this).text("Log In Now").fadeIn();
        });
        $('#loginModalLabel').fadeOut(function () {
            $(this).text("Reset Password").fadeIn();
        });

        $('.modal-footer .btn-primary').fadeOut(function () {
            $(this).text("Reset").fadeIn();
        });

        $('.register-container [required]').removeAttr('required');
        $('.login-container [required]').removeAttr('required');
        $('.reset-container input').attr("required");

        if (isLogVis) {
            $('.login-container').animate({'top': '-200', 'opacity': '0', 'display': 'none'}, 1000).css({'top': 250});
        }
        if (isRegVis) {
            $('.register-container').animate({
                'top': '-200',
                'opacity': '0',
                'display': 'none'
            }, 1000).css({'top': 250});
        }

        $('.reset-container').css({'top': 250, 'opacity': 0});
        setTimeout(function () {
            $('.reset-container').removeClass('is-hide');
            $('.reset-container').animate({'top': '0', 'opacity': '1', 'display': 'block'}, 1000);
        }, 250);
    } else if ($('.register-container').is(':visible') || $('.reset-container').is(':visible')) {
        let isRegVis = $('.register-container').is(':visible');
        let isResVis = $('.reset-container').is(':visible');

        $('.modal-content .display-6').fadeOut(function () {
            $(this).text("Register for SFGo").fadeIn();
        });
        $('.lead .btn-dark').fadeOut(function () {
            $(this).text("Register Now").fadeIn();
        });
        $('.modal-footer .btn-primary').fadeOut(function () {
            $(this).text("Log In").fadeIn();
        });
        $('#loginModalLabel').fadeOut(function () {
            $(this).text("Log In Now").fadeIn();
        });

        $('.reset-container [required]').removeAttr('required');
        $('.register-container [required]').removeAttr('required');
        $('.login-container input').attr("required");

        if (isResVis) {
            $('.reset-container').animate({'top': '-200', 'opacity': '0', 'display': 'none'}, 1000).css({'top': 250});
        }
        if (isRegVis) {
            $('.register-container').animate({
                'top': '-200',
                'opacity': '0',
                'display': 'none'
            }, 1000).css({'top': 250});
        }
        $('.login-container').css({'top': 250, 'opacity': 0});
        setTimeout(function () {
            $('.login-container').animate({'top': '0', 'opacity': '1', 'display': 'block'}, 1000);
            setTimeout(function () {
                $('.register-container').addClass('is-hide');
                $('.reset-container').addClass('is-hide');
            }, 1000);
        }, 250);
    } else {
        $('.modal-content .display-6').fadeOut(function () {
            $(this).text("Log in to SFGo").fadeIn();
        });
        $('.lead .btn-dark').fadeOut(function () {
            $(this).text("Log In Now").fadeIn();
        });
        $('.modal-footer .btn-primary').fadeOut(function () {
            $(this).text("Register").fadeIn();
        });
        $('#loginModalLabel').fadeOut(function () {
            $(this).text("Register Now").fadeIn();
        });

        $('.login-container [required]').removeAttr('required');
        $('.register-container input').attr("required");

        $('.login-container').animate({'top': '-200', 'opacity': '0', 'display': 'none'}, 1000).css({'top': 250});
        $('.register-container').css({'top': 250, 'opacity': 0});
        setTimeout(function () {
            $('.register-container').removeClass('is-hide');
            $('.register-container').animate({'top': '0', 'opacity': '1', 'display': 'block'}, 1000);
        }, 250);
    }
}

function loginClick(e) {
    let form = document.getElementById('loginForm');
    if (!form.checkValidity()) return;
    let register = ($('.register-container').is(':visible'));
    let isReset = $('.reset-container').is(':visible');

    if (isReset) {
        setTimeout(function () {
            window.alert('Email sent. Check your email for more instructions!');
            window.location = './';
        }, rndInt(1000,2000));
        return;
    }

    let dataPrep = {};
    if (register) {
        dataPrep.email = $('#emailIn').val();
        dataPrep.password = $('#passwordIn').val();
        dataPrep.name = $('#nameIn').val();
    } else {
        dataPrep.email = $('#emailInput').val();
        dataPrep.password = $('#passwordInput').val();
    }
    $.ajax({
        type: 'POST',
        url: '/api/' + (register ? 'register' : 'signin'),
        data: dataPrep,
        success: function (data) {
            userName = data.name;
            isLoggedIn = true;
            localStorage.setItem('user', userName);
            localStorage.setItem('email', dataPrep.email);
            update_userImg();
            nextStep();
        },
        error: function (data) {
            if (!register) {
                $('input').val('').removeClass('hasvalue');
            }
        }
    });
}

function nextStep(isGuest) {
    $('.modal').modal('hide');
    if (nextAct) {
        $('#bookModal').modal('show');
        if (tripType === 'round') {
            let startDate = ($('.date-container .input-sm[name=start]').datepicker('getUTCDate'));
            let endDate = ($('.date-container .input-sm[name=end]').datepicker('getUTCDate'));
            $('.details').text('Showing flights departing on ' + startDate + ' and returning on ' + endDate + ' from ' + srcAirport + ' to ' + destAirport + '...');
        } else {
            let date = ($('.date-container .single-date').datepicker('getUTCDate'));
            $('.details').text('Showing flights departing on ' + date + ' from ' + srcAirport + ' to ' + destAirport + '...');
        }
    }
}

function update_userImg() {
    if (isLoggedIn) {
        $('#user-pfp').html(' <i class="fas fa-user" id="icon-user"></i>' + userName.split(' ')[0]);
        $('#user-pfp').attr('onclick', 'signOut()');
    } else {
        $('#user-pfp').html(' <i class="fas fa-user" id="icon-user"></i>Sign In');
        $('#user-pfp').attr('onclick', 'signIn()');
    }
}


function signOut() {
    if ($('.signout-drop').css('display') === 'block') {
        $('.signout-drop').animate({opacity: 0}, 500);
        setTimeout(function () {
            $('.signout-drop').css('display', 'none');
        }, 500);
    } else {
        $('.signout-drop').css('display', 'block').animate({opacity: 1}, 500);
        setTimeout(function () {
            $('.signout-drop').animate({opacity: 0}, 500);
            setTimeout(function () {
                $('.signout-drop').css('display', 'none');
            }, 500);
        }, 5000)
    }
}

function done() {
    $('.modal').modal('hide');
}

function checkOut() {
    let $chckBtn = $('#checkOutBtn');
    $chckBtn.css('width', $chckBtn.outerWidth());
    $chckBtn.html('<span class="spinner-border spinner-border-sm"></span>');
    setTimeout(function () {
        $('#checkOutBtn').html('<i class="fas fa-check">');
        $('#bookModal').modal('hide');
        $('#checkoutModal').modal('show');
        $('#checkOutBtn').html('Check Out');
    }, rndInt(500,2500));
}


function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        let x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return e instanceof DOMException && (
            e.code === 22 ||
            e.code === 1014 ||
            e.name === 'QuotaExceededError' ||
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            (storage && storage.length !== 0);
    }
}


function rndInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}