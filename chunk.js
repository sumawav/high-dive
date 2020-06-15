function createChunk(initX, initY, size, scale, terrain, textureInfos){

  var drawInfos = [];
  var apothem = 0.5 * scale; // distance from center of regular polygon to midpoint of side
  var xStep = 2 * apothem;

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
        // apothem: apothem,
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

  // fills in walls
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

  // add walls to drawInfos
  for (let jj = 0; jj < size; ++jj) {
    for (let ii = 0; ii < size; ++ii) {
      const x = initX + ii * xStep;
      const y = initY + jj * xStep;
      const drawInfo = drawInfos[jj*size + ii];
      const wallInfoTemplate = {
        x: x,
        y: y,
        z: scale * terrain[jj*size + ii],
        dx: 0,
        dy: 0,
        dz: 0,
        xScale: scale,
        yScale: scale,
        zScale: 1,
        textureInfo: textureInfos["dirt"],
        xRot: 0,
        yRot: 0,
        zRot: 0,
        walls: null,
      };
      

      if (drawInfo.walls.bottom !== 0) {
        let wallInfo = Object.assign({},wallInfoTemplate);
        wallInfo.y -= apothem;
        wallInfo.z -= drawInfo.walls.bottom/2;
        wallInfo.yScale *= drawInfo.walls.bottom/scale;
        wallInfo.xRot = PI/2;
        drawInfos.push(wallInfo);
      }
      if (drawInfo.walls.top !== 0) {
        let wallInfo = Object.assign({},wallInfoTemplate);
        wallInfo.y += apothem;
        wallInfo.z -= drawInfo.walls.top/2;
        wallInfo.yScale *= drawInfo.walls.top/scale;
        wallInfo.xRot = -PI/2;
        drawInfos.push(wallInfo);
      }
      if (drawInfo.walls.left !== 0) {
        let wallInfo = Object.assign({},wallInfoTemplate);
        wallInfo.x -= apothem;
        wallInfo.z -= drawInfo.walls.left/2;
        wallInfo.xScale *= drawInfo.walls.left/scale;
        wallInfo.yRot = -PI/2;
        drawInfos.push(wallInfo);
      }
      if (drawInfo.walls.right !== 0) {
        let wallInfo = Object.assign({},wallInfoTemplate);
        wallInfo.x += apothem;
        wallInfo.z -= drawInfo.walls.right/2;
        wallInfo.xScale *= drawInfo.walls.right/scale;
        wallInfo.yRot = PI/2;
        drawInfos.push(wallInfo);
      }
    }
  }
  return drawInfos;
}



let ignoreMe = `data:image/png;
base64,
iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAZhJREFUOI1lkz1Ow0AQhb84u4kVIaUIlpAo3JLOFWdIZ65AwQ0oUlLmCByDdDkCZToLicZ15MJCoFXstSk2s94kW3ln5+
e9N8+
jh8/Xfrw9oIsJzfKITiNMtgAg3lc0ZeffwiN5UbyvAHyCFAM0ZYfNE8x6ji4mvjDMUxKUSbqor6bF+
wpWoAnyUjdYebhUUAxIZJLe1DTLbrgLndLlqPH24PnEVNgsAcCKBsujK+
KIzRPIBm3YKcb3t49vfEf01Q9d3RN9/TE1hvZuRns3Y2oMjW4BmH60qJtfTLZg+
uFiI9kC4CaE6p+
QhSiBs7uSFZr13IsmdKTAUzw1tnniKSqdRjQciTe1K17PfaI0acqOcXmAYoIGdDrER9nTS8+
qPZsgaos/LuGHJwpNcQZ5PYdV6+
gF5hKdbJ5g8wQle4839ZUbTbZw0EU4j8rxN9mCUfb+
3Iu7POSTWWyeXEEWhEJVDXBcV72b+
CY6rSDYgKCy4Ay1qYmasjt7DDUQpeVNvuN95bemAGfJ8oDNEzedyEMXJJe/OCe9/gG35g89HnUiXgAAAABJRU5ErkJggg==`