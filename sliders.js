
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
    min: -2000,
    max: 2000,
  });
  function updateCameraX(event, ui) {
    CAMERA_X = ui.value;
  }
  webglLessonsUI.setupSlider("#cameraY", {
    value: CAMERA_Y,
    slide: updateCameraY,
    min: -2000,
    max: 2000,
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