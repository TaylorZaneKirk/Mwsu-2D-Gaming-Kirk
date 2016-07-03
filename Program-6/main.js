// is the map done generating?
var isReady = false;
var ready = false;

var client;
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
    init: init,
    preload: preload,
    create: create,
    update: update,
    render: render
});

game.global = {
    player: null,
    playerList: {},
    npcList: {},
    ready: false,
    myId: 0,
    myMap: null
};

function init() {
    //Add the server client for multiplayer
    console.log("hello");
    client = new Eureca.Client();

    game.global.ready = false;

    game.global.player = false;

}

function preload() {
    game.load.image('tileset', 'assets/tileset.png');
    game.load.image('player', 'assets/images/phaser-dude.png');
    game.load.image('clown', 'assets/images/clown.png');
    easystar = new EasyStar.js();   //start the pathfinder
}

function create() {
    initMultiPlayer(game, game.global);

    cursors = game.input.keyboard.createCursorKeys();
    game.physics.startSystem(Phaser.Physics.ARCADE);

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

    //EasyStar stuff; makes calculations using the raw
    //  2D boolean array to determine paths. This is then
    //  used to interact with tilemap
    /*easystar.setGrid(mapData);
    easystar.setAcceptableTiles([false]);
    easystar.enableDiagonals();*/
}

function initMultiPlayer(game,globals){

    // Reference to our eureca so we can call functions back on the server
    var eurecaProxy;

    /**
        * Fires on initial connection
        */
    client.onConnect(function (connection) {
        console.log('Incoming connection', connection);

    });
    /**
        * When the connection is established and ready
        * we will set a local variable to the "serverProxy"
        * sent back by the server side.
        */
    client.ready(function (serverProxy) {
        // Local reference to the server proxy to be
        // used in other methods within this module.
        eurecaProxy = serverProxy;

    });

    /**
        * This sets the players id that we get from the server
        * It creates the instance of the player, and communicates
        * it's state information to the server.
        */
    client.exports.setId = function(id){
        console.log("Setting Id:" + id);

        // Assign my new connection Id
        globals.myId = id;

        // Create new player
        globals.player = new aPlayer(id, game, eurecaProxy);

        // Put instance of new player into list
        globals.playerList[id] = globals.player

        //Send state to server
        eurecaProxy.initPlayer(id, globals.player.state);

        console.log(globals.playerList);

        // Were ready to go
        globals.ready = true;

        // Send a handshake to say hello to other players.
        eurecaProxy.handshake();

    }

    client.exports.setMap = function(thisMap, spawnLoc, npcs){
        //draw our map
        game.global.myMap = thisMap;
        drawMap(thisMap);

        for (var c in npcs){
            console.log(npcs[0]);
            globals.npcList[c.index] = new aNPC(c.index, c, game, eurecaProxy);
        }

        console.log(npcs);
        console.log(globals.npcList);
        globals.player.sprite.x = (spawnLoc.y * 20);
        globals.player.sprite.y = (spawnLoc.x * 20);
    }

    /**
        * Called from server when another player "disconnects"
        */
    client.exports.kill = function(id){
        if (globals.playerList[id]) {
            globals.playerList[id].kill();
            console.log('killing ', id, globals.playerList[id]);
        }
    }

    /**
        * This is called from the server to spawn enemy's in the local game
        * instance.
        */
    client.exports.spawnEnemy = function(id, enemy_state){

        if (id == globals.myId){
            return; //this is me
        }

        //if the id doesn't exist in your local table
        // then spawn the enemy

        console.log('Spawning New Player');

        console.log(enemy_state);

        var enemy = new aPlayer(id, game, eurecaProxy)
        enemy.state = enemy_state;
        enemy.sprite.x = enemy_state.x;
        enemy.sprite.y = enemy_state.y;
        enemy.sprite.tint = enemy_state.tint;
        globals.playerList[id] = enemy;

        //globals.playerList[id] = enemy_state;

        console.log(globals.playerList);

    }

    /**
        * This is called from the server to update a particular players
        * state.
        */
    client.exports.updateState = function(id,player_state){
        // Don't do anything if its me
        if(globals.myId == id){
            return;
        }

        // If player exists, update that players state.
        if (globals.playerList[id])  {
            globals.playerList[id].updateState(player_state);
        }
    }

    client.exports.updateNPC = function(id, npc){
        if(globals.npcList[id])
            globals.npcList[id].updateState(npc);
    }
}

function drawMap(myMap) {   //and player
    //Based on final map configuration, draw the tiles
    for (var y = 0; y < ROWS; y++)
        for (var x = 0; x < COLS; x++) {
            var thisTile;
            if (myMap[y][x]){
                map.putTile(3, x, y, 'level1')
                map.putTile(0, x, y, 'collisions');
            }
            else{
                map.putTile(3, x, y, 'level1');
            }
        }
    map.setCollision(0); //tile 0 = wall
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
    if (!game.global.player)
        return;




    game.physics.arcade.collide(game.global.player.sprite, layer2);
    game.physics.arcade.collide(enemies, layer2);
    game.physics.arcade.collide(enemies, player);
    game.physics.arcade.collide(enemies);

    game.global.player.update();

/*    for(var i in playerList)
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
    });*/
}

function render() {
    //game.debug.body(layer2);
}
