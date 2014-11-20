//game board model, which is generates as a child of the gameengine model, but is generated as an independent object

var game = require('./game-engine');

var GameBoard = function(game) {
    this.game = game;
    this.boardTiles = [];
    this.boardVertices = this.createBoard(3, 6);
    this.gameIsInitialized = false;
    this.boardIsSetup = false;
    this.gameIsStarted = false; 
};


GameBoard.prototype.createBoard = function(small_num, large_num, board) {
    if(!board) {
        board = [];
        this.createTestResources();
        var first_or_last = true;
    }

    if(small_num>large_num){
        return board;
    }
    board.push(this.createRow(small_num));

    if(!first_or_last && (small_num!==large_num)){
        board.push(this.createRow(small_num));
    }

    board = this.createBoard(small_num+1, large_num, board);
    board.push(this.createRow(small_num));
    if(!first_or_last  && (small_num!==large_num)){
        board.push(this.createRow(small_num));
    }
    this.gameIsInitialized = true;
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


GameBoard.prototype.placeSettlement = function(player, location) {
    //TO DO
    //test the rules validator
    var vertices = this.boardVertices;
        //board initialization place settlement, get board tiles, and if the location does not have the property owner, allow them to build
        if (vertices[location[0]][location[1]].owner !== null){
            throw new Error ('This location is owned already!');
        };
        if ((vertices[location[0]][location[1]].owner === null && this.boardIsSetup === false) || 
            (vertices[location[0]][location[1]].owner === null && player.rulesValidatedBuildableVertices.indexOf(location) !== -1))
        {   
            vertices[location[0]][location[1]].owner = player;
            player.constructionPool.settlements--;
            player.playerQualities.settlements++;
            //add one point to their score
            player.ownedProperties.settlements.push({settlementID: location, data: vertices[location[0]][location[1]]});
            //validate new buildable tiles?
            this.validateNewVertices(player, location);
        }
};



GameBoard.prototype.upgradeSettlementToCity = function(player, location) {
    //TO DO
    //change score
    //resources - but this should be checked on a different module?
    var vertices = this.boardVertices;
    if (vertices[location[0]][location[1]].owner === null){
            throw new Error ('No settlement to build on!');
    };
    if (vertices[location[0]][location[1]].owner !== player){
            throw new Error ('This isn\'t your settlement!');
    };
    if (vertices[location[0]][location[1]].owner === player) {
        var removeSettlement = null;
        player.ownedProperties.settlements.forEach(function(item, index){
            if (item.settlementID = location){
                player.ownedProperties.settlements.splice(index, 1);
            }
        });
        //switch settlement in city in player qualities
        player.playerQualities.settlements--;
        player.playerQualities.cities++;
        //remove city 'piece' from construction pool, add settlement piece
        player.constructionPool.settlements++;
        player.constructionPool.cities--;
        player.ownedProperties.cities.push({settlementID: location, data: vertices[location[0]][location[1]]})
    }

};

GameBoard.prototype.validateNewVertices = function(player, endpointLocation) {
    var endpointX = endpointLocation[0]; //[0,1]
    var endpointY = endpointLocation[1];
    var vertices = this.boardVertices;
    if (endpointX % 2 === 0) {
        //if x is an EVEN number, will build laterally to the left and right, one row up
        player.rulesValidatedBuildableVertices.push([endpointX+1, endpointY]);
        if (endpointY < vertices[endpointX].length) {
            //checking there is a 'right' to build to
         player.rulesValidatedBuildableVertices.push([endpointX+1, endpointY+1]);
        }
        if (endpointX !== 0) {
            //and if X is NOT 0, will build one row higher (ie, lower in x val)
          player.rulesValidatedBuildableVertices.push([endpointX-1, endpointY]);  
        }
    }
    if (endpointX % 2 !== 0) {
        if (endpointY > 0){
            //if y is greater than 0, build laterally to the left, one row down
            player.rulesValidatedBuildableVertices.push([endpointX-1, endpointY-1]);
        }
            //then build laterally to the right, one row down
        player.rulesValidatedBuildableVertices.push([endpointX-1, endpointY]);  
        if (endpointX !== 11) {
            //and if X is NOT 11, one row higher
          player.rulesValidatedBuildableVertices.push([endpointX+1, endpointY]);  
        }     
    }
    player.ownedProperties.settlements.forEach(function(item, index){
        for (var i = player.rulesValidatedBuildableVertices.length - 1; i >= 0; i--) {
            if (item.settlementID.toString() === player.rulesValidatedBuildableVertices[i].toString()) {
                player.rulesValidatedBuildableVertices.splice(i, 1);
            }
        };
    });
    player.ownedProperties.cities.forEach(function(item, index){
        for (var i = player.rulesValidatedBuildableVertices.length - 1; i >= 0; i--) {
            if (item.settlementID.toString() === player.rulesValidatedBuildableVertices[i].toString()) {
                player.rulesValidatedBuildableVertices.splice(i, 1);
            }
        };
    });
};

GameBoard.prototype.constructRoad = function(first_argument) {
    // body...
};

// returns vertex object that a given road goes to
GameBoard.prototype.getRoadDestination = function(currentLocation, direction) {
    var num_rows = this.boardVertices.length;

    //added this so that we can pass in a uniform location to all functions
    var row = currentLocation[0];
    var col = currentLocation[1];

    if(direction==="vertical"){
         if(row===0 || (row+1 >= num_rows)){
            return null;
        }
        else if (row%2===0){
            return this.boardVertices[row-1][col];
        }
        else {
            return this.boardVertices[row+1][col];
        }
    }
    else if(direction==="left"){

        if(row<num_rows/2){
            if(row % 2===0) {
                return this.boardVertices[row+1][col];
            }
            else if (col!==0) {
                return this.boardVertices[row-1][col-1];
            }
            else {
                return null;
            }
        } else {
            if(row % 2===1) {
                return this.boardVertices[row-1][col];
            }
            else if (col!==0) {
                return this.boardVertices[row+1][col-1];
            }
            else {
                return null;
            }
        }        
    }
    else if(direction==="right"){
        var last_col = this.boardVertices[row].length-1;

        if(row<num_rows/2){
            if(row % 2===0) {
                return this.boardVertices[row+1][col+1];
            }
            else if (col!==last_col) {
                return this.boardVertices[row-1][col];
            }
            else {
                return null;
            }
        } else {
            if(row % 2===1) {
                return this.boardVertices[row-1][col+1];
            }
            else if (col!==last_col) {
                return this.boardVertices[row+1][col];
            }
            else {
                return null;
            }
        }
    }
};

// below function to be used in test environment ONLY

GameBoard.prototype.createTestResources = function() {
    var numberChits = [5,2,6,3,8,10,9,12,11,4,8,10,9,4,5,6,3,11];
    var resources = ['grain', 'grain', 'grain', 'grain', 'lumber', 'lumber', 
    'lumber', 'lumber', 'wool', 'wool', 'wool', 'wool', 'ore', 'ore', 'ore', 
    'brick', 'brick', 'brick'];
    numberChits = numberChits.reverse();
    resources = this.game.shuffle(resources);
    var tempHexArray = [];
    var desertRandomizer = Math.floor((Math.random() * 19)+1);
    for (i = desertRandomizer; i <= 19; i++) {
        if (i === desertRandomizer) {
            this.boardTiles.push({
                hex: i,
                resource: 'desert',
                chit: 7,
            })
        }
        else {
            this.boardTiles.push({
                hex: i,
                resource: resources.pop(),
                chit: numberChits.pop(),
            })
        }
    }
    for (i = 1; i < desertRandomizer; i++) {
        tempHexArray.push({
            hex: i,
            resource: resources.pop(),
            chit:numberChits.pop()
        })
    }
    this.boardTiles = tempHexArray.concat(this.boardTiles);
};

module.exports = GameBoard;