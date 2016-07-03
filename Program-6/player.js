var aPlayer = aPlayer || {};

var aPlayer = function(index, game, proxyServer){
    var x = 0;
    var y = 0;
    var state = {};
    var startTime;              // starting game time
    var alive;
    var player_id;
    var proxy;
    var player;
    var tint;


    function init(index, game, proxyServer){

        player_id = index;

        proxy = proxyServer;

        player = game.add.sprite(x, y, 'player');
        upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT)

        alive = true;
        state.alive = true;
        startTime = game.time.time;
        player.anchor.setTo(0.5)
        game.physics.arcade.enable(player);
        player.enableBody = true;
        player.body.collideWorldBounds = true;
        player.body.immovable = false;
        player.body.bounce.setTo(0, 0);
        player.body.setSize(
            player.body.width * 0.6,
            player.body.height * 0.5,
            player.body.width * 0.2,
            player.body.height * 0.5
        );
        player.inputEnabled = true;

        tint = Math.random() * 0xffffff;
        player.tint = tint;
    };

    function updateState (newState){
        state = newState;
        player.x = state.x;
        player.y = state.y;
        alive = state.alive;
        player.tint = state.tint;
    };

    function update(){

        state.x = player.x;
        state.y = player.y;
        state.alive = alive;
        state.tint = player.tint;
        proxy.handleState(player_id,state);

        player.body.velocity.x = 0;
        player.body.velocity.y = 0;

        if (leftKey.isDown){
            player.body.velocity.x -= 100;
        }
        if (rightKey.isDown){
            player.body.velocity.x += 100;
        }
        if (upKey.isDown){
            player.body.velocity.y -= 100;
        }
        if (downKey.isDown){
            player.body.velocity.y += 100;
        }
    };

    function kill() {
        alive = false;
        player.kill();
    };

    function reset(x, y){
        player.reset(x, y);
    }

    function render() {};

    init(index, game, proxyServer);

    return {
        render : render,
        updateState : updateState,
        sprite : player,
        update : update,
        reset : reset,
        kill : kill,
        state: state
    };
};


var aNPC = aNPC || {};

