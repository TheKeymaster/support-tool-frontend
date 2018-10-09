// IMPORTANT CONFIGURATIONS

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
const TICKETS_ENDPOINT = API_URL + GET_DIR + "tickets.php";
const USER_ENDPOINT = API_URL + GET_DIR + "user.php";

// LOCATIONS FOR HISTORY
const LOCATION_REGISTER = 'Register';
const LOCATION_TICKETS = 'Tickets';
const LOCATION_LOGIN = 'Login';
const LOCATION_NEW_TICKET = 'New';

// PATH LOCATIONS
const PATHNAME_LOGIN = '/';
const PATHNAME_TICKETS = '/Tickets/';
const PATHNAME_REGISTER = '/Register/';
const PATHNAME_NEW_TICKET = '/New/';

/** @var {Element} logoutButton */
var logoutButton;

/**
 * Initializes important things on first page load.
 */
function init() {
    logoutButton = $('.logout-button');

    window.onpopstate = function () {
        loadViewByUrl();
    };

    (function ($) {
        $(function () {
            $('.sidenav').sidenav();
        });
    })(jQuery);

    loadViewByUrl(true);
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
}

function loadNewTicketView(initEventHandlers = true) {
    showLogoutButton();
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
            var loader;
            $.get(SNIPPET_DESTINATION + 'loader.mustache', function (template) {
                loader = Mustache.render(template, {});
            });
            setTimeout(function () {
                M.toast({html: 'Das Ticket wird soeben erstellt...  ' + loader, classes: 'rounded'});
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

                    if (data.result == true) {
                        window.history.pushState(LOCATION_TICKETS, 'Ticketliste', PATHNAME_TICKETS);
                        jQuery('.toast.rounded').remove();
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
            console.log(state);
        }
        return pushState.apply(history, arguments);
    }
})(window.history);

/**
 * This function is called in init. It loads the tempaltes for the current url.
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
            default:
                window.history.replaceState(LOCATION_TICKETS, 'Ticketliste', PATHNAME_TICKETS);
                loadTicketsView();
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

    localStorage.removeItem('authkey');
    logoutButton.css('display', 'none');
}

function showLogoutButton() {
    logoutButton.css('display', 'block');
    logoutButton.click(function () {
        logOutAndLoadLoginPage(false);
    });
}

/**
 * Loads the view where all tickets of the current user can be seen.
 */
function loadTicketsView() {
    showLogoutButton();
    $.get(TEMPLATE_DESTINATION + 'ticketview.mustache', function (template) {
        var xhr = new XMLHttpRequest();
        var params = 'authkey=' + localStorage.getItem('authkey');
        var url = TICKETS_ENDPOINT + '?' + params;

        xhr.open('GET', url, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var tickets = JSON.parse(xhr.responseText);

                var count = 0;
                for (var ticket in tickets) {

                    var userData = [];
                    getUserById(tickets[ticket]['createdby'], function (data) {
                        userData = data[0];
                    });

                    tickets[ticket]['firstname'] = userData['firstname'];
                    tickets[ticket]['lastname'] = userData['lastname'];

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
                document.querySelector('.main').innerHTML = Mustache.render(template, {tickets: tickets, hasTickets: hasTickets});
            }
        };
        xhr.send();
    });
    setTimeout(function () {
        installEventHandlersForTicketView(false);
    }, 200);

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

init();