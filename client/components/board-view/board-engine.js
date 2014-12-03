var GameBoard = function(game, small_num, large_num) {
    this.game = game;
    this.boardTiles = [];
    this.boardVertices = this.createVertices(small_num, large_num);
    this.setVerticesOnTile();
    this.portCreation();
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
            hasSettlementOrCity: null,
            land: true,
            port: null
        });
    }
    return row;
};


GameBoard.prototype.placeSettlement = function(player, location) {
    var vertices = this.boardVertices;
    //board initialization place settlement, get board tiles, and if the location does not have the property owner OR there is not a settlement within one vertex, allow them to build

    //check if owned
    if (vertices[location[0]][location[1]].owner !== null){
        throw new Error ('This location is owned already!');
    };
    //check if there is a settlement within one tile
    var nearestThreeVertices = [];
    nearestThreeVertices.push(this.getRoadDestination(location, 'left'));
    nearestThreeVertices.push(this.getRoadDestination(location, 'vertical'));
    nearestThreeVertices.push(this.getRoadDestination(location, 'right'));
    while (nearestThreeVertices.length !== 0) {
        var thisVertex = nearestThreeVertices[0];
        if (thisVertex !== null) {
            if (vertices[thisVertex[0]][thisVertex[1]].owner !== null)
            {
                throw new Error ('There is a settlement or city one tile away from this location, so this settlement cannot be built.');
            }
        }
        nearestThreeVertices.shift();
    };
    // place settlement within initial setup phase
    if ((vertices[location[0]][location[1]].owner === null && this.boardIsSetup === false) || 
        (vertices[location[0]][location[1]].owner === null && player.rulesValidatedBuildableVertices.indexOf(location) !== -1))
    {   
        vertices[location[0]][location[1]].owner = player.playerID;
        vertices[location[0]][location[1]].hasSettlementOrCity = 'settlement';
        player.constructionPool.settlements--;
        player.playerQualities.settlements++;
        //add one point to their score
        player.ownedProperties.settlements.push({settlementID: location});
        //validate new buildable tiles?
        this.validateNewVertices(player, location);
        if (vertices[location[0]][location[1]].port !== null) {
            if (vertices[location[0]][location[1]].port === 'general') {
                for (var resource in player.tradingCosts) {
                    player.tradingCosts[resource] === 4 ? player.tradingCosts[resource] = 3 : player.tradingCosts[resource] = player.tradingCosts[resource];
                }
            }
            else {
                var resourceToModify = vertices[location[0]][location[1]].port;
                for (var resource in player.tradingCosts) {
                    resourceToModify === resource ? player.tradingCosts[resource] = 2 : player.tradingCosts[resource] = player.tradingCosts[resource];
                }
            }
        }
    }
    currentGameData.child('players').set(JSON.stringify(game.players));
    currentGameData.child('boardVertices').set(JSON.stringify(game.gameBoard.boardVertices));
};



