// font size
var FONT = 32;

// map dimensions
var ROWS = 30;
var COLS = 40;

var player;

// the structure of the map
var map;
var layer;

// the ascii display, as a 2d array of characters
var asciidisplay;

//map steps for generation
var numberOfSteps = 4; //How many times will we pass over the map
var deathLimit = 3; //Least number of neighbours required to live
var birthLimit = 3; //Greateast number of neighbours before cell dies
var chanceToStartAlive = 0.30;  //chance of being generated as alive

// initialize phaser, call create() once done
var game = new Phaser.Game(800, 600, Phaser.AUTO, null, {
    preload: preload,
    create: create,
    update: update,
    render: render
});

function preload() {
    game.load.image('tileset', 'assets/tileset.png');
    game.load.image('player', 'assets/images/phaser-dude.png');
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // init keyboard commands
    //game.input.keyboard.addCallbacks(null, null, onKeyUp);

    //create empty map and load tiles
    map = game.add.tilemap();
    map.addTilesetImage('tileset', null, 20, 20);
    layer = map.create('level1', COLS, ROWS, 20, 20);
    layer.resizeWorld();

    //player.scale = 0;
    //random generation!!
    generateMap();

}

function update() {
    game.physics.arcade.collide(player, layer);

    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
        player.body.velocity.x -= 100;
    } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
        player.body.velocity.x += 100;
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
        player.body.velocity.y -= 100;
    } else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
        player.body.velocity.y += 100;
    }
}

function findPlayerSpawn(myMap) {
    var found = false;

    while (found === false) {
        var x = game.world.randomX;
        var y = game.world.randomY;
        var thatTile = map.getTileWorldXY(x, y);
        var nbs;

        if (thatTile.index == 3) {
            nbs = countAliveNeighbours(myMap, thatTile.x, thatTile.y);

            if (nbs === 0) {
                found = true;
                return {x: x, y: y};
            }
        }
    }
}

function generateMap() {
    //Create a new map
    var cellmap = [];

    for (var y=0; y<ROWS; y++) {
        var newRow = [];
        cellmap.push(newRow);

        for (var x=0;x<COLS;x++)
            newRow.push(false);
    }

    //Set up the map with random values
    cellmap = initialiseMap(cellmap);

    //And now run the simulation for a set number of steps
    for(var i = 0; i < numberOfSteps; i++) {
        cellmap = doSimulationStep(cellmap);
    }

    drawMap(cellmap);
}

function initialiseMap(mymap) {
    //generate initial values of the map
    for(var x=0; x < (ROWS); x++) {

        for(var y=0; y< (COLS); y++) {

            if(Math.random() < chanceToStartAlive)
                mymap[x][y] = true;
        }
    }
    return mymap;
}

function countAliveNeighbours(map, x, y) {
    //Retrieve the number of living neighbours in relation to a cell
    var count = 0;

    for (var i = -1; i < 2; i++) {

        for(var j = -1; j < 2; j++) {
            var neighbour_x = x+i;
            var neighbour_y = y+j;

            //If we're looking at the middle point
            if(i === 0 && j === 0) {
                //Do nothing, we don't want to add ourselves in!
            }
            //In case the index we're looking at it off the edge of the map
            else if(neighbour_x < 0 || neighbour_y < 0 || neighbour_x >= map.length || neighbour_y >= map[0].length) {
                count = count + 1;
            } else if(map[neighbour_x][neighbour_y]) { //Otherwise, a normal check of the neighbour
                count = count + 1;
            }
        }
    }
    return count;
}

function doSimulationStep(oldMap) {
    //Run through the map multiple times and adjust tiles to suit automata
    var newMap = [];

    for (var y = 0; y < ROWS; y++) {
        var newRow = [];
        newMap.push(newRow);

        for (var x = 0; x < COLS; x++)
            newRow.push( false );
    }

    //Loop over each row and column of the map
    for(var x = 0; x < oldMap.length; x++) {

        for(var y = 0; y < oldMap[0].length; y++) {
            var nbs = countAliveNeighbours(oldMap, x, y);

            //The new value is based on our simulation rules
            //First, if a cell is alive but has too few neighbours, kill it.
            if(oldMap[x][y]) {
                if(nbs < deathLimit) {
                    newMap[x][y] = false;
                } else {
                    newMap[x][y] = true;
                }
            } //Otherwise, if the cell is dead now, check if it has the right number of neighbours to be 'born'
            else{
                if(nbs > birthLimit) {
                    newMap[x][y] = true;
                } else {
                    newMap[x][y] = false;
                }
            }
        }
    }
    return newMap;
}

function drawMap(myMap) {   //and player
    //Based on final map configuration, draw the tiles
    for (var y = 0; y < ROWS; y++)
        for (var x = 0; x < COLS; x++) {
            if (myMap[y][x])
                map.putTile(0, x, y);
            else
                map.putTile(3, x, y);
        }

    map.setCollision(0); //tile 0 = wall
    generatePlayer(myMap);
}

function generatePlayer(myMap) {
    //player sprite
    var playerLoc = findPlayerSpawn(myMap); //find player spawn loc
    player = game.add.sprite(playerLoc.x, playerLoc.y, 'player');
    player.anchor.setTo(0.5);

    //player physics
    game.physics.arcade.enable(player);
    player.enableBody = true;
    player.body.collideWorldBounds = true;
    player.body.setSize(
        player.body.width * 0.8,
        player.body.height * 0.5,
        player.body.width * 0.1,
        player.body.height * 0.5
    );
}

function render() {
    //game.debug.body(player);
}
