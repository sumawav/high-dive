function createChunk(size, scale, terrain, textureInfos, pinfo1, pinfo2){

  // let tiles = [];
  let walls = [];
  let waters = [];
  let bigWaters = [];
  let tilesNotWaters = [];
  let waterWalls = [];
  const apothem = 0.5 * scale; // distance from center of regular polygon to midpoint of side
  const step = 2 * apothem;

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
      // normal: {
      //   numComponents: 3,
      //   data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]
      // },
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
    };
    let wallInfo = Object.assign({},wallInfoTemplate);
    if (direction === "down") {
      wallInfo.y -= apothem;
      wallInfo.z -= wallHeight/2;
      wallInfo.yScale *= wallHeight/scale;
      wallInfo.xRot = PI/2;
    }
    if (direction === "up") {
      wallInfo.y += apothem;
      wallInfo.z -= wallHeight/2;
      wallInfo.yScale *= wallHeight/scale;
      wallInfo.xRot = -PI/2;
    }
    if (direction === "left") {
      wallInfo.x -= apothem;
      wallInfo.z -= wallHeight/2;
      wallInfo.zRot = -PI/2;
      wallInfo.yScale *= wallHeight/scale;
      wallInfo.yRot = -PI/2;
    }
    if (direction === "right") {
      wallInfo.x += apothem;
      wallInfo.z -= wallHeight/2;
      wallInfo.zRot = PI/2;
      wallInfo.yScale *= wallHeight/scale;
      wallInfo.yRot = PI/2;
    }
    walls.push(wallInfo);
  }

  const makeWaterWall = function(x, y, tileHeight, wallHeight){    
    const wallInfoTemplate = {
      x: x * step,
      y: y * step,
      z: tileHeight - wallHeight/2,
      xScale: scale,
      yScale: scale,
      zScale: 1,
      xRot: 0,
      yRot: 0,
      zRot: 0,
    };
    let wallInfo = Object.assign({},wallInfoTemplate);
    // if (direction === "down") {
      wallInfo.y -= apothem * size + apothem;
      wallInfo.x -= apothem;
      wallInfo.z -= wallHeight/2;
      wallInfo.yScale *= wallHeight/scale;
      wallInfo.xScale *= size;
      wallInfo.xRot = PI/2;
      waterWalls.push(wallInfo);
    // }
    wallInfo = Object.assign({},wallInfoTemplate);
    // if (direction === "right") {
      wallInfo.x += apothem * size - apothem;
      wallInfo.y -= apothem;
      wallInfo.z -= wallHeight/2;
      wallInfo.zRot = PI/2;
      wallInfo.yScale *= wallHeight/scale;
      wallInfo.xScale *= size;
      wallInfo.yRot = PI/2;
    // }
    waterWalls.push(wallInfo);
  }

  for (let ii = 0; ii < size*size; ++ii) {
    let x = ii % size;
    let y = Math.floor(ii / size);
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
    };

    // borders around chunk
    if (tile.z !== 0){
      if (y === bottomMostRow){
        makeWall(x, y, "down", tileHeight, tileHeight);
      }
      if (y === topMostRow){
        makeWall(x, y, "up", tileHeight, tileHeight);
      }
      if (x === rightMostColumn){
        makeWall(x, y, "right", tileHeight, tileHeight);
      }
      if (x === leftMostColumn){
        makeWall(x, y, "left", tileHeight, tileHeight);
      }
    }
    // right check
    if (x < (rightMostColumn)){
      let rightTileHeight = terrain[ii + 1] * scale;
      if (tileHeight > rightTileHeight) {
        makeWall(x, y, "right", tileHeight, tileHeight - rightTileHeight);
      } else if ((tileHeight < rightTileHeight)) {
        makeWall(x+1, y, "left", rightTileHeight, rightTileHeight - tileHeight);
      }
    }
    // up check
    if (y < (topMostRow)) {
      let aboveTileHeight = terrain[ii + size] * scale;
      if (tileHeight > aboveTileHeight) {
        makeWall(x, y, "up", tileHeight, tileHeight - aboveTileHeight);
      } else if ((tileHeight < aboveTileHeight)) {
        makeWall(x, y+1, "down", aboveTileHeight, aboveTileHeight - tileHeight);
      }
    }
    if (tile.z === 0){
      waters.push(tile);
    } else {
      tilesNotWaters.push(tile);
    }
  }

  if (waters.length === size*size){
    waters = [];
    if (ANIMATED_WATER){
      console.log("ANIMATED BIG WATER");
      let center = (step * size / 2) - apothem;
      let movingWater = {
        x: center,
        y: center,
        z: 0*scale,
        xScale: scale * size,
        yScale: scale * size,
        zScale: 1,
        xRot: 0,
        yRot: 0,
        zRot: 0,
      };      
      makeWaterWall(size/2, size/2, 1*scale, 2*scale);
      bigWaters.push(movingWater);
    } else {
      // console.log("BIG WATER");
      // let bigWater = {
      //   x: (step * size / 2) - apothem,
      //   y: (step * size / 2) - apothem,
      //   z: 0,
      //   xScale: scale * size,
      //   yScale: scale * size,
      //   zScale: 1,
      //   xRot: 0,
      //   yRot: 0,
      //   zRot: 0,
      // };      
      // waters.push(bigWater);
    }
  } else {
    makeWaterWall(size/2, size/2, 1*scale, 2*scale);
  }

  let tileArrays = [];
  let wallArrays = [];
  let waterArrays = [];
  let bigWaterArrays = [];
  let waterWallArrays = [];
  let buffers = [];

  tilesNotWaters.forEach(function(tiles){
    tileArrays.push(doThings(tiles));
  });
  if (tileArrays.length > 0){
    let combinedTileArrays = twgl.primitives.concatVertices(tileArrays);
    const tilesBufferInfo = twgl.createBufferInfoFromArrays(gl, combinedTileArrays);
    buffers.push({
      type: "tile",
      buffer: tilesBufferInfo,
      // arrays:combinedTileArrays,
      texture: textureInfos.grass.texture,
      programInfo: pinfo1,
    });
  }

  walls.forEach(function(tiles){
    wallArrays.push(doThings(tiles));
  });
  if (wallArrays.length > 0){
    let combinedWallArrays = twgl.primitives.concatVertices(wallArrays);
    const wallsBufferInfo = twgl.createBufferInfoFromArrays(gl, combinedWallArrays);
    buffers.push({
      type: "wall",
      buffer: wallsBufferInfo,
      // arrays: combinedWallArrays,
      texture: textureInfos.dirt.texture,
      programInfo: pinfo1,
    });
  }
  waters.forEach(function(tiles){
    waterArrays.push(doThings(tiles));
  });
  if (waterArrays.length > 0) {
    let combinedWaterArrays = twgl.primitives.concatVertices(waterArrays);
    const watersBufferInfo = twgl.createBufferInfoFromArrays(gl, combinedWaterArrays);
    buffers.push({
      type: "water",
      buffer: watersBufferInfo,
      // arrays: combinedWaterArrays,
      texture: textureInfos.water.texture,
      programInfo: pinfo1,
    });
  }
  bigWaters.forEach(function(tiles){
    bigWaterArrays.push(doThings(tiles));
  });
  if (bigWaterArrays.length > 0) {
    let combinedBigWaterArrays = twgl.primitives.concatVertices(bigWaterArrays);
    const bigWatersBufferInfo = twgl.createBufferInfoFromArrays(gl, combinedBigWaterArrays);
    buffers.push({
      type: "bigWater",
      // buffer: bigWatersBufferInfo,
      // arrays: combinedBigWaterArrays,
      arrays: bigWaterArrays[0],
      texture: textureInfos.water.texture,
      programInfo: pinfo2,
    });
  }
  waterWalls.forEach(function(tiles){
    waterWallArrays.push(doThings(tiles));
  });
  if (waterWallArrays.length > 0) {
    let combinedWaterWallArrays = twgl.primitives.concatVertices(waterWallArrays);
    const waterWallsBufferInfo = twgl.createBufferInfoFromArrays(gl, combinedWaterWallArrays);
    buffers.push({
      type: "waterWall",
      buffer: waterWallsBufferInfo,
      // arrays: combinedWaterWallArrays,
      texture: textureInfos.waterWall.texture,
      programInfo: pinfo1,
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

// 