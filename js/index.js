let isMobile = false;
let tripType = 'one';
let curLoc = '';

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

    if(isMobile){
        $('.ui.fluid.dropdown').dropdown();
        $('.ui.single.dropdown').dropdown({
            onChange: function (value) {
                update_dateSelectType(value)
            }
        });
    }else{
        $('.labeled.button').on('click', function(e){
            if(e.target.classList.contains('clickable')){
                $("#"+$(e.target).data('btn-target')).toggleClass('visible');
                $("#"+$(e.target).data('btn-target')+" > div.menu-container > div").dropdown("show");
                $("#"+$(e.target).data('btn-target')+" > div.menu-container > div > input").focus();
            }
        });

        $('.labeled.button').on("focusout", function(event){
            let targElem = "#"+$(event.target.parentElement).data('btn-target');
            if($(targElem).hasClass('visible')){
                $(event.target.parentElement.parentElement).animate({
                    opacity: 0
                }, 500, function() {
                    $(targElem).removeClass('visible');
                    $(event.target.parentElement.parentElement).css('opacity', 1);
                });
            }
        });

        $('.dropdown.dir').dropdown({
            onChange: function(value, text, el){
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

        $('.date-container .form-control').on("focusout", function(event){
            if(!this.value){
                this.value = 'Departure Date'
            }
        });

        $('.dropdown.num').dropdown({
            onChange: function(value, text, el){
                $('.dropdown.num .drop-num').text(text);
            }
        });
    }

    // close opened tabs one by one
    $( document ).keyup(function( event ) {
        if ( event.which === 13 ) {
            event.preventDefault();
        }
        if(event.originalEvent.key === 'Tab'){
            setTimeout(function(){closeTop()}, 500)
        }
        if(event.originalEvent.key === 'Escape'){
            closeTop();
        }
    });

    $(document).on("click", function(event){
        // close other tabs if this isn't one
        if($(event.target).closest("[data-importance]").length === 0){
            closeTop();
        }
    });

    function closeTop(){
        let mostImportant = null;
        let val = 1000;
        $("[data-importance]").each(function(i){
            if(i < val && this.classList.contains('visible')){
                mostImportant = this;
            }
        });

        if(mostImportant){
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
        }else{
            if(tripType === 'one' || tripType === 'rapid'){
                $('#direction-indicator').removeClass('back-forth').addClass('to-right');
            }else{
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
            if(isMobile && loc === 'schedules'){
                $(this).css('width', '78vw');
            }else if(isMobile){
                $(this).css('width', '67.5vw');
            }else{
                $(this).css('width', 'unset');
            }
            $(this).text(bigHeader).fadeIn(250);
        });

        $('#tag-line').fadeOut(500, function () {
            $(this).text('Travel Seamlessly').fadeIn(250);
        });

        let fullSrc = 'https://pixboost.com/api/2/img/https://sfgo.today' + src + '/resize?size='+ (isMobile?'576':Math.ceil($(window).width()/256)*256) +'&auth=MTc5MzczMTIxMA__';

        // LOAD BACKGROUND IMAGE
        $('<img/>').attr('src', fullSrc).on('load', function () {
            $(this).remove();
            // $('.land-section').css('background-image', 'url(' + src + ')');
            $('.land-section').css({
                backgroundImage: 'url('+fullSrc+')',
                WebkitTransition: 'background-image 1500ms ease-in-out, height 1500ms ease-in-out',
                MozTransition: 'background-image 1500ms ease-in-out, height 1500ms ease-in-out',
                MsTransition: 'background-image 1500ms ease-in-out, height 1500ms ease-in-out',
                OTransition: 'background-image 1500ms ease-in-out, height 1500ms ease-in-out',
                transition: 'background-image 1500ms ease-in-out, height 1500ms ease-in-out',
            });

            //calculate landing-splash size
            let image = new Image();
            image.src = fullSrc;
            let width = image.width, height = image.height;
            $('.land-section').css('height', isMobile ? 'calc(100vw * 4464 / 5370 - 1px)' : 'calc(100vw * ' + height + ' / ' + width + ' - 1px)');
            if (isMobile) {
                $('.land-section').css('background-size', 'cover');
            }
            $('.land-section').animate({opacity: 1}, 200);

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
        let iata = value.substr(-4,3);
        let location = value.substring(0, value.length - 5).trim();
        $("#selectable-" + loc).text(iata);
        $("#desc-" + loc).text(location);
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
            if($(window).width() < 1024){
                $('.logo-img').attr('width', "70");
            }else{
                $('.logo-img').attr('width', "140");
            }
        }
        function reanim_welcomeMsg(){
            $("#welcome-message").animate({top: (isMobile ? 15 : 137), opacity: 1}, 1000);
            let ratio = screen.width / screen.height;
            $("#tag-line").animate({top: 217 + (isMobile ? 10 + 30 * (1 - ratio) : 0), opacity: 1}, 1000);
        }
    }
});
