// IMPORTANT CONFIGURATIONS

//import Picker from "vanilla-picker";

/** @type {string} Change this to the API URL */
const API_URL = "http://api.dom.olo/src/api/Endpoints/";
const GET_DIR = "get/";
const POST_DIR = "post/";
const TEMPLATE_DESTINATION = '/web/templates/views/';
const SNIPPET_DESTINATION = '/web/templates/snippets/';

// ENDPOINTS
const VALIDATE_USER_ENDPOINT = API_URL + POST_DIR + "uservalidate.php";
const CREATE_USER_ENDPOINT = API_URL + POST_DIR + "createuser.php";
const CREATE_NEW_TICKET_ENDPOINT = API_URL + POST_DIR + "createticket.php";
const CREATE_MESSAGE_ENDPOINT = API_URL + POST_DIR + "createmessage.php";
const TICKETS_ENDPOINT = API_URL + GET_DIR + "tickets.php";
const MESSAGES_ENDPOINT = API_URL + GET_DIR + "messages.php";
const USER_ENDPOINT = API_URL + GET_DIR + "user.php";

// LOCATIONS FOR HISTORY
const LOCATION_REGISTER = 'Register';
const LOCATION_TICKETS = 'Tickets';
const LOCATION_LOGIN = 'Login';
const LOCATION_NEW_TICKET = 'New';
const LOCATION_TICKET = 'Ticket';
const LOCATION_USER = 'User';

// PATH LOCATIONS
const PATHNAME_LOGIN = '/';
const PATHNAME_TICKETS = '/Tickets/';
const PATHNAME_REGISTER = '/Register/';
const PATHNAME_NEW_TICKET = '/New/';
const PATHNAME_TICKET = '/Ticket/';
const PATHNAME_USER = '/User/';

const DATE_NAMES = new Array({
    0: 'Sonntag',
    1: 'Montag',
    2: 'Dienstag',
    3: 'Mittwoch',
    4: 'Donnerstag',
    5: 'Freitag',
    6: 'Samstag',
})[0];

const ROLES = new Array({
    1: 'Kunde',
    2: 'Supportmitarbeiter',
    3: 'Supportmitarbeiter (Administrator)',
})[0];

/** @var {Element} logoutButton */
var logoutButton;

/** @var {Element} ticketSearch */
var ticketSearch;

/** @var {Element} userButton */
var userButton;

var colorPickerInitialized = false;

/**
 * Initializes important things on first page load.
 */
function init() {
    setColorByLocalStorage();
    logoutButton = $('.logout-button');
    ticketSearch = $('input[type="search"]');
    userButton = $('.user-button');

    window.onpopstate = function () {
        loadViewByUrl();
    };

    (function ($) {
        $(function () {
            $('.sidenav').sidenav();
        });
    })(jQuery);

    loadViewByUrl(true);

    window.onresize = function () {
        alignFooterByHeight();
    }
}

/**
 * Installs EventHandlers for Login Form.
 */
function installLoginFormEventHandlers() {
    var loginForm = document.getElementById('loginForm');
    loginForm.action = VALIDATE_USER_ENDPOINT;

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        var xhr = new XMLHttpRequest();
        var url = VALIDATE_USER_ENDPOINT;
        var params = getDataFromForm(loginForm, e);

        xhr.open('POST', url, true);

        //Send the proper header information along with the request.
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var data = JSON.parse(xhr.responseText);

                if (data.result == true) {
                    localStorage.setItem('authkey', data.authkey);
                    window.history.pushState(LOCATION_TICKETS, 'Ticketliste', PATHNAME_TICKETS);
                    M.toast({html: 'Du bist nun eingeloggt!', classes: 'rounded'});
                } else {
                    M.toast({html: 'Bitte überprüfe deine Anmeldedaten!', classes: 'rounded'});
                }
            }
        };
        xhr.send(params);
    });

    document.querySelector('.register').addEventListener("click", function (e) {
        e.preventDefault();
        window.history.pushState(LOCATION_REGISTER, 'Registrieren', PATHNAME_REGISTER);
    });
}

