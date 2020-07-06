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

function main() {
  const canvas = document.getElementById("canvas");
  const gl = canvas.getContext("webgl");
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

  function createXYQuadVertices(size, xOffset, yOffset) {
    size = size || 2;
    xOffset = xOffset || 0;
    yOffset = yOffset || 0;
    size *= 0.5;
    return {
      position: {
        numComponents: 2,
        data: [
          xOffset + -1 * size, yOffset + -1 * size,
          xOffset + 1 * size, yOffset + -1 * size,
          xOffset + -1 * size, yOffset + 1 * size,
          xOffset + 1 * size, yOffset + 1 * size,
        ]
      },
      normal: {
        numComponents: 3,
        data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]
      },
      texcoord: {
        numComponents: 2,
        data: [
          0, 0, 1, 0, 0, 1, 1, 1
        ],
      },
      indices: [0, 1, 2, 2, 1, 3],
      chunk: {
        numComponents: 16,
        data: [],
      },
    };
  }

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
  };

  // let chunks = [];

  // for (let ii = 0; ii < CHUNK_N; ++ii) {
  //   for (let jj = 0; jj < CHUNK_N; ++jj) {
  //     let terrain;
  //     // if (Math.floor(Math.random()*9) === 5) {
  //     //   if (Math.floor(Math.random()*2) === 0) {
  //     //     terrain = getTerrainA();
  //     //   } else {
  //     //     terrain = getTerrainB();
  //     //   }
  //     // } else {
  //     //   terrain = getEmptyTerrain();
  //     // }
  //     terrain = getTerrainB();
  //     chunks.push(createChunk(
  //       0, 
  //       0, 
  //       X_NUMBER, 
  //       SCALE, 
  //       terrain, 
  //       textureInfos
  //     ));
  //   }
  // }

  let createWorld = function(n) {
    let chunks = [];
    let atlas = [];
    let N = n || 16;

    const addAtlas = function(e) {
      atlas = e;
    }

    const getAtlas = function() {
      return atlas;
    }

    const addChunk = function(chunk){
      chunks.push(chunk);
    }

    const getMap = () => {

      let worldMap = [];

      for(let ii = 0; ii < atlas.length; ++ii) {
        let x = ii % N;
        let y = Math.floor(ii / N);
        worldMap.push({
          chunk: chunks[atlas[ii]],
          x: x,
          y: y,
        })
      }

      return worldMap;
    }

    return {
      getAtlas: getAtlas,
      addAtlas: addAtlas,
      addChunk: addChunk,
      getMap: getMap,
    }
  };

  let world = createWorld(MAP_N);
  world.addChunk(createChunk(
    0, 
    0, 
    X_NUMBER, 
    SCALE, 
    getEmptyTerrain()
  ));
  world.addChunk(createChunk(
    0, 
    0, 
    X_NUMBER, 
    SCALE, 
    getTerrainB()
  ));
  // world.addChunk(chunks[1]);
  world.addAtlas([
    0,0,0,0,0,0,0,0,0,
    0,1,0,0,0,0,0,1,0,
    0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,
    0,0,0,0,1,0,0,0,0,
    0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,
    0,1,0,0,0,0,0,1,0,
    0,0,0,0,0,0,0,0,0,
  ]);

  let testChunks = world.getMap();

  console.log(testChunks);

  // make buffers for all chunks
  let allBuffers = [];
  testChunks.forEach(function(mapPiece){
  // chunks.forEach(function(chunk){

    let tileArrays = [];
    let wallArrays = [];
    let waterArrays = [];

    const doThings = function(tile) {
      let translation = [tile.x, tile.y, tile.z];
      let scale = [tile.xScale, tile.yScale, tile.zScale];
      let arrays = createXYQuadVertices(1);
      let chunkMatrix = m4.identity();
      let chunkMatrixArray = twgl.primitives.createAugmentedTypedArray(16, 4);
      const quad_vertices = 4;

      // pre-calculate world matrix for every quad in chunk 
      chunkMatrix = m4.translate(chunkMatrix, translation);
      chunkMatrix = m4.rotateX(chunkMatrix, tile.xRot);
      chunkMatrix = m4.rotateY(chunkMatrix, tile.yRot);
      chunkMatrix = m4.rotateZ(chunkMatrix, tile.zRot);
      chunkMatrix = m4.scale(chunkMatrix, scale);

      for (let ii = 0; ii  < quad_vertices; ++ii) {
        chunkMatrixArray.push(chunkMatrix);

        // scale texcoordinates
        arrays.texcoord.data[2 * ii] *= tile.xScale / SCALE;
        arrays.texcoord.data[(2 * ii) + 1] *= tile.yScale / SCALE;
      }
      arrays.chunk.data = chunkMatrixArray
      return arrays;
    }

    mapPiece.chunk.tilesNotWaters.forEach(function(tiles){
      tileArrays.push(doThings(tiles));
    });

    mapPiece.chunk.walls.forEach(function(tiles){
      wallArrays.push(doThings(tiles));
    });

    mapPiece.chunk.waters.forEach(function(tiles){
      waterArrays.push(doThings(tiles));
    });

    // if (tileArrays.length === 0)
    //   return;
    if (mapPiece.chunk.tilesNotWaters.length > 0){
      let combinedTileArrays = twgl.primitives.concatVertices(tileArrays);
      const tilesBufferInfo = twgl.createBufferInfoFromArrays(gl, combinedTileArrays);
      allBuffers.push({
        buffer: tilesBufferInfo,
        texture: textureInfos.grass.texture,
        worldPosition: [X_NUMBER*SCALE*mapPiece.x, X_NUMBER*SCALE*mapPiece.y, 0],
      });
    }
    if (mapPiece.chunk.walls.length > 0){
      let combinedWallArrays = twgl.primitives.concatVertices(wallArrays);
      const wallsBufferInfo = twgl.createBufferInfoFromArrays(gl, combinedWallArrays);
      allBuffers.push({
        buffer: wallsBufferInfo,
        texture: textureInfos.dirt.texture,
        worldPosition: [X_NUMBER*SCALE*mapPiece.x, X_NUMBER*SCALE*mapPiece.y, 0],
      });
    }
    if (mapPiece.chunk.waters.length > 0) {
      let combinedWaterArrays = twgl.primitives.concatVertices(waterArrays);
      const watersBufferInfo = twgl.createBufferInfoFromArrays(gl, combinedWaterArrays);
      allBuffers.push({
        buffer: watersBufferInfo,
        texture: textureInfos.tile.texture,
        worldPosition: [X_NUMBER*SCALE*mapPiece.x, X_NUMBER*SCALE*mapPiece.y, 0],
      });
    }
  });

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