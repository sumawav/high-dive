function createChunk(size, scale, terrain, textureInfos){

  let tiles = [];
  let walls = [];
  let waters = [];
  let tilesNotWaters = [];
  let apothem = 0.5 * scale; // distance from center of regular polygon to midpoint of side
  let step = 2 * apothem;

  // for (var jj = 0; jj < size; ++jj) {
  //   for (var ii = 0; ii < size; ++ii) {
  //     let tile = {
  //       x: ii * step,
  //       y: jj * step,
  //       z: scale * terrain[jj*size + ii],
  //       xScale: scale,
  //       yScale: scale,
  //       zScale: 1,
  //       xRot: 0,
  //       yRot: 0,
  //       zRot: 0,
  //       walls: {
  //         top: 0,
  //         bottom: 0,
  //         left: 0,
  //         right: 0,
  //       }
  //     };
  //     if (tile.z === 0){
  //       waters.push(tile);
  //     } else {
  //       tilesNotWaters.push(tile);
  //     }
  //     tiles.push(tile);
  //   }
  // }

  for (let ii = 0; ii < size*size; ++ii) {
    let x = ii % (size);
    let y = Math.floor(ii / (size));
    let tileHeight = scale * terrain[ii];
    let rightMostColumn = size - 1;
    let leftMostColumn = 0;
    let topMostRow = size - 1;
    let bottomMostRow = 0;
    let tile = {
      x: x * step,
      y: y * step,
      z: tileHeight,
      xScale: scale,
      yScale: scale,
      zScale: 1,
      xRot: 0,
      yRot: 0,
      zRot: 0,
      walls: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      }
    };

    const makeWall = function(x, y, direction, tileHeight, wallHeight){    
      const wallInfoTemplate = {
        x: x * step,
        y: y * step,
        z: tileHeight,
        xScale: scale,
        yScale: scale,
        zScale: 1,
        xRot: 0,
        yRot: 0,
        zRot: 0,
        walls: null,
      };
      
      if (direction === "down") {
        let wallInfo = Object.assign({},wallInfoTemplate);
        wallInfo.y -= apothem;
        wallInfo.z -= wallHeight/2;
        wallInfo.yScale *= wallHeight/scale;
        wallInfo.xRot = PI/2;
        walls.push(wallInfo);
      }
      if (direction === "up") {
        let wallInfo = Object.assign({},wallInfoTemplate);
        wallInfo.y += apothem;
        wallInfo.z -= wallHeight/2;
        wallInfo.yScale *= wallHeight/scale;
        wallInfo.xRot = -PI/2;
        walls.push(wallInfo);
      }
      if (direction === "left") {
        let wallInfo = Object.assign({},wallInfoTemplate);
        wallInfo.x -= apothem;
        wallInfo.z -= wallHeight/2;
        wallInfo.zRot = -PI/2;
        wallInfo.yScale *= wallHeight/scale;
        wallInfo.yRot = -PI/2;
        walls.push(wallInfo);
      }
      if (direction === "right") {
        let wallInfo = Object.assign({},wallInfoTemplate);
        wallInfo.x += apothem;
        wallInfo.z -= wallHeight/2;
        wallInfo.zRot = PI/2;
        wallInfo.yScale *= wallHeight/scale;
        wallInfo.yRot = PI/2;
        walls.push(wallInfo);
      }
    }

    // borders around chunk
    if (y === bottomMostRow){
      tile.walls.bottom = tileHeight;
    }
    if (y === topMostRow){
      tile.walls.top = tileHeight;
    }
    if (x === rightMostColumn){
      tile.walls.right = tileHeight;
    }
    if (x === leftMostColumn){
      tile.walls.left = tileHeight;
    }
    // right check
    if (x < (rightMostColumn)){
      let rightTileHeight = terrain[ii + 1] * scale;
      if (tileHeight > rightTileHeight) {
        makeWall(x, y, "right", tileHeight, tileHeight - rightTileHeight);
      } else if ((tileHeight < rightTileHeight)) {
        // tiles[ii + 1].walls.left = rightTileHeight - tileHeight;
        //********/
        // instead of adding to the walls object, 
        // let's just add walls straight to the buffer
        // makeWall(x+1, y, "left", rightTileHeight - tileHeight);
        makeWall(x+1, y, "left", rightTileHeight, rightTileHeight - tileHeight);
      }
    }
    // up check
    if (y < (topMostRow)) {
      let aboveTileHeight = terrain[ii + size] * scale;
      if (tileHeight > aboveTileHeight) {
        // tile.walls.top = tileHeight - aboveTileHeight;
        makeWall(x, y, "up", tileHeight, tileHeight - aboveTileHeight);
      } else if ((tileHeight < aboveTileHeight)) {
        // tiles[ii + size].walls.bottom = aboveTileHeight - tileHeight;
        // makeWall(x, y+1, "bottom", aboveTileHeight - tileHeight);
        makeWall(x, y+1, "down", aboveTileHeight, aboveTileHeight - tileHeight);
      }
    }
    if (tile.z === 0){
      waters.push(tile);
    } else {
      tilesNotWaters.push(tile);
    }
    tiles.push(tile);
  }


  // fills in walls
  for (var ii = 0; ii < tiles.length; ++ii) {
    var x = ii % (size);
    var y = Math.floor(ii / (size));
    var tileHeight = tiles[ii].z;
    var rightMostColumn = size - 1;
    var leftMostColumn = 0;
    var topMostRow = size - 1;
    var bottomMostRow = 0;

    // borders around chunk
    if (y === bottomMostRow){
      tiles[ii].walls.bottom = tileHeight;
    }
    if (y === topMostRow){
      tiles[ii].walls.top = tileHeight;
    }
    if (x === rightMostColumn){
      tiles[ii].walls.right = tileHeight;
    }
    if (x === leftMostColumn){
      tiles[ii].walls.left = tileHeight;
    }
    // right check
    if (x < (rightMostColumn)){
      var rightTileHeight = tiles[ii + 1].z;
      if (tileHeight > rightTileHeight) {
        // tiles[ii].walls.right = tileHeight - rightTileHeight;
      } else if ((tileHeight < rightTileHeight)) {
        tiles[ii + 1].walls.left = rightTileHeight - tileHeight;
      }
    }
    // up check
    if (y < (topMostRow)) {
      var aboveTileHeight = tiles[ii + size].z;
      if (tileHeight > aboveTileHeight) {
        // tiles[ii].walls.top = tileHeight - aboveTileHeight;
      } else if ((tileHeight < aboveTileHeight)) {
        tiles[ii + size].walls.bottom = aboveTileHeight - tileHeight;
      }
    }
  }

  // create walls array
  for (let jj = 0; jj < size; ++jj) {
    for (let ii = 0; ii < size; ++ii) {
      const x = ii * step;
      const y = jj * step;
      const drawInfo = tiles[jj*size + ii];
      const wallInfoTemplate = {
        x: x,
        y: y,
        z: scale * terrain[jj*size + ii],
        xScale: scale,
        yScale: scale,
        zScale: 1,
        xRot: 0,
        yRot: 0,
        zRot: 0,
        walls: null,
      };
      
      // if (drawInfo.walls.bottom !== 0) {
      //   let wallInfo = Object.assign({},wallInfoTemplate);
      //   wallInfo.y -= apothem;
      //   wallInfo.z -= drawInfo.walls.bottom/2;
      //   wallInfo.yScale *= drawInfo.walls.bottom/scale;
      //   wallInfo.xRot = PI/2;
      //   walls.push(wallInfo);
      // }
      // if (drawInfo.walls.top !== 0) {
      //   let wallInfo = Object.assign({},wallInfoTemplate);
      //   wallInfo.y += apothem;
      //   wallInfo.z -= drawInfo.walls.top/2;
      //   wallInfo.yScale *= drawInfo.walls.top/scale;
      //   wallInfo.xRot = -PI/2;
      //   walls.push(wallInfo);
      // }
      // if (drawInfo.walls.left !== 0) {
      //   let wallInfo = Object.assign({},wallInfoTemplate);
      //   wallInfo.x -= apothem;
      //   wallInfo.z -= drawInfo.walls.left/2;
      //   wallInfo.zRot = -PI/2;
      //   wallInfo.yScale *= drawInfo.walls.left/scale;
      //   wallInfo.yRot = -PI/2;
      //   walls.push(wallInfo);
      // }
      // if (drawInfo.walls.right !== 0) {
      //   let wallInfo = Object.assign({},wallInfoTemplate);
      //   wallInfo.x += apothem;
      //   wallInfo.z -= drawInfo.walls.right/2;
      //   wallInfo.zRot = PI/2;
      //   wallInfo.yScale *= drawInfo.walls.right/scale;
      //   wallInfo.yRot = PI/2;
      //   walls.push(wallInfo);
      // }
    }
  }

  let tileArrays = [];
  let wallArrays = [];
  let waterArrays = [];

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

  tilesNotWaters.forEach(function(tiles){
    tileArrays.push(doThings(tiles));
  });

  walls.forEach(function(tiles){
    wallArrays.push(doThings(tiles));
  });

  waters.forEach(function(tiles){
    waterArrays.push(doThings(tiles));
  });

  let buffers = [];

  if (tileArrays.length > 0){
    let combinedTileArrays = twgl.primitives.concatVertices(tileArrays);
    const tilesBufferInfo = twgl.createBufferInfoFromArrays(gl, combinedTileArrays);
    buffers.push({
      buffer: tilesBufferInfo,
      texture: textureInfos.grass.texture,
    });
  }
  if (wallArrays.length > 0){
    let combinedWallArrays = twgl.primitives.concatVertices(wallArrays);
    const wallsBufferInfo = twgl.createBufferInfoFromArrays(gl, combinedWallArrays);
    buffers.push({
      buffer: wallsBufferInfo,
      texture: textureInfos.dirt.texture,
    });
  }
  if (waterArrays.length > 0) {
    let combinedWaterArrays = twgl.primitives.concatVertices(waterArrays);
    const watersBufferInfo = twgl.createBufferInfoFromArrays(gl, combinedWaterArrays);
    buffers.push({
      buffer: watersBufferInfo,
      texture: textureInfos.water.texture,
    });
  }

  return buffers;
}