/**
 * Installs EventHandlers for Register Form.
 */
function installRegisterFormEventHandlers() {
    var registerForm = document.getElementById('registerForm');
    registerForm.action = CREATE_USER_ENDPOINT;

    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        var password = e.currentTarget[3].value;
        var repeatPassword = e.currentTarget[4].value;
        if (password !== repeatPassword) {
            M.toast({html: 'Bitte überprüfe deine Passwörter auf Gleichheit!', classes: 'rounded'});
        } else {

            var xhr = new XMLHttpRequest();
            var url = CREATE_USER_ENDPOINT;
            var params = getDataFromForm(registerForm, e);

            xhr.open('POST', url, true);

            //Send the proper header information along with the request.
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var data = JSON.parse(xhr.responseText);

                    if (data.result == true) {
                        window.history.pushState(LOCATION_LOGIN, 'Login', PATHNAME_LOGIN);
                        M.toast({html: 'Du hast dich erfolgreich registriert!', classes: 'rounded'});
                    } else {
                        M.toast({html: 'Bitte überprüfe deine Registrierdaten!', classes: 'rounded'});
                    }
                }
            };
            xhr.send(params);
        }
    });
}

/**
 * Installs EventHandlers for Tickets view.
 */
function installEventHandlersForTicketView(initEventHandlers = true) {
    var newTicketButton = document.getElementById('new-ticket');

    newTicketButton.addEventListener("click", function (e) {
        e.preventDefault();

        window.history.pushState(LOCATION_NEW_TICKET, 'Neues Ticket erstellen', PATHNAME_NEW_TICKET);
        $('.material-tooltip').remove();
        loadNewTicketView(initEventHandlers);
    });

    var ticketLinks = document.querySelectorAll('.secondary-content');

    ticketLinks.forEach(function (ticket) {
        ticket.onclick = function (e) {
            e.preventDefault();
            document.body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
            window.history.pushState(LOCATION_TICKET, 'Ticket', ticket.getAttribute("href"));
        };
    });

    var searchInput = jQuery('input.white-text');

    searchInput.keyup(function (event) {
        var autocompleteElement = document.querySelector('ul.autocomplete-content.dropdown-content');
        var isNumber = !isNaN(searchInput.val().trim()) && searchInput.val().trim().length > 0;
        if (searchInput.val().trim().length >= 2 || isNumber) {
            var xhr = new XMLHttpRequest();
            var params = 'authkey=' + localStorage.getItem('authkey') + '&query=' + searchInput.val().trim();
            var url = TICKETS_ENDPOINT + '?' + params;

            xhr.open('GET', url, false);

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var results = JSON.parse(xhr.responseText);
                    var ticketsHtml = '';
                    results.forEach(function (result) {
                        $.get(SNIPPET_DESTINATION + 'ticketresults.mustache', function (template) {
                            ticketsHtml = ticketsHtml + Mustache.render(template, {id: result.id, title: result.title});
                        });
                    });
                    setTimeout(function () {
                        if (ticketsHtml === '') {
                            autocompleteElement.innerHTML = '<li><span>Keine Ergebnisse</span></li>';
                        } else if (searchInput.val().length <= 0) {
                            autocompleteElement.innerHTML = '';
                        } else {
                            autocompleteElement.innerHTML = ticketsHtml;
                        }

                        initEventHandlersForTicketResultsInSearch();
                    }, 200);
                }
            };
            xhr.send();
        } else if (searchInput.val().trim().length > 0) {
            autocompleteElement.innerHTML = '<li><span>Gib mindestens 2 Buchstaben ein</span></li>';
        } else {
            autocompleteElement.innerHTML = '';
        }
    });
}

