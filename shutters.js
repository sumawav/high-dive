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
  const vertexShaderScript = document.getElementById("drawImage-vertex-shader2");
  const fragmentShaderScript = document.getElementById("drawImage-fragment-shader");
  const programInfo = twgl.createProgramInfo(gl, [vertexShaderScript.text, fragmentShaderScript.text]);

  // lookup a few uniforms
  var textureLocation = gl.getUniformLocation(programInfo.program, "u_texture");
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
  };


  let createWorld = function(n) {
    let chunks = [];
    let atlas = [];
    let N = n || 16;
    let offset = [0, 0];

    const addAtlas = function(e) {
      atlas = e;
    }

    const getAtlas = function() {
      return atlas;
    }

    const addChunk = function(chunk){
      chunks.push(chunk);
    }

    const updateOffset = function(x,y){
      const newOffsetX = x;
      const newOffsetY = y;
      if (newOffsetX > offset[0]){
        console.log("X+");
      } else if (newOffsetX < offset[0]){
        console.log("X-");
      }
      if (newOffsetY > offset[1]){
        console.log("Y+");
      } else if (newOffsetY < offset[1]){
        console.log("Y-");
      }
      offset[0] = newOffsetX;
      offset[1] = newOffsetY;
    }

    const getMap = () => {
      let worldMap = [];
      for(let ii = 0; ii < atlas.length; ++ii) {
        let x = ii % N;
        let y = Math.floor(ii / N);

        let bufferArray = chunks[atlas[ii]];

        bufferArray.forEach(function(item){
          worldMap.push({
            buffer: item.buffer,
            texture: item.texture,
            worldPosition: [x * X_NUMBER * SCALE, y * X_NUMBER * SCALE, 0],
          });
        });
      }
      return worldMap;
    }

    return {
      getAtlas: getAtlas,
      addAtlas: addAtlas,
      addChunk: addChunk,
      getMap: getMap,
      updateOffset: updateOffset,
    }
  };

  let world = createWorld(MAP_N);
  world.addChunk(createChunk(
    0, 
    0, 
    X_NUMBER, 
    SCALE, 
    getEmptyTerrain(),
    textureInfos
  ));
  world.addChunk(createChunk(
    0, 
    0, 
    X_NUMBER, 
    SCALE, 
    getTerrainB(),
    textureInfos
  ));
  world.addChunk(createChunk(
    0, 
    0, 
    X_NUMBER, 
    SCALE, 
    getTerrainA(),
    textureInfos
  ));
  // world.addChunk(chunks[1]);
  world.addAtlas([
    0,0,0,0,0,0,0,0,0,
    0,2,0,0,0,0,0,2,0,
    0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,
    0,0,0,0,1,0,0,0,0,
    0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,
    0,2,0,0,0,0,0,2,0,
    0,0,0,0,0,0,0,0,0,
  ]);

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
    let newOffsetX = Math.floor(CAMERA_X / (X_NUMBER * SCALE));
    let newOffsetY = Math.floor(CAMERA_Y / (Y_NUMBER * SCALE));
    // console.log(newOffsetX, newOffsetY);
    world.updateOffset(newOffsetX, newOffsetY);
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

    var projectionMatrix = m4.perspective(FOV_ANGLE, gl.canvas.clientWidth / gl.canvas.clientHeight, 1, 2000);
    var cameraMatrix = m4.identity();
    cameraMatrix = m4.translate(cameraMatrix, [CAMERA_X, CAMERA_Y, CAMERA_Z]);
    cameraMatrix = m4.rotateZ(cameraMatrix, CAMERA_ANGLE);
    cameraMatrix = m4.translate(cameraMatrix, [0, -CAMERA_RADIUS * 2.5, CAMERA_RADIUS]);
    cameraMatrix = m4.rotateX(cameraMatrix, CAMERA_TILT);

    var viewMatrix = m4.inverse(cameraMatrix);
    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    gl.useProgram(programInfo.program);

    let draw_calls = 0;
    
    // console.log("all buffers length: ", allBuffers.length);

    allBuffers.forEach(function(item){
      gl.bindTexture(gl.TEXTURE_2D, item.texture);
      twgl.setBuffersAndAttributes(gl, programInfo, item.buffer);
  
      var texMatrix = m4.identity(); // not actually needed
  
      gl.uniform1i(textureLocation, 0);
  
      twgl.setUniforms(programInfo, {
        u_viewProjection: viewProjectionMatrix,
        u_textureMatrix: texMatrix,
        u_worldPosition: item.worldPosition,
      });
  
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