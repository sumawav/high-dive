

var STILL = false;
var ROTATE = false;
// var WIREFRAME = false;
var LOG_KEYS = false;
var LOG_DRAW_CALLS = false;
var WORLD_ROTATE = 0;
var X_NUMBER = 16;
var Y_NUMBER = 16;
var Z_NUMBER = 0;
var MAP_N = 9;
var SPEED = 50;
var SCALE = 10;
var X = 0;
var Y = 0;
var Z = 0;
var TEXTURE_SCALE = 16;
var TEXTURE_SPEED = 0;
var BORDER_WIDTH = 10;
var PI = Math.PI;
var CAMERA_ANGLE = degToRad(0);
var CAMERA_RADIUS = 0;
var CAMERA_TILT = degToRad(77);
var CAMERA_X = MAP_N*X_NUMBER * SCALE / 2;
var CAMERA_Y = MAP_N*X_NUMBER * SCALE / 2;
var CAMERA_Z = SCALE*10;
var TEST = 0;
var CULL_FACE = true;
var FOV_ANGLE = degToRad(55);
function radToDeg(r) {
  return r * 180 / Math.PI;
}
function degToRad(d) {
  return d * Math.PI / 180;
}
