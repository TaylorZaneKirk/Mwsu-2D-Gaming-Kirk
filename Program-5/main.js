// is the map done generating?
var isReady = false;

// map dimensions
var ROWS = 30;
var COLS = 40;

var player;
var enemies;
var actors;

// the structure of the map
var mapData;
var map;
var layer;
var layer2;
var easystar;

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
    game.load.image('clown', 'assets/images/clown.png');
    mapData = generateMap();
    easystar = new EasyStar.js();
}

function create() {
    map = game.add.tilemap();
    walls = game.add.group();
    tiles = map.addTilesetImage('tileset', null, 20, 20);
    layer = map.create('level1', COLS, ROWS, 20, 20);
    layer2 = map.createBlankLayer('collisions', COLS, ROWS, 20, 20);
    layer2.properties = {'collision' : true};
    layer.resizeWorld();

    game.physics.startSystem(Phaser.Physics.ARCADE);

    // init keyboard commands
    //game.input.keyboard.addCallbacks(null, null, onKeyUp);

    //create empty map and load tiles

    actors = game.add.group();

    enemies = game.add.group();
    player = actors.create(0, 0, 'player', null, false);
    enemies.createMultiple(3, 'clown');
    actors.add(enemies);

    player.anchor.setTo(0.5)
    game.physics.arcade.enable(player);
    player.enableBody = true;
    player.body.collideWorldBounds = true;
    player.body.setSize(
        player.body.width * 0.8,
        player.body.height * 0.5,
        player.body.width * 0.1,
        player.body.height * 0.5
    );
    //player physics
    enemies.forEach(function(actor){
        actor.anchor.setTo(0.5)
        game.physics.arcade.enable(actor);
        actor.enableBody = true;
        actor.body.collideWorldBounds = true;
        actor.body.setSize(
            actor.body.width * 0.8,
            actor.body.height * 0.5,
            actor.body.width * 0.1,
            actor.body.height * 0.5
        );
    });


    //player.scale = 0;
    //random generation!!
    //generateMap();
    drawMap(function(){generateActors();});

    /*easystar.setGrid(map.layers[0].data);
    easystar.setAcceptableTiles(map.tiles);*/
    easystar.setGrid(mapData);
    easystar.setAcceptableTiles([false]);
}

function drawPath(path){
    var i = 0;
    game.time.events.loop(Phaser.Timer.SECOND/25, function(){
        if(path === null){
            console.log("no path found");
        }
        else if(i < path.length){
            map.putTile(1, path[i].x, path[i].y, 'level1')
            i++;
        }
    })
}

function update() {
    game.physics.arcade.collide(player, layer2);

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


    enemies.forEachAlive(function(enemy) {
        // Define a line that connects the person to the ball
        // This isn't drawn on screen. This is just mathematical representation
        // of a line to make our calculations easier. Unless you want to do a lot
        // of math, make sure you choose an engine that has things like line intersection
        // tests built in, like Phaser does.
        var ray = new Phaser.Line(enemy.x, enemy.y, player.x, player.y);
        var enemyTile = map.getTileWorldXY(enemy.x, enemy.y, 20, 20, 'level1');
        var playerTile = map.getTileWorldXY(player.x, player.y, 20, 20, 'level1');
        if(enemyTile && playerTile){
            // Test if any walls intersect the ray
            var intersect = getWallIntersection(ray);

            if (intersect) {
                // A wall is blocking this persons vision so change them back to their default color
                enemy.tint = 0xffffff;
            } else {
                // This enemy can see the player so change their color
                enemy.tint = 0xff0000;
                easystar.findPath(enemyTile.x, enemyTile.y, playerTile.x, playerTile.y, drawPath);
                easystar.calculate();
            }
        }
    });

}

function getWallIntersection(ray) {
    var blockingWalls = layer.getRayCastTiles(ray)
    var hidden = false;
    if (ray.length > 100)
        return true;
    else{
        blockingWalls.forEach(function(thisTile){
            if (thisTile.index == 0){
                hidden = true;
            }
        });
        return hidden;
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

    return cellmap;
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

function drawMap(callback) {   //and player
    //Based on final map configuration, draw the tiles
    for (var y = 0; y < ROWS; y++)
        for (var x = 0; x < COLS; x++) {
            var thisTile;
            if (mapData[y][x]){
                map.putTile(3, x, y, 'level1')
                map.putTile(0, x, y, 'collisions');
            }
            else{
                map.putTile(3, x, y, 'level1');
            }
        }
    map.setCollision(0); //tile 0 = wall

    callback();
}

function generateActors() {
    //player sprite
    var playerLoc = findSpawn(); //find player spawn loc
    var actorLoc;

    //player = actors.create(playerLoc.x, playerLoc.y, 'player');
    /*player = game.add.sprite(playerLoc.x, playerLoc.y, 'player');
    enemies = game.add.sprite(actorLoc.x, actorLoc.y, 'clown');*/


    player.reset(playerLoc.x, playerLoc.y);

    enemies.forEachDead(function(enemy){
        actorLoc = findSpawn();
        enemy.reset(actorLoc.x, actorLoc.y);
    });
}

function findSpawn() {
    //find a valid location on the map to spawn the plater
    var found = false;
    var tooClose;
    var spawnTile;
    for (var i = 0; i < ROWS*COLS; i++) {   //still looking...
        if (found === false){
            tooClose = false;

            //grab random coordintes
            var x = game.rnd.integerInRange(0, COLS - 1) | 0;
            var y = game.rnd.integerInRange(0, ROWS - 1) | 0;
            var thatTile;
            var nbs;
            thatTile = map.getTile(x, y, 'collisions');

            if (thatTile === null) {  //is tile walkable?
                thatTile = map.getTile(x, y, 'level1'); //change layers
                if (game.physics.arcade.distanceBetween(player, thatTile) < 30){
                    tooClose = true;
                }

                //make sure we're not too close to another thing
                enemies.forEachAlive(function(actor){
                    if (game.physics.arcade.distanceBetween(actor, thatTile) < 15)
                        tooClose = true;
                });


                //make sure that it is surrounded by other walkable tiles
                nbs = countAliveNeighbours(mapData, thatTile.x, thatTile.y);

                if (nbs === 0 && tooClose === false) {
                    found = true;
                    spawnTile = {x: thatTile.worldX, y: thatTile.worldY}
                }

            }
        }
    }

    if (found === true)
        return spawnTile;
    else
        console.log("no valid location found");
}

function render() {
    //game.debug.body(layer2);
}
