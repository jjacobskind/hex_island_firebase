//game engine setup

function GameEngine() {
    this.players = [],
    this.turn = 0,
	this.gameBoard = new GameBoard(),
    //are all players added to the game model, and are we ready to setup the board?
    this.areAllPlayersAdded = false;
    //true or false: is the stage where players add their first two settlements, and first two roads complete?
    this.boardIsSetup = false;
    //have all players setup their first two settlements and first two roads?
    this.hasGameStartedYet = false;
}

GameEngine.prototype.playerCount = function(){
    if (this.players.length === undefined) {
        return 1
    }
    return this.players.length + 1;
}

GameEngine.prototype.addPlayer = function() {
    if (this.areAllPlayersAdded === false) {
    var id = this.playerCount();
    if (id > 4) {
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

//the player model is below

function Player(id) {
    this.playerID = id;
    this.resources = {
        sheep: 0,
        wheat: 0,
        brick: 0,
        ore: 0,
        lumber: 0,
        cities: 4,
        settlements: 5,
        roads: 15
    };
    this.devCards = {
        knight: 0,
        point: 0,
        monopoly: 0,
        plenty: 0
    };
    this.qualities = {
        settlements: 0,
        cities: 0,
        roadSegments: 0,
        continuousRoadSegments: 0,
        knightsPlayed: 0,
        publicPoints: 0,
        privatePoints: 0
    };
    this.ownedProperties = [];
    this.rulesValidatedBuildableTiles = [];
    this.hasLongestRoad = false;
    this.hasLargestArmy = false;
};

Player.prototype.validateTiles = function() {
    //function goes here, the player will be able to check the tiles they can build on
    //this will be done by doing some sort of function = math, haven't figured it out yet 
};

Player.prototype.placeSettlement = function(locationX,locationY) {
    if (game.boardIsSetup === false) {
        //board initialization place settlement, get board tiles, and if the location does not have the property hasOwner, allow them to build
        var tiles = function(){return game.gameBoard.validBuildableTiles()}();
        if (tiles[locationX][locationY].hasOwner !== undefined){
            throw new Error ('This location is owned already!');
        };
        if (tiles[locationX][locationY].hasOwner === undefined){
            tiles[locationX][locationY].hasOwner = true;
            this.ownedProperties.push(tiles[locationX][locationY]);
        }
    }
    //check the player's rulesValidatedBuildableTiles for the location, if it's not there, no build-y
};

Player.prototype.upgradeSettlementToCity = function(ownedSettlement) {
    // body...
};

Player.prototype.constructRoad = function(first_argument) {
    // body...
};

//game board model, which is generates as a child of the gameengine model, but is generated as an independent object

function GameBoard () {
	this.boardTiles = [
		[{location: [0,0]}, {location: [0,1]}, {location: [0,2]}],
		[{location: [1,0]}, {location: [1,1]}, {location: [1,2]}, {location: [1,3]}],
		[{location: [2,0]}, {location: [2,1]}, {location: [2,2]}, {location: [2,3]}],
		[{location: [3,0]}, {location: [3,1]}, {location: [3,2]}, {location: [3,3]}, {location: [3,4]}],
		[{location: [4,0]}, {location: [4,1]}, {location: [4,2]}, {location: [4,3]}, {location: [4,4]}],
		[{location: [5,0]}, {location: [5,1]}, {location: [5,2]}, {location: [5,3]}, {location: [5,4]}, {location: [5,5]}],
		[{location: [6,0]}, {location: [6,1]}, {location: [6,2]}, {location: [6,3]}, {location: [6,4]}, {location: [6,5]}],
		[{location: [7,0]}, {location: [7,1]}, {location: [7,2]}, {location: [7,3]}, {location: [7,4]}],
		[{location: [8,0]}, {location: [8,1]}, {location: [8,2]}, {location: [8,3]}, {location: [8,4]}],
		[{location: [9,0]}, {location: [9,1]}, {location: [9,2]}, {location: [9,3]}],
		[{location: [10,0]}, {location: [10,1]}, {location: [10,2]}, {location: [10,3]}],
		[{location: [11,0]}, {location: [11,1]}, {location: [11,2]}]
	]
};

GameBoard.prototype.validBuildableTiles = function(playerID) {
        if (game.boardIsSetup === false) {
            return this.boardTiles;
        };
};

//start the initialization phase, where users add players, then they mark the board

var game = new GameEngine();