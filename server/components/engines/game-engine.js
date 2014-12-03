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

GameEngine.prototype.calculatePlayerTurn = function() {
  var currentTurn = this.turn,
      playerLength = this.players.length;
      playerTurn = currentTurn % playerLength;
  return playerTurn;
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

GameEngine.prototype.robber = function(){
	  var rows = game.gameBoard.boardVertices,
         	    stealable = [],
         	    toStealFrom = '',
         	    stolenResource = 0,
         	    randomResource = function(obj) {
         	    	var keys = Object.keys(obj)
         	    	return obj[keys[keys.length * Math.random() << 0]];
         	    };;
	if (this.turn !== 1 && sumDice == 7) {
         // loop through each player and remove half of their resources if they have less than 7
         for (var i = 0; i < this.players.length; i++) {
             var sum = 0;
             for (var resource in this.players[i].resources) {
               if ( this.players[i].resources.hasOwnProperty(resource) ) {
                // removed parseFloat on sum: [original: sum += parseFloat( this.players[i].resources[resource] ); ]
                sum += this.players[i].resources[resource];
                if (sum > 7) {
                    var keptResources = { wool: 0, grain: 0, brick: 0, ore: 1, lumber: 1 };
                    // hard code value test:
                    // keptResources = { wool: 2, grain: 0, brick: 0, ore: 1, lumber: 1 }
                    console.log('The bandit stole half of your resources! You have X resources left! please select which resources you wish to keep');
                    this.players[i].resources = keptResources;
                 }
               }
             }
         }
         // need to add this.playerTurn specific modal here
         console.log('player '+playerTurn+' please select a new tile for the bandit to occupy')
         // banditMove = game.gameBoard.boardTiles[this.row][this.col]
         console.log('player '+playerTurn+' chased the robber into a new area!');
         // rolled player selects another player to steal from
         for (var a = 0; a < rows.length; a++) {
         	for (var b = 0; b < rows[a].length; b++) {
         		if ( rows[a][b].owner !== null ) {
         			stealable.push(rows[a][b].owner);
         			console.log('please select a player from whom to steal one resource');
         			toStealFrom = stealable[1];
         			stolenResource = randomResource( game.players[1].resources );
         		}
         	}
         }
        }
	
}

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

GameEngine.prototype.distributeResources = function(sumDice) {
  var rows = game.gameBoard.boardVertices;
  // if player's dice roll doesn't trigger robber fn
  if (sumDice !== 7) {
      var boardSnapShot = {};
      // loop through the game board
      for (i = 0; i < rows.length; i++) {
        for (j = 0; j < rows[i].length; j++) {
          if (rows[i][j].owner !== null) {
            var resourcesToDistribute = 1;
            // check adjacent tiles if they contain a settlement or a city
            if (rows[i][j].settlementOrCity === 'city'){
              resourcesToDistribute++;
            }
            // distribute resources if player contains settlement on adjacent tiles
            rows[i][j].adjacent_tiles.forEach(function (item) {
              if (item.chit === rollTest) {
                resourceArray.push({resourceCount: resourcesToDistribute, resource: item.resource});
              }
            })
            if (resourceArray.length !== 0 && item.robber == false) {
              resourceArray.forEach(function(item){
                var resources = player.resources;
                console.log(item.resource)
                resources[item.resource] = resources[item.resource] + resourcesToDistribute;
              })
            }
          }
        }
      }
    }
};

GameEngine.prototype.bankTrading = function(player, resources_give, resources_take){
  
  // trading_power determines how many resource cards player can acquire through a bank var
  var trading_power = 0;

  // Validate whether player has enough of each resource to conduct this trade
  for(var i=0, len=resources_give.length; i<len; i++){
    var this_resource = resources_give[i];
    if(player.resources[this_resource.resource] < this_resource.quantity || player.resources[this_resource.resource]<player.tradingCosts[this_resource.resource]){
      return false;
    } else {
      trading_power += Math.floor(this_resource.quantity/player.tradingCosts[this_resource.resource]);
    }
  }

  // Tally the number of resource cards player is trying to acquire through this trade
  var seeking_sum = 0;
  for(var i=0, len=resources_take.length; i<len; i++){
    seeking_sum += resources_take[i].quantity;
  }

  if(trading_power<seeking_sum){
    return false;
  } else {

    // Deduct resources player is trading away
    for(var i=0, len=resources_give.length; i<len; i++){
      var this_resource = resources_give[i];
      player.resources[this_resource.resource]-=this_resource.quantity;
    }
    // Add resources player is receiving
    for(var i=0, len=resources_take.length; i<len; i++){
      var this_resource = resources_take[i];
      player.resources[this_resource.resource]+=this_resource.quantity;
    }
  }
}

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
