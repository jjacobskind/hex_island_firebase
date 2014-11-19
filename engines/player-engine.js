//the player model is below

var game = require('./game-engine');

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
    var tiles = function(){return this.gameBoard.validBuildableTiles()}();
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
    var tiles = this.gameBoard.validBuildableTiles();
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

Player.prototype.constructRoad = function(first_argument) {
    // body...
};

module.exports = Player;