// let ignoreMe = `data:image/png;
// base64,
// iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAZhJREFUOI1lkz1Ow0AQhb84u4kVIaUIlpAo3JLOFWdIZ65AwQ0oUlLmCByDdDkCZToLicZ15MJCoFXstSk2s94kW3ln5+
// e9N8+
// jh8/Xfrw9oIsJzfKITiNMtgAg3lc0ZeffwiN5UbyvAHyCFAM0ZYfNE8x6ji4mvjDMUxKUSbqor6bF+
// wpWoAnyUjdYebhUUAxIZJLe1DTLbrgLndLlqPH24PnEVNgsAcCKBsujK+
// KIzRPIBm3YKcb3t49vfEf01Q9d3RN9/TE1hvZuRns3Y2oMjW4BmH60qJtfTLZg+
// uFiI9kC4CaE6p+
// QhSiBs7uSFZr13IsmdKTAUzw1tnniKSqdRjQciTe1K17PfaI0acqOcXmAYoIGdDrER9nTS8+
// qPZsgaos/LuGHJwpNcQZ5PYdV6+
// gF5hKdbJ5g8wQle4839ZUbTbZw0EU4j8rxN9mCUfb+
// 3Iu7POSTWWyeXEEWhEJVDXBcV72b+
// CY6rSDYgKCy4Ay1qYmasjt7DDUQpeVNvuN95bemAGfJ8oDNEzedyEMXJJe/OCe9/gG35g89HnUiXgAAAABJRU5ErkJggg==`