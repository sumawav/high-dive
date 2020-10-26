// transformation on xy grids represented by a linear array ([])


const mat_rotate_ccw = (mat) => {
    let out = [];
    const n = Math.sqrt(mat.length);
    if (n % 1 !== 0){
        console.log("non square arrays don't work");
    }
    for(let ii = 0; ii < mat.length; ++ii){
        let rank = Math.floor(ii / n);
        let offset = ii % n;
        let offset_p = n - offset - 1;

        out[(offset_p * n) + rank] = mat[(rank * n) + offset];
    }
    return out;
}

const mat_rotate_cw = (mat) => {
    let out = [];
    const n = Math.sqrt(mat.length);
    if (n % 1 !== 0){
        console.log("non square arrays don't work");
    }
    for(let ii = 0; ii < mat.length; ++ii){
        let rank = Math.floor(ii / n);
        let offset = ii % n;
        let rank_p = n - rank - 1;

        out[(offset * n) + rank_p] = mat[(rank * n) + offset];
    }
    return out;
}

const mat_rotate_multi = (mat, num, dir) => {
    num = num || 1;
    if (num % 4 === 0){
        return mat;
    }
    let rotations = num % 4;
    let spin = mat;

    for (let ii = 0; ii < rotations; ++ii){
        if (dir) {
            spin = mat_rotate_cw(spin);
        } else {
            spin = mat_rotate_ccw(spin);
        }
    }

    return spin;
}

const randInt = (max, _min) =>{
    const min = _min || 0;
    return Math.floor(Math.random()*(max - min)) + min;
}


function hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return [r, g, b, 255];
}