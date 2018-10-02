/** @type {string} Change this to the API URL */
const API_URL = "http://api.dom.olo/src/Endpoints/";
const GET_DIR = "get/";
const POST_DIR = "post/";

const VALIDATE_USER_ENDPOINT = API_URL + POST_DIR + "uservalidate.php";

document.getElementById('registerForm').action = VALIDATE_USER_ENDPOINT;