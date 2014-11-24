var Engine = require('../engines/game-engine')
var game = new Engine(3, 6);

module.exports = game;


game.addPlayer();
game.addPlayer();
game.gameBoard.constructRoad(game.players[0],[0,1], 'left');
console.log(game.players[0].ownedProperties.roads)