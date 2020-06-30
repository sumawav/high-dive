document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;
var leftRotate = false;
var rightRotate = false;
var risePressed = false;
var sinkPressed = false;
var shiftPressed = false

function keyDownHandler(event) {
    if (LOG_KEYS) {
        console.log(event.keyCode);
    }
    if (event.keyCode == 16) { // SHIFT
        shiftPressed = true;
    }
    if(event.keyCode == 68) { //d
        rightPressed = true;
    }
    else if(event.keyCode == 65) { //a
        leftPressed = true;
    }
    if(event.keyCode == 83) { //s
    	downPressed = true;
    }
    else if(event.keyCode == 87) { //w
    	upPressed = true;
    }
    if(event.keyCode === 81) { //q
        leftRotate = true;
    } 
    else if (event.keyCode == 69) { //e
        rightRotate = true;
    }
    if (event.keyCode == 90) { //z
        risePressed = true;
    }
    else if (event.keyCode == 88) { //x
        sinkPressed = true;
    }
}

function keyUpHandler(event) {
    if (event.keyCode == 16) { // SHIFT
        shiftPressed = false;
    }
    if(event.keyCode == 68) {
        rightPressed = false;
    }
    else if(event.keyCode == 65) {
        leftPressed = false;
    }
    if(event.keyCode == 83) {
    	downPressed = false;
    }
    else if(event.keyCode == 87) {
    	upPressed = false;
    }
    if(event.keyCode === 81) {
        leftRotate = false;
    } 
    else if (event.keyCode == 69) {
        rightRotate = false;
    }
    if (event.keyCode == 90) { //z
        risePressed = false;
    }
    else if (event.keyCode == 88) { //x
        sinkPressed = false;
    }
}