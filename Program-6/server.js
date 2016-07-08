var express = require('express')
, app = express()
, server = require('http').createServer(app)

// serve static files from the current directory
app.use(express.static(__dirname));

var Eureca = require('eureca.io');


//create an instance of EurecaServer
var eurecaServer = new Eureca.Server({allow:['setId', 'spawnEnemy', 'kill', 'updateState', 'setMap', 'updateNPC']});

var worldMap = {floors : [], warps: [], npcs: []};
var players = {};
var mapData = [];
var npcs = {};
var npcsPerMap = 3;

// map dimensions
var ROWS = 30;
var COLS = 40;

//map steps for generation
var numberOfSteps = 4; //How many times will we pass over the map
var deathLimit = 3; //Least number of neighbours required to live
var birthLimit = 4; //Greateast number of neighbours before cell dies
var chanceToStartAlive = 0.35;  //chance of being generated as alive

//attach eureca.io to our http server
eurecaServer.attach(server);

//detect client connection
eurecaServer.onConnect(function (conn) {
    console.log('New Client id=%s ', conn.id, conn.remoteAddress);

    //the getClient method provide a proxy allowing us to call remote client functions
    var remote = eurecaServer.getClient(conn.id);

    //register the client
    players[conn.id] = {id:conn.id, remote:remote, state:null}

    var spawnLoc = findSpawn(players[conn.id]);

    //here we call setId (defined in the client side)
    remote.setId(conn.id);

    remote.setMap(mapData, spawnLoc, npcs)
});

//detect client disconnection
eurecaServer.onDisconnect(function (conn) {
    console.log('Client disconnected ', conn.id);

    var removeId = players[conn.id].id;

    delete players[conn.id];

    for (var c in players)
    {
        var remote = players[c].remote;

        //here we call kill() method defined in the client side
        remote.kill(conn.id);
    }
});

/**
* Player logs itself into the array of players (handshake still needs to be called
* to do the update. That's done on the client right after).
*/
eurecaServer.exports.initPlayer = function (id,state) {

    players[id].state=state;
}

eurecaServer.exports.getMap = function () {
    return (mapData);
}

/**
* Player calls this method in it's update function and sends in it's state
* whenever it wants.
* This method turns around and sends out player states to everyone.
*/
eurecaServer.exports.handleState = function (id,state) {

    players[id].state = state;

    for (var c in players)
    {
        var remote = players[c].remote;

        remote.updateState(id, state);

    }
}

eurecaServer.exports.handleNPC = function (id,state, origin) {

    npcs[id] = state;

    for (var c in players)
    {
        var remote = players[c].remote;

        remote.updateNPC(id, state, origin);

    }

}

/**
* This method broadcasts all players state's to everyone.
*/
eurecaServer.exports.handshake = function()
{
    console.log("handshake");
    for (var c in players)
    {
        var remote = players[c].remote;
        for (var cc in players)
        {
            remote.spawnEnemy(players[cc].id,players[cc].state);
        }
    }
}


app.get('/', function (req, res, next) {
    res.sendFile(__dirname+'/index.html');
});


server.listen(process.env.PORT || 55555, function () {
    console.log('\033[96mlistening on localhost:55555 \033[39m');
    console.log("Beginning Map-generation...");
    mapData = generateMap();
    generateNPCs();

    mapData_1 = generateMap();
    mapData_2 = generateMap();

    mapWarps_1 = generateWarps(mapData_1);
    mapWarps_2 = generateWarps(mapData_2);

    worldMap.floors.push(mapData_1);
    worldMap.warps.push(mapWarps_1);

    WorldMap.floors.push(mapData_2);
    worldMap.warps.push(mapWarps_1);

    //worldMap.push.npcs
});

//Based on Cellular Automata
//Create a procedurally generated map
//(Represented as a 2D array of boolean values)
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
    for(var i = 0; i < numberOfSteps - 1; i++) {
        cellmap = doSimulationStep(cellmap);
    }

    //roomDetection checks several locations
    //  to attempt to eliminate unreachable rooms
    for(var j = 0; j < numberOfSteps * numberOfSteps; j++) {
        cellmap = roomDetection(cellmap);
    }

    //cellmap = doSimulationStep(cellmap);

    //Box in the World
    for(var j = 0; j < COLS; j++){
        cellmap[0][j] = true;
        cellmap[ROWS-1][j] = true;
    }
    for(var k = 0; k < ROWS; k++){
        cellmap[k][0] = true;
        cellmap[k][COLS-1] = true;
    }

    console.log("Map completed...")
    return (cellmap);
}

//generate initial values of the map
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

//Run through the map multiple times and adjust tiles to suit automata
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

