"use strict";

// Create a capturer that exports a WebM video
const capturer = new CCapture( {
  format: 'webm',
  framerate: 30,
  verbose: true
} );

const meter = new FPSMeter();

const m4 = twgl.m4;
const v3 = twgl.v3;
twgl.setAttributePrefix('a_');

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");


function main() {
  if (!gl) {
    return;
  }  
  twgl.resizeCanvasToDisplaySize(gl.canvas);

  // setup GLSL program
  const vertexShaderScript = document.getElementById("general-vertex-shader");
  const waterVertexShaderScript = document.getElementById("water-vertex-shader");
  const fragmentShaderScript = document.getElementById("drawImage-fragment-shader");
  const programInfo = twgl.createProgramInfo(gl, [vertexShaderScript.text, fragmentShaderScript.text]);

  const waterProgramInfo = twgl.createProgramInfo(gl, [waterVertexShaderScript.text, fragmentShaderScript.text]);

  // lookup a few uniforms
  // var textureLocation = gl.getUniformLocation(programInfo.program, "u_texture");
  // var reverseLightDirectionLocation = gl.getUniformLocation(programInfo.program, "u_reverseLightDirection");



  var textureInfos = {
    "grass": {
      texture: twgl.createTexture(gl, {src: 'texture_01.png', mag: gl.NEAREST, wrap: gl.REPEAT }),
      width: 16,
      height: 16,
    },
    "dirt": {
      texture: twgl.createTexture(gl, {src: 'texture_02.png', mag: gl.NEAREST, wrap: gl.REPEAT }),
      width: 16,
      height: 16,
    },
    "tile": {
      texture: twgl.createTexture(gl, {src: 'texture_00.png'}),
      width: 16,
      height: 16,
    },    
    "water": {
      texture: twgl.createTexture(gl, {src: 'texture_03.png', mag: gl.NEAREST, wrap: gl.REPEAT }),
      width: 16,
      height: 16,
    },
    "waterWall": {
      texture: twgl.createTexture(gl, {src: 'texture_04.png', mag: gl.NEAREST, wrap: gl.REPEAT }),
      width: 16,
      height: 16,
    },
  };




  let world = createWorld(MAP_N);
  world.addChunk(createChunk( CHUNK_N, SCALE, getEmptyTerrain(), textureInfos, programInfo, waterProgramInfo));
  world.addChunk(createChunk( CHUNK_N, SCALE, getTerrainB(),     textureInfos, programInfo, waterProgramInfo));
  world.addChunk(createChunk( CHUNK_N, SCALE, getTerrainA(),     textureInfos, programInfo, waterProgramInfo));
  world.addChunk(createChunk( CHUNK_N, SCALE, getTerrainC(),     textureInfos, programInfo, waterProgramInfo));
  world.addChunk(createChunk( CHUNK_N, SCALE, getTerrainD(),     textureInfos, programInfo, waterProgramInfo));

  world.addAtlas([
    randInt(4),randInt(4),randInt(4),randInt(4),randInt(4),
    randInt(4),randInt(4),randInt(4),0,0,
    0,0,0,0,randInt(4),
    0,0,0,randInt(4),0,
    randInt(4),0,0,0,0,
  ]);
  if (WORLD_LOOPING){
    world.setcb(function(){
      mapChunks = world.getMap();
      allBuffers = mapChunks;
    });
  }
  
  

  let mapChunks = world.getMap();

  // make buffers for all chunks
  let allBuffers = mapChunks;

  console.log(allBuffers);

  allBuffers = mapChunks;

  function update(deltaTime) {
    let cameraSpeed = shiftPressed ? 0.1*SPEED : SPEED;
    let moveSpeed = cameraSpeed * SCALE;
    if (rightPressed){
      CAMERA_X += moveSpeed * deltaTime * Math.cos(CAMERA_ANGLE);
      CAMERA_Y += moveSpeed * deltaTime * Math.sin(CAMERA_ANGLE);
    }
    if (leftPressed){
      CAMERA_X -= moveSpeed * deltaTime * Math.cos(CAMERA_ANGLE);
      CAMERA_Y -= moveSpeed * deltaTime * Math.sin(CAMERA_ANGLE);
    }
    if (upPressed){
      CAMERA_Y += moveSpeed * deltaTime * Math.cos(CAMERA_ANGLE);
      CAMERA_X -= moveSpeed * deltaTime * Math.sin(CAMERA_ANGLE);
    }
    if (downPressed){
      CAMERA_Y -= moveSpeed * deltaTime * Math.cos(CAMERA_ANGLE);
      CAMERA_X += moveSpeed * deltaTime * Math.sin(CAMERA_ANGLE);
    }
    if (leftRotate){
      CAMERA_ANGLE += deltaTime * cameraSpeed/SPEED;
    }
    if (rightRotate){
      CAMERA_ANGLE -= deltaTime * cameraSpeed/SPEED;
    }
    if (risePressed){
      CAMERA_Z += deltaTime * moveSpeed;
    }
    if (sinkPressed){
      CAMERA_Z -= deltaTime * moveSpeed;
    }
    let newcoordX = Math.floor(CAMERA_X / (CHUNK_N * SCALE));
    let newcoordY = Math.floor(CAMERA_Y / (CHUNK_N * SCALE));
    world.updateOffset(newcoordX, newcoordY);
  }

  function draw() {
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // gl.clearColor(104/255, 134/255, 197/255, 1.0);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    // gl.depthMask(true);
    // gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    // gl.disable(gl.BLEND);
    // gl.enable(gl.BLEND);
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    var projectionMatrix = m4.perspective(FOV_ANGLE, gl.canvas.clientWidth / gl.canvas.clientHeight, 1, 1000);
    var cameraMatrix = m4.identity();
    cameraMatrix = m4.translate(cameraMatrix, [CAMERA_X, CAMERA_Y, CAMERA_Z]);
    cameraMatrix = m4.rotateZ(cameraMatrix, CAMERA_ANGLE);
    cameraMatrix = m4.translate(cameraMatrix, [0, -CAMERA_RADIUS * 2.5, CAMERA_RADIUS]);
    cameraMatrix = m4.rotateX(cameraMatrix, CAMERA_TILT);

    var viewMatrix = m4.inverse(cameraMatrix);
    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    // gl.useProgram(programInfo.program);

    let draw_calls = 0;
    
    // console.log("all buffers length: ", allBuffers.length);

    let lastType = null;

    allBuffers.forEach(function(item){

      if (item.type !== lastType){
        lastType = item.type;
        
        gl.useProgram(item.programInfo.program);
        gl.bindTexture(gl.TEXTURE_2D, item.texture);

        var textureLocation = gl.getUniformLocation(item.programInfo.program, "u_texture");
        gl.uniform1i(textureLocation, 0);

      }
        var texMatrix = m4.identity(); // needed?
        twgl.setUniforms(item.programInfo, {
          u_viewProjection: viewProjectionMatrix,
          u_textureMatrix: texMatrix,
          u_worldPosition: item.worldPosition,
          // u_texture: 0,
        });

        twgl.setBuffersAndAttributes(gl, programInfo, item.buffer);
  
      twgl.drawBufferInfo(gl, item.buffer);
      draw_calls++;
    });
    if (LOG_DRAW_CALLS){
      console.log("draw calls: ", draw_calls);
    }
  }

  var then = 0;
  function render(time) {
    var now = time * 0.001;
    var deltaTime = Math.min(0.1, now - then);
    then = now;

    update(deltaTime);
    draw();

    capturer.capture(canvas);
    meter.tick();

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();