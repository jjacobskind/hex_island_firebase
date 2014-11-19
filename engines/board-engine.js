//game board model, which is generates as a child of the gameengine model, but is generated as an independent object

var game = require('./game-engine');

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

module.exports = GameBoard;