// is the map done generating?
var isReady = false;
var ready = false;

var player;
var character;
var playerList;
var enemies;
var enemySpeed;
var actors;

// map dimensions
var ROWS = 30;
var COLS = 40;

// the structure of the map
var mapData;
var map;
var layer;
var layer2;

var easystar;   //pathfinder

var cursors;

// initialize phaser, call create() once done
var game = new Phaser.Game(800, 600, Phaser.AUTO, null, {
    preload: preload,
    create: create,
    update: update,
    render: render
});

game.global = {
    player: null,
    playerList: {},
    ready: false,
    myId: 0,
    myMap: null
};

function preload() {
    game.load.image('tileset', 'assets/tileset.png');
    game.load.image('player', 'assets/images/phaser-dude.png');
    game.load.image('clown', 'assets/images/clown.png');
    easystar = new EasyStar.js();   //start the pathfinder
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    cursors = game.input.keyboard.createCursorKeys();

    //Maps and layers
    map = game.add.tilemap();
    walls = game.add.group();
    tiles = map.addTilesetImage('tileset', null, 20, 20);
    layer = map.create('level1', COLS, ROWS, 20, 20);
    layer2 = map.createBlankLayer('collisions', COLS, ROWS, 20, 20);
    layer2.properties = {'collision' : true};
    layer.resizeWorld();

    //player
    actors = game.add.group();


    //enemy group
    enemies = game.add.group();
    enemies.createMultiple(3, 'clown');
    actors.add(enemies);
    //enemy physics
    enemySpeed = 50;
    enemies.forEach(function(actor){
        actor.anchor.setTo(0.5)
        game.physics.arcade.enable(actor);
        actor.enableBody = true;
        actor.body.collideWorldBounds = true;
        actor.body.immovable = true;
        actor.body.setSize(
            actor.body.width * 0.8,
            actor.body.height * 0.5,
            actor.body.width * 0.2,
            actor.body.height * 0.5
        );
        actor.data = {
            nextStep: null,
            enemyPath: []
        };
    });

    //Draw the map first, then generate player/enemies
    drawMap();

    //EasyStar stuff; makes calculations using the raw
    //  2D boolean array to determine paths. This is then
    //  used to interact with tilemap
    easystar.setGrid(mapData);
    easystar.setAcceptableTiles([false]);
    easystar.enableDiagonals();
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

function drawMap() {   //and player
    //Based on final map configuration, draw the tiles
    for (var y = 0; y < ROWS; y++)
        for (var x = 0; x < COLS; x++) {
            var thisTile;
            if (game.globals.myMap[y][x]){
                map.putTile(3, x, y, 'level1')
                map.putTile(0, x, y, 'collisions');
            }
            else{
                map.putTile(3, x, y, 'level1');
            }
        }
    map.setCollision(0); //tile 0 = wall
}

function generateActors() {

    isReady = true;
    findSpawn(player);
    enemies.forEachDead(function(enemy){
        findSpawn(enemy);
    });

    console.log(player);
}

function findSpawn(actor) {
    //find a valid location on the map to spawn the plater
    var found = false;
    var tooClose;
    var spawnTile;
    for (var i = 0; i < ROWS*COLS; i++) {   //still looking...
        if (found === false){
            //grab random coordintes
            var x = game.rnd.integerInRange(0, COLS - 1) | 0;
            var y = game.rnd.integerInRange(0, ROWS - 1) | 0;
            var thatTile;
            var nbs;

            tooClose = false;   //Assume we're not too close
            thatTile = map.getTile(x, y, 'collisions'); //get tile we're looking at

            if (thatTile === null) {  //is tile walkable?
                thatTile = map.getTile(x, y, 'level1'); //change layers

                //If not placing the player, check if the enemy would be place too close
                if (actor !== player && game.physics.arcade.distanceBetween(player, thatTile) < 200){
                    tooClose = true;
                }

                //make sure we're not too close to another thing
                enemies.forEachAlive(function(actor){
                    if (game.physics.arcade.distanceBetween(actor, thatTile) < 30)
                        tooClose = true;
                });

                //make sure that it is surrounded by other walkable tiles
                nbs = countAliveNeighbours(mapData, thatTile.x, thatTile.y);

                //If all qualifications met, stop looking and mark location
                if (nbs === 0 && tooClose === false) {
                    found = true;
                    spawnTile = {x: thatTile.worldX, y: thatTile.worldY}
                }
            }
        }
    }

    if (found === true)
        actor.reset(spawnTile.x, spawnTile.y)
        else
            console.log("no valid location found");
}

function getWallIntersection(ray) {
    //Form array of all tiles that are intersected by the ray
    var blockingWalls = layer2.getRayCastTiles(ray)

    var hidden = false; //assume sighted until proven otherwise

    if (ray.length > 150)   //too far away
        return true;
    else{
        blockingWalls.forEach(function(thisTile){
            if (thisTile.index == 0){
                //wall in the way
                hidden = true;
            }
        });

        //Did enemy see player?
        return hidden;
    }
}

function updateEnemies(enemy) {
    //Get new path for the enemy

    var enemyTile = map.getTileWorldXY(enemy.x, enemy.y, 20, 20, 'level1');
    var playerTile = map.getTileWorldXY(player.x, player.y, 20, 20, 'level1');
    if(enemyTile && playerTile){

        easystar.findPath(enemyTile.x, enemyTile.y, playerTile.x, playerTile.y, function(path){
            enemy.enemyPath = path;
            if (path.length){

                if(enemyTile.x > path[0].x && enemyTile.y == path[0].y)
                    enemy.nextStep = 'L';
                else if (enemyTile.x < path[0].x && enemyTile.y == path[0].y)
                    enemy.nextStep = 'R';
                else if (enemyTile.x < path[0].x && enemyTile.y > path[0].y)
                    enemy.nextStep = 'RD';   //Gonna move right&down next
                else if (enemyTile.x > path[0].x && enemyTile.y > path[0].y)
                    enemy.nextStep = 'LD';   //Gonna move left&down next
                else if (enemyTile.x < path[0].x && enemyTile.y < path[0].y)
                    enemy.nextStep = 'RU';   //Gonna move right&up next
                else if (enemyTile.x > path[0].x && enemyTile.y < path[0].y)
                    enemy.nextStep = 'LU';   //Gonna move left&up next
                else if (enemyTile.x == path[0].x && enemyTile.y > path[0].y)
                    enemy.nextStep = 'D';
                else if (enemyTile.x == path[0].x && enemyTile.y < path[0].y)
                    enemy.nextStep = 'U';
            }
            else
                enemy.nextStep = null;
        });
        easystar.calculate();
    }
}

function update() {
    if(!ready || !isReady)
        return;
    game.physics.arcade.collide(player, layer2);
    game.physics.arcade.collide(enemies, layer2);
    game.physics.arcade.collide(enemies, player);
    game.physics.arcade.collide(enemies);

    character.input.left = cursors.left.isDown;
    character.input.right = cursors.right.isDown;
    character.input.up = cursors.up.isDown;
    character.input.down = cursors.down.isDown;

    for(var i in playerList)
        if (playerList[i].alive)
            playerList[i].updatePlayer();


    //Move the enemies
    enemies.forEachAlive(function(enemy){
        // Define a line that connects the person to the ball
        // This isn't drawn on screen. This is just mathematical representation
        // of a line to make our calculations easier. Unless you want to do a lot
        // of math, make sure you choose an engine that has things like line intersection
        // tests built in, like Phaser does.
        var ray = new Phaser.Line(enemy.x, enemy.y, player.x, player.y);
        var enemyTile = map.getTileWorldXY(enemy.x, enemy.y, 20, 20, 'level1');
        var playerTile = map.getTileWorldXY(player.x, player.y, 20, 20, 'level1');

        //stop moving; await orders
        enemy.body.velocity.x = 0;
        enemy.body.velocity.y = 0;

        if (enemy.nextStep == 'R')  //move right
            enemy.body.velocity.x += enemySpeed;
        if (enemy.nextStep == 'L')  //move left
            enemy.body.velocity.x -= enemySpeed;
        if (enemy.nextStep == 'LD'){  //move left&down
            enemy.body.velocity.x -= enemySpeed;
            enemy.body.velocity.y -= enemySpeed;
        }
        if (enemy.nextStep == 'RD'){  //move right&down
            enemy.body.velocity.x += enemySpeed;
            enemy.body.velocity.y -= enemySpeed;
        }
        if (enemy.nextStep == 'LU'){  //move left&up
            enemy.body.velocity.x -= enemySpeed;
            enemy.body.velocity.y += enemySpeed;
        }
        if (enemy.nextStep == 'RU'){  //move right&up
            enemy.body.velocity.x += enemySpeed;
            enemy.body.velocity.y += enemySpeed;
        }
        if (enemy.nextStep == 'D')  //move down
            enemy.body.velocity.y -= enemySpeed;
        if (enemy.nextStep == 'U')  //move up
            enemy.body.velocity.y += enemySpeed;

        //path controller
        if(enemyTile && playerTile){
            //First check if the enemy can see the player
            //  then get next step data

            // Test if any walls intersect the ray
            var intersect = getWallIntersection(ray);

            if (intersect) {
                // A wall is blocking this persons vision so change them back to their default color
                enemy.tint = 0xffffff;
            } else {
                // This enemy can see the player so change their color
                //  and update their path
                enemy.tint = 0xff0000;
                updateEnemies(enemy);

            }

            //get enemies next move
            if(enemy.enemyPath){
                //where is enemy on the path?
                for (var i = 0; i < enemy.enemyPath.length; i++){
                    if (enemyTile.x == enemy.enemyPath[i].x &&
                        enemyTile.y == enemy.enemyPath[i].y)
                    {
                        if (i == (enemy.enemyPath.length - 1))
                            enemy.nextStep = null;  //End of trail; wait
                        else if(enemyTile.x > enemy.enemyPath[i + 1].x && enemyTile.y == enemy.enemyPath[i + 1].y)
                            enemy.nextStep = 'L';   //Gonna move left next
                        else if (enemyTile.x < enemy.enemyPath[i + 1].x && enemyTile.y == enemy.enemyPath[i + 1].y)
                            enemy.nextStep = 'R';   //Gonna move right next
                        else if (enemyTile.x < enemy.enemyPath[i + 1].x && enemyTile.y > enemy.enemyPath[i + 1].y)
                            enemy.nextStep = 'RD';   //Gonna move right&down next
                        else if (enemyTile.x > enemy.enemyPath[i + 1].x && enemyTile.y > enemy.enemyPath[i + 1].y)
                            enemy.nextStep = 'LD';   //Gonna move left&down next
                        else if (enemyTile.x < enemy.enemyPath[i + 1].x && enemyTile.y < enemy.enemyPath[i + 1].y)
                            enemy.nextStep = 'RU';   //Gonna move right&up next
                        else if (enemyTile.x > enemy.enemyPath[i + 1].x && enemyTile.y < enemy.enemyPath[i + 1].y)
                            enemy.nextStep = 'LU';   //Gonna move left&up next
                        else if (enemyTile.x == enemy.enemyPath[i + 1].x && enemyTile.y > enemy.enemyPath[i + 1].y)
                            enemy.nextStep = 'D';   //Gonna move down next
                        else if (enemyTile.x == enemy.enemyPath[i + 1].x && enemyTile.y < enemy.enemyPath[i + 1].y)
                            enemy.nextStep = 'U';   //Gonna move up next
                    }
                }
            }
        }
    });
}

function render() {
    //game.debug.body(layer2);
}
