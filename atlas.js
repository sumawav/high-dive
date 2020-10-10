let createWorld = function(n) {
    let chunks = [];
    let atlas = [];
    let N = n || 16;
    let oldX;
    let oldY;
    let coordX = 0;
    let coordY = 0;

    let cb = ()=>{};

    const setcb = function(cbin) {
      cb = cbin;
    }

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
      const newX = x;
      const newY = y;
      if (oldX === null)
        oldX = newX;
      if (oldY === null)
        oldY = newY;
      if (newX > oldX){
        console.log("X+");
        coordX++;
        cb();
      } else if (newX < oldX){
        console.log("X-");
        coordX--;
        cb();
      }
      if (newY > oldY){
        console.log("Y+");
        coordY++;
        cb();
      } else if (newY < oldY){
        console.log("Y-");
        coordY--;
        cb();
      }
      oldX = newX;
      oldY = newY;
    }

    const getMap = () => {
      let worldMap = [];
      for(let ii = 0; ii < atlas.length; ++ii) {
        let x = ii % N;
        let y = Math.floor(ii / N);
        let rankX = Math.floor(Math.abs(coordX) / N);
        let rankY = Math.floor(Math.abs(coordY) / N);
        let offset_x = coordX % N;
        let offset_y = coordY % N;
        let new_x;
        let new_y;

        let neg_offset_x = N + offset_x - 1;
        let neg_offset_y = N + offset_y - 1;

        if (coordX >= 0){
          new_x = x + (x < offset_x ? N : 0) + (rankX * N);
        } else if (coordX < 0){
          new_x = x - (x > neg_offset_x ? N : 0) - (rankX * N);
        }
        if (coordY >= 0){
          new_y = y + (y < offset_y ? N : 0) + (rankY * N);
        } else if (coordY < 0) {
          new_y = y - (y > neg_offset_y ? N : 0) - (rankY * N);
        }

        let bufferArray = chunks[atlas[ii]];

        bufferArray.forEach(function(item){
          worldMap.push({
            buffer: item.buffer,
            texture: item.texture,
            worldPosition: [new_x * CHUNK_N * SCALE, new_y * CHUNK_N * SCALE, 0],
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
      setcb: setcb,
    }
  };