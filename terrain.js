// var terrain = [
//   10,0,0,0,5,0,0,0,0,0,0,0,0,0,0,10,
//   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
//   5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
//   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
//   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
//   0,0,0,0,0,0,25,25,25,25,0,0,0,0,0,0,
//   0,0,0,0,25,25,25,25,25,25,25,0,0,0,0,0,
//   0,0,0,0,25,25,26,26,26,25,25,0,0,0,0,0,
//   0,0,0,0,25,25,26,26,25,25,25,25,0,0,0,0,
//   0,0,0,0,25,25,25,25,25,25,25,25,0,0,0,0,
//   0,0,0,0,25,25,25,25,25,25,25,0,0,0,0,0,
//   0,0,0,0,0,25,25,25,25,25,0,0,0,0,0,0,
//   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
//   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
//   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
//   10,0,0,0,0,0,0,5,0,0,0,0,0,0,5,10,
// ];

var terrain = [];

for (var i = 0; i < X_NUMBER*Y_NUMBER; ++i) {
  var lowerPillar = Math.floor(Math.random()*6 + 1);
  terrain.push(Math.floor(Math.random()*X_NUMBER*Y_NUMBER < 5 ? 20 : 0*lowerPillar ));
}