function initEventHandlersForTicketResultsInSearch() {
    var results = jQuery('.dropdown-content li > a, .dropdown-content li > span');
    var autocompleteElement = document.querySelector('ul.autocomplete-content.dropdown-content');

    results.each(function () {
        var id = jQuery(this).closest('span').attr('id');
        this.addEventListener("click", function (e) {
            e.preventDefault();
            autocompleteElement.innerHTML = '';

            window.history.pushState(LOCATION_TICKET, 'Ticket ' + id, PATHNAME_TICKET + id);
        });
    });
}

function alignFooterByHeight() {
    var body = $("body").height();
    var win = $(window).height();
    var footer = $("footer");

    if (body <= win) {
        footer.css('position', 'fixed');
        footer.css('bottom', '0');
        footer.css('width', '100%');
    } else {
        footer.css('position', 'unset');
        footer.css('bottom', 'unset');
        footer.css('width', 'auto');
    }
}

function loadNewTicketView(initEventHandlers = true) {
    showLoggedInElements();
    $.get(TEMPLATE_DESTINATION + 'newticket.mustache', function (template) {
        document.querySelector('.main').innerHTML = Mustache.render(template, {});
    });
    setTimeout(function () {
        $('textarea#body').characterCounter();
        setEventHandlerForNewTicketView(initEventHandlers);
    }, 200);
}

function setEventHandlerForNewTicketView(initEventHandlers = true) {
    if (initEventHandlers) {
        var createNewTicketForm = document.getElementById('createTicket');
        createNewTicketForm.action = CREATE_NEW_TICKET_ENDPOINT;

        createNewTicketForm.addEventListener("submit", function (e) {
            e.preventDefault();
            jQuery('form button').addClass('disabled');
            var loader;
            $.get(SNIPPET_DESTINATION + 'loader.mustache', function (template) {
                loader = Mustache.render(template, {});
            });
            setTimeout(function () {
                M.toast({
                    html: '<div class="loading-toast">Das Ticket wird erstellt...</div>' + loader,
                    classes: 'rounded',
                    displayLength: 150000
                });
            }, 200);

            var xhr = new XMLHttpRequest();
            var url = CREATE_NEW_TICKET_ENDPOINT;
            var params = getDataFromForm(createNewTicketForm, e) + "&authkey=" + localStorage.getItem('authkey');

            xhr.open('POST', url, true);

            //Send the proper header information along with the request.
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var data = JSON.parse(xhr.responseText);

                    jQuery('.toast.rounded').remove();
                    if (data.result == true) {
                        window.history.pushState(LOCATION_TICKETS, 'Ticketliste', PATHNAME_TICKETS);
                        M.toast({html: 'Das Ticket wurde erfolgreich erstellt!', classes: 'rounded'});
                    } else {
                        M.toast({html: 'Etwas ist beim erstellen deines Tickets schief gelaufen!', classes: 'rounded'});
                    }
                }
            };
            xhr.send(params);
        });

        $('#body').keydown(function (e) {
            if ((e.ctrlKey || e.metaKey) && (e.keyCode == 13 || e.keyCode == 10)) {
                jQuery('button.btn-large.waves-effect.waves-light.orange').click();
            }
        });
    }
}

/**
 * Internal function to get data from form.
 *
 * @param form
 * @param e
 * @return {string}
 */
function getDataFromForm(form, e) {
    return Array.from(new FormData(form), e => e.map(encodeURIComponent).join('=')).join('&');
}

(function (history) {
    var pushState = history.pushState;
    history.pushState = function (state) {
        if (typeof history.onpushstate == "function") {
            history.onpushstate({state: state});
        } else {
            if (localStorage.getItem('authkey') !== null) {
                switch (state) {
                    case LOCATION_TICKETS:
                        loadTicketsView();
                        break;
                    case LOCATION_TICKET:
                        loadTicketDetailView();
                        break;
                    case LOCATION_USER:
                        loadUserView(false);
                        break;
                    case LOCATION_NEW_TICKET:
                        loadNewTicketView();
                        break;
                }
            } else {
                switch (state) {
                    case LOCATION_REGISTER:
                        loadRegister();
                        break;
                    default:
                        logOutAndLoadLoginPage();
                        break;
                }
            }
            alignFooterByHeight();
            console.log(state);
        }
        return pushState.apply(history, arguments);
    }
})(window.history);

