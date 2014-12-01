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
    if (id > 4) {
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
//roll goes here
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

GameEngine.prototype.buildSettlement = function(player, location) {
  if (player.resources.wool < 1 || player.resources.grain < 1 || player.resources.lumber < 1 || player.resources.brick < 1) {
    throw new Error ('Not enough resources to build settlement!')
  }
  else {
    player.resources.wool--;
    player.resources.grain--;
    player.resources.lumber--;
    player.resources.brick--;
    this.gameBoard.placeSettlement(player, location);
  }
};

GameEngine.prototype.buildRoad = function(player, location, direction) {
  if (player.resources.lumber < 1 || player.resources.brick < 1) {
    throw new Error ('Not enough resources to build road!')
  }
  else {
    player.resources.lumber--;
    player.resources.brick--;
    this.gameBoard.constructRoad(player,location,direction);
  }
};

GameEngine.prototype.upgradeSettlementToCity = function(player, location) {
  if (player.resources.grain < 2 || player.resources.ore < 3) {
    throw new Error ('Not enough resources to build city!')
  }
  else {
    player.resources.grain = player.resources.grain - 2;
    player.resources.ore = player.resources.ore - 3;
    this.gameBoard.upgradeSettlementToCity(player, location); 
  }
};

GameEngine.prototype.buyDevelopmentCard = function(player) {
  if (player.resources.wool < 1 || player.resources.grain < 1 || player.resources.ore < 1) {
    throw new Error ('Not enough resources to purchase a development card!')
  }
  else {
    player.resources.wool--;
    player.resources.grain--;
    player.resources.ore--;
    this.gameBoard.getDevelopmentCard(player);
  }
};


module.exports = GameEngine;