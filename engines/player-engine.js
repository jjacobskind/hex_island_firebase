//the player model is below

var game = require('./game-engine');

function Player(id) {
    this.playerID = id;
    this.resources = {
        sheep: 0,
        grain: 0,
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
    this.rulesValidatedBuildableVertices = [];
    this.hasLongestRoad = false;
    this.hasLargestArmy = false;
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

module.exports = Player;