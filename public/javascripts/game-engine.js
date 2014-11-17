function GameEngine() {
    this.players = [],
    this.turn = 0,
	this.gameBoard = [ ]
}

GameEngine.prototype.playerCount = function(){
    if (this.players.length === undefined) {
        return 1
    }
    return this.players.length + 1;
}

GameEngine.prototype.addPlayer = function() {
    var id = this.playerCount();
    if (id > 4) {
        throw new Error ("Sorry, no more than 4 players!")
    }
	this.players.push(new Player(id));
};

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
    this.hasLongestRoad = false;
    this.hasLargestArmy = false;
};

var game = new GameEngine();