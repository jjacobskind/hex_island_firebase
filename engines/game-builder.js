var Engine = require('./game-engine');

var game = new Engine();

//test functionality

game.addPlayer();
game.addPlayer();
game.gameBoard.placeSettlement(game.players[0], [0, 0]);
// console.log(game.gameBoard.boardVertices[0], game.players[0]);
console.log(game.gameBoard.boardVertices[0][0]);
// game.players[0].placeSettlement(0,0);
// console.log(game);