//game engine setup

var GameBoard = require('./board-engine');
var Player = require('./player-engine');

function GameEngine(small_num, large_num) {
    this.players = [],
    this.turn = 0,
	  this.gameBoard = new GameBoard(this, small_num, large_num),
    //are all players added to the game model, and are we ready to setup the board?
    this.areAllPlayersAdded = false;
    //true or false: is the stage where players add their first two settlements, and first two roads complete?
    this.boardIsSetup = false;
    //have all players setup their first two settlements and first two roads?
    this.hasGameStartedYet = false;
}

GameEngine.prototype.addPlayer = function() {
    if (this.areAllPlayersAdded === false) {
    var id = this.players.length;
    if (id > 5) {
        throw new Error ("Sorry, no more than 6 players!");
    }
    this.players.push(new Player(id));
    }
    else if (this.areAllPlayersAdded === true) {
        throw new Error ("Game is already started!");
    }
};

GameEngine.prototype.validatePlayerCount = function() {
    this.areAllPlayersAdded = true;
    return "All players have been added!"
};

GameEngine.prototype.shuffle = function(array){
   for (var i = array.length - 1; i > 0; i--) {
       var j = Math.floor(Math.random() * (i + 1));
       var temp = array[i];
       array[i] = array[j];
       array[j] = temp;
   }
   return array;
};

GameEngine.prototype.roll = function() {
    var firstRoll = Math.floor(Math.random() * 6) + 1,
        secondRoll = Math.floor(Math.random() * 6) + 1,
        sumDice = firstRoll + secondRoll;
        return sumDice;
};

GameEngine.prototype.findLongestRoad = function() {
  var longest_road = [];
  for(var row=0, num_rows=this.gameBoard.boardVertices.length; row<num_rows; row++){
    for(var col=0, num_cols=this.gameBoard.boardVertices[row].length; col<num_cols; col++){
      var road = this.gameBoard.followRoad([row, col]);
      if(!longest_road.length || road.length > longest_road[0].length){
        longest_road=[];
        longest_road.unshift(road);
      }
      else if(!!longest_road[0] && road.length===longest_road[0].length) {
        // Need to do something here so that ties don't change possessor of points for longest road
        // longest_road.unshift(road);
      }
    }
  }
  console.log(longest_road[0]);
  return longest_road[0].length-1;  //number of roads is always one less than the number of vertices along it
};

// Finds the index of the first instance of a nested array in its parent array
  // ex: can use to find index of [1, 2] in array [ [0, 1], [3, 4], [1, 2]]
    // indexOf doesn't do this
GameEngine.prototype.getNestedArrayIndex = function(search_arr, find_arr) {
  for(var i=0, len=search_arr.length; i<len; i++) {
    var len2=find_arr.length;
    if(len2===search_arr[i].length){
      var match=true;
      for(var k=0; k<len2 && match; k++){
        if(search_arr[i][k]!==find_arr[k]) {
          match=false;
        }
      }
      if(match) {
        return i;
      }
    }
  }
  return -1;
};

GameEngine.prototype.distributeResources = function(rollNum) {
  // earlier function goes here
};

GameEngine.prototype.tradeResources = function(firstPlayer, firstResource, secondPlayer, secondResource) {
  // arguments should be formatted as follows [game.players[x], 'resource', number to shift],
  // example: game.tradeResources(game.players[0], {brick: 1}, game.players[1], {wool: 2});
  // in a situation where
  // player0 is giving 2 wool to player2 for 1 brick
  // player0 will decrease 1 brick, and increase 1 wool
  // player1 will increase 1 brick, and decrease 1 wool
  // game.tradeResources(game.players[0], {brick: 1}, game.players[1], {wool: 1, grain: 1});
  // player0 will increase 1 grain and 1 wool and decrease 1 brick
  // player1 will increase 1 brick and decrease 1 wool and 1 grain

  var playerOne = firstPlayer;
  var playerTwo = secondPlayer;
  for (var resource in firstResource) {
    playerOne.resources[resource] = playerOne.resources[resource] - firstResource[resource];
    playerTwo.resources[resource] = playerTwo.resources[resource] + firstResource[resource];
  }
  for (var resource in secondResource) {
    playerOne.resources[resource] = playerOne.resources[resource] + secondResource[resource];
    playerTwo.resources[resource] = playerTwo.resources[resource] - secondResource[resource];
  }
};


module.exports = GameEngine;