GameBoard.prototype.upgradeSettlementToCity = function(player, location) {
    //TO DO
    //change score
    //resources - but this should be checked on a different module?
    var vertices = this.boardVertices;
    if (vertices[location[0]][location[1]].owner === null){
            throw new Error ('No settlement to build on!');
    };
    if (vertices[location[0]][location[1]].owner !== player.playerID){
            throw new Error ('This isn\'t your settlement!');
    };
    if (vertices[location[0]][location[1]].owner === player.playerID) {
        vertices[location[0]][location[1]].hasSettlementOrCity = 'city';
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
        player.ownedProperties.cities.push({settlementID: location})
        currentGameData.child('players').set(JSON.stringify(game.players));
        currentGameData.child('boardVertices').set(JSON.stringify(game.gameBoard.boardVertices));
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

GameBoard.prototype.constructRoad = function(player, currentLocation, newDirection) {
    if (player.constructionPool.roads === 0) {
        throw new Error ('No more roads in your construction pool!');
    }
    else {
        var destinationCoords = this.game.gameBoard.getRoadDestination(currentLocation, newDirection);
        switch (newDirection)
            {  case "left":
                   var originDirection = "right";
                   break;
               case "right":
                   var originDirection = "left";
                   break;
               case "vertical":
                   var originDirection = "vertical";
                   break;
            };
        this.game.gameBoard.boardVertices[currentLocation[0]][currentLocation[1]].connections[newDirection] = player.playerID;
        this.game.gameBoard.boardVertices[destinationCoords[0]][destinationCoords[1]].connections[originDirection] = player.playerID;
        //housekeeping
        player.playerQualities.roadSegments++;
        player.constructionPool.roads--;
        player.ownedProperties.roads.push({
            origin: currentLocation,
            destination: destinationCoords,
        });
        //TO DO: resource removal?
        //validation - this is two lines because validateNewVertices does not account for the vertex that is passed in, so we manually pass in the vertex and then validate all surrounding
        player.rulesValidatedBuildableVertices.push(destinationCoords);
        this.validateNewVertices(player, destinationCoords);
        currentGameData.child('players').set(JSON.stringify(game.players));
        currentGameData.child('boardVertices').set(JSON.stringify(game.gameBoard.boardVertices));
    }
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
            return [row-1, col];
        }
        else {
            return [row+1, col];
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
            if(row<num_rows/2 && row%2===1){
                return null;
            }
            else if (row>=num_rows/2 && row%2===0){
                return null;
            }
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
        return [adjusted_row, col];       
    }
    else if(direction==="right"){
        var last_col = this.boardVertices[row].length-1;

        // If water is to right of vertex, return null
        if(col===last_col){
            if(row<num_rows/2 && row%2===1){
                return null;
            }
            else if (row>=num_rows/2 && row%2===0){
                return null;
            }
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
        return [adjusted_row, col]; 
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
                                        robber: false,
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

GameBoard.prototype.portCreation = function() {
    var num_sides = (this.boardVertices.length -1 + ((this.boardVertices[0].length-1)*2)) * 2;
    var num_spaces = Math.round(2*num_sides/3);
    var num_ports = num_sides - num_spaces;
    var two_space_intervals = 0;
    var three_space_intervals = 0;
    var space_interval_sum=0;

    // Number of tile sides between ports can either be 2 or three
    // Based on the size of the board,calculate exactly how many 2 and 3-interval gaps there are so that it circles the board once
    // while maintaining as close as possible to a 2:1 ratio of 2:3 side gaps
    while(space_interval_sum<num_spaces){
        two_space_intervals+=2;
        three_space_intervals++;
        space_interval_sum = (two_space_intervals*2)+(three_space_intervals*3);
    }
    var space_interval_diff = space_interval_sum-num_spaces;
    switch(space_interval_diff){
        case 1:
            two_space_intervals++;
            three_space_intervals--;
            break;
        case 2:
            two_space_intervals--;
            break;
        case 3:
            three_space_intervals--;
            break;
        case 4:
            two_space_intervals-=2;
            break;
        case 5:
            two_space_intervals--;
            three_space_intervals--;
            break;
        case 6:
            three_space_intervals-=2;
            break;
    }

    // Creates an array of ports to be placed
    // Even number of general ports and specific ports, and roughly even number of ports for each resource
    var resource_ports = ['lumber', 'grain', 'wool', 'brick', 'ore'];
    var all_ports = [];
    var i=0;
    var len = resource_ports.length;
    for(var count=1;count<=num_ports; count++){
        if(count%2===1){
            all_ports.push(resource_ports[i%len])
            i++;
        } else {
            all_ports.push('general');
        }
    }

    var all_intervals = [];

    var frequency = Math.floor(num_ports/three_space_intervals);

    // Creates an array with the order of 2 and 3 interval gaps
    // This way, the 3 interval gaps aren't all grouped on one side of the board
    for(i=1;i<=num_ports;i++){
        if(i%frequency===0 && three_space_intervals!==0){
            all_intervals.push(3);
            three_space_intervals--;
        } else {
            all_intervals.push(2);
        }
    }


    // Create an array with references to all outer vertex objects to facilitate port assignment
    var vertex = [1, 0];
    var border_vertices = [];

    while(vertex!==null){
        border_vertices.push(vertex);
        vertex = this.getRoadDestination(vertex, "right");
    }

    var left_side = [];
    for(var row=2, num_rows=this.boardVertices.length; row<=this.boardVertices.length-3; row++){
        border_vertices.push([row, this.boardVertices[row].length-1]);
        left_side.push([row, 0]);
    }

    left_side = left_side.reverse();

    vertex = [num_rows-2, this.boardVertices[num_rows-2].length-1];

    while(vertex!==null){
        border_vertices.push(vertex);
        vertex = this.getRoadDestination(vertex, "left");
    }

    border_vertices = border_vertices.concat(left_side);

    // Since port was built on first vertex in array, don't need last vertex
    border_vertices.pop();

    // Don't need to iterate through last interval, since it just leads back to first vertex
    all_intervals.pop();

    // Ports beng assigned to vertices
    // At the beginning of each loop, i is at a buildable vertex
    // Assigns ports on that vertex and the next one before looping through next interval
    for(i=0, len=border_vertices.length; i<len;i++) {
        var this_port = all_ports.pop();
        var row=border_vertices[i][0];
        var col = border_vertices[i][1];
        this.boardVertices[row][col].port = this_port;
        i++;
        var row=border_vertices[i][0];
        var col = border_vertices[i][1];
        this.boardVertices[row][col].port = this_port;

        // Fast-forwards to next port-buildable vertex, using the array of 2 & 3 gap interval values
        while(all_intervals[0]>0){
            i++;
            all_intervals[0]--;
        }
        all_intervals.shift();

    }

};

GameBoard.prototype.followRoad = function(location, road, player) {
    var row = location[0];
    var col = location[1];
    var vertex = this.boardVertices[row][col];
    var longest_road = [];
    // console.log(row, col);

    // If this is the starting vertex
    if(!road){
        var road=[];
        road.push([row, col]);
        for(var key in vertex.connections){
            var next_vertex = this.getRoadDestination([row, col], String(key));
            if(!!next_vertex){
                if(vertex.connections[key]!==null){
                    var temp_road = this.followRoad(next_vertex, road.slice(0), vertex.connections[key]);
                    if(temp_road.length>longest_road.length){
                        longest_road = temp_road;
                    }
                }
            }
        }
        return longest_road;
    // If this vertex and previous vertex have been visited twice, return array that doesn't include the road between the two vertices
    } else if ((this.game.getNestedArrayIndex(road, road[road.length-1])!==road.length-1)  //Check if there is an earlier instance of the last road on the array
                && (this.game.getNestedArrayIndex(road, [row, col])!==-1)) {
        return road;
    // Prevent from double-backing on itself and adding an extra length to the longest road
    } else if(road.length>1 && this.game.getNestedArrayIndex(road, [row, col])===road.length-2){
        return road;
    // Return road if we hit a vertex owned by another player
    } else if(vertex.owner!==null && vertex.owner!==player){
        road.push([row, col]);
        return road;
    } else {
        // console.log(this.game.getNestedArrayIndex(road, [row, col]));
        road.push([row, col]);
        for(key in vertex.connections){
            if(!!vertex.connections[key] && vertex.connections[key]===player){
                next_vertex = this.getRoadDestination([row, col], String(key));
                if(!!next_vertex){
                    var temp_road = this.followRoad(next_vertex, road.slice(0), player); 
                    if(temp_road.length>longest_road.length){
                        longest_road = temp_road;
                    }
                }
            }
        }
        return longest_road;
    }
};

GameBoard.prototype.getDevelopmentCard = function(player) {
    var deck = {
        size: 25,
        choiceCeiling: [14,19,21,23,25]
    };
    if (this.game.players.length > 4) {
        deck.choiceCeiling = [19,24,26,28,30];
        deck.size = 30;
    }
    var cardChoice = Math.floor((Math.random() * deck.size)) + 1;
    switch (true){
        case (cardChoice <= deck.choiceCeiling[0]):
            player.devCards.knight++;
            break;
        case (cardChoice > deck.choiceCeiling[0] && cardChoice <= deck.choiceCeiling[1]):
            player.devCards.point++;
            break;
        case (cardChoice > deck.choiceCeiling[1] && cardChoice <= deck.choiceCeiling[2]):
            player.devCards.monopoly++;
            break;
        case (cardChoice > deck.choiceCeiling[2] && cardChoice <= deck.choiceCeiling[3]):
            player.devCards.plenty++;
            break;
        case (cardChoice > deck.choiceCeiling[3] && cardChoice <= deck.choiceCeiling[4]):
            player.devCards.roadBuilding++;
            break;
        default:
            throw new Error ('Something weird happened in the deck: Error on this draw - ' + cardChoice);
    }
    currentGameData.child('players').set(JSON.stringify(game.players));
};