///Main Game 'World' script//
////////////////////////////

var client;

// map dimensions
var ROWS = 30; //y
var COLS = 40; //x

// the structure of the map
var mapData;
var map;
var layer;
var layer2;

// initialize phaser, call create() once done
var game = new Phaser.Game(800, 600, Phaser.AUTO, null, {
    init: init,
    preload: preload,
    create: create,
    update: update,
    render: render,
});

game.global = {
    player: null,
    playerList: {},
    npcList: {},
    ready: false,
    myId: 0,
    myMap: null,
    map: null,
    walls: null,
    easystar: null
};

function init() {
    //Add the server client for multiplayer

    client = new Eureca.Client();

    game.global.ready = false;

    game.global.player = false;

}

function preload() {
    game.load.image('tileset', 'assets/tileset.png');
    game.load.image('player', 'assets/images/phaser-dude.png');
    game.load.image('clown', 'assets/images/clown.png');
    game.global.easystar = new EasyStar.js();   //start the pathfinder
}

function create() {
    initMultiPlayer(game, game.global);

    game.physics.startSystem(Phaser.Physics.ARCADE);

    //Maps and layers
    map = game.add.tilemap();
    walls = game.add.group();
    tiles = map.addTilesetImage('tileset', null, 20, 20);
    layer = map.create('level1', COLS, ROWS, 20, 20);
    layer2 = map.createBlankLayer('collisions', COLS, ROWS, 20, 20);
    layer2.properties = {'collision' : true};
    layer.resizeWorld();

}

function initMultiPlayer(game, globals){

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

    //retrieve necessary data from server containing
    //  map, player spawn location, and npcs on map
    client.exports.setMap = function(thisMap, spawnLoc, npcs){
        //draw our map
        game.global.myMap = thisMap;
        drawMap(thisMap);

        //place NPCs
        for (var c in npcs){
            globals.npcList[c] = new aNPC(npcs[c].index, npcs[c], game, eurecaProxy);
        }

        //Player's starting location
        globals.player.sprite.x = (spawnLoc.x);
        globals.player.sprite.y = (spawnLoc.y);
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

        console.log(globals.playerList);

    }

    /**
        * This is called from the server to update a particular players
        * state.
        */
    client.exports.updateState = function(id, player_state){
        // Don't do anything if its me
        if(globals.myId == id){
            return;
        }

        // If player exists, update that players state.
        if (globals.playerList[id])  {
            globals.playerList[id].updateState(player_state);
        }
    }

    //Called from the server, update NPCs on map
    client.exports.updateNPC = function(id, npc, origin){
        if(globals.myId == origin)  //Keeps frame-jerking to a minimum
            return;

        if(globals.npcList[id])
            globals.npcList[id].updateState(npc);
    }
}

//Convert boolean 2D array into tilemap
function drawMap(myMap) {
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
    game.global.map = map;
    game.global.walls = layer2;

    //EasyStar stuff; makes calculations using the raw
    //  2D boolean array to determine paths. This is then
    //  used to interact with tilemap
    game.global.easystar.setGrid(myMap);
    game.global.easystar.setAcceptableTiles([false]);
    game.global.easystar.enableDiagonals();
    game.global.easystar.enableCornerCutting();
}

function update() {
    if (!game.global.player)
        return; //Stuff isn't ready; hold on...

    game.global.player.update();    //update player

    for (var c in game.global.npcList){ //update NPCs
        game.global.npcList[c].update();
    }
}

function render() {
    /*for (var c in game.global.npcList){ //update NPCs
        game.global.npcList[c].render();
    }*/
}
