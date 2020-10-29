let MAP_N = 23;
let TEST_X = -Math.floor(MAP_N/2) + 1;
let TEST_Y = Math.floor(MAP_N/2) - 1;

TEST_X * 0
TEST_Y * 0

let GLOBAL_CLOCK = 0;
let ROTATE = false;
let ANIMATED_WATER = true;
let WORLD_LOOPING = true
let LOG_KEYS = false;
let LOG_DRAW_CALLS = false;
let WORLD_ROTATE = 0;
let CHUNK_N = 16;

let Z_NUMBER = 0;
let SPEED = 20;
let SCALE = 10;
let X = 0;
let Y = 0;
let Z = 0;

let PI = Math.PI;
let CAMERA_ANGLE = degToRad(0);
let CAMERA_RADIUS = 32;
let CAMERA_TILT = degToRad(90);
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