/**
 * This function is called in init. It loads the templates for the current url.
 */
function loadViewByUrl() {
    if (localStorage.getItem('authkey') !== null) {
        switch (window.location.pathname) {
            case PATHNAME_TICKETS:
                loadTicketsView();
                break;
            case PATHNAME_LOGIN:
                window.history.replaceState(LOCATION_TICKETS, 'Ticketliste', PATHNAME_TICKETS);
                loadTicketsView();
                break;
            case PATHNAME_NEW_TICKET:
                window.history.replaceState(LOCATION_NEW_TICKET, 'Neues Ticket erstellen', PATHNAME_NEW_TICKET);
                loadNewTicketView();
                break;
            case PATHNAME_USER:
                window.history.replaceState(LOCATION_USER, 'User', PATHNAME_USER);
                loadUserView();
                break;
            default:
                if (document.location.pathname.indexOf(PATHNAME_TICKET) == 0) {
                    window.history.replaceState(LOCATION_TICKETS, 'Ticketansicht', PATHNAME_TICKET + getTicketIdFromLocation());
                    loadTicketDetailView();
                } else {
                    window.history.replaceState(LOCATION_TICKETS, 'Ticketliste', PATHNAME_TICKETS);
                    loadTicketsView();
                }
                break;
        }
    } else {
        switch (window.location.pathname) {
            case PATHNAME_REGISTER:
                loadRegister();
                break;
            default:
                logOutAndLoadLoginPage();
                break;
        }
    }

    setTimeout(function () {
        $('.main').css('opacity', 1);
        $('.tooltipped').tooltip();
        new ClipboardJS('.copy');
        alignFooterByHeight();
    }, 200);
}

function getTicketIdFromLocation() {
    return window.location.pathname.split(PATHNAME_TICKET)[1];
}

function loadUserView(initEventHandlers = true) {
    showLoggedInElements();
    var requester;
    getUserById('', function (data) {
        requester = data[0]
    });
    $.get(TEMPLATE_DESTINATION + 'userview.mustache', function (template) {
        var email = requester['email'];
        var firstname = requester['firstname'];
        var lastname = requester['lastname'];
        var imageurl = requester['imageurl'];
        document.querySelector('.main').innerHTML = Mustache.render(template, {
            email: email,
            firstname: firstname,
            lastname: lastname,
            imageurl: imageurl
        });
    });
    setTimeout(function () {
        installColorPicker(initEventHandlers);
        installEventHandlersForTicketView(false);
    }, 200);
}

function loadRegister(initEventHandlers = true) {
    $.get(TEMPLATE_DESTINATION + 'registerview.mustache', function (template) {
        document.querySelector('.main').innerHTML = Mustache.render(template, {});
    });

    if (initEventHandlers === true) {
        setTimeout(function () {
            installRegisterFormEventHandlers();
        }, 200);
    }
}

/**
 * Logs the user out and therefore removes its authkey. It will also redirect to the main page.
 *
 * @param initEventHandlers
 */
function logOutAndLoadLoginPage(initEventHandlers = true) {
    $.get(TEMPLATE_DESTINATION + 'loginview.mustache', function (template) {
        document.querySelector('.main').innerHTML = Mustache.render(template, {});
    });

    window.history.replaceState(LOCATION_LOGIN, 'Login', PATHNAME_LOGIN);
    if (initEventHandlers === true) {
        setTimeout(function () {
            installLoginFormEventHandlers();
        }, 200);
    }

    if (localStorage.getItem('authkey') !== null) {
        localStorage.removeItem('authkey');
        sendToastInformation('Du wurdest erfolgreich ausgeloggt!');
    }
    logoutButton.css('display', 'none');
    ticketSearch.css('display', 'none');
    userButton.css('display', 'none');
}

