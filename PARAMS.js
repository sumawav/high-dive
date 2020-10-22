

let GLOBAL_CLOCK = 0;

// let STILL = false;
let ROTATE = false;
// let WIREFRAME = false;
let ANIMATED_WATER = true;
let WORLD_LOOPING = true
let LOG_KEYS = false;
let LOG_DRAW_CALLS = false;
let WORLD_ROTATE = 0;
let CHUNK_N = 16;
// let Y_NUMBER = 16;
let Z_NUMBER = 0;
let MAP_N = 9;
let SPEED = 20;
let SCALE = 10;
let X = 0;
let Y = 0;
let Z = 0;
// let TEXTURE_SCALE = 16;
// let TEXTURE_SPEED = 0;
// let BORDER_WIDTH = 10;
let PI = Math.PI;
let CAMERA_ANGLE = degToRad(0);
let CAMERA_RADIUS = 32;
let CAMERA_TILT = degToRad(75);
let CAMERA_X = MAP_N*CHUNK_N * SCALE / 2;
let CAMERA_Y = MAP_N*CHUNK_N * SCALE / 2;
let CAMERA_Z = 135;
let TEST = 0;
let CULL_FACE = true;
let FOV_ANGLE = degToRad(55);
function radToDeg(r) {
  return r * 180 / Math.PI;
}
function degToRad(d) {
  return d * Math.PI / 180;
}
