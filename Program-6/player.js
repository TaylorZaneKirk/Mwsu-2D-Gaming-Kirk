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
    var cursors;

    var cursor = {
        left:false,
        right:false,
        up:false,
        down:false
    };

    var input = {
        left:false,
        right:false,
        up:false,
        down:false
    };

    function init(index, game, proxyServer){

        player_id = index;

        proxy = proxyServer;

        player = game.add.sprite(x, y, 'player');

        cursors = game.input.keyboard.createCursorKeys();

        alive = true;
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
    };

    function updateState (enemy_id, state){
        if(game.time.time - startTime > 2000){
            console.log(game.time.time);
            for(s in state){
                console.log(state[s]);
            }
            startTime = game.time.time;
        }
    };

    function update(){
        for (var i in input) cursor[i] = input[i];

        player.body.velocity.x = 0;
        player.body.velocity.y = 0;

        if (cursor.left){
            player.body.velocity.x -= 100;
        }
        if (cursor.right){
            player.body.velocity.x += 100;
        }
        if (cursor.up){
            player.body.velocity.y -= 100;
        }
        if (cursor.down){
            player.body.velocity.y += 100;
        }
    };

    function kill() {
        alive = false;
        player.kill();
    };

    function render() {};

    init(index, game, proxyServer);

    return {
        render : render,
        updateState : updateState,
        update : update,
        kill : kill
    };
};
