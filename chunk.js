function createChunk(initX, initY, size, scale, terrain, textureInfos){

  var drawInfos = [];
  var apothem = 0.5 * scale; // distance from center of regular polygon to midpoint of side
  var xStep = 2 * apothem;
  var initZ = 0;

  for (var jj = 0; jj < size; ++jj) {
    for (var ii = 0; ii < size; ++ii) {
      var x = initX + ii * xStep;
      var y = initY + jj * xStep;
      var drawInfo = {
        x: x,
        y: y,
        z: scale * terrain[jj*size + ii],
        dx: 0,
        dy: 0,
        dz: 0,
        xScale: scale,
        yScale: scale,
        zScale: 1,
        textureInfo: textureInfos["grass"],
        xRot: 0,
        yRot: 0,
        zRot: 0,
        apothem: apothem,
        walls: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }
      };
      drawInfos.push(drawInfo);
    }
  }
  for (var ii = 0; ii < drawInfos.length; ++ii) {
    var x = ii % (size);
    var y = Math.floor(ii / (size));
    var tileHeight = drawInfos[ii].z;
    var rightMostColumn = size - 1;
    var leftMostColumn = 0;
    var topMostRow = size - 1;
    var bottomMostRow = 0;

    // borders around chunk
    if (y === bottomMostRow){
      drawInfos[ii].walls.bottom = tileHeight;
    }
    if (y === topMostRow){
      drawInfos[ii].walls.top = tileHeight;
    }
    if (x === rightMostColumn){
      drawInfos[ii].walls.right = tileHeight;
    }
    if (x === leftMostColumn){
      drawInfos[ii].walls.left = tileHeight;
    }
    // right check
    if (x < (rightMostColumn)){
      var rightTileHeight = drawInfos[ii + 1].z;
      if (tileHeight > rightTileHeight) {
        drawInfos[ii].walls.right = tileHeight - rightTileHeight;
      } else if ((tileHeight < rightTileHeight)) {
        drawInfos[ii + 1].walls.left = rightTileHeight - tileHeight;
      }
    }
    // up check
    if (y < (topMostRow)) {
      var aboveTileHeight = drawInfos[ii + size].z;
      if (tileHeight > aboveTileHeight) {
        drawInfos[ii].walls.top = tileHeight - aboveTileHeight;
      } else if ((tileHeight < aboveTileHeight)) {
        drawInfos[ii + size].walls.bottom = aboveTileHeight - tileHeight;
      }
    }
  }
  return drawInfos;
}
