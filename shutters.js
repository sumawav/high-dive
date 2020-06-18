"use strict";

// Create a capturer that exports a WebM video
const capturer = new CCapture( {
  format: 'webm',
  framerate: 30,
  verbose: true
} );

const meter = new FPSMeter({right: 0, bottom: 0, left: 'auto', top: 'auto'});

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
  var reverseLightDirectionLocation = gl.getUniformLocation(programInfo.program, "u_reverseLightDirection");

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
      normal: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
      texcoord: {
        numComponents: 2,
        data: [
          0, 0, 1, 0, 0, 1, 1, 1
        ],
      },
      indices: [0, 1, 2, 2, 1, 3],
      world: {
        numComponents: 16,
        data: [],
      }
      // worldPosition: {
      //   numComponents: 3,
      //   data: [],
      // },
      // worldRotate: {
      //   numComponents: 3,
      //   data: [],
      // },
      // worldScale: {
      //   numComponents: 3,
      //   data: [],
      // }
    };
  }

  // const quadArrays = createXYQuadVertices(1);


  // const bufferInfo = twgl.createBufferInfoFromArrays(gl, quadArrays);

  // console.log(bufferInfo);

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

  var chunks = [];
  chunks.push(createChunk(0, 0, X_NUMBER, SCALE, terrain, textureInfos));
  chunks.push(createChunk(X_NUMBER*SCALE, 0, X_NUMBER, SCALE, terrain, textureInfos));
  chunks.push(createChunk(0, X_NUMBER*SCALE, X_NUMBER, SCALE, terrain, textureInfos));
  chunks.push(createChunk(X_NUMBER*SCALE, X_NUMBER*SCALE, X_NUMBER, SCALE, terrain, textureInfos));
  chunks.push(createChunk(X_NUMBER*SCALE, 2*X_NUMBER*SCALE, X_NUMBER, SCALE, terrain, textureInfos));
  chunks.push(createChunk(2*X_NUMBER*SCALE, X_NUMBER*SCALE, X_NUMBER, SCALE, terrain, textureInfos));
  chunks.push(createChunk(2*X_NUMBER*SCALE, 2*X_NUMBER*SCALE, X_NUMBER, SCALE, terrain, textureInfos));

  let allArrays = [];

  // make an array of all arrays
  chunks.forEach(function(chunk){
    chunk.forEach(function(drawInfo) {
      let translation = [drawInfo.x, drawInfo.y, drawInfo.z];
      let scale = [drawInfo.xScale, drawInfo.yScale, drawInfo.zScale];
      let arrays = createXYQuadVertices(1);
      let worldMatrix = m4.identity();
      let worldMatrixArray = twgl.primitives.createAugmentedTypedArray(16, 4);
      const quad_vertices = 4;

      // pre-calculate world matrix for every quad in chunk
      worldMatrix = m4.translate(worldMatrix, translation);
      worldMatrix = m4.rotateX(worldMatrix, drawInfo.xRot);
      worldMatrix = m4.rotateY(worldMatrix, drawInfo.yRot);
      worldMatrix = m4.rotateZ(worldMatrix, drawInfo.zRot);
      worldMatrix = m4.scale(worldMatrix, scale);

      for (let ii = 0; ii  < quad_vertices; ++ii) {
        worldMatrixArray.push(worldMatrix);
      }
      arrays.world.data = worldMatrixArray
      allArrays.push(arrays);
    });
  });
  console.log(allArrays);
  const combinedArrays = twgl.primitives.concatVertices(allArrays);
  console.log(combinedArrays);
  const chunksBufferInfo = twgl.createBufferInfoFromArrays(gl, combinedArrays);
  console.log(chunksBufferInfo);





  function update(deltaTime) {}

  // function draw() {
  //   twgl.resizeCanvasToDisplaySize(gl.canvas);
  //   gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  //   gl.clearColor(0.0, 0.0, 0.0, 1.0);
  //   // gl.depthMask(true);
  //   // gl.clearDepth(1);
  //   gl.clear(gl.COLOR_BUFFER_BIT);
  //   // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
  //   gl.enable(gl.CULL_FACE);
  //   gl.enable(gl.DEPTH_TEST);
  //   // gl.disable(gl.BLEND);
  //   // gl.enable(gl.BLEND);
  //   // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  //   var projectionMatrix = m4.perspective(FOV_ANGLE, gl.canvas.clientWidth / gl.canvas.clientHeight, 1, 2000);

  //   // Compute a matrix for the camera
  //   var cameraMatrix = m4.identity();
  //   cameraMatrix = m4.translate(cameraMatrix, [CAMERA_X, CAMERA_Y, CAMERA_Z]);
  //   cameraMatrix = m4.rotateZ(cameraMatrix, CAMERA_ANGLE);
  //   cameraMatrix = m4.translate(cameraMatrix, [0, -CAMERA_RADIUS * 2.5, CAMERA_RADIUS]);
  //   cameraMatrix = m4.rotateX(cameraMatrix, CAMERA_TILT);

  //   var viewMatrix = m4.inverse(cameraMatrix);
  //   var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

  //   gl.useProgram(programInfo.program);

  //   twgl.setUniforms(programInfo, {
  //     u_viewProjection: viewProjectionMatrix,
  //   });

  //   chunks.forEach(function(chunk){
  //     chunk.forEach(function(drawInfo) {
  //       var dstX      = drawInfo.x;
  //       var dstY      = drawInfo.y;
  //       var dstZ      = drawInfo.z;
  //       var dstWidth  = drawInfo.xScale;
  //       var dstHeight = drawInfo.yScale;
  //       var dstDepth  = drawInfo.zScale;
  //       // var srcX      = 0;
  //       // var srcY      = 0;
  //       // var srcWidth  = drawInfo.textureInfo.width;
  //       // var srcHeight = drawInfo.textureInfo.height;

  //       // this is how we're choosing a texture
  //       gl.bindTexture(gl.TEXTURE_2D, drawInfo.textureInfo.texture);

  //       twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

  //       // create world matrix
  //       var worldMatrix = m4.identity();
  //       worldMatrix = m4.translate(worldMatrix, [dstX, dstY, dstZ]);
  //       worldMatrix = m4.rotateX(worldMatrix, drawInfo.xRot);
  //       worldMatrix = m4.rotateY(worldMatrix, drawInfo.yRot);
  //       worldMatrix = m4.rotateZ(worldMatrix, drawInfo.zRot);
  //       worldMatrix = m4.scale(worldMatrix, [dstWidth, dstHeight, dstDepth]);

  //       var worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);
  //       var texMatrix = m4.identity();
  //       texMatrix = m4.scale(texMatrix, [dstWidth / SCALE, dstHeight / SCALE, 1]);

  //       gl.uniform1i(textureLocation, 0);

  //       twgl.setUniforms(programInfo, {
  //         u_worldViewProjection: worldViewProjectionMatrix,
  //         u_world: worldMatrix,
  //         u_textureMatrix: texMatrix,
  //       });

  //       twgl.drawBufferInfo(gl, bufferInfo);
  //     });
  //   });

  // }

  function draw2() {
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
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

    gl.bindTexture(gl.TEXTURE_2D, textureInfos.grass.texture);
    twgl.setBuffersAndAttributes(gl, programInfo, chunksBufferInfo);

    var texMatrix = m4.identity();
    // texMatrix = m4.scale(texMatrix, [dstWidth / SCALE, dstHeight / SCALE, 1]);

    gl.uniform1i(textureLocation, 0);

    twgl.setUniforms(programInfo, {
      u_viewProjection: viewProjectionMatrix,
      u_textureMatrix: texMatrix,
    });

    twgl.drawBufferInfo(gl, chunksBufferInfo);
  }


  var then = 0;
  function render(time) {
    var now = time * 0.001;
    var deltaTime = Math.min(0.1, now - then);
    then = now;

    update(deltaTime);
    draw2();

    capturer.capture(canvas);
    meter.tick();

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}


main();
