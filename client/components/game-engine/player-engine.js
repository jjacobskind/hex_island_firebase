function Player(id) {
    this.playerID = id;
    this.resources = {
        wool: 0,
        grain: 0,
        brick: 0,
        ore: 0,
        lumber: 0,
    };
    this.constructionPool = {
        cities: 4,
        settlements: 5,
        roads: 15
    };
    this.devCards = {
        knight: 0,
        point: 0,
        monopoly: 0,
        plenty: 0,
        roadBuilding: 0
    };
    this.playerQualities = {
        settlements: 0,
        cities: 0,
        roadSegments: 0,
        continuousRoadSegments: 0,
        knightsPlayed: 0,
        privatePoints: 0
    };
    this.tradingCosts = {
        wool: 4,
        grain: 4,
        brick: 4,
        ore: 4,
        lumber: 4
    };
    this.ownedProperties = {
        settlements: [],
        cities: [],
        roads: [],
    };
    this.rulesValidatedBuildableVertices = [];
    this.playerName = undefined;
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