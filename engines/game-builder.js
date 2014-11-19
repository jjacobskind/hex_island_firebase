var Engine = require('./game-engine');

var game = new Engine();

//test functionality

game.addPlayer();
console.log('this is the current player who is choosing to build a settlement')
console.log(game.players[0]);
game.gameBoard.placeSettlement(game.players[0], [0, 0]);
console.log('this is the effect of the built settlement')
console.log(game.players[0]);
console.log('--------------------------------------------------')
console.log(game.gameBoard.boardVertices[0][0]);
console.log('upgrade settlement to city')
console.log('--------------------------------------------------')
game.gameBoard.upgradeSettlementToCity(game.players[0], [0, 0]);
console.log('---------------------------');
console.log(game.players[0]);
// game.players[0].placeSettlement(0,0);
// console.log(game);