//game board model, which is generates as a child of the gameengine model, but is generated as an independent object

var game = require('./game-engine');

var GameBoard = function(game, small_num, large_num) {
    this.game = game;
    this.boardTiles = [];
    this.boardVertices = this.createVertices(small_num, large_num);
    this.setVerticesOnTile();
    this.gameIsInitialized = false;
    this.boardIsSetup = false;
    this.gameIsStarted = false; 
};


GameBoard.prototype.createVertices = function(small_num, large_num, board) {
    if(!board) {
        board = [];
        large_num++;
        this.createResources(small_num, large_num-1);
        var first_or_last = true;
    }

    if(small_num>large_num){
        return board;
    }
    board.push(this.createRow(small_num));

    if(!first_or_last && (small_num!==large_num)){
        board.push(this.createRow(small_num));
    }

    board = this.createVertices(small_num+1, large_num, board);
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
            adjacent_tiles: [],
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

    // Row index of vertical adjacent vertex is one greater than the current vertex row if the current row is odd
    // If the current row is even, the adjacent vertical vertex is one less than the current row index
    // If water is vertically adjacent to current vertex, return null
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

    if(row%2===0){
        var adjusted_row = row+1;
    } else {
        adjusted_row = row-1;
    }

    if(direction==="left"){
        // If water is to left of vertex, return null
        if(col===0){
            return null;
        }

        // Column number of left adjacent vertex is the same as current vertex
        // UNLESS the current vertex is in an odd-indexed row in top half of board
        // OR the current vertex is in an even-indexed row in bottom half of board
        if(row<num_rows/2){
            if(row % 2===1) {
                col--;
            }
        } else if(row % 2===0) {
            col--;
        } 
        return this.boardVertices[adjusted_row][col];       
    }
    else if(direction==="right"){
        var last_col = this.boardVertices[row].length-1;

        // If water is to right of vertex, return null
        if(col===last_col){
            return null;
        }

        // Column number of right adjacent vertex is the same as current vertex
        // UNLESS the current vertex is in an even-indexed row in top half of board
        // OR the current vertex is in an odd-indexed row in bottom half of board
        if(row<num_rows/2){
            if(row % 2===0) {
                col++;
            }
        } else if(row % 2===1) {
            col++;
        }
        return this.boardVertices[adjusted_row][col]; 
    }
};

GameBoard.prototype.createResources = function(small_num, large_num) {
    var num_tiles = large_num;
    for(var i=large_num-1;i>=small_num;i--){
        num_tiles+= (i*2);
    }
    var num_extra_deserts= Math.round(num_tiles/15)-1;
    if(num_extra_deserts<0){
        num_extra_deserts=0;
    }

    var numberChit_bank = [5,2,6,3,8,10,9,12,11,4,8,10,9,4,5,6,3,11];
    var numberChits = [];
    i=0;
    while(numberChits.length+num_extra_deserts+1 < num_tiles){
        numberChits.push(numberChit_bank[i%18]);
        i++;
    }

    // There is one less of ore and brick than the other resources
    var resources = ['grain', 'lumber', 'wool'];
    while(num_extra_deserts--){
        resources.push('desert');
    }

    var resource_bank = this.game.shuffle(['grain', 'lumber', 'wool', 'brick', 'ore'])
    i=0;
    // resources length should be one less than num_tiles, since first desert is not in resources array
    while(resources.length < num_tiles-1){
        resources.push(resource_bank[i%5]);
        i++;
    }
    numberChits = numberChits.reverse();
    resources = this.game.shuffle(resources);
    var tempHexArray = [];
    var desertRandomizer = Math.floor((Math.random() * num_tiles)+1);
    tempHexArray[desertRandomizer] = {
                                        hex: desertRandomizer + 1,
                                        resource: 'desert',
                                        chit: 7,
                                    };

    // Inserted first desert manually
    // Using modulus to insert each tile by index and loop back to zero index to fill in tiles that come before the desert
    for (i = desertRandomizer+1; i%num_tiles !==desertRandomizer; i++) {
            var this_resource = resources.pop();
            if(this_resource==='desert'){
                var this_chit = 7;
            }
            else {
                this_chit = numberChits.pop();
            }
            tempHexArray[i%num_tiles] = {
                                            hex: i%num_tiles +1,
                                            resource: this_resource,
                                            chit: this_chit,
                                        };
    }

    // Restructure array of tiles into a multi-dimensional array with same dimensions as the board rendering
    var increment = 1;
    var used_tiles=0;
    this.boardTiles=[];
    for(var i=small_num;i>=small_num;i+=increment){
        this.boardTiles.push(tempHexArray.slice(used_tiles, used_tiles+i));
        used_tiles+=i;
        if(i===large_num){
            increment= -1;
        }
    }
};

GameBoard.prototype.setVerticesOnTile = function(){
    var num_rows = this.boardTiles.length;
    var num_vertex_rows = this.boardVertices.length;

    for(var row=0; row<num_rows; row++){
        for(var col=0, num_cols=this.boardTiles[row].length; col<num_cols; col++){
            var vertex_row = row*2;
            var current_tile = this.boardTiles[row][col];

            // Add resource tile to vertices on the second and third rows of the tile
            for(var i=1;i<=2;i++){
                this.boardVertices[vertex_row+i][col].adjacent_tiles.push(current_tile);
                this.boardVertices[vertex_row+i][col+1].adjacent_tiles.push(current_tile);
            }

            // Adjust column of top vertex of tile depending on whether the vertex is in the top or bottom half of board
            if(vertex_row<(num_vertex_rows/2)){
                var top_col_adjusted = col;
            } else {
                top_col_adjusted = col + 1;
            }

            // Adjust column of bottom vertex of tile depending on whether the vertex is in the top or bottom half of board
            if(vertex_row+3<(num_vertex_rows/2)){
                var bottom_col_adjusted = col + 1;
            } else {
                bottom_col_adjusted = col;
            }

            // Add resource tile to top and bottom vertices of the tile
            this.boardVertices[vertex_row][top_col_adjusted].adjacent_tiles.unshift(current_tile);
            this.boardVertices[vertex_row+3][bottom_col_adjusted].adjacent_tiles.push(current_tile);
        }
    }
};

module.exports = GameBoard;