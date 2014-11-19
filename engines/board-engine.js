//game board model, which is generates as a child of the gameengine model, but is generated as an independent object

var game = require('./game-engine');

var GameBoard = function(game) {
    this.game = game;
    this.boardVertices = this.createBoard(3, 6);
    this.boardTiles = [];
    this.boardSetup = false;
};


GameBoard.prototype.createBoard = function(small_num, large_num, board) {
    if(!board) {
        board = [];
    }

    if(small_num>large_num){
        return board;
    }
    board.push(this.createRow(small_num));
    board = this.createBoard(small_num+1, large_num, board);
    board.push(this.createRow(small_num));
    return board;
};

GameBoard.prototype.createRow = function(num_elements) {
    var row = [];
    for(var i=0; i<num_elements;i++) {
        row.push({
            connections: {
                vertical: null,
                left: null,
                right: null
            },
            owner: null,
            land: true,

        });
    }
    return row;
};

// GameBoard.prototype.setConnections = function(){
//     for(var i=0, row_len=this.boardVertices.length; i<row_len; i++) {
//         for(var k=0, len2=this.boardVertices[i].length; k < len2; k++){

//             // set vertical reference
//             if(i===0 || (i+1 >= row_len)){
//                 connections.vertical = null;
//             }
//             else if (i%2===0){
//                 connections
//             }
//         }
//     }   
// };

GameBoard.prototype.placeSettlement = function(player, location) {
    var tiles = this.boardVertices;
        //board initialization place settlement, get board tiles, and if the location does not have the property owner, allow them to build
        if (tiles[location[0]][location[1]].owner !== null){
            throw new Error ('This location is owned already!');
        };
        if (tiles[location[0]][location[1]].owner === null){
            tiles[location[0]][location[1]].owner = player;
            player.constructionPool.settlements--;
            player.playerQualities.settlements++;
            //add one point to their score
            player.ownedProperties.settlements.push(tiles[location[0]][location[1]]);
            //validate new buildable tiles?
            this.validateNewTiles(player, location)
        }
    //check the player's rulesValidatedBuildableTiles for the location, as well as if the tile is marked 'owner' in the buildableTiles... if it's not in validated or it has an owner, no build-y
};


GameBoard.prototype.validateNewTiles = function(player, endpointLocation) {
    var endpointX = endpointLocation[0];
    var endpointY = endpointLocation[1];
    var tiles = this.boardVertices;
    if (endpointX % 2 === 0) {
        //if x is an EVEN number, will build laterally to the left and right, one row up
        player.rulesValidatedBuildableTiles.push([endpointX+1, endpointY]);
        if (endpointY < tiles[endpointX].length) {
            //checking there is a 'right' to build to
         player.rulesValidatedBuildableTiles.push([endpointX+1, endpointY+1]);
        }
        if (endpointX !== 0) {
            //and if X is NOT 0, will build one row higher (ie, lower in x val)
          player.rulesValidatedBuildableTiles.push([endpointX-1, endpointY]);  
        }
    }
    if (endpointX % 2 !== 0) {
        if (endpointY > 0){
            //if y is greater than 0, build laterally to the left, one row down
            player.rulesValidatedBuildableTiles.push([endpointX-1, endpointY-1]);
        }
            //then build laterally to the right, one row down
        player.rulesValidatedBuildableTiles.push([endpointX-1, endpointY]);  
        if (endpointX !== 11) {
            //and if X is NOT 11, one row higher
          player.rulesValidatedBuildableTiles.push([endpointX+1, endpointY]);  
        }     
    }
};

GameBoard.prototype.upgradeSettlementToCity = function() {
    //TO DO: fix this code
    //find active settlements
    //prompt player to choose which settlement to upgrade
    //add one settlement to construction pool
    //remove one city from construction pool, if no cities left, return false
    //move item from this.ownedProperties.settlements to ''.''.cities
    //build city
    //change score
    var activeSettlements = this.ownedProperties.settlements;
    var settlementSelection = [];
    activeSettlements.forEach(function(item, index) {
        settlementSelection.push("" + index + " : " + item.location, 'Please enter your number here.')
    })
    var settlementToUpgrade = prompt("Which settlement would you like to upgrade? Enter your selection in the box below. \n"+settlementSelection.join(""));
    this.ownedProperties.cities.push(activeSettlements[settlementToUpgrade]);
    activeSettlements.splice(settlementToUpgrade, 1);
};

GameBoard.prototype.constructRoad = function(first_argument) {
    // body...
};

module.exports = GameBoard;