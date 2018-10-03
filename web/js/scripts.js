/** @type {string} Change this to the API URL */
const API_URL = "http://api.dom.olo/src/api/Endpoints/";
const GET_DIR = "get/";
const POST_DIR = "post/";

const VALIDATE_USER_ENDPOINT = API_URL + POST_DIR + "uservalidate.php";

const LOCATION_TICKETS = 'Tickets';

var registerForm = document.getElementById('registerForm');

registerForm.action = VALIDATE_USER_ENDPOINT;

registerForm.addEventListener("submit", function(e){
    e.preventDefault();

    var xhr = new XMLHttpRequest();
    var url = API_URL + POST_DIR + "uservalidate.php";
    var params = getDataFromForm(registerForm, e);

    xhr.open('POST', url, true);

    //Send the proper header information along with the request.
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4 && xhr.status == 200) {
            var data = JSON.parse(xhr.responseText);

            if (data.result == true) {
                localStorage.setItem('authkey', data.authkey);
                window.history.pushState(LOCATION_TICKETS, 'Ticketliste', '/Tickets/');
                M.toast({html: 'Anmeldedaten sind korrekt!', classes: 'rounded'});
            } else {
                M.toast({html: 'Bitte prüfe deine Anmeldedaten!', classes: 'rounded'});
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
            switch(state) {
                case LOCATION_TICKETS:
                    loadTicketView();
                    break;
                default:
                    logOutAndGoToLoginPage();
                    break;
            }
            console.log(state);
        }
        return pushState.apply(history, arguments);
    }
})(window.history);

function logOutAndGoToLoginPage() {
    localStorage.removeItem('authkey');
    window.location.pathname = '/';
}

function loadTicketView() {

}