// IMPORTANT CONFIGURATIONS

/** @type {string} Change this to the API URL */
const API_URL = "http://api.dom.olo/src/api/Endpoints/";
const GET_DIR = "get/";
const POST_DIR = "post/";
const TEMPLATE_DESTINATION = '/web/templates/views/';

// ENDPOINTS
const VALIDATE_USER_ENDPOINT = API_URL + POST_DIR + "uservalidate.php";
const TICKETS_ENDPOINT = API_URL + GET_DIR + "tickets.php";
const USER_ENDPOINT = API_URL + GET_DIR + "user.php";

// LOCATIONS FOR HISTORY
const LOCATION_REGISTER = 'Register';
const LOCATION_TICKETS = 'Tickets';
const LOCATION_LOGIN = 'Login';

// PATH LOCATIONS
const PATHNAME_LOGIN = '/';
const PATHNAME_TICKETS = '/Tickets/';
const PATHNAME_REGISTER = '/Register/';

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
                        loadTicketView();
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
                loadTicketView();
                break;
            case PATHNAME_LOGIN:
                window.history.replaceState(LOCATION_TICKETS, 'Ticketliste', PATHNAME_TICKETS);
                loadTicketView();
                break;
            default:
                window.history.replaceState(LOCATION_TICKETS, 'Ticketliste', PATHNAME_TICKETS);
                loadTicketView();
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

function loadRegister() {
    $.get(TEMPLATE_DESTINATION + 'registerview.mustache', function (template) {
        document.querySelector('.main').innerHTML = Mustache.render(template, {});
    });
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

/**
 * Loads the view where all tickets of the current user can be seen.
 */
function loadTicketView() {
    logoutButton.css('display', 'block');
    logoutButton.click(function () {
        logOutAndLoadLoginPage(false);
    });
    $.get(TEMPLATE_DESTINATION + 'ticketview.mustache', function (template) {
        var xhr = new XMLHttpRequest();
        var params = 'authkey=' + localStorage.getItem('authkey');
        var url = TICKETS_ENDPOINT + '?' + params;

        xhr.open('GET', url, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var tickets = JSON.parse(xhr.responseText);

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
                }
                document.querySelector('.main').innerHTML = Mustache.render(template, {tickets: tickets});
            }
        };
        xhr.send();
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

init();