"use strict";

// Create a capturer that exports a WebM video
var capturer = new CCapture( {
  format: 'webm',
  framerate: 30,
  verbose: true
} );

var canvas;
var gl;

const m4 = twgl.m4;
const v3 = twgl.v3;

function main() {
  // Get A WebGL context
  canvas = document.getElementById("canvas");
  gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  twgl.resizeCanvasToDisplaySize(gl.canvas);

  // setup GLSL program
  const vertexShaderScript = document.getElementById("drawImage-vertex-shader");
  const fragmentShaderScript = document.getElementById("drawImage-fragment-shader");
  const programInfo = twgl.createProgramInfo(gl, [vertexShaderScript.text, fragmentShaderScript.text]);

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(programInfo.program, "a_position");
  var texcoordLocation = gl.getAttribLocation(programInfo.program, "a_texcoord");
  var normalLocation   = gl.getAttribLocation(programInfo.program, "a_normal");

  // lookup uniforms
  var worldViewProjectionLocation =
      gl.getUniformLocation(programInfo.program, "u_worldViewProjection");
  var worldLocation = gl.getUniformLocation(programInfo.program, "u_world");
  var textureMatrixLocation = gl.getUniformLocation(programInfo.program, "u_textureMatrix");
  var textureLocation = gl.getUniformLocation(programInfo.program, "u_texture");
  var reverseLightDirectionLocation = gl.getUniformLocation(programInfo.program, "u_reverseLightDirection");


  // Create a buffer.
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  var positions = [
    0, 0, 0,
    1, 0, 0,
    0, 1, 0,
    1, 0, 0,
    1, 1, 0,
    0, 1, 0,
  ];

  var matrix = m4.identity();
  // matrix = m4.translate(matrix, [-0.5, -0.5, 0, 0]);
  for (var ii = 0; ii < positions.length; ii += 3) {
    var vector = m4.transformPoint(matrix, [positions[ii + 0], positions[ii + 1], positions[ii + 2], 1]);
    positions[ii + 0] = vector[0];
    positions[ii + 1] = vector[1];
    positions[ii + 2] = vector[2];
  }

  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Create buffer for normals
  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

  var normals = [
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
  ];

  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

  // Create a buffer for texture coords
  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

  var texcoords = [
    0, 0,
    1, 0,
    0, 1,
    1, 0,
    1, 1,
    0, 1,
  ];

  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

  const quadArrays = {
    a_position: { numComponents: 3, data: positions },
    a_normal:   { numComponents: 2, data: normals },
    a_texcoord: { numComponents: 2, data: texcoords },
  };

  const bufferInfo = twgl.createBufferInfoFromArrays(gl, quadArrays);
  console.log(bufferInfo);

  var textureInfos = {
    "grass": {
      texture: twgl.createTexture(gl, {src: 'texture_01.png', mag: gl.NEAREST }),
      width: 16,
      height: 16,
    },
    "dirt": {
      texture: twgl.createTexture(gl, {src: 'texture_02.png'}),
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

  function update(deltaTime) {
    CAMERA_ANGLE -= ROTATE ? deltaTime : 0;
    // drawInfos.forEach(function(drawInfo) {
    //   drawInfo.x += drawInfo.dx * SPEED * deltaTime;
    // });
  }

  function draw() {
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

    // this matirx will convert from pixels to clip space
    // var matrix = m4.orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);
    var projectionMatrix = m4.perspective(FOV_ANGLE, gl.canvas.clientWidth / gl.canvas.clientHeight, 1, 2000);

    // Compute a matrix for the camera
    var cameraMatrix = m4.identity();
    cameraMatrix = m4.translate(cameraMatrix, [CAMERA_X, CAMERA_Y, CAMERA_Z]);
    cameraMatrix = m4.rotateZ(cameraMatrix, CAMERA_ANGLE);
    cameraMatrix = m4.translate(cameraMatrix, [0, -CAMERA_RADIUS * 2.5, CAMERA_RADIUS]);
    cameraMatrix = m4.rotateX(cameraMatrix, CAMERA_TILT);

    var viewMatrix = m4.inverse(cameraMatrix);
    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    gl.useProgram(programInfo.program);

    chunks.forEach(function(chunk){

    chunk.forEach(function(drawInfo) {
      var dstX      = drawInfo.x;
      var dstY      = drawInfo.y;
      var dstZ      = drawInfo.z;
      var dstWidth  = drawInfo.xScale;
      var dstHeight = drawInfo.yScale;
      var dstDepth  = drawInfo.zScale;
      var srcX      = 0;
      var srcY      = 0;
      var srcWidth  = drawInfo.textureInfo.width;
      var srcHeight = drawInfo.textureInfo.height;

      // not sure best place to put this one
      gl.bindTexture(gl.TEXTURE_2D, drawInfo.textureInfo.texture);

      // // Setup the attributes to pull data from our buffers
      // gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_position.buffer);
      // // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      // gl.enableVertexAttribArray(positionLocation);
      // gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
      //
      // gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_normal.buffer);
      // // gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      // gl.enableVertexAttribArray(normalLocation);
      // gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
      //
      // gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_texcoord.buffer);
      // // gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
      // gl.enableVertexAttribArray(texcoordLocation);
      // gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

      twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

      // create world matrix
      var worldMatrix = m4.identity();
      worldMatrix = m4.translate(worldMatrix, [dstX, dstY, dstZ]);
      worldMatrix = m4.rotateX(worldMatrix, drawInfo.xRot);
      worldMatrix = m4.rotateY(worldMatrix, drawInfo.yRot);
      worldMatrix = m4.rotateZ(worldMatrix, drawInfo.zRot);
      worldMatrix = m4.scale(worldMatrix, [dstWidth, dstHeight, dstDepth]);

      var worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);
      var texMatrix = m4.identity();

      gl.uniform1i(textureLocation, 0);

      twgl.setUniforms(programInfo, {
        u_worldViewProjection: worldViewProjectionMatrix,
        u_world: worldMatrix,
        u_textureMatrix: texMatrix,
      });

      // draw the quad (2 triangles, 6 vertices)
      // gl.drawArrays(WIREFRAME ? gl.LINES : gl.TRIANGLES, 0, 6);

      twgl.drawBufferInfo(gl, bufferInfo);


      // drawImage(
      //   drawInfo.textureInfo.texture,
      //   srcWidth,
      //   srcHeight,
      //   srcX, srcY, srcWidth, srcHeight,
      //   dstX, dstY, dstZ, dstWidth, dstHeight, dstDepth,
      //   drawInfo.xRot, drawInfo.yRot, drawInfo.zRot
      // );

      // if (drawInfo.walls.bottom !== 0) {
      //   drawImage(
      //     textureInfos["dirt"].texture,
      //     srcWidth,
      //     srcHeight,
      //     srcX, srcY, srcWidth, drawInfo.walls.bottom,
      //     dstX,
      //     dstY - drawInfo.apothem,
      //     dstZ - drawInfo.walls.bottom/2,
      //     dstWidth, drawInfo.walls.bottom, dstDepth,
      //     PI/2, 0, 0
      //   );
      // }
      // if (drawInfo.walls.top !== 0) {
      //   drawImage(
      //     textureInfos["dirt"].texture,
      //     srcWidth,
      //     srcHeight,
      //     srcX, srcY, srcWidth, drawInfo.walls.top,
      //     dstX,
      //     dstY + drawInfo.apothem,
      //     dstZ - drawInfo.walls.top/2,
      //     dstWidth, drawInfo.walls.top, dstDepth,
      //     -PI/2, 0, 0
      //   );
      // }
      // if (drawInfo.walls.left !== 0) {
      //   drawImage(
      //     textureInfos["dirt"].texture,
      //     srcWidth,
      //     srcHeight,
      //     srcX, srcY, drawInfo.walls.left, srcHeight,
      //     dstX - drawInfo.apothem,
      //     dstY,
      //     dstZ - drawInfo.walls.left/2,
      //     drawInfo.walls.left, dstHeight, dstDepth,
      //     0, -PI/2, 0
      //   );
      // }
      // if (drawInfo.walls.right !== 0) {
      //   drawImage(
      //     textureInfos["dirt"].texture,
      //     srcWidth,
      //     srcHeight,
      //     srcX, srcY, drawInfo.walls.right, srcHeight,
      //     dstX + drawInfo.apothem,
      //     dstY,
      //     dstZ - drawInfo.walls.right/2,
      //     drawInfo.walls.right, dstHeight, dstDepth,
      //     0, PI/2, 0
      //   );
      // }
    })

  });



  }

  var then = 0;
  function render(time) {
    var now = time * 0.001;
    var deltaTime = Math.min(0.1, now - then);
    then = now;

    update(deltaTime);
    draw();

    capturer.capture(canvas);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);


}



// Setup a ui.
webglLessonsUI.setupSlider("#fieldofview", {
  value: radToDeg(FOV_ANGLE),
  slide: updateFOV,
  min: 0,
  max: 180,
});
function updateFOV(event, ui) {
  FOV_ANGLE = degToRad(ui.value);
}
webglLessonsUI.setupSlider("#cameraAngle", {
  value: radToDeg(CAMERA_ANGLE),
  slide: updateCameraAngle,
  min: -360,
  max: 360,
});
function updateCameraAngle(event, ui) {
  CAMERA_ANGLE = degToRad(ui.value);
}
webglLessonsUI.setupSlider("#cameraTilt", {
  value: radToDeg(CAMERA_TILT),
  slide: updateCameraTilt,
  min: 0,
  max: 90,
});
function updateCameraTilt(event, ui) {
  CAMERA_TILT = degToRad(ui.value);
}
webglLessonsUI.setupSlider("#cameraX", {
  value: CAMERA_X,
  slide: updateCameraX,
  min: -400,
  max: 400,
});
function updateCameraX(event, ui) {
  CAMERA_X = ui.value;
}
webglLessonsUI.setupSlider("#cameraY", {
  value: CAMERA_Y,
  slide: updateCameraY,
  min: -400,
  max: 400,
});
function updateCameraY(event, ui) {
  CAMERA_Y = ui.value;
}
webglLessonsUI.setupSlider("#cameraZ", {
  value: CAMERA_Z,
  slide: updateCameraZ,
  min: -400,
  max: 400,
});
function updateCameraZ(event, ui) {
  CAMERA_Z = ui.value;
}
webglLessonsUI.setupSlider("#cameraZoom", {
  value: CAMERA_RADIUS,
  slide: updateCameraRadius,
  min: 0,
  max: 800,
});
function updateCameraRadius(event, ui) {
  CAMERA_RADIUS = ui.value;
}
webglLessonsUI.setupSlider("#worldrotate", {
  value: radToDeg(WORLD_ROTATE),
  slide: updateWorldRotate,
  min: 0,
  max: 800,
});
function updateWorldRotate(event, ui) {
  WORLD_ROTATE = degToRad(ui.value);
}


main();