//Randomly check various locations in the map
//  for rooms. If a 'room' is smaller than 30 tiles
//  fill it with non-walkable spaces
function roomDetection (oldMap){

    var newMap = [];    //modified map

    var roomSpaces = []; //Array contain spaces that have been filled
                        //  if the number of elements in the array is
                        //  too high or too low, the original map is
                        //  maintained without change; otherwise, the
                        //  new map with the spaces filled in is adopted
                        //  and newMap replaces oldMap

    var firstSpace; //First space that will be flooded
    var found = false;  //Have we found a valid space, yet?

    //make a copy of the map
    for (var y = 0; y < ROWS; y++) {
        var newRow = [];
        newMap.push(newRow);

        for (var x = 0; x < COLS; x++){
            newRow.push( oldMap[y][x] );
        }
    }

    //Get a valid location
    while (found === false){
        var x = getRandomInt(1, ROWS - 1);
        var y = getRandomInt(1, COLS - 1);

        if (newMap[x][y] === false){
            found = true;
            firstSpace = {x: x, y: y};
        }
    }

    //perform flood on selected space
    floodFill(newMap, firstSpace, false, true, roomSpaces);

    //If enough spaces were filled, but not too many (don't want
    //  to eliminate the main chamber) return the newMap to make
    //  changes permanent
    if (roomSpaces.length > 0 && roomSpaces.length < 30 ){
        console.log(roomSpaces.length);
        return newMap
    }
    //  otherwise, discard changes by returning the original map
    return oldMap;
}

//Works like the Paint-Bucket tool from MS-Paint
//  the length of the roomSpaces array after this
//  function is complete denotes the 'size' of a
//  'chamber' in this map
function floodFill (thisMap, coord, target, replacement, roomSpaces){
    var x = coord.x;
    var y = coord.y;

    //If this is a wall, do nothing (base case)
    if (thisMap[x][y] == replacement)
        return;

    //This is a walking tile; turn it into a wall,
    //  and record the position
    if (thisMap[x][y] == target){
        thisMap[x][y] = replacement;
        roomSpaces.push({x: x, y: y});
    }

    //Flood the neighbors
    for (var i = -1; i < 1; i++){
        for (var j = -1; j < 1; j++){
            var neighbourX = x + i;
            var neighbourY = y + j;

            if(i === 0 && j === 0){
                //do nothing; this is us
            }
            else if (neighbourX < 0 || neighbourY < 0 ||
                     neighbourX >= thisMap.length || neighbourY >= thisMap[0].length){
                //Off the grid, do nothing
            }
            else{   //this is a good spot; recurse.
                var newCoord = {x: neighbourX, y: neighbourY};
                floodFill(thisMap, newCoord, false, true, roomSpaces);
            }
        }
    }

    return
}

//Retrieve the number of living neighbours in relation to a cell
function countAliveNeighbours(map, x, y) {
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

//find a valid location on the map to spawn the thing
function findSpawn(actor) {

    var found = false;
    var tooClose;
    var spawnTile;
    while(found === false) {   //still looking...

        //grab random coordintes
        var x = getRandomInt(2, ROWS - 2);
        var y = getRandomInt(2, COLS - 2);
        var nbs;
        var distance;
        tooClose = false;   //Not too close until proven otherwise

        if (mapData[x][y] === false){    //if this is a walkable-space
            nbs = countAliveNeighbours(mapData, x, y);  //check surroundings
            for (var c in players){ //check distance from players
                if(actor != c && c.state){
                    distance = Math.sqrt((x - c.state.x) * x + (y - c.state.y) * y);
                    if (distance < 100)
                        tooClose = true;
                }
            }

            //If surrounded by walkable-spaces, and
            //  space is not to close to another player return space
            if(nbs === 0 && tooClose === false){
                found = true;
                spawnTile = {x: y * 20, y: x * 20};
                return (spawnTile);
            }
        }
    }
}

//This function is responsible for creating the NPC
//  data for the map
function generateNPCs(){
    for (var i = 0; i < npcsPerMap; i++){
        var thisNPC = {
            index: i,
            alive : true,
            x : 0,
            y : 0,
            startLoc: null
        };

        //Find a good spot to drop 'em
        var startLoc = findSpawn(thisNPC)
        thisNPC.x = startLoc.x;
        thisNPC.y = startLoc.y;
        thisNPC.startLoc = startLoc;

        //Record this NPC
        npcs[i] = thisNPC;
    }
}

function generateWarps(map, worldIndex){
    var startLoc;
    var warpList = [];
    var warpPrev = {x: 0,
                    y: 0,
                    dest: null};

    var warpNext = {x: 0,
                    y: 0,
                    dest: worldIndex + 1};

    if (worldIndex > 0){
        startLoc = findSpawn(warpPrev);
        warpPrev.x = startLoc.x;
        warpPrev.y = startLoc.y;
        warpPrev.dest = worldIndex - 1;
        warpList.push(warpPrev);
    }

    startLoc = findSpawn(warpNext);
    warpNext.x = startLoc.x;
    warpNext.y = startLoc.y;
    warpNext.dest = worldIndex + 1;
    warpList.push(warpNext);

    return (warpList);
}

//Returns a random integer between min (inclusive) and max (inclusive)
function getRandomInt(min, max) {
    return Math.round(Math.random() * (max - min + 1)) + min;
}
