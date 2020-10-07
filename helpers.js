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

        out[(offset_p) * n + rank] = mat[(rank * n) + offset];
        
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