var aNPC = function(index, myState, game, proxyServer){

    var x = myState.x;
    var y = myState.y;
    var state = myState;
    var startTime;              // starting game time
    var alive = myState.alive;
    var npc_id;
    var proxy;
    var npc;
    var tint;
    var nextStep = null;
    var path = null;
    var speed = 50;


    function init(index, game, proxyServer){

        npc_id = index;

        proxy = proxyServer;

        npc = game.add.sprite(x, y, 'clown');

        startTime = game.time.time;
        npc.anchor.setTo(0.5)
        game.physics.arcade.enable(npc);
        npc.enableBody = true;
        npc.body.collideWorldBounds = true;
        npc.body.immovable = false;
        npc.body.bounce.setTo(0, 0);
        npc.body.setSize(
            npc.body.width * 0.6,
            npc.body.height * 0.5,
            npc.body.width * 0.2,
            npc.body.height * 0.5
        );

        tint = Math.random() * 0xffffff;
        npc.tint = tint;
    };

    function updateState (newState){
        state = newState;
        npc.x = state.x;
        npc.y = state.y;
        alive = state.alive;
        npc.tint = state.tint;
        nextStep = state.nextStep;
        path = state.path;
    };

    function update(){
        state.x = npc.x;
        state.y = npc.y;
        state.alive = alive;
        state.tint = npc.tint;
        state.nextStep = nextStep;
        state.path = path;

        var ray = new Phaser.Line(npc.x, npc.y, game.global.player.x, game.global.player.y);
        var map = game.global.map;
        var npcTile = map.getTileWorldXY(npc.x, npc.y, 20, 20, 'level1');
        var playerTile = map.getTileWorldXY(game.global.player.x, game.global.player.y, 20, 20, 'level1');

        //stop moving; await orders
        npc.body.velocity.x = 0;
        npc.body.velocity.y = 0;

        if (nextStep == 'R')  //move right
            npc.body.velocity.x += speed;
        if (nextStep == 'L')  //move left
            npc.body.velocity.x -= speed;
        if (nextStep == 'LD'){  //move left&down
            npc.body.velocity.x -= speed;
            npc.body.velocity.y -= speed;
        }
        if (nextStep == 'RD'){  //move right&down
            npc.body.velocity.x += speed;
            npc.body.velocity.y -= speed;
        }
        if (nextStep == 'LU'){  //move left&up
            npc.body.velocity.x -= speed;
            npc.body.velocity.y += speed;
        }
        if (nextStep == 'RU'){  //move right&up
            npc.body.velocity.x += speed;
            npc.body.velocity.y += speed;
        }
        if (nextStep == 'D')  //move down
            npc.body.velocity.y -= speed;
        if (nextStep == 'U')  //move up
            npc.body.velocity.y += speed;

        if(path){
            for (var p in path){
                if (npcTile.x == path[p].x && npcTile.y == path[p].y){
                    if (c == (path.length - 1))
                        nextStep = null;
                    else if (npcTile.x > path[p + 1].x && npcTile.y == path[p + 1].y)
                        nextStep = 'L';
                    else if (npcTile.x < path[p + 1].x && npcTile.y == path[p + 1].y)
                        nextStep = 'R';
                    else if (npcTile.x < path[p + 1].x && npcTile.y > path[p + 1].y)
                        nextStep = 'RD';
                    else if (npcTile.x > path[p + 1].x && npcTile.y > path[p + 1].y)
                        nextStep = 'LD';
                    else if (npcTile.x < path[p + 1].x && npcTile.y < path[p + 1].y)
                        nextStep = 'RU';
                    else if (npcTile.x > path[p + 1].x && npcTile.y < path[p + 1].y)
                        nextStep = 'LU';
                    else if (npcTile.x == path[p + 1].x && npcTile.y > path[p + 1].y)
                        nextStep = 'U';
                    else if (npcTile.x == path[p + 1].x && npcTile.y < path[p + 1].y)
                        nextStep = 'L';
                }
            }
        }

        if(game.time.time - startTime < 1000)
            return;

        //path controller
        // Test if any walls intersect the ray
        var intersect = getWallIntersection(ray);

        if (!intersect){
            updatePath();
        }

        proxy.handleNPC(npc_id, state);
        startTime = game.time.time;
    };

    function updatePath(){
        var map = game.global.map;
        var npcTile = map.getTileWorldXY(npc.x, npc.y, 20, 20, 'level1');
        var playerTile = map.getTileWorldXY(game.global.player.x, game.global.player.y, 20, 20, 'level1');

        game.global.easystar.findPath(npcTile.x, npcTile.y, playerTile.x, playerTile.y, function(newPath){
            path = newPath;
            console.log(path, newPath);
            if (path.length){

                if(npcTile.x > path[0].x && npcTile.y == path[0].y)
                    nextStep = 'L';
                else if (npcTile.x < path[0].x && npcTile.y == path[0].y)
                    nextStep = 'R';
                else if (npcTile.x < path[0].x && npcTile.y > path[0].y)
                    nextStep = 'RD';   //Gonna move right&down next
                else if (npcTile.x > path[0].x && npcTile.y > path[0].y)
                    nextStep = 'LD';   //Gonna move left&down next
                else if (npcTile.x < path[0].x && npcTile.y < path[0].y)
                    nextStep = 'RU';   //Gonna move right&up next
                else if (npcTile.x > path[0].x && npcTile.y < path[0].y)
                    nextStep = 'LU';   //Gonna move left&up next
                else if (npcTile.x == path[0].x && npcTile.y > path[0].y)
                    nextStep = 'D';
                else if (npcTile.x == path[0].x && npcTile.y < path[0].y)
                    nextStep = 'U';
            }
            else
                nextStep = null;
        });
    };

    function getWallIntersection(ray) {
        //Form array of all tiles that are intersected by the ray
        var blockingWalls = game.global.walls.getRayCastTiles(ray);

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
    };

    function kill() {
        alive = false;
        npc.kill();
    };

    function render() {};

    init(index, game, proxyServer);

    return {
        render : render,
        updateState : updateState,
        sprite : npc,
        update : update,
        kill : kill,
        state: state
    };
}