function showLoggedInElements() {
    logoutButton.css('display', 'block');
    logoutButton.click(function () {
        logOutAndLoadLoginPage(false);
    });

    userButton.css('display', 'block');
    setTimeout(function () {
        userButton.click(function () {
            window.history.pushState(LOCATION_USER, 'Benutzer', PATHNAME_USER);
        });
    }, 200);

    ticketSearch.css('display', 'block');
}

/**
 * Loads the view where all tickets of the current user can be seen.
 */
function loadTicketsView() {
    showLoggedInElements();
    $.get(TEMPLATE_DESTINATION + 'ticketview.mustache', function (template) {
        var xhr = new XMLHttpRequest();
        var params = 'authkey=' + localStorage.getItem('authkey');
        var url = TICKETS_ENDPOINT + '?' + params;

        xhr.open('GET', url, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var tickets = JSON.parse(xhr.responseText);

                var requester = [];
                getUserById('', function (data) {
                    requester = data[0]
                });
                var count = 0;
                for (var ticket in tickets) {

                    var userData = [];
                    getUserById(tickets[ticket]['createdby'], function (data) {
                        userData = data[0];
                    });

                    if (userData['email'] === requester['email']) {
                        tickets[ticket]['firstname'] = 'Ihnen';
                        tickets[ticket]['lastname'] = '';
                    } else {
                        tickets[ticket]['firstname'] = userData['firstname'];
                        tickets[ticket]['lastname'] = userData['lastname'];
                    }

                    switch (tickets[ticket]['status']) {
                        case "1":
                            tickets[ticket]['status'] = "Offen";
                            tickets[ticket]['color'] = "red";
                            break;
                        case "2":
                            tickets[ticket]['status'] = "Wartend";
                            tickets[ticket]['color'] = "blue lighten-1";
                            break;
                        case "3":
                            tickets[ticket]['status'] = "Geschlossen";
                            tickets[ticket]['color'] = "";
                            break;
                    }
                    count++;
                }

                var hasTickets = count === 0;
                document.querySelector('.main').innerHTML = Mustache.render(template, {
                    tickets: tickets,
                    hasTickets: hasTickets
                });
            }
        };
        xhr.send();
    });
    setTimeout(function () {
        installEventHandlersForTicketView(false);
    }, 200);

}

/**
 * Loads the view where all tickets of the current user can be seen.
 */
function loadTicketDetailView() {
    showLoggedInElements();
    var ticketid;
    $.get(TEMPLATE_DESTINATION + 'ticketdetail.mustache', function (template) {
        var xhr = new XMLHttpRequest();
        ticketid = getTicketIdFromLocation();
        var params = 'authkey=' + localStorage.getItem('authkey') + '&ticketid=' + ticketid;
        var url = MESSAGES_ENDPOINT + '?' + params;

        xhr.open('GET', url, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var messages = JSON.parse(xhr.responseText).reverse();

                var ticketStatus = '';
                var ticketColor = '';
                messages.forEach(function (message) {
                    var createdat = new Date(message['createdat']);

                    message['day'] = DATE_NAMES[createdat.getDay()];
                    message['date'] = formatDate(createdat.getDate()) + '.' + formatDate(createdat.getMonth() + 1) + '.' +
                        createdat.getFullYear();
                    message['time'] = formatDate(createdat.getHours()) + ':' + formatDate(createdat.getMinutes());

                    var role = message['role'];
                    message['is-support'] = false;
                    if (role > 1) {
                        message['is-support'] = true;
                        message['role'] = ROLES[role];
                    }

                    switch (message['status']) {
                        case "1":
                            ticketStatus = "Offen";
                            ticketColor = "red";
                            break;
                        case "2":
                            ticketStatus = "Wartend";
                            ticketColor = "blue lighten-1";
                            break;
                        case "3":
                            ticketStatus = "Geschlossen";
                            ticketColor = "";
                            break;
                    }

                    if (message['isinternal'] === '0') {
                        message['class'] = 'grey lighten-5';
                    } else {
                        message['class'] = 'yellow lighten-4';
                    }
                });

                var title = messages[0]['title'];

                document.querySelector('.main').innerHTML = Mustache.render(template, {
                    messages: messages,
                    title: title,
                    ticketid: ticketid,
                    status: ticketStatus,
                    color: ticketColor
                });
            }
        };
        xhr.send();
    });
    setTimeout(function () {
        installEventHandlersForSendMessage(ticketid);
        installEventHandlersForTicketView(false);
    }, 200);

}

