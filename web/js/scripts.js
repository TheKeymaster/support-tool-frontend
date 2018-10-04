// IMPORTANT CONFIGURATIONS

/** @type {string} Change this to the API URL */
const API_URL = "http://api.dom.olo/src/api/Endpoints/";
const GET_DIR = "get/";
const POST_DIR = "post/";
const TEMPLATE_DESTINATION = '/web/templates/views/';

// ENDPOINTS
const VALIDATE_USER_ENDPOINT = API_URL + POST_DIR + "uservalidate.php";
const TICKETS_ENDPOINT = API_URL + GET_DIR + "tickets.php";

// LOCATIONS FOR HISTORY
const LOCATION_TICKETS = 'Tickets';

// PATH LOCATIONS
const PATHNAME_LOGIN = '/';
const PATHNAME_TICKETS = '/Tickets/';

var registerForm = document.getElementById('registerForm');
var logoutButton = $('.logout-button');

registerForm.action = VALIDATE_USER_ENDPOINT;

registerForm.addEventListener("submit", function(e){
    e.preventDefault();

    var xhr = new XMLHttpRequest();
    var url = VALIDATE_USER_ENDPOINT;
    var params = getDataFromForm(registerForm, e);

    xhr.open('POST', url, true);

    //Send the proper header information along with the request.
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4 && xhr.status == 200) {
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

function getDataFromForm(form, e) {
    return Array.from(new FormData(form), e => e.map(encodeURIComponent).join('=')).join('&');
}

(function(history){
    var pushState = history.pushState;
    history.pushState = function(state) {
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
                logOutAndLoadLoginPage();
            }
            console.log(state);
        }
        return pushState.apply(history, arguments);
    }
})(window.history);

window.onpopstate = function () {
    loadViewByUrl();
};

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
        logOutAndLoadLoginPage();
    }
    $('.main').css('opacity', 1);
}

function logOutAndLoadLoginPage() {
    if (document.querySelectorAll('h1.header.center.orange-text.login').length === 0) {
        $.get(TEMPLATE_DESTINATION + 'loginview.mustache', function(template) {
            document.querySelector('.main').innerHTML = Mustache.render(template, {});
        });

        localStorage.removeItem('authkey');
        logoutButton.css('display', 'none');
    }
}

function loadTicketView() {
    logoutButton.css('display', 'block');
    logoutButton.click(function () {
        logOutAndLoadLoginPage();
    });
    $.get(TEMPLATE_DESTINATION + 'ticketview.mustache', function(template) {
        var xhr = new XMLHttpRequest();
        var params = 'authkey=' + localStorage.getItem('authkey');
        var url = TICKETS_ENDPOINT + '?' + params;

        xhr.open('GET', url, true);

        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4 && xhr.status == 200) {
                var tickets = JSON.parse(xhr.responseText);

                for (var ticket in tickets) {
                    switch(tickets[ticket]['status']) {
                        case "1":
                            tickets[ticket]['status'] = "Offen";
                            tickets[ticket]['color'] = "green";
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

function sendCopyToast() {
    M.toast({html: 'Ticketnummer kopiert!', classes: 'rounded'});
}

(function($){
    $(function(){
        $('.sidenav').sidenav();
    });
})(jQuery);

$(document).ready(function(){
    setTimeout(function() {
        $('.tooltipped').tooltip();
    }, 300);
});

loadViewByUrl();
new ClipboardJS('.copy');