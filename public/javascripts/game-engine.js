//game engine setup

function GameEngine() {
    this.players = [],
    this.turn = 0,
	this.gameBoard = new GameBoard(this),
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
    if (id > 3) {
        throw new Error ("Sorry, no more than 4 players!");
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

GameEngine.prototype.shuffle = function(){
//fisher-yates goes here
};

GameEngine.prototype.roll = function() {
//roll goes here
};

//the player model is below

function Player(id) {
    this.playerID = id;
    this.resources = {
        sheep: 0,
        wheat: 0,
        brick: 0,
        ore: 0,
        lumber: 0,
    };
    this.constructionPool = {
        cities: 4,
        settlements: 5,
        roads: 15
    }
    this.devCards = {
        knight: 0,
        point: 0,
        monopoly: 0,
        plenty: 0
    };
    this.playerQualities = {
        settlements: 0,
        cities: 0,
        roadSegments: 0,
        continuousRoadSegments: 0,
        knightsPlayed: 0,
        publicPoints: 0,
        privatePoints: 0
    };
    this.ownedProperties = {
        settlements: [],
        cities: [],
        roads: [],
    };
    this.rulesValidatedBuildableTiles = [];
    this.hasLongestRoad = false;
    this.hasLargestArmy = false;
};

Player.prototype.validateNewTiles = function(endpointLocation) {
    //function goes here, the player will be able to check the tiles they can build on
    var endpointX = endpointLocation[0];
    var endpointY = endpointLocation[1];
    var tiles = function(){return game.gameBoard.validBuildableTiles()}();
    if (endpointX % 2 === 0) {
        //if x is an EVEN number, will build laterally to the left and right, one row up
        this.rulesValidatedBuildableTiles.push([endpointX+1, endpointY]);
        if (endpointY < tiles[endpointX].length) {
            //checking there is a 'right' to build to
         this.rulesValidatedBuildableTiles.push([endpointX+1, endpointY+1]);
        }
        if (endpointX !== 0) {
            //and if X is NOT 0, will build one row higher (ie, lower in x val)
          this.rulesValidatedBuildableTiles.push([endpointX-1, endpointY]);  
        }
    }
    if (endpointX % 2 !== 0) {
        if (endpointY > 0){
            //if y is greater than 0, build laterally to the left, one row down
            this.rulesValidatedBuildableTiles.push([endpointX-1, endpointY-1]);
        }
            //then build laterally to the right, one row down
        this.rulesValidatedBuildableTiles.push([endpointX-1, endpointY]);  
        if (endpointX !== 11) {
            //and if X is NOT 11, one row higher
          this.rulesValidatedBuildableTiles.push([endpointX+1, endpointY]);  
        }     
    }
};

Player.prototype.placeSettlement = function(locationX,locationY) {
    var tiles = function(){return game.gameBoard.validBuildableTiles()}();
    if (game.boardIsSetup === false) {
        //board initialization place settlement, get board tiles, and if the location does not have the property owner, allow them to build
        if (tiles[locationX][locationY].owner !== null){
            throw new Error ('This location is owned already!');
        };
        if (tiles[locationX][locationY].owner === null){
            tiles[locationX][locationY].owner = game.players[this.playerID];
            game.players[this.playerID].constructionPool.settlements--;
            game.players[this.playerID].playerQualities.settlements++;
            //add one point to their score
            this.ownedProperties.settlements.push(tiles[locationX][locationY]);
            //validate new buildable tiles?
        }
    }
    //check the player's rulesValidatedBuildableTiles for the location, as well as if the tile is marked 'owner' in the buildableTiles... if it's not in validated or it has an owner, no build-y
};

Player.prototype.gatherResources = function() {
    var numberOfResourceCards = 0;

    for (var resource in this.player.resources) {
        if (this.player.resources.hasOwnProperty(resource)){
           numberOfResourceCards += resource;
        }
    }

    return numberOfResourceCards;
};

Player.prototype.upgradeSettlementToCity = function() {
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

Player.prototype.constructRoad = function(first_argument) {
    // body...
};

//game board model, which is generates as a child of the gameengine model, but is generated as an independent object

var GameBoard = function(game) {
    this.game = game;
    this.boardVertices = this.createBoard(3, 6);
    this.boardTiles = [];
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



GameBoard.prototype.validBuildableTiles = function(playerID) {
        if (game.boardIsSetup === false) {
            return this.boardVertices;
        };
};

//start the initialization phase, where users add players, then they mark the board

var game = new GameEngine();