function formatDate(date) {
    return date.toString().padStart(2, '0');
}

function installEventHandlersForSendMessage(ticketid) {
    var createMessage = document.getElementById('createMessage');
    createMessage.action = CREATE_MESSAGE_ENDPOINT;

    createMessage.addEventListener("submit", function (e) {
        e.preventDefault();
        jQuery('form button').addClass('disabled');
        var loader;
        $.get(SNIPPET_DESTINATION + 'loader.mustache', function (template) {
            loader = Mustache.render(template, {});
        });
        setTimeout(function () {
            M.toast({
                html: '<div class="loading-toast">Die Nachricht wird gesendet...</div>' + loader,
                classes: 'rounded',
                displayLength: 150000
            });
        }, 200);

        var xhr = new XMLHttpRequest();
        var url = CREATE_MESSAGE_ENDPOINT;
        var params = getDataFromForm(createMessage, e) + "&authkey=" + localStorage.getItem('authkey') + '&ticketid=' + ticketid;

        xhr.open('POST', url, true);

        //Send the proper header information along with the request.
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var data = JSON.parse(xhr.responseText);

                jQuery('.toast.rounded').remove();
                if (data.result == true) {
                    window.history.pushState(LOCATION_TICKET, 'Ticket', PATHNAME_TICKET + ticketid);
                    M.toast({html: 'Die Nachricht wurde erfolgreich versandt!', classes: 'rounded'});
                } else {
                    M.toast({html: 'Etwas ist beim senden deiner Nachricht schief gelaufen!', classes: 'rounded'});
                }
            }
        };
        xhr.send(params);
    });

    $('#body').keydown(function (e) {
        if ((e.ctrlKey || e.metaKey) && (e.keyCode == 13 || e.keyCode == 10)) {
            jQuery('button.btn-large.waves-effect.waves-light.orange').click();
        }
    });
}

/**
 * This function will show an information that the user has copied the current ticket number.
 * @param {String} text Text that should be displayed.
 */
function sendToastInformation(text) {
    M.toast({html: text, classes: 'rounded'});
}

function getUserById(id, callback) {
    var xhr = new XMLHttpRequest();
    var params = 'authkey=' + localStorage.getItem('authkey') + '&userid=' + id;
    var url = USER_ENDPOINT + '?' + params;

    xhr.open('GET', url, false);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            callback(JSON.parse(xhr.responseText));
        }
    };
    xhr.send();
}

function installColorPicker(initEventHandlers = true) {
    if (initEventHandlers === true) {
        var nav = jQuery('nav.light-green.lighten-1');
        var navBackgroundColor = nav.css('background-color');

        var parent = document.querySelector('.designer');
        var picker = new Picker(parent);

        var chosenColor = null;

        picker.onClose = function () {
            var property = (chosenColor + ' !important');
            nav.attr('style', 'background-color:' + property);
            saveColorInLocalStorage(chosenColor);
        };

        picker.setColor(navBackgroundColor, true);
        parent.style.background = navBackgroundColor;

        /*
            You can do what you want with the chosen color using two callbacks: onChange and onDone.
        */
        picker.onChange = function (color) {
            chosenColor = color.rgbaString;
            parent.style.background = chosenColor;
        };
        colorPickerInitialized = true;
    }
}

function saveColorInLocalStorage(color) {
    localStorage.setItem('navigationColor', color);
}

function setColorByLocalStorage() {
    var navigationColor = localStorage.getItem('navigationColor');
    if (navigationColor !== null) {
        var property = (navigationColor + ' !important');
        jQuery('nav.light-green.lighten-1').attr('style', 'background-color:' + property);
    }
}

init();